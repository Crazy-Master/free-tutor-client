import { api } from "../lib/api";
import { useDictionaryStore } from "../store/dictionaryStore";

let generation = 0;
let hasLoaded = {
  taskTags: false,
  topics: false,
  testNumbers: false,
  typeResponses: false,
};

export const dictionaryService = {
  async loadAll(userId: number, disciplineId?: number) {
    const currentGeneration = generation;
    const store = useDictionaryStore.getState();

    if (!hasLoaded.taskTags) {
      const tags = await api.getTaskTags(userId);
      if (currentGeneration !== generation) return;
      store.setTaskTags(tags);
      hasLoaded.taskTags = true;
    }

    if (!hasLoaded.topics) {
      const topics = await api.getTopics(disciplineId);
      if (currentGeneration !== generation) return;
      store.setTopics(topics);
      hasLoaded.topics = true;
    }

    if (!hasLoaded.testNumbers) {
      const nums = await api.getTestNumbers(disciplineId);
      if (currentGeneration !== generation) return;
      store.setTestNumbers(nums);
      hasLoaded.testNumbers = true;
    }

    if (!hasLoaded.typeResponses) {
      const types = await api.getTypeResponses();
      if (currentGeneration !== generation) return;
      store.setTypeResponses(types);
      hasLoaded.typeResponses = true;
    }
  },

  clear() {
    generation++;
    hasLoaded = { taskTags: false, topics: false, testNumbers: false, typeResponses: false };
  },

  reset() {
    generation++;
    hasLoaded = {
      taskTags: hasLoaded.taskTags,
      topics: false,
      testNumbers: false,
      typeResponses: hasLoaded.typeResponses
    };
  },
};
