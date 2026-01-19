package gloc_key_project.gloc_key.repository;

import gloc_key_project.gloc_key.entity.Image;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ImageRepository extends JpaRepository<Image, Long> {
    Optional<Image> findByJobId(String jobId);

    Page<Image> findAllByUser_Id(Long userId, Pageable pageable);

    Page<Image> findByUser_IdAndParentImageIsNull(Long userId, Pageable pageable);

    Optional<Image> findById(Long id);

    List<Image> findByRootImageIdOrderByCreatedAtDesc(Long rootImageId);

    List<Image> findAllByRootImageIdOrderByCreatedAtAsc(Long rootImageId);

    List<Image> findAllByParentImage(Image image);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Image i SET i.rootImageId = :newRootId WHERE i.rootImageId = :oldRootId")
    void updateRootImageId(@Param("oldRootId") Long oldRootId, @Param("newRootId") Long newRootId);
}
