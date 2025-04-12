import React, { useState } from "react";
import { TaskFilterDto } from "../../types/api-types";

interface Props {
  onSearch: (filter: TaskFilterDto) => void;
  onReset?: () => void;
}

const TaskFilterPanel: React.FC<Props> = ({ onSearch, onReset }) => {
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [topicIds, setTopicIds] = useState<number[]>([]);
  const [testNumberIds, setTestNumberIds] = useState<number[]>([]);
  const [typeResponseId, setTypeResponseId] = useState<number | null>(null);
  const [taskId, setTaskId] = useState<string>("");
  const [taskIdExternal, setTaskIdExternal] = useState<string>("");

  const handleSubmit = () => {
    onSearch({
      tagIds,
      topicIds,
      testNumberIds,
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
    <div className="border p-4 rounded shadow-md space-y-2">
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          placeholder="Номер на сайте"
          className="border px-3 py-1 rounded w-48"
        />
        <input
          type="text"
          value={taskIdExternal}
          onChange={(e) => setTaskIdExternal(e.target.value)}
          placeholder="Номер на ФИПИ"
          className="border px-3 py-1 rounded w-48"
        />
        {/* Тут появятся выпадающие списки тегов, тем, и прочее */}
      </div>

      <div className="flex gap-4 pt-2">
        <button
          onClick={handleSubmit}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          Найти
        </button>
        <button
          onClick={handleReset}
          className="border px-4 py-2 rounded hover:bg-gray-100"
        >
          Сбросить фильтр
        </button>
      </div>
    </div>
  );
};

export default TaskFilterPanel;
