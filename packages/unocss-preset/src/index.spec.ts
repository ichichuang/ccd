import type { UserConfig } from 'unocss'
import { describe, expect, it } from 'vitest'

import {
  createCcdUnoConfig,
  createCcdUnoEngineConfig,
  createCcdUnoTheme,
  mergeCcdUnoTheme,
  semanticShortcuts,
  theme,
} from './index.js'
import { getEngineSafelist } from './safelist/index.js'

function asRecord(value: unknown): Record<string, unknown> {
  return value as Record<string, unknown>
}

describe('createCcdUnoEngineConfig', () => {
  it('preserves the default CCD UnoCSS engine surface', () => {
    const config = createCcdUnoEngineConfig()

    expect(config.safelist).toEqual(getEngineSafelist())
    expect(config.shortcuts).toEqual([semanticShortcuts])
    expect(config.rules).toContainEqual(['safe-top', { 'padding-top': 'var(--safe-top)' }])

    const resolvedTheme = asRecord(config.theme)
    expect(resolvedTheme.breakpoints).toBe(theme.breakpoints)
    expect(resolvedTheme.easing).toEqual(theme.transitionTimingFunction)
  })

  it('appends shared extension points without replacing token-backed defaults', () => {
    const extensionRules: NonNullable<UserConfig['rules']> = [
      ['ccd-outline-token', { outline: '1px solid rgb(var(--ring) / 1)' }],
    ]
    const extensionShortcuts: NonNullable<UserConfig['shortcuts']> = {
      'surface-extension': 'bg-card text-foreground',
    }

    const config = createCcdUnoEngineConfig({
      safelist: ['surface-extension'],
      shortcuts: extensionShortcuts,
      rules: extensionRules,
      theme: {
        colors: {
          extension: 'rgb(var(--extension) / <alpha-value>)',
        },
        spacing: {
          extension: 'var(--spacing-extension)',
        },
      },
    })

    expect(config.safelist).toContain('surface-extension')
    expect(config.shortcuts).toContain(semanticShortcuts)
    expect(config.shortcuts).toContain(extensionShortcuts)
    expect(config.rules).toContain(extensionRules[0])

    const resolvedTheme = asRecord(config.theme)
    const colors = asRecord(resolvedTheme.colors)
    const spacing = asRecord(resolvedTheme.spacing)

    expect(colors.primary).toBeDefined()
    expect(colors.extension).toBe('rgb(var(--extension) / <alpha-value>)')
    expect(spacing.md).toBe('var(--spacing-md)')
    expect(spacing.extension).toBe('var(--spacing-extension)')
    expect(asRecord(theme.colors).extension).toBeUndefined()
  })
})

describe('CCD UnoCSS theme helpers', () => {
  it('recursively merges theme objects and replaces non-object leaves', () => {
    const merged = mergeCcdUnoTheme(
      {
        colors: {
          primary: 'rgb(var(--primary) / <alpha-value>)',
        },
        spacing: {
          sm: 'var(--spacing-sm)',
        },
      },
      {
        colors: {
          accent: 'rgb(var(--accent) / <alpha-value>)',
        },
        spacing: 'custom-spacing',
      }
    )

    expect(asRecord(asRecord(merged).colors).primary).toBe('rgb(var(--primary) / <alpha-value>)')
    expect(asRecord(asRecord(merged).colors).accent).toBe('rgb(var(--accent) / <alpha-value>)')
    expect(asRecord(merged).spacing).toBe('custom-spacing')
  })

  it('creates the default CCD theme with UnoCSS easing aliases', () => {
    const resolvedTheme = asRecord(createCcdUnoTheme())

    expect(resolvedTheme.transitionTimingFunction).toBe(theme.transitionTimingFunction)
    expect(resolvedTheme.easing).toEqual(theme.transitionTimingFunction)
  })
})

describe('createCcdUnoConfig', () => {
  it('forwards shared extension points into the final UnoCSS config', () => {
    const config = createCcdUnoConfig({
      tsJsGlob: 'src/**/*.{js,ts}',
      extensions: {
        safelist: ['ccd-extension-class'],
      },
    })

    expect(config.safelist).toContain('ccd-extension-class')
  })
})
