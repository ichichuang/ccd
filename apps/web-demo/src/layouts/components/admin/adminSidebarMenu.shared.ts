import type { ComponentPublicInstance } from 'vue'
import type { RouteLocationNormalizedLoadedGeneric } from 'vue-router'
import type { PrimeMenuModelItem } from '@/router/utils/helper'

export type SidebarMenuDensity = 'regular' | 'compact'

export function toRecord(
  val: Map<string, boolean> | Record<string, boolean> | null | undefined
): Record<string, boolean> {
  if (!val) return {}
  if (val instanceof Map) return Object.fromEntries(val) as Record<string, boolean>
  return val
}

export function applyUniqueRoot(
  nextKeys: Record<string, boolean>,
  rootKeys: string[],
  expandedRootKey: string
): Record<string, boolean> {
  const result = { ...nextKeys }
  for (const root of rootKeys) {
    if (root !== expandedRootKey) result[root] = false
  }
  return result
}

export function resolveElementRef(
  el: Element | ComponentPublicInstance | null
): HTMLElement | null {
  return el instanceof HTMLElement ? el : null
}

export function resolveMenuLabel(label: PrimeMenuModelItem['label']): string {
  if (typeof label === 'string') return label
  if (typeof label === 'function') {
    const resolved = label()
    return typeof resolved === 'string' ? resolved : ''
  }
  return ''
}

export function areExpandedKeyRecordsEqual(
  a: Record<string, boolean>,
  b: Record<string, boolean>
): boolean {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  return aKeys.every(key => a[key] === b[key])
}

export function buildExpandedKeysForRoute(
  route: RouteLocationNormalizedLoadedGeneric,
  allowMultiple: boolean,
  rootKeys: string[]
): Record<string, boolean> {
  const parentPaths = Array.isArray(route.meta?.parentPaths) ? route.meta.parentPaths : []
  if (!parentPaths.length) return {}

  let nextKeys: Record<string, boolean> = {}
  parentPaths.filter(Boolean).forEach((path: string) => {
    nextKeys[path] = true
    if (!allowMultiple && rootKeys.includes(path)) {
      nextKeys = applyUniqueRoot(nextKeys, rootKeys, path)
    }
  })

  return nextKeys
}

export function buildSidebarRouteSyncStamp(route: RouteLocationNormalizedLoadedGeneric): string {
  const path = typeof route.path === 'string' ? route.path : ''
  const fullPath = typeof route.fullPath === 'string' ? route.fullPath : ''
  const activeMenu = typeof route.meta?.activeMenu === 'string' ? route.meta.activeMenu : ''
  const parentPaths = Array.isArray(route.meta?.parentPaths)
    ? route.meta.parentPaths.filter((item): item is string => typeof item === 'string')
    : []

  return `${activeMenu}|${path}|${fullPath}|${parentPaths.join('>')}`
}
