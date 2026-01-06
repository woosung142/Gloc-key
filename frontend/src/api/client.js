import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Spring Boot 주소
  withCredentials: true,            // 쿠키/JWT 사용 시 중요
});

// 요청 인터셉터
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.access = token;
  }

  return config;
});

export default api;