import { useEffect } from "react";
import { authClient } from "../lib/http";

export const useAutoLogin = () => {
  useEffect(() => { void authClient.bootstrap(); }, []);
};
