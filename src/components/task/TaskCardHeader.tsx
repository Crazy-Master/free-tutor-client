import React from "react";

interface TaskCardHeaderProps {
  taskId: number | string;
  tags: { name: string; color: string }[];
  testNumber?: string;
  onTagClick?: (tag: string) => void;
}

const TaskCardHeader: React.FC<TaskCardHeaderProps> = ({
  taskId,
  tags,
  testNumber,
  onTagClick,
}) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <div className="text-sm font-bold">ID: {taskId}</div>

      <div className="flex items-center gap-2 flex-wrap justify-end">
        {tags.map(({ name, color }, index) => (
          <button
            key={index}
            onClick={() => onTagClick && onTagClick(name)}
            className={`text-xs px-2 py-0.5 rounded hover:opacity-90`}
            style={{ backgroundColor: color, color: "#fff" }}
          >
            {name}
          </button>
        ))}

        {testNumber && (
          <span className="text-xs bg-gray-200 text-gray-800 px-2 py-0.5 rounded">
            {testNumber}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCardHeader;
