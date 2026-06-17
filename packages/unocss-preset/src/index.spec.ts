import type { UserConfig } from 'unocss'
import { createGenerator } from 'unocss'
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

const ADMIN_SHELL_IMPORTANT_STATE_CLASSES = [
  '!bg-primary',
  '!bg-primary/14',
  '!bg-primary/12',
  '!bg-primary/10',
  '!bg-transparent',
  '!text-primary',
  '!text-primary-foreground',
  '!text-current',
  '!transition-none',
  '![outline:none]',
  'dark:!bg-primary-light',
  'dark:!bg-primary-light/70',
  'dark:!text-primary-light-foreground',
  'hover:!bg-primary',
  'hover:!bg-primary/14',
  'hover:!bg-transparent',
  'hover:!text-primary',
  'hover:!text-primary-foreground',
] as const

const PRIMEVUE_FORM_RESET_CLASSES = [
  '!border-0',
  '!shadow-none',
  '!rounded-none',
  '!bg-transparent',
  '!ring-0',
  '![outline:none]',
  '!text-muted-foreground',
  'hover:!bg-muted/60',
  'hover:!text-primary',
  'group-hover:!text-primary',
  'focus:![outline:none]',
  'focus:!ring-0',
  'focus:!shadow-none',
  'focus:!border-0',
  'focus-visible:![outline:none]',
  'focus-visible:!border-primary',
  'focus-visible:!ring-0',
  'focus-visible:!shadow-none',
  'focus-visible:!ring-offset-0',
  'focus-visible:[box-shadow:var(--p-form-field-focus-ring-shadow)]',
  'focus-within:![outline:none]',
  'focus-within:!border-primary',
  'focus-within:[box-shadow:var(--p-form-field-focus-ring-shadow)]',
] as const

function asRecord(value: unknown): Record<string, unknown> {
  return value as Record<string, unknown>
}

describe('createCcdUnoEngineConfig', () => {
  it('preserves the default CCD UnoCSS engine surface', () => {
    const config = createCcdUnoEngineConfig()

    expect(config.safelist).toEqual(getEngineSafelist())
    expect(config.safelist).toContain('i-lucide-arrow-up')
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

  it('emits important admin shell route state utilities from the safelist', async () => {
    const config = createCcdUnoConfig()
    const generator = await createGenerator(config)
    const generated = await generator.generate('', { preflights: false })
    const matched = Array.from(generated.matched)

    expect(config.safelist).toEqual(
      expect.arrayContaining([...ADMIN_SHELL_IMPORTANT_STATE_CLASSES])
    )
    expect(matched).toEqual(expect.arrayContaining([...ADMIN_SHELL_IMPORTANT_STATE_CLASSES]))
    expect(generated.css).toContain('.\\!bg-primary')
    expect(generated.css).toContain('background-color:rgb(var(--primary)')
    expect(generated.css).toContain('.\\!text-primary-foreground')
    expect(generated.css).toContain('color:rgb(var(--primary-foreground)')
    expect(generated.css).toContain('!important')
  })

  it('emits PrimeVue form reset utilities from the safelist', async () => {
    const config = createCcdUnoConfig()
    const generator = await createGenerator(config)
    const generated = await generator.generate('', { preflights: false })
    const matched = Array.from(generated.matched)

    expect(config.safelist).toEqual(expect.arrayContaining([...PRIMEVUE_FORM_RESET_CLASSES]))
    expect(matched).toEqual(expect.arrayContaining([...PRIMEVUE_FORM_RESET_CLASSES]))
    expect(generated.css).toContain('outline:')
    expect(generated.css).toContain('!important')
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

describe('semantic glass shortcuts', () => {
  it('keeps shared glass surfaces free of backdrop blur and forced GPU layers', () => {
    const glassBase = semanticShortcuts['glass-base']

    expect(glassBase).toContain('[backdrop-filter:none]')
    expect(glassBase).toContain('[will-change:auto]')
    expect(glassBase).not.toContain('backdrop-blur')
    expect(glassBase).not.toContain('transform-gpu')
    expect(semanticShortcuts['glass-panel']).toContain('glass-base')
    expect(semanticShortcuts['glass-shell']).toContain('glass-base')
    expect(semanticShortcuts['glass-card']).toContain('glass-base')
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
