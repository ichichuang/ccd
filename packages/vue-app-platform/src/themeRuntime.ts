import type { ThemeCssVars } from '@ccd/design-tokens'

export function applyThemeVars(_vars: ThemeCssVars, _options: Record<string, unknown>): never {
  throw new Error('applyThemeVars is app-owned; use the app theme facade for DOM/storage writes.')
}
