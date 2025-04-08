import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { useUserInfoFromToken } from "../hooks/useUserInfoFromToken";
import ThemeSwitcher from "./ui/ThemeSwitcher";

const Header: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const user = useUserInfoFromToken();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="w-full bg-primary text-background py-4 px-6 shadow flex justify-between items-center">
      <h1 className="text-xl font-semibold">FreeTutor</h1>

      {token && user && (
        <div className="flex items-center gap-4">
          <span className="text-sm">👤 {user.login} - ({user.role})</span>
          <ThemeSwitcher />
          <button
            onClick={handleLogout}
            className="bg-background text-primary px-3 py-1 rounded hover:opacity-80"
          >
            Выйти
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
