package gloc_key_project.gloc_key.jwt;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
class JWTFilterTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    JWTUtil jwtUtil;

    @Test
    void 만료된_accessToken이면_401_반환() throws Exception {
        // given: 이미 만료된 access 토큰
        String expiredToken = jwtUtil.creatJwt(
                "access",
                1L,
                "junseop",
                "ROLE_USER",
                1L
        );

        Thread.sleep(5);

        // when & then
        mockMvc.perform(get("/api/test")
                        .header("access", expiredToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refreshToken으로_접근하면_401_반환() throws Exception {
        String refreshToken = jwtUtil.creatJwt(
                "refresh",
                1L,
                "user",
                "ROLE_USER",
                60_000L
        );

        mockMvc.perform(get("/api/test")
                        .header("access", refreshToken))
                .andExpect(status().isUnauthorized());
    }

}