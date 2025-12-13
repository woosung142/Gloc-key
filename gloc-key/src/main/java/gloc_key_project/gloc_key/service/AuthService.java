package gloc_key_project.gloc_key.service;

import gloc_key_project.gloc_key.customException.AuthException;
import gloc_key_project.gloc_key.dto.Reissue_response;
import gloc_key_project.gloc_key.dto.Signup_request;
import gloc_key_project.gloc_key.entity.User;
import gloc_key_project.gloc_key.jwt.JWTUtil;
import gloc_key_project.gloc_key.repository.UserRepository;
import io.jsonwebtoken.ExpiredJwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final JWTUtil jwtUtil;


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

        /* 검증 성공 */

        // 4. 사용자 정보 추출
        String username = jwtUtil.getUsername(refreshToken);
        String role = jwtUtil.getRole(refreshToken);

        // 5. 새 토큰 발급
        String newAccessToken = jwtUtil.creatJwt("access", username, role, 15 * 60 * 1000L);

        String newRefreshToken = jwtUtil.creatJwt("refresh", username, role, 14 * 24 * 60 * 60 * 1000L);

        return new Reissue_response(newAccessToken, newRefreshToken);
    }

}
