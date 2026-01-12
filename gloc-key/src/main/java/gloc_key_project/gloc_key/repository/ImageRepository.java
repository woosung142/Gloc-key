package gloc_key_project.gloc_key.repository;

import gloc_key_project.gloc_key.entity.Image;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ImageRepository extends JpaRepository<Image, Long> {
    Optional<Image> findByJobId(String jobId);

    Page<Image> findAllByUser_Id(Long userId, Pageable pageable);

    Page<Image> findByUser_IdAndParentImageIsNull(Long userId, Pageable pageable);

    Optional<Image> findById(Long id);

    List<Image> findByRootImageIdOrderByCreatedAtDesc(Long rootImageId);
}
