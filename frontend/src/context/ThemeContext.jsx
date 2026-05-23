import { useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./themeContextCore";

const getInitialTheme = () => {
  const storedTheme = localStorage.getItem("theme");

  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;

  return prefersDark ? "dark" : "light";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);
  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", theme);
  }, [isDark, theme]);

  const value = useMemo(
    () => ({
      theme,
      isDark,
      toggleTheme: () => {
        setTheme((currentTheme) =>
          currentTheme === "dark" ? "light" : "dark"
        );
      },
    }),
    [isDark, theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
