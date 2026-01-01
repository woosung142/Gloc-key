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

        String jobId = imageService.generateImageProcess(request, userDetails.getUsername());

        return ResponseEntity.ok(new ImageGenerateResponse(jobId, "이미지 생성이 시작되었습니다."));
    }

    @GetMapping("/status/{jobId}")
    public ResponseEntity<ImageStatusResponse> checkImageStatus(@PathVariable String jobId) {

        String status = imageService.checkImageStatus(jobId);

        return ResponseEntity.ok(new ImageStatusResponse(jobId, status));
    }
}
