import { useAuth } from "../store/auth";
import { tokenIdentity } from "../lib/authClient";

export const useUserInfoFromToken = () => tokenIdentity(useAuth().token);
