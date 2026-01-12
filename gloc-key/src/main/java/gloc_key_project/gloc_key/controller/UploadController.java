package gloc_key_project.gloc_key.controller;


import gloc_key_project.gloc_key.dto.CustomUserDetails;
import gloc_key_project.gloc_key.dto.EditImageUploadCompleteResponse;
import gloc_key_project.gloc_key.dto.EditImageUploadUrlResponse;
import gloc_key_project.gloc_key.service.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/uploads/images")
public class UploadController {

    private final UploadService uploadService;

    // 편집 이미지 업로드용 Presigned URL 발급
    @GetMapping("/{parentImageId}/edit")
    public ResponseEntity<EditImageUploadUrlResponse> issueEditImageUploadUrl(
            @PathVariable Long parentImageId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        EditImageUploadUrlResponse response =
                uploadService.createEditUploadUrl(
                        userDetails.getId(),
                        userDetails.getUsername(),
                        parentImageId
                );

        return ResponseEntity.ok(response);
    }

    // 업로드 완료 요청
    @PostMapping("/edit/{uploadId}/complete")
    public ResponseEntity<EditImageUploadCompleteResponse> completeEditImageUpload(
            @PathVariable String uploadId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        EditImageUploadCompleteResponse response =
                uploadService.completeEditUpload(uploadId, userDetails.getId());

        return ResponseEntity.ok(response);
    }

}
