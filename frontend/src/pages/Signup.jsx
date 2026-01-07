import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../api/auth";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      setError("");
      await signup(username, password);
      
      alert("회원가입이 완료되었습니다. 로그인해주세요.");
      navigate("/login");
    } catch (e) {
      console.error(e);
      setError("회원가입에 실패했습니다. 아이디 중복 여부를 확인하세요.");
    }
  };

  return (
    <div>
      <h1>회원가입</h1>
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
      <button onClick={handleSignup}>가입하기</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>이미 계정이 있으신가요? <button onClick={() => navigate("/login")}>로그인으로 이동</button></p>
    </div>
  );
}