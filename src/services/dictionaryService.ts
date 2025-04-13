import { api } from "../lib/api";
import { useDictionaryStore } from "../store/dictionaryStore";

let hasLoaded = {
  taskTags: false,
  topics: false,
  testNumbers: false,
  typeResponses: false,
};

export const dictionaryService = {
  async loadAll(userId: number, disciplineId?: number) {
    const store = useDictionaryStore.getState();

    if (!hasLoaded.taskTags) {
      const tags = await api.getTaskTags(userId);
      store.setTaskTags(tags);
      hasLoaded.taskTags = true;
    }

    if (!hasLoaded.topics) {
      const topics = await api.getTopics(disciplineId);
      store.setTopics(topics);
      hasLoaded.topics = true;
    }

    if (!hasLoaded.testNumbers) {
      const nums = await api.getTestNumbers(disciplineId);
      store.setTestNumbers(nums);
      hasLoaded.testNumbers = true;
    }

    if (!hasLoaded.typeResponses) {
      const types = await api.getTypeResponses();
      store.setTypeResponses(types);
      hasLoaded.typeResponses = true;
    }
  },

  reset() {
    hasLoaded = {
      taskTags: hasLoaded.taskTags,
      topics: false,
      testNumbers: false,
      typeResponses: hasLoaded.typeResponses
    };
  },
};
