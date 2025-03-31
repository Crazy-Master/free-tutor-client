import React from "react";

interface TaskCardProps {
  title: string;
  testNumbers: string[];
  textContent?: string;
  imageContent?: { imageBase64: string };
  type?: string;
  groupNumber?: number;
  year?: string;
  relevance?: boolean;
  resource?: string;
  tagNames?: string[];
  topicNames?: string[];
  shortAnswer?: number;
}

const TaskCard: React.FC<TaskCardProps> = ({
  title,
  testNumbers,
  textContent,
  imageContent,
  type,
  groupNumber,
  year,
  relevance,
  resource,
  tagNames,
  topicNames,
  shortAnswer,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex flex-wrap justify-between items-center mb-2">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="flex gap-2 text-xs text-gray-600">
          {testNumbers.map((num, i) => (
            <span key={i} className="bg-gray-200 px-2 py-0.5 rounded">
              📘 {num}
            </span>
          ))}
        </div>
      </div>

      {textContent && <p className="text-sm text-gray-700 mb-2">{textContent}</p>}

      {imageContent?.imageBase64 && (
        <img
          src={imageContent.imageBase64}
          alt="Изображение к задаче"
          className="max-w-full mb-2 rounded"
        />
      )}

      <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-2">
        {type && <span>✏️ Тип: {type}</span>}
        {groupNumber !== undefined && <span>🎯 Группа: {groupNumber}</span>}
        {year && <span>📅 Год: {year}</span>}
        {relevance !== undefined && (
          <span className={relevance ? "text-green-600" : "text-red-600"}>
            {relevance ? "✅ Актуально" : "🚫 Неактуально"}
          </span>
        )}
        {resource && <span>🔗 Ресурс: {resource}</span>}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {tagNames?.map((tag, i) => (
          <span
            key={`tag-${i}`}
            className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded cursor-help"
            title={`Тег: ${tag}`}
          >
            🏷️ {tag}
          </span>
        ))}
        {topicNames?.map((topic, i) => (
          <span
            key={`topic-${i}`}
            className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded cursor-help"
            title={`Тема: ${topic}`}
          >
            📚 {topic}
          </span>
        ))}
      </div>

      {shortAnswer !== undefined && (
        <div className="mt-2 text-sm text-green-600">
          ✅ Ответ: {shortAnswer}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
