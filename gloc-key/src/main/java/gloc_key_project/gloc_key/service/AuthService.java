package gloc_key_project.gloc_key.service;

import gloc_key_project.gloc_key.dto.Signup_request;
import gloc_key_project.gloc_key.entity.User;
import gloc_key_project.gloc_key.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;


    public void SignupProcess(Signup_request signupRequest) {

        String username = signupRequest.getUsername();
        String password = signupRequest.getPassword();

        if(userRepository.existsByUsername(username)) {
            return;
        }

        User userEntity = User.builder()
                .username(username)
                .password(bCryptPasswordEncoder.encode(password))
                .role("ROLE_USER")
                .build();

        userRepository.save(userEntity);

    }
}
