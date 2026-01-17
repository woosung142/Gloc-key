import api from "./client";
import { UserImage } from "../types";

export interface GenerateOptions {
  atmosphere: string;
  region: string;
  era: string;
}

export interface ImageGenerateResponse {
  imageUrl: string;
  jobId: string;
}

export const imageService = {
  // 1. 내역 조회 (백엔드 ImageController.getHistory 대응)
  getHistory: async (): Promise<UserImage[]> => {
    // 백엔드는 Page<ImageHistoryResponse>를 반환하므로 .content를 가져옵니다.
    const response = await api.get('/images/history?page=0&size=50');
    // const response = await api.get('/images/history');
    const data = response.data;
    
    // 데이터 필드 매핑 (백엔드 DTO -> 프론트엔드 타입)
    return (data.content || []).map((img: any) => ({
      id: String(img.imageId), // 백엔드는 imageId 사용
      title: img.prompt || "제목 없음",
      originalUrl: img.imageUrl,
      createdAt: img.createdAt,
      isEdit: img.imageUrl.includes('/edits/'), // URL 경로로 편집본 여부 판별
    }));
  },

  // 2. 이미지 생성 (백엔드 ImageController.generateImage 대응)
  generateEduImage: async (prompt: string, options: GenerateOptions): Promise<ImageGenerateResponse> => {
    const enhancedPrompt = `${prompt}, ${options.atmosphere}, ${options.region}, ${options.era} style`;
    
    const response = await api.post('/images/generate', {
      prompt: enhancedPrompt
    });
    
    // 백엔드에서 { imageUrl, jobId } 객체를 주므로 그대로 반환
    return response.data; 
  },

  // 2. 생성 상태 확인 (폴링용)
  checkGenerationStatus: async (jobId: string) => {
    const response = await api.get(`/images/status/${jobId}`);
    return response.data; // { imageId, jobId, status, imageUrl }
  },

  saveImageRecord: async (payload: { parentId: string; dataUrl: string }) => {
  // A. Pre-signed URL 요청
  const {
    data: { uploadUrl, uploadId },
  } = await api.get(`/uploads/images/${payload.parentId}/edit`);

  // B. DataURL → Blob
  const response = await fetch(payload.dataUrl);
  const blob = await response.blob();

  const s3Response = await fetch(uploadUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': 'image/png' },
  });

  if (!s3Response.ok) {
    throw new Error('S3 upload failed');
  }
  // D. 업로드 완료 알림
  return await api.post(`/uploads/images/edit/${uploadId}/complete`);
},


  // 4. 이미지 삭제 (백엔드 ImageController.deleteImage 대응)
  deleteImageRecord: async (imageId: string) => {
    return await api.delete(`/images/${imageId}`);
  }
};
