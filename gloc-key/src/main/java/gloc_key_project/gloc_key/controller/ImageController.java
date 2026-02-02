package gloc_key_project.gloc_key.controller;

import gloc_key_project.gloc_key.dto.*;
import gloc_key_project.gloc_key.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/images")
public class ImageController {

    private final ImageService imageService;

    // 이미지 생성 시작 API
    @PostMapping("/generate")
    public ResponseEntity<ImageGenerateResponse> generateImageProcess(
            @RequestBody ImageGenerateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        ImageGenerateResponse response = imageService.generateImageProcess(request.getPrompt(), userDetails.getUsername());

        return ResponseEntity.ok(response);
    }

    // 이미지 생성 상태 확인 API
    @GetMapping("/status/{jobId}")
    public ResponseEntity<ImageStatusResponse> checkImageStatus(
            @PathVariable String jobId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        ImageStatusResponse response = imageService.checkImageStatus(userDetails.getUsername(),jobId);

        return ResponseEntity.ok(response);
    }

    // 편집 이미지 저장용 URL 요청 API (Pre-signed URL 전달)
//    @GetMapping("/upload-url")
//    public ResponseEntity<?> getUploadUrl() {
//
//        return ResponseEntity.ok(response);
//    }

    // 이미지 재생성 API
    @PostMapping("/re-generate/{oldJobId}")
    public ResponseEntity<ImageGenerateResponse> generateImageProcess(
            @PathVariable String oldJobId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        // 새로운 jobId를 발급받으며 재생성 프로세스 시작
        ImageGenerateResponse response = imageService.reGenerateImageProcess(oldJobId, userDetails.getId(), userDetails.getUsername());

        return ResponseEntity.ok(response);
    }

    // 이미지 생성 내역 조회 API
    @GetMapping("/history")
    public ResponseEntity<Page<ImageHistoryResponse>> getHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<ImageHistoryResponse> response = imageService.getImageHistory(userDetails.getId(), page, size);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history/{imageId}/edits")
    public ResponseEntity<List<EditImageHistoryResponse>> getHistoryEdits(
            @PathVariable Long imageId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<EditImageHistoryResponse> response =
                imageService.getEditedImages(imageId, userDetails.getId());

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("{imageId}")
    public ResponseEntity<DeleteImageResponse> deleteImage(
            @PathVariable Long imageId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        DeleteImageResponse response =
                imageService.deleteImage(imageId, userDetails.getId());

        return ResponseEntity.ok(response);
    }

}
