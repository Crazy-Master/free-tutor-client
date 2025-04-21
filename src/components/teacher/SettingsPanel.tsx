import { useTheme } from "../../lib/theme";
import { ThemeName } from "../../lib/theme";
import HomeworkSettingsPanel from "./HomeworkSettingsPanel";
import { useState } from "react";
import LogoutButton from "../LogoutButton";


const SettingsPanel = () => {
  const { theme, setTheme } = useTheme();



  const [taskLimit, setTaskLimit] = useState(() => {
    const saved = localStorage.getItem("taskLimit");
    return saved ? parseInt(saved) : 10;
  });

  return (
    <div className="p-4 border rounded shadow text-sm space-y-4">
      <h3 className="text-lg font-bold">⚙ Настройки</h3>

      <div>
        <label className="block mb-1 font-medium">🎨 Тема интерфейса</label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as ThemeName)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="violet">Фиолетовая</option>
          <option value="olive">Оливковая</option>
          <option value="orange">Оранжевая</option>
        </select>
      </div>

      <HomeworkSettingsPanel />

      <div>
        <label className="block mb-1 font-medium">📦 Задач на страницу</label>
        <select
          value={taskLimit}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            setTaskLimit(val);
            localStorage.setItem("taskLimit", val.toString());
          }}
          className="border px-3 py-2 rounded w-full"
        >
          {[10, 20, 30, 50].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      <LogoutButton />
    </div>
  );
};

export default SettingsPanel;
