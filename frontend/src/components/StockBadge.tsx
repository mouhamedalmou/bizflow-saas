export function StockBadge({ stock }: { stock: number }) {
  const label = stock <= 0 ? "Out of stock" : stock < 10 ? "Low stock" : "In stock";
  const style = stock <= 0 ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300" : stock < 10 ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300" : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300";
  const shortLabel = stock <= 0 ? "Out" : stock < 10 ? "Low" : "In";
  return <span title={label} className={`inline-flex max-w-full rounded-full border px-1.5 py-0.5 text-[9px] font-semibold sm:px-2 sm:text-[10px] lg:px-2.5 lg:py-1 lg:text-xs ${style}`}><span className="sm:hidden">{shortLabel}</span><span className="hidden sm:inline">{label}</span></span>;
}
