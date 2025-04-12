import { useEffect, useState } from "react";
import { useUser } from "../store/user";
import { useUserInfoFromToken } from "../hooks/useUserInfoFromToken";
import { api } from "../lib/api";
import PopupConfirm from "../components/ui/PopupConfirm";
import Header from "../components/Header";
import StudentList from "../components/teacher/StudentList";
import ActionPanel from "../components/teacher/ActionPanel";
import SettingsPanel from "../components/teacher/SettingsPanel";
import AddStudentGroupModal from "../components/modals/AddStudentGroupModal";
import { useNavigate } from "react-router-dom";


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
  const [pendingDisciplineId, setPendingDisciplineId] = useState<number | null>(
    null
  );
  const [showConfirmDiscipline, setShowConfirmDiscipline] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState("");
  const pendingDiscipline = disciplines.find(
    (d) => d.disciplineId === pendingDisciplineId
  );
  const [panelView, setPanelView] = useState<
    "students" | "profile" | "settings"
  >("students");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        const res = await fetch("https://api-tutor-master.ru/api/disciplines");
        const data = await res.json();
        setDisciplines(data);
      } catch {
        setError("Ошибка загрузки дисциплин." + error);
      }
    };
    fetchDisciplines();
  }, []);

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
          setError("Ошибка загрузки списка учеников." + error);
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
    <div className="min-h-screen bg-background text-text">
      <Header
        disciplines={disciplines}
        selectedDisciplineId={selectedDisciplineId}
        pendingDisciplineId={pendingDisciplineId}
        onDisciplineChange={handleDisciplineChange}
        userInfo={userInfo}
      />

      {showConfirmDiscipline && (
        <PopupConfirm
          message={
            pendingDiscipline
              ? `Вы уверены, что хотите сменить дисциплину на: ${pendingDiscipline.typeExam} — ${pendingDiscipline.discipline}?`
              : "Вы уверены, что хотите сменить дисциплину?"
          }
          onConfirm={confirmDisciplineChange}
          onCancel={cancelDisciplineChange}
        />
      )}

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Левая колонка */}
        <div>
          {panelView === "students" && (
            <StudentList
              students={students}
              loading={loadingStudents}
              onDelete={async (id) => {
                try {
                  await api.deleteStudentLink(id);
                  setStudents((prev) => prev.filter((s) => s.id !== id));
                } catch (e) {
                  if (e instanceof Error)
                    setError("Ошибка удаления: " + e.message);
                }
              }}
              footer={
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-primary text-white rounded w-full hover:opacity-90"
                >
                  ➕ Добавить ученика
                </button>
              }
            />
          )}

          {panelView === "profile" && (
            <div className="p-4 border rounded shadow text-sm">
              👤 <strong>{user?.email}</strong>
              <p>ID: {userInfo?.userId}</p>
              <p>Login: {userInfo?.login}</p>
              <p>Роль: {userInfo?.role}</p>
            </div>
          )}

          {panelView === "settings" && <SettingsPanel />}
        </div>

        {/* Правая колонка */}
        <ActionPanel
          onShowStudents={() => setPanelView("students")}
          onShowProfile={() => setPanelView("profile")}
          onShowSettings={() => setPanelView("settings")}
          onOpenTaskBase={() => navigate("/tasks")}
        />
      </div>
      {showAddModal && selectedDisciplineId && (
  <AddStudentGroupModal
    disciplineId={selectedDisciplineId}
    onClose={() => setShowAddModal(false)}
    onSuccess={(newStudent) =>
      setStudents((prev) => [...prev, newStudent])
    }
  />
)}

    </div>
  );
};

export default TeacherPage;
