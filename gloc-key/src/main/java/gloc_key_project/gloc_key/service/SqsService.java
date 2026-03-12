package gloc_key_project.gloc_key.service;

import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;
import software.amazon.awssdk.services.sqs.model.SendMessageResponse;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SqsService {

    private final SqsClient sqsClient;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${aws.sqs.url}")
    private String sqsUrl;

    public void sqsSend(String prompt, String jobId, String username) {
        log.info("이미지 생성 요청 수신 - 사용자: {}, 작업ID: {}", username, jobId);

        try {
            // 1. Redis 상태 업데이트 (작업 시작 상태 기록)
            redisTemplate.opsForHash().put("image:job:" + jobId, "status", "PROCESSING");

            // 2. JSON 페이로드 구성
            Map<String, String> payloadMap = Map.of(
                    "prompt", prompt,
                    "job_id", jobId,
                    "username", username
            );
            String jsonPayload = objectMapper.writeValueAsString(payloadMap);

            // 3. SQS 메시지 전송
            SendMessageRequest sendMsgRequest = SendMessageRequest.builder()
                    .queueUrl(sqsUrl)
                    .messageBody(jsonPayload)
                    .build();

            SendMessageResponse response = sqsClient.sendMessage(sendMsgRequest);

            log.info("SQS 메시지 전송 성공 - MessageID: {}, JobID: {}", response.messageId(), jobId);

        } catch (Exception e) {
            log.error("SQS 전송 중 예상치 못한 오류 발생 - JobID: {}", jobId, e);
            redisTemplate.opsForHash().put("image:job:" + jobId, "status", "FAILED");
        }
    }
}