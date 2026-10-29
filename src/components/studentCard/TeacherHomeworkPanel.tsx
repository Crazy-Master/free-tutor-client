import { useEffect, useRef, useState } from "react";
import { api } from "../../lib/api";
import { authClient } from "../../lib/http";
import { ApiError } from "../../lib/authClient";
import type { HomeworkInfo, StudentInfoDto, TaskDto, TopicDto } from "../../types/api-types";
import { defaultGenerateHomeworkDto, type GenerateHomeworkDto } from "../../types/homework";

const buckets = [["homeworks", "Назначено"], ["inProgressHomeworks", "В работе"], ["completedHomeworks", "Завершено"]] as const;
const date = (value?: string | null) => value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleString("ru-RU") : "не указана";

function TaskPreview({ id }: { id: number }) {
  const [task, setTask] = useState<TaskDto | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setTask(null); setError("");
    void api.getTask(id).then(t => { if (!cancelled) setTask(t); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : "Не удалось загрузить условие."); });
    return () => { cancelled = true; };
  }, [id, retry]);
  if (error) return <p role="alert">{error} <button className="min-h-11 underline" onClick={() => setRetry(n => n + 1)}>Повторить загрузку задачи</button></p>;
  if (!task) return <p role="status">Загрузка условия…</p>;
  return <div className="mt-2 space-y-2">
    <p>Внешний номер: {task.taskIdExternal || "не указан"} · Проверка: {task.checkingMode === 1 ? "число" : task.checkingMode === 2 ? "последовательность цифр" : task.checkingMode === 3 ? "вручную" : "не настроена — ученик может отправить работу вручную"}</p>
    {task.textContent && <p className="whitespace-pre-wrap">{task.textContent}</p>}
    {task.imageContent?.imageBase64 && <img className="max-w-full h-auto" alt={`Условие задачи ${id}`} src={task.imageContent.imageBase64} />}
    {!task.textContent && !task.imageContent?.imageBase64 && <p>Условие пока недоступно.</p>}
  </div>;
}

export function TeacherHomeworkList({ info }: { info: StudentInfoDto }) {
  const [open, setOpen] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const empty = buckets.every(([key]) => !info[key]?.length);
  return <section aria-label="Домашние задания ученика" className="space-y-4">
    <h2 className="text-xl font-semibold">Домашние задания</h2>
    {empty && <p>Домашних заданий пока нет.</p>}
    {buckets.map(([key, label]) => <div key={key} className="space-y-3"><h3 className="font-semibold">{label} ({info[key]?.length ?? 0})</h3>
      {(info[key] ?? []).map((h, index) => {
        const identity = h.homeworkUid || `${key}:${index}`;
        const tasks = [...new Map((h.taskIds ?? []).map(t => [t.id, t])).values()];
        return <article key={identity} className="rounded border p-3 min-w-0 break-words">
          <h4 className="font-semibold">Домашнее задание №{h.idHomework}</h4>
          <p>{h.type === 1 || h.type === "Test" ? "Тест" : "Обычное ДЗ"} · Назначено: {date(h.assignedAt)}</p>
          <p>Зачтено задач: {tasks.filter(t => t.completedAt).length} из {tasks.length}</p>
          {h.submittedAt && <p>Тест сдан: {date(h.submittedAt)}</p>}
          {h.completedAt && <p>Завершено: {date(h.completedAt)}</p>}
          <button className="min-h-11 underline" aria-expanded={open === identity} onClick={() => { setOpen(open === identity ? null : identity); setSelectedTask(null); }}>{open === identity ? "Скрыть состав" : "Посмотреть состав"}</button>
          {open === identity && <div className="space-y-2">
            {!tasks.length && <p>В этом ДЗ нет задач.</p>}
            {tasks.map((t, i) => <div key={t.id} className="rounded border p-2">
              <button className="min-h-11 text-left underline" aria-expanded={selectedTask === t.id} onClick={() => setSelectedTask(selectedTask === t.id ? null : t.id)}>Задача {i + 1} · #{t.id} · {t.completedAt ? "Зачтено" : "Ожидает решения или проверки"}</button>
              {selectedTask === t.id && <TaskPreview key={t.id} id={t.id} />}
            </div>)}
          </div>}
        </article>;
      })}
    </div>)}
    <p className="text-sm">Ручные работы и комментарии доступны в разделе «Проверка работ». Просмотр ДЗ не меняет прогресс ученика.</p>
  </section>;
}

export function CreateHomeworkPanel({ relationshipId, disciplineId, info, onCreated }: {
  relationshipId: number; disciplineId: number; info: StudentInfoDto; onCreated: (homework: HomeworkInfo) => void;
}) {
  const storageKey = `freetutor.homework.pending:${authClient.getSnapshot().boundary}:${relationshipId}`;
  const [restored] = useState<GenerateHomeworkDto | null>(() => {
    try { const value = JSON.parse(sessionStorage.getItem(storageKey) || "null") as GenerateHomeworkDto | null;
      return value?.requestId && value.studentToTeacherId === relationshipId && Array.isArray(value.additionalTaskIds) && Array.isArray(value.completeTopicsIds) ? value : null;
    } catch { return null; }
  });
  const [form, setForm] = useState(restored ?? defaultGenerateHomeworkDto);
  const [ids, setIds] = useState(restored?.additionalTaskIds.join(", ") ?? "");
  const [topics, setTopics] = useState<TopicDto[]>([]);
  const [topicError, setTopicError] = useState("");
  const [topicRetry, setTopicRetry] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState<number[]>(restored?.completeTopicsIds ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<HomeworkInfo | null>(null);
  const pending = useRef(false);
  const request = useRef<GenerateHomeworkDto | null>(restored);
  const [locked, setLocked] = useState(!!restored);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    let cancelled = false;
    setTopics([]); setTopicError("");
    void api.getTopics(disciplineId).then(t => { if (!cancelled) setTopics(t); })
      .catch(e => { if (!cancelled) setTopicError(e instanceof Error ? e.message : "Темы недоступны."); });
    return () => { cancelled = true; };
  }, [disciplineId, topicRetry]);

  async function submit() {
    if (pending.current || created) return;
    setError("");
    if (!request.current) {
      const parts = ids.trim() ? ids.trim().split(/[\s,;]+/) : [];
      if (parts.some(p => !/^\d+$/.test(p) || !Number.isSafeInteger(Number(p)) || Number(p) <= 0)) { setError("Укажите внутренние номера задач целыми положительными числами, через пробел или запятую."); return; }
      const additionalTaskIds = [...new Set(parts.map(Number))];
      if (!Number.isInteger(form.automaticTotalTaskCount) || form.automaticTotalTaskCount < 0 || form.automaticTotalTaskCount > 100 ||
          !Number.isInteger(form.currentTopicTaskCount) || form.currentTopicTaskCount < 0 || form.currentTopicTaskCount > form.automaticTotalTaskCount ||
          !Number.isInteger(form.taskBanPeriodDays) || form.taskBanPeriodDays < 0 || additionalTaskIds.length > 100) {
        setError("Проверьте целые количества: автоподбор от 0 до 100, по темам — не больше автоподбора, период повторения неотрицательный, вручную до 100 задач."); return;
      }
      if (!form.automaticTotalTaskCount && !additionalTaskIds.length) { setError("Добавьте хотя бы одну задачу или включите автоподбор."); return; }
      if ([form.group0Probability, form.group2Probability, form.group3Probability].some(v => !Number.isFinite(v) || v < 0 || v > 1) ||
          (form.automaticTotalTaskCount > form.currentTopicTaskCount && form.group0Probability + form.group2Probability + form.group3Probability <= 0)) {
        setError("Вероятности должны быть от 0 до 1; для повторения нужна хотя бы одна ненулевая."); return;
      }
      if (form.currentTopicTaskCount && !selectedTopics.length) { setError("Выберите темы для тематической части или установите её количество в 0."); return; }
      request.current = { ...form, additionalTaskIds, completeTopicsIds: selectedTopics, studentToTeacherId: relationshipId, requestId: crypto.randomUUID() };
      try { sessionStorage.setItem(storageKey, JSON.stringify(request.current)); }
      catch { request.current = null; setError("Не удалось сохранить параметры для безопасного повтора. Разрешите хранилище браузера и повторите."); return; }
    }
    pending.current = true; setBusy(true); setLocked(true);
    try {
      const homework = await api.generateHomework(request.current);
      if (!alive.current) return;
      try { sessionStorage.removeItem(storageKey); } catch { /* A stored retry still resolves to the same homework. */ }
      setCreated(homework); request.current = null; setLocked(false); onCreated(homework);
    } catch (e) {
      if (alive.current) {
        if (e instanceof ApiError && e.status === 400) {
          request.current = null; setLocked(false);
          try { sessionStorage.removeItem(storageKey); } catch { /* No assignment was saved. */ }
          setError(e.message);
        } else setError(`${e instanceof Error ? e.message : "Не удалось получить ответ сервера."} Повторите это же назначение: повтор не создаст второе ДЗ.`);
      }
    } finally { pending.current = false; if (alive.current) setBusy(false); }
  }

  return <section className="max-w-3xl space-y-4" aria-label="Формирование домашнего задания">
    <h2 className="text-xl font-semibold">Сформировать ДЗ</h2>
    <p>После подтверждения ДЗ сразу появится у ученика. Автоподбор может вернуть меньше задач, если подходящих не хватает; фактический состав доступен в списке ДЗ.</p>
    {created ? <div role="status">Домашнее задание №{created.idHomework} назначено. Задач: {created.taskIds.length}.
      <button className="block min-h-11 underline" onClick={() => { setCreated(null); setError(""); }}>Подготовить следующее ДЗ</button>
    </div> : <>
      <fieldset disabled={busy || locked} className="space-y-3 disabled:opacity-70">
        <label className="block">Вид задания<select className="block border rounded p-2 min-h-11 w-full" value={form.type} onChange={e => setForm({ ...form, type: Number(e.target.value) as 0 | 1 })}><option value={0}>Обычное ДЗ</option><option value={1}>Тест — результаты после общей сдачи</option></select></label>
        {([
          ["automaticTotalTaskCount", "Количество задач автоподбора (0 — только вручную)"],
          ["currentTopicTaskCount", "Из них по выбранным темам"], ["taskBanPeriodDays", "Не повторять задачи групп 2 и 3 раньше, чем через (дней)"],
          ["group0Probability", "Вес новых задач (от 0 до 1)"], ["group2Probability", "Вес закрепления (от 0 до 1)"], ["group3Probability", "Вес работы над ошибками (от 0 до 1)"],
        ] as const).map(([key, label]) => <label key={key} className="block">{label}<input type="number" min={0} step={key.includes("Probability") ? "0.01" : "1"} className="block w-full min-h-11 rounded border p-2" value={Number.isNaN(form[key]) ? "" : form[key]} onChange={e => setForm({ ...form, [key]: e.target.value === "" ? NaN : Number(e.target.value) })} /></label>)}
        <label className="block">Добавить задачи по внутренним номерам (# из банка)<textarea className="block w-full border rounded p-2" rows={3} placeholder="Например: 825, 826" value={ids} onChange={e => setIds(e.target.value)} /></label>
        <p className="text-sm">Эти задачи добавляются сверх автоподбора. Для точного состава укажите автоподбор 0.</p>
        <h3 className="font-semibold">Темы для тематической части</h3>
        <p className="text-sm">Выбранные ещё не пройденные темы будут отмечены пройденными при назначении.</p>
        <div className="max-h-64 overflow-y-auto border rounded p-2">
          {topics.map(t => <label className="flex gap-2 items-center min-h-11" key={t.topicId}><input type="checkbox" checked={selectedTopics.includes(t.topicId)} onChange={() => setSelectedTopics(v => v.includes(t.topicId) ? v.filter(id => id !== t.topicId) : [...v, t.topicId])} /><span>{t.section} · {t.topic}{info.completedTopicIds?.includes(t.topicId) ? " (пройдена)" : ""}</span></label>)}
          {!topics.length && !topicError && <p>Тем пока нет или они загружаются.</p>}
        </div>
      </fieldset>
      {topicError && <p role="alert">Не удалось загрузить темы: {topicError} <button disabled={busy} className="min-h-11 underline" onClick={() => setTopicRetry(n => n + 1)}>Повторить загрузку тем</button></p>}
      {error && <p role="alert">{error}</p>}
      <button disabled={busy} className="min-h-11 border rounded px-4 py-2 bg-primary text-text_light" onClick={() => void submit()}>{busy ? "Назначение…" : locked ? "Повторить это назначение" : "Назначить ДЗ ученику"}</button>
      {locked && <p>Параметры сохранены в этой вкладке, включая обновление страницы. Повторите назначение, чтобы получить подтверждение; затем можно будет подготовить следующее ДЗ.</p>}
    </>}
  </section>;
}
