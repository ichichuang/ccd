/**
 * Theme Engine v5 — Performance Telemetry
 */

export interface ThemePresetResolveMetric {
  count: number
  totalDuration: number
  averageDuration: number
  lastDuration: number
}

export interface ThemeMetrics {
  totalResolves: number
  totalResolveTime: number
  averageResolveTime: number
  resolveTimeByPreset: Record<string, ThemePresetResolveMetric>
  cacheHits: number
  cacheMisses: number
  cacheHitRate: number
  derivedTokens: number
}

const presetMetrics: Record<string, ThemePresetResolveMetric> = {}

let totalResolves = 0
let totalResolveTime = 0
let cacheHits = 0
let cacheMisses = 0
let derivedTokens = 0

function roundMetric(value: number): number {
  return Math.round(value * 1000) / 1000
}

export function recordResolveMetric(
  preset: string,
  duration: number,
  derivedTokenCount: number
): void {
  totalResolves += 1
  totalResolveTime += duration
  derivedTokens += derivedTokenCount

  const current = presetMetrics[preset] ?? {
    count: 0,
    totalDuration: 0,
    averageDuration: 0,
    lastDuration: 0,
  }

  const totalDuration = current.totalDuration + duration
  const count = current.count + 1
  presetMetrics[preset] = {
    count,
    totalDuration: roundMetric(totalDuration),
    averageDuration: roundMetric(totalDuration / count),
    lastDuration: roundMetric(duration),
  }
}

export function recordCacheHit(): void {
  cacheHits += 1
}

export function recordCacheMiss(): void {
  cacheMisses += 1
}

export function getThemeMetrics(): ThemeMetrics {
  const cacheTotal = cacheHits + cacheMisses
  return {
    totalResolves,
    totalResolveTime: roundMetric(totalResolveTime),
    averageResolveTime: totalResolves === 0 ? 0 : roundMetric(totalResolveTime / totalResolves),
    resolveTimeByPreset: { ...presetMetrics },
    cacheHits,
    cacheMisses,
    cacheHitRate: cacheTotal === 0 ? 0 : roundMetric(cacheHits / cacheTotal),
    derivedTokens,
  }
}

export function clearThemeMetrics(): void {
  for (const key of Object.keys(presetMetrics)) {
    delete presetMetrics[key]
  }
  totalResolves = 0
  totalResolveTime = 0
  cacheHits = 0
  cacheMisses = 0
  derivedTokens = 0
}
