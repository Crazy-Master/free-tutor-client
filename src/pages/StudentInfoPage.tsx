import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { StudentInfoDto } from "../types/api-types";
import Header from "../components/Header";
import CompletedTopicsPanel from "../components/studentCard/CompletedTopicsPanel";
import StudentBasicInfoPanel from "../components/studentCard/StudentBasicInfoPanel";
import { useStudentStore } from "../store/studentStore";

type Panel =
  | "studentInfo"
  | "completedTopics"
  | "createHomework"
  | "unclearTasks"
  | "markCompleted"
  | "viewHomework"
  | "lessonTask"
  | "deleteStudent";

const StudentInfoPage = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { getStudentById } = useStudentStore();
  const studentCard = studentId ? getStudentById(+studentId) : null;

  const [studentInfo, setStudentInfo] = useState<StudentInfoDto | null>(null);
  const [activePanel, setActivePanel] = useState<Panel>("studentInfo");

  useEffect(() => {
    if (!studentId) return;
    api.getStudentInfo(+studentId).then(setStudentInfo);
  }, [studentId]);

  return (
    <div className="min-h-screen bg-background text-text">
      <Header />

      {/* Панель кнопок */}
      <div className="flex flex-wrap gap-2 p-4 border-b bg-gray-50">
        <button onClick={() => setActivePanel("studentInfo")}>👤 Информация</button>
        <button onClick={() => setActivePanel("completedTopics")}>📚 Пройденные темы</button>
        <button onClick={() => setActivePanel("createHomework")}>📝 Домашка</button>
        <button onClick={() => setActivePanel("unclearTasks")}>❓ Непонятные</button>
        <button onClick={() => setActivePanel("markCompleted")}>✅ Пройденные задачи</button>
        <button onClick={() => setActivePanel("viewHomework")}>📂 Посмотреть ДЗ</button>
        <button disabled className="opacity-50 cursor-not-allowed">🔒 Урок (в разработке)</button>
        <button onClick={() => setActivePanel("deleteStudent")} className="text-red-500">🗑️ Удалить</button>
      </div>

      {/* Контент */}
      <div className="p-4">
        {activePanel === "studentInfo" && studentCard && (
          <StudentBasicInfoPanel studentCard={studentCard} />
        )}

        {activePanel === "completedTopics" && studentInfo && (
          <CompletedTopicsPanel
            studentId={+studentId!}
            initialCompletedTopicIds={studentInfo.completedTopicIds ?? []}
            onUpdate={(updatedIds) =>
              setStudentInfo(
                (prev) => prev && { ...prev, completedTopicIds: updatedIds }
              )
            }
          />
        )}
      </div>
    </div>
  );
};

export default StudentInfoPage;
