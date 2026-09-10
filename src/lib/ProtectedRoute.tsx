import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth";
import { JSX } from "react";
import { useUserInfoFromToken } from "../hooks/useUserInfoFromToken";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { token } = useAuth();
  const userInfo = useUserInfoFromToken();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // если пользователь авторизован и на главном маршруте - редирект по роли
  if (
    location.pathname === "/" ||
    location.pathname === "/register" ||
    location.pathname === "/login"
  ) {
    switch (userInfo?.role) {
      case "teacher":
        return <Navigate to="/teacher" replace />;
      case "student":
        return <Navigate to="/student" replace />;
      case "admin":
        return <Navigate to="/admin" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
