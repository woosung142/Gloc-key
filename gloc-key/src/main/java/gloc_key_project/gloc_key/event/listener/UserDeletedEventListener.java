package gloc_key_project.gloc_key.event.listener;

import gloc_key_project.gloc_key.event.UserDeletedEvent;
import gloc_key_project.gloc_key.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserDeletedEventListener {

    private final S3Service s3Service;

    //UserDeletedEvent 타입의 이벤트가 발생하면 이 메소드가 자동으로 실행.
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(UserDeletedEvent event) {

        if (event.getS3Keys() == null || event.getS3Keys().isEmpty()) {
            return;
        }

        List<String> failed = s3Service.deleteObjects(event.getS3Keys());
        if (!failed.isEmpty()) {
            log.warn("S3 삭제 실패 키 목록: {}", failed);
        }
    }
}
