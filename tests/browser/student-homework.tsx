// Isolated local preview; never imports App, authenticates, or calls the backend.
import { createRoot } from "react-dom/client";
import StudentPage from "../../src/pages/StudentPage";
import { api } from "../../src/lib/api";
import { createEmptyStudentInfo } from "../../src/utils/createEmptyStudentInfo";
import { HomeworkType, TaskType } from "../../src/types/api-types";
import "../../src/index.css";

window.fetch = async () => { throw new Error("Network disabled in fixture"); };
api.getDisciplines = async () => [{ disciplineId: 5, typeExam: "ОГЭ", discipline: "Физика" }];
api.getStudentAssignments = async () => [16, 17].map(id => ({
  id, studentId: 13, teacherId: id + 10, disciplineId: 5,
  information: { ...createEmptyStudentInfo(), homeworks: [{
    idHomework: 1, assignedAt: "2026-10-07T10:00:00Z", type: HomeworkType.Classic,
    taskIds: [825, 826].map(taskId => ({ id: taskId, type: TaskType.Forced })),
  }] },
}));
api.getTask = async id => ({ taskId: id, taskIdExternal: "demo", groupNumber: 1, typeResponseId: 1, disciplineId: 5,
  textContent: id === 825 ? "Тестовое условие: тело движется равномерно со скоростью 5 м/с. Какой путь оно пройдёт за 10 секунд?" : "Второе тестовое условие. Данные этого стенда не сохраняются в базу.",
});
createRoot(document.getElementById("root")!).render(<StudentPage />);
