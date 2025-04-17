import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        secondary_other: "var(--color-secondary_other)",
        background: "var(--color-background)",
        text_light: "var(--color-text_light)",
        text_dark: "var(--color-text_dark)",
      },
    },
  },
  plugins: [],
};

export default config;
