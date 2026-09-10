import { describe, it, expect, vi, afterEach } from "vitest";
import { AuthClient, ApiError, SESSION_KEY, tokenIdentity, type AuthResponse } from "../src/lib/authClient";

function token(user = 1, expires = Date.now() / 1000 + 3600, login = "teacher") {
  const bytes = new TextEncoder().encode(JSON.stringify({ user_id: String(user), login, role: "teacher", exp: expires }));
  return `header.${btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}.signature`;
}
function data(jwt = token()): AuthResponse { return { tokenString: jwt, userAuthDto: { email: "test@example.test", lastActiveAt: null, information: { lastDisciplineId: 1, studentIds: [], notes: {} } } }; }
function storage() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
}
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>(r => { resolve = r; }); return { promise, resolve }; }
const response = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
function setup(initial: AuthResponse | null = data()) {
  const store = storage();
  if (initial) store.setItem(SESSION_KEY, JSON.stringify({ boundary: "one", data: initial, loggedOut: false }));
  const fetch = vi.fn<typeof globalThis.fetch>();
  const client = new AuthClient({ baseUrl: "https://api.test", storage: store, fetch });
  return { client, fetch, store };
}
afterEach(() => vi.useRealTimers());

describe("session lifecycle", () => {
  it("restores cached user and token without a refresh", async () => {
    const { client, fetch } = setup();
    await client.bootstrap();
    expect(client.getSnapshot().status).toBe("authenticated");
    expect(client.getSnapshot().user?.email).toBe("test@example.test");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("deduplicates initial refresh including StrictMode double initialization", async () => {
    const { client, fetch } = setup(null);
    fetch.mockResolvedValue(response(data()));
    await Promise.all([client.bootstrap(), client.bootstrap()]);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][1]?.credentials).toBe("include");
  });
  it.each(["/api/auth/login", "/api/users/register"] as const)("accepts %s response and sends cookie credentials", async path => {
    const { client, fetch } = setup(null);
    fetch.mockResolvedValue(response(data()));
    await client.authenticate(path, { login: "teacher", password: "secret" });
    expect(fetch.mock.calls[0][1]?.credentials).toBe("include");
    expect(fetch.mock.calls[0][1]?.headers).not.toHaveProperty("Authorization");
    expect(client.getSnapshot().status).toBe("authenticated");
  });
  it("does not try refresh for invalid login", async () => {
    const { client, fetch } = setup(null);
    fetch.mockImplementation(async () => response({}, 401));
    await expect(client.authenticate("/api/auth/login", {})).rejects.toMatchObject({ status: 401 });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("allows retry after a temporary bootstrap failure", async () => {
    const { client, fetch } = setup(null);
    fetch.mockRejectedValueOnce(new TypeError("network")).mockResolvedValueOnce(response(data()));
    await client.bootstrap();
    expect(client.getSnapshot().status).toBe("error");
    await client.bootstrap();
    expect(client.getSnapshot().status).toBe("authenticated");
  });
  it("does not auto-login after logout failed on the server, even after reload", async () => {
    const { client, fetch, store } = setup();
    await client.bootstrap();
    fetch.mockRejectedValue(new Error("offline"));
    await client.logout();
    expect(client.getSnapshot().status).toBe("anonymous");
    expect(client.getSnapshot().error).toContain("не подтвердил");
    const other = new AuthClient({ baseUrl: "https://api.test", storage: store, fetch });
    await other.bootstrap();
    expect(other.getSnapshot().status).toBe("anonymous");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("does not resurrect session when refresh finishes after logout", async () => {
    const { client, fetch } = setup(null);
    const pending = deferred<Response>();
    fetch.mockReturnValueOnce(pending.promise).mockResolvedValueOnce(new Response("Logged out"));
    const boot = client.bootstrap();
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const logout = client.logout();
    pending.resolve(response(data()));
    await Promise.all([boot, logout]);
    expect(client.getSnapshot().token).toBeNull();
    expect(fetch.mock.calls[1][0]).toContain("logout");
  });
  it("decodes Cyrillic and base64url JWT payload and rejects malformed identity", () => {
    expect(tokenIdentity(token(1, 9999999999, "Учитель"))?.login).toBe("Учитель");
    expect(tokenIdentity("garbage")).toBeNull();
    expect(tokenIdentity(token(-1))).toBeNull();
  });
});

describe("API requests", () => {
  it("uses one refresh for parallel 401 responses and retries each request once", async () => {
    const old = token();
    const next = token(1, Date.now() / 1000 + 7200);
    const { client, fetch } = setup(data(old));
    await client.bootstrap();
    fetch.mockImplementation(async (url, init) => {
      if (String(url).endsWith("refresh")) return response(data(next));
      return new Headers(init?.headers).get("Authorization") === `Bearer ${old}` ? response({}, 401) : response({ ok: true });
    });
    const results = await Promise.all(Array.from({ length: 8 }, () => client.request("/api/tasks")));
    expect(results).toHaveLength(8);
    expect(fetch.mock.calls.filter(([url]) => String(url).endsWith("refresh"))).toHaveLength(1);
    expect(fetch).toHaveBeenCalledTimes(17);
  });
  it("refreshes an expired cached token before issuing a request", async () => {
    const { client, fetch } = setup(data(token(1, 1)));
    fetch.mockResolvedValueOnce(response(data())).mockResolvedValueOnce(response([1]));
    await expect(client.request("/api/tasks")).resolves.toEqual([1]);
    expect(fetch.mock.calls[0][0]).toContain("refresh");
  });
  it("does not start another refresh for a late 401 sent with the old token", async () => {
    const { client, fetch } = setup();
    await client.bootstrap();
    const slow = deferred<Response>();
    fetch.mockReturnValueOnce(slow.promise).mockResolvedValueOnce(response({}, 401))
      .mockResolvedValueOnce(response(data(token(1, Date.now() / 1000 + 7200))))
      .mockImplementation(async () => response({ ok: true }));
    const first = client.request("/slow");
    await client.request("/fast");
    slow.resolve(response({}, 401));
    await first;
    expect(fetch.mock.calls.filter(([url]) => String(url).endsWith("refresh"))).toHaveLength(1);
  });
  it.each([403, 429, 500])("does not refresh or retry status %s", async status => {
    const { client, fetch } = setup(); await client.bootstrap();
    fetch.mockResolvedValue(response({}, status));
    await expect(client.request("/tasks", "POST", { id: 1 })).rejects.toMatchObject({ status });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(client.getSnapshot().status).toBe("authenticated");
  });
  it("keeps session on a temporary refresh failure", async () => {
    const { client, fetch } = setup(); await client.bootstrap();
    fetch.mockResolvedValueOnce(response({}, 401)).mockResolvedValueOnce(response({}, 503));
    await expect(client.request("/tasks")).rejects.toMatchObject({ status: 503 });
    expect(client.getSnapshot().token).not.toBeNull();
  });
  it("clears user and stops retries on rejected refresh", async () => {
    const { client, fetch } = setup(); await client.bootstrap();
    fetch.mockImplementation(async () => response({}, 401));
    await expect(client.request("/tasks")).rejects.toMatchObject({ status: 401 });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(client.getSnapshot().user).toBeNull();
  });
  it("stops after the retry also returns 401", async () => {
    const { client, fetch } = setup(); await client.bootstrap();
    fetch.mockResolvedValueOnce(response({}, 401)).mockResolvedValueOnce(response(data()))
      .mockResolvedValueOnce(response({}, 401));
    await expect(client.request("/tasks")).rejects.toMatchObject({ status: 401 });
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(client.getSnapshot().token).toBeNull();
  });
  it("rejects old API results after switching accounts", async () => {
    const { client, fetch } = setup(); await client.bootstrap();
    const slow = deferred<Response>();
    fetch.mockReturnValueOnce(slow.promise).mockResolvedValueOnce(response(data(token(2))));
    const pending = client.request("/private");
    const rejected = expect(pending).rejects.toMatchObject({ status: 409 });
    await client.authenticate("/api/auth/login", {});
    slow.resolve(response({ privateData: "old user" }));
    await rejected;
    expect(tokenIdentity(client.getSnapshot().token)?.userId).toBe(2);
  });
  it("handles JSON, plain text and empty 204", async () => {
    const { client, fetch } = setup(); await client.bootstrap();
    fetch.mockResolvedValueOnce(response({ ok: true })).mockResolvedValueOnce(new Response("Название"))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(client.request("/one")).resolves.toEqual({ ok: true });
    await expect(client.request("/two", "GET", undefined, { format: "text" })).resolves.toBe("Название");
    await expect(client.request("/three", "DELETE")).resolves.toBeUndefined();
  });
  it("shows validation errors but hides server stack traces", async () => {
    const { client, fetch } = setup(); await client.bootstrap();
    fetch.mockResolvedValueOnce(response({ errors: { Password: ["Слишком короткий пароль"] } }, 400))
      .mockResolvedValueOnce(new Response("System.Exception at internal.path", { status: 500 }));
    await expect(client.request("/one")).rejects.toThrow("Слишком короткий пароль");
    await expect(client.request("/two")).rejects.toThrow("Ошибка сервера");
  });
  it("public endpoints do not restore sessions or send bearer tokens", async () => {
    const { client, fetch } = setup(null);
    fetch.mockResolvedValue(response([]));
    await client.request("/disciplines", "GET", undefined, { auth: false });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][1]?.headers).not.toHaveProperty("Authorization");
  });
  it("reports timeout and does not replay a mutation", async () => {
    vi.useFakeTimers();
    const { client, fetch } = setup(); await client.bootstrap();
    fetch.mockImplementation((_url, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
    }));
    const pending = client.request("/mutation", "POST", {});
    const assertion = expect(pending).rejects.toBeInstanceOf(ApiError);
    await vi.advanceTimersByTimeAsync(15001);
    await assertion;
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("tabs sharing a cookie", () => {
  function lock() {
    let tail = Promise.resolve();
    return <T>(operation: () => Promise<T>) => {
      const result = tail.then(operation); tail = result.then(() => undefined, () => undefined); return result;
    };
  }
  it("shares refresh result across tabs using the browser lock", async () => {
    const store = storage(); const mutex = lock();
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(response(data()));
    const first = new AuthClient({ baseUrl: "https://api.test", storage: store, fetch, lock: mutex });
    const second = new AuthClient({ baseUrl: "https://api.test", storage: store, fetch, lock: mutex });
    await Promise.all([first.bootstrap(), second.bootstrap()]);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(first.getSnapshot().token).toBe(second.getSnapshot().token);
  });
  it("observes logout from another tab and drops its pending response", async () => {
    const { store, client: first, fetch } = setup(); await first.bootstrap();
    const second = new AuthClient({ baseUrl: "https://api.test", storage: store, fetch }); await second.bootstrap();
    const pending = deferred<Response>(); fetch.mockReturnValueOnce(pending.promise).mockResolvedValueOnce(new Response("ok"));
    const old = second.request("/private"); const assertion = expect(old).rejects.toMatchObject({ status: 409 });
    await first.logout(); second.sync(); pending.resolve(response({ old: true })); await assertion;
    expect(second.getSnapshot().status).toBe("anonymous");
  });
});
