import { useEffect, useState } from "react";
import { useUser } from "../store/user";
import { useUserInfoFromToken } from "../hooks/useUserInfoFromToken";
import { useDisciplineStore } from "../store/disciplineStore";
import { api } from "../lib/api";
import StudentList from "../components/teacher/StudentList";
import ActionPanel from "../components/teacher/ActionPanel";
import SettingsPanel from "../components/teacher/SettingsPanel";
import AddStudentGroupModal from "../components/modals/AddStudentGroupModal";
import { useNavigate } from "react-router-dom";

interface StudentCardInfoDto {
  id: number;
  studentId: number;
  login: string;
  lastActiveAt: string | null;
}

const TeacherPage = () => {
  const { user } = useUser();
  const userInfo = useUserInfoFromToken();
  const navigate = useNavigate();

  const { disciplineId } = useDisciplineStore();

  const [students, setStudents] = useState<StudentCardInfoDto[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState("");
  const [panelView, setPanelView] = useState<"students" | "profile" | "settings">("students");

  useEffect(() => {
    if (!disciplineId) return;

    const fetchStudents = async () => {
      try {
        setLoadingStudents(true);
        const data = await api.getStudents(disciplineId);
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
  }, [disciplineId, error]);

  return (
    <div className="min-h-screen bg-background text-text">
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
                  className="px-4 py-2 bg-primary text-text_light rounded w-full hover:opacity-90"
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

      {showAddModal && disciplineId && (
        <AddStudentGroupModal
          disciplineId={disciplineId}
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
