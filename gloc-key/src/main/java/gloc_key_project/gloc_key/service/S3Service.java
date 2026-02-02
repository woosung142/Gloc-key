package gloc_key_project.gloc_key.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class S3Service {
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    @Value("${aws.s3.bucket}")
    private String bucketName;

    // 다운로드용 pre-signed URL 생성
    public String createPresignedGetUrl(String s3Key) {

//        String s3Key = String.format("generated-images/%s/%s", username, jobId);

        GetObjectRequest objectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                // 브라우저에서 열었을 때 강제로 이미지로 인식하게 설정
                .responseContentType("image/png")
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(10))
                .getObjectRequest(objectRequest)
                .build();

        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);

        return presignedRequest.url().toExternalForm();
    }

    // 업로드용 pre-signed URL 생성
    public String createPresignedPutUrl(String s3Key) {

//        String s3Key = String.format("generated-images/%s/edits/%s.png", username, jobId);

        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(s3Key)
                .contentType("image/png")
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(10))
                .putObjectRequest(objectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);

        return presignedRequest.url().toExternalForm();
    }

    public boolean existsObject(String s3Key) {
        try {
            s3Client.headObject(
                    HeadObjectRequest.builder()
                            .bucket(bucketName)
                            .key(s3Key)
                            .build()
            );
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        }
    }

    public boolean deleteObject(String s3Key) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build());
            return true;
        } catch (S3Exception e) {
            // 로그를 남겨 어떤 키에서 실패했는지 기록 (추후 수동 복구용)
            log.error("S3 파일 삭제 실패: {} - 사유: {}", s3Key, e.awsErrorDetails().errorMessage());
            return false;
        } catch (Exception e) {
            log.error("S3 삭제 중 예상치 못한 오류 발생: {}", e.getMessage());
            return false;
        }
    }

    public List<String> deleteObjects(List<String> s3Keys) {
        List<String> failedKeys = new ArrayList<>();

        for (String key : s3Keys) {
            if (!deleteObject(key)) {
                failedKeys.add(key);
            }
        }
        return failedKeys;
    }

}

