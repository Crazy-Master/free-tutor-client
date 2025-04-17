import React, { useEffect, useState } from "react";
import { useDisciplineStore } from "../store/disciplineStore";
import { DisciplineDto } from "../types/api-types";
import { api } from "../lib/api";
import { useNavigate, useLocation } from "react-router-dom";
import { UserInfoDto, useUser } from "../store/user";
import PopupConfirm from "./ui/PopupConfirm";
import { useUserInfoFromToken } from "../hooks/useUserInfoFromToken";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { disciplineId, setDisciplineId } = useDisciplineStore();
  const { user, setUser } = useUser();
  const userInfo = useUserInfoFromToken();

  const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);
  const [pendingDisciplineId, setPendingDisciplineId] = useState<number | null>(
    null
  );

  const showBackButton = location.pathname !== "/teacher";
  const isTasksPage = location.pathname === "/tasks";

  useEffect(() => {
    api.getDisciplines().then(setDisciplines);
  }, []);

  const confirmDisciplineChange = async () => {
    if (!user?.information || !pendingDisciplineId) return;

    const updatedInfo: UserInfoDto = {
      ...user.information,
      lastDisciplineId: pendingDisciplineId,
    };

    await api.updateUserInfo(updatedInfo);
    setDisciplineId(pendingDisciplineId);
    setUser({ ...user, information: updatedInfo });
    setPendingDisciplineId(null);
  };

  const cancelDisciplineChange = () => {
    setPendingDisciplineId(null);
  };

  const handleDisciplineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = parseInt(e.target.value);
    if (newId !== disciplineId) {
      setPendingDisciplineId(newId);
    }
  };

  return (
    <header className="z-50 bg-primary text-text_light px-6 py-3 shadow flex justify-between items-center">
      <div className="flex items-center gap-4">
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="bg-white text-primary px-3 py-1 rounded hover:bg-gray-100"
          >
            ← Назад
          </button>
        )}

        {!isTasksPage && (
          <>
            <label className="text-sm mr-2"></label>
            <select
              value={disciplineId ?? ""}
              onChange={handleDisciplineChange}
              className="border px-3 py-1 rounded text-black"
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
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm cursor-pointer">
          ID: {userInfo?.userId} – {userInfo?.login} – {userInfo?.role}
        </span>
      </div>

      {pendingDisciplineId && (
        <PopupConfirm
          message={`Вы уверены, что хотите сменить дисциплину на "${
            disciplines.find((d) => d.disciplineId === pendingDisciplineId)
              ?.discipline ?? "выбранную"
          }"?`}
          onConfirm={confirmDisciplineChange}
          onCancel={cancelDisciplineChange}
        />
      )}
    </header>
  );
};

export default Header;
