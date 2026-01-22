package gloc_key_project.gloc_key.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ImageHistoryResponse {
    private Long imageId;
    private String jobId;      // 작업 ID
    private String prompt;     // 생성에 사용된 프롬프트
    private String imageUrl;   // S3 Presigned URL
    private Boolean hasEdited;
    private LocalDateTime createdAt; // 생성 일시
}