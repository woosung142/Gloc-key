package gloc_key_project.gloc_key.service;

import gloc_key_project.gloc_key.customException.AuthException;
import gloc_key_project.gloc_key.dto.ChangePasswordRequest;
import gloc_key_project.gloc_key.dto.ChangePasswordResponse;
import gloc_key_project.gloc_key.entity.User;
import gloc_key_project.gloc_key.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;


    // 비밀번호 변경
    @Transactional
    public ChangePasswordResponse changePassword(ChangePasswordRequest request, Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AccessDeniedException("접근 권한이 없습니다."));

        if (!bCryptPasswordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AccessDeniedException("현재 비밀번호가 올바르지 않습니다.");
        }

        if (bCryptPasswordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
        }

        String newPassword = bCryptPasswordEncoder.encode(request.getNewPassword());
        user.changePassword(newPassword);

        return new ChangePasswordResponse("비밀번호 변경이 완료되었습니다.");
    }
}
