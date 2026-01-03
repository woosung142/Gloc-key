package gloc_key_project.gloc_key.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import software.amazon.awssdk.core.client.config.ClientOverrideConfiguration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.sagemakerruntime.SageMakerRuntimeClient;

import java.time.Duration;

@Configuration
@EnableAsync // 비동기 활성화
public class AwsConfig {

    @Value("${aws.region}")
    private String region;

    //S3 파일 업로드/다운로드에 사용될 S3Client Bean 설정
    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(region))
                .build();
    }

    // Pre-signed URL 생성에 사용될 S3Presigner Bean 설정
    @Bean
    public S3Presigner s3Presigner() {
        return S3Presigner.builder()
                .region(Region.of(region))
                .build();
    }

    // Sage Maker 호출에 사용될 SageMakerRuntimeClient Bean 설정
    @Bean
    public SageMakerRuntimeClient sageMakerRuntimeClient() {
        return SageMakerRuntimeClient.builder()
                .region(Region.of(region))
                .overrideConfiguration(
                        ClientOverrideConfiguration.builder()
                                .apiCallTimeout(Duration.ofSeconds(120))
                                .apiCallAttemptTimeout(Duration.ofSeconds(120))
                                .build()
                )
                .build();
    }

}