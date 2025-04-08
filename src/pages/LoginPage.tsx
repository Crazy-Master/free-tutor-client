import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useUser } from "../store/user";
import ErrorBox from "../components/ui/ErrorBox";


const LoginPage = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login: saveToken } = useAuth();
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        "https://api-tutor-master.ru/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ login, password }),
        }
      );

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
      setUser(data.userAuthDto);

      const tokenPayload = JSON.parse(atob(data.tokenString.split(".")[1]));
      const role = tokenPayload.role;

      if (role === "student") {
        navigate("/student");
      } else if (role === "teacher") {
        navigate("/teacher");
      } else if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Сервер недоступен. Проверьте подключение." + err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex justify-center items-center text-text">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Вход в систему</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Логин</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 bg-white text-black"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Пароль</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 bg-white text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <ErrorBox message={error} />}
          <Button type="submit" className="w-full">
            Войти
          </Button>
          <div className="text-sm mt-2 text-center">
            Ещё нет аккаунта?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-primary cursor-pointer underline"
            >
              Зарегистрироваться
            </span>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
