package gloc_key_project.gloc_key.repository;

import gloc_key_project.gloc_key.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ImageRepository extends JpaRepository<Image, Long> {
    Optional<Image> findByJobId(String jobId);
}
