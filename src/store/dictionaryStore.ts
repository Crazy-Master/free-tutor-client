import { create } from "zustand";
import {
  TaskTagDto,
  TopicDto,
  TestNumberDto,
  TypeResponseDto,
  DisciplineDto,
} from "../types/api-types";

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
}

export const useDictionaryStore = create<DictionaryStore>((set) => ({
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
  setTopics: (t) => set({ topics: t, loadedTopics: true  }),
  setTestNumbers: (t) => set({ testNumbers: t, loadedTestNumbers: true   }),
  setTypeResponses: (t) => set({ typeResponses: t, loadedTypeResponses: true   }),
  setDisciplines: (d) => set({ disciplines: d }),

  resetDisciplineDependentData: () =>
    set({
      topics: [],
      testNumbers: [],
      loadedTopics: false,
      loadedTestNumbers: false,
    }),
}));
