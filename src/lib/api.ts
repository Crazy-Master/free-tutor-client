import { getToken } from "../store/auth";
import { UserInfoDto } from "../store/user";
import {
  DisciplineDto,
  StudentCardInfoDto,
  StudentToTeacherDto,
} from "../types/api-types";
import { TaskFilterDto } from "../types/api-types";
import {
  TaskTagDto,
  TopicDto,
  TestNumberDto,
  TypeResponseDto,
} from "../types/api-types";

const BASE_URL = "https://api-tutor-master.ru";

const request = async <T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: unknown
): Promise<T> => {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  console.log(`[API CALL] ${method} ${url}`);

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
};

export const api = {
  getDisciplines: () => request<DisciplineDto[]>("/api/disciplines"),

  getStudents: (disciplineId: number) =>
    request<StudentCardInfoDto[]>(
      `/api/student-to-teacher/teacher?disciplineId=${disciplineId}`
    ),

  postStudentLink: (payload: StudentToTeacherDto) =>
    request<StudentCardInfoDto>(
      "/api/student-to-teacher/teacher",
      "POST",
      payload
    ),

  deleteStudentLink: (id: number) =>
    request<void>(`/api/student-to-teacher/teacher/${id}`, "DELETE"),

  getTasks: (filter: TaskFilterDto) => {
    const query = new URLSearchParams();

    if (filter.tagIds?.length)
      filter.tagIds.forEach((id) => query.append("tagIds", id.toString()));

    if (filter.topicIds?.length)
      filter.topicIds.forEach((id) => query.append("topicIds", id.toString()));

    if (filter.testNumberIds?.length)
      filter.testNumberIds.forEach((id) =>
        query.append("testNumberIds", id.toString())
      );

    if (filter.typeResponseId !== undefined)
      query.append("typeResponseId", filter.typeResponseId.toString());

    if (filter.taskId !== undefined)
      query.append("taskId", filter.taskId.toString());

    if (filter.taskIdExternal)
      query.append("taskIdExternal", filter.taskIdExternal);

    if (filter.pageNumber)
      query.append("pageNumber", filter.pageNumber.toString());

    if (filter.pageSize) query.append("pageSize", filter.pageSize.toString());

    return fetch(`https://api-tutor-master.ru/api/tasks?${query.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => {
      if (!res.ok) {
        throw new Error("Ошибка загрузки задач");
      }
      return res.json();
    });
  },

  getTaskTags: (userId?: number) => {
    console.log("[API CALL] GET /api/task-tags?userId=", userId);
    return request<TaskTagDto[]>(
      `/api/task-tags${userId ? `?userId=${userId}` : ""}`
    );
  },

  getTopics: (disciplineId?: number) => {
    console.log("[API CALL] GET /api/topics?disciplineId=", disciplineId);
    return request<TopicDto[]>(
      `/api/topics${disciplineId ? `?disciplineId=${disciplineId}` : ""}`
    );
  },

  getTestNumbers: (disciplineId?: number) => {
    console.log("[API CALL] GET /api/test-numbers?disciplineId=", disciplineId);
    return request<TestNumberDto[]>(
      `/api/test-numbers${disciplineId ? `?disciplineId=${disciplineId}` : ""}`
    );
  },

  getTypeResponses: () => {
    console.log("[API CALL] GET /api/type-responses");
    return request<TypeResponseDto[]>("/api/type-responses");
  },

  updateUserInfo: (info: UserInfoDto) =>
    request<void>("/api/users/information", "PUT", info),

  createTag: async (tag: { name: string; color: string }) =>
    request<TaskTagDto>("/api/task-tags", "POST", tag),

  updateTag: async (tag: { tagId: number; name: string; color: string }) =>
    request<void>("/api/task-tags", "PUT", tag),

  deleteTag: async (tagId: number) =>
    request<void>(`/api/task-tags/${tagId}`, "DELETE"),

  addTagToTask: async (taskId: number, tagId: number) => {
    return request<void>("/api/tasks/add-tag", "POST", {
      taskId,
      tagId,
    });
  },

  removeTagFromTask: async (taskId: number, tagId: number) => {
    return request<void>("/api/tasks/remove-tag", "POST", {
      taskId,
      tagId,
    });
  },
};
