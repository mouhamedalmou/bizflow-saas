import { useEffect, useMemo, useState } from "react";
import { ThemeContext } from "./themeContextCore";
import type { ChildrenProps, ThemeContextValue } from "../types";

const getInitialTheme = (): "light" | "dark" => {
  const storedTheme = localStorage.getItem("theme");

  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;

  return prefersDark ? "dark" : "light";
};

export const ThemeProvider = ({ children }: ChildrenProps) => {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);
  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", theme);
  }, [isDark, theme]);

  const value = useMemo<ThemeContextValue>(
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
