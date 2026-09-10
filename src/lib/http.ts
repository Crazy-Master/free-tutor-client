import { AuthClient, SESSION_KEY } from "./authClient";

const fallback = new Map<string, string>();
let storageAvailable = true;
const storage = {
  getItem: (key: string) => {
    if (storageAvailable) try {
      const value = localStorage.getItem(key);
      if (value !== null) fallback.set(key, value); else fallback.delete(key);
      return value;
    } catch { storageAvailable = false; }
    return fallback.get(key) ?? null;
  },
  setItem: (key: string, value: string) => {
    fallback.set(key, value);
    if (storageAvailable) try { localStorage.setItem(key, value); } catch { storageAvailable = false; }
  },
  removeItem: (key: string) => {
    fallback.delete(key);
    if (storageAvailable) try { localStorage.removeItem(key); } catch { storageAvailable = false; }
  },
};
export const authClient = new AuthClient({
  baseUrl: (import.meta.env.VITE_API_BASE_URL || "https://api-tutor-master.ru").replace(/\/$/, ""),
  storage, fetch: (...args) => fetch(...args),
  lock: operation => navigator.locks ? navigator.locks.request("freetutor-auth", operation) : operation(),
});
window.addEventListener("storage", event => { if (event.key === SESSION_KEY) authClient.sync(); });
export const request = <T>(path: string, method = "GET", body?: unknown,
  options?: { auth?: boolean; format?: "auto" | "text" }) => authClient.request<T>(path, method, body, options);
