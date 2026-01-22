package gloc_key_project.gloc_key.dto;

import lombok.*;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DeleteUserResponse {
    private String message;
}
