export type SubmissionState = "loading" | "error" | "ready" | "pending" | "accepted";
export interface AnswerAttempt {
  id: string; relationshipId: number; homeworkUid: string; taskId: number;
  submission: string; submittedAt: string; appliedAt: string | null;
  superseded: boolean; result: 0 | 1 | null;
}
export interface SubmitAnswer { requestId: string; answer: string }
export function answerAttemptLabel(attempt: AnswerAttempt) {
  if (attempt.superseded) return "Заменён до сдачи теста — не учитывается";
  if (attempt.result === 0) return "Правильно";
  if (attempt.result === 1) return "Неправильно";
  return "Ответ сохранён — результат после сдачи теста";
}
