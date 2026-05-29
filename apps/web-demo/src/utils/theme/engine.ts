/**
 * Theme Engine facade.
 *
 * Pure token derivation lives in `@ccd/design-tokens`.
 * Browser theme application is delegated to `@ccd/vue-app-platform` with app-owned
 * DOM/storage capabilities injected here to preserve the historical app API.
 */

/// <reference lib="dom" />

import type { ThemeCssVars } from '@ccd/design-tokens'
import { applyThemeVars } from '@ccd/vue-app-platform'
import { RUNTIME_STORAGE_KEYS } from '../../constants/runtime'

export {
  applyThemePatch,
  assessTokenContrast,
  classifyToken,
  clearThemeCache,
  clearThemeEvents,
  clearThemeMetrics,
  COLOR_FAMILIES,
  compileThemeVars,
  completeTheme,
  createThemeObserver,
  deriveTheme,
  diffThemes,
  fingerprintTheme,
  generateThemeVars,
  getContrastThreshold,
  getOrResolveTheme,
  getThemeContrastPairs,
  getThemeEvents,
  getThemeMetrics,
  getThemeObserver,
  inspectTheme,
  resolveTheme,
  resolveThemeWithGraph,
  THEME_ENGINE,
  validateTheme,
  validateThemeStrict,
} from '@ccd/design-tokens/theme-engine'
export type {
  DecorativeValidationMode,
  DeriveOptions,
  ResolvedColorFamily,
  ResolvedSidebar,
  ResolvedTheme,
  StrictThemeRules,
  StrictValidationResult,
  ThemeDiff,
  ThemeEvent,
  ThemeInspection,
  ThemeObserver,
  ThemePatch,
  ThemePatchResult,
  ThemeResolutionOptions,
  ThemeResolutionResult,
  ThemeValidationConfig,
  TokenGraph,
  TokenNode,
  TokenSemanticLevel,
  ValidationResult,
} from '@ccd/design-tokens/theme-engine'

export function applyTheme(vars: ThemeCssVars): void {
  applyThemeVars(vars, {
    target: document.documentElement,
    storage: localStorage,
    storageKeys: {
      themePrimary: RUNTIME_STORAGE_KEYS.themePrimary,
      themeBackground: RUNTIME_STORAGE_KEYS.themeBackground,
    },
  })
}
