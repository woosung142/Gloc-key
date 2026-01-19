package gloc_key_project.gloc_key.service;

import gloc_key_project.gloc_key.dto.*;
import gloc_key_project.gloc_key.entity.Image;
import gloc_key_project.gloc_key.repository.ImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.*;
import java.util.concurrent.TimeUnit;


@Service
@RequiredArgsConstructor
public class ImageService {
    private final ImageRepository imageRepository;
    private final SagemakerService sagemakerService;
    private final S3Service s3Service;
    private final RedisTemplate<String, String> redisTemplate;

    // 이미지 생성 프로세스
    public ImageGenerateResponse generateImageProcess(String prompt, String username) {

        if(prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException("프롬프트 작성이 필요합니다.");
        }

        // 비동기 작업 추적을 위해 Redis에 초기 상태 저장
        String jobId = saveTaskToRedis(username, prompt);

        // SageMaker 엔드포인트 비동기 호출
        sagemakerService.call(prompt, jobId, username);

        return new ImageGenerateResponse(jobId, "이미지 생성이 시작되었습니다.");
    }

    // 이미지 생성 상태 및 결과 조회 (Polling용 API)
    public ImageStatusResponse checkImageStatus(String username, String jobId) {
        // Redis Hash 작업 메타데이터 일괄 조회
        Map<Object, Object> taskInfo = redisTemplate.opsForHash().entries("image:job:" + jobId);

        // 작업 존재 여부 확인 (TTL 만료 포함)
        if (taskInfo.isEmpty()) {
            throw new IllegalArgumentException("존재하지 않거나 만료된 작업입니다.");
        }

        // 작업 소유자와 요청자가 일치하는지 확인
        if (!username.equals(taskInfo.get("owner"))) {
            throw new AccessDeniedException("본인의 작업만 조회할 수 있습니다.");
        }

        String status = (String) taskInfo.get("status");
        String imageUrl = null;
        Long imageId = null;

        // 생성 완료 시 S3 보안 접근을 위한 Presigned URL 발급
        if ("COMPLETED".equals(status)) {
            String s3Key = (String) taskInfo.get("s3Key");
            imageId =  Long.valueOf((String) taskInfo.get("imageId"));

            if (s3Key == null) {
                throw new IllegalStateException("이미지 경로 정보가 존재하지 않습니다.");
            }

            imageUrl = s3Service.createPresignedGetUrl(s3Key);
        }
        return new ImageStatusResponse(imageId, jobId, status, imageUrl);
    }

    // 기존 프롬프트를 재사용한 이미지 재생성
    public ImageGenerateResponse reGenerateImageProcess(String oldJobId, Long userId, String username) {
        // 기존 작업의 설정(프롬프트)을 조회 (Redis 캐시 우선, RDS 백업)
        String oldPrompt = getPromptFromRedisOrDb(oldJobId, userId, username);

        // 새로운 작업 세션 생성 및 Redis 등록
        String newJobId = saveTaskToRedis(username, oldPrompt);

        // 동일 프롬프트로 SageMaker 비동기 호출
        sagemakerService.call(oldPrompt, newJobId, username);

        return new ImageGenerateResponse(newJobId, "이미지 재생성을 시작합니다.");
    }

    // 원본 이미지 생성 내역 조회
    public Page<ImageHistoryResponse> getImageHistory(Long userId, int page, int size) {

        // created_at 필드 기준 내림차순
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        // 페이징 조회
        Page<Image> imagePage = imageRepository.findByUser_IdAndParentImageIsNull(userId, pageable);

        return imagePage.map(image -> ImageHistoryResponse.builder()
                .imageId(image.getId())
                .jobId(image.getJobId())
                .prompt(image.getPrompt())
                .imageUrl(s3Service.createPresignedGetUrl(image.getS3Key()))
                .createdAt(image.getCreatedAt())
                .build());

    }
    // 편집된 이미지 내역 조회
    public List<EditImageHistoryResponse> getEditedImages(Long originalImageId, Long userId) {

        // 원본 이미지가 존재하는지 확인
        Image originalImage =  imageRepository.findById(originalImageId)
                .orElseThrow(() -> new IllegalArgumentException("원본 이미지가 존재하지 않습니다."));

        // 원본 이미지가 해당 사용자의 이미지가 맞는 지 확인
        if(!originalImage.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("본인의 작업만 조회할 수 있습니다.");
        }

        // 원본 이미지로부터 생성된 편집 이미지 조회
        Long rootImageId = originalImage.getRootImageId();
        List<Image> images = imageRepository.findByRootImageIdOrderByCreatedAtDesc(rootImageId);

        return images.stream()
                .filter(image -> image.getParentImage() != null)
                .map(image -> EditImageHistoryResponse.builder()
                        .imageId(image.getId())
                        .imageUrl(s3Service.createPresignedGetUrl(image.getS3Key()))
                        .createdAt(image.getCreatedAt())
                        .build())
                .toList();

    }

    @Transactional
    public DeleteImageResponse deleteImage(Long imageId, Long userId) {
        // 1. 이미지 존재 확인
        Image targetImage = imageRepository.findById(imageId)
                .orElseThrow(() -> new IllegalArgumentException("해당 이미지가 존재하지 않습니다."));

        if (targetImage.getUser().getId() != userId){
            throw new AccessDeniedException("본인의 이미지만 삭제가 가능합니다.");
        }
        Long targetId = targetImage.getId();
        Long rootId = targetImage.getRootImageId();
        Image parent = targetImage.getParentImage();
        final String s3KeyToDelete = targetImage.getS3Key();

        // 2. 삭제 대상이 원본인지 확인
        boolean isRoot = targetId.equals(rootId);

        if (isRoot) {
            // 원본 삭제: 나를 루트로 삼는 다른 이미지들을 찾음 (나 제외)
            List<Image> descendants = imageRepository.findAllByRootImageIdOrderByCreatedAtAsc(targetId)
                    .stream().filter(img -> !img.getId().equals(targetId)).toList();

            if (!descendants.isEmpty()) {
                Image newRoot = descendants.get(0);
                newRoot.setParentImage(null);
                newRoot.setRootImageId(newRoot.getId());

                // 삭제될 targetImage를 부모로 가졌던 자식들을 newRoot에게 연결
                List<Image> directChildren = imageRepository.findAllByParentImage(targetImage);
                for (Image child : directChildren) {
                    if (!child.equals(newRoot)) { // newRoot는 이미 null 처리됨
                        child.setParentImage(newRoot);
                    }
                }

                // 나머지 후손들 rootId 일괄 변경
                imageRepository.updateRootImageId(targetId, newRoot.getId());
            }
        } else {
            // 편집본 삭제: 나를 부모로 참조하는 직계 자식들을 찾음
            List<Image> children = imageRepository.findAllByParentImage(targetImage);

            if (!children.isEmpty()) {
                for (Image child : children) {
                    // 할아버지에게 입양
                    child.setParentImage(parent);
                }
            }
        }

        // 3. 삭제 처리
        imageRepository.delete(targetImage);


        // 4. 트랜잭션 커밋 성공 후 S3 삭제 이벤트 발행
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                s3Service.deleteObject(s3KeyToDelete);
            }
        });

        return new DeleteImageResponse("이미지가 성공적으로 삭제되었습니다.");
    }

    // 비동기 작업 상태 관리를 위한 Redis Hash 저장 로직
    private String saveTaskToRedis(String username, String prompt) {
        String jobId = UUID.randomUUID().toString();
        String key = "image:job:" + jobId;

        Map<String, String> data = Map.of(
                "status", "PENDING",
                "owner", username,
                "prompt", prompt
        );

        redisTemplate.opsForHash().putAll(key, data);
        redisTemplate.expire(key, 1, TimeUnit.DAYS); // 24시간 동안 상태 유지
        return jobId;
    }

    // 프롬프트 조회
    private String getPromptFromRedisOrDb(String jobId, Long userId, String username) {
        String key = "image:job:" + jobId;

        // 1. Redis 우선 조회
        Object cachedPrompt = redisTemplate.opsForHash().get(key, "prompt");
        if (cachedPrompt != null) {
            validateOwner((String) redisTemplate.opsForHash().get(key, "owner"), username);
            return (String) cachedPrompt;
        }

        // 2. Redis 만료 시 RDS에서 조회
        Image image = imageRepository.findByJobId(jobId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 작업입니다."));

        // DB에 기록된 userId와 현재 요청자의 id가 일치하는지 확인
        if (!image.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("해당 작업에 대한 권한이 없습니다.");
        }

        return image.getPrompt();
    }

    // 요청 권한 검증 Redis
    private void validateOwner(String owner, String requester) {
        if (owner == null || !owner.equals(requester)) {
            throw new AccessDeniedException("해당 작업에 대한 권한이 없습니다.");
        }
    }
}