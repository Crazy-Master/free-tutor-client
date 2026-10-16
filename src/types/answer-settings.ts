export type AnswerMode = 0 | 1 | 2 | 3;
export interface AnswerSettings { mode: AnswerMode; referenceAnswer: string | null; revision: number; legacyShortAnswer?: string | null }
export const answerModeLabel = (mode: number) => ["Не настроено", "Число", "Последовательность цифр", "Ручная проверка"][mode] ?? "Неизвестный режим";
