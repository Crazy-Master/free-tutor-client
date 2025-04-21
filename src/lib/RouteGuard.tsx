import { Navigate } from "react-router-dom";
import { useUserInfoFromToken } from "../hooks/useUserInfoFromToken";
import { JSX } from "react";

interface Props {
  children: JSX.Element;
  role: "admin" | "teacher" | "student";
}

const RouteGuard = ({ children, role }: Props) => {
  const user = useUserInfoFromToken();

  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />;

  return children;
};

export default RouteGuard;
