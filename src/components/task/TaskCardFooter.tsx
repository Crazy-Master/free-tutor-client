import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useUiStore } from "../../store/uiStore";
import EditFieldModal from "./EditFieldModal";

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
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const windowWidth = useUiStore((s) => s.windowWidth);

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

  const handleGroupSubmit = async (val: string) => {
    const parsed = parseInt(val);
    if (isNaN(parsed)) throw new Error("Неверный номер группы");
    await api.updateGroupNumber({ taskId, groupNumber: parsed });
  };

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
          <div
            className="overflow-x-auto absolute left-0 bottom-0 z-10 bg-white dark:bg-gray-800 border shadow-md p-3 rounded w-max text-sm text-left"
            style={{ width: `${Math.min(windowWidth * 0.7, 925)}px` }}
          >
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
                <strong>🧩 Группа:</strong>{" "}
                <span
                  className="underline cursor-pointer hover:text-blue-600"
                  onClick={() => setShowEditGroupModal(true)}
                >
                  {groupNumber}
                </span>
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

      {showEditGroupModal && (
        <EditFieldModal
          title="Изменить номер группы"
          label="Номер группы"
          initialValue={groupNumber ?? ""}
          inputType="number"
          onClose={() => setShowEditGroupModal(false)}
          onSubmit={handleGroupSubmit}
        />
      )}
    </div>
  );
};

export default TaskCardFooter;
