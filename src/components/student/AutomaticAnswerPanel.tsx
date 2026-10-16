import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../lib/api";
import { answerAttemptLabel, type AnswerAttempt, type SubmitAnswer, type SubmissionState } from "../../types/answer-attempt";

const stateOf = (items: AnswerAttempt[]): SubmissionState => items.some(a => !a.superseded && a.result === 0) ? "accepted"
  : items.some(a => !a.superseded && a.result === null && !a.appliedAt) ? "pending" : "ready";

export default function AutomaticAnswerPanel({ relationshipId, homeworkUid, taskId, mode, isTest, submitted, completed,
  peerState, refreshKey, onStateChange, onAccepted, onSaved, finalizing = false, onBusyChange }: {
  relationshipId: number; homeworkUid: string; taskId: number; mode: number; isTest: boolean; submitted: boolean; completed: boolean;
  peerState: SubmissionState; refreshKey: number; onStateChange: (state: SubmissionState) => void;
  onAccepted: () => void; onSaved: () => void;
  finalizing?: boolean; onBusyChange?: (busy: boolean) => void;
}) {
  const [history, setHistory] = useState<AnswerAttempt[]>([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [more, setMore] = useState(false);
  const [retry, setRetry] = useState(0);
  const head = useRef<AnswerAttempt[]>([]);
  const page = useRef(1);
  const version = useRef(0);
  const pending = useRef(false);
  const request = useRef<SubmitAnswer | null>(null);
  const alive = useRef(true);
  useEffect(() => { const generation = version; alive.current = true; return () => { alive.current = false; generation.current++; }; }, []);
  const load = useCallback(async (nextPage: number) => {
    const current = ++version.current;
    setLoading(true); setError("");
    if (nextPage === 1) { setReady(false); onStateChange("loading"); }
    try {
      const items = await api.getAnswerAttempts(relationshipId, homeworkUid, taskId, nextPage);
      if (!alive.current || current !== version.current) return;
      if (nextPage === 1) { head.current = items; setHistory(items); }
      else setHistory(old => [...old, ...items.filter(item => !old.some(a => a.id === item.id))]);
      page.current = nextPage; setMore(items.length === 50); setReady(true);
      onStateChange(stateOf(head.current));
      if (stateOf(head.current) === "accepted") onAccepted();
    } catch (e) {
      if (alive.current && current === version.current) {
        setError(e instanceof Error ? e.message : "Не удалось загрузить ответы.");
        if (nextPage === 1) onStateChange("error");
      }
    } finally { if (alive.current && current === version.current) setLoading(false); }
  }, [relationshipId, homeworkUid, taskId, onStateChange, onAccepted]);
  useEffect(() => { const generation = version; void load(1); return () => { generation.current++; }; }, [load, retry, refreshKey]);

  async function submit() {
    if (pending.current || loading || !ready || completed || finalizing || peerState !== "ready") return;
    if (!answer.trim()) { setError("Введите краткий ответ."); return; }
    pending.current = true; setBusy(true); onBusyChange?.(true); setError(""); setNotice("");
    try {
      request.current ??= { requestId: crypto.randomUUID(), answer };
      const saved = await api.submitAnswer(relationshipId, homeworkUid, taskId, request.current);
      if (!alive.current) return;
      request.current = null; setAnswer("");
      const replaced = isTest && !submitted && !saved.superseded;
      const items = [saved, ...head.current.filter(a => a.id !== saved.id).map(a => replaced && a.result === null && !a.appliedAt ? { ...a, superseded: true } : a)];
      head.current = items; setHistory(items); page.current = 1; setMore(items.length >= 50);
      onStateChange(stateOf(items));
      setNotice(saved.superseded ? "Эта версия уже заменена. Обновите историю ответов." : saved.result === null
        ? "Ответ сохранён. Он будет учтён после сдачи теста целиком." : saved.result === 0 ? "Ответ правильный. Задача зачтена." : "Ответ неправильный. Можно попробовать ещё раз.");
      if (saved.result === 0 && !saved.superseded) onAccepted();
      else onSaved();
    } catch (e) { if (alive.current) setError(e instanceof Error ? e.message : "Не удалось отправить ответ."); }
    finally { pending.current = false; if (alive.current) { setBusy(false); onBusyChange?.(false); } }
  }
  const automatic = mode === 1 || mode === 2;
  const peerMessage = peerState === "pending" ? "Работа ожидает преподавателя — краткий ответ пока недоступен."
    : peerState === "error" ? "Обновите историю ручных работ перед отправкой ответа."
      : peerState === "loading" ? "Проверяем историю ручных работ…" : "";
  return <section aria-label="Краткие ответы" className="mt-4 border-t pt-4 space-y-3">
    <h4 className="font-semibold">Краткий ответ</h4>
    {!automatic && <p>{mode === 3 ? "Для задачи нужна ручная проверка преподавателем." : "Автоматическая проверка не настроена. Можно отправить работу преподавателю."}</p>}
    {isTest && !submitted && <p>До сдачи теста результат скрыт. Можно заменить сохранённый краткий ответ; учтётся последняя версия.</p>}
    {isTest && submitted && <p>Тест сдан. Исправления неверных ответов проверяются сразу.</p>}
    <button disabled={busy || loading || finalizing} className="min-h-11 underline" onClick={() => setRetry(n => n + 1)}>Обновить историю ответов</button>
    {loading && <p role="status">Загрузка ответов…</p>}
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {notice && <p role="status">{notice}</p>}
    {history.map(attempt => <article key={attempt.id} className="border rounded p-3 space-y-1">
      <p className="whitespace-pre-wrap break-words">Ваш ответ: {attempt.submission}</p>
      <p>{answerAttemptLabel(attempt)}</p>
      <p className="text-sm">{new Date(attempt.submittedAt).toLocaleString("ru-RU")}</p>
    </article>)}
    {more && <button className="min-h-11 underline" disabled={busy || loading} onClick={() => void load(page.current + 1)}>Показать более ранние ответы</button>}
    {completed ? <p>Задача уже зачтена.</p> : automatic && <>
      {peerMessage && <p>{peerMessage}</p>}
      <form className="space-y-3" onSubmit={e => { e.preventDefault(); void submit(); }}>
        <label className="block">Ваш краткий ответ<input className="block w-full min-h-11 border rounded p-2" type="text" inputMode={mode === 2 ? "numeric" : "decimal"} maxLength={128}
          disabled={busy || loading || !ready || finalizing || peerState !== "ready"} value={answer} onChange={e => { setAnswer(e.target.value); request.current = null; }} /></label>
        <p className="text-sm">{mode === 2 ? "Только цифры, с сохранением порядка и ведущих нулей." : "Число без единиц измерения. Дробную часть можно отделять точкой или запятой."} Сохраняется только отправленный ответ.</p>
        <button type="submit" className="min-h-11 border rounded px-3 py-2 disabled:opacity-50" disabled={busy || loading || !ready || finalizing || peerState !== "ready"}>{busy ? "Отправка ответа…" : isTest && !submitted ? "Сохранить ответ для теста" : "Проверить ответ"}</button>
      </form>
    </>}
  </section>;
}
