package gloc_key_project.gloc_key.service;

import gloc_key_project.gloc_key.dto.ImageGenerateResponse;
import gloc_key_project.gloc_key.dto.ImageStatusResponse;
import gloc_key_project.gloc_key.entity.Image;
import gloc_key_project.gloc_key.repository.ImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;


@Service
@RequiredArgsConstructor
public class ImageService {
    private final ImageRepository imageRepository;
    private final SagemakerService sagemakerService;
    private final S3Service s3Service;
    private final RedisTemplate<String, String> redisTemplate;

    // 1. 이미지 생성 프로세스
    public ImageGenerateResponse generateImageProcess(String prompt, String username) {
        // 비동기 작업 추적을 위해 Redis에 초기 상태 저장
        String jobId = saveTaskToRedis(username, prompt);

        // SageMaker 엔드포인트 비동기 호출
        sagemakerService.call(prompt, jobId, username);

        return new ImageGenerateResponse(jobId, "이미지 생성이 시작되었습니다.");
    }

    // 2. 이미지 생성 상태 및 결과 조회 (Polling용 API)
    public ImageStatusResponse checkImageStatus(String username, String jobId) {
        // Redis Hash 작업 메타데이터 일괄 조회
        Map<Object, Object> taskInfo = redisTemplate.opsForHash().entries("image:task:" + jobId);

        // 작업 존재 여부 확인 (TTL 만료 포함)
        if (taskInfo.isEmpty()) {
            throw new IllegalArgumentException("존재하지 않거나 만료된 작업입니다.");
        }

        // 작업 소유자와 요청자가 일치하는지 확인
        if (!username.equals(taskInfo.get("owner"))) {
            throw new AccessDeniedException("본인의 작업만 조회할 수 있습니다.");
        }

        String status = (String) taskInfo.get("status");

        // 생성 완료 시 S3 보안 접근을 위한 Presigned URL 발급
        String imageUrl = "COMPLETED".equals(status) ? s3Service.createPresignedGetUrl(username, jobId) : null;

        return new ImageStatusResponse(jobId, status, imageUrl);
    }

    // 3. 기존 프롬프트를 재사용한 이미지 재생성
    public ImageGenerateResponse reGenerateImageProcess(String oldJobId, String username) {
        // 기존 작업의 설정(프롬프트)을 조회 (Redis 캐시 우선, RDS 백업)
        String oldPrompt = getPromptFromRedisOrDb(oldJobId, username);

        // 새로운 작업 세션 생성 및 Redis 등록
        String newJobId = saveTaskToRedis(username, oldPrompt);

        // 동일 프롬프트로 SageMaker 비동기 호출
        sagemakerService.call(oldPrompt, newJobId, username);

        return new ImageGenerateResponse(newJobId, "이미지 재생성을 시작합니다.");
    }


    // 비동기 작업 상태 관리를 위한 Redis Hash 저장 로직
    private String saveTaskToRedis(String username, String prompt) {
        String jobId = UUID.randomUUID().toString();
        String key = "image:task:" + jobId;

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
    private String getPromptFromRedisOrDb(String jobId, String username) {
        String key = "image:task:" + jobId;

        // 1. Redis 우선 조회
        Object cachedPrompt = redisTemplate.opsForHash().get(key, "prompt");
        if (cachedPrompt != null) {
            validateOwner((String) redisTemplate.opsForHash().get(key, "owner"), username);
            return (String) cachedPrompt;
        }

        // 2. Redis 만료 시 RDS에서 이력 데이터 조회
        Image image = imageRepository.findByJobId(jobId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 작업입니다."));

        validateOwner(image.getUser().getUsername(), username);

        return image.getPrompt();
    }

    // 요청 권한 검증
    private void validateOwner(String owner, String requester) {
        if (owner == null || !owner.equals(requester)) {
            throw new AccessDeniedException("해당 작업에 대한 권한이 없습니다.");
        }
    }
}