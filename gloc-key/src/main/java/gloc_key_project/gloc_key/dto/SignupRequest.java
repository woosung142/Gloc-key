package gloc_key_project.gloc_key.dto;

import lombok.*;

@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SignupRequest {
    private String username;
    private String email;
    private String password;
}
