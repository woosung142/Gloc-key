package gloc_key_project.gloc_key.dto;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ImageStatusResponse {
    private String jobId;
    private String status;
//    private String message;
}
