// Local Vite-only visual fixture. Not imported by the production entry point.
// No real credentials, backend requests, or persisted authentication.
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import StudentInfoPage from "../../src/pages/StudentInfoPage";
import { api } from "../../src/lib/api";
import { authClient } from "../../src/lib/http";
import type { SessionState } from "../../src/lib/authClient";
import { useDisciplineStore } from "../../src/store/disciplineStore";
import { useDictionaryStore } from "../../src/store/dictionaryStore";
import { createEmptyStudentInfo } from "../../src/utils/createEmptyStudentInfo";
import "../../src/index.css";

window.fetch = async () => { throw new Error("Network is disabled in the layout fixture"); };
const state: SessionState = {
  token: `fixture.${btoa(JSON.stringify({ user_id: 12, login: "teacher_" + "longlogin".repeat(8), role: "teacher", exp: 4102444800 }))}.unsigned`,
  user: { email: "fixture@example.test", lastActiveAt: null, information: { lastDisciplineId: 5, studentIds: [], notes: {} } },
  status: "authenticated", error: null, boundary: "layout-fixture",
};
authClient.getSnapshot = () => state;
api.getDisciplines = async () => [
  { disciplineId: 5, typeExam: "ОГЭ", discipline: "Физика с очень длинным названием дисциплины" },
  { disciplineId: 1, typeExam: "ОГЭ", discipline: "Математика" },
];
api.getStudents = async () => [{ id: 16, studentId: 13, login: "student_" + "longlogin".repeat(8), lastActiveAt: null }];
api.getStudentInfo = async () => createEmptyStudentInfo();
api.updateStudentCompletedTopics = async () => {};
let ownPermission = false;
api.getSolutionAccess = async (_relationshipId, taskId) => ({ taskId, taskIdExternal: "EXTERNAL_" + "longid".repeat(12), ownPermission, hasAccess: ownPermission, correctAnswer: false, otherTeacherPermission: false });
api.grantSolutionAccess = async () => { ownPermission = true; };
api.revokeSolutionAccess = async () => { ownPermission = false; };
useDisciplineStore.setState({ disciplineId: 5 });
useDictionaryStore.setState({ loadedTopics: true, topics: [
  { topicId: 1, section: "Физика", topic: "Длинное название темы для проверки переноса на маленьком экране" },
  { topicId: 2, section: "Физика", topic: "БезПробелов".repeat(12) },
] });
createRoot(document.getElementById("root")!).render(
  <MemoryRouter initialEntries={["/student/13"]}><Routes>
    <Route path="/student/:studentId" element={<StudentInfoPage />} />
  </Routes></MemoryRouter>,
);
