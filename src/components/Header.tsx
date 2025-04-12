import { DisciplineDto } from "../types/api-types";
import { useNavigate } from "react-router-dom";

interface UserInfoFromToken {
  userId: number;
  login: string;
  role: string;
}

interface HeaderProps {
  disciplines?: DisciplineDto[];
  selectedDisciplineId?: number | null;
  pendingDisciplineId?: number | null;
  onDisciplineChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  userInfo: UserInfoFromToken | null;
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function Header({
  disciplines,
  selectedDisciplineId,
  pendingDisciplineId,
  onDisciplineChange,
  userInfo,
  showBackButton = false,
  onBack,
}: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="bg-primary text-white px-6 py-3 shadow flex justify-between items-center">
      <div>
        {showBackButton ? (
          <button
            onClick={onBack ?? (() => navigate(-1))}
            className="bg-white text-primary px-3 py-1 rounded hover:bg-gray-100"
          >
            ← Назад
          </button>
        ) : (
          <>
            <select
              value={pendingDisciplineId ?? selectedDisciplineId ?? ""}
              onChange={onDisciplineChange}
              className="border px-3 py-1 rounded text-black"
            >
              <option value="" disabled>
                Выберите дисциплину
              </option>
              {disciplines?.map((d) => (
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
    </header>
  );
}
