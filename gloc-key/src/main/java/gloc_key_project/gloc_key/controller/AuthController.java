package gloc_key_project.gloc_key.controller;

import gloc_key_project.gloc_key.dto.Signup_request;
import gloc_key_project.gloc_key.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/auth/signup")
    public String signupProcess(Signup_request signupRequest) {

        authService.SignupProcess(signupRequest);

        return "ok";
    }
}

