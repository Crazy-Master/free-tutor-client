import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";

interface Props {
  taskId: number;
  groupNumber?: number;
  year: number;
  relevance: string;
  resource?: string;
  taskIdExternal?: string;
}

const TaskCardFooter: React.FC<Props> = ({
  taskId,
  groupNumber,
  year,
  relevance,
  resource,
  taskIdExternal,
}) => {
  const [topics, setTopics] = useState<string[]>([]);
  const [answerType, setAnswerType] = useState<string>("");

  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const [topicList, typeName] = await Promise.all([
          api.getTopicNamesByTaskId(taskId),
          api.getTypeResponseNameByTaskId(taskId),
        ]);
        setTopics(topicList);
        setAnswerType(typeName);
      } catch (err) {
        console.error("Ошибка при загрузке инфо:", err);
      }
    };

    if (isHovering && topics.length === 0) {
      fetchInfo();
    }
  }, [isHovering, taskId, topics.length]);

  return (
    <div className="flex justify-between items-center mt-4 relative text-sm">
      <div
        className="relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="underline text-blue-600 hover:text-blue-800 cursor-pointer">
          Инфо
        </div>

        {isHovering && (
          <div className="max-w-[925px] mx-auto absolute left-0 bottom-0 z-10 bg-white dark:bg-gray-800 border shadow-md p-3 rounded w-max text-xs text-left">
            <div>
              <strong>📘 Темы:</strong>
              <ul className="list-disc ml-4">
                {topics.map((topic, index) => (
                  <li key={index}>{topic}</li>
                ))}
              </ul>
            </div>

            <div className="mt-2">
              <strong>✍️ Тип ответа:</strong> {answerType}
            </div>

            {groupNumber !== undefined && (
              <div className="mt-1">
                <strong>🧩 Группа:</strong> {groupNumber}
              </div>
            )}

            {resource && taskIdExternal && (
              <div className="mt-2 italic text-gray-500">
                {resource} – {taskIdExternal}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-gray-500 text-xs">
        {year} – {relevance}
      </div>
    </div>
  );
};

export default TaskCardFooter;
