package gloc_key_project.gloc_key.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EditImageUploadUrlResponse {
    private String uploadId;
    private String uploadUrl;
    private String s3Key;
}
