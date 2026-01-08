import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Main from "./pages/Main";
import History from "./pages/History"; 
import EditPage from './pages/EditPage';
import PrivateRoute from "./components/PrivateRoute";
import { useAuthStore } from "./store/authStore";

function App() {
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    // 앱이 처음 로드될 때 로컬 스토리지 확인
    const token = localStorage.getItem("accessToken");
    if (token) {
      // 토큰이 있다면 상태 업데이트 (Zustand 내부 logic 실행)
      login(token);
    }
  }, [login]);

  return (
    <BrowserRouter>
      <Routes>
        {/* 공개 경로 */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* 인증이 필요한 보호 경로 (PrivateRoute로 감싸기) */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Main />} />
          <Route path="/history" element={<History />} />
          <Route path="/edit" element={<EditPage />}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;