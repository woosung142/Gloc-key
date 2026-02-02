package gloc_key_project.gloc_key.jwt;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JWTUtilTest {

    JWTUtil jwtUtil;

    @BeforeEach
    void setUp() {
        // 테스트용 시크릿 키
        String secret = "test-secret-key-test-secret-key-test-secret-key";
        jwtUtil = new JWTUtil(secret);
    }

    @Test
    void JWT_생성_후_클레임을_읽기() {
        // given
        String token = jwtUtil.creatJwt(
                "access",
                1L,
                "junseop",
                "ROLE_USER",
                1000 * 60L // 1분
        );

        // when & then
        assertEquals(1L, jwtUtil.getId(token));
        assertEquals("junseop", jwtUtil.getUsername(token));
        assertEquals("ROLE_USER", jwtUtil.getRole(token));
        assertEquals("access", jwtUtil.getCategory(token));
    }

    @Test
    void 만료된_토큰_검증() throws InterruptedException {
        // given
        String token = jwtUtil.creatJwt(
                "access",
                1L,
                "junseop",
                "ROLE_USER",
                1L // 1ms
        );

        // 토큰 만료 대기
        Thread.sleep(10);

        // then
        assertTrue(jwtUtil.isExpired(token));
    }

    @Test
    void 잘못된_토큰_예외_발생() {
        // given
        String invalidToken = "this.is.not.jwt";

        // then
        assertThrows(Exception.class, () -> {
            jwtUtil.validateToken(invalidToken);
        });
    }

}