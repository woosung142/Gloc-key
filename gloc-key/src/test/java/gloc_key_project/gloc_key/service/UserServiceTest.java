package gloc_key_project.gloc_key.service;

import gloc_key_project.gloc_key.dto.ChangePasswordRequest;
import gloc_key_project.gloc_key.dto.ChangePasswordResponse;
import gloc_key_project.gloc_key.dto.DeleteUserResponse;
import gloc_key_project.gloc_key.entity.User;
import gloc_key_project.gloc_key.event.UserDeletedEvent;
import gloc_key_project.gloc_key.repository.ImageRepository;
import gloc_key_project.gloc_key.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ImageRepository imageRepository;

    @Mock
    private ApplicationEventPublisher applicationEventPublisher;

    @Mock
    private BCryptPasswordEncoder bCryptPasswordEncoder;


    @Test
    void 비밀번호_변경_성공() {
        // given
        Long userId = 1L;
        User user = mock(User.class);

        ChangePasswordRequest request =
                new ChangePasswordRequest("oldPw", "newPw");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(bCryptPasswordEncoder.matches("oldPw", user.getPassword())).thenReturn(true);
        when(bCryptPasswordEncoder.matches("newPw", user.getPassword())).thenReturn(false);
        when(bCryptPasswordEncoder.encode("newPw")).thenReturn("encodedNewPw");

        // when
        ChangePasswordResponse response = userService.changePassword(request, userId);

        // then
        verify(user).changePassword("encodedNewPw");
        assertThat(response.getMessage()).isEqualTo("비밀번호 변경이 완료되었습니다.");
    }

    @Test
    void 현재_비밀번호_틀리면_예외() {
        // given
        Long userId = 1L;
        User user = mock(User.class);

        ChangePasswordRequest request =
                new ChangePasswordRequest("wrongPw", "newPw");

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(bCryptPasswordEncoder.matches("wrongPw", user.getPassword()))
                .thenReturn(false);

        // when & then
        assertThatThrownBy(() ->
                userService.changePassword(request, userId))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("현재 비밀번호가 올바르지 않습니다.");
    }

    @Test
    void 회원탈퇴_성공시_S3삭제_이벤트가_발행() {
        // given
        Long userId = 1L;
        User user = mock(User.class);

        List<String> s3Keys = List.of(
                "generated-images/a.png",
                "generated-images/b.png"
        );

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(imageRepository.findS3KeysByUserId(userId)).thenReturn(s3Keys);

        // when
        DeleteUserResponse response = userService.deleteUser(userId);

        // then
        verify(imageRepository).deleteByUserId(userId);
        verify(userRepository).delete(user);

        ArgumentCaptor<UserDeletedEvent> captor =
                ArgumentCaptor.forClass(UserDeletedEvent.class);

        verify(applicationEventPublisher).publishEvent(captor.capture());

        UserDeletedEvent event = captor.getValue();
        List<String> actualKeys = event.getS3Keys();
        assertThat(actualKeys).containsExactlyElementsOf(s3Keys);



        assertThat(response.getMessage()).isEqualTo("회원탈퇴 완료");
    }


    @Test
    void 회원이_없으면_회원탈퇴시_예외가_발생(){
        // given
        Long userId = 1L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> userService.deleteUser(userId))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("접근 권한이 없습니다.");

        verify(applicationEventPublisher, never()).publishEvent(any());
    }

}