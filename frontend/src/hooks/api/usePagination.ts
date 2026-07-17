import { useCallback, useMemo, useState } from "react";

export function usePagination(totalItems: number, itemsPerPage: number) {
  const safePageSize = Math.max(1, Math.floor(itemsPerPage)); const totalPages = Math.max(1, Math.ceil(Math.max(0, totalItems) / safePageSize)); const [requestedPage, setCurrentPage] = useState<number>(1); const currentPage = Math.min(requestedPage, totalPages);
  const goToPage = useCallback((page: number): void => setCurrentPage(Math.min(totalPages, Math.max(1, Math.floor(page)))), [totalPages]);
  const nextPage = useCallback((): void => setCurrentPage((page) => Math.min(totalPages, page + 1)), [totalPages]); const prevPage = useCallback((): void => setCurrentPage((page) => Math.max(1, page - 1)), []);
  const paginate = useCallback(<T,>(items: readonly T[]): T[] => items.slice((currentPage - 1) * safePageSize, currentPage * safePageSize), [currentPage, safePageSize]);
  return useMemo(() => ({ currentPage, totalPages, paginate, goToPage, nextPage, prevPage }), [currentPage, goToPage, nextPage, paginate, prevPage, totalPages]);
}
