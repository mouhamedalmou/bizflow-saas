import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-950 dark:text-slate-100 lg:text-5xl">{title}</h1><p className="mt-2 text-base leading-relaxed text-slate-600 dark:text-slate-400">{subtitle}</p></div>{actions && <div className="w-full sm:w-auto">{actions}</div>}</header>;
}

export function SectionCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/90 dark:shadow-black/20 ${className}`}>{children}</section>;
}

export function InlineAlert({ children, tone = "error" }: { children: ReactNode; tone?: "error" | "success" }) {
  const style = tone === "error" ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300" : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300";
  return <div role={tone === "error" ? "alert" : "status"} className={`rounded-lg border px-4 py-3 text-sm ${style}`}>{children}</div>;
}
