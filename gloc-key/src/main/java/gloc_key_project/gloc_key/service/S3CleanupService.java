package gloc_key_project.gloc_key.service;

import gloc_key_project.gloc_key.entity.Image;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class S3CleanupService {

    private final S3Service s3Service;

//    @Async
    public void deleteImagesAsync(List<String> s3Key) {
        for (String key : s3Key) {
            try {
                s3Service.deleteObject(key);
            } catch (Exception e) {
                log.error("S3 삭제 실패: {}", key, e);
            }
        }
    }
}
