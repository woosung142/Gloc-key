package gloc_key_project.gloc_key.event.listener;

import gloc_key_project.gloc_key.event.UserDeletedEvent;
import gloc_key_project.gloc_key.service.S3CleanupService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class UserDeletedEventListener {

    private final S3CleanupService s3CleanupService;

    //UserDeletedEvent 타입의 이벤트가 발생하면 이 메소드가 자동으로 실행.
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(UserDeletedEvent event) {
        s3CleanupService.deleteImagesAsync(event.getS3Keys());
    }
}
