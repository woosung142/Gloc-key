package gloc_key_project.gloc_key.jwt;

import gloc_key_project.gloc_key.dto.CustomUserDetails;
//import gloc_key_project.gloc_key.entity.RefreshToken;
import gloc_key_project.gloc_key.entity.User;
//import gloc_key_project.gloc_key.repository.RefreshTokenRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Collection;
import java.util.Iterator;
import java.util.concurrent.TimeUnit;

@RequiredArgsConstructor
public class LoginFilter extends UsernamePasswordAuthenticationFilter {


    private final AuthenticationManager authenticationManager;
    private final JWTUtil jwtUtil;
//    private final RefreshTokenRepository refreshTokenRepository;
    private final RedisTemplate<String, String> redisTemplate;

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) {
        // 사용자 정보 추출
        String username = obtainUsername(request);
        String password = obtainPassword(request);

        System.out.println("username = " + obtainUsername(request));
        System.out.println("password = " + obtainPassword(request));

        // 사용자 정보 DTO
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(username, password, null);

        // 사용자 정보 AuthenticationManager에 전달
        return  authenticationManager.authenticate(authToken);
    }

    // 로그인 성공 시
    @Override
    protected void successfulAuthentication(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain,
            Authentication authResult
    ) {
        CustomUserDetails customUserDetails = (CustomUserDetails) authResult.getPrincipal();
        // 사용자 username 추출
        Long userId = customUserDetails.getId();
        String username = customUserDetails.getUsername();
        Long user_id = customUserDetails.getId();
        Collection<? extends GrantedAuthority> authorities = authResult.getAuthorities();
        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
        GrantedAuthority auth = iterator.next();
        // 사용자 role 추출
        String role = auth.getAuthority();

        // accessToken 15분
        String accessToken = jwtUtil.creatJwt("access",userId, username, role, 15 * 60 * 1000L);
//        String accessToken = jwtUtil.creatJwt("access",userId, username, role, 15L);

        // refreshToken 2주
        String refreshToken = jwtUtil.creatJwt("refresh", userId, username, role, 14 * 24 * 60 * 60 * 1000L);

        // refreshToken 저장(Redis)
        redisTemplate.opsForValue().set(
                "RT:" + username,
                refreshToken,
                14,
                TimeUnit.DAYS
        );


        // accessToken 헤더에 추가
        response.setHeader("access", accessToken);
        // refreshToken 쿠키에 추가
        response.addCookie(createCookie("refresh", refreshToken));

        response.setStatus(HttpStatus.OK.value());
    }

    // 로그인 실패 시
    @Override
    protected void unsuccessfulAuthentication(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException failed
    ) {

        response.setStatus(401);
        System.out.println("Login Failed");
    }

    private Cookie createCookie(String key, String value) {
        Cookie cookie = new Cookie(key, value);
        // 2주 설정
        cookie.setMaxAge(14 * 24 * 60 * 60);
        // 쿠키가 유요한 경로
        cookie.setPath("/");
        // HTTPS 연결에서만 쿠키 전송
        cookie.setSecure(true);
        
        // XSS 공격 방지
        cookie.setHttpOnly(true);
        return cookie;
    }

}
