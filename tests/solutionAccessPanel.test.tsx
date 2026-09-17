import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import SolutionAccessPanel from "../src/components/studentCard/SolutionAccessPanel";
import { api, type SolutionAccessStatus } from "../src/lib/api";

vi.mock("../src/lib/api", () => ({ api: { getSolutionAccess: vi.fn(), grantSolutionAccess: vi.fn(), revokeSolutionAccess: vi.fn() } }));
const closed: SolutionAccessStatus = { taskId: 17, taskIdExternal: "ext", ownPermission: false, otherTeacherPermission: false, correctAnswer: false, hasAccess: false };
beforeEach(() => { vi.resetAllMocks(); });
afterEach(cleanup);
function choose() {
  fireEvent.change(screen.getByLabelText("ID задачи в нашем банке"), { target: { value: "17" } });
  fireEvent.click(screen.getByText("Проверить доступ"));
}
it("loads status, grants and refreshes from the server", async () => {
  vi.mocked(api.getSolutionAccess).mockResolvedValueOnce(closed).mockResolvedValueOnce({ ...closed, ownPermission: true, hasAccess: true });
  render(<SolutionAccessPanel relationshipId={5} />); choose();
  fireEvent.click(await screen.findByText("Открыть решение"));
  await screen.findByText("Отозвать моё разрешение");
  expect(api.grantSolutionAccess).toHaveBeenCalledWith(5, 17);
  expect(api.getSolutionAccess).toHaveBeenCalledTimes(2);
});
it("explains remaining access and revokes only the current teacher permission", async () => {
  vi.mocked(api.getSolutionAccess).mockResolvedValueOnce({ ...closed, ownPermission: true, otherTeacherPermission: true, hasAccess: true })
    .mockResolvedValueOnce({ ...closed, otherTeacherPermission: true, hasAccess: true });
  render(<SolutionAccessPanel relationshipId={5} />); choose();
  await screen.findByText(/После отзыва/);
  fireEvent.click(screen.getByText("Отозвать моё разрешение"));
  await screen.findByText("Ваше разрешение отозвано.");
  expect(api.revokeSolutionAccess).toHaveBeenCalledWith(5, 17);
  expect(screen.getByText("Решение доступно ученику")).toBeTruthy();
});
it("rejects invalid IDs and clears actions when the selected ID changes", async () => {
  vi.mocked(api.getSolutionAccess).mockResolvedValue(closed);
  render(<SolutionAccessPanel relationshipId={5} />);
  fireEvent.click(screen.getByText("Проверить доступ"));
  expect(api.getSolutionAccess).not.toHaveBeenCalled();
  choose(); await screen.findByText("Открыть решение");
  fireEvent.change(screen.getByLabelText("ID задачи в нашем банке"), { target: { value: "18" } });
  expect(screen.queryByText("Открыть решение")).toBeNull();
});
it("reports a saved mutation separately from a failed refresh", async () => {
  vi.mocked(api.getSolutionAccess).mockResolvedValueOnce(closed).mockRejectedValueOnce(new Error("Сеть недоступна"));
  render(<SolutionAccessPanel relationshipId={5} />); choose();
  fireEvent.click(await screen.findByText("Открыть решение"));
  expect((await screen.findByRole("alert")).textContent).toContain("Изменение сохранено");
  expect(screen.queryByText("Отозвать моё разрешение")).toBeNull();
});
it("does not show another student's delayed result after remount", async () => {
  let resolve!: (value: SolutionAccessStatus) => void;
  vi.mocked(api.getSolutionAccess).mockImplementationOnce(() => new Promise(r => { resolve = r; }));
  const view = render(<SolutionAccessPanel key={5} relationshipId={5} />); choose();
  view.rerender(<SolutionAccessPanel key={6} relationshipId={6} />);
  resolve({ ...closed, ownPermission: true, hasAccess: true });
  await waitFor(() => expect(screen.queryByText("Отозвать моё разрешение")).toBeNull());
});
