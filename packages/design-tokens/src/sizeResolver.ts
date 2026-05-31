import { DEFAULT_SIZE_NAME, SIZE_PRESETS, deriveSidebarCollapsedWidth } from './size.js'
import {
  FONT_SCALE_RATIOS,
  LAYOUT_SCALE_RATIOS,
  RADIUS_SCALE_RATIOS,
  SIZE_SCALE_KEYS,
  SPACING_SCALE_RATIOS,
  TRANSITION_SCALE_MS,
  type SizeScaleKey,
} from './sizeScale.js'
import type { SizeCssVars, SizeMode, SizePreset } from './types.js'

export type SizeResolverDeviceType = 'Mobile' | 'Tablet' | 'PC'

export interface RootFontSizeContext {
  deviceType: SizeResolverDeviceType
  breakpoint: SizeScaleKey
  preset: SizePreset
  pixelRatio?: number
}

export interface RootFontSizeDecision {
  scaleKey: SizeScaleKey
  pixelValue: number
}

export const SIZE_FONT_VAR_PREFIX = '--font-size-'

export function generateSizeVars(preset: SizePreset): Partial<SizeCssVars> {
  const controlHeight = Math.round(preset.fontSizeBase + preset.spacingBase * 5)
  const controlHeightSm = Math.round(preset.fontSizeBase * 0.96 + preset.spacingBase * 4)
  const controlHeightLg = Math.round(preset.fontSizeBase * 1.125 + preset.spacingBase * 6)

  const vars: Partial<SizeCssVars> = {
    '--spacing-unit': `${preset.spacingBase}px`,
    '--container-padding': `${preset.spacingBase * 5}px`,
    '--control-height': `${controlHeight}px`,
    '--control-height-sm': `${controlHeightSm}px`,
    '--control-height-lg': `${controlHeightLg}px`,
    '--control-action-size': `${controlHeight}px`,
    '--control-action-size-sm': `${controlHeightSm}px`,
    '--control-action-size-lg': `${controlHeightLg}px`,
  }

  SIZE_SCALE_KEYS.forEach(key => {
    const size = Math.round(preset.fontSizeBase * FONT_SCALE_RATIOS[key])
    vars[`--font-size-${key}` as keyof SizeCssVars] = `${size}px`
  })

  SIZE_SCALE_KEYS.forEach(key => {
    const size = preset.spacingBase * SPACING_SCALE_RATIOS[key]
    vars[`--spacing-${key}` as keyof SizeCssVars] = `${size}px`
  })

  SIZE_SCALE_KEYS.forEach(key => {
    const size = preset.radius * RADIUS_SCALE_RATIOS[key]
    vars[`--radius-${key}` as keyof SizeCssVars] = `${Math.round(size)}px`
  })

  SIZE_SCALE_KEYS.forEach(key => {
    vars[`--transition-${key}` as keyof SizeCssVars] = `${TRANSITION_SCALE_MS[key]}ms`
  })

  return vars
}

export function decideLayoutDimensions(ctx: RootFontSizeContext): Record<string, string> {
  const { deviceType, breakpoint, preset } = ctx
  const ratio =
    deviceType === 'Mobile' || deviceType === 'Tablet' ? 1 : (LAYOUT_SCALE_RATIOS[breakpoint] ?? 1)

  return {
    '--sidebar-width': `${preset.sidebarWidth * ratio}px`,
    '--sidebar-collapsed-width': `${deriveSidebarCollapsedWidth(preset)}px`,
    '--header-height': `${preset.headerHeight * ratio}px`,
    '--breadcrumb-height': `${preset.breadcrumbHeight * ratio}px`,
    '--footer-height': `${preset.footerHeight * ratio}px`,
    '--tabs-height': `${preset.tabsHeight * ratio}px`,
  }
}

export function decideRootFontSize(ctx: RootFontSizeContext): RootFontSizeDecision {
  const { deviceType, breakpoint, preset, pixelRatio = 1 } = ctx

  if (deviceType === 'Mobile') {
    const scaleKey: SizeScaleKey = 'md'
    const ratio = FONT_SCALE_RATIOS[scaleKey]
    const minBase = pixelRatio >= 3 ? 16 : 15
    const pixelValue = Math.max(minBase, Math.round(preset.fontSizeBase * ratio))
    return { scaleKey, pixelValue }
  }

  if (deviceType === 'Tablet') {
    let scaleKey: SizeScaleKey
    switch (breakpoint) {
      case 'xs':
      case 'sm':
        scaleKey = 'md'
        break
      case 'md':
      case 'lg':
        scaleKey = 'lg'
        break
      default:
        scaleKey = 'xl'
        break
    }

    const pixelValue = Math.round(preset.fontSizeBase * FONT_SCALE_RATIOS[scaleKey])
    return { scaleKey, pixelValue }
  }

  let scaleKey: SizeScaleKey
  switch (breakpoint) {
    case 'xs':
      scaleKey = 'sm'
      break
    case 'sm':
    case 'md':
    case 'lg':
    case 'xl':
      scaleKey = 'md'
      break
    case '2xl':
    case '3xl':
      scaleKey = 'lg'
      break
    case '4xl':
      scaleKey = 'xl'
      break
    case '5xl':
      scaleKey = '2xl'
      break
    default:
      scaleKey = 'md'
      break
  }

  const pixelValue = Math.round(preset.fontSizeBase * FONT_SCALE_RATIOS[scaleKey])
  return { scaleKey, pixelValue }
}

export function deriveRuntimeFontSizeVars(decision: RootFontSizeDecision): Record<string, string> {
  const base = decision.pixelValue
  const rootRatio = FONT_SCALE_RATIOS[decision.scaleKey]
  const vars: Record<string, string> = {
    '--font-size-root': `${base}px`,
  }

  SIZE_SCALE_KEYS.forEach(key => {
    const size = Math.round(base * (FONT_SCALE_RATIOS[key] / rootRatio))
    vars[`--font-size-${key}`] = `${size}px`
  })

  return vars
}

export function resolveSizePreset(
  mode: SizeMode | undefined,
  presets: readonly SizePreset[] = SIZE_PRESETS,
  defaultMode: SizeMode = DEFAULT_SIZE_NAME
): SizePreset {
  return (
    presets.find(preset => preset.name === mode) ??
    presets.find(preset => preset.name === defaultMode) ??
    presets[0]
  )
}

export function getScopedContentSizeVars(
  mode: SizeMode,
  presets: readonly SizePreset[] = SIZE_PRESETS,
  defaultMode: SizeMode = DEFAULT_SIZE_NAME
): Record<string, string> {
  const preset = resolveSizePreset(mode, presets, defaultMode)
  const vars = generateSizeVars(preset)
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(vars)) {
    if (value != null) out[key] = value
  }
  out['--font-size-root'] = `${preset.fontSizeBase}px`
  return out
}
