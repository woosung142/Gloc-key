import { useState, useEffect } from "react";
import { logoutAPI } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { generateImageProcess, getImageResult } from "../api/image";
import { downloadImage } from "../utils/download";

export default function Main() {
  const navigate = useNavigate();

  // Zustand store에서 로그아웃 함수 가져오기
  const logout = useAuthStore((state) => state.logout);

  // 프롬프트 입력 상태
  const [prompt, setPrompt] = useState("");

  // 이미지 생성 job 상태: { jobId, status, imageUrl }
  const [job, setJob] = useState(null);

  // 최종 이미지 URL 상태
  const [imageUrl, setImageUrl] = useState(null);
  const [imageId, setImageId] = useState(null);

  // 에러 메시지 상태
  const [error, setError] = useState("");

  /**
   * 이미지 생성 요청
   * - prompt가 없으면 에러 표시
   * - 요청 성공 시 jobId를 상태에 저장
   */
  const handleImageGenerateProcess = async () => {
    if (!prompt) {
      setError("프롬프트를 입력해주세요");
      return;
    }

    // 이전 상태 초기화
    setError("");
    setJob(null);
    setImageUrl(null);

    try {
      const data = await generateImageProcess(prompt);
      // data 예시: { jobId: "uuid", message: "이미지 생성 시작" }

      setJob({ jobId: data.jobId, status: "PROCESSING", imageUrl: null });
    } catch (e) {
      console.error(e);
      setError("이미지 생성 요청 실패");
    }
  };

  const handleLogout = async () => {
  try {
    await logoutAPI(); // 서버 세션 무효화 요청
  } catch (e) {
    console.error("Logout failed", e);
  } finally {
    logout(); // Zustand 상태 초기화 및 토큰 삭제
    navigate("/login");
  }
};

const handleEditClick = () => {
    // 생성된 이미지 URL을 state에 담아 /edit 페이지로 이동
    navigate('/edit', { 
      state: { 
        imageUrl: imageUrl,
        imageId: imageId 
      } });
  };


  /**
   * jobId 존재 시 이미지 상태 폴링
   * - COMPLETED: imageUrl 상태 갱신
   * - FAILED: 에러 표시
   * - PROCESSING: 일정 시간 후 재시도
   */
  useEffect(() => {
    if (!job?.jobId) return;

    let canceled = false; // 언마운트 시 폴링 중단

    const checkStatus = async () => {
      if (canceled) return;

      try {
        const res = await getImageResult(job.jobId);
        // res 예시: { jobId, status, imageUrl }

        setJob(res); // job 상태 갱신

        if (res.status === "COMPLETED" && res.imageUrl) {
          setImageUrl(res.imageUrl); // 이미지 준비 완료
        } else if (res.status === "FAILED") {
          setError("이미지 생성 실패"); // 실패 처리
        } else {
          // PROCESSING이면 5초 후 재시도
          setTimeout(checkStatus, 5000);
        }
      } catch (err) {
        console.error(err);
        setError("이미지 상태 확인 실패");
      }
    };

    checkStatus();

    // 컴포넌트 언마운트 시 폴링 중단
    return () => {
      canceled = true;
    };
  }, [job?.jobId]);

  // 개발용: imageUrl 변동 시 콘솔에 출력
  useEffect(() => {
    if (imageUrl) {
      console.log("생성된 이미지 URL:", imageUrl);
    }
  }, [imageUrl]);

  return (
    <div>
      <h1>메인 페이지</h1>

      {/* 프롬프트 입력 */}
      <input
        placeholder="프롬프트 입력"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button onClick={handleImageGenerateProcess}>전송</button>

      {/* 에러 메시지 표시 */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* 이미지 생성 중 상태 표시 */}
      {job && !imageUrl && job.status === "PROCESSING" && (
        <p>이미지 생성 중...</p>
      )}

      {/* 생성된 이미지 표시 */}
      {/* {imageUrl && (
        <div>
          <h2>생성된 이미지</h2>
          <img
            src={imageUrl}
            alt="generated"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
      )} */}
      {imageUrl && (
        <div className="flex flex-col items-center gap-4 mt-6">
          <h2 className="text-xl font-bold">생성된 이미지</h2>
          <img
            src={imageUrl}
            alt="generated"
            className="rounded-lg shadow-lg"
            style={{ maxWidth: "100%", height: "auto" }}
          />
          
          <div className="flex gap-4">
            {/* 편집 페이지로 이동하는 버튼 */}
            <button 
              onClick={handleEditClick}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-bold"
            >
              이 이미지 편집하기
            </button>
            
            {/* 기존에 만들었던 다운로드 기능 */}
            <button 
              onClick={() => downloadImage(imageUrl)}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-bold"
            >
              원본 다운로드
            </button>
          </div>
        </div>
      )}
      <button onClick={() => navigate("/history")}>생성 내역 보기</button>

      <button onClick={handleLogout}>로그아웃</button>
    </div>
  );
}
