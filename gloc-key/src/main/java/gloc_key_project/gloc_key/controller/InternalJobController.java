package gloc_key_project.gloc_key.controller;

import gloc_key_project.gloc_key.dto.JobStatusUpdateRequest;
import gloc_key_project.gloc_key.service.InternalJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/job")
@RequiredArgsConstructor
public class InternalJobController {

    private final InternalJobService internalJobService;

    @PostMapping("/status")
    public ResponseEntity<Void> updateStatus(
            @RequestBody JobStatusUpdateRequest request
    ) {

        internalJobService.updateJobStatus(
                request.getJobId(),
                request.getStatus(),
                request.getErrorMsg()
        );

        return ResponseEntity.ok().build();
    }
}