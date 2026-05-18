import { describe, expect, it } from 'vitest'
import { contrastRatio, parseColor } from './color'
import { resolveTheme } from './resolver'
import { assessTokenContrast, classifyToken, getContrastThreshold, validateTheme } from './validate'

function ratio(bg: string, fg: string): number {
  return contrastRatio(parseColor(bg), parseColor(fg))
}

describe('semantic token contrast validation', () => {
  it('classifies token semantics by meaning instead of a flat WCAG bucket', () => {
    expect(classifyToken('primary.default')).toBe('action')
    expect(classifyToken('foreground')).toBe('text')
    expect(classifyToken('muted')).toBe('subtle')
    expect(classifyToken('accent.lightForeground')).toBe('decorative')
  })

  it('applies tiered thresholds and keeps decorative tokens non-blocking by default', () => {
    expect(getContrastThreshold('action')).toBe(4.5)
    expect(getContrastThreshold('text')).toBe(4.5)
    expect(getContrastThreshold('subtle')).toBe(3.0)
    expect(getContrastThreshold('decorative')).toBe(2)

    expect(assessTokenContrast('primary.default', ratio('#4682B4', '#FFFFFF')).severity).toBe(
      'error'
    )
    expect(assessTokenContrast('muted', ratio('#4B5563', '#FFFFFF')).severity).toBeNull()
    expect(assessTokenContrast('primary.light', ratio('#3399FF', '#FFFFFF')).severity).toBeNull()
    expect(
      assessTokenContrast('accent.lightForeground', ratio('#B266FF', '#FFFFFF')).severity
    ).not.toBe('error')
  })

  it('can escalate decorative tokens to strict mode when configured', () => {
    const decorativeRatio = ratio('#D9EEFF', '#FFFFFF')
    expect(
      assessTokenContrast('primary.light', decorativeRatio, { decorativeMode: 'warn' }).severity
    ).toBe('warn')
    expect(
      assessTokenContrast('primary.light', decorativeRatio, { decorativeMode: 'ignore' }).severity
    ).toBe('skip')
    expect(
      assessTokenContrast('primary.light', decorativeRatio, { decorativeMode: 'strict' }).severity
    ).toBe('error')
  })

  it('does not emit blocking validation errors for decorative light pairs in the theme pipeline', () => {
    const resolved = resolveTheme(
      {
        background: '#F8FAFC',
        foreground: '#0F172A',
        neutral: {
          base: '#CBD5E1',
          bg: '#FFFFFF',
          foreground: '#0F172A',
          secondaryForeground: '#334155',
          mutedForeground: '#475569',
        },
        secondary: '#E2E8F0',
        secondaryForeground: '#334155',
        muted: '#E2E8F0',
        mutedForeground: '#475569',
        border: '#CBD5E1',
        input: '#CBD5E1',
        ring: '#1D4ED8',
        primary: {
          default: '#1D4ED8',
          foreground: '#FFFFFF',
          hover: '#1E40AF',
          light: '#60A5FA',
          lightForeground: '#FFFFFF',
        },
        accent: {
          default: '#0F766E',
          foreground: '#FFFFFF',
          hover: '#115E59',
          light: '#5EEAD4',
          lightForeground: '#FFFFFF',
        },
      },
      false
    )

    const results = validateTheme(resolved)

    expect(
      results.some(result => result.token === 'primary/light' && result.severity === 'error')
    ).toBe(false)
    expect(
      results.some(result => result.token === 'accent/light' && result.severity === 'error')
    ).toBe(false)
  })
})
