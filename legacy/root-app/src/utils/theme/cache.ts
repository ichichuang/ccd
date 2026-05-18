/**
 * Theme Engine v4 — Memoization Layer
 *
 * LRU cache for resolved themes. Keyed by preset name + mode.
 * All ResolvedTheme results are immutable, so caching is safe.
 */

import { emitThemeEvent } from './observability'
import { recordCacheHit, recordCacheMiss } from './metrics'

const MAX_CACHE_SIZE = 32

const cache = new Map<string, unknown>()

/**
 * Get a cached resolved theme, or compute and cache it.
 */
export function getOrResolveTheme<T>(key: string, isDark: boolean, resolver: () => T): T {
  const cacheKey = `${key}:${isDark ? 'dark' : 'light'}`
  const cached = cache.get(cacheKey)
  if (cached) {
    emitThemeEvent({ type: 'CACHE_HIT', key: cacheKey })
    recordCacheHit()
    return cached as T
  }

  emitThemeEvent({ type: 'CACHE_MISS', key: cacheKey })
  recordCacheMiss()

  const resolved = resolver()

  // LRU eviction: if at capacity, delete oldest entry
  if (cache.size >= MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value
    if (oldestKey !== undefined) {
      cache.delete(oldestKey)
    }
  }

  cache.set(cacheKey, resolved)
  return resolved
}

/**
 * Clear all cached themes.
 */
export function clearThemeCache(): void {
  cache.clear()
}

/**
 * Return the current cache size (for testing).
 */
export function themeCacheSize(): number {
  return cache.size
}
