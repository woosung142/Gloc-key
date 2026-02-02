package gloc_key_project.gloc_key.event;

import lombok.Getter;
import java.util.List;

@Getter
public class UserDeletedEvent {

    private final List<String> s3Keys;

    public UserDeletedEvent(List<String> s3Keys) {
        this.s3Keys = s3Keys;
    }
}
