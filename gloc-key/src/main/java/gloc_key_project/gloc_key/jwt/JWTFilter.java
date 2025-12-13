package gloc_key_project.gloc_key.jwt;

import gloc_key_project.gloc_key.dto.CustomUserDetails;
import gloc_key_project.gloc_key.entity.User;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.io.PrintWriter;

@RequiredArgsConstructor
public class JWTFilter extends OncePerRequestFilter {

    private final JWTUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String accessToken = request.getHeader("access");

        // 토큰 null 검증
        if(accessToken == null) {
            System.out.println("token null");
            filterChain.doFilter(request,response);
            return;
        }

        // 토큰 만료 검증
        try {
            jwtUtil.isExpired(accessToken);
        }catch(ExpiredJwtException e) {

            //response body 작성
            PrintWriter writer = response.getWriter();
            writer.print("accessToken expired");

            //토큰만료 401처리
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }


        // 사용자 정보 추출
        String username = jwtUtil.getUsername(accessToken);
        String role = jwtUtil.getRole(accessToken);


        User user = User.builder()
                .username(username)
                .password("password")
                .role(role)
                .build();

        //UserDetails에 회원 정보 객체 담기
        CustomUserDetails customUserDetails = new CustomUserDetails(user);

        //스프링 시큐리티 인증 토큰 생성
        Authentication authToken = new UsernamePasswordAuthenticationToken(customUserDetails, null, customUserDetails.getAuthorities());

        //세션에 사용자 등록
        SecurityContextHolder.getContext().setAuthentication(authToken);

        filterChain.doFilter(request, response);
    }

}

