import { THEME_PRESETS } from '../apps/web-demo/src/constants/theme'
import { generateThemeVars } from '../apps/web-demo/src/utils/theme/engine'
import {
  THEME_CONTRAST_PAIR_SPECS,
  assessTokenContrast,
  type DecorativeValidationMode,
} from '../apps/web-demo/src/utils/theme/validate'

interface ContrastFinding {
  preset: string
  mode: 'light' | 'dark'
  pair: string
  level: TokenSemanticLevel
  ratio: number
  required: number | null
  status: 'FAIL' | 'WARN' | 'SKIP'
  foreground: string
  background: string
}

type TokenSemanticLevel = 'action' | 'text' | 'subtle' | 'decorative'

interface ValidationConfig {
  decorativeMode: DecorativeValidationMode
}

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

function resolveDecorativeMode(args: string[]): DecorativeValidationMode {
  const inlineArg = args.find(arg => arg.startsWith('--decorative-mode='))
  const explicitArgIndex = args.findIndex(arg => arg === '--decorative-mode')
  const rawMode =
    inlineArg?.slice('--decorative-mode='.length) ??
    (explicitArgIndex >= 0 ? args[explicitArgIndex + 1] : undefined) ??
    process.env.TOKEN_DECORATIVE_MODE ??
    'warn'

  if (rawMode === 'ignore' || rawMode === 'warn' || rawMode === 'strict') {
    return rawMode
  }

  throw new Error(`Invalid decorative mode "${rawMode}". Expected one of: ignore, warn, strict.`)
}

function collectFindings(config: ValidationConfig): ContrastFinding[] {
  const findings: ContrastFinding[] = []

  for (const preset of THEME_PRESETS) {
    for (const mode of ['light', 'dark'] as const) {
      const vars = generateThemeVars(preset, mode === 'dark')

      for (const spec of THEME_CONTRAST_PAIR_SPECS) {
        const background = vars[spec.backgroundVar]
        const foreground = vars[spec.foregroundVar]
        const ratio = contrastRatio(background, foreground)
        const assessment = assessTokenContrast(spec.tokenPath, ratio, config)

        if (
          assessment.severity === 'error' ||
          assessment.severity === 'warn' ||
          assessment.severity === 'skip'
        ) {
          findings.push({
            preset: preset.name,
            mode,
            pair: spec.label,
            level: assessment.level,
            ratio,
            required: assessment.required,
            status:
              assessment.severity === 'error'
                ? 'FAIL'
                : assessment.severity === 'warn'
                  ? 'WARN'
                  : 'SKIP',
            foreground,
            background,
          })
        }
      }
    }
  }

  return findings
}

function formatExpectation(finding: ContrastFinding): string {
  if (finding.status === 'FAIL' && finding.required !== null) {
    return `expected >= ${finding.required.toFixed(1)}`
  }

  if (finding.status === 'WARN' && finding.required !== null) {
    return `ignored; recommended >= ${finding.required.toFixed(1)}`
  }

  return 'ignored by strategy'
}

function formatFinding(finding: ContrastFinding): string {
  return (
    `[${finding.status}][${finding.level}] ${finding.preset}/${finding.mode} ` +
    `${finding.pair} contrast: ${finding.ratio.toFixed(2)} ` +
    `(${formatExpectation(finding)}, bg ${finding.background}, fg ${finding.foreground})`
  )
}

const config: ValidationConfig = {
  decorativeMode: resolveDecorativeMode(process.argv.slice(2)),
}
const findings = collectFindings(config)
const failures = findings.filter(finding => finding.status === 'FAIL')
const advisories = findings.filter(finding => finding.status !== 'FAIL')
const totalPairs = THEME_PRESETS.length * 2 * THEME_CONTRAST_PAIR_SPECS.length

if (failures.length > 0) {
  console.error('Token contrast validation failed:')
  failures.forEach(finding => console.error(`  - ${formatFinding(finding)}`))
  advisories.forEach(finding => console.error(`  - ${formatFinding(finding)}`))
  process.exit(1)
}

if (advisories.length > 0) {
  console.warn('Token contrast validation passed with advisories:')
  advisories.forEach(finding => console.warn(`  - ${formatFinding(finding)}`))
}

console.log(
  `Token contrast validation passed: ${THEME_PRESETS.length} presets × 2 modes × ${THEME_CONTRAST_PAIR_SPECS.length} pairs (${totalPairs} checks, decorativeMode=${config.decorativeMode})`
)
