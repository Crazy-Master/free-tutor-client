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
    <div className="bg-background text-text p-4 rounded-lg shadow mb-4">
      <div className="flex flex-wrap justify-between items-center mb-2">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="flex gap-2 text-xs">
          {testNumbers.map((num, i) => (
            <span key={i} className="bg-secondary text-background px-2 py-0.5 rounded">
              📘 {num}
            </span>
          ))}
        </div>
      </div>

      {textContent && <p className="text-sm mb-2">{textContent}</p>}

      {imageContent?.imageBase64 && (
        <img
          src={imageContent.imageBase64}
          alt="Изображение к задаче"
          className="max-w-full mb-2 rounded"
        />
      )}

      <div className="flex flex-wrap gap-4 text-xs mt-2">
        {type && <span>✏️ Тип: {type}</span>}
        {groupNumber !== undefined && <span>🎯 Группа: {groupNumber}</span>}
        {year && <span>📅 Год: {year}</span>}
        {relevance !== undefined && (
          <span className={relevance ? "text-green-500" : "text-red-500"}>
            {relevance ? "✅ Актуально" : "🚫 Неактуально"}
          </span>
        )}
        {resource && <span>🔗 Ресурс: {resource}</span>}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {tagNames?.map((tag, i) => (
          <span
            key={`tag-${i}`}
            className="text-xs bg-purple-200 text-purple-900 px-2 py-0.5 rounded"
            title={`Тег: ${tag}`}
          >
            🏷️ {tag}
          </span>
        ))}
        {topicNames?.map((topic, i) => (
          <span
            key={`topic-${i}`}
            className="text-xs bg-teal-200 text-teal-900 px-2 py-0.5 rounded"
            title={`Тема: ${topic}`}
          >
            📚 {topic}
          </span>
        ))}
      </div>

      {shortAnswer !== undefined && (
        <div className="mt-2 text-sm text-primary">
          ✅ Ответ: {shortAnswer}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
