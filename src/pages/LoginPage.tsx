import { useState } from "react";
import { useAuth } from "../store/auth";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { authClient } from "../lib/http";
import { Navigate } from "react-router-dom";
import ErrorBox from "../components/ui/ErrorBox";

import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const session = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authClient.authenticate("/api/auth/login", { login, password });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось войти.");
    } finally {
      setIsLoading(false);
    }
  };

  if (session.status === "authenticated") return <Navigate to="/" replace />;

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
            {(error || session.error) && <ErrorBox message={error || session.error || ""} />}
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
