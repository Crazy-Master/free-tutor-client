import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDisciplineStore } from "../store/disciplineStore";
import { useUserInfo } from "../hooks/useUserInfo";
import { useStudentStore } from "../store/studentStore";
import PopupConfirm from "./ui/PopupConfirm";
import { api } from "../lib/api";
import { DisciplineDto } from "../types/api-types";
import { useUser } from "../store/user";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const { studentId } = useParams();
  const { getStudentById } = useStudentStore();
  const studentCard = studentId ? getStudentById(+studentId) : null;

  const { disciplineId, setDisciplineId } = useDisciplineStore();
  const userInfo = useUserInfo(); 
  
  const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);
  const [pendingDisciplineId, setPendingDisciplineId] = useState<number | null>(null);

  const showBackButton = location.pathname !== "/teacher";
  const isTasksPage = location.pathname === "/tasks";

  useEffect(() => {
    let cancelled = false;
    void api.getDisciplines().then(data => { if (!cancelled) setDisciplines(data); })
      .catch(error => { if (!cancelled) setError(error instanceof Error ? error.message : "Не удалось загрузить дисциплины."); });
    return () => { cancelled = true; };
  }, []);

  const confirmDisciplineChange = async () => {
    if (!userInfo || !userInfo.user || !pendingDisciplineId) return;

    const updatedInfo = {
      ...userInfo.user.information,
      lastDisciplineId: pendingDisciplineId,
    };

    try {
      await api.updateUserInfo(updatedInfo);
      setUser({ ...userInfo.user, information: updatedInfo });
      setDisciplineId(pendingDisciplineId);
      setPendingDisciplineId(null);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось сменить дисциплину.");
    }
  };

  return (
    <header className="z-50 bg-primary text-text_light px-4 sm:px-6 py-3 shadow grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="min-h-11 shrink-0 bg-white text-primary px-3 py-2 rounded hover:bg-secondary"
          >
            ← Назад
          </button>
        )}

        {!isTasksPage && (
          <select
            aria-label="Дисциплина"
            value={disciplineId ?? ""}
            onChange={(e) => setPendingDisciplineId(parseInt(e.target.value))}
            className="min-h-11 min-w-0 w-full border px-2 py-2 rounded text-black"
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
        )}
      </div>

      <div className="min-w-0 break-words empty:hidden lg:text-center">
        {location.pathname.startsWith("/student/") && studentCard && (
          <span className="text-sm">
            ID: {studentCard.studentId} — {studentCard.login}
          </span>
        )}
      </div>

      <div className="min-w-0 break-words empty:hidden lg:text-right">
        {userInfo && (
          <span className="text-sm">
            ID: {userInfo.userId} – {userInfo.login} – {userInfo.role}
          </span>
        )}
      </div>

      {error && <p role="alert" className="text-sm min-w-0 break-words lg:col-span-3">{error}</p>}
      {pendingDisciplineId && (
        <PopupConfirm
          message={`Вы уверены, что хотите сменить дисциплину?`}
          onConfirm={confirmDisciplineChange}
          onCancel={() => setPendingDisciplineId(null)}
        />
      )}
    </header>
  );
};

export default Header;
