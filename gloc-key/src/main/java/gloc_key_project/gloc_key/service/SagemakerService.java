package gloc_key_project.gloc_key.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.sagemakerruntime.SageMakerRuntimeClient;
import software.amazon.awssdk.services.sagemakerruntime.model.InvokeEndpointRequest;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SagemakerService {
    private final SageMakerRuntimeClient sageMakerRuntimeClient;
    private final RedisTemplate<String, String> redisTemplate;

    @Value("${aws.sagemaker.url}")
    private String sagemakerURL;

    private final ObjectMapper objectMapper;

    @Async // 비동기 처리
    public void call(String prompt, String jobId, String username) {
        try {
            log.info("이미지 생성 시작 - 사용자: {}, 작업ID: {}", username, jobId);
            // Redis 상태 업데이트
//            redisTemplate.opsForValue().set("image:job:" + jobId, "PROCESSING");
            redisTemplate.opsForHash().put("image:job:" + jobId, "status", "PROCESSING");

            // JSON 페이로드 구성
            Map<String, String> payloadMap = Map.of(
                    "prompt", prompt,
                    "job_id", jobId,
                    "username", username
            );
            String jsonPayload = objectMapper.writeValueAsString(payloadMap);

            InvokeEndpointRequest request = InvokeEndpointRequest.builder()
                    .endpointName(sagemakerURL)
                    .contentType("application/json")
                    .body(SdkBytes.fromUtf8String(jsonPayload))
                    .build();

            // SageMaker 호출
//            sageMakerRuntimeClient.invokeEndpoint(request);
            log.info("SageMaker 호출 성공 - 작업ID: {}", jobId);

        } catch (Exception e) {
            redisTemplate.opsForHash().put("image:job:" + jobId, "status", "FAILED");
            redisTemplate.opsForHash().put("image:job:" + jobId, "error", e.getMessage());
            log.error("SageMaker 호출 실패 - 작업ID: {}, 사유: {}", jobId, e.getMessage());
        }
    }
}