import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SIZE_NAME,
  SIZE_PRESETS,
  decideLayoutDimensions,
  decideRootFontSize,
  deriveRuntimeFontSizeVars,
  generateSizeVars,
  getScopedContentSizeVars,
  resolveSizePreset,
} from './index.js'
import type { SizePreset } from './types.js'

const comfortablePreset = resolveSizePreset('comfortable', SIZE_PRESETS, DEFAULT_SIZE_NAME)

describe('size resolver', () => {
  it('generates content size variables from a preset without runtime access', () => {
    const vars = generateSizeVars(comfortablePreset)

    expect(vars['--spacing-unit']).toBe('4px')
    expect(vars['--container-padding']).toBe('20px')
    expect(vars['--control-height']).toBe('36px')
    expect(vars['--font-size-md']).toBe('16px')
    expect(vars['--spacing-md']).toBe('16px')
    expect(vars['--radius-md']).toBe('8px')
    expect(vars['--transition-md']).toBe('320ms')
  })

  it('decides root font size for mobile, tablet, and desktop contexts', () => {
    const tinyPreset: SizePreset = {
      ...comfortablePreset,
      fontSizeBase: 10,
    }

    expect(
      decideRootFontSize({
        deviceType: 'Mobile',
        breakpoint: 'xs',
        preset: tinyPreset,
      })
    ).toEqual({ scaleKey: 'md', pixelValue: 15 })

    expect(
      decideRootFontSize({
        deviceType: 'Mobile',
        breakpoint: 'xs',
        preset: tinyPreset,
        pixelRatio: 3,
      })
    ).toEqual({ scaleKey: 'md', pixelValue: 16 })

    expect(
      decideRootFontSize({
        deviceType: 'Tablet',
        breakpoint: 'lg',
        preset: comfortablePreset,
      })
    ).toEqual({ scaleKey: 'lg', pixelValue: 18 })

    expect(
      decideRootFontSize({
        deviceType: 'PC',
        breakpoint: '5xl',
        preset: comfortablePreset,
      })
    ).toEqual({ scaleKey: '2xl', pixelValue: 24 })
  })

  it('decides layout dimensions from preset and breakpoint context', () => {
    expect(
      decideLayoutDimensions({
        deviceType: 'PC',
        breakpoint: '4xl',
        preset: comfortablePreset,
      })
    ).toEqual({
      '--sidebar-width': '336px',
      '--sidebar-collapsed-width': `${comfortablePreset.sidebarCollapsedWidth}px`,
      '--header-height': '72px',
      '--breadcrumb-height': '38.4px',
      '--footer-height': '38.4px',
      '--tabs-height': '48px',
    })

    expect(
      decideLayoutDimensions({
        deviceType: 'Tablet',
        breakpoint: '4xl',
        preset: comfortablePreset,
      })['--sidebar-width']
    ).toBe('280px')
  })

  it('derives runtime font variables using the existing normalized ratio formula', () => {
    const vars = deriveRuntimeFontSizeVars({ scaleKey: 'lg', pixelValue: 18 })

    expect(vars['--font-size-root']).toBe('18px')
    expect(vars['--font-size-xs']).toBe('13px')
    expect(vars['--font-size-sm']).toBe('15px')
    expect(vars['--font-size-md']).toBe('16px')
    expect(vars['--font-size-lg']).toBe('18px')
    expect(vars['--font-size-xl']).toBe('19px')
    expect(vars['--font-size-2xl']).toBe('24px')
    expect(vars['--font-size-3xl']).toBe('30px')
    expect(vars['--font-size-4xl']).toBe('36px')
    expect(vars['--font-size-5xl']).toBe('48px')
  })

  it('resolves presets and scoped content vars with stable fallback behavior', () => {
    expect(resolveSizePreset('compact', SIZE_PRESETS, DEFAULT_SIZE_NAME)).toBe(SIZE_PRESETS[0])
    expect(resolveSizePreset(undefined, SIZE_PRESETS, DEFAULT_SIZE_NAME)).toBe(comfortablePreset)

    const scoped = getScopedContentSizeVars('comfortable', SIZE_PRESETS, DEFAULT_SIZE_NAME)

    expect(scoped['--font-size-root']).toBe('16px')
    expect(scoped['--spacing-md']).toBe('16px')
    expect(scoped['--dialog-settings-width']).toBeUndefined()
  })
})
