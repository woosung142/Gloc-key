package gloc_key_project.gloc_key.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {

        http
                //csrf 비활성화
                .csrf((auth) -> auth.disable())

                //폼 로그인 비활성화
                .formLogin((auth) -> auth.disable())

                //http basic 인증 방식 비활성화
                .httpBasic((auth) -> auth.disable())

                //접근 제어 및 혀용
                .authorizeHttpRequests((auth) -> auth
                        .requestMatchers("/login", "/", "/signup").permitAll()
                        .requestMatchers("/admin").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )

                //세션 설정 STATELESS방식 사용
                .sessionManagement((session) -> session
                        .sessionCreationPolicy((SessionCreationPolicy.STATELESS)));



        return http.build();
    }
}
