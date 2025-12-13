package gloc_key_project.gloc_key.config;

import gloc_key_project.gloc_key.entity.RefreshToken;
import gloc_key_project.gloc_key.jwt.JWTFilter;
import gloc_key_project.gloc_key.jwt.JWTUtil;
import gloc_key_project.gloc_key.jwt.LoginFilter;
import gloc_key_project.gloc_key.repository.RefreshTokenRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Collections;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {


    private final AuthenticationConfiguration authenticationConfiguration;
    private final JWTUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        LoginFilter loginFilter = new LoginFilter(authenticationManager(authenticationConfiguration), jwtUtil, refreshTokenRepository);
        loginFilter.setFilterProcessesUrl("/api/login");
        http
                //cors 설정
                .cors((corsCustomizer -> corsCustomizer.configurationSource(new CorsConfigurationSource() {
                    @Override
                    public @Nullable CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
                        CorsConfiguration configuration = new CorsConfiguration();

                        //허용할
                        configuration.setAllowedOrigins(Collections.singletonList("http://localhost:3000"));
                        //허용할 메서드
                        configuration.setAllowedMethods(Collections.singletonList("*"));
                        configuration.setAllowCredentials(true);
                        //허용할 헤더
                        configuration.setAllowedHeaders(Collections.singletonList("*"));
                        configuration.setMaxAge(3600L);
                        //Authorization 헤더 허용
                        configuration.setExposedHeaders(Collections.singletonList("Authorization"));

                        return configuration;
                    }
                })))

                //csrf 비활성화
                .csrf((auth) -> auth.disable())

                //폼 로그인 비활성화
                .formLogin((auth) -> auth.disable())

                //http basic 인증 방식 비활성화
                .httpBasic((auth) -> auth.disable())

                //접근 제어 및 혀용
                .authorizeHttpRequests((auth) -> auth
                        .requestMatchers("/api/login", "/", "/api/signup","/api/reissue", "/api/logout").permitAll()
                        .requestMatchers("/admin").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )


                //JWTFilter 등록
                .addFilterBefore(new JWTFilter(jwtUtil), LoginFilter.class)
                //로그인 필터 등록 (UsernamePasswordAuthenticationFilter 대체)
                .addFilterAt(loginFilter, UsernamePasswordAuthenticationFilter.class)
//                .addFilterAt(loginFilter(), UsernamePasswordAuthenticationFilter.class)

                //세션 설정 STATELESS방식 사용
                .sessionManagement((session) -> session
                        .sessionCreationPolicy((SessionCreationPolicy.STATELESS)));



        return http.build();
    }
}
