package gloc_key_project.gloc_key.service;

import gloc_key_project.gloc_key.customException.AuthException;
import gloc_key_project.gloc_key.dto.ReissueResponse;
import gloc_key_project.gloc_key.dto.SignupRequest;
import gloc_key_project.gloc_key.jwt.JWTUtil;
import gloc_key_project.gloc_key.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    UserRepository userRepository;

    @Mock
    BCryptPasswordEncoder bCryptPasswordEncoder;

    @Mock
    JWTUtil jwtUtil;

    @Mock
    RedisTemplate<String, String> redisTemplate;

    @Mock
    ValueOperations<String, String> valueOperations;

    @InjectMocks
    AuthService authService;


    /*
    ---------------
    회원가입 테스트
    ---------------
    */

    @Test
    void 회원가입_성공() {
        //given
        SignupRequest signupRequest = new SignupRequest("junseop", "email@gmail.com", "password");

        when(userRepository.existsByUsername("junseop")).thenReturn(false);
        when(bCryptPasswordEncoder.encode("password")).thenReturn("encodedPw");

        //when
        authService.SignupProcess(signupRequest);

        //then
        verify(userRepository).save(argThat(user ->
                user.getUsername().equals("junseop") &&
                        user.getPassword().equals("encodedPw")
        ));
    }

    @Test
    void username이_없으면_회원가입_실패() {
        // given
        SignupRequest request = new SignupRequest("", "email@gmail.com", "password");

        // then
        assertThrows(IllegalArgumentException.class, () -> {
            authService.SignupProcess(request);
        });
    }

    @Test
    void password가_없으면_회원가입_실패() {
        // given
        SignupRequest request = new SignupRequest("username", "email@gmail.com", "");

        // then
        assertThrows(IllegalArgumentException.class, () -> {
            authService.SignupProcess(request);
        });
    }

    @Test
    void username이_중복되면_회원가입_실패() {
        // given
        SignupRequest request = new SignupRequest("junseop", "email@gmail.com", "password");

        when(userRepository.existsByUsername("junseop")).thenReturn(true);

        // then
        assertThrows(IllegalArgumentException.class, () -> {
            authService.SignupProcess(request);
        });

        verify(userRepository, never()).save(any());
    }



    /*
    ---------------
    토큰 재발급 테스트
    ---------------
    */
    @Test
    void refreshToken이_null이면_재발급_실패() {
        assertThrows(AuthException.class, () -> {
            authService.reissueProcess(null);
        });
    }

    @Test
    void accessToken으로_재발급_시도하면_실패() {
        String accessToken = "access.token";

        when(jwtUtil.isExpired(accessToken)).thenReturn(false);
        when(jwtUtil.getCategory(accessToken)).thenReturn("access");

        assertThrows(AuthException.class, () -> {
            authService.reissueProcess(accessToken);
        });
    }

    @Test
    void Redis에_refreshToken이_없으면_실패() {
        String refreshToken = "refresh.token";

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("RT:junseop")).thenReturn(null);

        when(jwtUtil.isExpired(refreshToken)).thenReturn(false);
        when(jwtUtil.getCategory(refreshToken)).thenReturn("refresh");
        when(jwtUtil.getUsername(refreshToken)).thenReturn("junseop");
        when(jwtUtil.getRole(refreshToken)).thenReturn("ROLE_USER");
        when(jwtUtil.getId(refreshToken)).thenReturn(1L);

        assertThrows(AuthException.class, () -> {
            authService.reissueProcess(refreshToken);
        });
    }


    @Test
    void refreshToken_재발급_성공() {
        String refreshToken = "valid.refresh.token";

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("RT:junseop")).thenReturn(refreshToken);

        when(jwtUtil.isExpired(refreshToken)).thenReturn(false);
        when(jwtUtil.getCategory(refreshToken)).thenReturn("refresh");
        when(jwtUtil.getUsername(refreshToken)).thenReturn("junseop");
        when(jwtUtil.getRole(refreshToken)).thenReturn("ROLE_USER");
        when(jwtUtil.getId(refreshToken)).thenReturn(1L);

        when(jwtUtil.creatJwt(eq("access"), anyLong(), anyString(), anyString(), anyLong()))
                .thenReturn("new.access.token");

        when(jwtUtil.creatJwt(eq("refresh"), anyLong(), anyString(), anyString(), anyLong()))
                .thenReturn("new.refresh.token");

        ReissueResponse response = authService.reissueProcess(refreshToken);

        assertEquals("new.access.token", response.getNewAccessToken());
        assertEquals("new.refresh.token", response.getNewRefreshToken());

        verify(valueOperations).set(
                eq("RT:junseop"),
                eq("new.refresh.token"),
                eq(14L),
                eq(TimeUnit.DAYS)
        );
    }


    /*
    ---------------
    로그아웃 테스트
    ---------------
    */

    @Test
    void 로그아웃_성공() {
        String refreshToken = "valid-refresh-token";
        String username = "testUser";

        when(jwtUtil.isExpired(refreshToken)).thenReturn(false);
        when(jwtUtil.getUsername(refreshToken)).thenReturn(username);
        when(redisTemplate.delete("RT:" + username)).thenReturn(true);

        assertDoesNotThrow(() -> authService.logoutProcess(refreshToken));

        verify(redisTemplate, times(1)).delete("RT:" + username);
    }

    @Test
    void 로그아웃_실패_만료된_토큰() {
        String refreshToken = "expired-token";

        when(jwtUtil.isExpired(refreshToken)).thenReturn(true);

        assertThrows(AuthException.class,
                () -> authService.logoutProcess(refreshToken));

        verify(redisTemplate, never()).delete(anyString());
    }

    @Test
    void 로그아웃_실패_이미_로그아웃됨() {
        String refreshToken = "valid-refresh-token";
        String username = "testUser";

        when(jwtUtil.isExpired(refreshToken)).thenReturn(false);
        when(jwtUtil.getUsername(refreshToken)).thenReturn(username);
        when(redisTemplate.delete("RT:" + username)).thenReturn(false);

        assertThrows(AuthException.class,
                () -> authService.logoutProcess(refreshToken));

        verify(redisTemplate, times(1)).delete("RT:" + username);
    }
}