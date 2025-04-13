import React, { useState } from "react";
import TaskCardHeader from "./TaskCardHeader";
import TaskContentViewer from "./TaskContentViewer";
import SolutionToggle from "./SolutionToggle";
import SolutionViewer from "./SolutionViewer";
import TaskCardFooter from "./TaskCardFooter";
import { AnswerTask } from "../../types/answer";

interface TaskCardBaseProps {
  taskId: number;
  tags: Tag[];
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

interface Tag {
  tagId: number;
  name: string;
  color: string;
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
    <div className="max-w-[1000px] mx-auto p-4">
      <div className="border rounded shadow-md p-4 bg-white dark:bg-gray-900 space-y-4">
        <TaskCardHeader taskId={taskId} tags={tags} testNumber={testNumber} />

        <div className="max-w-[800px] mx-auto">
          <TaskContentViewer
            textContent={textContent}
            imageContent={imageContent}
          />
        </div>

        <SolutionToggle
          answer={{ ...answerTask, shortAnswer }}
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
    </div>
  );
};

export default TaskCardBase;
