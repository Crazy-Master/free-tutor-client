import React, { useState } from "react";
import TaskCardHeader from "./TaskCardHeader";
import TaskContentViewer from "./TaskContentViewer";
import SolutionToggle from "./SolutionToggle";
import SolutionViewer from "./SolutionViewer";
import TaskCardFooter from "./TaskCardFooter";
import { AnswerTask } from "../../types/answer";

interface TaskCardBaseProps {
  taskId: number;
  tags: { name: string; color: string }[];
  testNumber?: string;
  textContent?: string;
  imageContent?: { imageBase64: string } | null;
  shortAnswer?: number;
  answerTask?: AnswerTask | null;
  topics: string[];
  answerType: string;
  groupNumber?: number;
  year: number;
  relevance: string;
}

const TaskCardBase: React.FC<TaskCardBaseProps> = ({
  taskId,
  tags,
  testNumber,
  textContent,
  imageContent,
  shortAnswer,
  answerTask,
  topics,
  answerType,
  groupNumber,
  year,
  relevance,
}) => {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="border rounded shadow-md p-4 bg-white dark:bg-gray-900 space-y-2">
      <TaskCardHeader taskId={taskId} tags={tags} testNumber={testNumber} />

      <TaskContentViewer
        textContent={textContent}
        imageContent={imageContent}
      />

      <SolutionToggle
        answer={{ ...answerTask, shortAnswer }}
        onExpand={() => setShowSolution((prev) => !prev)}
      />

      <SolutionToggle
        answer={answerTask ?? null}
        onExpand={() => setShowSolution((prev) => !prev)}
      />

      {showSolution && <SolutionViewer answer={answerTask ?? null} />}

      <TaskCardFooter
        topics={topics}
        answerType={answerType}
        groupNumber={groupNumber}
        year={year}
        relevance={relevance}
      />
    </div>
  );
};

export default TaskCardBase;
