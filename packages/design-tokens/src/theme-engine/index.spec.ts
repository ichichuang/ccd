import { describe, expect, it } from 'vitest'
import type { ThemePreset } from '../types.js'
import {
  THEME_CONTRAST_PAIR_SPECS,
  assessTokenContrast,
  contrastRatio,
  darken,
  generateThemeVars,
  lighten,
  mix,
  parseColor,
  toHex,
} from './index.js'

describe('theme-engine public tooling exports', () => {
  it('exports color helpers used by root theme tooling', () => {
    const black = parseColor('#000000')
    const white = parseColor('#ffffff')

    expect(contrastRatio(black, white)).toBeGreaterThan(20)
    expect(toHex(lighten(black, 0.2))).toMatch(/^#[0-9a-f]{6}$/)
    expect(toHex(darken(white, 0.2))).toMatch(/^#[0-9a-f]{6}$/)
    expect(toHex(mix(black, white, 0.5))).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('exports contrast specs and generated theme vars through the public barrel', () => {
    const preset: ThemePreset = {
      name: 'tooling-export-smoke',
      primary: '#2563eb',
      accent: '#7c3aed',
      neutral: '#e5e7eb',
      backgroundLight: '#ffffff',
      backgroundDark: '#09090b',
    }
    const vars = generateThemeVars(preset, false)
    const assessment = assessTokenContrast('primary.default', 7)

    expect(vars['--background']).toMatch(/^\d+ \d+ \d+$/)
    expect(THEME_CONTRAST_PAIR_SPECS.some(spec => spec.backgroundVar === '--background')).toBe(true)
    expect(assessment.severity).toBeNull()
  })
})
