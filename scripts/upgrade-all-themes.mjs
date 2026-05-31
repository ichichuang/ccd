import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { THEME_PRESETS } from '@ccd/design-tokens'
import {
  parseColor,
  toHex,
  darken,
  lighten,
  mix,
  contrastRatio,
} from '@ccd/design-tokens/theme-engine'

const COLOR_FAMILIES = ['primary', 'accent', 'success', 'warn', 'danger', 'info', 'help']
const COLOR_STATE_KEYS = ['default', 'foreground', 'hover', 'light', 'lightForeground']
const MODE_KEYS = ['light', 'dark']
const NEUTRAL_KEYS = ['base', 'bg', 'foreground', 'secondaryForeground', 'mutedForeground']
const SIDEBAR_KEYS = [
  'background',
  'foreground',
  'primary',
  'primaryForeground',
  'accent',
  'accentForeground',
  'border',
  'ring',
]
const SCALAR_KEYS = [
  'background',
  'foreground',
  'secondary',
  'secondaryForeground',
  'muted',
  'mutedForeground',
  'border',
  'input',
  'ring',
]

const DEFAULT_STATUS = {
  success: '#16a34a',
  warn: '#d97706',
  danger: '#dc2626',
  info: '#2563eb',
  help: '#7c3aed',
}

function normalizeHex(value, fallback = '#000000') {
  if (typeof value !== 'string') return fallback
  const normalized = value.trim().toLowerCase()
  return /^#[0-9a-f]{6}$/.test(normalized) ? normalized : fallback
}

const FOREGROUND_CANDIDATES = ['#333333', '#111111', '#000000', '#f8f9fa', '#ffffff']

function readableForeground(background, preferred, minRatio = 4.5) {
  const normalizedBackground = normalizeHex(background)
  const normalizedPreferred = normalizeHex(preferred)

  if (
    contrastRatio(parseColor(normalizedBackground), parseColor(normalizedPreferred)) >= minRatio
  ) {
    return normalizedPreferred
  }

  for (const candidate of FOREGROUND_CANDIDATES) {
    if (contrastRatio(parseColor(normalizedBackground), parseColor(candidate)) >= minRatio) {
      return candidate
    }
  }

  return toHex(parseColor(normalizedPreferred))
}

function deriveHover(defaultHex, isDark) {
  return toHex(isDark ? lighten(parseColor(defaultHex), 0.08) : darken(parseColor(defaultHex), 0.08))
}

function deriveLight(defaultHex, backgroundHex) {
  return toHex(mix(parseColor(defaultHex), parseColor(backgroundHex), 0.15))
}

function upgradeColorState(input, fallbackDefault, backgroundHex, isDark) {
  const base = normalizeHex(input?.default, fallbackDefault)
  const light = normalizeHex(input?.light, deriveLight(base, backgroundHex))

  return {
    default: base,
    foreground: readableForeground(base, input?.foreground ?? '#ffffff', 4.5),
    hover: normalizeHex(input?.hover, deriveHover(base, isDark)),
    light,
    lightForeground: readableForeground(light, input?.lightForeground ?? base, 2),
  }
}

function upgradeModeConfig(config, isDark) {
  const background = normalizeHex(config?.background, isDark ? '#09090b' : '#ffffff')
  const foreground = readableForeground(background, config?.foreground ?? (isDark ? '#ffffff' : '#000000'))
  const neutralBase = normalizeHex(config?.neutral?.base, isDark ? '#27272a' : '#e5e7eb')
  const neutralBg = normalizeHex(config?.neutral?.bg, isDark ? '#18181b' : '#ffffff')
  const neutralForeground = readableForeground(neutralBg, config?.neutral?.foreground ?? foreground)
  const primaryDefault = normalizeHex(config?.primary?.default, '#2563eb')
  const accentDefault = normalizeHex(config?.accent?.default, primaryDefault)

  const primary = upgradeColorState(config?.primary, primaryDefault, background, isDark)
  const accent = upgradeColorState(config?.accent, accentDefault, background, isDark)

  return {
    background,
    foreground,
    neutral: {
      base: neutralBase,
      bg: neutralBg,
      foreground: neutralForeground,
      secondaryForeground: readableForeground(config?.secondary ?? neutralBg, config?.neutral?.secondaryForeground ?? config?.secondaryForeground ?? neutralForeground),
      mutedForeground: readableForeground(config?.muted ?? neutralBg, config?.neutral?.mutedForeground ?? config?.mutedForeground ?? neutralForeground),
    },
    secondary: normalizeHex(config?.secondary, neutralBg),
    secondaryForeground: readableForeground(config?.secondary ?? neutralBg, config?.secondaryForeground ?? neutralForeground),
    muted: normalizeHex(config?.muted, neutralBg),
    mutedForeground: readableForeground(config?.muted ?? neutralBg, config?.mutedForeground ?? neutralForeground),
    border: normalizeHex(config?.border, neutralBase),
    input: normalizeHex(config?.input, neutralBase),
    ring: normalizeHex(config?.ring, primary.default),
    primary,
    accent,
    success: upgradeColorState(config?.success, DEFAULT_STATUS.success, background, isDark),
    warn: upgradeColorState(config?.warn, DEFAULT_STATUS.warn, background, isDark),
    danger: upgradeColorState(config?.danger, DEFAULT_STATUS.danger, background, isDark),
    info: upgradeColorState(config?.info, DEFAULT_STATUS.info, background, isDark),
    help: upgradeColorState(config?.help, DEFAULT_STATUS.help, background, isDark),
    sidebar: {
      background: normalizeHex(config?.sidebar?.background, isDark ? '#111827' : '#f8fafc'),
      foreground: readableForeground(config?.sidebar?.background ?? background, config?.sidebar?.foreground ?? foreground),
      primary: normalizeHex(config?.sidebar?.primary, primary.default),
      primaryForeground: readableForeground(config?.sidebar?.primary ?? primary.default, config?.sidebar?.primaryForeground ?? primary.foreground),
      accent: normalizeHex(config?.sidebar?.accent, accent.default),
      accentForeground: readableForeground(config?.sidebar?.accent ?? accent.default, config?.sidebar?.accentForeground ?? accent.foreground),
      border: normalizeHex(config?.sidebar?.border, neutralBase),
      ring: normalizeHex(config?.sidebar?.ring, accent.default),
    },
  }
}

export function upgradeAllThemes(presets) {
  return presets.map(preset => ({
    ...preset,
    colors: {
      light: upgradeModeConfig(preset.colors?.light, false),
      dark: upgradeModeConfig(preset.colors?.dark, true),
    },
  }))
}

export function validateUpgradedThemes(presets) {
  const issues = []

  for (const preset of presets) {
    for (const mode of MODE_KEYS) {
      const config = preset.colors?.[mode]
      if (!config) {
        issues.push(`${preset.name}.${mode}: missing mode config`)
        continue
      }

      for (const key of SCALAR_KEYS) {
        if (!/^#[0-9a-f]{6}$/.test(config[key])) issues.push(`${preset.name}.${mode}.${key}: invalid hex`)
      }
      for (const key of NEUTRAL_KEYS) {
        if (!/^#[0-9a-f]{6}$/.test(config.neutral[key])) issues.push(`${preset.name}.${mode}.neutral.${key}: invalid hex`)
      }
      for (const key of SIDEBAR_KEYS) {
        if (!/^#[0-9a-f]{6}$/.test(config.sidebar[key])) issues.push(`${preset.name}.${mode}.sidebar.${key}: invalid hex`)
      }
      for (const family of COLOR_FAMILIES) {
        for (const key of COLOR_STATE_KEYS) {
          if (!/^#[0-9a-f]{6}$/.test(config[family][key])) {
            issues.push(`${preset.name}.${mode}.${family}.${key}: invalid hex`)
          }
        }
        const solidRatio = contrastRatio(parseColor(config[family].default), parseColor(config[family].foreground))
        const lightRatio = contrastRatio(parseColor(config[family].light), parseColor(config[family].lightForeground))
        if (solidRatio < 4.5) issues.push(`${preset.name}.${mode}.${family}: solid contrast ${solidRatio.toFixed(2)}`)
        if (lightRatio < 2) issues.push(`${preset.name}.${mode}.${family}: light contrast ${lightRatio.toFixed(2)}`)
      }
    }
  }

  return issues
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const upgraded = upgradeAllThemes(THEME_PRESETS)
  const issues = validateUpgradedThemes(upgraded)

  if (issues.length > 0) {
    console.error(issues.join('\n'))
    process.exitCode = 1
  } else {
    console.log(`Theme upgrade validation passed for ${upgraded.length} presets.`)
  }
}
