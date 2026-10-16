import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useLoadStudents } from "../src/hooks/useLoadStudents";
import { useDisciplineStore } from "../src/store/disciplineStore";
import { useStudentStore } from "../src/store/studentStore";
import { api } from "../src/lib/api";

vi.mock("../src/lib/api", () => ({ api: { getStudents: vi.fn() } }));
beforeEach(() => {
  vi.resetAllMocks();
  useDisciplineStore.getState().setDisciplineId(5);
  useStudentStore.getState().setStudents([]);
});
afterEach(cleanup);

it("resets the loading indicator if discipline is cleared during a request", async () => {
  let finish!: (value: Awaited<ReturnType<typeof api.getStudents>>) => void;
  vi.mocked(api.getStudents).mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const { result } = renderHook(useLoadStudents);
  await waitFor(() => expect(result.current.loading).toBe(true));
  act(() => useDisciplineStore.getState().clearDiscipline());
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => { finish([{ id: 17, studentId: 15, login: "old", lastActiveAt: null }]); });
  expect(useStudentStore.getState().students).toEqual([]);
});
it("exposes a network failure and allows explicit retry", async () => {
  vi.mocked(api.getStudents).mockRejectedValueOnce(new Error("API недоступен")).mockResolvedValueOnce([]);
  const { result } = renderHook(useLoadStudents);
  await waitFor(() => expect(result.current.error).toBe("API недоступен"));
  expect(result.current.loading).toBe(false);
  act(() => result.current.reload());
  await waitFor(() => expect(result.current.error).toBeNull());
  expect(api.getStudents).toHaveBeenCalledTimes(2);
});
