import { StudentInfoDto } from "../types/api-types";

export const createEmptyStudentInfo = (): StudentInfoDto => ({
  completedTopicIds: [],
  useTaskIds: [],
  lessonTaskIds: [],
  group1TaskIds: [],
  group2TaskIds: [],
  group3TaskIds: [],
  availableUnsolvedTaskIds: [],
  homeworks: [],
  inProgressHomeworks: [],
  completedHomeworks: [],
  analyzeInLessonTaskIds: [],
  contIdHomework: 0,
});
