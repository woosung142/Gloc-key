import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../hooks/useAuth";

// 로그인 여부를 검사해서
// 로그인 안 돼 있으면 /login으로 이동시키는 컴포넌트
export default function PrivateRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
