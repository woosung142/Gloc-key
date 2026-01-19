
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
  edits: ImageEdit[];
  editsJson?: string;
  parentId?: string;
  parentTitle?: string;
  isEdit?: boolean;
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
