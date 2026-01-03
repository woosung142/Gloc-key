package gloc_key_project.gloc_key.service;

import gloc_key_project.gloc_key.dto.ImageGenerateRequest;
import gloc_key_project.gloc_key.dto.ImageGenerateResponse;
import gloc_key_project.gloc_key.dto.ImageStatusResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class ImageService {
    private final SagemakerService sagemakerService;
    private final S3Service s3Service;
    private final RedisTemplate<String, String> redisTemplate;

    public ImageGenerateResponse generateImageProcess(String prompt, String username) {

        // 1. 고유한 Job ID 생성
        String jobId = UUID.randomUUID().toString();

        // 2. 사용자 이미지 생성 시작 상태 저장(Redis)
        String redisKey = "image:job:" + jobId;
        redisTemplate.opsForValue().set(redisKey, "PENDING", 1, TimeUnit.DAYS);

        // 3. 서버리스 Sage Maker 호출
        sagemakerService.call(prompt, jobId, username);

        return new ImageGenerateResponse(jobId, "이미지 생성이 시작되었습니다.");
    }


    public ImageStatusResponse checkImageStatus(String username, String jobId) {
        String status = redisTemplate.opsForValue().get("image:job:" + jobId);
        if (status == null) {
            throw new IllegalArgumentException("존재하지 않는 작업입니다.");
        }

        String imageUrl = null;

        // 2. 상태가 완료(COMPLETED)라면 Presigned URL 생성
        if ("COMPLETED".equals(status)) {
            imageUrl = s3Service.createPresignedGetUrl(username, jobId);
        }


        return new ImageStatusResponse(jobId, status, imageUrl);
    }
}
