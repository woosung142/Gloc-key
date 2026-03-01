package gloc_key_project.gloc_key.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JobStatusUpdateRequest {

    private String jobId;
    private String status;
    private String errorMsg;
}