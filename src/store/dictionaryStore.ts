import { create } from "zustand";
import {
  TaskTagDto,
  TopicDto,
  TestNumberDto,
  TypeResponseDto,
  DisciplineDto,
} from "../types/api-types";
import { api } from "../lib/api";

interface DictionaryStore {
  taskTags: TaskTagDto[];
  topics: TopicDto[];
  testNumbers: TestNumberDto[];
  typeResponses: TypeResponseDto[];
  disciplines: DisciplineDto[];

  loadedTaskTags: boolean;
  loadedTopics: boolean;
  loadedTestNumbers: boolean;
  loadedTypeResponses: boolean;

  setTaskTags: (tags: TaskTagDto[]) => void;
  setTopics: (t: TopicDto[]) => void;
  setTestNumbers: (t: TestNumberDto[]) => void;
  setTypeResponses: (t: TypeResponseDto[]) => void;
  setDisciplines: (d: DisciplineDto[]) => void;

  resetDisciplineDependentData: () => void;
  loadTaskTags: () => Promise<void>;

  taskMap: Record<number, { tagIds: number[] }>;
  getTagIds: (taskId: number) => number[];
  setTaskTagIds: (taskId: number, tagIds: number[]) => void;
}

export const useDictionaryStore = create<DictionaryStore>((set, get) => ({
  taskTags: [],
  topics: [],
  testNumbers: [],
  typeResponses: [],
  disciplines: [],

  loadedTaskTags: false,
  loadedTopics: false,
  loadedTestNumbers: false,
  loadedTypeResponses: false,

  setTaskTags: (tags) => set({ taskTags: tags, loadedTaskTags: true }),
  setTopics: (t) => set({ topics: t, loadedTopics: true }),
  setTestNumbers: (t) => set({ testNumbers: t, loadedTestNumbers: true }),
  setTypeResponses: (t) => set({ typeResponses: t, loadedTopics: true }),
  setDisciplines: (d) => set({ disciplines: d }),

  resetDisciplineDependentData: () =>
    set({
      topics: [],
      testNumbers: [],
      loadedTopics: false,
      loadedTestNumbers: false,
    }),

  loadTaskTags: async () => {
    const tags = await api.getTaskTags();
    set({ taskTags: tags, loadedTaskTags: true });
  },

  taskMap: {},

  getTagIds: (taskId) => get().taskMap[taskId]?.tagIds ?? [],

  setTaskTagIds: (taskId, tagIds) =>
    set((state) => ({
      taskMap: {
        ...state.taskMap,
        [taskId]: { ...(state.taskMap[taskId] ?? {}), tagIds },
      },
    })),
}));
