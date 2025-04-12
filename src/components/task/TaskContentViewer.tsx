import React from "react";

interface TaskContentViewerProps {
  textContent?: string;
  imageContent?: { imageBase64: string } | null;
}

const TaskContentViewer: React.FC<TaskContentViewerProps> = ({ textContent, imageContent }) => {
  if (textContent) {
    return <p className="text-sm mb-2">{textContent}</p>;
  }
  if (imageContent?.imageBase64) {
    return (
      <img
        src={imageContent.imageBase64}
        alt="Изображение задачи"
        className="max-w-full mb-2 rounded"
      />
    );
  }
  return null;
};

export default TaskContentViewer;
