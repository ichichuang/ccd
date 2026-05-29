import type { ThemeCssVars, ThemeModeConfig, ThemePreset } from '../types.js'
import { getOrResolveTheme } from './cache.js'
import { compileThemeVars } from './compiler.js'
import { resolveTheme } from './resolver.js'

export { COLOR_FAMILIES, THEME_ENGINE } from './metadata.js'
export { resolveTheme, resolveThemeWithGraph } from './resolver.js'
export { compileThemeVars } from './compiler.js'
export { deriveTheme, completeTheme } from './derive.js'
export {
  validateTheme,
  validateThemeStrict,
  getThemeContrastPairs,
  classifyToken,
  getContrastThreshold,
  assessTokenContrast,
} from './validate.js'
export { diffThemes } from './diff.js'
export { getOrResolveTheme, clearThemeCache } from './cache.js'
export {
  createThemeObserver,
  getThemeObserver,
  getThemeEvents,
  clearThemeEvents,
} from './observability.js'
export { inspectTheme } from './inspect.js'
export { fingerprintTheme } from './fingerprint.js'
export { applyThemePatch } from './patch.js'
export { getThemeMetrics, clearThemeMetrics } from './metrics.js'
export type {
  ResolvedTheme,
  ResolvedColorFamily,
  ResolvedSidebar,
  ThemeResolutionOptions,
  ThemeResolutionResult,
} from './resolver.js'
export type { ThemeDiff } from './diff.js'
export type { DeriveOptions } from './derive.js'
export type {
  ValidationResult,
  StrictThemeRules,
  StrictValidationResult,
  TokenSemanticLevel,
  DecorativeValidationMode,
  ThemeValidationConfig,
} from './validate.js'
export type { ThemeEvent, ThemeObserver } from './observability.js'
export type { TokenGraph, TokenNode } from './graph.js'
export type { ThemeInspection } from './inspect.js'
export type { ThemePatch, ThemePatchResult } from './patch.js'

export function generateThemeVars(preset: ThemePreset, isDark: boolean): ThemeCssVars {
  const modeKey = isDark ? 'dark' : 'light'
  const modeConfig = preset.colors?.[modeKey]

  return getOrResolveTheme(preset.name, isDark, () => {
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
