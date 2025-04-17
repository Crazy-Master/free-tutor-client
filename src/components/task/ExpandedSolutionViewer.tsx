import React, { useState } from "react";
import { AnswerTask } from "../../types/answer";

interface Props {
  answer: AnswerTask | null;
}

type SolutionType = "TextSolution" | "SolutionBase64" | "SolutionOwnBase64";

const getAvailableSolutions = (answer: AnswerTask | null): SolutionType[] => {
  if (!answer) return [];

  const result: SolutionType[] = [];
  if (answer.textSolution) result.push("TextSolution");
  if (answer.solutionBase64) result.push("SolutionBase64");
  if (answer.solutionOwnBase64 && answer.solutionOwnBase64.length > 0)
    result.push("SolutionOwnBase64");

  return result;
};

const ExpandedSolutionViewer: React.FC<Props> = ({ answer }) => {
  const available = getAvailableSolutions(answer);
  const [index, setIndex] = useState(0);

  const current = available[index];

  const renderHeader = () => {
    switch (current) {
      case "TextSolution":
        return "Текстовый развернутый ответ";
      case "SolutionBase64":
        return "Развернутый ответ";
      case "SolutionOwnBase64":
        return `Пользовательский ответ – ${index + 1}`;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (current) {
      case "TextSolution":
        return (
          <div className="whitespace-pre-wrap break-words text-left text-md">{answer?.textSolution}</div>
        );
      case "SolutionBase64":
        return (
          <img
            src={`data:image/png;base64,${answer?.solutionBase64}`}
            alt="Решение"
            className="max-w-full"
          />
        );
      case "SolutionOwnBase64":
        return (
          <img
            src={`data:image/png;base64,${
              answer?.solutionOwnBase64?.[index] ?? ""
            }`}
            alt="Пользовательский ответ"
            className="max-w-full"
          />
        );
      default:
        return null;
    }
  };

  const next = () => {
    setIndex((prev) => (prev + 1) % available.length);
  };

  const prev = () => {
    setIndex((prev) =>
      prev - 1 < 0 ? available.length - 1 : (prev - 1) % available.length
    );
  };

  if (available.length === 0) return null;

  return (
    <div className="max-w-[800px] mx-auto mt-4 border rounded p-4 shadow-sm text-md bg-gray-50 dark:bg-gray-700">
      <div className="font-semibold mb-2 text-center">{renderHeader()}</div>
      <div className="text-center mb-4">{renderContent()}</div>

      <div className="flex justify-between">
        <button
          onClick={prev}
          className="px-4 py-1 bg-secondary rounded hover:opacity-80"
        >
          Назад
        </button>
        <button
          onClick={next}
          className="px-4 py-1 bg-secondary rounded hover:opacity-80"
        >
          Вперед
        </button>
      </div>
    </div>
  );
};

export default ExpandedSolutionViewer;
