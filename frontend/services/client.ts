import axios from "axios";

const api = axios.create({
  // baseURL이 환경변수라면 import.meta.env 사용, 아니라면 고정 주소 사용
  baseURL: "https://www.glok.store/api",
  // baseURL: "http://localhost:8080/api",
  withCredentials: true, // 쿠키(Refresh Token) 연동을 위해 필수
});

const reissueApi = axios.create({
  baseURL: "https://www.glok.store/api",
  withCredentials: true,
});

// 토큰을 보내지 않을 경로 정의
const noAuthPaths = ["/login", "/signup", "/reissue", "/logout"];

api.interceptors.request.use((config) => {
  // 현재 요청 URL이 noAuthPaths에 포함되어 있는지 확인
  const isNoAuthPath = noAuthPaths.some((path) => config.url?.endsWith(path));

  if (!isNoAuthPath) {
    const token = localStorage.getItem("visionary_token");
    if (token) {
      // 인증이 필요한 경로에만 'access' 헤더 추가
      config.headers['access'] = token; 
    }
  } else {
    // 인증이 필요 없는 경로라면 기존에 혹시 들어있을 수 있는 access 헤더 제거
    delete config.headers['access'];
  }
  
  return config;
});

// 2. 응답 인터셉터: 401 에러 시 토큰 재발급 로직
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 재시도한 적이 없는 요청일 때
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // /reissue 엔드포인트로 토큰 재발급 요청 (쿠키의 Refresh 토큰 사용)
        const res = await reissueApi.get("/reissue");

        // 백엔드에서 새 토큰을 'access' 헤더에 담아 준다고 가정 (백엔드 코드 기준)
        const newAccessToken = res.headers['access'];

        if (newAccessToken) {
          localStorage.setItem("visionary_token", newAccessToken);
          
          // 기존 요청의 헤더를 새 토큰으로 교체 후 다시 실행
          originalRequest.headers['access'] = newAccessToken;
          console.log("재발급 완료");
          return api(originalRequest);
        }
      } catch (reissueError) {
        // 재발급 실패 (Refresh 토큰 만료 등) 시 로그아웃 처리
        console.error("토큰 재발급 실패:", reissueError);
        localStorage.removeItem("visionary_token");
        window.location.href = "/login";
        return Promise.reject(reissueError);
      }
    }

    return Promise.reject(error);
  }
);
export default api;