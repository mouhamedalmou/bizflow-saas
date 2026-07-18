/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  theme: {
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      display: ["Geist", "Inter", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "ui-monospace", "monospace"],
    },
    extend: {
      colors: {
        dark: {
          bg: "#020617",
          "bg-secondary": "#0f172a",
          card: "#1e293b",
          border: "#334155",
          text: "#f1f5f9",
          "text-secondary": "#94a3b8",
        },
        light: {
          bg: "#f8fafc",
          "bg-secondary": "#f1f5f9",
          card: "#ffffff",
          border: "#e2e8f0",
          text: "#0f172a",
          "text-secondary": "#475569",
        },
      },
    },
  },
};
