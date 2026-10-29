import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CreateHomeworkPanel, TeacherHomeworkList } from "../src/components/studentCard/TeacherHomeworkPanel";
import { api } from "../src/lib/api";
import { ApiError } from "../src/lib/authClient";
import { createEmptyStudentInfo } from "../src/utils/createEmptyStudentInfo";
import { HomeworkType, TaskType, type HomeworkInfo } from "../src/types/api-types";

vi.mock("../src/lib/api", () => ({ api: { generateHomework: vi.fn(), getTopics: vi.fn(), getTask: vi.fn() } }));
const homework: HomeworkInfo = { homeworkUid: "3a3cf213-6540-460c-8fb0-0045947a68ae", idHomework: 3, assignedAt: "2026-10-29T10:00:00Z", type: HomeworkType.Classic, taskIds: [{ id: 825, type: TaskType.Forced }] };
beforeEach(() => { vi.resetAllMocks(); sessionStorage.clear(); vi.mocked(api.getTopics).mockResolvedValue([]); vi.mocked(api.generateHomework).mockResolvedValue(homework); });
afterEach(cleanup);
function form(onCreated = vi.fn()) { return render(<CreateHomeworkPanel relationshipId={17} disciplineId={5} info={createEmptyStudentInfo()} onCreated={onCreated} />); }
function manual() {
  fireEvent.change(screen.getByLabelText(/Количество задач автоподбора/), { target: { value: "0" } });
  fireEvent.change(screen.getByLabelText("Из них по выбранным темам"), { target: { value: "0" } });
  fireEvent.change(screen.getByLabelText(/Добавить задачи/), { target: { value: "825, 825" } });
}
it("assigns exact manual IDs once using the relationship ID and numeric test wire value", async () => {
  const created = vi.fn(); form(created); manual();
  fireEvent.change(screen.getByLabelText("Вид задания"), { target: { value: "1" } });
  const button = screen.getByText("Назначить ДЗ ученику"); fireEvent.click(button); fireEvent.click(button);
  await screen.findByText(/Домашнее задание №3 назначено/);
  expect(api.generateHomework).toHaveBeenCalledTimes(1);
  expect(api.generateHomework).toHaveBeenCalledWith(expect.objectContaining({ studentToTeacherId: 17, type: 1, automaticTotalTaskCount: 0, additionalTaskIds: [825], requestId: expect.any(String) }));
  expect(created).toHaveBeenCalledWith(homework);
});
it("restores the same retry payload after remount and a lost response", async () => {
  vi.mocked(api.generateHomework).mockRejectedValueOnce(new Error("offline"));
  const view = form(); manual(); fireEvent.click(screen.getByText("Назначить ДЗ ученику"));
  await screen.findByRole("alert"); const payload = vi.mocked(api.generateHomework).mock.calls[0][0];
  view.unmount(); form(); fireEvent.click(screen.getByText("Повторить это назначение"));
  await screen.findByText(/Домашнее задание №3 назначено/);
  expect(api.generateHomework).toHaveBeenLastCalledWith(payload);
  expect(sessionStorage.length).toBe(0);
});
it("allows correction after a definitive validation failure", async () => {
  vi.mocked(api.generateHomework).mockRejectedValueOnce(new ApiError("Задача не найдена", 400));
  form(); manual(); fireEvent.click(screen.getByText("Назначить ДЗ ученику"));
  await screen.findByText("Задача не найдена");
  fireEvent.change(screen.getByLabelText(/Добавить задачи/), { target: { value: "826" } });
  fireEvent.click(screen.getByText("Назначить ДЗ ученику"));
  await screen.findByText(/Домашнее задание №3 назначено/);
  expect(api.generateHomework).toHaveBeenLastCalledWith(expect.objectContaining({ additionalTaskIds: [826] }));
  expect(vi.mocked(api.generateHomework).mock.calls[0][0].requestId).not.toBe(vi.mocked(api.generateHomework).mock.calls[1][0].requestId);
});
it("rejects malformed IDs and empty manual assignments before sending", async () => {
  form(); manual();
  fireEvent.change(screen.getByLabelText(/Добавить задачи/), { target: { value: "825x" } });
  fireEvent.click(screen.getByText("Назначить ДЗ ученику")); await screen.findByRole("alert");
  expect(api.generateHomework).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText(/Добавить задачи/), { target: { value: "" } });
  fireEvent.click(screen.getByText("Назначить ДЗ ученику")); await screen.findByText(/Добавьте хотя бы одну задачу/);
  expect(api.generateHomework).not.toHaveBeenCalled();
});
it("loads task conditions only on request and keeps equal display numbers with different UIDs separate", async () => {
  const info = createEmptyStudentInfo();
  info.homeworks = [homework, { ...homework, homeworkUid: "other", taskIds: [{ id: 826, type: TaskType.Forced }] }];
  vi.mocked(api.getTask).mockResolvedValue({ taskId: 826, taskIdExternal: "test", textContent: "Условие QA", groupNumber: 0, disciplineId: 5 });
  render(<TeacherHomeworkList info={info} />);
  expect(api.getTask).not.toHaveBeenCalled();
  fireEvent.click(screen.getAllByText("Посмотреть состав")[1]);
  fireEvent.click(screen.getByText(/Задача 1 · #826/));
  await screen.findByText("Условие QA");
  expect(api.getTask).toHaveBeenCalledWith(826);
  fireEvent.click(screen.getByText("Посмотреть состав"));
  await waitFor(() => expect(screen.queryByText("Условие QA")).toBeNull());
  expect(screen.getByText(/Задача 1 · #825/)).toBeTruthy();
});
