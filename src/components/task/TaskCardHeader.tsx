import React from "react";
import TagSelector from "../tags/TagSelector";
import { useDictionaryStore } from "../../store/dictionaryStore";

interface Tag {
  tagId: number;
  name: string;
  color: string;
}

interface TaskCardHeaderProps {
  taskId: number;
  tagIds: number[];
  testNumber?: string;
}

const TaskCardHeader: React.FC<TaskCardHeaderProps> = ({
  taskId,
  tagIds,
  testNumber,
}) => {
  const { taskTags, setTaskTagIds } = useDictionaryStore();

  const fullTags = tagIds
    .map((id) => taskTags.find((t) => t.tagId === id))
    .filter((t): t is Tag => Boolean(t));

  return (
    <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
      <div className="text-md font-bold bg-secondary px-2 py-0.5 rounded whitespace-nowrap">ID: {taskId}</div>

      <TagSelector
        taskId={taskId}
        selectedTags={fullTags}
        onTagUpdate={(updated) =>
          setTaskTagIds(taskId, updated.map((t) => t.tagId))
        }
      />

      {testNumber && (
        <div className="text-md bg-secondary px-2 py-0.5 rounded whitespace-nowrap">
          №{testNumber}
        </div>
      )}
    </div>
  );
};

export default TaskCardHeader;
