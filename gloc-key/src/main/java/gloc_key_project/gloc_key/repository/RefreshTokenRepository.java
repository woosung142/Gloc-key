//package gloc_key_project.gloc_key.repository;
//
//import gloc_key_project.gloc_key.entity.RefreshToken;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.Optional;
//
//public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
//
//    Boolean existsByRefreshToken(String refreshToken);
//
//    @Transactional
//    void deleteByRefreshToken(String refreshToken);
//
//    Optional<RefreshToken> findByRefreshToken(String refreshToken);
//}
