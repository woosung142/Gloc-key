package gloc_key_project.gloc_key.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // AI 이미지 생성 job 식별자 (편집 이미지에는 null)
    @Column(name = "job_id", unique = true)
    private String jobId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String prompt;

    @Column(name = "s3_key", nullable = false)
    private String s3Key;

    // 직계 부모 (없으면 원본)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_image_id")
    private Image parentImage;

    // 그룹 기준 (원본이면 자기 자신)
    @Column(name = "root_image_id")
    private Long rootImageId;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
