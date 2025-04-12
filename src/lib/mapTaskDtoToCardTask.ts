import { TaskDto } from "../types/api-types";
import { Task } from "../components/tasks/TaskList";

export function mapTaskDtoToCardTask(dto: TaskDto): Task {
  return {
    taskId: dto.taskId,
    tags: dto.tagIds?.map(id => ({ name: `#${id}`, color: "#888" })) ?? [],
    topics: dto.topicIds?.map(id => `Topic ${id}`) ?? [],
    testNumber: dto.testNumber ?? "",
    textContent: dto.textContent,
    imageContent: dto.imageContent,
    shortAnswer: dto.answerTask ? parseFloat(dto.answerTask) : undefined,
    answerTask: dto.problemSolving ?? null,
    answerType: `Тип ${dto.typeResponseId ?? "-"}`,
    groupNumber: dto.groupNumber,
    year: dto.year ? parseInt(dto.year) : 0,
    relevance: dto.relevance ? "актуально" : "неактуально",
  };
}
