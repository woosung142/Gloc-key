package gloc_key_project.gloc_key.jwt;

import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JWTUtil {
    private SecretKey secretKey;

    // JWTUtil 생성자
    public JWTUtil(@Value("${spring.jwt.secret}")String secret) {
//        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), Jwts.SIG.HS256.key().build().getAlgorithm());
    }

    // id 확인
    public Long getId(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("id", Number.class)
                .longValue();
    }

    // username 확인
    public String getUsername(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("username",String.class);
    }

    // role 확인
    public String getRole(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("role",String.class);
    }

    //cartegory(access, refresh) 확인
    public String getCategory(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("category", String.class);

    }


    public void validateToken(String token) {
        Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token);
    }

    // 토큰 만료 확인
    public boolean isExpired(String token) {
        try {
            Date exp = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getExpiration();

            return exp.before(new Date());
        } catch (Exception e) {
            // 파싱 중 예외 = 만료되었거나 잘못된 토큰
            return true;
        }
    }


    // 토큰 생성 메서드
    public String creatJwt(String category, Long userId, String username, String role,Long expiredMs) {

        return Jwts.builder()
                .claim("category", category)
                .claim("id", userId)
                .claim("username", username)
                .claim("role", role)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiredMs))
                .signWith(secretKey)
                .compact();
    }
}
