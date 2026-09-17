import { useEffect, useRef, useState } from "react";
import { api, type SolutionAccessStatus } from "../../lib/api";

export default function SolutionAccessPanel({ relationshipId }: { relationshipId: number }) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<SolutionAccessStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const version = useRef(0);
  const pending = useRef(false);
  useEffect(() => () => { version.current++; }, []);

  async function execute(action: "read" | "grant" | "revoke") {
    if (pending.current) return;
    const taskId = action === "read" ? Number(input) : status?.taskId;
    if (!taskId || !Number.isSafeInteger(taskId) || taskId <= 0 || (action === "read" && !/^\d+$/.test(input.trim()))) {
      setError("Введите положительный целочисленный ID задачи из нашего банка.");
      return;
    }
    pending.current = true;
    const current = ++version.current;
    setBusy(true); setError(""); setNotice("");
    // Never leave actionable stale status after a failed operation or refresh.
    setStatus(null);
    let changed = false;
    try {
      if (action === "grant") { await api.grantSolutionAccess(relationshipId, taskId); changed = true; }
      if (action === "revoke") { await api.revokeSolutionAccess(relationshipId, taskId); changed = true; }
      const fresh = await api.getSolutionAccess(relationshipId, taskId);
      if (current !== version.current) return;
      setStatus(fresh);
      if (changed) setNotice(action === "grant" ? "Ваше разрешение сохранено." : "Ваше разрешение отозвано.");
    } catch (e) {
      if (current === version.current) setError((changed ? "Изменение сохранено, но не удалось обновить статус. Нажмите «Проверить доступ». " : "") +
        (e instanceof Error ? e.message : "Не удалось получить ответ сервера."));
    } finally {
      if (current === version.current) { setBusy(false); pending.current = false; }
    }
  }

  return <section className="max-w-2xl rounded border bg-white p-4 shadow-sm" aria-labelledby="solution-access-title">
    <h2 id="solution-access-title" className="text-xl font-semibold mb-3">Доступ к решениям</h2>
    <p className="text-sm mb-4">Разрешение действует для этого ученика и задачи во всех домашних заданиях. Вы можете отозвать только своё разрешение.</p>
    <form className="flex flex-col sm:flex-row gap-2 items-start sm:items-end" onSubmit={e => { e.preventDefault(); void execute("read"); }}>
      <label className="flex flex-col gap-1 w-full sm:w-auto">ID задачи в нашем банке
        <input className="border rounded p-2 w-full" inputMode="numeric" value={input} disabled={busy}
          onChange={e => { setInput(e.target.value); setStatus(null); setError(""); setNotice(""); }} />
      </label>
      <button className="border rounded px-3 py-2 disabled:opacity-50" disabled={busy} type="submit">Проверить доступ</button>
    </form>
    <p className="text-sm text-gray-600 mt-2">Используйте внутренний ID, не номер задачи на внешнем сайте. Задача должна относиться к дисциплине этой карточки.</p>
    {busy && <p role="status" className="mt-3">Обновление доступа…</p>}
    {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
    {notice && <p role="status" className="mt-3">{notice}</p>}
    {status && <div className="mt-4 space-y-3">
      <p>Задача #{status.taskId}{status.taskIdExternal ? ` · внешний ID: ${status.taskIdExternal}` : ""}</p>
      <p className="font-semibold">{status.hasAccess ? "Решение доступно ученику" : "Решение закрыто для ученика"}</p>
      <ul className="list-disc pl-5 text-sm">
        <li>Ваше разрешение: {status.ownPermission ? "выдано" : "не выдано"}</li>
        {status.otherTeacherPermission && <li>Есть действующее разрешение другого преподавателя.</li>}
        {status.correctAnswer && <li>Доступ открыт за правильный ответ.</li>}
      </ul>
      {status.ownPermission && (status.otherTeacherPermission || status.correctAnswer) &&
        <p className="text-sm">После отзыва вашего разрешения решение останется доступным по другому основанию.</p>}
      <button type="button" className="rounded border px-3 py-2 disabled:opacity-50" disabled={busy}
        onClick={() => void execute(status.ownPermission ? "revoke" : "grant")}>
        {status.ownPermission ? "Отозвать моё разрешение" : "Открыть решение"}
      </button>
      <p className="text-sm text-gray-600">Отзыв не удаляет уже просмотренное или сохранённое учеником решение.</p>
    </div>}
  </section>;
}
