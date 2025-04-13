import { TaskDto } from "../types/api-types";
import { Task } from "../components/tasks/TaskList";
import { useDictionaryStore } from "../store/dictionaryStore";

export function mapTaskDtoToCardTask(dto: TaskDto): Task {
  const dictionaryStore = useDictionaryStore.getState();
  dictionaryStore.setTaskTagIds(dto.taskId, dto.tagIds ?? []);

  return {
    taskId: dto.taskId,
    tagIds: dto.tagIds ?? [],
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
