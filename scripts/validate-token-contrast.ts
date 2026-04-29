import { THEME_PRESETS } from '../src/constants/theme'
import { generateThemeVars } from '../src/utils/theme/engine'

interface ContrastFinding {
  preset: string
  mode: 'light' | 'dark'
  pair: string
  ratio: number
  foreground: string
  background: string
}

const CONTRAST_MIN_RATIO = 4.5

const TOKEN_PAIRS: Array<[keyof ThemeCssVars, keyof ThemeCssVars]> = [
  ['--background', '--foreground'],
  ['--card', '--card-foreground'],
  ['--popover', '--popover-foreground'],
  ['--primary', '--primary-foreground'],
  ['--primary-hover', '--primary-hover-foreground'],
  ['--primary-light', '--primary-light-foreground'],
  ['--secondary', '--secondary-foreground'],
  ['--muted', '--muted-foreground'],
  ['--accent', '--accent-foreground'],
  ['--accent-hover', '--accent-hover-foreground'],
  ['--accent-light', '--accent-light-foreground'],
  ['--danger', '--danger-foreground'],
  ['--danger-hover', '--danger-hover-foreground'],
  ['--danger-light', '--danger-light-foreground'],
  ['--warn', '--warn-foreground'],
  ['--warn-hover', '--warn-hover-foreground'],
  ['--warn-light', '--warn-light-foreground'],
  ['--success', '--success-foreground'],
  ['--success-hover', '--success-hover-foreground'],
  ['--success-light', '--success-light-foreground'],
  ['--info', '--info-foreground'],
  ['--info-hover', '--info-hover-foreground'],
  ['--info-light', '--info-light-foreground'],
  ['--help', '--help-foreground'],
  ['--help-hover', '--help-hover-foreground'],
  ['--help-light', '--help-light-foreground'],
  ['--sidebar-background', '--sidebar-foreground'],
  ['--sidebar-primary', '--sidebar-primary-foreground'],
  ['--sidebar-accent', '--sidebar-accent-foreground'],
]

function parseRgbChannels(value: string): [number, number, number] {
  const channels = value
    .trim()
    .split(/\s+/)
    .map(part => Number(part))

  if (
    channels.length !== 3 ||
    channels.some(channel => !Number.isFinite(channel) || channel < 0 || channel > 255)
  ) {
    throw new Error(`Invalid RGB channel value: ${value}`)
  }

  return [channels[0], channels[1], channels[2]]
}

function toLinear(channel: number): number {
  const value = channel / 255
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function luminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map(toLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(a: string, b: string): number {
  const left = luminance(parseRgbChannels(a))
  const right = luminance(parseRgbChannels(b))
  const lighter = Math.max(left, right)
  const darker = Math.min(left, right)
  return (lighter + 0.05) / (darker + 0.05)
}

function collectFindings(): ContrastFinding[] {
  const findings: ContrastFinding[] = []

  for (const preset of THEME_PRESETS) {
    for (const mode of ['light', 'dark'] as const) {
      const vars = generateThemeVars(preset, mode === 'dark')

      for (const [backgroundToken, foregroundToken] of TOKEN_PAIRS) {
        const background = vars[backgroundToken]
        const foreground = vars[foregroundToken]
        const ratio = contrastRatio(background, foreground)

        if (ratio < CONTRAST_MIN_RATIO) {
          findings.push({
            preset: preset.name,
            mode,
            pair: `${backgroundToken}/${foregroundToken}`,
            ratio,
            foreground,
            background,
          })
        }
      }
    }
  }

  return findings
}

const findings = collectFindings()

if (findings.length > 0) {
  console.error('Token contrast validation failed:')
  findings.forEach(finding => {
    console.error(
      `  - ${finding.preset}/${finding.mode} ${finding.pair}: ${finding.ratio.toFixed(2)} ` +
        `(bg ${finding.background}, fg ${finding.foreground})`
    )
  })
  process.exit(1)
}

console.log(
  `Token contrast validation passed: ${THEME_PRESETS.length} presets × 2 modes × ${TOKEN_PAIRS.length} pairs`
)
