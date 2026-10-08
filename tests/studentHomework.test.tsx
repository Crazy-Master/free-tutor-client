import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import StudentPage from "../src/pages/StudentPage";
import { api } from "../src/lib/api";
import { createEmptyStudentInfo } from "../src/utils/createEmptyStudentInfo";
import { HomeworkType, TaskType, type StudentToTeacherDto, type TaskDto } from "../src/types/api-types";

vi.mock("../src/lib/api", () => ({ api: { getStudentAssignments: vi.fn(), getDisciplines: vi.fn(), getTask: vi.fn(), getManualWorkHistory: vi.fn() } }));
function record(id = 16, taskId = 825): StudentToTeacherDto {
  return { id, studentId: 13, teacherId: 12, disciplineId: 5, information: {
    ...createEmptyStudentInfo(), homeworks: [{ idHomework: 1, assignedAt: "2026-10-07T10:00:00Z", type: HomeworkType.Classic, taskIds: [{ id: taskId, type: TaskType.Forced }] }],
  } };
}
const task = (id: number): TaskDto => ({ taskId: id, taskIdExternal: "ext", textContent: `Условие ${id}`, groupNumber: 1, typeResponseId: 1, disciplineId: 5 });
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(api.getDisciplines).mockResolvedValue([{ disciplineId: 5, typeExam: "ОГЭ", discipline: "Физика" }]);
  vi.mocked(api.getStudentAssignments).mockResolvedValue([record()]);
  vi.mocked(api.getTask).mockImplementation(async id => task(id));
});
afterEach(cleanup);
it("refreshes the authorized solution once after acceptance, without a reload loop", async () => {
  const data = record();
  data.information.homeworks[0].homeworkUid = "719d8b01-52f9-47eb-a664-597672dfd3c6";
  vi.mocked(api.getStudentAssignments).mockResolvedValue([data]);
  vi.mocked(api.getManualWorkHistory).mockResolvedValue([{ id: "work", relationshipId: 16, homeworkUid: data.information.homeworks[0].homeworkUid,
    homeworkNumber: 1, taskId: 825, studentId: 13, teacherId: 12, text: "", images: [], status: 1, comment: "", reviewedAt: null, submittedAt: "2026-10-08T12:00:00Z" }]);
  vi.mocked(api.getTask).mockResolvedValue({ ...task(825), problemSolving: { shortAnswer: 42, textSolution: "Разрешённое решение" } });
  render(<StudentPage />);
  fireEvent.click(await screen.findByText("Открыть задание"));
  fireEvent.click(screen.getByText("Задача 1 · #825"));
  await screen.findByText("Зачтено ·", { exact: false });
  await act(async () => {});
  expect(screen.getByText("Разрешённое решение")).toBeTruthy();
  expect(api.getTask).toHaveBeenCalledTimes(2);
  // React can batch the cached task response and avoid unmounting the panel.
  expect(vi.mocked(api.getManualWorkHistory).mock.calls.length).toBeGreaterThanOrEqual(1);
  expect(vi.mocked(api.getManualWorkHistory).mock.calls.length).toBeLessThanOrEqual(2);
});
it("loads own list without a client-supplied student ID; tasks are loaded only on demand", async () => {
  render(<StudentPage />);
  await screen.findByText("Домашнее задание №1");
  expect(api.getStudentAssignments).toHaveBeenCalledWith();
  expect(api.getTask).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("Открыть задание"));
  fireEvent.click(screen.getByText("Задача 1 · #825"));
  await screen.findByText("Условие 825");
  expect(api.getTask).toHaveBeenCalledWith(825);
});
it("keeps duplicate homework numbers in different relationships separate", async () => {
  vi.mocked(api.getStudentAssignments).mockResolvedValue([record(), record(17, 826)]);
  render(<StudentPage />);
  const cards = await screen.findAllByRole("article");
  fireEvent.click(within(cards[0]).getByText("Открыть задание"));
  fireEvent.click(screen.getByText("Задача 1 · #825"));
  await screen.findByText("Условие 825");
  fireEvent.click(within(cards[1]).getByText("Открыть задание"));
  expect(screen.queryByText("Условие 825")).toBeNull();
  fireEvent.click(screen.getByText("Задача 1 · #826"));
  await screen.findByText("Условие 826");
});
it("shows empty list and tolerates a failed discipline dictionary", async () => {
  vi.mocked(api.getStudentAssignments).mockResolvedValue([]);
  vi.mocked(api.getDisciplines).mockRejectedValue(new Error("offline"));
  render(<StudentPage />);
  await screen.findByText(/Домашних заданий пока нет/);
});
it("shows load failure, retries, and uses discipline ID as fallback", async () => {
  vi.mocked(api.getStudentAssignments).mockRejectedValueOnce(new Error("Сеть недоступна"));
  vi.mocked(api.getDisciplines).mockRejectedValue(new Error("offline"));
  render(<StudentPage />);
  await screen.findByRole("alert");
  fireEvent.click(screen.getByText("Повторить загрузку"));
  await screen.findByText(/Дисциплина #5/);
});
it("shows all three statuses and empty homework without inventing tasks", async () => {
  const data = record();
  data.information.inProgressHomeworks = [{ ...data.information.homeworks[0], taskIds: [] }];
  data.information.completedHomeworks = [{ ...data.information.homeworks[0], completedAt: "2026-10-08T10:00:00Z" }];
  vi.mocked(api.getStudentAssignments).mockResolvedValue([data]);
  render(<StudentPage />);
  const cards = await screen.findAllByRole("article");
  expect(cards).toHaveLength(3);
  expect(screen.getByText(/В работе ·/)).toBeTruthy();
  expect(screen.getByText(/Завершено ·/)).toBeTruthy();
  fireEvent.click(within(cards[1]).getByText("Открыть задание"));
  expect(screen.getByText(/В этом задании пока нет задач/)).toBeTruthy();
});
it("does not render answer/solution fields or interpret task text as HTML", async () => {
  vi.mocked(api.getTask).mockResolvedValue({ ...task(825), textContent: "<b>condition</b>", answerTask: "SECRET", problemSolving: undefined });
  render(<StudentPage />);
  fireEvent.click(await screen.findByText("Открыть задание"));
  fireEvent.click(screen.getByText("Задача 1 · #825"));
  const text = await screen.findByText("<b>condition</b>");
  expect(text.querySelector("b")).toBeNull();
  expect(screen.queryByText("SECRET")).toBeNull();
  expect(screen.queryByText("PRIVATE")).toBeNull();
});
it("handles task failure and ignores a response after its homework was closed", async () => {
  vi.mocked(api.getTask).mockRejectedValueOnce(new Error("Задача удалена"));
  render(<StudentPage />);
  fireEvent.click(await screen.findByText("Открыть задание"));
  fireEvent.click(screen.getByText("Задача 1 · #825"));
  await screen.findByText("Задача удалена");
  let finish!: (value: TaskDto) => void;
  vi.mocked(api.getTask).mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  fireEvent.click(screen.getByText("Повторить загрузку задачи"));
  fireEvent.click(screen.getByText("Скрыть задание"));
  await act(async () => { finish(task(825)); });
  expect(screen.queryByText("Условие 825")).toBeNull();
});
