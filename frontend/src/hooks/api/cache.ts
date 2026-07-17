interface CacheEntry { data?: unknown; updatedAt: number; promise?: Promise<unknown>; listeners: Set<() => void> }
const cache = new Map<string, CacheEntry>();
const entryFor = (key: string): CacheEntry => { const existing = cache.get(key); if (existing) return existing; const created: CacheEntry = { updatedAt: 0, listeners: new Set() }; cache.set(key, created); return created; };
export const readCache = <T>(key: string): T | undefined => entryFor(key).data as T | undefined;
export const cacheAge = (key: string): number => Date.now() - entryFor(key).updatedAt;
export const subscribeCache = (key: string, listener: () => void): (() => void) => { const entry = entryFor(key); entry.listeners.add(listener); return () => entry.listeners.delete(listener); };
export async function fetchCached<T>(key: string, fetcher: () => Promise<T>, force = false): Promise<T> { const entry = entryFor(key); if (!force && entry.promise) return entry.promise as Promise<T>; const promise = fetcher().then((data) => { entry.data = data; entry.updatedAt = Date.now(); entry.listeners.forEach((listener) => listener()); return data; }).finally(() => { entry.promise = undefined; }); entry.promise = promise; return promise; }
export function invalidateCache(prefix: string): void { for (const [key, entry] of cache) if (key.startsWith(prefix)) { entry.updatedAt = 0; entry.listeners.forEach((listener) => listener()); } }
