import { useTheme } from "../../lib/theme";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const themes = ["light", "violet", "olive", "orange"] as const;

  return (
    <select
      className="bg-background text-primary border px-2 py-1 rounded"
      value={theme}
      onChange={(e) => setTheme(e.target.value as typeof themes[number])}
    >
      {themes.map((t) => (
        <option key={t} value={t}>
          🎨 {t}
        </option>
      ))}
    </select>
  );
};

export default ThemeSwitcher;
