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

export interface TaskFilterDto {
  tagIds?: number[];
  topicIds?: number[];
  testNumberIds?: number[];
  typeResponseId?: number;
  taskId?: number;
  taskIdExternal?: string;
  pageNumber: number;
  pageSize: number;
}

export interface TaskFilterDto {
  tagIds?: number[];
  topicIds?: number[];
  testNumberIds?: number[];
  typeResponseId?: number;
  taskId?: number;
  taskIdExternal?: string;
  pageNumber: number;
  pageSize: number;
}

export interface ImageData {
  imageBase64: string;
}

export interface AnswerTask {
  shortAnswer?: number;
  textSolution?: string;
  solutionBase64?: string;
  solutionOwnBase64?: string[];
}

export interface TaskDto {
  taskId: number;
  taskIdExternal: string;
  textContent?: string;
  imageContent?: ImageData | null;
  problemSolving?: AnswerTask;
  answerTask?: string;
  testNumber?: string;
  year?: string;
  relevance?: boolean;
  groupNumber: number;
  homeUse?: string;
  typeResponseId?: number;
  resource?: string;
  disciplineId: number;

  tagIds?: number[];
  testNumberIds?: number[];
  topicIds?: number[];
}

export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface TaskTagDto {
  tagId: number;
  name: string;
  color: string;
}

export interface TopicDto {
  topicId: number;
  topic: string;
}

export interface TestNumberDto {
  testNumberId: number;
  number: string;
  name?: string;
}

export interface TypeResponseDto {
  typeResponseId: number;
  nameResponse: string;
}

export interface UpdateShortAnswerDto {
  taskId: number;
  shortAnswer: number;
}

export interface UpdateGroupNumberDto {
  taskId: number;
  groupNumber: number;
}

