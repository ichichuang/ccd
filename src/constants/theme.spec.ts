import { describe, expect, it } from 'vitest'
import { THEME_PRESETS } from './theme'
import { parseColor, contrastRatio } from '@/utils/theme/color'
import { assessTokenContrast, classifyToken } from '@/utils/theme/validate'

type ThemeFamilyKey = 'primary' | 'accent' | 'success' | 'warn' | 'danger' | 'info' | 'help'
type ThemeModeKey = 'light' | 'dark'

const COLOR_FAMILIES: ThemeFamilyKey[] = [
  'primary',
  'accent',
  'success',
  'warn',
  'danger',
  'info',
  'help',
]
const MODE_KEYS: ThemeModeKey[] = ['light', 'dark']
const HEX_RE = /^#[0-9a-f]{6}$/

function expectHex(value: string): void {
  expect(value).toMatch(HEX_RE)
}

function getContrastSeverity(
  tokenPath: string,
  bg: string,
  fg: string
): ReturnType<typeof assessTokenContrast>['severity'] {
  return assessTokenContrast(tokenPath, contrastRatio(parseColor(bg), parseColor(fg))).severity
}

function expectHueRange(label: string, hex: string, min: number, max: number): void {
  const hue = parseColor(hex).h
  expect(hue, label).toBeGreaterThanOrEqual(min)
  expect(hue, label).toBeLessThanOrEqual(max)
}

describe('theme preset completeness', () => {
  it('defines every required token explicitly for each preset and mode', () => {
    for (const preset of THEME_PRESETS) {
      for (const mode of MODE_KEYS) {
        const config = preset.colors[mode]

        expectHex(config.background)
        expectHex(config.foreground)
        expectHex(config.neutral.base)
        expectHex(config.neutral.bg)
        expectHex(config.neutral.foreground)
        expectHex(config.neutral.secondaryForeground)
        expectHex(config.neutral.mutedForeground)
        expectHex(config.secondary)
        expectHex(config.secondaryForeground)
        expectHex(config.muted)
        expectHex(config.mutedForeground)
        expectHex(config.border)
        expectHex(config.input)
        expectHex(config.ring)

        for (const family of COLOR_FAMILIES) {
          const token = config[family]
          expectHex(token.default)
          expectHex(token.foreground)
          expectHex(token.hover)
          expectHex(token.light)
          expectHex(token.lightForeground)
        }

        expectHex(config.sidebar.background)
        expectHex(config.sidebar.foreground)
        expectHex(config.sidebar.primary)
        expectHex(config.sidebar.primaryForeground)
        expectHex(config.sidebar.accent)
        expectHex(config.sidebar.accentForeground)
        expectHex(config.sidebar.border)
        expectHex(config.sidebar.ring)
      }
    }
  })

  it('applies semantic-aware contrast thresholds by token meaning', () => {
    expect(getContrastSeverity('primary.default', '#4682B4', '#FFFFFF')).toBe('error')
    expect(getContrastSeverity('muted', '#4B5563', '#FFFFFF')).toBeNull()
    expect(getContrastSeverity('primary.light', '#3399FF', '#FFFFFF')).not.toBe('error')
    expect(classifyToken('accent.lightForeground')).toBe('decorative')
    expect(getContrastSeverity('accent.lightForeground', '#B266FF', '#FFFFFF')).not.toBe('error')
  })

  it('keeps decorative light variants non-blocking across shipped presets', () => {
    for (const preset of THEME_PRESETS) {
      for (const mode of MODE_KEYS) {
        const config = preset.colors[mode]

        for (const family of COLOR_FAMILIES) {
          const token = config[family]
          expect(
            getContrastSeverity(`${family}.light`, token.light, token.lightForeground)
          ).not.toBe('error')
          expect(
            getContrastSeverity(`${family}.lightForeground`, token.light, token.lightForeground)
          ).not.toBe('error')
        }
      }
    }
  })

  it('keeps state direction deterministic by mode', () => {
    for (const preset of THEME_PRESETS) {
      for (const mode of MODE_KEYS) {
        const config = preset.colors[mode]
        for (const family of COLOR_FAMILIES) {
          const token = config[family]
          const defaultL = parseColor(token.default).l
          const hoverL = parseColor(token.hover).l
          const lightL = parseColor(token.light).l

          if (mode === 'light') {
            expect(hoverL, `${preset.name}.${mode}.${family}.hover`).toBeLessThan(defaultL)
            expect(lightL, `${preset.name}.${mode}.${family}.light`).toBeGreaterThan(defaultL)
          } else {
            expect(hoverL, `${preset.name}.${mode}.${family}.hover`).toBeGreaterThan(defaultL)
            expect(lightL, `${preset.name}.${mode}.${family}.light`).toBeLessThan(defaultL)
          }
        }
      }
    }
  })

  it('preserves semantic hue families and independent sidebar surfaces', () => {
    for (const preset of THEME_PRESETS) {
      for (const mode of MODE_KEYS) {
        const config = preset.colors[mode]
        const familyDefaults = COLOR_FAMILIES.map(family => config[family].default)

        expect(new Set(familyDefaults).size).toBe(familyDefaults.length)
        expect(config.sidebar.background).not.toBe(config.background)
        expect([config.primary.default, config.accent.default]).toContain(config.ring)
        expectHueRange(`${preset.name}.${mode}.success`, config.success.default, 120, 190)
        expectHueRange(`${preset.name}.${mode}.danger`, config.danger.default, 0, 35)
        expectHueRange(`${preset.name}.${mode}.warn`, config.warn.default, 45, 105)
        expectHueRange(`${preset.name}.${mode}.info`, config.info.default, 220, 285)
        expectHueRange(`${preset.name}.${mode}.help`, config.help.default, 285, 330)
      }
    }
  })
})
