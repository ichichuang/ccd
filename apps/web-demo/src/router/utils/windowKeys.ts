import { generateIdFromKey } from '@ccd/shared-utils'
import type { LocationQueryRaw } from 'vue-router'

export const ROUTE_WINDOW_KEY_QUERY_PARAM = '_windowKey'

export interface RouteWindowLocationLike {
  search: string
  hash: string
}

export function generateRouteWindowKey(routeName: string, query?: LocationQueryRaw): string {
  return generateIdFromKey(`${routeName}:${JSON.stringify(query ?? {})}`)
}

export function getRouteWindowKeyFromLocation(source: RouteWindowLocationLike): string | null {
  const searchKey = new URLSearchParams(source.search).get(ROUTE_WINDOW_KEY_QUERY_PARAM)
  if (searchKey) return searchKey

  const hashQueryStart = source.hash.indexOf('?')
  if (hashQueryStart < 0) return null

  return new URLSearchParams(source.hash.slice(hashQueryStart + 1)).get(
    ROUTE_WINDOW_KEY_QUERY_PARAM
  )
}

export function getRouteWindowKeyFromUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url, 'http://ccd.local')
    return getRouteWindowKeyFromLocation(parsedUrl)
  } catch {
    return null
  }
}
