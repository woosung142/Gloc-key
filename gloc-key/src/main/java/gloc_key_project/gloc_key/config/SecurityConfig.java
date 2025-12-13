package gloc_key_project.gloc_key.config;

import gloc_key_project.gloc_key.jwt.JWTFilter;
import gloc_key_project.gloc_key.jwt.JWTUtil;
import gloc_key_project.gloc_key.jwt.LoginFilter;
import lombok.RequiredArgsConstructor;
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

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {


    private final AuthenticationConfiguration authenticationConfiguration;
    private final JWTUtil jwtUtil;

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

        http
                //csrf 비활성화
                .csrf((auth) -> auth.disable())

                //폼 로그인 비활성화
                .formLogin((auth) -> auth.disable())

                //http basic 인증 방식 비활성화
                .httpBasic((auth) -> auth.disable())

                //접근 제어 및 혀용
                .authorizeHttpRequests((auth) -> auth
                        .requestMatchers("/login", "/", "/auth/signup").permitAll()
                        .requestMatchers("/admin").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )


                //JWTFilter 등록
                .addFilterBefore(new JWTFilter(jwtUtil), LoginFilter.class)
                //로그인 필터 등록 (UsernamePasswordAuthenticationFilter 대체)
                .addFilterAt(new LoginFilter(authenticationManager(authenticationConfiguration), jwtUtil), UsernamePasswordAuthenticationFilter.class)

                //세션 설정 STATELESS방식 사용
                .sessionManagement((session) -> session
                        .sessionCreationPolicy((SessionCreationPolicy.STATELESS)));



        return http.build();
    }
}
