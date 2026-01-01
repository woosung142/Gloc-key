package gloc_key_project.gloc_key.dto;

import lombok.*;

@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ReissueResponse {
    private String newAccessToken;
    private String newRefreshToken;
}
