// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import {
  generateThemeVars,
  applyTheme,
  resolveTheme,
  resolveThemeWithGraph,
  validateTheme,
  validateThemeStrict,
  diffThemes,
  deriveTheme,
  completeTheme,
  clearThemeCache,
  inspectTheme,
  fingerprintTheme,
  applyThemePatch,
  getThemeEvents,
  clearThemeEvents,
  getThemeMetrics,
  clearThemeMetrics,
} from './engine'
import { THEME_PRESETS } from '@ccd/design-tokens'

describe('generateThemeVars (v4 — backward compat)', () => {
  const mockPreset: ThemePreset = {
    name: 'test',
    primary: '#3b82f6',
    accent: '#8b5cf6',
    colors: undefined,
  }

  it('returns a non-empty CSS variable object', () => {
    const vars = generateThemeVars(mockPreset, false)
    expect(typeof vars).toBe('object')
    expect(Object.keys(vars).length).toBeGreaterThan(0)
  })

  it('includes background key', () => {
    const vars = generateThemeVars(mockPreset, false)
    expect(vars['--background']).toBeDefined()
  })

  it('includes foreground key', () => {
    const vars = generateThemeVars(mockPreset, false)
    expect(vars['--foreground']).toBeDefined()
  })

  it('includes primary key', () => {
    const vars = generateThemeVars(mockPreset, false)
    expect(vars['--primary']).toBeDefined()
  })

  it('produces different backgrounds for light and dark', () => {
    const lightVars = generateThemeVars(mockPreset, false)
    const darkVars = generateThemeVars(mockPreset, true)
    expect(lightVars['--background']).not.toBe(darkVars['--background'])
  })
})

describe('generateThemeVars — all presets deterministic', () => {
  for (const preset of THEME_PRESETS) {
    for (const isDark of [false, true]) {
      it(`${preset.name} ${isDark ? 'dark' : 'light'} produces complete ThemeCssVars`, () => {
        const vars = generateThemeVars(preset, isDark)

        // All required keys present
        expect(vars['--background']).toBeTruthy()
        expect(vars['--foreground']).toBeTruthy()
        expect(vars['--card']).toBeTruthy()
        expect(vars['--card-foreground']).toBeTruthy()
        expect(vars['--primary']).toBeTruthy()
        expect(vars['--primary-foreground']).toBeTruthy()
        expect(vars['--primary-hover']).toBeTruthy()
        expect(vars['--primary-light']).toBeTruthy()
        expect(vars['--secondary']).toBeTruthy()
        expect(vars['--secondary-foreground']).toBeTruthy()
        expect(vars['--muted']).toBeTruthy()
        expect(vars['--muted-foreground']).toBeTruthy()
        expect(vars['--accent']).toBeTruthy()
        expect(vars['--accent-foreground']).toBeTruthy()
        expect(vars['--danger']).toBeTruthy()
        expect(vars['--danger-foreground']).toBeTruthy()
        expect(vars['--warn']).toBeTruthy()
        expect(vars['--warn-foreground']).toBeTruthy()
        expect(vars['--success']).toBeTruthy()
        expect(vars['--success-foreground']).toBeTruthy()
        expect(vars['--info']).toBeTruthy()
        expect(vars['--info-foreground']).toBeTruthy()
        expect(vars['--help']).toBeTruthy()
        expect(vars['--help-foreground']).toBeTruthy()
        expect(vars['--border']).toBeTruthy()
        expect(vars['--input']).toBeTruthy()
        expect(vars['--ring']).toBeTruthy()
        expect(vars['--sidebar-background']).toBeTruthy()
        expect(vars['--sidebar-foreground']).toBeTruthy()
        expect(vars['--sidebar-primary']).toBeTruthy()
        expect(vars['--sidebar-primary-foreground']).toBeTruthy()
        expect(vars['--sidebar-accent']).toBeTruthy()
        expect(vars['--sidebar-accent-foreground']).toBeTruthy()
        expect(vars['--sidebar-border']).toBeTruthy()
        expect(vars['--sidebar-ring']).toBeTruthy()

        // All values are RGB channel strings (not hex)
        for (const val of Object.values(vars)) {
          expect(val).toMatch(/^\d+\s+\d+\s+\d+$/)
        }
      })

      it(`${preset.name} ${isDark ? 'dark' : 'light'} is deterministic (snapshot)`, () => {
        clearThemeCache()
        const a = generateThemeVars(preset, isDark)
        const b = generateThemeVars(preset, isDark)
        expect(a).toEqual(b)
      })
    }
  }
})

describe('generateThemeVars — contrast validation', () => {
  // Verify that the v4 resolver produces readable foregrounds for DERIVED values.
  // Explicit preset foregrounds are left as-is (preset data fidelity).
  it('resolver produces correct foreground for minimal input (no explicit fg)', () => {
    const minimal: ThemeModeConfig = {
      background: '#f7f7f8',
      foreground: '#1C1D22',
      neutral: { base: '#d4d4d8', bg: '#ffffff' },
      primary: { default: '#3b82f6' },
    }
    const resolved = resolveTheme(minimal, false)
    const results = validateTheme(resolved)
    const errors = results.filter(r => r.severity === 'error')
    expect(errors).toHaveLength(0)
  })

  // Verify the validation function catches actual issues
  it('validateTheme catches low contrast', () => {
    const bad: ThemeModeConfig = {
      background: '#ffffff',
      foreground: '#cccccc', // too low contrast
      neutral: { base: '#e4e4e7', bg: '#ffffff' },
      primary: { default: '#ffff00', foreground: '#ffffff' }, // yellow on white
    }
    const resolved = resolveTheme(bad, false)
    const results = validateTheme(resolved)
    const errors = results.filter(r => r.severity === 'error')
    expect(errors.length).toBeGreaterThan(0)
  })
})

describe('cache', () => {
  const mockPreset: ThemePreset = {
    name: 'cache-test',
    primary: '#3b82f6',
  }

  it('returns same result on second call (cache hit)', () => {
    clearThemeCache()
    const a = generateThemeVars(mockPreset, false)
    const b = generateThemeVars(mockPreset, false)
    expect(a).toEqual(b)
  })
})

describe('deriveTheme', () => {
  it('fills missing semantic tokens', () => {
    const minimal: ThemeModeConfig = {
      background: '#ffffff',
      foreground: '#1C1D22',
      neutral: { base: '#d4d4d8', bg: '#ffffff', foreground: '#3f3f46' },
      primary: { default: '#1C1D22', foreground: '#ffffff' },
    }
    const filled = deriveTheme(minimal)
    expect(filled.secondary).toBeTruthy()
    expect(filled.muted).toBeTruthy()
    expect(filled.border).toBeTruthy()
    expect(filled.input).toBeTruthy()
    expect(filled.ring).toBeTruthy()
    expect(filled.sidebar).toBeTruthy()
    expect(filled.sidebar!.background).toBeTruthy()
  })

  it('does not overwrite explicit values', () => {
    const config: ThemeModeConfig = {
      background: '#ffffff',
      foreground: '#000000',
      neutral: { base: '#e4e4e7', bg: '#ffffff' },
      primary: { default: '#000000' },
      secondary: '#cccccc',
      border: '#aaaaaa',
    }
    const filled = deriveTheme(config)
    expect(filled.secondary).toBe('#cccccc')
    expect(filled.border).toBe('#aaaaaa')
  })

  it('completeTheme is backward compatible', () => {
    const config: ThemeModeConfig = {
      background: '#ffffff',
      foreground: '#000000',
      neutral: { base: '#e4e4e7', bg: '#ffffff' },
      primary: { default: '#000000' },
    }
    const result = completeTheme(config)
    expect(result.secondary).toBeTruthy()
    expect(result.sidebar).toBeTruthy()
  })
})

describe('diffThemes', () => {
  it('detects changed tokens between two resolved themes', () => {
    const configA: ThemeModeConfig = {
      background: '#ffffff',
      foreground: '#000000',
      neutral: { base: '#e4e4e7', bg: '#ffffff' },
      primary: { default: '#000000', foreground: '#ffffff' },
    }
    const configB: ThemeModeConfig = {
      background: '#000000',
      foreground: '#ffffff',
      neutral: { base: '#27272a', bg: '#1a1b1f' },
      primary: { default: '#ffffff', foreground: '#000000' },
    }
    const themeA = resolveTheme(configA, false)
    const themeB = resolveTheme(configB, true)
    const diff = diffThemes(themeA, themeB)
    expect(diff.changedTokens.length).toBeGreaterThan(0)
    expect(typeof diff.contrastDiff).toBe('number')
    expect(typeof diff.visualWeightShift).toBe('number')
    expect(typeof diff.perceptualDiff.averageDeltaE).toBe('number')
    expect(typeof diff.contrastImpact.averageDelta).toBe('number')
    expect(typeof diff.semanticImpactScore).toBe('number')
  })
})

describe('Theme Engine v5 observability and runtime APIs', () => {
  const config: ThemeModeConfig = {
    background: '#ffffff',
    foreground: '#111111',
    neutral: { base: '#e4e4e7', bg: '#ffffff', foreground: '#111111' },
    primary: { default: '#2563eb' },
    danger: { default: '#dc2626' },
    warn: { default: '#f59e0b', foreground: '#000000' },
  }

  it('resolves with a deterministic token graph', () => {
    clearThemeEvents()
    const first = resolveThemeWithGraph(config, false, { preset: 'v5-test', mode: 'light' })
    const second = resolveThemeWithGraph(config, false, { preset: 'v5-test', mode: 'light' })

    expect(first.graph.nodes['primary.base']?.value).toBe('#2563eb')
    expect(first.graph.edges.length).toBeGreaterThan(0)
    expect(first.graph).toEqual(second.graph)
    expect(getThemeEvents().some(event => event.type === 'RESOLVE_START')).toBe(true)
    expect(getThemeEvents().some(event => event.type === 'RESOLVE_END')).toBe(true)
  })

  it('inspects tokens, contrast, and semantic completeness', () => {
    const theme = resolveTheme(config, false)
    const inspection = inspectTheme(theme)

    expect(inspection.tokens['primary.base']).toBe('#2563eb')
    expect(inspection.tokensByLayer.sidebar['sidebar.background']).toBeTruthy()
    expect(inspection.contrastMatrix.length).toBeGreaterThan(0)
    expect(inspection.semanticCompleteness.complete).toBe(true)
  })

  it('produces deterministic fingerprints', () => {
    const theme = resolveTheme(config, false)
    expect(fingerprintTheme(theme)).toBe(fingerprintTheme(theme))
  })

  it('applies theme patches through the resolver and emits diff/events', () => {
    clearThemeEvents()
    const baseTheme = resolveTheme(config, false)
    const patched = applyThemePatch(baseTheme, {
      tokens: { primary: { default: '#7c3aed' } },
      mode: 'light',
    })

    expect(patched.theme.primary.base).toBe('#7c3aed')
    expect(patched.graph.nodes['primary.base']?.value).toBe('#7c3aed')
    expect(patched.diff.changedTokens).toContain('primary.base')
    expect(patched.events.length).toBeGreaterThan(0)
    expect(patched.fingerprint).toMatch(/^theme-[0-9a-f]{8}$/)
  })

  it('enforces strict token governance rules', () => {
    const invalid = resolveTheme(
      {
        ...config,
        primary: { default: '#dc2626', foreground: '#ffffff' },
        danger: { default: '#dc2626', foreground: '#ffffff' },
      },
      false
    )
    const strictResults = validateThemeStrict(invalid, { dangerPrimaryMinDeltaE: 20 })

    expect(
      strictResults.some(result => result.rule === 'danger-distinguishable-from-primary')
    ).toBe(true)
  })

  it('tracks cache and resolve metrics', () => {
    clearThemeCache()
    clearThemeMetrics()

    const preset: ThemePreset = {
      name: 'metrics-test',
      primary: '#2563eb',
    }

    generateThemeVars(preset, false)
    generateThemeVars(preset, false)

    const metrics = getThemeMetrics()
    expect(metrics.cacheMisses).toBe(1)
    expect(metrics.cacheHits).toBe(1)
    expect(metrics.totalResolves).toBe(1)
    expect(metrics.derivedTokens).toBeGreaterThan(0)
  })
})

describe('applyTheme', () => {
  it('applies CSS variables to document root', () => {
    const vars: ThemeCssVars = {
      '--background': '255 255 255',
      '--foreground': '0 0 0',
      '--card': '255 255 255',
      '--card-foreground': '0 0 0',
      '--popover': '255 255 255',
      '--popover-foreground': '0 0 0',
      '--primary': '59 130 246',
      '--primary-foreground': '255 255 255',
      '--primary-hover': '37 99 235',
      '--primary-hover-foreground': '255 255 255',
      '--primary-light': '219 234 254',
      '--primary-light-foreground': '30 64 175',
      '--secondary': '243 244 246',
      '--secondary-foreground': '17 24 39',
      '--muted': '243 244 246',
      '--muted-foreground': '107 114 128',
      '--accent': '139 92 246',
      '--accent-foreground': '255 255 255',
      '--accent-hover': '124 58 237',
      '--accent-hover-foreground': '255 255 255',
      '--accent-light': '237 233 254',
      '--accent-light-foreground': '91 33 182',
      '--danger': '239 68 68',
      '--danger-foreground': '255 255 255',
      '--danger-hover': '220 38 38',
      '--danger-hover-foreground': '255 255 255',
      '--danger-light': '254 226 226',
      '--danger-light-foreground': '153 27 27',
      '--warn': '202 138 4',
      '--warn-foreground': '255 255 255',
      '--warn-hover': '161 98 7',
      '--warn-hover-foreground': '255 255 255',
      '--warn-light': '254 249 195',
      '--warn-light-foreground': '113 63 18',
      '--success': '16 185 129',
      '--success-foreground': '255 255 255',
      '--success-hover': '5 150 105',
      '--success-hover-foreground': '255 255 255',
      '--success-light': '236 253 245',
      '--success-light-foreground': '6 78 59',
      '--info': '14 165 233',
      '--info-foreground': '255 255 255',
      '--info-hover': '2 132 199',
      '--info-hover-foreground': '255 255 255',
      '--info-light': '224 242 254',
      '--info-light-foreground': '7 89 133',
      '--help': '168 85 247',
      '--help-foreground': '255 255 255',
      '--help-hover': '147 51 234',
      '--help-hover-foreground': '255 255 255',
      '--help-light': '245 243 255',
      '--help-light-foreground': '76 29 149',
      '--border': '228 228 231',
      '--input': '212 212 216',
      '--ring': '59 130 246',
      '--sidebar-background': '249 250 251',
      '--sidebar-foreground': '0 0 0',
      '--sidebar-primary': '59 130 246',
      '--sidebar-primary-foreground': '255 255 255',
      '--sidebar-accent': '139 92 246',
      '--sidebar-accent-foreground': '255 255 255',
      '--sidebar-border': '228 228 231',
      '--sidebar-ring': '139 92 246',
    }
    applyTheme(vars)
    const root = document.documentElement
    expect(root.style.getPropertyValue('--background')).toBe('255 255 255')
    expect(root.style.getPropertyValue('--primary')).toBe('59 130 246')
  })
})
