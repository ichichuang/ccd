/**
 * Theme Engine v4 — Auto Derivation Engine
 *
 * Fills missing semantic tokens in a ThemeModeConfig using OKLCH derivation rules.
 * Replaces the old completeTheme() with stricter rules and more capabilities.
 */

import {
  toHex,
  parseColor,
  darken,
  lighten,
  mix,
  ensureReadableForeground,
  contrastRatio,
} from './color.js'
import type { ThemeModeConfig } from '../types.js'
import { emitThemeEvent } from './observability.js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DeriveOptions {
  /** If true, throws when base tokens (primary, neutral.base, neutral.bg, background) are missing. */
  strict?: boolean
  /** If true, auto-corrects foreground colors that fail WCAG AA contrast. */
  autoContrast?: boolean
  /** If true, generates hover/light/foreground variants for all color families. */
  generateStates?: boolean
}

const DEFAULT_OPTIONS: Required<DeriveOptions> = {
  strict: false,
  autoContrast: false,
  generateStates: false,
}

type ColorFamilyKey = 'primary' | 'accent' | 'danger' | 'warn' | 'success' | 'info' | 'help'

// ---------------------------------------------------------------------------
// Derivation rules (OKLCH-based Δ values)
// ---------------------------------------------------------------------------

const RULES = {
  secondaryDeltaL: 0.02, // secondary is slightly offset from card
  inputDeltaL: 0.03, // input is slightly offset from neutral.base
  sidebarDeltaL: 0.03, // sidebar is slightly offset from card
  hoverDeltaL: 0.08, // hover lightness shift
  lightMixWeight: 0.15, // light variant: mix base with background at this weight
  accentHueShift: 24, // accent hue shift from primary
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

function deriveHover(baseHex: string, isDark: boolean): string {
  const c = parseColor(normalizeHex(baseHex))
  return toHex(isDark ? lighten(c, RULES.hoverDeltaL) : darken(c, RULES.hoverDeltaL))
}

function deriveLight(baseHex: string, bgHex: string): string {
  const c = parseColor(normalizeHex(baseHex))
  const bg = parseColor(normalizeHex(bgHex))
  return toHex(mix(c, bg, RULES.lightMixWeight))
}

function deriveLightForeground(baseHex: string): string {
  const c = parseColor(normalizeHex(baseHex))
  return toHex(mix(c, { l: 0, c: 0, h: 0 }, 0.6))
}

function deriveAccent(primaryHex: string): string {
  const c = parseColor(normalizeHex(primaryHex))
  return toHex({ ...c, h: (((c.h + RULES.accentHueShift) % 360) + 360) % 360 })
}

function emitConfigToken(
  token: string,
  explicit: boolean,
  source: 'base' | 'semantic' | 'fallback'
): void {
  emitThemeEvent({ type: 'TOKEN_DERIVED', token, source })
  if (explicit) {
    emitThemeEvent({ type: 'TOKEN_OVERRIDDEN', token })
  }
}

function bestForeground(token: string, bgHex: string, preferredHex: string): string {
  const bg = parseColor(normalizeHex(bgHex))
  const pref = parseColor(normalizeHex(preferredHex))
  const before = contrastRatio(bg, pref)
  const adjusted = ensureReadableForeground(bg, pref)
  const after = contrastRatio(bg, adjusted)

  if (after !== before) {
    emitThemeEvent({ type: 'CONTRAST_ADJUSTED', token, before, after })
  }

  return toHex(adjusted)
}

// ---------------------------------------------------------------------------
// Main derive function
// ---------------------------------------------------------------------------

export function deriveTheme(config: ThemeModeConfig, options: DeriveOptions = {}): ThemeModeConfig {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Extract base tokens
  const background = config.background ?? '#ffffff'
  const foreground = config.foreground ?? '#000000'
  const neutralBase = config.neutral?.base ?? '#e4e4e7'
  const neutralBg = config.neutral?.bg ?? '#ffffff'
  const neutralFg = config.neutral?.foreground ?? foreground
  const neutralMutedFg = config.neutral?.mutedForeground ?? neutralFg
  const neutralSecondaryFg = config.neutral?.secondaryForeground ?? neutralFg
  const primaryDefault = config.primary?.default ?? '#000000'
  const primaryFg = config.primary?.foreground ?? '#ffffff'
  const accentDefault = config.accent?.default ?? deriveAccent(primaryDefault)
  const accentFg = config.accent?.foreground ?? '#ffffff'

  if (opts.strict) {
    const missing: string[] = []
    if (!config.primary?.default) missing.push('primary.default')
    if (!config.neutral?.base) missing.push('neutral.base')
    if (!config.neutral?.bg) missing.push('neutral.bg')
    if (!config.background) missing.push('background')
    if (missing.length > 0) {
      throw new Error(`[deriveTheme] strict mode: missing base tokens: ${missing.join(', ')}`)
    }
  }

  // Build result
  const result: ThemeModeConfig = {
    ...config,
    background,
    foreground: opts.autoContrast
      ? bestForeground('foreground', background, foreground)
      : foreground,
    neutral: { ...config.neutral },
  }

  emitConfigToken(
    'background',
    config.background !== undefined,
    config.background ? 'base' : 'fallback'
  )
  emitConfigToken(
    'foreground',
    config.foreground !== undefined,
    config.foreground ? 'base' : 'fallback'
  )

  // Semantic tokens
  // secondary = card (neutral.bg) with slight shift
  const cardHex = neutralBg
  const isDark = config.background ? parseColor(config.background).l < 0.5 : false

  result.secondary =
    config.secondary ??
    (isDark
      ? toHex(lighten(parseColor(cardHex), RULES.secondaryDeltaL))
      : toHex(darken(parseColor(cardHex), RULES.secondaryDeltaL)))
  result.secondaryForeground = config.secondaryForeground ?? neutralSecondaryFg
  emitConfigToken(
    'secondary.base',
    config.secondary !== undefined,
    config.secondary ? 'base' : 'semantic'
  )
  emitConfigToken(
    'secondary.foreground',
    config.secondaryForeground !== undefined,
    config.secondaryForeground ? 'base' : 'semantic'
  )

  result.muted = config.muted ?? neutralBg
  result.mutedForeground = config.mutedForeground ?? neutralMutedFg
  emitConfigToken('muted.base', config.muted !== undefined, config.muted ? 'base' : 'semantic')
  emitConfigToken(
    'muted.foreground',
    config.mutedForeground !== undefined,
    config.mutedForeground ? 'base' : 'semantic'
  )

  result.border = config.border ?? neutralBase
  result.input =
    config.input ??
    (isDark
      ? toHex(lighten(parseColor(neutralBase), RULES.inputDeltaL))
      : toHex(darken(parseColor(neutralBase), RULES.inputDeltaL)))
  result.ring = config.ring ?? primaryDefault
  emitConfigToken('border', config.border !== undefined, config.border ? 'base' : 'fallback')
  emitConfigToken('input', config.input !== undefined, config.input ? 'base' : 'semantic')
  emitConfigToken('ring', config.ring !== undefined, config.ring ? 'base' : 'semantic')

  // Sidebar
  if (!result.sidebar) {
    const sidebarBg = isDark
      ? toHex(darken(parseColor(cardHex), RULES.sidebarDeltaL))
      : toHex(lighten(parseColor(cardHex), RULES.sidebarDeltaL))
    result.sidebar = {
      background: sidebarBg,
      foreground: neutralFg,
      primary: primaryDefault,
      primaryForeground: primaryFg,
      accent: accentDefault,
      accentForeground: accentFg,
      border: neutralBase,
      ring: primaryDefault,
    }
    emitConfigToken('sidebar.background', false, 'semantic')
    emitConfigToken('sidebar.foreground', false, 'semantic')
    emitConfigToken('sidebar.primary', false, 'semantic')
    emitConfigToken('sidebar.primaryForeground', false, 'semantic')
    emitConfigToken('sidebar.accent', false, 'semantic')
    emitConfigToken('sidebar.accentForeground', false, 'semantic')
    emitConfigToken('sidebar.border', false, 'semantic')
    emitConfigToken('sidebar.ring', false, 'semantic')
  } else {
    for (const token of Object.keys(result.sidebar).sort()) {
      emitConfigToken(`sidebar.${token}`, true, 'base')
    }
  }

  // State tokens (only when generateStates is true and fields are missing)
  if (opts.generateStates) {
    const families: Array<{ key: ColorFamilyKey; defaultHex: string }> = [
      { key: 'primary', defaultHex: primaryDefault },
      { key: 'accent', defaultHex: accentDefault },
    ]

    for (const { key, defaultHex } of families) {
      const family = result[key]
      if (!family) continue
      if (!family.hover) {
        family.hover = deriveHover(family.default ?? defaultHex, isDark)
        emitConfigToken(`${key}.hover`, false, 'semantic')
      }
      if (!family.light) {
        family.light = deriveLight(family.default ?? defaultHex, background)
        emitConfigToken(`${key}.light`, false, 'semantic')
      }
      if (!family.lightForeground) {
        family.lightForeground = deriveLightForeground(family.default ?? defaultHex)
        emitConfigToken(`${key}.lightForeground`, false, 'semantic')
      }
    }
  }

  if (opts.autoContrast) {
    const familyKeys: ColorFamilyKey[] = [
      'primary',
      'accent',
      'danger',
      'warn',
      'success',
      'info',
      'help',
    ]
    for (const familyKey of familyKeys) {
      const family = result[familyKey]
      if (family?.default && family?.foreground) {
        family.foreground = bestForeground(
          `${familyKey}.foreground`,
          family.default,
          family.foreground
        )
      }
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Backward compat: completeTheme delegates to deriveTheme
// ---------------------------------------------------------------------------

export function completeTheme(config: ThemeModeConfig): ThemeModeConfig {
  return deriveTheme(config, { generateStates: false, autoContrast: false })
}
