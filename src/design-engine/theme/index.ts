import { BREAKPOINTS } from '@/constants/breakpoints'
import { SIZE_BASE_VAR_KEYS } from '@/constants/size'
import { SIZE_SCALE_KEYS } from '@/constants/sizeScale'
import { COLOR_FAMILIES } from '@/utils/theme/metadata'

// NOTE:
// - This module is *pure theme mapping data* (Node/UnoCSS config safe).
// - No DOM/Vue runtime usage.

const breakpoints: Record<string, string> = Object.fromEntries(
  Object.entries(BREAKPOINTS).map(([k, v]) => [k, typeof v === 'number' ? `${v}px` : (v as string)])
)

const rgbVar = (name: string) => `rgb(var(--${name}) / <alpha-value>)`

function buildThemeColors(): Record<string, string | Record<string, string>> {
  const colors: Record<string, string | Record<string, string>> = {}

  // Single tokens: direct mapping to same-name CSS vars.
  for (const token of COLOR_FAMILIES.singleTokens) {
    colors[token] = rgbVar(token)
  }

  // Pair families: DEFAULT + foreground
  for (const family of COLOR_FAMILIES.pairFamilies) {
    colors[family] = {
      DEFAULT: rgbVar(family),
      foreground: rgbVar(`${family}-foreground`),
    }
  }

  // Quad families: DEFAULT + foreground + hover + hover-foreground + light + light-foreground
  for (const family of COLOR_FAMILIES.quadFamilies) {
    colors[family] = {
      DEFAULT: rgbVar(family),
      foreground: rgbVar(`${family}-foreground`),
      hover: rgbVar(`${family}-hover`),
      'hover-foreground': rgbVar(`${family}-hover-foreground`),
      light: rgbVar(`${family}-light`),
      'light-foreground': rgbVar(`${family}-light-foreground`),
    }
  }

  // Sidebar families: use sidebar-specific CSS vars.
  colors.sidebar = {
    DEFAULT: rgbVar(COLOR_FAMILIES.sidebar.background),
    foreground: rgbVar(COLOR_FAMILIES.sidebar.foreground),
    primary: rgbVar(COLOR_FAMILIES.sidebar.primary),
    'primary-foreground': rgbVar(COLOR_FAMILIES.sidebar['primary-foreground']),
    accent: rgbVar(COLOR_FAMILIES.sidebar.accent),
    'accent-foreground': rgbVar(COLOR_FAMILIES.sidebar['accent-foreground']),
    border: rgbVar(COLOR_FAMILIES.sidebar.border),
    ring: rgbVar(COLOR_FAMILIES.sidebar.ring),
  }

  return colors
}

function toKebab(s: string): string {
  return s.replace(/([A-Z])/g, '-$1').toLowerCase()
}

export const theme = (() => {
  // spacing (p-*/m-*/gap-*)
  const spacingBase: Record<string, string> = {
    unit: 'var(--spacing-unit)',
    px: '1px',
    '0': '0',
  }

  const scaleSpacingEntries = SIZE_SCALE_KEYS.map(k => [k, `var(--spacing-${k})`] as const)

  // Keep base var classes working (e.g. `p-container-padding`) without custom rules.
  const baseVarSpacingEntries = SIZE_BASE_VAR_KEYS.map(
    k => [toKebab(k), `var(--${toKebab(k)})`] as const
  )

  const spacing = {
    ...spacingBase,
    ...Object.fromEntries(scaleSpacingEntries),
    ...Object.fromEntries(baseVarSpacingEntries),
  }

  // fontSize (text-*)
  const lineHeightMap: Record<string, string> = {
    xs: '1',
    sm: '1.25',
    md: '1.5',
    lg: '1.75',
    xl: '1.75',
    ['2xl']: '2',
    ['3xl']: '2.25',
    ['4xl']: '2.5',
    ['5xl']: '1',
  }

  const fontSize: Record<string, [string, Record<string, string>]> & { base?: unknown } = {}
  for (const k of SIZE_SCALE_KEYS) {
    fontSize[k] = [`var(--font-size-${k})`, { 'line-height': lineHeightMap[k] ?? '1.5' }]
  }
  // Alias: text-base -> same as text-md.
  fontSize.base = fontSize.md

  // borderRadius (rounded-*)
  const borderRadius: Record<string, string> = {}
  for (const k of SIZE_SCALE_KEYS) {
    borderRadius[k] = `var(--radius-${k})`
  }

  // transitionDuration (duration-*)
  const transitionDuration: Record<string, string> = {}
  for (const k of SIZE_SCALE_KEYS) {
    transitionDuration[k] = `var(--transition-${k})`
  }

  const colors = buildThemeColors()

  return {
    breakpoints,

    transitionTimingFunction: {
      'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      'in-out-expo': 'cubic-bezier(0.87, 0, 0.13, 1)',
    },

    colors,
    borderColor: colors,

    fontSize,
    fontFamily: {
      sans: '"PingFang SC", "Microsoft YaHei", "Source Han Sans CN", "Source Han Sans SC", system-ui, -apple-system, sans-serif',
    },

    spacing,
    borderRadius,
    transitionDuration,
  }
})()
