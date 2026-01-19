
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface ImageEdit {
  id: string;
  timestamp: string;
  imageUrl: string;
  editsJson: string;
}

export interface UserImage {
  id: string;
  originalUrl: string;
  createdAt: string;
  title: string;
  // --- 계보 관련 필드 추가 ---
  rootImageId: string;    // 그룹화를 위한 최상위 ID
  parentImageId?: string; // 직계 부모 ID
  hasEdited?: boolean;    // 편집본 존재 여부 (선택 사항)
  isEdit?: boolean;
  // -----------------------
  edits: ImageEdit[];
  editsJson?: string;
  parentId?: string; // 기존 필드 유지
  parentTitle?: string;
}

export interface KonvaElement {
  id: string;
  type: 'image' | 'bubble';
  bubbleType?: 'oval' | 'cloud' | 'rect' | 'scroll' | 'shout' | 'thought';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  src?: string;
  text?: string;
  fontSize?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  flipTail?: boolean; // 꼬리 좌우 반전
}
