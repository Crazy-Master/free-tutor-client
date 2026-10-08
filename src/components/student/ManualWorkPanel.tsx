import { useEffect, useRef, useState } from "react";
import { api } from "../../lib/api";
import { workStatusLabel, type ManualWork, type SubmitWork, type WorkImage } from "../../types/manual-work";

export function WorkPhotos({ images }: { images: WorkImage[] }) {
  return <div className="space-y-3">{images.map((image, i) => <img key={i} className="max-w-full h-auto rounded border" alt={`Фото решения ${i + 1}`} src={`data:${image.mimeType};base64,${image.data}`} />)}</div>;
}

export default function ManualWorkPanel({ relationshipId, homeworkUid, taskId, onAccepted }: {
  relationshipId: number; homeworkUid: string; taskId: number; onAccepted: () => void;
}) {
  const [history, setHistory] = useState<ManualWork[]>([]);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [historyReady, setHistoryReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [retry, setRetry] = useState(0);
  const [detail, setDetail] = useState<ManualWork | null>(null);
  const pending = useRef(false);
  const request = useRef<SubmitWork | null>(null);
  const alive = useRef(true);
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setHistoryReady(false); setError("");
    void api.getManualWorkHistory(relationshipId, homeworkUid, taskId).then(items => {
      if (!cancelled) { setHistoryReady(true); setHistory(items); if (items.some(w => w.status === 1)) onAccepted(); }
    }).catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : "Не удалось загрузить работы."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // The parent supplies a stable callback; identity is remounted for each task.
  }, [relationshipId, homeworkUid, taskId, retry, onAccepted]);
  const locked = history.some(w => w.status === 0 || w.status === 1);
  async function submit() {
    if (pending.current) return;
    if (!text.trim() && !files.length) { setError("Добавьте текст или фотографии решения."); return; }
    if (files.length > 3 || files.some(f => f.size > 3 * 1024 * 1024 || !["image/png", "image/jpeg", "image/webp"].includes(f.type))) {
      setError("До трёх фотографий JPEG, PNG или WebP, каждая до 3 МБ."); return;
    }
    pending.current = true; setBusy(true); setError(""); setNotice("");
    try {
      // Preserve request ID and payload after a lost response; explicit edits create a new request.
      if (!request.current) {
        const images = await Promise.all(files.map(file => new Promise<WorkImage>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ mimeType: file.type, data: String(reader.result).split(",")[1] });
          reader.onerror = () => reject(new Error("Не удалось прочитать фотографию."));
          reader.readAsDataURL(file);
        })));
        request.current = { requestId: crypto.randomUUID(), text, images };
      }
      const work = await api.submitManualWork(relationshipId, homeworkUid, taskId, request.current);
      if (!alive.current) return;
      setHistory(items => [...items.filter(w => w.id !== work.id), work]);
      setText(""); setFiles([]); if (fileInput.current) fileInput.current.value = "";
      request.current = null; setNotice("Работа отправлена преподавателю.");
    } catch (e) { if (alive.current) setError(e instanceof Error ? e.message : "Не удалось отправить работу."); }
    finally { pending.current = false; if (alive.current) setBusy(false); }
  }
  async function view(id: string) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError("");
    try { const work = await api.getManualWork(id); if (alive.current) setDetail(work); }
    catch (e) { if (alive.current) setError(e instanceof Error ? e.message : "Не удалось открыть работу."); }
    finally { pending.current = false; if (alive.current) setBusy(false); }
  }
  return <section className="mt-4 border-t pt-4 space-y-3" aria-label="Работы на проверку">
    <h4 className="font-semibold">Ручная проверка преподавателем</h4>
    <p className="text-sm">Отправьте объяснение или фотографии решения. Каждая доработка сохраняется отдельной работой.</p>
    <button disabled={busy || loading} className="min-h-11 underline" onClick={() => { setDetail(null); setRetry(n => n + 1); }}>Обновить историю</button>
    {loading && <p role="status">Загрузка работ…</p>}
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {notice && <p role="status">{notice}</p>}
    {history.map(work => <div key={work.id} className="rounded border p-3">
      <p>{workStatusLabel(work.status)} · {new Date(work.submittedAt).toLocaleString("ru-RU")}</p>
      {work.comment && <p className="whitespace-pre-wrap">Комментарий: {work.comment}</p>}
      <button disabled={busy} className="min-h-11 underline" onClick={() => void view(work.id)}>Посмотреть отправленную работу</button>
    </div>)}
    {detail && <div className="border rounded p-3"><p className="whitespace-pre-wrap">{detail.text}</p><WorkPhotos images={detail.images} /></div>}
    {!loading && historyReady && !locked && <form className="space-y-3" onSubmit={e => { e.preventDefault(); void submit(); }}>
      <label className="block">Текст решения<textarea className="block w-full min-h-32 border rounded p-2" maxLength={10000} disabled={busy} value={text} onChange={e => { setText(e.target.value); request.current = null; }} /></label>
      <label className="block">Фотографии решения (до трёх, по 3 МБ)<input ref={fileInput} className="block max-w-full mt-2" type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => { setFiles(Array.from(e.target.files ?? [])); request.current = null; }} /></label>
      <button disabled={busy} className="min-h-11 rounded border px-3 py-2 disabled:opacity-50" type="submit">{busy ? "Отправка…" : "Отправить на проверку"}</button>
    </form>}
  </section>;
}
