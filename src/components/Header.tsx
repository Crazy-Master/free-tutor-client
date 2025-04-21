import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDisciplineStore } from "../store/disciplineStore";
import { useUser } from "../store/user";
import { useUserInfoFromToken } from "../hooks/useUserInfoFromToken";
import PopupConfirm from "./ui/PopupConfirm";
import { api } from "../lib/api";
import { DisciplineDto } from "../types/api-types";
import { useStudentStore } from "../store/studentStore";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { studentId } = useParams();
  const { getStudentById } = useStudentStore();
  const studentCard = studentId ? getStudentById(+studentId) : null;

  const { disciplineId, setDisciplineId } = useDisciplineStore();
  const { user, setUser } = useUser();
  const userInfo = useUserInfoFromToken();

  const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);
  const [pendingDisciplineId, setPendingDisciplineId] = useState<number | null>(null);

  const showBackButton = location.pathname !== "/teacher";
  const isTasksPage = location.pathname === "/tasks";

  useEffect(() => {
    api.getDisciplines().then(setDisciplines);
  }, []);

  const confirmDisciplineChange = async () => {
    if (!user?.information || !pendingDisciplineId) return;

    const updatedInfo = {
      ...user.information,
      lastDisciplineId: pendingDisciplineId,
    };

    await api.updateUserInfo(updatedInfo);
    setDisciplineId(pendingDisciplineId);
    setUser({ ...user, information: updatedInfo });
    setPendingDisciplineId(null);
  };

  return (
    <header className="z-50 bg-primary text-text_light px-6 py-3 shadow flex justify-between items-center">
      <div className="flex items-center gap-4">
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="bg-white text-primary px-3 py-1 rounded hover:bg-secondary"
          >
            ← Назад
          </button>
        )}

        {!isTasksPage && (
          <>
            <select
              value={disciplineId ?? ""}
              onChange={(e) => setPendingDisciplineId(parseInt(e.target.value))}
              className="border px-3 py-1 rounded text-black"
            >
              <option value="" disabled>Выберите дисциплину</option>
              {disciplines.map((d) => (
                <option key={d.disciplineId} value={d.disciplineId}>
                  {d.typeExam} - {d.discipline}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      <div className="flex-1 text-center">
        {location.pathname.startsWith("/student/") && studentCard && (
          <span className="text-sm">
            ID: {studentCard.studentId} — {studentCard.login}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm cursor-pointer">
          ID: {userInfo?.userId} – {userInfo?.login} – {userInfo?.role}
        </span>
      </div>

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
