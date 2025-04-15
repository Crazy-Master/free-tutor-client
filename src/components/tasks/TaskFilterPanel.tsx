import { useState } from "react";
import { useUserInfoFromToken } from "../../hooks/useUserInfoFromToken";
import MultiSelectDropdown from "../common/MultiSelectDropdown";
import SingleSelectDropdown from "../common/SingleSelectDropdown";
import { useDictionaryStore } from "../../store/dictionaryStore";
import { TaskFilterDto } from "../../types/api-types";
import { useLoadDictionaries } from "../../hooks/useLoadDictionaries";

interface Props {
  onSearch: (dto: TaskFilterDto) => void;
  onReset?: () => void;
}

const TaskFilterPanel: React.FC<Props> = ({ onSearch, onReset }) => {
  const userInfo = useUserInfoFromToken();

  const [taskId, setTaskId] = useState("");
  const [taskIdExternal, setTaskIdExternal] = useState("");
  const [typeResponseId, setTypeResponseId] = useState<number | null>(null);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [topicIds, setTopicIds] = useState<number[]>([]);
  const [testNumberIds, setTestNumberIds] = useState<number[]>([]);
  const [expanded, setExpanded] = useState(false);

  const {
    taskTags,
    topics,
    testNumbers,
    typeResponses,
    loadedTaskTags,
    loadedTopics,
    loadedTestNumbers,
    loadedTypeResponses,
  } = useDictionaryStore();

  const disciplineId = localStorage.getItem("selectedDisciplineId")
    ? parseInt(localStorage.getItem("selectedDisciplineId")!)
    : 0;

  useLoadDictionaries(userInfo?.userId, disciplineId);

  const handleSearch = () => {
    onSearch({
      tagIds: tagIds.length > 0 ? tagIds : undefined,
      topicIds: topicIds.length > 0 ? topicIds : undefined,
      testNumberIds: testNumberIds.length > 0 ? testNumberIds : undefined,
      typeResponseId: typeResponseId ?? undefined,
      taskId: taskId ? parseInt(taskId) : undefined,
      taskIdExternal: taskIdExternal || undefined,
      pageNumber: 1,
      pageSize: parseInt(localStorage.getItem("taskLimit") ?? "10"),
    });
  };

  const handleReset = () => {
    setTagIds([]);
    setTopicIds([]);
    setTestNumberIds([]);
    setTypeResponseId(null);
    setTaskId("");
    setTaskIdExternal("");
    onReset?.();
  };

  return (
    <div className="w-full bg-gray-100 p-4 mb-4 rounded-lg shadow-md">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="mb-4 px-4 py-2 bg-primary text-white rounded hover:opacity-90"
      >
        {expanded ? "Скрыть фильтр" : "Показать фильтр"}
      </button>

      {expanded && (
        <div className="space-y-4 transition-all duration-300">
          <MultiSelectDropdown
            label="Теги"
            options={
              loadedTaskTags && taskTags.length === 0
                ? [{ id: -1, label: "отсутствует список тегов", disabled: true }]
                : taskTags.map((t) => ({
                    id: t.tagId,
                    label: t.name,
                    color: t.color,
                  }))
            }
            selected={tagIds}
            onChange={(ids) => setTagIds(ids.filter((id) => id !== -1))}
          />

          <MultiSelectDropdown
            label="Темы"
            options={
              loadedTopics && topics.length === 0
                ? [{ id: -1, label: "отсутствует список тем", disabled: true }]
                : topics.map((t) => ({ id: t.topicId, label: t.topic }))
            }
            selected={topicIds}
            onChange={(ids) => setTopicIds(ids.filter((id) => id !== -1))}
          />

          <MultiSelectDropdown
            label="Номера в тесте"
            options={
              loadedTestNumbers && testNumbers.length === 0
                ? [{ id: -1, label: "отсутствует список номеров", disabled: true }]
                : testNumbers.map((n) => ({
                    id: n.testNumberId,
                    label: `${n.number}${n.name ? ` – ${n.name}` : ""}`,
                  }))
            }
            selected={testNumberIds}
            onChange={(ids) => setTestNumberIds(ids.filter((id) => id !== -1))}
          />

          <SingleSelectDropdown
            label="Тип ответа"
            options={
              loadedTypeResponses && typeResponses.length === 0
                ? [{ id: -1, label: "отсутствует список вариантов ответов", disabled: true }]
                : typeResponses.map((t) => ({
                    id: t.typeResponseId,
                    label: t.nameResponse,
                  }))
            }
            selected={typeResponseId}
            onChange={(id) => setTypeResponseId(id === -1 ? null : id)}
          />

          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col max-w-[300px] w-full">
              <label className="mb-1 text-sm text-gray-700">Номер на сайте</label>
              <input
                type="number"
                placeholder="Введите ID"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="px-3 py-2 border rounded text-black"
              />
            </div>

            <div className="flex flex-col max-w-[300px] w-full">
              <label className="mb-1 text-sm text-gray-700">Номер на ФИПИ</label>
              <input
                type="text"
                placeholder="Например: 10A"
                value={taskIdExternal}
                onChange={(e) => setTaskIdExternal(e.target.value)}
                className="px-3 py-2 border rounded text-black"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-2">
            <button
              onClick={() => {
                handleSearch();
                setExpanded(false);
              }}
              className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
            >
              Найти
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-300 text-black rounded hover:opacity-90"
            >
              Сбросить фильтр
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskFilterPanel;
