package gloc_key_project.gloc_key.dto;


import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EditImageHistoryResponse {
    private Long imageId;
    private String imageUrl;
    private LocalDateTime createdAt;
}
