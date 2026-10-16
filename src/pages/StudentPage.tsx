import { useCallback, useEffect, useRef, useState } from "react";
import ManualWorkPanel from "../components/student/ManualWorkPanel";
import AutomaticAnswerPanel from "../components/student/AutomaticAnswerPanel";
import type { SubmissionState } from "../types/answer-attempt";
import { api } from "../lib/api";
import type { DisciplineDto, HomeworkInfo, StudentToTeacherDto, TaskDto } from "../types/api-types";

const groups = [["homeworks", "Назначено"], ["inProgressHomeworks", "В работе"], ["completedHomeworks", "Завершено"]] as const;

function dateLabel(value?: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return "Дата не указана";
  return new Date(value).toLocaleDateString("ru-RU");
}

function AssignedTask({ taskId, relationshipId, homeworkUid, isTest, submitted, taskCompleted, refreshKey, onProgress, finalizing, onResponseBusy }: {
  taskId: number; relationshipId?: number; homeworkUid?: string; isTest: boolean; submitted: boolean;
  taskCompleted: boolean; refreshKey: number; onProgress: () => void;
  finalizing: boolean; onResponseBusy: (busy: boolean) => void;
}) {
  const [task, setTask] = useState<TaskDto | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const acceptedSeen = useRef(false);
  const [manualState, setManualState] = useState<SubmissionState>("loading");
  const [autoState, setAutoState] = useState<SubmissionState>("loading");
  const [autoBusy, setAutoBusy] = useState(false);
  const [manualBusy, setManualBusy] = useState(false);
  useEffect(() => { onResponseBusy(autoBusy || manualBusy); return () => onResponseBusy(false); }, [autoBusy, manualBusy, onResponseBusy]);
  const completed = taskCompleted || manualState === "accepted" || autoState === "accepted";
  const refreshTask = useCallback(() => {
    if (acceptedSeen.current) return;
    acceptedSeen.current = true; setRetry(n => n + 1); onProgress();
  }, [onProgress]);
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
        {(task.problemSolving || task.referenceAnswer != null) && <details className="mt-4 rounded border p-3"><summary className="cursor-pointer min-h-11">Посмотреть решение</summary>
          {task.referenceAnswer != null ? <p>Краткий ответ: {task.referenceAnswer}</p> : (!task.checkingMode && task.problemSolving?.shortAnswer != null && <p>Краткий ответ: {task.problemSolving.shortAnswer}</p>)}
          {task.problemSolving?.textSolution && <p className="whitespace-pre-wrap">{task.problemSolving.textSolution}</p>}
          {[task.problemSolving?.solutionBase64, ...(task.problemSolving?.solutionOwnBase64 ?? [])].filter(Boolean).map((image, i) =>
            <img key={i} className="max-w-full h-auto mt-3" alt={`Решение ${i + 1}`} src={image!.startsWith("data:") ? image : `data:image/png;base64,${image}`} />)}
        </details>}
        {relationshipId && homeworkUid && homeworkUid !== "00000000-0000-0000-0000-000000000000"
          ? <>
            <AutomaticAnswerPanel relationshipId={relationshipId} homeworkUid={homeworkUid} taskId={taskId} mode={task.checkingMode ?? 0}
              isTest={isTest} submitted={submitted} completed={completed} peerState={manualState} refreshKey={refreshKey}
              onStateChange={setAutoState} onAccepted={refreshTask} onSaved={onProgress} finalizing={finalizing || manualBusy} onBusyChange={setAutoBusy} />
            <ManualWorkPanel relationshipId={relationshipId} homeworkUid={homeworkUid} taskId={taskId} onAccepted={refreshTask}
              onStateChange={setManualState} onSaved={onProgress} refreshKey={refreshKey} onBusyChange={setManualBusy}
              completed={completed}
              disabledReason={finalizing || autoBusy ? "Дождитесь завершения отправки ответа или сдачи теста." : completed ? "Задача уже зачтена — новая работа не требуется." : autoState === "pending"
                ? "Для теста уже сохранён краткий ответ. Его можно заменить в форме выше; ручная работа пока недоступна."
                : autoState === "loading" ? "Проверяем историю кратких ответов…" : autoState === "error" ? "Обновите историю ответов перед отправкой ручной работы." : undefined} />
          </>
          : <p className="text-sm mt-4">Для отправки работы обновите список ДЗ. Просмотр задачи не изменяет прогресс.</p>}
      </>}
  </section>;
}

function HomeworkView({ homework, relationshipId, onProgress }: { homework: HomeworkInfo; relationshipId?: number; onProgress: () => void }) {
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [testNotice, setTestNotice] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [localSubmitted, setSubmitted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [responseBusy, setResponseBusy] = useState(false);
  const submitted = localSubmitted || !!homework.submittedAt;
  const isTest = homework.type === 1 || homework.type === "Test";
  const submitPending = useRef(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  async function submitTest() {
    if (!relationshipId || !homework.homeworkUid || submitPending.current || responseBusy || submitted) return;
    submitPending.current = true; setSubmitting(true); setTestNotice(""); setSubmitError("");
    try {
      await api.submitTest(relationshipId, homework.homeworkUid);
      if (!alive.current) return;
      setSubmitted(true); setRefreshKey(n => n + 1); onProgress();
      setTestNotice("Тест сдан. Результаты кратких ответов доступны; ручные работы ожидают преподавателя.");
    }
    catch (e) { if (alive.current) setSubmitError(e instanceof Error ? e.message : "Не удалось сдать тест."); }
    finally { submitPending.current = false; if (alive.current) setSubmitting(false); }
  }
  const tasks = [...new Set((homework.taskIds ?? []).map(t => t.id).filter(id => Number.isSafeInteger(id) && id > 0))];
  return <div className="mt-3">
    {isTest && relationshipId && homework.homeworkUid && <div className="mb-3 space-y-2">
      <p>Сохраните краткий ответ или отправьте ручную работу по каждой задаче, затем сдайте тест целиком. До сдачи новые результаты и решения скрыты. Уже выданный ранее доступ к решению сохраняется.</p>
      <button className="min-h-11 border rounded px-3 py-2" disabled={submitting || submitted || responseBusy} onClick={() => void submitTest()}>{submitted ? "Тест сдан" : "Сдать тест на проверку"}</button>
      {testNotice && <p role="status">{testNotice}</p>}
      {submitError && <p role="alert" className="text-red-700">{submitError}</p>}
    </div>}
    {tasks.length === 0 ? <p>В этом задании пока нет задач.</p> : <>
      <div role="group" aria-label="Задачи домашнего задания" className="flex flex-wrap gap-2">
        {tasks.map((id, i) => <button key={id} className="min-h-11 rounded border px-3 py-2" aria-pressed={selectedTask === id} onClick={() => setSelectedTask(id)}>Задача {i + 1} · #{id}</button>)}
      </div>
      {selectedTask !== null && <AssignedTask key={selectedTask} taskId={selectedTask} relationshipId={relationshipId} homeworkUid={homework.homeworkUid}
        isTest={isTest} submitted={submitted} taskCompleted={!!homework.taskIds.find(t => t.id === selectedTask)?.completedAt}
        refreshKey={refreshKey} onProgress={onProgress} finalizing={submitting} onResponseBusy={setResponseBusy} />}
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
  const [progressError, setProgressError] = useState("");
  const progressVersion = useRef(0);
  const alive = useRef(true);
  useEffect(() => { const generation = progressVersion; alive.current = true; return () => { alive.current = false; generation.current++; }; }, []);
  const refreshProgress = useCallback(() => {
    const version = ++progressVersion.current;
    void api.getStudentAssignments().then(data => {
      if (alive.current && version === progressVersion.current) { setRecords(data); setProgressError(""); }
    }).catch(() => { if (alive.current && version === progressVersion.current) setProgressError("Ответ сохранён, но список ДЗ не обновился. Нажмите «Обновить список»."); });
  }, []);
  useEffect(() => {
    let cancelled = false;
    progressVersion.current++;
    setLoading(true); setError(""); setProgressError(""); setRecords([]); setOpen(null);
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
      {progressError && <p role="alert" className="text-red-700">{progressError}</p>}
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
          {open === key && <HomeworkView key={key} homework={homework} relationshipId={record.id} onProgress={refreshProgress} />}
        </article>;
      })}
    </div>
  </main>;
}
