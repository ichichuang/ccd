// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import type { ThemeCssVars } from '@ccd/design-tokens'
import { applyThemeVars } from './themeRuntime'

const vars = {
  '--background': '255 255 255',
  '--foreground': '0 0 0',
  '--primary': '10 20 30',
} as ThemeCssVars

describe('applyThemeVars', () => {
  it('updates theme variables while preserving non-theme inline styles', () => {
    const target = document.createElement('div')
    target.style.setProperty('--transition-x', '12px')

    applyThemeVars(vars, { target })

    expect(target.style.getPropertyValue('--transition-x')).toBe('12px')
    expect(target.style.getPropertyValue('--background')).toBe('255 255 255')
    expect(target.style.getPropertyValue('--primary')).toBe('10 20 30')
  })

  it('persists visual boot tokens only when storage is injected', () => {
    const target = document.createElement('div')
    const storage = { setItem: vi.fn() }

    applyThemeVars(vars, {
      target,
      storage,
      storageKeys: {
        themePrimary: 'theme-primary',
        themeBackground: 'theme-background',
      },
    })

    expect(storage.setItem).toHaveBeenCalledWith('theme-primary', '10 20 30')
    expect(storage.setItem).toHaveBeenCalledWith('theme-background', '255 255 255')
  })
})
