/**
 * Theme Engine facade.
 *
 * Pure token derivation lives in `@ccd/design-tokens`.
 * Browser theme application is app-owned because it mutates DOM style state and
 * persists preload tokens for `index.html`.
 */

/// <reference lib="dom" />

import type { ThemeCssVars } from '@ccd/design-tokens'
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

interface ThemeRuntimeStorageKeys {
  themePrimary: string
  themeBackground: string
}

interface ThemeRuntimeStorage {
  setItem: (key: string, value: string) => void
}

interface ThemeRuntimeTarget {
  style: CSSStyleDeclaration
}

interface ApplyAppThemeVarsOptions {
  target: ThemeRuntimeTarget
  storage?: ThemeRuntimeStorage
  storageKeys?: ThemeRuntimeStorageKeys
}

function applyAppThemeVars(vars: ThemeCssVars, options: ApplyAppThemeVarsOptions): void {
  const { style } = options.target
  const currentStyles: Record<string, string> = {}
  const themeVarKeys = new Set(Object.keys(vars))

  for (let i = 0; i < style.length; i++) {
    const prop = style[i]
    if (!themeVarKeys.has(prop)) {
      currentStyles[prop] = style.getPropertyValue(prop)
    }
  }

  const allStyles = { ...currentStyles, ...vars }
  style.cssText = Object.entries(allStyles)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')

  const storage = options.storage
  const storageKeys = options.storageKeys
  if (!storage || !storageKeys) return

  const primary = vars['--primary']
  if (primary) {
    storage.setItem(storageKeys.themePrimary, primary)
  }

  const background = vars['--background']
  if (background) {
    storage.setItem(storageKeys.themeBackground, background)
  }
}

export function applyTheme(vars: ThemeCssVars): void {
  applyAppThemeVars(vars, {
    target: document.documentElement,
    storage: localStorage,
    storageKeys: {
      themePrimary: RUNTIME_STORAGE_KEYS.themePrimary,
      themeBackground: RUNTIME_STORAGE_KEYS.themeBackground,
    },
  })
}
