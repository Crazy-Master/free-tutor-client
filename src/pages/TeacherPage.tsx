import { useState } from "react";
import { useUser } from "../store/user";
import { useUserInfoFromToken } from "../hooks/useUserInfoFromToken";
import { useDisciplineStore } from "../store/disciplineStore";
import { api } from "../lib/api";
import StudentList from "../components/teacher/StudentList";
import ActionPanel from "../components/teacher/ActionPanel";
import SettingsPanel from "../components/teacher/SettingsPanel";
import AddStudentGroupModal from "../components/modals/AddStudentGroupModal";
import { useNavigate } from "react-router-dom";
import { useStudentStore } from "../store/studentStore";
import { useLoadStudents } from "../hooks/useLoadStudents";

const TeacherPage = () => {
  const { user } = useUser();
  const userInfo = useUserInfoFromToken();
  const navigate = useNavigate();
  const { disciplineId } = useDisciplineStore();
  const { students, setStudents } = useStudentStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [panelView, setPanelView] = useState<"students" | "profile" | "settings">("students");

  const { loading } = useLoadStudents();

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {panelView === "students" && (
            <StudentList
              students={students}
              loading={loading}
              onDelete={async (id) => {
                try {
                  await api.deleteStudentLink(id);
                  setStudents(students.filter((s) => s.id !== id));
                } catch (e) {
                  if (e instanceof Error)
                    console.error("Ошибка удаления: " + e.message);
                }
              }}
              onOpenStudent={(id) => navigate(`/student/${id}`)}
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
            setStudents([...students, newStudent])
          }
        />
      )}
    </div>
  );
};

export default TeacherPage;
