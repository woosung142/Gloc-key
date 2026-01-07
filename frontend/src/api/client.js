import axios from "axios";
import { useAuthStore } from "../store/authStore";


const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Spring Boot 주소
  withCredentials: true,            // 쿠키/JWT 사용 시 중요
});

const noAuthPaths = ["/login", "/signup", "/reissue", "/logout"];

// 요청 인터셉터
api.interceptors.request.use((config) => {
  if (!noAuthPaths.some((path) => config.url.endsWith(path))) {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.access = token;
  }
  return config;
});

// 응답 인터셉터: 401 → access token 갱신
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/reissue`,
          {}, // 빈 body
          { withCredentials: true } // 쿠키 포함
        );

        const newAccessToken = res.headers["access"];
        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          originalRequest.headers.access = newAccessToken;
          return api(originalRequest); // 실패했던 요청 재시도
        }
      } catch (e) {
        const { logout } = useAuthStore.getState();
        logout();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;