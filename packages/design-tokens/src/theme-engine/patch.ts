/**
 * Theme Engine v5 — Incremental Theme Updates
 */

import { parseColor } from './color.js'
import type { ColorTokenState, ThemeModeConfig } from '../types.js'
import { resolveThemeWithGraph, type ResolvedColorFamily, type ResolvedTheme } from './resolver.js'
import { validateTheme } from './validate.js'
import { diffThemes, type ThemeDiff } from './diff.js'
import { fingerprintTheme } from './fingerprint.js'
import { getThemeEvents, type ThemeEvent } from './observability.js'
import type { TokenGraph } from './graph.js'

export interface ThemePatch {
  tokens?: Partial<ThemeModeConfig>
  mode?: 'light' | 'dark'
}

export interface ThemePatchResult {
  theme: ResolvedTheme
  graph: TokenGraph
  diff: ThemeDiff
  events: ThemeEvent[]
  fingerprint: string
}

function familyToConfig(family: ResolvedColorFamily): Partial<ColorTokenState> {
  return {
    default: family.base,
    foreground: family.foreground,
    hover: family.hover,
    light: family.light,
    lightForeground: family.lightForeground,
  }
}

function resolvedThemeToConfig(theme: ResolvedTheme): ThemeModeConfig {
  return {
    background: theme.background,
    foreground: theme.foreground,
    neutral: {
      base: theme.border,
      bg: theme.card,
      foreground: theme.cardForeground,
      secondaryForeground: theme.secondary.foreground,
      mutedForeground: theme.muted.foreground,
    },
    secondary: theme.secondary.base,
    secondaryForeground: theme.secondary.foreground,
    muted: theme.muted.base,
    mutedForeground: theme.muted.foreground,
    border: theme.border,
    input: theme.input,
    ring: theme.ring,
    primary: familyToConfig(theme.primary),
    accent: familyToConfig(theme.accent),
    danger: familyToConfig(theme.danger),
    warn: familyToConfig(theme.warn),
    success: familyToConfig(theme.success),
    info: familyToConfig(theme.info),
    help: familyToConfig(theme.help),
    sidebar: {
      background: theme.sidebar.background,
      foreground: theme.sidebar.foreground,
      primary: theme.sidebar.primary,
      primaryForeground: theme.sidebar.primaryForeground,
      accent: theme.sidebar.accent,
      accentForeground: theme.sidebar.accentForeground,
      border: theme.sidebar.border,
      ring: theme.sidebar.ring,
    },
  }
}

function mergeFamily(
  base: Partial<ColorTokenState> | undefined,
  patch: Partial<ColorTokenState> | undefined
): Partial<ColorTokenState> | undefined {
  if (!base && !patch) return undefined
  return { ...base, ...patch }
}

function mergeConfig(
  base: ThemeModeConfig,
  patch: Partial<ThemeModeConfig> | undefined
): ThemeModeConfig {
  if (!patch) return base

  return {
    ...base,
    ...patch,
    neutral: patch.neutral ? { ...base.neutral, ...patch.neutral } : base.neutral,
    primary: mergeFamily(base.primary, patch.primary),
    accent: mergeFamily(base.accent, patch.accent),
    danger: mergeFamily(base.danger, patch.danger),
    warn: mergeFamily(base.warn, patch.warn),
    success: mergeFamily(base.success, patch.success),
    info: mergeFamily(base.info, patch.info),
    help: mergeFamily(base.help, patch.help),
    sidebar: patch.sidebar ? { ...base.sidebar, ...patch.sidebar } : base.sidebar,
  }
}

function inferMode(theme: ResolvedTheme): 'light' | 'dark' {
  return parseColor(theme.background).l < 0.5 ? 'dark' : 'light'
}

export function applyThemePatch(baseTheme: ResolvedTheme, patch: ThemePatch): ThemePatchResult {
  const eventStartIndex = getThemeEvents().length
  const mode = patch.mode ?? inferMode(baseTheme)
  const baseConfig = resolvedThemeToConfig(baseTheme)
  const nextConfig = mergeConfig(baseConfig, patch.tokens)
  const resolved = resolveThemeWithGraph(nextConfig, mode === 'dark', {
    preset: 'patch',
    mode,
  })
  const validationErrors = validateTheme(resolved.theme).filter(
    result => result.severity === 'error'
  )

  if (validationErrors.length > 0) {
    throw new Error(
      `[applyThemePatch] patch violates theme invariants: ${validationErrors.map(result => result.token).join(', ')}`
    )
  }

  return {
    theme: resolved.theme,
    graph: resolved.graph,
    diff: diffThemes(baseTheme, resolved.theme),
    events: getThemeEvents().slice(eventStartIndex),
    fingerprint: fingerprintTheme(resolved.theme),
  }
}
