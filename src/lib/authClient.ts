import type { UserAuthDto } from "../types/api-types";

export interface AuthResponse { tokenString: string; userAuthDto: UserAuthDto }
type RecordValue = { boundary: string; data: AuthResponse | null; loggedOut: boolean };
export type SessionState = {
  token: string | null; user: UserAuthDto | null;
  status: "checking" | "authenticated" | "anonymous" | "error";
  error: string | null; boundary: string;
};
export const SESSION_KEY = "freetutor.session.v1";
export class ApiError extends Error {
  constructor(message: string, public status = 0) { super(message); this.name = "ApiError"; }
}
export function tokenIdentity(token: string | null) {
  if (!token) return null;
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(part), c => c.charCodeAt(0));
    const p = JSON.parse(new TextDecoder().decode(bytes));
    if (!Number.isSafeInteger(Number(p.user_id)) || Number(p.user_id) <= 0 ||
        !["student", "teacher", "admin"].includes(p.role) || typeof p.login !== "string" ||
        typeof p.exp !== "number") return null;
    return { userId: Number(p.user_id), login: p.login, role: p.role as "student" | "teacher" | "admin", exp: p.exp };
  } catch { return null; }
}
const fresh = (token: string | null) => (tokenIdentity(token)?.exp ?? 0) * 1000 > Date.now() + 30_000;
const validAuth = (data: unknown): data is AuthResponse => {
  const value = data as AuthResponse | null;
  return !!value && typeof value.tokenString === "string" && !!tokenIdentity(value.tokenString) &&
    !!value.userAuthDto && typeof value.userAuthDto.email === "string" && !!value.userAuthDto.information;
};

export class AuthClient {
  private state: SessionState = { token: null, user: null, status: "checking", error: null, boundary: "initial" };
  private listeners = new Set<() => void>();
  private refreshFlight: Promise<void> | null = null;
  private bootstrapFlight: Promise<void> | null = null;
  private authQueue: Promise<void> = Promise.resolve();
  private memory: RecordValue = { boundary: "initial", data: null, loggedOut: false };
  constructor(private options: {
    baseUrl: string; storage: Pick<Storage, "getItem" | "setItem" | "removeItem">;
    fetch: typeof fetch; lock?: <T>(operation: () => Promise<T>) => Promise<T>;
    timeoutMs?: number;
  }) {}
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private emit(update: Partial<SessionState>) {
    this.state = { ...this.state, ...update };
    this.listeners.forEach(listener => listener());
  }
  private read(): RecordValue {
    try {
      const raw = this.options.storage.getItem(SESSION_KEY);
      if (raw) {
        const record = JSON.parse(raw) as RecordValue;
        if (typeof record.boundary === "string" && typeof record.loggedOut === "boolean" &&
            (record.data === null || validAuth(record.data))) return record;
      }
    } catch { /* Storage can be unavailable in private browsing. */ }
    return this.memory;
  }
  private write(record: RecordValue) {
    this.memory = record;
    try {
      this.options.storage.setItem(SESSION_KEY, JSON.stringify(record));
      this.options.storage.removeItem("token");
    } catch { /* The current tab can still use its in-memory session. */ }
  }
  sync = () => {
    const record = this.read();
    if (record.boundary !== this.state.boundary || record.data?.tokenString !== (this.state.token ?? undefined)) {
      this.emit({ boundary: record.boundary, token: record.data?.tokenString ?? null,
        user: record.data?.userAuthDto ?? null, status: record.data ? "authenticated" : "anonymous", error: null });
    }
  };
  private assertCurrent(boundary: string) {
    if (this.read().boundary !== boundary) { this.sync(); throw new ApiError("Сессия изменилась. Повторите действие.", 409); }
  }
  private clear(message: string | null = null) {
    this.refreshFlight = null;
    const boundary = crypto.randomUUID();
    this.write({ boundary, data: null, loggedOut: true });
    this.emit({ token: null, user: null, boundary, status: "anonymous", error: message });
    return boundary;
  }
  dismissSession = () => { this.clear(); };
  private accept(data: unknown, boundary: string) {
    this.assertCurrent(boundary);
    if (!validAuth(data)) throw new ApiError("Сервер вернул некорректные данные сессии.");
    this.write({ boundary, data, loggedOut: false });
    this.emit({ boundary, token: data.tokenString, user: data.userAuthDto, status: "authenticated", error: null });
  }
  setUser = (user: UserAuthDto | null) => {
    if (!this.state.token || !user) return;
    this.accept({ tokenString: this.state.token, userAuthDto: user }, this.state.boundary);
  };
  private locked<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.authQueue.then(() => this.options.lock ? this.options.lock(operation) : operation());
    this.authQueue = result.then(() => undefined, () => undefined);
    return result;
  }
  private async transport(path: string, method: string, body?: unknown, token?: string | null): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.options.timeoutMs ?? 15_000);
    try {
      const response = await this.options.fetch(`${this.options.baseUrl}${path}`, {
        method, credentials: "include", signal: controller.signal,
        headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      // Keep the timeout active until the body has arrived, not only the headers.
      const text = await response.text();
      return new Response([204, 205, 304].includes(response.status) ? null : text,
        { status: response.status, statusText: response.statusText, headers: response.headers });
    } catch {
      throw new ApiError(controller.signal.aborted ? "Сервер не ответил вовремя. Повторите попытку." :
        "Не удалось связаться с сервером. Проверьте подключение и повторите попытку.");
    } finally { clearTimeout(timer); }
  }
  private async parse(response: Response, format: "auto" | "text" = "auto"): Promise<unknown> {
    const text = await response.text();
    let parsed: unknown;
    try { parsed = text ? JSON.parse(text) : undefined; } catch { parsed = undefined; }
    if (!response.ok) {
      let message = response.status === 401 ? "Сессия завершена. Войдите снова." :
        response.status === 403 ? "У вас нет доступа к этому действию." :
        response.status === 429 ? "Слишком много запросов. Подождите и повторите попытку." :
        response.status >= 500 ? "Ошибка сервера. Повторите попытку позже." : "Не удалось выполнить запрос.";
      if (response.status === 400 || response.status === 409) {
        const problem = parsed as { errors?: Record<string, unknown>; message?: string } | undefined;
        const errors = problem?.errors && Object.values(problem.errors).flat().filter(v => typeof v === "string");
        if (errors?.length) message = errors.join(" ");
        else if (typeof problem?.message === "string") message = problem.message;
        else if (text && text.length < 500 && !text.includes("<") && !text.includes(" at ")) message = text;
      }
      throw new ApiError(message, response.status);
    }
    if (format === "text") return text;
    if (!text) return undefined;
    if (parsed !== undefined) return parsed;
    if (response.headers.get("content-type")?.includes("json")) throw new ApiError("Сервер вернул некорректный ответ.");
    return text;
  }
  bootstrap = (): Promise<void> => {
    if (this.bootstrapFlight) return this.bootstrapFlight;
    this.bootstrapFlight = (async () => {
      const record = this.read();
      this.emit({ boundary: record.boundary, status: "checking", error: null });
      if (record.loggedOut) { this.emit({ status: "anonymous" }); return; }
      if (record.data && fresh(record.data.tokenString)) { this.accept(record.data, record.boundary); return; }
      try { await this.refresh(); }
      catch (error) {
        if (this.read().boundary === record.boundary && this.state.status !== "anonymous")
          this.emit({ status: "error", error: (error as Error).message });
      }
    })().finally(() => { this.bootstrapFlight = null; });
    return this.bootstrapFlight;
  };
  private refresh(): Promise<void> {
    if (this.refreshFlight) return this.refreshFlight;
    const boundary = this.state.boundary;
    const originalToken = this.state.token;
    const flight = this.locked(async () => {
      this.assertCurrent(boundary);
      const shared = this.read();
      if (shared.data && shared.data.tokenString !== originalToken && fresh(shared.data.tokenString)) {
        this.accept(shared.data, boundary); return;
      }
      const response = await this.transport("/api/auth/refresh", "POST");
      this.assertCurrent(boundary);
      if (response.status === 401) {
        this.clear("Сессия завершена. Войдите снова.");
        throw new ApiError("Сессия завершена. Войдите снова.", 401);
      }
      this.accept(await this.parse(response), boundary);
    });
    this.refreshFlight = flight;
    void flight.finally(() => { if (this.refreshFlight === flight) this.refreshFlight = null; }).catch(() => {});
    return flight;
  }
  async authenticate(path: "/api/auth/login" | "/api/users/register", body: unknown) {
    const boundary = this.clear();
    return this.locked(async () => {
      this.assertCurrent(boundary);
      const response = await this.transport(path, "POST", body);
      if (response.status === 401) throw new ApiError("Неверный логин или пароль либо учётная запись недоступна.", 401);
      this.accept(await this.parse(response), boundary);
    });
  }
  logout = async () => {
    const boundary = this.clear();
    try {
      await this.locked(async () => {
        this.assertCurrent(boundary);
        await this.parse(await this.transport("/api/auth/logout", "POST"));
      });
    } catch {
      if (this.read().boundary === boundary) this.emit({ error:
        "Вы вышли на этом устройстве. Сервер не подтвердил отзыв сессии; автоматический вход отключён." });
    }
  };
  async request<T>(path: string, method = "GET", body?: unknown,
    options: { auth?: boolean; format?: "auto" | "text" } = {}): Promise<T> {
    if (options.auth === false) return await this.parse(await this.transport(path, method, body), options.format) as T;
    if (this.state.status === "checking") await this.bootstrap();
    this.sync();
    const boundary = this.state.boundary;
    if (!this.state.token) throw new ApiError(this.state.error ?? "Войдите в систему.", 401);
    if (!fresh(this.state.token)) await this.refresh();
    this.assertCurrent(boundary);
    const sentToken = this.state.token;
    let response = await this.transport(path, method, body, sentToken);
    this.assertCurrent(boundary);
    if (response.status === 401) {
      this.sync();
      if (this.state.token === sentToken) await this.refresh();
      this.assertCurrent(boundary);
      response = await this.transport(path, method, body, this.state.token);
      this.assertCurrent(boundary);
      if (response.status === 401) this.clear("Сессия завершена. Войдите снова.");
    }
    const result = await this.parse(response, options.format);
    this.assertCurrent(boundary);
    return result as T;
  }
}
