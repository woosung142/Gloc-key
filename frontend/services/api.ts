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
  getHistory: async (page = 0, size = 50): Promise<UserImage[]> => {
    const response = await api.get(`/images/history?page=${page}&size=${size}`);
    const data = response.data;
    
    return (data.content || []).map((img: any) => ({
      id: String(img.imageId),
      title: img.prompt || "원본 자료",
      originalUrl: img.imageUrl,
      createdAt: img.createdAt,
      rootImageId: String(img.imageId),
      isEdit: false,
      hasEdited: img.hasEdited
    }));
  },

  getEditImageHistory: async (rootImageId: string): Promise<UserImage[]> => {
    const response = await api.get(`/images/history/${rootImageId}/edits`);
    const data = response.data || []; // List<EditImageHistoryResponse>

    return data.map((img: any, idx: number) => ({
      id: String(img.imageId),
      title: idx === 0 ? "원본" : "편집된 자료",
      originalUrl: img.imageUrl,
      createdAt: img.createdAt,
      parentImageId:
        idx === 0 ? undefined : img.parentImageId
          ? String(img.parentImageId)
          : undefined,
      rootImageId,
      isEdit: idx !== 0
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
