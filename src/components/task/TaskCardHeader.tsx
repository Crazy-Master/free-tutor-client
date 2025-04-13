import React, { useState } from "react";
import TagSelector from "../tags/TagSelector";

interface Tag {
  tagId: number;
  name: string;
  color: string;
}

interface TaskCardHeaderProps {
  taskId: number;
  tags: Tag[];
  testNumber?: string;
}

const TaskCardHeader: React.FC<TaskCardHeaderProps> = ({
  taskId,
  tags: initialTags,
  testNumber,
}) => {
  const [tags, setTags] = useState<Tag[]>(initialTags);

  return (
    <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
      <div className="text-sm font-bold whitespace-nowrap">ID: {taskId}</div>

      <TagSelector
        taskId={taskId}
        selectedTags={tags}
        onTagUpdate={setTags}
      />

      {testNumber && (
        <div className="text-xs bg-gray-200 text-gray-800 px-2 py-0.5 rounded whitespace-nowrap">
          номер в тесте — {testNumber}
        </div>
      )}
    </div>
  );
};

export default TaskCardHeader;
