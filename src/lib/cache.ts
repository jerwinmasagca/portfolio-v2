/**
 * Portfolio Data Cache — localStorage-based stale-while-revalidate layer.
 *
 * On first visit:  fetches from Supabase, stores result + timestamp in localStorage.
 * On return visits: instantly returns cached data, then optionally re-fetches in
 *                   the background and only updates if data actually changed.
 *
 * Each Supabase table gets its own cache key.
 */

// ── Config ──────────────────────────────────────────────────────────────────
/** How long (ms) before cached data is considered stale and a background refresh fires. */
const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes

/** Prefix all cache keys to avoid collisions with other localStorage consumers. */
const CACHE_PREFIX = "portfolio_cache_";

// ── Types ───────────────────────────────────────────────────────────────────
interface CacheEntry<T> {
  data: T;
  timestamp: number; // Date.now() when written
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Read a cache entry from localStorage. Returns `null` if nothing is stored.
 */
export function readCache<T>(key: string): CacheEntry<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry<T>;
  } catch {
    return null;
  }
}

/**
 * Write data into the cache with a fresh timestamp.
 */
export function writeCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch (err) {
    // localStorage may be full or disabled — fail silently
    console.warn("[cache] Failed to write cache for key:", key, err);
  }
}

/**
 * Returns `true` if a cache entry is still fresh (written less than STALE_TIME_MS ago).
 */
export function isCacheFresh(key: string): boolean {
  const entry = readCache(key);
  if (!entry) return false;
  return Date.now() - entry.timestamp < STALE_TIME_MS;
}

/**
 * Invalidate (remove) one or more cache keys.
 * Call this from the admin panel after saves/deletes.
 */
export function invalidateCache(...keys: string[]): void {
  if (typeof window === "undefined") return;
  for (const key of keys) {
    localStorage.removeItem(CACHE_PREFIX + key);
  }
}

/**
 * Invalidate every portfolio cache entry at once.
 */
export function invalidateAllCache(): void {
  if (typeof window === "undefined") return;
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(CACHE_PREFIX)) toRemove.push(k);
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
}

/**
 * Deep comparison of two JSON-serialisable values.
 * Used to determine whether freshly fetched data differs from the cache.
 */
export function dataChanged<T>(cached: T, fresh: T): boolean {
  try {
    return JSON.stringify(cached) !== JSON.stringify(fresh);
  } catch {
    return true; // if comparison fails, assume changed
  }
}

// ── Well-known cache keys (one per table queried by the portfolio page) ─────
export const CACHE_KEYS = {
  profile: "profile_settings",
  projects: "projects",
  experiences: "experiences",
  education: "education",
  skills: "skills",
} as const;
