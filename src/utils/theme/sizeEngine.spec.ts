// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'

const sizePresetMocks = vi.hoisted(() => {
  const comfortablePreset: SizePreset = {
    name: 'comfortable',
    label: 'Comfortable',
    radius: 8,
    spacingBase: 4,
    fontSizeBase: 16,
    sidebarWidth: 280,
    sidebarCollapsedWidth: 60,
    headerHeight: 60,
    breadcrumbHeight: 32,
    footerHeight: 32,
    tabsHeight: 40,
  }

  const compactPreset: SizePreset = {
    name: 'compact',
    label: 'Compact',
    radius: 6,
    spacingBase: 3,
    fontSizeBase: 14,
    sidebarWidth: 260,
    sidebarCollapsedWidth: 56,
    headerHeight: 48,
    breadcrumbHeight: 28,
    footerHeight: 28,
    tabsHeight: 36,
  }

  const tinyPreset: SizePreset = {
    ...comfortablePreset,
    name: 'comfortable',
    fontSizeBase: 10,
  }

  return {
    comfortablePreset,
    compactPreset,
    tinyPreset,
  }
})

vi.mock('@/constants/size', () => ({
  sizePresets: [sizePresetMocks.comfortablePreset, sizePresetMocks.compactPreset],
  defaultSizeName: 'comfortable',
}))

import { generateSizeVars, decideRootFontSize } from './sizeEngine'

const { comfortablePreset, compactPreset, tinyPreset } = sizePresetMocks

describe('generateSizeVars', () => {
  it('returns CSS variable object for comfortable preset', () => {
    const vars = generateSizeVars(comfortablePreset)
    expect(typeof vars).toBe('object')
    expect(Object.keys(vars).length).toBeGreaterThan(0)
  })

  it('returns CSS variable object for compact preset', () => {
    const vars = generateSizeVars(compactPreset)
    expect(typeof vars).toBe('object')
    expect(Object.keys(vars).length).toBeGreaterThan(0)
  })
})

describe('decideRootFontSize', () => {
  it('returns scaleKey and pixelValue for PC', () => {
    const result = decideRootFontSize({
      deviceType: 'PC',
      breakpoint: 'xl',
      preset: comfortablePreset,
    })
    expect(result).toHaveProperty('scaleKey')
    expect(result).toHaveProperty('pixelValue')
    expect(typeof result.pixelValue).toBe('number')
    expect(result.pixelValue).toBeGreaterThan(0)
  })

  it('returns valid result for Mobile', () => {
    const result = decideRootFontSize({
      deviceType: 'Mobile',
      breakpoint: 'xs',
      preset: comfortablePreset,
    })
    expect(result).toHaveProperty('scaleKey')
    expect(result.scaleKey).toBe('md')
    expect(result.pixelValue).toBeGreaterThan(0)
  })

  it('returns valid result for Tablet', () => {
    const result = decideRootFontSize({
      deviceType: 'Tablet',
      breakpoint: 'lg',
      preset: comfortablePreset,
    })
    expect(result).toHaveProperty('scaleKey')
    expect(result.pixelValue).toBeGreaterThan(0)
  })

  it('Mobile enforces minimum 15px', () => {
    const result = decideRootFontSize({
      deviceType: 'Mobile',
      breakpoint: 'xs',
      preset: tinyPreset,
    })
    expect(result.pixelValue).toBeGreaterThanOrEqual(15)
  })
})
