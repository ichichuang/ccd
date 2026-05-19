/**
 * 时区数据与加载器
 *
 * 说明：默认使用内置少量常用时区。如需完整时区列表，将 time-zones.json 放到 public/ 并调用 loadTzdbSafely。
 */
import type { TimeZoneMinimal } from './types'

let _ALL_TIMEZONES_INTERNAL: TimeZoneMinimal[] = [
  { name: 'UTC', countryCode: 'UN', currentTimeOffsetInMinutes: 0 },
  { name: 'Asia/Shanghai', countryCode: 'CN', currentTimeOffsetInMinutes: 480 },
  { name: 'Asia/Tokyo', countryCode: 'JP', currentTimeOffsetInMinutes: 540 },
  { name: 'America/New_York', countryCode: 'US', currentTimeOffsetInMinutes: -300 },
  { name: 'Europe/London', countryCode: 'GB', currentTimeOffsetInMinutes: 0 },
  { name: 'Australia/Sydney', countryCode: 'AU', currentTimeOffsetInMinutes: 600 },
]

export let ALL_TIMEZONES: TimeZoneMinimal[] = _ALL_TIMEZONES_INTERNAL

let loadTzdbPromise: Promise<void> | null = null

export const loadTzdbSafely = async (): Promise<void> => {
  if (loadTzdbPromise) {
    return loadTzdbPromise
  }

  if (typeof window === 'undefined' || typeof fetch === 'undefined') {
    return
  }

  const cdnUrls = ['/time-zones.json', '/static/time-zones.json']

  const fetchWithTimeout = async (url: string, timeout = 5000): Promise<Response> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    try {
      const response = await fetch(url, {
        cache: 'force-cache' as RequestCache,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  loadTzdbPromise = (async () => {
    try {
      for (const url of cdnUrls) {
        try {
          const res = await fetchWithTimeout(url, 5000)
          if (!res.ok) continue

          const contentType = res.headers.get('content-type') || ''
          if (!contentType.includes('application/json') && !contentType.includes('text/json')) {
            continue
          }

          const zones = (await res.json()) as TimeZoneMinimal[]
          if (Array.isArray(zones) && zones.length > 0 && zones[0].name) {
            _ALL_TIMEZONES_INTERNAL = zones
            ALL_TIMEZONES = _ALL_TIMEZONES_INTERNAL
            return
          }
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            const msg = error.message.toLowerCase()
            if (!(msg.includes('json') && msg.includes('<!doctype'))) {
              console.warn('[tzdb] load failed from', url, error.message)
            }
          }
          continue
        }
      }
      console.info(
        '[tzdb] 本地时区数据文件未找到，使用内置默认时区数据。如需完整时区列表，请将 time-zones.json 放到 public/ 目录'
      )
    } catch (error) {
      console.warn('[tzdb] 加载时区数据时发生未知错误:', error)
    }
  })()

  return loadTzdbPromise
}
