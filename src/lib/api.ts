import { request, authClient } from "./http";
export interface SolutionAccessStatus {
  taskId: number;
  taskIdExternal: string;
  ownPermission: boolean;
  otherTeacherPermission: boolean;
  correctAnswer: boolean;
  hasAccess: boolean;
}
import {
  DisciplineDto,
  StudentCardInfoDto,
  StudentInfoDto,
  StudentToTeacherDto,
  UpdateGroupNumberDto,
  UpdateShortAnswerDto,
  UserInfoDto,
  UserInfoExtendedDto,
} from "../types/api-types";
import { PagedResultDto, TaskDto, TaskFilterDto } from "../types/api-types";
import {
  TaskTagDto,
  TopicDto,
  TestNumberDto,
  TypeResponseDto,
} from "../types/api-types";

export const api = {
  getSolutionAccess: (relationshipId: number, taskId: number) =>
    request<SolutionAccessStatus>(`/api/solution-access/${relationshipId}/${taskId}`),
  grantSolutionAccess: (relationshipId: number, taskId: number) =>
    request<void>(`/api/solution-access/${relationshipId}/${taskId}`, "PUT"),
  revokeSolutionAccess: (relationshipId: number, taskId: number) =>
    request<void>(`/api/solution-access/${relationshipId}/${taskId}`, "DELETE"),
  getDisciplines: () => request<DisciplineDto[]>("/api/disciplines", "GET", undefined, { auth: false }),

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

  getTasks: async (filter: TaskFilterDto): Promise<PagedResultDto<TaskDto>> => {
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

    return request<PagedResultDto<TaskDto>>(`/api/tasks?${query.toString()}`);
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

  getTopicNamesByTaskId: (taskId: number) =>
    request<string[]>(`/api/topics/by-task/${taskId}`),

  getTypeResponseNameByTaskId: (taskId: number) =>
    request<string>(`/api/type-responses/by-task/${taskId}`, "GET", undefined, { format: "text" }),

  updateShortAnswer: (dto: UpdateShortAnswerDto) =>
    request<void>(`/api/tasks/update-short-answer`, "PUT", dto),

  updateGroupNumber: (dto: UpdateGroupNumberDto) =>
    request<void>(`/api/tasks/update-group-number`, "PUT", dto),

  getUserInfo: (userId: number) =>
    request<UserInfoExtendedDto>(`/api/users/information/${userId}`),

  getStudentInfo: (studentId: number) =>
    request<StudentInfoDto>(
      `/api/student-to-teacher/teacher-info/${studentId}`
    ),

  updateStudentCompletedTopics: (studentId: number, topicIds: number[]) =>
    request<void>("/api/student-to-teacher/teacher-info-only", "PUT", {
      id: studentId,
      information: {
        completedTopicIds: topicIds,
      },
    }),

  logout: authClient.logout,
};
