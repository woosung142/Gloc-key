package gloc_key_project.gloc_key.controller;

import gloc_key_project.gloc_key.dto.ImageGenerateRequest;
import gloc_key_project.gloc_key.dto.ImageGenerateResponse;
import gloc_key_project.gloc_key.dto.ImageStatusResponse;
import gloc_key_project.gloc_key.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/images")
public class ImageController {

    private final ImageService imageService;

    @PostMapping("/generate")
    public ResponseEntity<ImageGenerateResponse> generateImageProcess(
            @RequestBody ImageGenerateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        ImageGenerateResponse response = imageService.generateImageProcess(request.getPrompt(), userDetails.getUsername());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{jobId}")
    public ResponseEntity<ImageStatusResponse> checkImageStatus(
            @PathVariable String jobId,
            @AuthenticationPrincipal UserDetails userDetails) {

        ImageStatusResponse response = imageService.checkImageStatus(userDetails.getUsername(),jobId);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/re-generate/{oldJobId}")
    public ResponseEntity<ImageGenerateResponse> generateImageProcess(
            @PathVariable String oldJobId,
            @AuthenticationPrincipal UserDetails userDetails) {

        // 새로운 jobId를 발급받으며 재생성 프로세스 시작
        ImageGenerateResponse response = imageService.reGenerateImageProcess(oldJobId, userDetails.getUsername());

        return ResponseEntity.ok(response);
    }
}
