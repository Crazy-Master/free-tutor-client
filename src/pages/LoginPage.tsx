import { useState } from "react";
import { useAuth } from "../store/auth";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useUser } from "../store/user";
import ErrorBox from "../components/ui/ErrorBox";
import { useDisciplineStore } from "../store/disciplineStore";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login: saveToken } = useAuth();
  const { setUser } = useUser();
  const { setDisciplineId } = useDisciplineStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

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
      setUser(data.userAuthDto);

      const lastId = data.userAuthDto.information?.lastDisciplineId;
      if (lastId) {
        setDisciplineId(lastId);
      }

      // 👇 Переход к "/" => сработает ProtectedRoute
      navigate("/");
    } catch (err) {
      setError("Сервер недоступен. Проверьте подключение. Ошибка:" + err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex justify-center items-center text-text">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Вход в систему</h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-[200px]">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
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
            <Button type="submit" className="w-full">Войти</Button>
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
        )}
      </Card>
    </div>
  );
};

export default LoginPage;
