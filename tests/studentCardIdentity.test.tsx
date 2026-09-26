import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import StudentInfoPage from "../src/pages/StudentInfoPage";
import { api } from "../src/lib/api";
import { useDisciplineStore } from "../src/store/disciplineStore";
import { useStudentStore } from "../src/store/studentStore";
vi.mock("../src/lib/api", () => ({ api: { getStudents: vi.fn(), getStudentInfo: vi.fn() } }));
vi.mock("../src/components/Header", () => ({ default: () => null }));
vi.mock("../src/components/studentCard/StudentBasicInfoPanel", () => ({ default: () => null }));
vi.mock("../src/components/studentCard/SolutionAccessPanel", () => ({ default: ({ relationshipId }: { relationshipId: number }) => <p>relationship:{relationshipId}</p> }));
vi.mock("../src/components/studentCard/CompletedTopicsPanel", () => ({ default: ({ studentId }: { studentId: number }) => <p>topics-relationship:{studentId}</p> }));
beforeEach(() => { vi.resetAllMocks(); useStudentStore.setState({ students: [] }); useDisciplineStore.setState({ disciplineId: 5 }); });
afterEach(cleanup);
function show() { render(<MemoryRouter initialEntries={["/student/13"]}><Routes><Route path="/student/:studentId" element={<StudentInfoPage />} /></Routes></MemoryRouter>); }
it("resolves relationship from API after reload, not from user ID or stale cache", async () => {
  useStudentStore.setState({ students: [{ id: 15, studentId: 13, login: "old-discipline", lastActiveAt: null }] });
  vi.mocked(api.getStudents).mockResolvedValue([{ id: 16, studentId: 13, login: "test", lastActiveAt: null }]);
  vi.mocked(api.getStudentInfo).mockResolvedValue({ completedTopicIds: [] } as Awaited<ReturnType<typeof api.getStudentInfo>>);
  show();
  await waitFor(() => expect(api.getStudentInfo).toHaveBeenCalledWith(16));
  fireEvent.click(screen.getByText("🔑 Доступ к решениям"));
  await screen.findByText("relationship:16");
  fireEvent.click(screen.getByText("📚 Пройденные темы"));
  await screen.findByText("topics-relationship:16");
});
it("does not send user ID to relationship endpoints when no relationship exists", async () => {
  vi.mocked(api.getStudents).mockResolvedValue([]); show();
  await screen.findByRole("alert");
  fireEvent.click(screen.getByText("🔑 Доступ к решениям"));
  expect(api.getStudentInfo).not.toHaveBeenCalled();
  expect(screen.queryByText(/relationship:/)).toBeNull();
});
