import { StrictMode } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";
import { authClient } from "../src/lib/http";
import { SESSION_KEY } from "../src/lib/authClient";
import { useStudentStore } from "../src/store/studentStore";
import { useDictionaryStore } from "../src/store/dictionaryStore";

vi.mock("../src/pages/TeacherPage", () => ({ default: () => <><h1>Кабинет преподавателя</h1><input aria-label="Заметка" defaultValue="" /></> }));
vi.mock("../src/pages/StudentPage", () => ({ default: () => <h1>Кабинет ученика</h1> }));
vi.mock("../src/pages/StudentInfoPage", () => ({ default: () => <h1>Чужая карточка</h1> }));

const jwt = (role = "teacher") => `a.${btoa(JSON.stringify({ user_id: "1", role, login: "test", exp: Date.now() / 1000 + 3600 }))}.c`;
const authData = (role = "teacher") => ({ tokenString: jwt(role), userAuthDto: {
  email: "test@example.test", lastActiveAt: null, information: { lastDisciplineId: 1, studentIds: [], notes: {} },
} });
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
const fetchMock = vi.fn<typeof fetch>();
const respond = (role = "teacher") => async (url: RequestInfo | URL) => String(url).endsWith("/api/disciplines") ? json([]) : json(authData(role));
beforeEach(async () => {
  vi.stubGlobal("fetch", fetchMock); fetchMock.mockReset();
  authClient.dismissSession();
  await authClient.bootstrap();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const show = (path = "/login") => render(<StrictMode><MemoryRouter initialEntries={[path]}><App /></MemoryRouter></StrictMode>);

describe("session UI", () => {
  it("remounts private screens when another tab switches accounts", async () => {
    fetchMock.mockImplementation(respond());
    await authClient.authenticate("/api/auth/login", {});
    show("/teacher");
    fireEvent.change(screen.getByLabelText("Заметка"), { target: { value: "private draft" } });
    act(() => {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ boundary: "other-account", data: authData(), loggedOut: false }));
      authClient.sync();
    });
    expect((screen.getByLabelText("Заметка") as HTMLInputElement).value).toBe("");
  });
  it("redirects unauthenticated direct student-card links to login", async () => {
    show("/student/42");
    expect(await screen.findByText("Вход в систему")).toBeTruthy();
    expect(screen.queryByText("Чужая карточка")).toBeNull();
  });
  it("does not give the student access to a teacher card", async () => {
    fetchMock.mockImplementation(respond("student"));
    await authClient.authenticate("/api/auth/login", {});
    show("/student/42");
    expect(await screen.findByText("Кабинет ученика")).toBeTruthy();
    expect(screen.queryByText("Чужая карточка")).toBeNull();
  });
  it("logs in through the form and navigates by role", async () => {
    fetchMock.mockImplementation(respond());
    show();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "teacher" } });
    fireEvent.change(document.querySelector('input[type="password"]')!, { target: { value: "Password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Войти" }));
    expect(await screen.findByText("Кабинет преподавателя")).toBeTruthy();
    expect(fetchMock.mock.calls[0][1]?.credentials).toBe("include");
  });
  it("shows the restoration state instead of redirecting prematurely", async () => {
    let resolve!: (value: Response) => void;
    const pending = new Promise<Response>(r => { resolve = r; });
    fetchMock.mockImplementation(async url => String(url).endsWith("/api/disciplines") ? json([]) : pending);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ boundary: authClient.getSnapshot().boundary, data: null, loggedOut: false }));
    let boot!: Promise<void>;
    act(() => { boot = authClient.bootstrap(); });
    show("/teacher");
    expect(screen.getByRole("status").textContent).toContain("Восстанавливаем");
    expect(screen.queryByText("Вход в систему")).toBeNull();
    await act(async () => { resolve(json(authData())); await boot; });
    expect(await screen.findByText("Кабинет преподавателя")).toBeTruthy();
    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith("refresh"))).toHaveLength(1);
  });
  it("offers retry on bootstrap network failure", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("offline")).mockImplementation(respond());
    localStorage.setItem(SESSION_KEY, JSON.stringify({ boundary: authClient.getSnapshot().boundary, data: null, loggedOut: false }));
    show("/teacher");
    expect(await screen.findByRole("button", { name: "Повторить" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Повторить" }));
    expect(await screen.findByText("Кабинет преподавателя")).toBeTruthy();
  });
  it("clears private caches and reports unconfirmed logout", async () => {
    fetchMock.mockImplementationOnce(async () => json(authData()));
    await authClient.authenticate("/api/auth/login", {});
    useStudentStore.getState().setStudents([{ id: 1, studentId: 5, login: "private", lastActiveAt: null }]);
    useDictionaryStore.getState().setTaskTagIds(1, [100]);
    fetchMock.mockRejectedValue(new TypeError("offline"));
    show("/teacher");
    await act(async () => { await authClient.logout(); });
    expect(await screen.findByText("Вход в систему")).toBeTruthy();
    expect(screen.getByText(/Сервер не подтвердил/)).toBeTruthy();
    expect(useStudentStore.getState().students).toEqual([]);
    expect(useDictionaryStore.getState().taskMap).toEqual({});
  });
});
