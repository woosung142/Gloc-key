package gloc_key_project.gloc_key.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class InternalJobService {

    private final RedisTemplate<String, String> redisTemplate;

    public void updateJobStatus(String jobId, String status, String errorMsg) {

        //입력값 검증
        if (jobId == null || jobId.isBlank()) {
            throw new IllegalArgumentException("jobId is required");
        }

        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("status is required");
        }

        String key = "image:job:" + jobId;

        try {
            // key 존재 확인
            Boolean exists = redisTemplate.hasKey(key);
            if (Boolean.FALSE.equals(exists)) {
                throw new IllegalStateException("Redis job not found: " + key);
            }

            // 상태 업데이트
            redisTemplate.opsForHash().put(key, "status", status);

            if (errorMsg != null && !errorMsg.isBlank()) {
                redisTemplate.opsForHash().put(key, "error_msg", errorMsg);
            }

            log.info("Job status updated - jobId={}, status={}", jobId, status);

        } catch (Exception e) {
            // Redis 실패 로깅
            log.error("Redis update failed - jobId={}", jobId, e);

            // 상위 계층으로 전달
            throw new RuntimeException("Redis update failed", e);
        }
    }
}