import { useSyncExternalStore, type ReactNode } from "react";
import { authClient } from "../lib/http";

export const AuthProvider = ({ children }: { children: ReactNode }) => children;
export const useAuth = () => useSyncExternalStore(authClient.subscribe, authClient.getSnapshot);
export const getToken = () => authClient.getSnapshot().token;
