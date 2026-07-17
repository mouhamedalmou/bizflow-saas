import { useCallback, useEffect, useState } from "react";
import { cacheAge, fetchCached, readCache, subscribeCache } from "./cache";
import { normalizeApiError } from "../../api/errors";

interface QueryOptions { refreshInterval?: number; staleTime?: number; enabled?: boolean }
export interface QueryResult<T> { data: T | undefined; loading: boolean; error: string | null; refetch: () => Promise<void> }

export function useQuery<T>(key: string, fetcher: () => Promise<T>, options: QueryOptions = {}): QueryResult<T> {
  const { refreshInterval = 0, staleTime = 30_000, enabled = true } = options;
  const [data, setData] = useState<T | undefined>(() => readCache<T>(key)); const [loading, setLoading] = useState<boolean>(enabled && readCache<T>(key) === undefined); const [error, setError] = useState<string | null>(null);
  const execute = useCallback(async (force = false): Promise<void> => { if (!enabled) return; setLoading(readCache<T>(key) === undefined); setError(null); try { const result = await fetchCached(key, fetcher, force); setData(result); } catch (reason: unknown) { setError(normalizeApiError(reason).message); } finally { setLoading(false); } }, [enabled, fetcher, key]);
  const refetch = useCallback(() => execute(true), [execute]);
  useEffect(() => { let active = true; queueMicrotask(() => { if (active) setData(readCache<T>(key)); }); const unsubscribe = subscribeCache(key, () => { setData(readCache<T>(key)); if (enabled && cacheAge(key) > staleTime) void execute(); }); if (enabled && (readCache<T>(key) === undefined || cacheAge(key) > staleTime)) queueMicrotask(() => { if (active) void execute(); }); return () => { active = false; unsubscribe(); }; }, [enabled, execute, key, staleTime]);
  useEffect(() => { if (!enabled || refreshInterval <= 0) return; const timer = window.setInterval(() => { if (!document.hidden) void execute(true); }, refreshInterval); return () => window.clearInterval(timer); }, [enabled, execute, refreshInterval]);
  return { data, loading, error, refetch };
}
