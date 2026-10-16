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
        onMouseEnter={() => { if (windowWidth >= 1024) setIsHovering(true); }}
        onMouseLeave={() => { if (windowWidth >= 1024) setIsHovering(false); }}
      >
        <button type="button" aria-expanded={isHovering} onClick={() => setIsHovering(value => !value)} className="min-h-11 px-2 py-1 bg-primary text-text_light rounded hover:opacity-90 cursor-pointer">
          Инфо
        </button>

        {isHovering && (
          <div
            className={`overflow-x-auto absolute left-0 ${windowWidth >= 1024 ? "bottom-0" : "top-full mt-2"} z-10 bg-white border shadow-md p-3 rounded w-max text-sm text-left`}
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

      <div className="text-gray-500">
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
