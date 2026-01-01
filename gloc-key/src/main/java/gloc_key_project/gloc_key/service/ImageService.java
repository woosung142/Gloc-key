package gloc_key_project.gloc_key.service;

import gloc_key_project.gloc_key.dto.ImageGenerateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final RedisTemplate<String, String> redisTemplate;

    public String generateImageProcess(ImageGenerateRequest request, String username) {

        // 1. 고유한 Job ID 생성
        String jobId = UUID.randomUUID().toString();

        // 2. 사용자 이미지 생성 시작 상태 저장(Redis)
        String redisKey = "image:job:" + jobId;
        redisTemplate.opsForValue().set(redisKey, "PENDING", 1, TimeUnit.DAYS);

        // 3. 서버리스 Sage Maker 호출
//        sageMakerService.call(request.getPrompt(), jobId, username);

        return jobId;
    }

    public String checkImageStatus(String jobId) {
        String status = redisTemplate.opsForValue().get("image:job:" + jobId);
        if (status == null) {
            throw new IllegalArgumentException("존재하지 않는 작업입니다.");
        }
        return status;
    }
}
