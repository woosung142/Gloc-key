package gloc_key_project.gloc_key.service;

import gloc_key_project.gloc_key.customException.AuthException;
import gloc_key_project.gloc_key.dto.Reissue_response;
import gloc_key_project.gloc_key.dto.Signup_request;
import gloc_key_project.gloc_key.entity.RefreshToken;
import gloc_key_project.gloc_key.entity.User;
import gloc_key_project.gloc_key.jwt.JWTUtil;
import gloc_key_project.gloc_key.repository.RefreshTokenRepository;
import gloc_key_project.gloc_key.repository.UserRepository;
import io.jsonwebtoken.ExpiredJwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final JWTUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;


    //회원가입 로직
    public void SignupProcess(Signup_request signupRequest) {

        String username = signupRequest.getUsername();
        String password = signupRequest.getPassword();

        //id 중복 검증
        if(userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException();
        }

        User userEntity = User.builder()
                .username(username)
                .password(bCryptPasswordEncoder.encode(password))
                .role("ROLE_USER")
                .build();

        userRepository.save(userEntity);

    }

    public Reissue_response reissueProcess(String refreshToken) {

        // 1. refreshToken 유무 검증
        if (refreshToken == null) {
            throw new AuthException("Refresh token is missing");
        }


        // 2. refreshToken 만료 검증
        try {
            jwtUtil.isExpired(refreshToken);
        } catch (ExpiredJwtException e) {
            throw new AuthException("Refresh token is expired");
        }


        // 3. refreshToken 타입 검증
        if (!"refresh".equals(jwtUtil.getCategory(refreshToken))) {
            throw new AuthException("Invalid token type");
        }

        // 4. 해당 refresh token이 DB에 존재하는지 확인
        RefreshToken existingToken = refreshTokenRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new AuthException("DB에 존재하지 않는 Refresh token입니다."));

        /* 검증 성공 */

        // 5. 사용자 정보 추출
        String username = jwtUtil.getUsername(refreshToken);
        String role = jwtUtil.getRole(refreshToken);
        Long userId = jwtUtil.getId(refreshToken);

        // 6. 새 토큰 발급
        String newAccessToken = jwtUtil.creatJwt("access",userId, username, role, 15 * 60 * 1000L);

        String newRefreshToken = jwtUtil.creatJwt("refresh",userId, username, role, 14 * 24 * 60 * 60 * 1000L);

        // 7. (구)refreshToken 삭제.
        refreshTokenRepository.delete(existingToken);

        // 8. 새로운 refreshToken 저장
        User user = User.builder().id(userId).build();
        LocalDateTime expiration = LocalDateTime.now().plus(14 * 24 * 60 * 60 * 1000L, ChronoUnit.MILLIS);

        RefreshToken token = RefreshToken.builder()
                .user(user)
                .refreshToken(newRefreshToken)
                .expiration(expiration)
                .build();
        refreshTokenRepository.save(token);

        return new Reissue_response(newAccessToken, newRefreshToken);
    }

}
