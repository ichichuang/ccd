import {
  resolveBrowserBreakpoint,
  resolveBrowserDeviceType,
  resolveBrowserOsType,
} from '@ccd/vue-hooks'
import type { BreakpointKey } from '@ccd/design-tokens'
import type { DeviceType, OsType } from '@/types/systems/device'

function readMaxTouchPoints(): number {
  return typeof navigator === 'undefined' ? 0 : (navigator.maxTouchPoints ?? 0)
}

export function getDeviceTypeSync(): DeviceType {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return 'PC'

  return resolveBrowserDeviceType({
    userAgent: navigator.userAgent,
    maxTouchPoints: readMaxTouchPoints(),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
  })
}

export function getOsTypeSync(): OsType {
  if (typeof navigator === 'undefined') return 'Unknown'

  return resolveBrowserOsType({
    userAgent: navigator.userAgent,
    maxTouchPoints: readMaxTouchPoints(),
  })
}

export function getBreakpointSync(width?: number): BreakpointKey {
  if (typeof window === 'undefined') return 'xs'

  return resolveBrowserBreakpoint({
    viewportWidth: width ?? window.innerWidth,
  })
}
