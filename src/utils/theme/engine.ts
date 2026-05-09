/**
 * Theme Engine v5 — Public API Facade
 *
 * Backward-compatible entry point. Delegates to the layered pipeline:
 *   color.ts → resolver.ts → derive.ts → compiler.ts → validate.ts → diff.ts → cache.ts
 *
 * Exports maintain full backward compatibility with v3 consumers:
 *   - generateThemeVars(preset, isDark) → ThemeCssVars
 *   - applyTheme(vars) → void
 *   - completeTheme(config) → ThemeModeConfig
 *   - COLOR_FAMILIES, THEME_ENGINE
 */

/// <reference lib="dom" />

import { RUNTIME_STORAGE_KEYS } from '../../constants/runtime'
import { resolveTheme } from './resolver'
import { compileThemeVars } from './compiler'
import { getOrResolveTheme } from './cache'

// ---------------------------------------------------------------------------
// Re-exports (backward compat)
// ---------------------------------------------------------------------------

export { COLOR_FAMILIES, THEME_ENGINE } from './metadata'
export { resolveTheme } from './resolver'
export { resolveThemeWithGraph } from './resolver'
export { compileThemeVars } from './compiler'
export { deriveTheme, completeTheme } from './derive'
export { validateTheme, validateThemeStrict, getThemeContrastPairs } from './validate'
export { diffThemes } from './diff'
export { getOrResolveTheme, clearThemeCache } from './cache'
export {
  createThemeObserver,
  getThemeObserver,
  getThemeEvents,
  clearThemeEvents,
} from './observability'
export { inspectTheme } from './inspect'
export { fingerprintTheme } from './fingerprint'
export { applyThemePatch } from './patch'
export { getThemeMetrics, clearThemeMetrics } from './metrics'
export type {
  ResolvedTheme,
  ResolvedColorFamily,
  ResolvedSidebar,
  ThemeResolutionOptions,
  ThemeResolutionResult,
} from './resolver'
export type { ThemeDiff } from './diff'
export type { DeriveOptions } from './derive'
export type { ValidationResult, StrictThemeRules, StrictValidationResult } from './validate'
export type { ThemeEvent, ThemeObserver } from './observability'
export type { TokenGraph, TokenNode } from './graph'
export type { ThemeInspection } from './inspect'
export type { ThemePatch, ThemePatchResult } from './patch'

// ---------------------------------------------------------------------------
// Core API: generateThemeVars (preserves v3 signature with v4 pipeline)
// ---------------------------------------------------------------------------

/**
 * Generate semantic CSS variables from a ThemePreset.
 *
 * v4 impl: delegates to resolver → compiler, with memoization cache.
 * Signature unchanged from v3 for backward compatibility.
 *
 * When preset.colors[mode] exists, uses it as the ThemeModeConfig directly.
 * Otherwise falls through to the legacy simple mode (preset.primary, etc.),
 * letting the resolver fill in defaults from THEME_ENGINE constants.
 */
export function generateThemeVars(preset: ThemePreset, isDark: boolean): ThemeCssVars {
  const modeKey = isDark ? 'dark' : 'light'
  const modeConfig = preset.colors?.[modeKey]

  return getOrResolveTheme(preset.name, isDark, () => {
    // Use ThemeModeConfig if available, otherwise build one from legacy fields
    const config: ThemeModeConfig = modeConfig
      ? modeConfig
      : {
          background: isDark ? preset.backgroundDark : preset.backgroundLight,
          foreground: undefined,
          neutral: preset.neutral
            ? { base: preset.neutral, bg: undefined, foreground: undefined }
            : undefined,
          primary: preset.primary ? { default: preset.primary } : undefined,
          accent: preset.accent ? { default: preset.accent } : undefined,
          warn: preset.warn ? { default: preset.warn } : undefined,
          success: preset.success ? { default: preset.success } : undefined,
          info: preset.info ? { default: preset.info } : undefined,
          help: preset.help ? { default: preset.help } : undefined,
        }

    const resolved = resolveTheme(config, isDark, {
      preset: preset.name,
      mode: isDark ? 'dark' : 'light',
    })
    return compileThemeVars(resolved)
  })
}

// ---------------------------------------------------------------------------
// Core API: applyTheme (unchanged from v3)
// ---------------------------------------------------------------------------

/**
 * Apply CSS variables to document root atomically.
 * Uses single cssText mutation to avoid 29+ style attribute mutations.
 */
export function applyTheme(vars: ThemeCssVars) {
  const root = document.documentElement

  // 1. Preserve non-theme variables (e.g. --transition-x, --transition-y)
  const currentStyles: Record<string, string> = {}
  const themeVarKeys = new Set(Object.keys(vars))

  for (let i = 0; i < root.style.length; i++) {
    const prop = root.style[i]
    if (!themeVarKeys.has(prop)) {
      currentStyles[prop] = root.style.getPropertyValue(prop)
    }
  }

  // 2. Merge: theme vars + preserved non-theme vars
  const allStyles = { ...currentStyles, ...vars }

  // 3. Build complete cssText
  const cssText = Object.entries(allStyles)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')

  // 4. Atomic update — single style mutation
  root.style.cssText = cssText

  // 5. Persist visual boot tokens for index.html first-frame restore.
  // Explicit exception to safe-storage: only theme-primary/theme-background allowed.
  try {
    const primary = vars['--primary']
    if (primary) {
      localStorage.setItem(RUNTIME_STORAGE_KEYS.themePrimary, primary)
    }
    const background = vars['--background']
    if (background) {
      localStorage.setItem(RUNTIME_STORAGE_KEYS.themeBackground, background)
    }
  } catch (_) {
    /* ignore */
  }
}
