package gloc_key_project.gloc_key.service;

import gloc_key_project.gloc_key.dto.EditImageUploadCompleteResponse;
import gloc_key_project.gloc_key.dto.EditImageUploadUrlResponse;
import gloc_key_project.gloc_key.entity.Image;
import gloc_key_project.gloc_key.repository.ImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class UploadService {

    private final ImageRepository imageRepository;
    private final S3Service s3Service;
    private final RedisTemplate<String, String> redisTemplate;

    public EditImageUploadUrlResponse createEditUploadUrl(Long userId, String username, Long parentImageId) {

        // parent 이미지 존재 여부
        Image parentImage = imageRepository.findById(parentImageId)
                .orElseThrow(() -> new IllegalArgumentException("부모 이미지가 존재하지 않습니다"));

        // 소유자 검증
        if (!parentImage.getUser().getId().equals(userId)) {
            throw new SecurityException("본인 이미지가 아닙니다");
        }

        // uploadId(UUID) 발급
        String uploadId = UUID.randomUUID().toString();

        // S3 Key 생성
        String s3Key = String.format(
                "generated-images/%s/edits/%s.png",
                username,
                uploadId
        );

        // Presigned URL 발급
        String uploadUrl = s3Service.createPresignedPutUrl(s3Key);


        // Redis 저장
        String redisKey = "edit-upload:" + uploadId;

        Map<String, String> data = Map.of(
                "userId", String.valueOf(userId),
                "parentImageId", String.valueOf(parentImageId),
                "s3Key", s3Key
        );

        redisTemplate.opsForHash().putAll(redisKey, data);
        redisTemplate.expire(redisKey, 20, TimeUnit.MINUTES); // 20분 TTL


        return new EditImageUploadUrlResponse(uploadId, uploadUrl, s3Key);
    }

    @Transactional
    public EditImageUploadCompleteResponse  completeEditUpload(String uploadId, Long userId) {

        String redisKey = "edit-upload:" + uploadId;

        // 1. Redis 조회
        Map<Object, Object> uploadInfo =
                redisTemplate.opsForHash().entries(redisKey);

        if (uploadInfo.isEmpty()) {
            throw new IllegalArgumentException("유효하지 않거나 만료된 업로드 요청입니다");
        }

        Long redisUserId = Long.valueOf((String) uploadInfo.get("userId"));
        Long parentImageId = Long.valueOf((String) uploadInfo.get("parentImageId"));
        String s3Key = (String) uploadInfo.get("s3Key");

        // 2. 소유자 검증
        if (!redisUserId.equals(userId)) {
            throw new SecurityException("업로드 권한이 없습니다");
        }

        // 3. S3 객체 존재 여부 확인 (HEAD)
        if (!s3Service.existsObject(s3Key)) {
            throw new IllegalStateException("S3에 업로드된 파일이 존재하지 않습니다");
        }

        // 4. parent 이미지 조회
        Image parentImage = imageRepository.findById(parentImageId)
                .orElseThrow(() -> new IllegalArgumentException("부모 이미지가 존재하지 않습니다"));

        if (!parentImage.getUser().getId().equals(userId)) {
            throw new SecurityException("부모 이미지 소유자가 아닙니다");
        }

        // 5. 편집 이미지 INSERT
        Image editedImage = Image.builder()
                .user(parentImage.getUser())
                .parentImage(parentImage)
                .rootImageId(parentImage.getRootImageId())
                .s3Key(s3Key)
                .build();

        imageRepository.save(editedImage);

        // 6. Redis 정리
        redisTemplate.delete(redisKey);

        return new EditImageUploadCompleteResponse(
                editedImage.getId(),
                s3Key
        );
    }


}
