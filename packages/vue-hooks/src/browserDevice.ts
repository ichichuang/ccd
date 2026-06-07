import {
  resolveBreakpointFromWidth,
  resolveDeviceTypeFromInputs,
  resolveOsTypeFromUserAgent,
} from '@ccd/design-tokens'
import type {
  BreakpointKey,
  DeviceResolverDeviceType,
  DeviceResolverOsType,
} from '@ccd/design-tokens'

export interface BrowserDeviceSnapshot {
  userAgent?: string
  maxTouchPoints?: number
  screenWidth?: number
  screenHeight?: number
  viewportWidth?: number
}

export interface BrowserDeviceResolution {
  deviceType: DeviceResolverDeviceType
  osType: DeviceResolverOsType
  breakpoint: BreakpointKey
}

export function resolveBrowserDeviceType(
  snapshot: BrowserDeviceSnapshot
): DeviceResolverDeviceType {
  return resolveDeviceTypeFromInputs({
    userAgent: snapshot.userAgent,
    maxTouchPoints: snapshot.maxTouchPoints,
    screenWidth: snapshot.screenWidth,
    screenHeight: snapshot.screenHeight,
  })
}

export function resolveBrowserOsType(snapshot: BrowserDeviceSnapshot): DeviceResolverOsType {
  return resolveOsTypeFromUserAgent(snapshot.userAgent ?? '', snapshot.maxTouchPoints ?? 0)
}

export function resolveBrowserBreakpoint(snapshot: BrowserDeviceSnapshot): BreakpointKey {
  return resolveBreakpointFromWidth(snapshot.viewportWidth ?? 0)
}

export function resolveBrowserDeviceState(
  snapshot: BrowserDeviceSnapshot
): BrowserDeviceResolution {
  return {
    deviceType: resolveBrowserDeviceType(snapshot),
    osType: resolveBrowserOsType(snapshot),
    breakpoint: resolveBrowserBreakpoint(snapshot),
  }
}
