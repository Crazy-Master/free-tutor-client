import React, { useState } from "react";
import { AnswerTask } from "../../types/answer";

type SolutionType = "text" | "base64" | "own";

interface Props {
  answer: AnswerTask | null;
}

const SolutionViewer: React.FC<Props> = ({ answer }) => {
  const types: SolutionType[] = [];

  if (answer?.textSolution) types.push("text");
  if (answer?.solutionBase64) types.push("base64");
  if (answer?.solutionOwnBase64 && answer.solutionOwnBase64.length > 0)
    types.push("own");

  const [index, setIndex] = useState(0);
  const current = types[index];

  if (types.length === 0) return null;

  const goPrev = () => setIndex((prev) => (prev - 1 + types.length) % types.length);
  const goNext = () => setIndex((prev) => (prev + 1) % types.length);

  const renderContent = () => {
    switch (current) {
      case "text":
        return <p className="text-sm whitespace-pre-wrap">{answer?.textSolution}</p>;
      case "base64":
        return (
          <img
            src={answer?.solutionBase64}
            alt="Решение (изображение)"
            className="max-w-full rounded border"
          />
        );
      case "own":
        return (
          <div className="space-y-2">
            {answer?.solutionOwnBase64?.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Собственное решение ${i + 1}`}
                className="max-w-full rounded border"
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const typeLabel = {
    text: "Текст",
    base64: "Изображение",
    own: "Доп. изображение",
  };

  return (
    <div className="border-t pt-3 mt-3 space-y-2 bg-background/40 rounded">
      <div className="flex justify-between items-center text-sm text-gray-600">
        <button onClick={goPrev} className="text-lg px-2 hover:text-black">←</button>
        <span className="font-medium">{typeLabel[current]}</span>
        <button onClick={goNext} className="text-lg px-2 hover:text-black">→</button>
      </div>
      <div className="p-2 bg-white dark:bg-gray-900 rounded border">
        {renderContent()}
      </div>
    </div>
  );
};

export default SolutionViewer;
