import React, { useState } from "react";
import { AnswerTask } from "../../types/answer";
import ExpandedSolutionViewer from "./ExpandedSolutionViewer";
import AnswerSettingsEditor from "./AnswerSettingsEditor";
import { answerModeLabel } from "../../types/answer-settings";

interface SolutionToggleProps {
  checkingMode?: number;
  referenceAnswer?: string | null;
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

const SolutionToggle: React.FC<SolutionToggleProps> = ({ answer, taskId, checkingMode = 0, referenceAnswer = null }) => {
  const [expanded, setExpanded] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [mode, setMode] = useState(checkingMode);
  const [reference, setReference] = useState(referenceAnswer);

  return (
    <div className="max-w-[800px] mx-auto mt-4">
      <div className="flex flex-wrap justify-between items-center gap-3 text-md mb-2">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p>Проверка: {answerModeLabel(mode)}</p>
            {reference != null ? <p>Эталон: {reference}</p> : <p>Прежний краткий ответ: {answer?.shortAnswer ?? "отсутствует"} (режим не определяется по нему)</p>}
          </div>

          <button
            className="px-4 py-1 bg-primary text-text_light rounded hover:opacity-90"
            onClick={() => setShowEditModal(true)}
          >
            Настроить проверку и ответ
          </button>
        </div>

        {hasDetailedSolution(answer) && (
          <div className="flex-1 text-center">
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-4 py-1 bg-primary text-text_light rounded hover:opacity-90"
            >
              {expanded ? "Скрыть развёрнутый ответ" : "Развёрнутый ответ"}
            </button>
          </div>
        )}
      </div>

      {expanded && <ExpandedSolutionViewer answer={answer} />}

      {showEditModal && taskId !== undefined && (
        <AnswerSettingsEditor key={taskId} taskId={taskId}
          onClose={() => setShowEditModal(false)}
          onSaved={settings => { setMode(settings.mode); setReference(settings.referenceAnswer); }}
        />
      )}
    </div>
  );
};

export default SolutionToggle;
