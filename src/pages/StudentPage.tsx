import { useCallback, useEffect, useRef, useState } from "react";
import ManualWorkPanel from "../components/student/ManualWorkPanel";
import { api } from "../lib/api";
import type { DisciplineDto, HomeworkInfo, StudentToTeacherDto, TaskDto } from "../types/api-types";

const groups = [["homeworks", "Назначено"], ["inProgressHomeworks", "В работе"], ["completedHomeworks", "Завершено"]] as const;

function dateLabel(value?: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return "Дата не указана";
  return new Date(value).toLocaleDateString("ru-RU");
}

function AssignedTask({ taskId, relationshipId, homeworkUid }: { taskId: number; relationshipId?: number; homeworkUid?: string }) {
  const [task, setTask] = useState<TaskDto | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const acceptedSeen = useRef(false);
  const refreshTask = useCallback(() => {
    if (acceptedSeen.current) return;
    acceptedSeen.current = true; setRetry(n => n + 1);
  }, []);
  useEffect(() => {
    let cancelled = false;
    setTask(null); setError("");
    void api.getTask(taskId).then(value => { if (!cancelled) setTask(value); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : "Не удалось загрузить задачу."); });
    return () => { cancelled = true; };
  }, [taskId, retry]);
  return <section aria-label={`Условие задачи ${taskId}`} className="mt-4 min-w-0 break-words rounded border p-4">
    <h3 className="font-semibold">Задача #{taskId}</h3>
    {error ? <div role="alert"><p>{error}</p><button className="min-h-11 underline" onClick={() => setRetry(n => n + 1)}>Повторить загрузку задачи</button></div>
      : !task ? <p role="status">Загрузка задачи…</p> : <>
        {task.textContent && <p className="whitespace-pre-wrap mt-3">{task.textContent}</p>}
        {task.imageContent?.imageBase64 && <img className="mt-3 max-w-full h-auto" src={task.imageContent.imageBase64} alt={`Условие задачи ${taskId}`} />}
        {!task.textContent && !task.imageContent?.imageBase64 && <p>Условие задачи пока недоступно.</p>}
        {task.problemSolving && <details className="mt-4 rounded border p-3"><summary className="cursor-pointer min-h-11">Посмотреть решение</summary>
          {task.problemSolving.shortAnswer != null && <p>Краткий ответ: {task.problemSolving.shortAnswer}</p>}
          {task.problemSolving.textSolution && <p className="whitespace-pre-wrap">{task.problemSolving.textSolution}</p>}
          {[task.problemSolving.solutionBase64, ...(task.problemSolving.solutionOwnBase64 ?? [])].filter(Boolean).map((image, i) =>
            <img key={i} className="max-w-full h-auto mt-3" alt={`Решение ${i + 1}`} src={image!.startsWith("data:") ? image : `data:image/png;base64,${image}`} />)}
        </details>}
        {relationshipId && homeworkUid && homeworkUid !== "00000000-0000-0000-0000-000000000000"
          ? <ManualWorkPanel key={`${relationshipId}:${homeworkUid}:${taskId}`} relationshipId={relationshipId} homeworkUid={homeworkUid} taskId={taskId} onAccepted={refreshTask} />
          : <p className="text-sm mt-4">Для отправки работы обновите список ДЗ. Просмотр задачи не изменяет прогресс.</p>}
      </>}
  </section>;
}

function HomeworkView({ homework, relationshipId }: { homework: HomeworkInfo; relationshipId?: number }) {
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [testNotice, setTestNotice] = useState("");
  const [submitted, setSubmitted] = useState(!!homework.submittedAt);
  const submitPending = useState(() => ({ current: false }))[0];
  async function submitTest() {
    if (!relationshipId || !homework.homeworkUid || submitPending.current) return;
    submitPending.current = true; setSubmitting(true); setTestNotice("");
    try { await api.submitManualTest(relationshipId, homework.homeworkUid); setSubmitted(true); setTestNotice("Тест сдан на проверку преподавателю."); }
    catch (e) { setTestNotice(e instanceof Error ? e.message : "Не удалось сдать тест."); }
    finally { submitPending.current = false; setSubmitting(false); }
  }
  const tasks = [...new Set((homework.taskIds ?? []).map(t => t.id).filter(id => Number.isSafeInteger(id) && id > 0))];
  return <div className="mt-3">
    {(homework.type === 1 || homework.type === "Test") && relationshipId && homework.homeworkUid && <div className="mb-3">
      <p>Работы по задачам теста отправляются отдельно. После отправки всех работ сдайте тест целиком.</p>
      <button className="min-h-11 border rounded px-3 py-2" disabled={submitting || submitted} onClick={() => void submitTest()}>{submitted ? "Тест сдан" : "Сдать тест на проверку"}</button>
      {testNotice && <p role="status">{testNotice}</p>}
    </div>}
    {tasks.length === 0 ? <p>В этом задании пока нет задач.</p> : <>
      <div role="group" aria-label="Задачи домашнего задания" className="flex flex-wrap gap-2">
        {tasks.map((id, i) => <button key={id} className="min-h-11 rounded border px-3 py-2" aria-pressed={selectedTask === id} onClick={() => setSelectedTask(id)}>Задача {i + 1} · #{id}</button>)}
      </div>
      {selectedTask !== null && <AssignedTask key={selectedTask} taskId={selectedTask} relationshipId={relationshipId} homeworkUid={homework.homeworkUid} />}
    </>}
  </div>;
}

export default function StudentPage() {
  const [records, setRecords] = useState<StudentToTeacherDto[]>([]);
  const [disciplines, setDisciplines] = useState<DisciplineDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(""); setRecords([]); setOpen(null);
    void api.getStudentAssignments().then(data => { if (!cancelled) setRecords(data); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : "Не удалось загрузить домашние задания."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    // Missing dictionary labels must not prevent access to assigned work.
    void api.getDisciplines().then(data => { if (!cancelled) setDisciplines(data); }).catch(() => {});
    return () => { cancelled = true; };
  }, [retry]);
  const entries = records.flatMap((record, recordIndex) => groups.flatMap(([field, status]) =>
    (record.information?.[field] ?? []).map((homework, index) => ({ record, homework, status,
      // Legacy homework numbers can repeat within the same relationship.
      key: `${record.id ?? recordIndex}:${homework.homeworkUid && homework.homeworkUid !== "00000000-0000-0000-0000-000000000000" ? homework.homeworkUid : `${field}:${index}`}`,
    }))));
  return <main className="min-h-screen bg-background text-text p-4 sm:p-6">
    <div className="max-w-4xl mx-auto min-w-0 break-words">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold">Мои домашние задания</h1>
        <button className="min-h-11 rounded border px-3 py-2 disabled:opacity-50" disabled={loading} onClick={() => setRetry(n => n + 1)}>Обновить список</button>
      </div>
      {loading && <p role="status">Загрузка домашних заданий…</p>}
      {error && <div role="alert"><p>{error}</p><button className="min-h-11 underline" onClick={() => setRetry(n => n + 1)}>Повторить загрузку</button></div>}
      {!loading && !error && entries.length === 0 && <p>Домашних заданий пока нет. Они появятся здесь, когда преподаватель их назначит.</p>}
      {!loading && !error && entries.map(({ record, homework, status, key }) => {
        const discipline = disciplines.find(d => d.disciplineId === record.disciplineId);
        return <article key={key} className="rounded border p-4 mb-4 bg-white">
          <h2 className="text-lg font-semibold">Домашнее задание №{homework.idHomework}</h2>
          <p>{discipline ? `${discipline.typeExam} · ${discipline.discipline}` : `Дисциплина #${record.disciplineId}`} · Преподаватель #{record.teacherId}</p>
          <p>{status} · Назначено: {dateLabel(homework.assignedAt)}</p>
          {homework.completedAt && <p>Завершено: {dateLabel(homework.completedAt)}</p>}
          <button className="min-h-11 mt-2 rounded border px-3 py-2" aria-expanded={open === key} onClick={() => setOpen(open === key ? null : key)}>{open === key ? "Скрыть задание" : "Открыть задание"}</button>
          {open === key && <HomeworkView key={key} homework={homework} relationshipId={record.id} />}
        </article>;
      })}
    </div>
  </main>;
}
