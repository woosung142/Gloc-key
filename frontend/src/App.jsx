import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Main from "./pages/Main";
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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Main />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;