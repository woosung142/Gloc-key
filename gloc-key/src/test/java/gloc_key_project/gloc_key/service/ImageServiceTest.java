package gloc_key_project.gloc_key.service;

import gloc_key_project.gloc_key.customException.AuthException;
import gloc_key_project.gloc_key.dto.EditImageHistoryResponse;
import gloc_key_project.gloc_key.dto.ImageGenerateResponse;
import gloc_key_project.gloc_key.dto.ImageHistoryResponse;
import gloc_key_project.gloc_key.dto.ImageStatusResponse;
import gloc_key_project.gloc_key.entity.Image;
import gloc_key_project.gloc_key.entity.User;
import gloc_key_project.gloc_key.repository.ImageRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ImageServiceTest {
    @Mock
    ImageRepository imageRepository;

    @Mock
    SagemakerService sagemakerService;

    @Mock
    RedisTemplate<String, String> redisTemplate;

    @Mock
    ValueOperations<String, String> valueOperations;

    @Mock
    S3Service s3Service;

    @InjectMocks
    ImageService imageService;


    /*
    ---------------
    이미지 생성 요청 테스트
    ---------------
    */
    @Test
    void 이미지_생성_요청_성공() {
        // given
        String prompt = "test-prompt";
        String username = "test-user";
        String jobId = "test-jobId";

        when(redisTemplate.opsForHash()).thenReturn(mock(HashOperations.class));

        // when
        ImageGenerateResponse response =
                imageService.generateImageProcess(prompt, username);

        // then
        assertNotNull(response.getJobId());
        assertEquals("이미지 생성이 시작되었습니다.", response.getMessage());

        verify(sagemakerService, times(1))
                .call(eq(prompt), anyString(), eq(username));

        verify(redisTemplate, times(1))
                .expire(startsWith("image:job:"), eq(1L), eq(TimeUnit.DAYS));

    }

    @Test
    void prompt_없으면_이미지_생성_실패() {
        assertThrows(IllegalArgumentException.class, () ->
                imageService.generateImageProcess("", "user"));
    }

    /*
    ---------------
    이미지 상태 확인 테스트
    ---------------
    */
    @Test
    void 이미지_상태_조회_성공() {
        // given
        String jobId = "test-jobId";
        String key = "image:job:" + jobId;

        Map<Object, Object> jobInfo = Map.of(
                "imageId", "1",
                "status", "COMPLETED",
                "s3Key", "image-key",
                "owner", "real-user",
                "prompt", "test-prompt",
                "jobId", "test-jobId"
        );

        when(redisTemplate.opsForHash())
                .thenReturn(mock(HashOperations.class));

        when(redisTemplate.opsForHash().entries(key))
                .thenReturn(jobInfo);

        when(s3Service.createPresignedGetUrl("image-key"))
                .thenReturn("presigned-url");


        ImageStatusResponse response = imageService.checkImageStatus("real-user", jobId);

        // then
        assertEquals(1L, response.getImageId());
        assertEquals("COMPLETED", response.getStatus());
        assertEquals("presigned-url", response.getImageUrl());
        assertEquals("test-jobId", response.getJobId());
    }
    @Test
    void redis에_저장된_작업_없으면_상태조회_실패() {
        // given
        String jobId = "job-id";
        String key = "image:job:" + jobId;

        when(redisTemplate.opsForHash())
                .thenReturn(mock(HashOperations.class));

        when(redisTemplate.opsForHash().entries(key))
                .thenReturn(Map.of());

        // then
        assertThrows(IllegalArgumentException.class, () -> {
            imageService.checkImageStatus("test-user", jobId);
        });
    }
    @Test
    void username_다르면_상태조회_실패() {
        // given
        String jobId = "test-jobId";
        String key = "image:job:" + jobId;

        Map<Object, Object> jobInfo = Map.of(
                "status", "PENDING",
                "owner", "real-user",
                "prompt", "test-prompt"
        );

        when(redisTemplate.opsForHash())
                .thenReturn(mock(HashOperations.class));

        when(redisTemplate.opsForHash().entries(key))
                .thenReturn(jobInfo);

        // then
        assertThrows(AccessDeniedException.class, () -> {
            imageService.checkImageStatus("wrong-user", jobId);
        });
    }

    /*
    ---------------
    원본 이미지 내역 조회 테스트
    ---------------
    */
    @Test
    void 원본_이미지_히스토리_조회_성공() {
        // given
        Long userId = 1L;
        int page = 0;
        int size = 10;

        Image image = Image.builder()
                .id(1L)
                .jobId("job-123")
                .prompt("test prompt")
                .s3Key("image-key")
                .createdAt(LocalDateTime.now())
                .build();

        Page<Image> imagePage = new PageImpl<>(
                List.of(image),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")),
                1
        );

        when(imageRepository.findByUser_IdAndParentImageIsNull(
                eq(userId),
                any(Pageable.class)
        )).thenReturn(imagePage);

        when(s3Service.createPresignedGetUrl("image-key"))
                .thenReturn("presigned-url");

        // when
        Page<ImageHistoryResponse> result =
                imageService.getImageHistory(userId, page, size);

        // then
        assertEquals(1, result.getTotalElements());

        ImageHistoryResponse response = result.getContent().get(0);
        assertEquals(1L, response.getImageId());
        assertEquals("job-123", response.getJobId());
        assertEquals("test prompt", response.getPrompt());
        assertEquals("presigned-url", response.getImageUrl());

        verify(imageRepository).findByUser_IdAndParentImageIsNull(
                eq(userId),
                any(Pageable.class)
        );

        verify(s3Service).createPresignedGetUrl("image-key");
    }

    @Test
    void 이미지_히스토리_조회_정렬_및_페이징_확인() {
        // given
        Long userId = 1L;
        int page = 1;
        int size = 5;

        ArgumentCaptor<Pageable> pageableCaptor =
                ArgumentCaptor.forClass(Pageable.class);

        when(imageRepository.findByUser_IdAndParentImageIsNull(
                eq(userId),
                any(Pageable.class)
        )).thenReturn(Page.empty());

        // when
        imageService.getImageHistory(userId, page, size);

        // then
        verify(imageRepository).findByUser_IdAndParentImageIsNull(
                eq(userId),
                pageableCaptor.capture()
        );

        Pageable pageable = pageableCaptor.getValue();
        assertEquals(page, pageable.getPageNumber());
        assertEquals(size, pageable.getPageSize());
        assertEquals(
                Sort.by(Sort.Direction.DESC, "createdAt"),
                pageable.getSort()
        );
    }

    @Test
    void 이미지_히스토리_조회_결과없음() {
        // given
        Long userId = 1L;

        when(imageRepository.findByUser_IdAndParentImageIsNull(
                eq(userId),
                any(Pageable.class)
        )).thenReturn(Page.empty());

        // when
        Page<ImageHistoryResponse> result =
                imageService.getImageHistory(userId, 0, 10);

        // then
        assertTrue(result.isEmpty());
        verify(s3Service, never()).createPresignedGetUrl(any());
    }

    @Test
    void 이미지_히스토리_여러개일때_S3_호출_횟수() {
        // given
        Long userId = 1L;

        Image img1 = Image.builder().id(1L).s3Key("key1").build();
        Image img2 = Image.builder().id(2L).s3Key("key2").build();

        when(imageRepository.findByUser_IdAndParentImageIsNull(
                eq(userId),
                any(Pageable.class)
        )).thenReturn(new PageImpl<>(List.of(img1, img2)));

        when(s3Service.createPresignedGetUrl(any()))
                .thenReturn("url");

        // when
        imageService.getImageHistory(userId, 0, 10);

        // then
        verify(s3Service, times(2))
                .createPresignedGetUrl(any());
    }





    /*
    ---------------
    편집 이미지 내역 조회 테스트
    ---------------
    */
    @Test
    void 편집된_이미지_조회_성공() {
        // given
        Long originalImageId = 1L;
        Long userId = 10L;

        User user = User.builder()
                .id(userId)
                .build();

        Image originalImage = Image.builder()
                .id(originalImageId)
                .user(user)
                .rootImageId(100L)
                .build();

        Image editedImage1 = Image.builder()
                .id(2L)
                .parentImage(originalImage)
                .rootImageId(100L)
                .s3Key("edit-key-1")
                .createdAt(LocalDateTime.now())
                .build();

        Image editedImage2 = Image.builder()
                .id(3L)
                .parentImage(originalImage)
                .rootImageId(100L)
                .s3Key("edit-key-2")
                .createdAt(LocalDateTime.now())
                .build();

        Image invalidImage = Image.builder()
                .id(4L)
                .parentImage(null) // 필터링 대상
                .rootImageId(100L)
                .build();

        when(imageRepository.findById(originalImageId))
                .thenReturn(Optional.of(originalImage));

        when(imageRepository.findByRootImageIdOrderByCreatedAtDesc(100L))
                .thenReturn(List.of(editedImage1, editedImage2, invalidImage));

        when(s3Service.createPresignedGetUrl("edit-key-1"))
                .thenReturn("url-1");
        when(s3Service.createPresignedGetUrl("edit-key-2"))
                .thenReturn("url-2");

        // when
        List<EditImageHistoryResponse> result =
                imageService.getEditedImages(originalImageId, userId);

        // then
        assertEquals(2, result.size());

        assertEquals(2L, result.get(0).getImageId());
        assertEquals("url-1", result.get(0).getImageUrl());

        assertEquals(3L, result.get(1).getImageId());
        assertEquals("url-2", result.get(1).getImageUrl());

        verify(imageRepository).findById(originalImageId);
        verify(imageRepository)
                .findByRootImageIdOrderByCreatedAtDesc(100L);
    }

    @Test
    void 원본_이미지_없으면_편집_이미지_조회_실패() {
        when(imageRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            imageService.getEditedImages(1L, 10L);
        });
    }

    @Test
    void 다른_사용자의_원본_이미지면_조회_실패() {
        User owner = User.builder().id(1L).build();

        Image originalImage = Image.builder()
                .id(1L)
                .user(owner)
                .rootImageId(100L)
                .build();

        when(imageRepository.findById(1L))
                .thenReturn(Optional.of(originalImage));

        assertThrows(AccessDeniedException.class, () -> {
            imageService.getEditedImages(1L, 999L);
        });

        verify(imageRepository, never())
                .findByRootImageIdOrderByCreatedAtDesc(anyLong());
    }

    @Test
    void 편집된_이미지_없으면_빈_리스트_반환() {
        User user = User.builder().id(1L).build();

        Image originalImage = Image.builder()
                .id(1L)
                .user(user)
                .rootImageId(100L)
                .build();

        when(imageRepository.findById(1L))
                .thenReturn(Optional.of(originalImage));

        when(imageRepository.findByRootImageIdOrderByCreatedAtDesc(100L))
                .thenReturn(List.of());

        List<EditImageHistoryResponse> result =
                imageService.getEditedImages(1L, 1L);

        assertTrue(result.isEmpty());
        verify(s3Service, never()).createPresignedGetUrl(anyString());
    }



}