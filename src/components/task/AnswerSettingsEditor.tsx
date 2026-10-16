import { useEffect, useRef, useState } from "react";
import { api } from "../../lib/api";
import { answerModeLabel, type AnswerMode, type AnswerSettings } from "../../types/answer-settings";

export default function AnswerSettingsEditor({ taskId, onSaved, onClose }: {
  taskId: number; onSaved: (settings: AnswerSettings) => void; onClose: () => void;
}) {
  const [settings, setSettings] = useState<AnswerSettings | null>(null);
  const [mode, setMode] = useState<AnswerMode>(0);
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const alive = useRef(true); const pending = useRef(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    let cancelled = false;
    setSettings(null); setError("");
    void api.getAnswerSettings(taskId).then(data => {
      if (!cancelled) { setSettings(data); setMode(data.mode); setReference(data.referenceAnswer ?? ""); }
    }).catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : "Не удалось загрузить настройки."); });
    return () => { cancelled = true; };
  }, [taskId, retry]);
  const automatic = mode === 1 || mode === 2;
  async function save() {
    if (!settings || pending.current) return;
    if (automatic && !reference.trim()) { setError("Введите эталонный ответ."); return; }
    pending.current = true; setBusy(true); setError("");
    try {
      const result = await api.updateAnswerSettings(taskId, { mode, referenceAnswer: automatic ? reference : null, revision: settings.revision });
      if (alive.current) { onSaved(result); onClose(); }
    } catch (e) { if (alive.current) setError(e instanceof Error ? e.message : "Не удалось сохранить настройки."); }
    finally { pending.current = false; if (alive.current) setBusy(false); }
  }
  return <section aria-label="Настройки проверки" className="border rounded p-3 space-y-3">
    <h4 className="font-semibold">Проверка задачи #{taskId}</h4>
    <p className="text-sm">Это общие настройки задачи для всех преподавателей. Автоматическая отправка ответов ученика будет подключена следующим этапом.</p>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {!settings && !error && <p role="status">Загрузка настроек…</p>}
    <button disabled={busy} className="min-h-11 underline" onClick={() => setRetry(n => n + 1)}>Загрузить актуальные настройки</button>
    {settings && <form className="space-y-3" onSubmit={e => { e.preventDefault(); void save(); }}>
      <label className="block">Режим проверки<select className="block w-full min-h-11 border rounded p-2" disabled={busy} value={mode} onChange={e => setMode(Number(e.target.value) as AnswerMode)}>
        {([0,1,2,3] as AnswerMode[]).map(value => <option key={value} value={value}>{answerModeLabel(value)}</option>)}
      </select></label>
      {automatic ? <>
        <label className="block">Эталонный ответ<input className="block w-full min-h-11 border rounded p-2" type="text" maxLength={128} disabled={busy} value={reference} onChange={e => setReference(e.target.value)} /></label>
        <p className="text-sm">{mode === 1 ? "Число без единиц: например −0,5 (минус клавиатурный -). Точка и запятая равнозначны." : "Только цифры. Порядок и ведущие нули сохраняются: 0123 не равно 123."}</p>
        {settings.legacyShortAnswer != null && <button type="button" disabled={busy} className="min-h-11 underline" onClick={() => setReference(settings.legacyShortAnswer!)}>Взять прежний ответ: {settings.legacyShortAnswer} (проверьте перед сохранением)</button>}
      </> : <p>Эталон не используется. Сохранение этого режима удалит ранее настроенный эталон.</p>}
      <button type="submit" disabled={busy} className="min-h-11 rounded border px-3 py-2">{busy ? "Сохранение…" : "Сохранить настройки"}</button>
    </form>}
    <button disabled={busy} className="min-h-11 underline" onClick={onClose}>Закрыть настройки</button>
  </section>;
}
