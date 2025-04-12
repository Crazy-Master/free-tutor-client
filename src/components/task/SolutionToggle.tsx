import React from "react";
import { AnswerTask } from "../../types/answer";

interface SolutionToggleProps {
  answer: AnswerTask | null;
  onExpand: () => void;
}

const hasDetailedSolution = (answer: AnswerTask | null): boolean => {
  if (!answer) return false;
  return !!(
    answer.textSolution ||
    answer.solutionBase64 ||
    (answer.solutionOwnBase64 && answer.solutionOwnBase64.length > 0)
  );
};

const SolutionToggle: React.FC<SolutionToggleProps> = ({ answer, onExpand }) => {
  return (
    <div className="flex justify-between items-center mt-2 text-sm">
      <div>
        <span className="font-medium">Ответ: </span>
        {answer?.shortAnswer !== undefined && answer?.shortAnswer !== null
          ? answer.shortAnswer
          : "—"}
      </div>

      {hasDetailedSolution(answer) && (
        <button
          onClick={onExpand}
          className="text-blue-600 underline hover:text-blue-800"
        >
          Развёрнутый ответ
        </button>
      )}
    </div>
  );
};

export default SolutionToggle;
