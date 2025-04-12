import React, { useState } from "react";

interface Props {
  topics: string[];
  answerType: string;
  groupNumber?: number;
  year: number;
  relevance: string;
}

const TaskCardFooter: React.FC<Props> = ({ topics, answerType, groupNumber, year, relevance }) => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="flex justify-between items-center mt-4 relative text-sm">
      {/* Кнопка Инфо */}
      <div className="relative">
        <button
          onClick={() => setShowPopup((prev) => !prev)}
          className="underline text-blue-600 hover:text-blue-800"
        >
          Инфо
        </button>

        {showPopup && (
          <div className="absolute z-10 left-0 top-full mt-1 bg-white dark:bg-gray-800 border shadow-md p-3 rounded w-max text-xs text-left">
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
          </div>
        )}
      </div>

      {/* Год и актуальность */}
      <div className="text-gray-500 text-xs">
        {year} – {relevance}
      </div>
    </div>
  );
};

export default TaskCardFooter;
