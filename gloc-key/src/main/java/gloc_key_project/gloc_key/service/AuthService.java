package gloc_key_project.gloc_key.service;

import gloc_key_project.gloc_key.customException.AuthException;
import gloc_key_project.gloc_key.dto.ReissueResponse;
import gloc_key_project.gloc_key.dto.SignupRequest;
//import gloc_key_project.gloc_key.entity.RefreshToken;
import gloc_key_project.gloc_key.entity.User;
import gloc_key_project.gloc_key.jwt.JWTUtil;
//import gloc_key_project.gloc_key.repository.RefreshTokenRepository;
import gloc_key_project.gloc_key.repository.UserRepository;
import io.jsonwebtoken.ExpiredJwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final JWTUtil jwtUtil;
    private final RedisTemplate<String, String> redisTemplate;


    //회원가입 로직
    public void SignupProcess(SignupRequest signupRequest) {

        String username = signupRequest.getUsername();
        String email = signupRequest.getEmail();
        String password = signupRequest.getPassword();


        if (username == null || username.isBlank() ||
                email == null || email.isBlank() ||
                password == null || password.isBlank()) {
            throw new IllegalArgumentException("값을 입력해주세요");
        }

        //id 중복 검증
        if(userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("해당 아이디가 존재합니다.");
        }

        if(userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        User userEntity = User.builder()
                .username(username)
                .email(email)
                .password(bCryptPasswordEncoder.encode(password))
                .role("ROLE_USER")
                .build();

        userRepository.save(userEntity);

    }

    // 토큰 재발급 로직
    public ReissueResponse reissueProcess(String refreshToken) {

        // 1. refreshToken 유무 검증
        if (refreshToken == null) {
            throw new AuthException("Refresh token is missing");
        }


        // 2. refreshToken 만료 검증
        if (jwtUtil.isExpired(refreshToken)) {
            throw new AuthException("Refresh token is expired");
        }

        // 3. refreshToken 타입 검증
        if (!"refresh".equals(jwtUtil.getCategory(refreshToken))) {
            throw new AuthException("Invalid token type");
        }

        // 4. 사용자 정보 추출 (검증을 위해 순서를 위로 올림)
        String username = jwtUtil.getUsername(refreshToken);
        String role = jwtUtil.getRole(refreshToken);
        Long userId = jwtUtil.getId(refreshToken);

        // 5. Redis에서 해당 사용자의 Refresh token이 존재하는지 확인
        String savedToken = redisTemplate.opsForValue().get("RT:" + username);

        // 저장된 토큰이 없거나, 전달받은 토큰과 일치하지 않으면 예외 발생
        if (savedToken == null || !savedToken.equals(refreshToken)) {
            throw new AuthException("유효하지 않거나 존재하지 않는 Refresh token입니다.");
        }

        /* 검증 성공 */

        // 6. 새 토큰 발급
        String newAccessToken = jwtUtil.creatJwt("access",userId, username, role, 15 * 60 * 1000L);
        String newRefreshToken = jwtUtil.creatJwt("refresh",userId, username, role, 14 * 24 * 60 * 60 * 1000L);

        // 7. (구)refreshToken 새로운 refreshToken으로 덮어쓰기
        redisTemplate.opsForValue().set(
                "RT:" + username,
                newRefreshToken,
                14,
                TimeUnit.DAYS
        );

        return new ReissueResponse(newAccessToken, newRefreshToken);
    }

    @Transactional
    public void logoutProcess(String refreshToken) {

        // 1. 토큰 유무 및 만료 검증
        if (refreshToken == null || jwtUtil.isExpired(refreshToken)) {
            throw new AuthException("유효하지 않거나 이미 만료된 토큰입니다.");
        }

        // 2. 사용자 정보 추출
        String username = jwtUtil.getUsername(refreshToken);

        // 3. Redis에서 해당 사용자의 Refresh Token 삭제
        // "RT:사용자이름" 키가 존재하면 삭제하고 true 반환, 없으면 false 반환
        Boolean isDeleted = redisTemplate.delete("RT:" + username);

        // 4. 삭제 결과 확인
        if (Boolean.FALSE.equals(isDeleted)) {
            throw new AuthException("이미 로그아웃되었거나 존재하지 않는 토큰입니다.");
        }
    }

}
