import React, { useState, useEffect } from "react";

interface Props {
  onChange?: (values: HomeworkSettings) => void;
}

export interface HomeworkSettings {
  taskBanPeriodDays: number;
  group0Probability: number;
  group2Probability: number;
  group3Probability: number;
}

const defaultSettings: HomeworkSettings = {
  taskBanPeriodDays: 7,
  group0Probability: 0.1,
  group2Probability: 0.2,
  group3Probability: 0.3,
};

const HomeworkSettingsPanel: React.FC<Props> = ({ onChange }) => {
  const [settings, setSettings] = useState<HomeworkSettings>(() => {
    const saved = localStorage.getItem("homeworkSettings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("homeworkSettings", JSON.stringify(settings));
    onChange?.(settings);
  }, [settings, onChange]);

  const update = (field: keyof HomeworkSettings, value: number) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-4 border rounded shadow space-y-4 text-sm">
      <h3 className="text-lg font-bold">⚙ Настройки домашнего задания</h3>

      <label className="block">
        Частота повторения задач (дней):
        <input
          type="number"
          min={1}
          className="w-full border rounded px-2 py-1 mt-1"
          value={settings.taskBanPeriodDays}
          onChange={(e) => update("taskBanPeriodDays", Number(e.target.value))}
        />
      </label>

      <label className="block">
        Шанс на новые задачи (Group 0):
        <input
          type="number"
          min={0}
          max={1}
          step={0.01}
          className="w-full border rounded px-2 py-1 mt-1"
          value={settings.group0Probability}
          onChange={(e) => update("group0Probability", parseFloat(e.target.value))}
        />
      </label>

      <label className="block">
        Закрепление (Group 2):
        <input
          type="number"
          min={0}
          max={1}
          step={0.01}
          className="w-full border rounded px-2 py-1 mt-1"
          value={settings.group2Probability}
          onChange={(e) => update("group2Probability", parseFloat(e.target.value))}
        />
      </label>

      <label className="block">
        Повтор неправильно решённых (Group 3):
        <input
          type="number"
          min={0}
          max={1}
          step={0.01}
          className="w-full border rounded px-2 py-1 mt-1"
          value={settings.group3Probability}
          onChange={(e) => update("group3Probability", parseFloat(e.target.value))}
        />
      </label>
    </div>
  );
};

export default HomeworkSettingsPanel;
