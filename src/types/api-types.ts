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
  section: string;
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

export interface UserInfoExtendedDto {
  lastActiveAt: string | null;
}

export interface TaskInfo {
  taskId: number;
  wrongAttempts: number;
}

export interface TaskHome {
  taskId: number;
  wrongAttempts: number;
  assignedAt: string;
}

export interface HomeworkInfo {
  idHomework: number;
  assignedAt: string;
  completedAt?: string | null;
  taskIds: { id: number; type: TaskType }[];
  type: HomeworkType;
}

export enum HomeworkType {
  Classic = "Classic",
  Test = "Test",
}

export enum TaskType {
  Forced = "Forced",
  AvailableUnsolved = "AvailableUnsolved",
  Group1 = "Group1",
  Group2 = "Group2",
  Group3 = "Group3",
}

export interface StudentInfoDto {
  completedTopicIds: number[];
  useTaskIds: TaskInfo[];
  lessonTaskIds: TaskHome[];
  group1TaskIds: number[];
  group2TaskIds: TaskHome[];
  group3TaskIds: TaskHome[];
  availableUnsolvedTaskIds: number[];
  homeworks: HomeworkInfo[];
  inProgressHomeworks: HomeworkInfo[];
  completedHomeworks: HomeworkInfo[];
  analyzeInLessonTaskIds: number[];
  contIdHomework: number;
}

export interface UpdateStudentToTeacherInfoDto {
  id: number;
  information: Partial<StudentInfoDto>;
}

export interface UserInfoDto {
  lastDisciplineId: number;
  studentIds: number[];
  notes: Record<number, string>;
}

export interface UserAuthDto {
  email: string;
  lastActiveAt: string | null;
  information: UserInfoDto;
}
