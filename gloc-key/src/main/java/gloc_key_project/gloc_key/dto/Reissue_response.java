package gloc_key_project.gloc_key.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Reissue_response {
    private String newAccessToken;
    private String newRefreshToken;
}
