import { describe, expect, it } from 'vitest'
import {
  resolveBrowserBreakpoint,
  resolveBrowserDeviceState,
  resolveBrowserDeviceType,
  resolveBrowserOsType,
} from './browserDevice'

describe('browser device helpers', () => {
  it('resolves browser device type, OS, and breakpoint from an injected snapshot', () => {
    const snapshot = {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15',
      maxTouchPoints: 5,
      screenWidth: 820,
      screenHeight: 1180,
      viewportWidth: 1280,
    }

    expect(resolveBrowserDeviceState(snapshot)).toEqual({
      deviceType: 'Tablet',
      osType: 'iOS',
      breakpoint: 'xl',
    })
  })

  it('exposes narrow resolvers for app-owned browser adapters', () => {
    expect(
      resolveBrowserDeviceType({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        maxTouchPoints: 5,
        screenWidth: 390,
        screenHeight: 844,
      })
    ).toBe('Mobile')
    expect(resolveBrowserOsType({ userAgent: 'Mozilla/5.0 (Windows NT 10.0)' })).toBe('Windows')
    expect(resolveBrowserBreakpoint({ viewportWidth: 640 })).toBe('sm')
  })
})
