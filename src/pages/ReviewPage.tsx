import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { WorkPhotos } from "../components/student/ManualWorkPanel";
import { workStatusLabel, type ManualWork, type WorkStatus } from "../types/manual-work";
import type { TaskDto } from "../types/api-types";

export default function ReviewPage() {
  const [items, setItems] = useState<ManualWork[]>([]);
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState(false);
  const [retry, setRetry] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [work, setWork] = useState<ManualWork | null>(null);
  const [task, setTask] = useState<TaskDto | null>(null);
  const [comment, setComment] = useState("");
  const version = useRef(0);
  const pending = useRef(false);
  useEffect(() => () => { version.current++; }, []);
  useEffect(() => {
    let cancelled = false;
    version.current++; setWork(null); setTask(null); setLoading(true); setBusy(false); setError("");
    void api.getReviewQueue(page, history).then(data => { if (!cancelled) setItems(data); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : "Не удалось загрузить очередь."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, history, retry]);
  async function open(item: ManualWork) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError(""); setNotice(""); setWork(null); setTask(null);
    const current = ++version.current;
    try {
      const [detail, condition] = await Promise.all([api.getManualWork(item.id), api.getTask(item.taskId)]);
      if (current !== version.current) return;
      setWork(detail); setTask(condition); setComment(detail.comment);
    } catch (e) { if (current === version.current) setError(e instanceof Error ? e.message : "Не удалось открыть работу."); }
    finally { pending.current = false; if (current === version.current) setBusy(false); }
  }
  async function review(status: WorkStatus) {
    if (!work || pending.current) return;
    if (status !== 1 && !comment.trim()) { setError("Добавьте комментарий ученику."); return; }
    pending.current = true; setBusy(true); setError(""); setNotice("");
    const current = ++version.current;
    try {
      const saved = await api.reviewManualWork(work.id, status, comment);
      if (current !== version.current) return;
      setWork(saved); setItems(rows => history ? rows.map(row => row.id === saved.id ? saved : row) : rows.filter(row => row.id !== saved.id));
      setNotice("Оценка сохранена. Ученик увидит её после обновления истории.");
    } catch (e) { if (current === version.current) setError(e instanceof Error ? e.message : "Не удалось сохранить оценку."); }
    finally { pending.current = false; if (current === version.current) setBusy(false); }
  }
  return <main className="max-w-5xl mx-auto p-4 min-w-0 break-words space-y-4">
    <h1 className="text-2xl font-bold">Проверка работ</h1>
    <div className="flex flex-wrap gap-3 items-center">
      <label><input type="checkbox" checked={history} disabled={busy} onChange={e => { setHistory(e.target.checked); setPage(1); }} /> Показывать также проверенные работы</label>
      <button className="min-h-11 underline" disabled={busy || loading} onClick={() => setRetry(n => n + 1)}>Обновить очередь</button>
    </div>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {notice && <p role="status">{notice}</p>}
    {loading ? <p role="status">Загрузка работ…</p> : <>
      {items.length === 0 && <p>На этой странице нет работ.</p>}
      {items.map(item => <article key={item.id} className="border rounded p-3">
        <p>Ученик #{item.studentId} · ДЗ №{item.homeworkNumber} · Задача #{item.taskId}</p>
        <p>{workStatusLabel(item.status)} · {new Date(item.submittedAt).toLocaleString("ru-RU")}</p>
        <button className="min-h-11 underline" disabled={busy} onClick={() => void open(item)}>Открыть работу</button>
      </article>)}
    </>}
    <nav aria-label="Страницы очереди" className="flex flex-wrap gap-4 items-center">
      <button className="min-h-11 underline" disabled={page === 1 || busy || loading} onClick={() => setPage(p => p - 1)}>Предыдущая</button><span>Страница {page}</span>
      <button className="min-h-11 underline" disabled={items.length < 20 || busy || loading} onClick={() => setPage(p => p + 1)}>Следующая</button>
    </nav>
    {busy && <p role="status">Обработка…</p>}
    {work && task && <section aria-label="Проверяемая работа" className="border rounded p-4 space-y-3">
      <h2 className="text-xl font-semibold">Ученик #{work.studentId} · Задача #{work.taskId}</h2>
      {task.textContent && <p className="whitespace-pre-wrap">{task.textContent}</p>}
      {task.imageContent?.imageBase64 && <img className="max-w-full h-auto" src={task.imageContent.imageBase64} alt="Условие задачи" />}
      <h3 className="font-semibold">Работа ученика</h3><p className="whitespace-pre-wrap">{work.text}</p><WorkPhotos images={work.images} />
      <p>{workStatusLabel(work.status)}</p>
      {work.status === 0 ? <>
        <label className="block">Комментарий ученику<textarea className="block w-full min-h-24 border rounded p-2" maxLength={5000} disabled={busy} value={comment} onChange={e => setComment(e.target.value)} /></label>
        <div className="flex flex-wrap gap-3">{([1, 2, 3] as WorkStatus[]).map(status => <button key={status} className="min-h-11 rounded border px-3 py-2 disabled:opacity-50" disabled={busy} onClick={() => void review(status)}>{workStatusLabel(status)}</button>)}</div>
      </> : <p className="whitespace-pre-wrap">Комментарий: {work.comment || "Без комментария"}</p>}
    </section>}
  </main>;
}
