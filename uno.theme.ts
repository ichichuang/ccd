import { BREAKPOINTS } from './src/constants/breakpoints'
import { SIZE_BASE_VAR_KEYS } from './src/constants/size'
import { SIZE_SCALE_KEYS } from './src/constants/sizeScale'
import { COLOR_FAMILIES } from './src/utils/theme/metadata'

// NOTE:
// - This file is used by `uno.config.ts` (Node/TS config context).
// - Keep it pure: only export constants/functions and avoid DOM/Vue runtime usage.

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
  // -------------------------
  // spacing (p-*/m-*/gap-*)
  // -------------------------
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

  // -------------------------
  // fontSize (text-*)
  // -------------------------
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
  ;(fontSize as Record<string, unknown>).base = fontSize.md

  // -------------------------
  // borderRadius (rounded-*)
  // -------------------------
  const borderRadius: Record<string, string> = {}
  for (const k of SIZE_SCALE_KEYS) {
    borderRadius[k] = `var(--radius-${k})`
  }

  // -------------------------
  // transitionDuration (duration-*)
  // -------------------------
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

export function buildThemeDemoSafelist(): string[] {
  const list: string[] = []

  // -------------------------
  // Color classes
  // -------------------------
  for (const token of COLOR_FAMILIES.singleTokens) {
    list.push(`bg-${token}`, `text-${token}`)
    if (['border', 'input', 'ring'].includes(token)) list.push(`border-${token}`)
  }

  for (const family of COLOR_FAMILIES.pairFamilies) {
    list.push(`bg-${family}`, `text-${family}-foreground`, `border-${family}`)
  }

  for (const family of COLOR_FAMILIES.quadFamilies) {
    list.push(
      `bg-${family}`,
      `bg-${family}-hover`,
      `bg-${family}-light`,
      `text-${family}`,
      `text-${family}-foreground`,
      `text-${family}-hover-foreground`,
      `text-${family}-light-foreground`,
      `border-${family}`,
      `border-${family}-hover`,
      `border-${family}-light`
    )
  }

  const sidebarKeys = Object.keys(COLOR_FAMILIES.sidebar) as (keyof typeof COLOR_FAMILIES.sidebar)[]
  for (const key of sidebarKeys) {
    const varName = COLOR_FAMILIES.sidebar[key]
    list.push(`bg-${varName}`, `text-${varName}`)
    if (key === 'border' || key === 'ring') list.push(`border-${varName}`)
  }

  list.push(
    'border-danger/50',
    'border-primary/20',
    'border-primary/30',
    'border-primary/50',
    'dark:bg-primary-light',
    'dark:border-primary/50',
    'bg-info/10'
  )

  // PrimeVue Button hover/outlined background opacities.
  list.push(
    ...COLOR_FAMILIES.quadFamilies.flatMap(family =>
      [5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90].map(v => `bg-${family}/${v}`)
    )
  )

  // -------------------------
  // Spacing / typography / radius / duration (native prefixes)
  // -------------------------
  for (const key of SIZE_BASE_VAR_KEYS) {
    const kebab = toKebab(key)
    list.push(
      `p-${kebab}`,
      `px-${kebab}`,
      `py-${kebab}`,
      `pt-${kebab}`,
      `pb-${kebab}`,
      `pl-${kebab}`,
      `pr-${kebab}`
    )
  }

  for (const k of SIZE_SCALE_KEYS) {
    // text
    list.push(`text-${k}`)

    // padding / margin
    list.push(`p-${k}`, `px-${k}`, `py-${k}`, `pt-${k}`, `pb-${k}`, `pl-${k}`, `pr-${k}`)
    list.push(`m-${k}`, `mx-${k}`, `my-${k}`, `mt-${k}`, `mb-${k}`, `ml-${k}`, `mr-${k}`)

    // gap
    list.push(`gap-${k}`, `gap-x-${k}`, `gap-y-${k}`)

    // rounded
    list.push(
      `rounded-${k}`,
      `rounded-t-${k}`,
      `rounded-b-${k}`,
      `rounded-l-${k}`,
      `rounded-r-${k}`,
      `rounded-tl-${k}`,
      `rounded-tr-${k}`,
      `rounded-bl-${k}`,
      `rounded-br-${k}`
    )

    // duration
    list.push(`duration-${k}`)

    // scroll-margin
    list.push(
      `scroll-m-${k}`,
      `scroll-mx-${k}`,
      `scroll-my-${k}`,
      `scroll-mt-${k}`,
      `scroll-mb-${k}`,
      `scroll-ml-${k}`,
      `scroll-mr-${k}`
    )
  }

  // -------------------------
  // Icons used by demos (keep old behavior)
  // -------------------------
  list.push(
    'i-lucide-circle-dot',
    'i-lucide-panel-left',
    'i-lucide-diamond',
    'i-lucide-sun-moon',
    'i-lucide-sparkles',
    'i-lucide-minimize-2'
  )

  // PrimeVue hover backgrounds for text/outlined variants.
  list.push(
    'hover:bg-sidebar-accent/50',
    'hover:bg-danger-light',
    'hover:bg-primary-light',
    'hover:bg-success-light',
    'hover:bg-info-light',
    'hover:bg-warn-light',
    'hover:bg-help-light',
    'bg-danger/10',
    'bg-primary/5',
    'bg-info/10'
  )

  return list
}

// Re-export for convenience / debugging (optional usage in future).
export { breakpoints }
