import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import Button from "../components/Button";
import Card from "../components/Card";

const LoginPage = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login: saveToken } = useAuth();      // 👈 сохраняем токен в контекст
  const navigate = useNavigate();              // 👈 для перехода на /tasks

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("https://api-tutor-master.ru/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      if (response.status === 401) {
        setError("Неверный логин или пароль");
        return;
      }
    
      if (!response.ok) {
        setError("Ошибка сервера. Попробуйте позже.");
        return;
      }

      const data = await response.json();
      saveToken(data.tokenString);
      navigate("/tasks");

    } catch (err) {
      setError("Сервер недоступен. Проверьте подключение. "+err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Вход в систему</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Логин</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Пароль</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" className="w-full">Войти</Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
