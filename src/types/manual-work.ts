export type WorkStatus = 0 | 1 | 2 | 3;
export interface WorkImage { mimeType: string; data: string }
export interface ManualWork {
  id: string; relationshipId: number; homeworkUid: string; homeworkNumber: number;
  taskId: number; studentId: number; teacherId: number; text: string; images: WorkImage[];
  submittedAt: string; status: WorkStatus; comment: string; reviewedAt: string | null;
}
export interface SubmitWork { requestId: string; text: string; images: WorkImage[] }
export const workStatusLabel = (status: WorkStatus) => ["Ожидает проверки", "Зачтено", "На доработку", "Не зачтено"][status];
