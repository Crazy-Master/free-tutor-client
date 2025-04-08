import { useEffect, useState } from "react";
import { useUser } from "../store/user";
import { useUserInfoFromToken } from "../hooks/useUserInfoFromToken";
import AddStudentGroupModal from "../components/modals/AddStudentGroupModal";
import { api } from "../lib/api";
import PopupConfirm from "../components/ui/PopupConfirm";

interface DisciplineDto {
  disciplineId: number;
  discipline: string;
  typeExam: string;
}

interface StudentCardInfoDto {
  id: number;
  studentId: number;
  login: string;
  lastActiveAt: string | null;
}

const TeacherPage = () => {
  const { user } = useUser();
  const userInfo = useUserInfoFromToken();
  const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<
    number | null
  >(user?.information.lastDisciplineId ?? null);
  const [students, setStudents] = useState<StudentCardInfoDto[]>([]);
  const [showConfirmDiscipline, setShowConfirmDiscipline] = useState(false);
  const [pendingDisciplineId, setPendingDisciplineId] = useState<number | null>(
    null
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState("");
  const [studentToDelete, setStudentToDelete] =
    useState<StudentCardInfoDto | null>(null);

  // Загружаем дисциплины
  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        const res = await fetch("https://api-tutor-master.ru/api/disciplines");
        const data = await res.json();
        setDisciplines(data);
      } catch {
        setError("Ошибка загрузки дисциплин.");
      }
    };
    fetchDisciplines();
  }, []);

  // Загружаем студентов при смене дисциплины
  useEffect(() => {
    if (!selectedDisciplineId) return;

    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        const data = await api.getStudents(selectedDisciplineId);
        setStudents(data);
      } catch (e) {
        if (e instanceof Error) {
          console.error("Ошибка API:", e.message);
          setError("Ошибка загрузки списка учеников.");
        }
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedDisciplineId]);

  const handleDisciplineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = Number(e.target.value);
    if (newId !== selectedDisciplineId) {
      setPendingDisciplineId(newId);
      setShowConfirmDiscipline(true);
    }
  };

  const confirmDisciplineChange = () => {
    if (pendingDisciplineId !== null) {
      setSelectedDisciplineId(pendingDisciplineId);
    }
    setPendingDisciplineId(null);
    setShowConfirmDiscipline(false);
  };

  const cancelDisciplineChange = () => {
    setPendingDisciplineId(null);
    setShowConfirmDiscipline(false);
  };

  return (
    <div className="min-h-screen bg-background text-text p-6">
      {/* Верхняя панель */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <label className="text-sm mr-2">Активная дисциплина:</label>
          <select
            value={pendingDisciplineId ?? selectedDisciplineId ?? ""}
            onChange={handleDisciplineChange}
            className="border px-3 py-1 rounded"
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

        <div className="flex items-center gap-4">
          <span className="text-sm cursor-pointer underline">
            ID: {userInfo?.userId} – {userInfo?.login} – {userInfo?.role}
          </span>
          <button className="text-sm underline">⚙ Настройки</button>
        </div>
      </div>

      {/* Подтверждение смены дисциплины */}
      {showConfirmDiscipline && (
        <PopupConfirm
          message="Вы уверены, что хотите сменить дисциплину?"
          onConfirm={confirmDisciplineChange}
          onCancel={cancelDisciplineChange}
        />
      )}

      {/* Список учеников */}
      <h2 className="text-xl font-bold mb-3">Ученики</h2>
      {loadingStudents ? (
        <p>Загрузка учеников...</p>
      ) : (
        <div className="border rounded p-4 max-h-[400px] overflow-y-auto relative">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between border-b py-2 px-3 bg-primary/10 rounded mb-2"
            >
              <div>
                <p className="font-semibold text-sm">
                  id:{student.studentId} – {student.login}
                </p>
                <p className="text-xs text-gray-600">
                  {student.lastActiveAt ?? "неактивен"}
                </p>
              </div>
              <button
                onClick={() => setStudentToDelete(student)}
                className="bg-red-200 hover:bg-red-300 text-red-900 px-3 py-1 rounded"
              >
                ❌
              </button>
            </div>
          ))}

          {studentToDelete && (
            <PopupConfirm
              message={`Удалить ученика ${studentToDelete.login}?`}
              onConfirm={async () => {
                if (!studentToDelete) return;
                try {
                  await api.deleteStudentLink(studentToDelete.id);
                  setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
                } catch (e) {
                  if (e instanceof Error) {
                    setError(`Ошибка удаления: ${e.message}`);
                  }
                } finally {
                  setStudentToDelete(null);
                }
              }}
              onCancel={() => setStudentToDelete(null)}
            />
          )}

          <div className="sticky bottom-0 left-0 bg-background pt-4 pb-2 mt-4 border-t">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary text-white rounded w-full hover:opacity-90"
            >
              ➕ Добавить ученика
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {/* Модалка добавления */}
      {showAddModal && selectedDisciplineId && (
        <AddStudentGroupModal
          disciplineId={selectedDisciplineId}
          onClose={() => setShowAddModal(false)}
          onSuccess={(newStudent) => {
            setStudents((prev) => [...prev, newStudent]); // триггер useEffect
          }}
        />
      )}
    </div>
  );
};

export default TeacherPage;
