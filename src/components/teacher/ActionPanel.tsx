import React from "react";

interface ActionPanelProps {
  onShowStudents: () => void;
  onShowProfile: () => void;
  onShowSettings: () => void;
  onOpenTaskBase?: () => void;
}

const ActionPanel: React.FC<ActionPanelProps> = ({
  onShowStudents,
  onShowProfile,
  onShowSettings,
  onOpenTaskBase,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">⚙ Действия</h2>

      <button
        onClick={onShowStudents}
        className="w-full bg-primary text-text_light px-4 py-2 rounded hover:opacity-90"
      >
        📋 Список учеников
      </button>

      <button
        onClick={onShowProfile}
        className="w-full bg-primary text-text_light px-4 py-2 rounded hover:opacity-90"
      >
        👤 Информация обо мне
      </button>

      <button
        onClick={onShowSettings}
        className="w-full bg-primary text-text_light px-4 py-2 rounded hover:opacity-90"
      >
        ⚙ Настройки
      </button>

      <button
        onClick={onOpenTaskBase}
        className="w-full bg-primary text-text_light px-4 py-2 rounded hover:opacity-90"
      >
        📚 База задач
      </button>
    </div>
  );
};

export default ActionPanel;
