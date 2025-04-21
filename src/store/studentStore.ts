import { create } from "zustand";

export interface StudentCardInfoDto {
  id: number;
  studentId: number;
  login: string;
  lastActiveAt: string | null;
}

interface StudentStoreState {
  students: StudentCardInfoDto[];
  setStudents: (students: StudentCardInfoDto[]) => void;
  getStudentById: (studentId: number) => StudentCardInfoDto | undefined;
}

export const useStudentStore = create<StudentStoreState>((set, get) => ({
  students: [],
  setStudents: (students) => set({ students }),
  getStudentById: (studentId) =>
    get().students.find((s) => s.studentId === studentId),
}));
