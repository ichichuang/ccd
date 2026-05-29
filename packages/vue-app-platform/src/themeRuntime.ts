import type { ThemeCssVars } from '@ccd/design-tokens'

export interface ThemeRuntimeStorageKeys {
  themePrimary: string
  themeBackground: string
}

export interface ThemeRuntimeStorage {
  setItem: (key: string, value: string) => void
}

export interface ThemeRuntimeTarget {
  style: CSSStyleDeclaration
}

export interface ApplyThemeVarsOptions {
  target: ThemeRuntimeTarget
  storage?: ThemeRuntimeStorage
  storageKeys?: ThemeRuntimeStorageKeys
}

export function applyThemeVars(vars: ThemeCssVars, options: ApplyThemeVarsOptions): void {
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
