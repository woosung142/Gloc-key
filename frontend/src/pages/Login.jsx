import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginAPI } from "../api/auth";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login); // Zustand login 함수 가져오기

  const handleLogin = async () => {
    try {
      setError("");

      const res = await loginAPI(username, password);
      const accessToken = res.headers["access"];
      if (!accessToken) throw new Error("access token missing");

      login(accessToken); // Zustand 상태 + localStorage 업데이트

      navigate("/"); // 로그인 성공 후 Main 페이지로 이동
    } catch (e) {
      console.error(e);
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div>
      <h1>로그인</h1>

      <input
        placeholder="아이디"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleLogin}>로그인</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
