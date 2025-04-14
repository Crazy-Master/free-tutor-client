import React, { useState } from "react";
import TaskCardHeader from "./TaskCardHeader";
import TaskContentViewer from "./TaskContentViewer";
import SolutionToggle from "./SolutionToggle";
import SolutionViewer from "./SolutionViewer";
import TaskCardFooter from "./TaskCardFooter";
import { AnswerTask } from "../../types/answer";
import { useDictionaryStore } from "../../store/dictionaryStore";

interface TaskCardBaseProps {
  taskId: number;
  taskIdExternal: string;
  testNumber?: string;
  textContent?: string;
  imageContent?: { imageBase64: string } | null;
  shortAnswer?: number;
  answerTask?: AnswerTask | null;
  topics: string[];
  answerType: string;
  groupNumber?: number;
  year: number;
  resource?: string;
  relevance: string;
}

const TaskCardBase: React.FC<TaskCardBaseProps> = ({
  taskId,
  taskIdExternal,
  testNumber,
  textContent,
  imageContent,
  shortAnswer,
  answerTask,
  groupNumber,
  year,
  resource,
  relevance,
}) => {
  const [showSolution, setShowSolution] = useState(false);

  const { getTagIds } = useDictionaryStore();
  const tagIds = getTagIds(taskId);

  return (
    <div className="max-w-[1000px] mx-auto p-4">
      <div className="border rounded shadow-md p-4 bg-white dark:bg-gray-900 space-y-4">
        <TaskCardHeader
          taskId={taskId}
          tagIds={tagIds}
          testNumber={testNumber}
        />

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
          taskId={taskId}
          groupNumber={groupNumber}
          year={year}
          relevance={relevance}
          resource={resource}
          taskIdExternal={taskIdExternal}
        />
      </div>
    </div>
  );
};

export default TaskCardBase;
