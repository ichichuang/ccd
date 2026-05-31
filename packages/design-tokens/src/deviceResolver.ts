import { BREAKPOINTS, TABLET_DETECTION_MIN_SHORT_SIDE, type BreakpointKey } from './breakpoints.js'

export type DeviceResolverDeviceType = 'Mobile' | 'Tablet' | 'PC'
export type DeviceResolverOsType = 'Windows' | 'MacOS' | 'Android' | 'iOS' | 'Linux' | 'Unknown'
export type DeviceResolverOrientation = 'horizontal' | 'vertical'

export type BreakpointThresholdMap = Readonly<Partial<Record<BreakpointKey, number>>>
export type SortedBreakpointEntry = readonly [BreakpointKey, number]
export type BreakpointResolverSource = BreakpointThresholdMap | readonly SortedBreakpointEntry[]

export interface DeviceTypeResolverInput {
  userAgent?: string
  maxTouchPoints?: number
  screenWidth?: number
  screenHeight?: number
  tabletMinShortSide?: number
}

export interface ViewportMetricsInput {
  width: number
  height: number
  screenWidth?: number
  screenHeight?: number
  pixelRatio?: number
}

export interface ViewportMetrics {
  width: number
  height: number
  screenWidth: number
  screenHeight: number
  screenShortSide: number
  screenLongSide: number
  orientation: DeviceResolverOrientation
  pixelRatio: number
}

export function createSortedBreakpoints(
  breakpoints: BreakpointThresholdMap = BREAKPOINTS
): SortedBreakpointEntry[] {
  return (Object.entries(breakpoints) as SortedBreakpointEntry[]).sort((a, b) => b[1] - a[1])
}

export const SORTED_BREAKPOINTS: readonly SortedBreakpointEntry[] = createSortedBreakpoints()

function isSortedBreakpointEntryList(
  source: BreakpointResolverSource
): source is readonly SortedBreakpointEntry[] {
  return Array.isArray(source)
}

export function resolveBreakpointFromWidth(
  width: number,
  breakpoints: BreakpointResolverSource = SORTED_BREAKPOINTS,
  fallback: BreakpointKey = 'xs'
): BreakpointKey {
  const entries = isSortedBreakpointEntryList(breakpoints)
    ? breakpoints
    : createSortedBreakpoints(breakpoints)
  const match = entries.find(([, value]) => width >= value)
  return match ? match[0] : fallback
}

export function resolveDeviceTypeFromInputs(
  input: DeviceTypeResolverInput
): DeviceResolverDeviceType {
  const userAgent = input.userAgent ?? ''
  const maxTouchPoints = input.maxTouchPoints ?? 0
  const screenWidth = input.screenWidth ?? 0
  const screenHeight = input.screenHeight ?? 0
  const tabletMinShortSide = input.tabletMinShortSide ?? TABLET_DETECTION_MIN_SHORT_SIDE
  const screenShortSide = Math.min(screenWidth, screenHeight)

  const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  const isMac = /Macintosh/i.test(userAgent)
  const isIPadOS = isMac && maxTouchPoints > 1
  const isTabletUA =
    /iPad/i.test(userAgent) || isIPadOS || (isMobileUA && screenShortSide >= tabletMinShortSide)

  if (isTabletUA) return 'Tablet'
  if (isMobileUA) return 'Mobile'
  return 'PC'
}

export function resolveOsTypeFromUserAgent(
  userAgent: string,
  maxTouchPoints = 0
): DeviceResolverOsType {
  const isIPadOS = /Macintosh/i.test(userAgent) && maxTouchPoints > 1

  if (/Windows/i.test(userAgent)) return 'Windows'
  if (/Android/i.test(userAgent)) return 'Android'
  if (/iPhone|iPad|iPod/i.test(userAgent) || isIPadOS) return 'iOS'
  if (/Mac OS|Macintosh/i.test(userAgent)) return 'MacOS'
  if (/Linux/i.test(userAgent)) return 'Linux'
  return 'Unknown'
}

export function resolveOrientationFromViewport(
  width: number,
  height: number
): DeviceResolverOrientation {
  return width >= height ? 'horizontal' : 'vertical'
}

export function resolveViewportMetrics(input: ViewportMetricsInput): ViewportMetrics {
  return {
    width: input.width,
    height: input.height,
    screenWidth: input.screenWidth ?? 0,
    screenHeight: input.screenHeight ?? 0,
    screenShortSide: Math.min(input.width, input.height),
    screenLongSide: Math.max(input.width, input.height),
    orientation: resolveOrientationFromViewport(input.width, input.height),
    pixelRatio: input.pixelRatio ?? 1,
  }
}
