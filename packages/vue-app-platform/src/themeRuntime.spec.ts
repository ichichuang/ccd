import { describe, expect, it } from 'vitest'
import type { ThemeCssVars } from '@ccd/design-tokens'
import { applyThemeVars } from './themeRuntime'

const vars = {
  '--background': '255 255 255',
  '--foreground': '0 0 0',
  '--primary': '10 20 30',
} as ThemeCssVars

describe('applyThemeVars', () => {
  it('throws and redirects DOM/storage ownership to the app theme facade', () => {
    expect(() => applyThemeVars(vars, {})).toThrowError(
      'applyThemeVars is app-owned; use the app theme facade for DOM/storage writes.'
    )
  })
})
