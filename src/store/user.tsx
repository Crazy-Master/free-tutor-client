import type { ReactNode } from "react";
import { useAuth } from "./auth";
import { authClient } from "../lib/http";

export const UserProvider = ({ children }: { children: ReactNode }) => children;
export const useUser = () => ({ user: useAuth().user, setUser: authClient.setUser, clearUser: authClient.dismissSession });
