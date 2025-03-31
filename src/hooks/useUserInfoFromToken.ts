import { useAuth } from "../store/auth";

export const useUserInfoFromToken = () => {
  const { token } = useAuth();

  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    return {
      userId: parseInt(payload.user_id),
      login: payload.login,
      role: payload.role
    };
  } catch {
    return null;
  }
};
