import { useUser } from "../store/user";
import { useUserInfoFromToken } from "./useUserInfoFromToken";

export const useUserInfo = () => {
  const { user } = useUser();
  const fromToken = useUserInfoFromToken();

  if (!user || !user.information || !fromToken) {
    return null;
  }

  return {
    userId: fromToken.userId,
    login: fromToken.login,
    role: fromToken.role,
    lastDisciplineId: user.information.lastDisciplineId,
    user,
  };
};
