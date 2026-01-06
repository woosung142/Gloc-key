import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";

export default function Login() {
  // 사용자 입력 상태 관리
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 로그인 성공 후 페이지 이동을 위한 훅
  const navigate = useNavigate();

  // 로그인 버튼 클릭 시 실행
  const handleLogin = async () => {
    try {
      // 기존 에러 메시지 초기화
      setError("");

      // 로그인 API 호출 (form-data 방식)
      const res = await login(username, password);

      // 응답 헤더에서 accessToken 추출
      const accessToken = res.headers["access"];

      // accessToken이 없는 경우 예외 처리
      if (!accessToken) {
        throw new Error("access token missing");
      }

      // accessToken을 로컬 스토리지에 저장
      localStorage.setItem("accessToken", accessToken);

      // 로그인 성공 후 메인 페이지로 이동
      navigate("/");
    } catch (e) {
      // 로그인 실패 또는 네트워크 오류 처리
      console.error(e);
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div>
      <h1>로그인</h1>

      {/* 아이디 입력 */}
      <input
        placeholder="아이디"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <br />

      {/* 비밀번호 입력 */}
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />

      {/* 로그인 버튼 */}
      <button onClick={handleLogin}>로그인</button>

      {/* 에러 메시지 표시 */}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
