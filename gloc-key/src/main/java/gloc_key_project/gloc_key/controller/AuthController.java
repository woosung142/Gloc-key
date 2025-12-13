package gloc_key_project.gloc_key.controller;

import gloc_key_project.gloc_key.dto.Reissue_response;
import gloc_key_project.gloc_key.dto.Signup_request;
import gloc_key_project.gloc_key.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/auth/signup")
    public ResponseEntity<?> signupProcess(Signup_request signupRequest) {

        authService.SignupProcess(signupRequest);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/auth/reissue")
    public ResponseEntity<?> reissueProcess(HttpServletRequest request, HttpServletResponse response) {

        String refreshToken = null;
        for (Cookie cookie : request.getCookies()) {
            if ("refresh".equals(cookie.getName())) {
                refreshToken = cookie.getValue();
            }
        }


        Reissue_response newToken = authService.reissueProcess(refreshToken);

        response.setHeader("access", newToken.getNewAccessToken());
        response.addCookie(createCookie("refresh", newToken.getNewRefreshToken()));

        return new ResponseEntity<>(HttpStatus.OK);

    }

    @GetMapping("/test")
    public String test() {
        return "success!";
    }

    private Cookie createCookie(String key, String value) {
        Cookie cookie = new Cookie(key, value);
        // 2주 설정
        cookie.setMaxAge(14 * 24 * 60 * 60);
        // 쿠키가 유요한 경로
        cookie.setPath("/");
        // HTTPS 연결에서만 쿠키 전송
//        cookie.setSecure(true);

        // XSS 공격 방지
        cookie.setHttpOnly(true);
        return cookie;
    }
}


