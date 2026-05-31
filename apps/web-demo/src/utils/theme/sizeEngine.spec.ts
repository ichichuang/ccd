// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import {
  decideLayoutDimensions as packageDecideLayoutDimensions,
  decideRootFontSize as packageDecideRootFontSize,
  generateSizeVars as packageGenerateSizeVars,
  getScopedContentSizeVars as packageGetScopedContentSizeVars,
} from '@ccd/design-tokens'
import type { SizePreset } from '@ccd/design-tokens'
import {
  decideLayoutDimensions,
  decideRootFontSize,
  generateSizeVars,
  getPresetBySizeMode,
  getScopedContentSizeVars,
} from './sizeEngine'

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
  fontSizeBase: 10,
}

describe('generateSizeVars facade', () => {
  it('delegates comfortable preset calculation to design-tokens', () => {
    expect(generateSizeVars(comfortablePreset)).toEqual(packageGenerateSizeVars(comfortablePreset))
  })

  it('delegates compact preset calculation to design-tokens', () => {
    expect(generateSizeVars(compactPreset)).toEqual(packageGenerateSizeVars(compactPreset))
  })
})

describe('decideRootFontSize facade', () => {
  it('delegates PC root size decisions to design-tokens', () => {
    const context = {
      deviceType: 'PC' as const,
      breakpoint: 'xl' as const,
      preset: comfortablePreset,
    }

    expect(decideRootFontSize(context)).toEqual(packageDecideRootFontSize(context))
  })

  it('delegates Mobile root size decisions to design-tokens', () => {
    const context = {
      deviceType: 'Mobile' as const,
      breakpoint: 'xs' as const,
      preset: comfortablePreset,
    }

    expect(decideRootFontSize(context)).toEqual(packageDecideRootFontSize(context))
    expect(decideRootFontSize(context).scaleKey).toBe('md')
  })

  it('delegates Tablet root size decisions to design-tokens', () => {
    const context = {
      deviceType: 'Tablet' as const,
      breakpoint: 'lg' as const,
      preset: comfortablePreset,
    }

    expect(decideRootFontSize(context)).toEqual(packageDecideRootFontSize(context))
  })

  it('preserves Mobile minimum pixel behavior', () => {
    const result = decideRootFontSize({
      deviceType: 'Mobile',
      breakpoint: 'xs',
      preset: tinyPreset,
    })

    expect(result.pixelValue).toBeGreaterThanOrEqual(15)
  })
})

describe('size resolver compatibility facade', () => {
  it('delegates layout dimensions to design-tokens', () => {
    const context = {
      deviceType: 'PC' as const,
      breakpoint: '4xl' as const,
      preset: comfortablePreset,
    }

    expect(decideLayoutDimensions(context)).toEqual(packageDecideLayoutDimensions(context))
  })

  it('preserves preset fallback and scoped content variables', () => {
    const preset = getPresetBySizeMode('comfortable')

    expect(preset.name).toBe('comfortable')
    expect(getScopedContentSizeVars('comfortable')).toEqual(
      packageGetScopedContentSizeVars('comfortable')
    )
  })
})
