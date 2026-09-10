import { useState } from "react";
import { authClient } from "../lib/http";

const LogoutButton = () => {
  const [loading, setLoading] = useState(false);
  return (
    <button disabled={loading} onClick={() => {
      setLoading(true);
      void authClient.logout();
    }} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
      {loading ? "Выход…" : "🔒 Выйти"}
    </button>
  );
};
export default LogoutButton;
