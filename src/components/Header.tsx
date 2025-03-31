import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { useUserInfoFromToken } from "../hooks/useUserInfoFromToken"; // 👈

const Header: React.FC = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const user = useUserInfoFromToken();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  

  return (
    <header className="w-full bg-blue-600 text-white py-4 px-6 shadow flex justify-between items-center">
      <h1 className="text-xl font-semibold">FreeTutor</h1>

      {token && user && (
        <div className="flex items-center gap-4">
          <span className="text-sm">
              👤 {user.login} - ({user.role})
              </span>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100"
          >
            Выйти
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
