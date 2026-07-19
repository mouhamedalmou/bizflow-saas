import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { Pagination } from "./Pagination";
import { LoadingSpinner } from "./Spinner";

export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number | Date;
  className?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  sortable?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  emptyMessage?: string;
  caption?: string;
}

type Direction = "asc" | "desc";

export function Table<T>({
  columns,
  data,
  rowKey,
  loading = false,
  sortable = true,
  pagination,
  emptyMessage = "Non ci sono dati da visualizzare.",
  caption,
}: TableProps<T>) {
  const [sort, setSort] = useState<{ key: string; direction: Direction } | null>(null);
  const rows = useMemo(() => {
    if (!sort) return data;
    const column = columns.find((item) => item.key === sort.key);
    if (!column?.sortValue) return data;
    return [...data].sort((left, right) => {
      const a = column.sortValue?.(left);
      const b = column.sortValue?.(right);
      const comparison = a instanceof Date && b instanceof Date
        ? a.getTime() - b.getTime()
        : String(a).localeCompare(String(b), undefined, { numeric: true });
      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [columns, data, sort]);

  const toggleSort = (key: string) => {
    setSort((current) => current?.key === key
      ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
      : { key, direction: "asc" });
  };

  if (loading) {
    return <div className="grid min-h-40 place-items-center rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"><LoadingSpinner /></div>;
  }
  if (!data.length) return <EmptyState message={emptyMessage} />;

  return (
    <div className="space-y-4">
      <div className="min-w-0 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <table className="w-full table-fixed text-[10px] sm:text-xs lg:text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80">
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className={`break-words px-1.5 py-2 text-left text-[9px] font-bold uppercase tracking-normal text-slate-900 dark:text-slate-200 sm:px-3 sm:py-3 sm:text-[10px] lg:px-5 lg:py-3.5 lg:text-xs lg:tracking-wide ${column.className ?? ""}`}>
                  {sortable && column.sortValue ? (
                    <button onClick={() => toggleSort(column.key)} className="inline-flex items-center gap-1 rounded outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                      {column.header}
                      {sort?.key !== column.key ? <ChevronsUpDown size={14} /> : sort.direction === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                    </button>
                  ) : column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {rows.map((row, index) => (
              <tr
                key={rowKey(row)}
                className={`table-row transition-colors duration-150 hover:bg-indigo-50/70 dark:hover:bg-slate-700/70 ${index % 2 === 0 ? "bg-white dark:bg-slate-900/70" : "bg-slate-50 dark:bg-slate-800/35"}`}
              >
                {columns.map((column) => (
                  <td key={column.key} className={`min-w-0 break-words px-1.5 py-2 text-[10px] text-slate-900 dark:text-slate-200 sm:px-3 sm:py-3 sm:text-xs lg:px-5 lg:py-3.5 lg:text-sm ${column.className ?? ""}`}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && <Pagination {...pagination} />}
    </div>
  );
}
