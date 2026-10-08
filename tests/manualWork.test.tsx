import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import ManualWorkPanel from "../src/components/student/ManualWorkPanel";
import ReviewPage from "../src/pages/ReviewPage";
import { api } from "../src/lib/api";
import type { ManualWork } from "../src/types/manual-work";

vi.mock("../src/lib/api", () => ({ api: {
  getManualWorkHistory: vi.fn(), submitManualWork: vi.fn(), getManualWork: vi.fn(),
  getReviewQueue: vi.fn(), reviewManualWork: vi.fn(), getTask: vi.fn(),
} }));
const work: ManualWork = {
  id: "cc7940eb-9013-4d52-89ea-0993060c4149", relationshipId: 16,
  homeworkUid: "719d8b01-52f9-47eb-a664-597672dfd3c6", homeworkNumber: 1,
  taskId: 825, studentId: 13, teacherId: 12, text: "Моё объяснение",
  images: [], submittedAt: "2026-10-08T12:00:00Z", status: 0, comment: "", reviewedAt: null,
};
const panel = () => render(<ManualWorkPanel relationshipId={16} homeworkUid={work.homeworkUid} taskId={825} onAccepted={vi.fn()} />);
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(api.getManualWorkHistory).mockResolvedValue([]);
  vi.mocked(api.submitManualWork).mockResolvedValue(work);
  vi.mocked(api.getReviewQueue).mockResolvedValue([work]);
  vi.mocked(api.getManualWork).mockResolvedValue(work);
  vi.mocked(api.getTask).mockResolvedValue({ taskId: 825, taskIdExternal: "ext", textContent: "Условие", groupNumber: 1, disciplineId: 5 });
});
afterEach(cleanup);

it("retries the exact same submission after a lost response, without duplicating history", async () => {
  vi.mocked(api.submitManualWork).mockRejectedValueOnce(new Error("Связь прервалась"));
  panel();
  fireEvent.change(await screen.findByLabelText("Текст решения"), { target: { value: "Моё объяснение" } });
  fireEvent.click(screen.getByText("Отправить на проверку"));
  await screen.findByText("Связь прервалась");
  fireEvent.click(screen.getByText("Отправить на проверку"));
  await screen.findByText("Работа отправлена преподавателю.");
  const calls = vi.mocked(api.submitManualWork).mock.calls;
  expect(calls).toHaveLength(2);
  expect(calls[0]).toEqual(calls[1]);
  expect(calls[0][3].requestId).toMatch(/^[0-9a-f-]{36}$/);
  expect(screen.queryByLabelText("Текст решения")).toBeNull();
  expect(screen.getAllByText(/Ожидает проверки/)).toHaveLength(1);
});
it("blocks empty submissions and duplicate clicks while sending", async () => {
  let finish!: (value: ManualWork) => void;
  vi.mocked(api.submitManualWork).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  panel();
  await screen.findByLabelText("Текст решения");
  fireEvent.click(screen.getByText("Отправить на проверку"));
  await screen.findByText("Добавьте текст или фотографии решения.");
  expect(api.submitManualWork).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Текст решения"), { target: { value: "Ответ" } });
  fireEvent.click(screen.getByText("Отправить на проверку"));
  fireEvent.click(screen.getByText("Отправка…"));
  await waitFor(() => expect(api.submitManualWork).toHaveBeenCalledTimes(1));
  finish(work);
  await screen.findByText("Работа отправлена преподавателю.");
});
it("does not allow sending until history is successfully loaded", async () => {
  vi.mocked(api.getManualWorkHistory).mockRejectedValueOnce(new Error("История недоступна"));
  panel();
  await screen.findByText("История недоступна");
  expect(screen.queryByLabelText("Текст решения")).toBeNull();
  fireEvent.click(screen.getByText("Обновить историю"));
  await screen.findByLabelText("Текст решения");
});
it("preserves revision comments and lets the student view private submitted photos", async () => {
  vi.mocked(api.getManualWorkHistory).mockResolvedValue([{ ...work, status: 2, comment: "Поясни второй шаг" }]);
  vi.mocked(api.getManualWork).mockResolvedValue({ ...work, images: [{ mimeType: "image/png", data: "photo" }] });
  panel();
  await screen.findByText("Комментарий: Поясни второй шаг");
  expect(screen.getByLabelText("Текст решения")).toBeTruthy();
  fireEvent.click(screen.getByText("Посмотреть отправленную работу"));
  const photo = await screen.findByAltText("Фото решения 1");
  expect(photo.getAttribute("src")).toBe("data:image/png;base64,photo");
  expect(api.getManualWork).toHaveBeenCalledWith(work.id);
});
it("rejects unsupported attachments before making a request", async () => {
  panel();
  fireEvent.change(await screen.findByLabelText(/Фотографии решения/), { target: { files: [new File(["x"], "x.svg", { type: "image/svg+xml" })] } });
  fireEvent.click(screen.getByText("Отправить на проверку"));
  await screen.findByText("До трёх фотографий JPEG, PNG или WebP, каждая до 3 МБ.");
  expect(api.submitManualWork).not.toHaveBeenCalled();
});
it("requires a comment for revision and removes review controls after accepting", async () => {
  vi.mocked(api.reviewManualWork).mockResolvedValue({ ...work, status: 1, comment: "Хорошо" });
  render(<ReviewPage />);
  fireEvent.click(await screen.findByText("Открыть работу"));
  await screen.findByText("Моё объяснение");
  fireEvent.click(screen.getByRole("button", { name: "На доработку" }));
  await screen.findByText("Добавьте комментарий ученику.");
  expect(api.reviewManualWork).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Комментарий ученику"), { target: { value: "Хорошо" } });
  fireEvent.click(screen.getByRole("button", { name: "Зачтено" }));
  await screen.findByText(/Оценка сохранена/);
  expect(api.reviewManualWork).toHaveBeenCalledWith(work.id, 1, "Хорошо");
  expect(screen.queryByRole("button", { name: "Зачтено" })).toBeNull();
  await waitFor(() => expect(screen.queryByText("Открыть работу")).toBeNull());
});
