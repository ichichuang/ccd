import { BREAKPOINTS } from '../../constants/breakpoints'
import { LAYOUT_DIMENSION_KEYS, SIZE_BASE_VAR_KEYS } from '../../constants/size'
import { SIZE_SCALE_KEYS } from '../../constants/sizeScale'
import { buildSemanticThemeColors } from './colors'

// NOTE:
// - This module is *pure theme mapping data* (Node/UnoCSS config safe).
// - No DOM/Vue runtime usage.

const breakpoints: Record<string, string> = Object.fromEntries(
  Object.entries(BREAKPOINTS).map(([k, v]) => [k, typeof v === 'number' ? `${v}px` : (v as string)])
)

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

  // transitionDuration / duration (duration-*)
  const duration: Record<string, string> = {}
  const transitionDuration: Record<string, string> = {}
  for (const k of SIZE_SCALE_KEYS) {
    const cssVar = `var(--transition-${k})`
    duration[k] = cssVar
    transitionDuration[k] = cssVar
  }

  const colors = buildSemanticThemeColors()

  // Layout dimension CSS variables → native w-* / h-* / min-w-* / max-w-* / min-h-* / max-h-* support
  const layoutDimensionEntries = Object.fromEntries(
    LAYOUT_DIMENSION_KEYS.map(k => [k, `var(--${toKebab(k)})`])
  )

  return {
    breakpoints,

    transitionTimingFunction: {
      'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      'in-out-expo': 'cubic-bezier(0.87, 0, 0.13, 1)',
      // Material System v1.0 — Motion curves
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },

    colors,
    borderColor: colors,

    fontSize,
    fontFamily: {
      sans: '"PingFang SC", "Microsoft YaHei", "Source Han Sans CN", "Source Han Sans SC", system-ui, -apple-system, sans-serif',
    },

    spacing,
    borderRadius,
    duration,
    transitionDuration,

    animation: {
      keyframes: {
        'orb-drift':
          '{ 0% { transform: translate3d(0, 0, 0) scale(1); } 35% { transform: translate3d(28px, -20px, 0) scale(1.04); } 70% { transform: translate3d(16px, -56px, 0) scale(1.08); } 100% { transform: translate3d(42px, -68px, 0) scale(1.12); } }',
        'orb-drift-alt':
          '{ 0% { transform: translate3d(0, 0, 0) scale(1); } 30% { transform: translate3d(-34px, 18px, 0) scale(0.98); } 65% { transform: translate3d(-58px, 42px, 0) scale(0.95); } 100% { transform: translate3d(-78px, 56px, 0) scale(0.9); } }',
        'orb-pulse':
          '{ 0%, 100% { opacity: 0.7; transform: translate3d(0, 0, 0) scale(0.96); } 50% { opacity: 1; transform: translate3d(8px, -10px, 0) scale(1.08); } }',
      },
      durations: { 'orb-drift': '15s', 'orb-drift-alt': '25s', 'orb-pulse': '20s' },
      timingFns: {
        'orb-drift': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'orb-drift-alt': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'orb-pulse': 'ease-in-out',
      },
      counts: { 'orb-drift': 'infinite', 'orb-drift-alt': 'infinite', 'orb-pulse': 'infinite' },
      directions: {
        'orb-drift': 'alternate',
        'orb-drift-alt': 'alternate',
        'orb-pulse': 'alternate',
      },
    },

    // 布局维度变量，恢复 w-*/h-*/min-w-*/max-w-*/min-h-*/max-h-* 原生支持
    width: layoutDimensionEntries,
    height: layoutDimensionEntries,
    minWidth: layoutDimensionEntries,
    maxWidth: layoutDimensionEntries,
    minHeight: layoutDimensionEntries,
    maxHeight: layoutDimensionEntries,
  }
})()
