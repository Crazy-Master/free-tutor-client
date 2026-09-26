import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import { StudentInfoDto, StudentCardInfoDto } from "../types/api-types";
import { useDisciplineStore } from "../store/disciplineStore";
import Header from "../components/Header";
import CompletedTopicsPanel from "../components/studentCard/CompletedTopicsPanel";
import SolutionAccessPanel from "../components/studentCard/SolutionAccessPanel";
import StudentBasicInfoPanel from "../components/studentCard/StudentBasicInfoPanel";
import { useStudentStore } from "../store/studentStore";

type Panel =
  | "studentInfo"
  | "solutionAccess"
  | "completedTopics"
  | "createHomework"
  | "unclearTasks"
  | "markCompleted"
  | "viewHomework"
  | "lessonTask"
  | "deleteStudent";

const StudentInfoPage = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const disciplineId = useDisciplineStore(s => s.disciplineId);
  return <StudentInfoContent key={`${studentId}:${disciplineId}`} studentId={studentId} disciplineId={disciplineId} />;
};

const StudentInfoContent = ({ studentId, disciplineId }: { studentId?: string; disciplineId: number | null }) => {
  const [studentCard, setStudentCard] = useState<StudentCardInfoDto | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);

  const [studentInfo, setStudentInfo] = useState<StudentInfoDto | null>(null);
  const [activePanel, setActivePanel] = useState<Panel>("studentInfo");

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(""); setStudentCard(null); setStudentInfo(null);
    const load = async () => {
      try {
        if (!studentId || !Number.isSafeInteger(+studentId) || +studentId <= 0 || !disciplineId)
          throw new Error("Выберите дисциплину и корректную карточку ученика.");
        // URL identifies a user; API mutations identify the relationship in this discipline.
        const students = await api.getStudents(disciplineId);
        if (cancelled) return;
        useStudentStore.getState().setStudents(students);
        const card = students.find(s => s.studentId === +studentId);
        if (!card) throw new Error("Ученик не найден среди ваших учеников в выбранной дисциплине.");
        const info = await api.getStudentInfo(card.id);
        if (cancelled) return;
        setStudentCard(card); setStudentInfo(info);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Не удалось загрузить карточку.");
      } finally { if (!cancelled) setLoading(false); }
    };
    void load();
    return () => { cancelled = true; };
  }, [studentId, disciplineId, retry]);

  return (
    <div className="min-h-screen bg-background text-text">
      <Header />

      {/* Панель кнопок */}
      <div className="flex flex-wrap gap-2 p-4 border-b bg-gray-50">
        <button onClick={() => setActivePanel("studentInfo")}>👤 Информация о студенте</button>
        <button onClick={() => setActivePanel("completedTopics")}>📚 Пройденные темы</button>
        <button onClick={() => setActivePanel("solutionAccess")}>🔑 Доступ к решениям</button>
        <button onClick={() => setActivePanel("createHomework")}>📝 Сформировать ДЗ</button>
        <button onClick={() => setActivePanel("unclearTasks")}>❓ Непонятные задачи</button>
        <button onClick={() => setActivePanel("markCompleted")}>✅ Пройденные задачи</button>
        <button onClick={() => setActivePanel("viewHomework")}>📂 Посмотреть ДЗ</button>
        <button disabled className="opacity-50 cursor-not-allowed">🔒 Урок (в разработке)</button>
        <button onClick={() => setActivePanel("deleteStudent")} className="text-red-500">🗑️ Удалить</button>
      </div>

      {/* Контент */}
      <div className="p-4">
        {loading && <p role="status">Загрузка карточки…</p>}
        {error && <div role="alert">{error} <button onClick={() => setRetry(n => n + 1)}>Повторить</button></div>}
        {activePanel === "solutionAccess" && studentCard && (
          <SolutionAccessPanel key={studentCard.id} relationshipId={studentCard.id} />
        )}
        {activePanel === "studentInfo" && studentCard && (
          <StudentBasicInfoPanel studentCard={studentCard} />
        )}

        {activePanel === "completedTopics" && studentInfo && studentCard && (
          <CompletedTopicsPanel
            studentId={studentCard.id}
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
