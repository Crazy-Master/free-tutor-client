import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import AutomaticAnswerPanel from "../src/components/student/AutomaticAnswerPanel";
import StudentPage from "../src/pages/StudentPage";
import { api } from "../src/lib/api";
import type { AnswerAttempt, SubmissionState } from "../src/types/answer-attempt";
import { HomeworkType, TaskType, type StudentToTeacherDto, type TaskDto } from "../src/types/api-types";
import { createEmptyStudentInfo } from "../src/utils/createEmptyStudentInfo";

vi.mock("../src/lib/api", () => ({ api: {
  getAnswerAttempts: vi.fn(), submitAnswer: vi.fn(), submitTest: vi.fn(),
  getStudentAssignments: vi.fn(), getDisciplines: vi.fn(), getTask: vi.fn(),
  getManualWorkHistory: vi.fn(), submitManualWork: vi.fn(), getManualWork: vi.fn(),
} }));
const uid = "719d8b01-52f9-47eb-a664-597672dfd3c6";
const attempt: AnswerAttempt = { id: "a", relationshipId: 17, homeworkUid: uid, taskId: 825, submission: "00120",
  submittedAt: "2026-10-16T10:00:00Z", appliedAt: null, result: null, superseded: false };
function show(extra: Partial<Parameters<typeof AutomaticAnswerPanel>[0]> = {}) {
  const callbacks = { onStateChange: vi.fn(), onAccepted: vi.fn(), onSaved: vi.fn() };
  const props = { relationshipId: 17, homeworkUid: uid, taskId: 825, mode: 2, isTest: false, submitted: false, completed: false,
    peerState: "ready" as SubmissionState, refreshKey: 0, ...callbacks, ...extra };
  return { ...render(<AutomaticAnswerPanel {...props} />), props, ...callbacks };
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(api.getAnswerAttempts).mockResolvedValue([]);
  vi.mocked(api.submitAnswer).mockResolvedValue({ ...attempt, appliedAt: attempt.submittedAt, result: 1 });
  vi.mocked(api.getManualWorkHistory).mockResolvedValue([]);
  vi.mocked(api.getDisciplines).mockResolvedValue([]);
});
afterEach(cleanup);

it("keeps leading zeros, blocks duplicate clicks, and displays the server's result", async () => {
  let finish!: (value: AnswerAttempt) => void;
  vi.mocked(api.submitAnswer).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  show();
  const input = await screen.findByLabelText("Ваш краткий ответ");
  await waitFor(() => expect((input as HTMLInputElement).disabled).toBe(false));
  expect(input.getAttribute("type")).toBe("text");
  fireEvent.change(input, { target: { value: "00120" } });
  fireEvent.click(screen.getByText("Проверить ответ"));
  fireEvent.click(screen.getByText("Отправка ответа…"));
  expect(api.submitAnswer).toHaveBeenCalledTimes(1);
  expect(vi.mocked(api.submitAnswer).mock.calls[0][3].answer).toBe("00120");
  await act(async () => { finish({ ...attempt, appliedAt: attempt.submittedAt, result: 1 }); });
  await screen.findByText("Неправильно");
  expect(screen.getByText("Ваш ответ: 00120")).toBeTruthy();
});
it("reuses the request ID after a network failure and creates a new ID after an edit", async () => {
  vi.mocked(api.submitAnswer).mockRejectedValueOnce(new Error("Связь прервалась"));
  show(); await waitFor(() => expect((screen.getByLabelText("Ваш краткий ответ") as HTMLInputElement).disabled).toBe(false));
  fireEvent.change(screen.getByLabelText("Ваш краткий ответ"), { target: { value: "00120" } });
  fireEvent.click(screen.getByText("Проверить ответ")); await screen.findByText("Связь прервалась");
  fireEvent.click(screen.getByText("Проверить ответ")); await screen.findByText("Неправильно");
  const calls = vi.mocked(api.submitAnswer).mock.calls;
  expect(calls[0]).toEqual(calls[1]);
  fireEvent.change(screen.getByLabelText("Ваш краткий ответ"), { target: { value: "00121" } });
  fireEvent.click(screen.getByText("Проверить ответ"));
  await waitFor(() => expect(api.submitAnswer).toHaveBeenCalledTimes(3));
  expect(calls[2][3].requestId).not.toBe(calls[0][3].requestId);
});
it("does not infer test correctness and marks the replaced version without counting it", async () => {
  vi.mocked(api.getAnswerAttempts).mockResolvedValue([{ ...attempt, id: "old", submission: "123" }]);
  vi.mocked(api.submitAnswer).mockResolvedValue(attempt);
  show({ isTest: true });
  await screen.findByText("Ваш ответ: 123");
  fireEvent.change(screen.getByLabelText("Ваш краткий ответ"), { target: { value: "00120" } });
  fireEvent.click(screen.getByText("Сохранить ответ для теста"));
  await screen.findByText("Заменён до сдачи теста — не учитывается");
  expect(screen.getByText("Ответ сохранён — результат после сдачи теста")).toBeTruthy();
  expect(screen.queryByText("Правильно")).toBeNull(); expect(screen.queryByText("Неправильно")).toBeNull();
});
it("reloads test history after final submission and notifies about acceptance", async () => {
  vi.mocked(api.getAnswerAttempts).mockResolvedValueOnce([attempt]).mockResolvedValue([{ ...attempt, result: 0, appliedAt: attempt.submittedAt }]);
  const view = show({ isTest: true });
  await screen.findByText("Ответ сохранён — результат после сдачи теста");
  view.rerender(<AutomaticAnswerPanel {...view.props} submitted={true} refreshKey={1} />);
  await screen.findByText("Правильно"); expect(view.onAccepted).toHaveBeenCalledTimes(1);
});
it("fails closed on history errors and supports explicit retry", async () => {
  vi.mocked(api.getAnswerAttempts).mockRejectedValueOnce(new Error("История недоступна"));
  show(); await screen.findByText("История недоступна");
  expect((screen.getByLabelText("Ваш краткий ответ") as HTMLInputElement).disabled).toBe(true);
  fireEvent.click(screen.getByText("Обновить историю ответов"));
  await waitFor(() => expect((screen.getByLabelText("Ваш краткий ответ") as HTMLInputElement).disabled).toBe(false));
});
it.each(["loading", "error", "pending", "accepted"] as SubmissionState[])("blocks submission while manual history state is %s", async peerState => {
  show({ peerState }); await screen.findByLabelText("Ваш краткий ответ");
  await waitFor(() => expect(api.getAnswerAttempts).toHaveBeenCalled());
  expect((screen.getByText("Проверить ответ") as HTMLButtonElement).disabled).toBe(true);
  expect(api.submitAnswer).not.toHaveBeenCalled();
});
it("hides the automatic form for manual or unconfigured tasks", async () => {
  const view = show({ mode: 3 }); await screen.findByText("Для задачи нужна ручная проверка преподавателем.");
  expect(screen.queryByLabelText("Ваш краткий ответ")).toBeNull();
  view.rerender(<AutomaticAnswerPanel {...view.props} mode={0} />);
  expect(screen.getByText(/Автоматическая проверка не настроена/)).toBeTruthy();
});
it("ignores a history response after unmount", async () => {
  let finish!: (value: AnswerAttempt[]) => void;
  vi.mocked(api.getAnswerAttempts).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const view = show(); view.unmount();
  await act(async () => { finish([{ ...attempt, result: 0 }]); });
  expect(view.onAccepted).not.toHaveBeenCalled();
});
it("loads older answers by page without duplicating existing rows", async () => {
  const items = Array.from({ length: 50 }, (_, n) => ({ ...attempt, id: String(n), submission: `old-${n}`, result: 1 as const }));
  vi.mocked(api.getAnswerAttempts).mockResolvedValueOnce(items).mockResolvedValueOnce([items[0], { ...attempt, id: "oldest", submission: "oldest" }]);
  show(); fireEvent.click(await screen.findByText("Показать более ранние ответы"));
  await screen.findByText("Ваш ответ: oldest"); expect(screen.getAllByText("Ваш ответ: old-0")).toHaveLength(1);
  expect(api.getAnswerAttempts).toHaveBeenLastCalledWith(17, uid, 825, 2);
});

function assignment(completed = false, submitted = false): StudentToTeacherDto {
  const homework = { idHomework: 1, homeworkUid: uid, assignedAt: attempt.submittedAt, submittedAt: submitted ? attempt.submittedAt : null,
    completedAt: completed ? attempt.submittedAt : null, type: HomeworkType.Test, taskIds: [{ id: 825, type: TaskType.Forced, completedAt: completed ? attempt.submittedAt : null }] };
  return { id: 17, studentId: 15, teacherId: 14, disciplineId: 5, information: { ...createEmptyStudentInfo(),
    homeworks: completed ? [] : [homework], completedHomeworks: completed ? [homework] : [] } };
}
it("keeps the test open, reveals the result and solution after submission, and refreshes completion", async () => {
  let submitted = false;
  vi.mocked(api.getStudentAssignments).mockImplementation(async () => [assignment(submitted, submitted)]);
  vi.mocked(api.getTask).mockImplementation(async () => ({ taskId: 825, taskIdExternal: "x", groupNumber: 1, disciplineId: 5,
    textContent: "Условие", checkingMode: 2, referenceAnswer: submitted ? "00120" : null } as TaskDto));
  vi.mocked(api.getAnswerAttempts).mockImplementation(async () => submitted ? [{ ...attempt, result: 0, appliedAt: attempt.submittedAt }] : [attempt]);
  vi.mocked(api.submitTest).mockImplementation(async () => { submitted = true; return { submitted: true }; });
  render(<StudentPage />);
  fireEvent.click(await screen.findByText("Открыть задание"));
  fireEvent.click(screen.getByText("Задача 1 · #825"));
  await screen.findByText("Ответ сохранён — результат после сдачи теста");
  expect(screen.queryByText("Посмотреть решение")).toBeNull();
  expect((screen.getByLabelText("Текст решения") as HTMLTextAreaElement).disabled).toBe(true);
  fireEvent.click(screen.getByText("Сдать тест на проверку"));
  await screen.findByText("Правильно"); await screen.findByText("Краткий ответ: 00120");
  expect(screen.getByText("Скрыть задание")).toBeTruthy();
  expect(screen.getByText(/Завершено · Назначено/)).toBeTruthy();
  expect(screen.queryByLabelText("Ваш краткий ответ")).toBeNull();
  expect(api.submitTest).toHaveBeenCalledWith(17, uid);
  expect(api.getTask).toHaveBeenCalledTimes(2);
});
it("reports incomplete test submission and leaves the button available for retry", async () => {
  vi.mocked(api.getStudentAssignments).mockResolvedValue([assignment()]);
  vi.mocked(api.submitTest).mockRejectedValue(new Error("Отправьте ответ по каждой задаче"));
  render(<StudentPage />); fireEvent.click(await screen.findByText("Открыть задание"));
  fireEvent.click(screen.getByText("Сдать тест на проверку")); await screen.findByText("Отправьте ответ по каждой задаче");
  expect((screen.getByText("Сдать тест на проверку") as HTMLButtonElement).disabled).toBe(false);
});
