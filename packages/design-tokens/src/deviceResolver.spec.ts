import { describe, expect, it } from 'vitest'
import {
  createSortedBreakpoints,
  resolveBreakpointFromWidth,
  resolveDeviceTypeFromInputs,
  resolveOrientationFromViewport,
  resolveOsTypeFromUserAgent,
  resolveViewportMetrics,
} from './index.js'

describe('device resolver', () => {
  it('sorts breakpoints by descending width and resolves the current breakpoint', () => {
    expect(createSortedBreakpoints({ xs: 480, sm: 640, xl: 1280 })).toEqual([
      ['xl', 1280],
      ['sm', 640],
      ['xs', 480],
    ])

    expect(resolveBreakpointFromWidth(320)).toBe('xs')
    expect(resolveBreakpointFromWidth(480)).toBe('xs')
    expect(resolveBreakpointFromWidth(640)).toBe('sm')
    expect(resolveBreakpointFromWidth(1280)).toBe('xl')
    expect(resolveBreakpointFromWidth(3840)).toBe('5xl')
  })

  it('resolves physical device type from injected browser inputs', () => {
    expect(
      resolveDeviceTypeFromInputs({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        maxTouchPoints: 5,
        screenWidth: 390,
        screenHeight: 844,
      })
    ).toBe('Mobile')

    expect(
      resolveDeviceTypeFromInputs({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15',
        maxTouchPoints: 5,
        screenWidth: 820,
        screenHeight: 1180,
      })
    ).toBe('Tablet')

    expect(
      resolveDeviceTypeFromInputs({
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel Tablet) AppleWebKit/537.36',
        maxTouchPoints: 10,
        screenWidth: 1280,
        screenHeight: 800,
      })
    ).toBe('Tablet')
  })

  it('resolves OS type from injected user agent and touch capability', () => {
    expect(resolveOsTypeFromUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 0)).toBe(
      'Windows'
    )
    expect(resolveOsTypeFromUserAgent('Mozilla/5.0 (Linux; Android 14; Pixel 8)', 5)).toBe(
      'Android'
    )
    expect(
      resolveOsTypeFromUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15',
        5
      )
    ).toBe('iOS')
    expect(
      resolveOsTypeFromUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15',
        0
      )
    ).toBe('MacOS')
    expect(resolveOsTypeFromUserAgent('', 0)).toBe('Unknown')
  })

  it('resolves orientation from viewport dimensions', () => {
    expect(resolveOrientationFromViewport(844, 390)).toBe('horizontal')
    expect(resolveOrientationFromViewport(390, 844)).toBe('vertical')
    expect(resolveOrientationFromViewport(0, 0)).toBe('horizontal')
  })

  it('derives viewport metrics from explicit numeric inputs only', () => {
    expect(
      resolveViewportMetrics({
        width: 390,
        height: 844,
        screenWidth: 820,
        screenHeight: 1180,
        pixelRatio: 2,
      })
    ).toEqual({
      width: 390,
      height: 844,
      screenWidth: 820,
      screenHeight: 1180,
      screenShortSide: 390,
      screenLongSide: 844,
      orientation: 'vertical',
      pixelRatio: 2,
    })
  })
})
