import { create } from "zustand";

export const useAuthStore = create((set) => ({
  
    accessToken: localStorage.getItem("accessToken") || null, // 초기값
  
  login: (token) => {
    localStorage.setItem("accessToken", token); // 브라우저 저장
    set({ accessToken: token }); // Zustand 상태 업데이트
  },

  logout: () => {
    localStorage.removeItem("accessToken"); // 브라우저 제거
    set({ accessToken: null });
  },

  isLoggedIn: () => !!localStorage.getItem("accessToken"), // 로그인 여부 확인
}));
