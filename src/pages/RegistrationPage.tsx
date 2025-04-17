import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { useUser } from "../store/user";
import { useDisciplineStore } from "../store/disciplineStore";
import { dictionaryService } from "../services/dictionaryService";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ErrorBox from "../components/ui/ErrorBox";

interface DisciplineDto {
  disciplineId: number;
  discipline: string;
  typeExam: string;
}

const RegistrationPage = () => {
  const navigate = useNavigate();
  const { login: saveToken } = useAuth();
  const { setUser } = useUser();
  const { setDisciplineId } = useDisciplineStore();

  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("");
  const [disciplineId, setDisciplineIdLocal] = useState<number | null>(null);
  const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isPasswordValid = /^(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);
  const isPasswordMatch = password === confirmPassword;

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        const response = await fetch("https://api-tutor-master.ru/api/disciplines");
        if (!response.ok) throw new Error("Ошибка загрузки дисциплин");
        const data = await response.json();
        setDisciplines(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDisciplines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isPasswordValid) {
      setError("Пароль должен содержать минимум 6 символов, одну заглавную букву и одну цифру.");
      return;
    }

    if (!isPasswordMatch) {
      setError("Пароли не совпадают.");
      return;
    }

    try {
      setLoading(true);

      const information = {
        lastDisciplineId: role === "teacher" && disciplineId ? disciplineId : 0,
        studentIds: [],
        notes: {},
      };

      const response = await fetch("https://api-tutor-master.ru/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login,
          email,
          password,
          role: role === "student" ? 0 : 1,
          information,
        }),
      });

      if (!response.ok) {
        let errorMsg = "Ошибка регистрации.";
        try {
          const data = await response.json();
          if (data?.message) errorMsg = data.message;
        } catch {}
        setError(errorMsg);
        return;
      }

      const data = await response.json();
      saveToken(data.tokenString);
      setUser(data.userAuthDto);

      const lastId = data.userAuthDto.information?.lastDisciplineId;
      if (lastId) {
        setDisciplineId(lastId);
        dictionaryService.reset();
      }

      const payload = JSON.parse(atob(data.tokenString.split(".")[1]));
      const userRole = payload.role;

      if (userRole === "student") {
        navigate("/student");
      } else if (userRole === "teacher") {
        navigate("/teacher");
      } else if (userRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Ошибка подключения к серверу." + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text flex justify-center items-center px-4">
      <Card className="w-full max-w-lg relative">
        <button
          className="absolute top-4 left-4 text-sm text-primary underline"
          onClick={() => navigate("/")}
        >
          ← Назад
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Регистрация</h2>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block mb-1">Логин</label>
            <input
              type="text"
              placeholder="Придумайте логин"
              className="w-full border rounded px-3 py-2"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              placeholder="Введите почту"
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1">Пароль</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Придумайте пароль"
                className="w-full border rounded px-3 py-2 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-sm text-gray-500"
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
            {!isPasswordValid && password && (
              <p className="text-xs text-red-500 mt-1">
                Минимум 6 символов, заглавная буква и цифра
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1">Подтвердите пароль</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Подтвердите введённый пароль"
                className="w-full border rounded px-3 py-2 pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-sm text-gray-500"
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
            {confirmPassword && !isPasswordMatch && (
              <p className="text-xs text-red-500 mt-1">Пароли не совпадают</p>
            )}
          </div>

          <div>
            <label className="block mb-1">Роль</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setDisciplineIdLocal(null);
              }}
              required
            >
              <option value="" disabled>
                Выберите роль
              </option>
              <option value="student">Студент</option>
              <option value="teacher">Преподаватель</option>
            </select>
          </div>

          {role === "teacher" && (
            <div>
              <label className="block mb-1">Дисциплина</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={disciplineId ?? ""}
                onChange={(e) => setDisciplineIdLocal(Number(e.target.value))}
                required
              >
                <option value="" disabled>
                  Выберите дисциплину
                </option>
                {disciplines.map((d) => (
                  <option key={d.disciplineId} value={d.disciplineId}>
                    {d.typeExam} - {d.discipline}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && <ErrorBox message={error} />}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default RegistrationPage;
