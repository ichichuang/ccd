import { THEME_PRESETS } from '../src/constants/theme'
import { generateThemeVars } from '../src/utils/theme/engine'

interface ContrastFinding {
  preset: string
  mode: 'light' | 'dark'
  pair: string
  role: ContrastRole
  ratio: number
  foreground: string
  background: string
}

const CONTRAST_ROLES = {
  body: 4.5,
  action: 4.5,
  subtle: 3.0,
} as const

type ContrastRole = keyof typeof CONTRAST_ROLES

const TOKEN_PAIRS: Array<{
  background: keyof ThemeCssVars
  foreground: keyof ThemeCssVars
  role: ContrastRole
}> = [
  { background: '--background', foreground: '--foreground', role: 'body' },
  { background: '--card', foreground: '--card-foreground', role: 'body' },
  { background: '--popover', foreground: '--popover-foreground', role: 'body' },
  { background: '--primary', foreground: '--primary-foreground', role: 'action' },
  { background: '--primary-hover', foreground: '--primary-hover-foreground', role: 'action' },
  { background: '--primary-light', foreground: '--primary-light-foreground', role: 'action' },
  { background: '--secondary', foreground: '--secondary-foreground', role: 'subtle' },
  { background: '--muted', foreground: '--muted-foreground', role: 'subtle' },
  { background: '--accent', foreground: '--accent-foreground', role: 'action' },
  { background: '--accent-hover', foreground: '--accent-hover-foreground', role: 'action' },
  { background: '--accent-light', foreground: '--accent-light-foreground', role: 'action' },
  { background: '--danger', foreground: '--danger-foreground', role: 'action' },
  { background: '--danger-hover', foreground: '--danger-hover-foreground', role: 'action' },
  { background: '--danger-light', foreground: '--danger-light-foreground', role: 'action' },
  { background: '--warn', foreground: '--warn-foreground', role: 'action' },
  { background: '--warn-hover', foreground: '--warn-hover-foreground', role: 'action' },
  { background: '--warn-light', foreground: '--warn-light-foreground', role: 'action' },
  { background: '--success', foreground: '--success-foreground', role: 'action' },
  { background: '--success-hover', foreground: '--success-hover-foreground', role: 'action' },
  { background: '--success-light', foreground: '--success-light-foreground', role: 'action' },
  { background: '--info', foreground: '--info-foreground', role: 'action' },
  { background: '--info-hover', foreground: '--info-hover-foreground', role: 'action' },
  { background: '--info-light', foreground: '--info-light-foreground', role: 'action' },
  { background: '--help', foreground: '--help-foreground', role: 'action' },
  { background: '--help-hover', foreground: '--help-hover-foreground', role: 'action' },
  { background: '--help-light', foreground: '--help-light-foreground', role: 'action' },
  { background: '--sidebar-background', foreground: '--sidebar-foreground', role: 'body' },
  { background: '--sidebar-primary', foreground: '--sidebar-primary-foreground', role: 'action' },
  { background: '--sidebar-accent', foreground: '--sidebar-accent-foreground', role: 'action' },
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

      for (const {
        background: backgroundToken,
        foreground: foregroundToken,
        role,
      } of TOKEN_PAIRS) {
        const background = vars[backgroundToken]
        const foreground = vars[foregroundToken]
        const ratio = contrastRatio(background, foreground)
        const minRatio = CONTRAST_ROLES[role]

        if (ratio < minRatio) {
          findings.push({
            preset: preset.name,
            mode,
            pair: `${backgroundToken}/${foregroundToken}`,
            role,
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
        `(${finding.role} >= ${CONTRAST_ROLES[finding.role]}, bg ${finding.background}, fg ${finding.foreground})`
    )
  })
  process.exit(1)
}

console.log(
  `Token contrast validation passed: ${THEME_PRESETS.length} presets × 2 modes × ${TOKEN_PAIRS.length} pairs`
)
