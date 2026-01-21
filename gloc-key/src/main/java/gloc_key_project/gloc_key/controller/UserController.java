package gloc_key_project.gloc_key.controller;

import gloc_key_project.gloc_key.dto.ChangePasswordRequest;
import gloc_key_project.gloc_key.dto.ChangePasswordResponse;
import gloc_key_project.gloc_key.dto.CustomUserDetails;
import gloc_key_project.gloc_key.dto.DeleteUserResponse;
import gloc_key_project.gloc_key.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PatchMapping("/users/password")
    public ResponseEntity<ChangePasswordResponse> changePassword(
            @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        ChangePasswordResponse response = userService.changePassword(request, userDetails.getId());

        return ResponseEntity.ok(response);
    }


    @DeleteMapping("/users/delete")
    public ResponseEntity<DeleteUserResponse> deleteUser(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        DeleteUserResponse response = userService.deleteUser(userDetails.getId());

        return ResponseEntity.ok(response);
    }


}
