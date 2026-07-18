import type { ReactNode } from "react";

export interface BadgeProps {
  label: ReactNode;
  color?: "slate" | "indigo" | "emerald" | "amber" | "red" | "cyan" | "blue";
  size?: "sm" | "md";
  variant?: "solid" | "outline" | "soft";
  icon?: ReactNode;
}

const colors = {
  slate: {
    solid: "bg-slate-700 text-white dark:bg-slate-600",
    outline: "border-slate-400 text-slate-800 dark:border-slate-500 dark:text-slate-200",
    soft: "border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-500/30 dark:bg-slate-500/15 dark:text-slate-200",
  },
  indigo: {
    solid: "bg-indigo-600 text-white",
    outline: "border-indigo-400 text-indigo-900 dark:border-indigo-500 dark:text-indigo-200",
    soft: "border-indigo-300 bg-indigo-100 text-indigo-900 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-200",
  },
  emerald: {
    solid: "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950",
    outline: "border-emerald-400 text-emerald-900 dark:border-emerald-500 dark:text-emerald-300",
    soft: "border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-200",
  },
  amber: {
    solid: "bg-amber-500 text-slate-950",
    outline: "border-amber-400 text-amber-950 dark:border-amber-500 dark:text-amber-300",
    soft: "border-amber-300 bg-amber-100 text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-200",
  },
  red: {
    solid: "bg-red-600 text-white dark:bg-red-500",
    outline: "border-red-400 text-red-900 dark:border-red-500 dark:text-red-300",
    soft: "border-red-300 bg-red-100 text-red-900 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-200",
  },
  cyan: {
    solid: "bg-cyan-600 text-white dark:bg-cyan-500 dark:text-slate-950",
    outline: "border-cyan-400 text-cyan-900 dark:border-cyan-500 dark:text-cyan-300",
    soft: "border-cyan-300 bg-cyan-100 text-cyan-900 dark:border-cyan-500/30 dark:bg-cyan-500/15 dark:text-cyan-200",
  },
  blue: {
    solid: "bg-blue-600 text-white dark:bg-blue-500",
    outline: "border-blue-400 text-blue-900 dark:border-blue-500 dark:text-blue-300",
    soft: "border-blue-300 bg-blue-100 text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-200",
  },
} as const;

export function Badge({ label, color = "slate", size = "sm", variant = "soft", icon }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-semibold ${colors[color][variant]} ${size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"}`}>
      {icon}
      {label}
    </span>
  );
}
