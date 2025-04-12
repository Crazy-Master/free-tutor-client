import { getToken } from "../store/auth";
import { DisciplineDto, StudentCardInfoDto, StudentToTeacherDto, TaskDto } from "../types/api-types";
import { TaskFilterDto } from "../types/api-types";
import { PagedResultDto } from "../types/api-types";
import {
  TaskTagDto,
  TopicDto,
  TestNumberDto,
  TypeResponseDto
} from "../types/api-types";

const BASE_URL = "https://api-tutor-master.ru";

async function request<T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: unknown
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Ошибка API");
    }

    try {
      return await res.json();
    } catch {
      return {} as T;
    }
  } catch (e) {
    if (e instanceof Error) {
      throw e;
    }
    throw new Error("Неизвестная ошибка при выполнении запроса");
  }
}

export const api = {
  getDisciplines: () => request<DisciplineDto[]>("/api/disciplines"),

  getStudents: (disciplineId: number) =>
    request<StudentCardInfoDto[]>(`/api/student-to-teacher/teacher?disciplineId=${disciplineId}`),

  postStudentLink: (payload: StudentToTeacherDto) =>
    request<StudentCardInfoDto>("/api/student-to-teacher/teacher", "POST", payload),

  deleteStudentLink: (id: number) =>
    request<void>(`/api/student-to-teacher/teacher/${id}`, "DELETE"),

  getTasks: (filter: TaskFilterDto) =>
    request<PagedResultDto<TaskDto>>("/api/tasks", "GET", filter),

  getTaskTags: (userId?: number) =>
    request<TaskTagDto[]>(`/api/task-tags${userId ? `?userId=${userId}` : ""}`),
  
  getTopics: (disciplineId?: number) =>
    request<TopicDto[]>(`/api/topics${disciplineId ? `?disciplineId=${disciplineId}` : ""}`),
  
  getTestNumbers: (disciplineId?: number) =>
    request<TestNumberDto[]>(`/api/test-numbers${disciplineId ? `?disciplineId=${disciplineId}` : ""}`),
  
  getTypeResponses: () =>
    request<TypeResponseDto[]>("/api/type-responses"),
};
