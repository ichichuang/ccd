/**
 * Theme Engine v4 — Token Resolution Pipeline
 *
 * Resolves a ThemeModeConfig into a fully populated ResolvedTheme.
 *
 * Pipeline order (invariant: semantic tokens only depend on base tokens):
 *   1. Normalize input (resolve all optional chains to concrete hex values)
 *   2. Resolve base tokens (background, foreground, primary, accent, neutral)
 *   3. Resolve semantic tokens (explicit > derive via OKLCH rules)
 *   4. Resolve state tokens (hover, light, foreground for each color family)
 *   5. Resolve sidebar independently
 *   6. Validate (no undefined, all hex valid)
 */

import {
  parseColor,
  toHex,
  darken,
  lighten,
  mix,
  adjustHue,
  ensureReadableForeground,
  contrastRatio,
  type Oklch,
} from './color'
import { buildTokenGraph, type TokenGraph, type TokenNodeSource } from './graph'
import { emitThemeEvent } from './observability'
import { recordResolveMetric } from './metrics'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ResolvedColorFamily {
  base: string
  foreground: string
  hover: string
  hoverForeground: string
  light: string
  lightForeground: string
}

export interface ResolvedSidebar {
  background: string
  foreground: string
  primary: string
  primaryForeground: string
  accent: string
  accentForeground: string
  border: string
  ring: string
}

export interface ResolvedTheme {
  background: string
  foreground: string
  card: string
  cardForeground: string
  primary: ResolvedColorFamily
  accent: ResolvedColorFamily
  secondary: { base: string; foreground: string }
  muted: { base: string; foreground: string }
  danger: ResolvedColorFamily
  warn: ResolvedColorFamily
  success: ResolvedColorFamily
  info: ResolvedColorFamily
  help: ResolvedColorFamily
  border: string
  input: string
  ring: string
  sidebar: ResolvedSidebar
  graph?: TokenGraph
}

export interface ThemeResolutionOptions {
  preset?: string
  mode?: ThemeMode
}

export interface ThemeResolutionResult {
  theme: ResolvedTheme
  graph: TokenGraph
}

// ---------------------------------------------------------------------------
// Engine defaults (from metadata THEME_ENGINE, inlined for deterministic ref)
// ---------------------------------------------------------------------------

const DEFAULTS = {
  bgLight: '#F7F8F9',
  bgDark: '#09090b',
  fgLight: '#09090b',
  fgDark: '#ffffff',
  neutralLight: '#f4f4f5',
  neutralDark: '#27272a',
  cardLight: '#ffffff',
  cardDark: '#18181b',
  fallbackPrimary: '#000000',
  dangerDefault: '#ef4444',
  warnDefault: '#ca8a04',
  successDefault: '#10b981',
  infoDefault: '#0ea5e9',
  helpDefault: '#a855f7',
  accentHueShift: 24,
} as const

// ---------------------------------------------------------------------------
// Derivation constants (OKLCH-based)
// ---------------------------------------------------------------------------

const DERIVE = {
  /** Light mode: hover is darker than base. Dark mode: hover is lighter. */
  hoverDeltaL: 0.08,
  /** Light variant: mix with background at this weight (base weight). */
  lightMixWeight: 0.15,
  /** Secondary offset from card. */
  secondaryDeltaL: 0.02,
  /** Input offset from neutral.base. */
  inputDeltaL: 0.03,
  /** Sidebar bg offset from card. */
  sidebarDeltaL: 0.03,
  /** Card bg offset from background (when using simple preset). */
  cardDeltaL: 0.02,
} as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeHex(hex: string): string {
  if (!hex || !hex.startsWith('#')) return '#000000'
  let h = hex.replace('#', '')
  if (h.length === 3)
    h = h
      .split('')
      .map(c => c + c)
      .join('')
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return '#000000'
  return '#' + h
}

function resolveFirst<T>(...values: (T | undefined)[]): T | undefined {
  for (const v of values) {
    if (v !== undefined && v !== null) return v
  }
  return undefined
}

function readNow(): number {
  return globalThis.performance?.now() ?? 0
}

function eventSource(source: TokenNodeSource): 'base' | 'semantic' | 'fallback' {
  return source === 'derived' ? 'semantic' : source
}

function emitTokenGraphEvents(graph: TokenGraph): number {
  let derivedCount = 0

  for (const token of Object.keys(graph.nodes).sort()) {
    const node = graph.nodes[token]
    if (!node) continue

    emitThemeEvent({
      type: 'TOKEN_DERIVED',
      token,
      source: eventSource(node.source),
    })

    if (node.source === 'base') {
      emitThemeEvent({ type: 'TOKEN_OVERRIDDEN', token })
    }

    if (node.source === 'derived') {
      derivedCount += 1
    }
  }

  return derivedCount
}

function ensureReadableToken(token: string, bg: Oklch, preferredFg: Oklch): Oklch {
  const before = contrastRatio(bg, preferredFg)
  const adjusted = ensureReadableForeground(bg, preferredFg)
  const after = contrastRatio(bg, adjusted)

  if (after !== before) {
    emitThemeEvent({ type: 'CONTRAST_ADJUSTED', token, before, after })
  }

  return adjusted
}

function deriveHover(base: Oklch, isDark: boolean): Oklch {
  return isDark ? lighten(base, DERIVE.hoverDeltaL) : darken(base, DERIVE.hoverDeltaL)
}

function deriveLightVariant(base: Oklch, bg: Oklch): Oklch {
  return mix(base, bg, DERIVE.lightMixWeight)
}

function deriveLightForeground(base: Oklch): Oklch {
  // Mix base with black to create a readable darker variant for light backgrounds
  return mix(base, { l: 0, c: 0, h: 0 }, 0.6)
}

function resolveColorFamily(
  tokenPrefix: string,
  configDefaults: {
    default?: string
    foreground?: string
    hover?: string
    active?: string
    light?: string
    lightForeground?: string
  },
  fallbackDefault: string,
  isDark: boolean,
  bg: Oklch,
  fgBase: Oklch
): ResolvedColorFamily {
  const baseHex = normalizeHex(resolveFirst(configDefaults.default, fallbackDefault)!)
  const base = parseColor(baseHex)

  const foregroundHex = normalizeHex(
    resolveFirst(
      configDefaults.foreground,
      toHex(ensureReadableToken(`${tokenPrefix}.foreground`, base, fgBase))
    )!
  )

  const hoverHex = normalizeHex(
    resolveFirst(configDefaults.hover, toHex(deriveHover(base, isDark)))!
  )
  const hoverFg = ensureReadableToken(
    `${tokenPrefix}.hoverForeground`,
    parseColor(hoverHex),
    fgBase
  )
  const hoverFgHex = toHex(hoverFg)

  const lightHex = normalizeHex(
    resolveFirst(configDefaults.light, toHex(deriveLightVariant(base, bg)))!
  )
  const light = parseColor(lightHex)
  const lightFgDefault = deriveLightForeground(base)
  const lightFg = ensureReadableToken(`${tokenPrefix}.lightForeground`, light, lightFgDefault)
  const lightFgHex = normalizeHex(resolveFirst(configDefaults.lightForeground, toHex(lightFg))!)

  return {
    base: baseHex,
    foreground: foregroundHex,
    hover: hoverHex,
    hoverForeground: hoverFgHex,
    light: lightHex,
    lightForeground: lightFgHex,
  }
}

// ---------------------------------------------------------------------------
// Main resolver
// ---------------------------------------------------------------------------

function resolveThemeInternal(
  config: ThemeModeConfig,
  isDark: boolean,
  options: ThemeResolutionOptions = {}
): ThemeResolutionResult {
  const preset = options.preset ?? 'anonymous'
  const mode = options.mode ?? (isDark ? 'dark' : 'light')
  const start = readNow()

  emitThemeEvent({ type: 'RESOLVE_START', preset, mode })

  // ---- Step 1: normalize base tokens ----
  const bgHex = normalizeHex(
    resolveFirst(config.background, isDark ? DEFAULTS.bgDark : DEFAULTS.bgLight)!
  )
  const bg = parseColor(bgHex)

  const fgHex = normalizeHex(
    resolveFirst(config.foreground, isDark ? DEFAULTS.fgDark : DEFAULTS.fgLight)!
  )
  const fg = ensureReadableToken('foreground', bg, parseColor(fgHex))
  const fgBase = fg

  const neutralBaseHex = normalizeHex(
    resolveFirst(config.neutral?.base, isDark ? DEFAULTS.neutralDark : DEFAULTS.neutralLight)!
  )
  const neutralBgHex = normalizeHex(
    resolveFirst(config.neutral?.bg, isDark ? DEFAULTS.cardDark : DEFAULTS.cardLight)!
  )

  const primaryDefaultHex = resolveFirst(config.primary?.default, DEFAULTS.fallbackPrimary)!

  const accentDefaultHex = resolveFirst(
    config.accent?.default,
    toHex(adjustHue(parseColor(primaryDefaultHex), DEFAULTS.accentHueShift))
  )!

  // ---- Step 2: resolve color families ----
  const primary = resolveColorFamily(
    'primary',
    config.primary ?? {},
    primaryDefaultHex,
    isDark,
    bg,
    fgBase
  )

  const accent = resolveColorFamily(
    'accent',
    config.accent ?? {},
    accentDefaultHex,
    isDark,
    bg,
    fgBase
  )

  const danger = resolveColorFamily(
    'danger',
    config.danger ?? {},
    DEFAULTS.dangerDefault,
    isDark,
    bg,
    fgBase
  )

  const warn = resolveColorFamily(
    'warn',
    config.warn ?? {},
    DEFAULTS.warnDefault,
    isDark,
    bg,
    fgBase
  )

  const success = resolveColorFamily(
    'success',
    config.success ?? {},
    DEFAULTS.successDefault,
    isDark,
    bg,
    fgBase
  )

  const info = resolveColorFamily(
    'info',
    config.info ?? {},
    DEFAULTS.infoDefault,
    isDark,
    bg,
    fgBase
  )

  const help = resolveColorFamily(
    'help',
    config.help ?? {},
    DEFAULTS.helpDefault,
    isDark,
    bg,
    fgBase
  )

  // ---- Step 3: card ----
  const cardHex = normalizeHex(
    resolveFirst(
      config.neutral?.bg,
      toHex(isDark ? darken(bg, -DERIVE.cardDeltaL) : lighten(bg, DERIVE.cardDeltaL))
    )!
  )
  const card = parseColor(cardHex)
  const cardFg = ensureReadableToken('cardForeground', card, fgBase)
  const cardFgHex = normalizeHex(resolveFirst(config.neutral?.foreground, toHex(cardFg))!)

  // ---- Step 4: semantic tokens ----
  const secondaryBaseHex = normalizeHex(
    resolveFirst(
      config.secondary,
      toHex(isDark ? lighten(card, DERIVE.secondaryDeltaL) : darken(card, DERIVE.secondaryDeltaL))
    )!
  )
  const secondaryFgHex = normalizeHex(
    resolveFirst(config.secondaryForeground, config.neutral?.secondaryForeground, cardFgHex)!
  )

  const mutedBaseHex = normalizeHex(resolveFirst(config.muted, neutralBgHex)!)
  const mutedFgDefault = mix(parseColor(mutedBaseHex), { l: 0, c: 0, h: 0 }, 0.4)
  const mutedFgHex = normalizeHex(
    resolveFirst(config.mutedForeground, config.neutral?.mutedForeground, toHex(mutedFgDefault))!
  )

  const borderHex = normalizeHex(resolveFirst(config.border, neutralBaseHex)!)

  const inputHex = normalizeHex(
    resolveFirst(
      config.input,
      toHex(
        isDark
          ? lighten(parseColor(neutralBaseHex), DERIVE.inputDeltaL)
          : darken(parseColor(neutralBaseHex), DERIVE.inputDeltaL)
      )
    )!
  )

  const ringHex = normalizeHex(resolveFirst(config.ring, primary.base)!)

  // ---- Step 5: sidebar (independent resolution) ----
  const sidebarBgHex = normalizeHex(
    resolveFirst(
      config.sidebar?.background,
      toHex(isDark ? darken(card, DERIVE.sidebarDeltaL) : lighten(card, DERIVE.sidebarDeltaL))
    )!
  )
  const sidebarBg = parseColor(sidebarBgHex)
  const sidebarFgHex = normalizeHex(
    resolveFirst(
      config.sidebar?.foreground,
      toHex(ensureReadableToken('sidebar.foreground', sidebarBg, fgBase))
    )!
  )
  const sidebarPrimaryHex = normalizeHex(resolveFirst(config.sidebar?.primary, primary.base)!)
  const sidebarPrimary = parseColor(sidebarPrimaryHex)
  const sidebarPrimaryFgHex = normalizeHex(
    resolveFirst(
      config.sidebar?.primaryForeground,
      toHex(ensureReadableToken('sidebar.primaryForeground', sidebarPrimary, fgBase))
    )!
  )
  const sidebarAccentHex = normalizeHex(resolveFirst(config.sidebar?.accent, accent.base)!)
  const sidebarAccent = parseColor(sidebarAccentHex)
  const sidebarAccentFgHex = normalizeHex(
    resolveFirst(
      config.sidebar?.accentForeground,
      toHex(ensureReadableToken('sidebar.accentForeground', sidebarAccent, fgBase))
    )!
  )
  const sidebarBorderHex = normalizeHex(resolveFirst(config.sidebar?.border, borderHex)!)
  const sidebarRingHex = normalizeHex(resolveFirst(config.sidebar?.ring, accent.base)!)

  const theme: ResolvedTheme = {
    background: bgHex,
    foreground: toHex(fgBase),
    card: cardHex,
    cardForeground: cardFgHex,
    primary,
    accent,
    secondary: { base: secondaryBaseHex, foreground: secondaryFgHex },
    muted: { base: mutedBaseHex, foreground: mutedFgHex },
    danger,
    warn,
    success,
    info,
    help,
    border: borderHex,
    input: inputHex,
    ring: ringHex,
    sidebar: {
      background: sidebarBgHex,
      foreground: sidebarFgHex,
      primary: sidebarPrimaryHex,
      primaryForeground: sidebarPrimaryFgHex,
      accent: sidebarAccentHex,
      accentForeground: sidebarAccentFgHex,
      border: sidebarBorderHex,
      ring: sidebarRingHex,
    },
  }

  const graph = buildTokenGraph(theme, config)
  theme.graph = graph

  const duration = readNow() - start
  const derivedCount = emitTokenGraphEvents(graph)
  emitThemeEvent({ type: 'RESOLVE_END', duration })
  recordResolveMetric(preset, duration, derivedCount)

  return { theme, graph }
}

export function resolveTheme(
  config: ThemeModeConfig,
  isDark: boolean,
  options?: ThemeResolutionOptions
): ResolvedTheme {
  return resolveThemeInternal(config, isDark, options).theme
}

export function resolveThemeWithGraph(
  config: ThemeModeConfig,
  isDark: boolean,
  options?: ThemeResolutionOptions
): ThemeResolutionResult {
  return resolveThemeInternal(config, isDark, options)
}
