package gloc_key_project.gloc_key.controller;

import gloc_key_project.gloc_key.dto.ReissueResponse;
import gloc_key_project.gloc_key.dto.SignupRequest;
import gloc_key_project.gloc_key.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<?> signupProcess(SignupRequest signupRequest) {

        authService.SignupProcess(signupRequest);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/reissue")
    public ResponseEntity<?> reissueProcess(HttpServletRequest request, HttpServletResponse response) {

        String refreshToken = null;

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refresh".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                }
            }
        }

        if (refreshToken == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        ReissueResponse newToken = authService.reissueProcess(refreshToken);

        // Access Token 헤더
        response.setHeader("access", newToken.getNewAccessToken());

        // Refresh Token 쿠키 (ResponseCookie)
        ResponseCookie refreshCookie = ResponseCookie.from("refresh", newToken.getNewRefreshToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .domain(".glok.store")
                .path("/")
                .maxAge(14 * 24 * 60 * 60)
                .build();

        response.addHeader("Set-Cookie", refreshCookie.toString());

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/logout")
    public ResponseEntity<?> logoutProcess(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = null;

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refresh".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                }
            }
        }

        authService.logoutProcess(refreshToken);

        ResponseCookie deleteCookie = ResponseCookie.from("refresh", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .domain(".glok.store")
                .path("/")
                .maxAge(0)
                .build();

        response.addHeader("Set-Cookie", deleteCookie.toString());

        return ResponseEntity.ok().build();

        // 추가: Refresh Token 쿠키를 만료시켜 클라이언트에서 삭제하도록 명령
//        Cookie expiredCookie = new Cookie("refresh", null);
//        expiredCookie.setMaxAge(0); // 만료 시간을 0으로 설정
//        expiredCookie.setPath("/");
//        expiredCookie.setHttpOnly(true);
//        response.addCookie(expiredCookie);
//
//        return new ResponseEntity<>(HttpStatus.OK);
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
        cookie.setSecure(true);


        cookie.setAttribute("SameSite", "None");

        cookie.setDomain(".glok.store");
        // XSS 공격 방지
        cookie.setHttpOnly(true);
        return cookie;
    }
}


