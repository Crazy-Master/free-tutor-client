export interface DisciplineDto {
    disciplineId: number;
    discipline: string;
    typeExam: string;
  }
  
  export interface StudentCardInfoDto {
    id: number;
    studentId: number;
    login: string;
    lastActiveAt: string | null;
  }
  
  export interface StudentToTeacherDto {
    id?: number;
    studentId: number;
    teacherId: number;
    disciplineId: number;
    information: StudentInfoDto;
  }
  
  export interface StudentInfoDto {
    notes?: Record<number, string>;
  }
  