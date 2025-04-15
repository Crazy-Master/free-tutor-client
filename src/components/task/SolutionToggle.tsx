import React, { useState } from "react";
import { AnswerTask } from "../../types/answer";
import ExpandedSolutionViewer from "./ExpandedSolutionViewer";
import { api } from "../../lib/api";
import EditFieldModal from "./EditFieldModal";

interface SolutionToggleProps {
  answer: AnswerTask | null;
  taskId?: number;
  onExpand?: () => void;
}

const hasDetailedSolution = (answer: AnswerTask | null): boolean => {
  if (!answer) return false;
  return !!(
    answer.textSolution ||
    answer.solutionBase64 ||
    (answer.solutionOwnBase64 && answer.solutionOwnBase64.length > 0)
  );
};

const SolutionToggle: React.FC<SolutionToggleProps> = ({ answer, taskId }) => {
  const [expanded, setExpanded] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [shortAnswerState, setShortAnswerState] = useState<number | null>(
    answer?.shortAnswer ?? null
  );

  return (
    <div className="max-w-[800px] mx-auto mt-4">
      <div className="flex justify-between items-center text-md mb-2">
        <div className="flex items-center gap-4">
          <div>
            <span className="font-medium">Ответ: </span>
            {shortAnswerState !== null ? shortAnswerState : "отсутствует"}
          </div>

          <button
            className="text-blue-600 underline hover:text-blue-800"
            onClick={() => setShowEditModal(true)}
          >
            Изменить ответ
          </button>
        </div>

        {hasDetailedSolution(answer) && (
          <div className="flex-1 text-center">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-600 underline hover:text-blue-800"
            >
              {expanded ? "Скрыть развёрнутый ответ" : "Развёрнутый ответ"}
            </button>
          </div>
        )}
      </div>

      {expanded && <ExpandedSolutionViewer answer={answer} />}

      {showEditModal && taskId !== undefined && (
        <EditFieldModal
          title="Изменить краткий ответ"
          label="Краткий ответ"
          initialValue={shortAnswerState ?? ""}
          inputType="number"
          onClose={() => setShowEditModal(false)}
          onSubmit={async (val) => {
            const parsed = parseFloat(val);
            if (isNaN(parsed)) throw new Error("Некорректный ответ");
            await api.updateShortAnswer({ taskId, shortAnswer: parsed });
            setShortAnswerState(parsed);
          }}
        />
      )}
    </div>
  );
};

export default SolutionToggle;
