import { useAuth } from "../store/auth";
import { useUser } from "../store/user";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

const LogoutButton = () => {
  const { logout } = useAuth();
  const { clearUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.warn("Ошибка выхода:", e);
    }

    logout();
    clearUser();
    navigate("/"); 
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      🔒 Выйти
    </button>
  );
};

export default LogoutButton;
