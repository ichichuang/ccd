/**
 * Theme Engine v4 — Contrast & Invariant Validation
 *
 * Pure functions. Validates a ResolvedTheme against WCAG contrast thresholds
 * and internal invariants (no undefined tokens, no pure black in dark mode, etc.).
 */

import { parseColor, contrastRatio, relativeLuminance, deltaE } from './color'
import type { ResolvedTheme } from './resolver'
import { flattenResolvedTheme } from './tokens'
import { emitThemeEvent } from './observability'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ValidationResult {
  token: string
  severity: 'error' | 'warn'
  message: string
  level?: TokenSemanticLevel
  ratio?: number
  required?: number
}

export type TokenSemanticLevel = 'action' | 'text' | 'subtle' | 'decorative'

export type DecorativeValidationMode = 'ignore' | 'warn' | 'strict'

export interface ThemeValidationConfig {
  decorativeMode?: DecorativeValidationMode
}

export interface StrictThemeRules {
  noDuplicateValues?: boolean
  duplicateSeverity?: 'error' | 'warn'
  primaryForegroundMinContrast?: number
  warnWhiteTextLuminanceThreshold?: number
  dangerPrimaryMinDeltaE?: number
  mode?: 'light' | 'dark'
}

export interface StrictValidationResult extends ValidationResult {
  rule: string
  tokens?: string[]
  deltaE?: number
}

export interface ThemeContrastPairSpec {
  tokenPath: string
  label: string
  backgroundVar: keyof ThemeCssVars
  foregroundVar: keyof ThemeCssVars
  getBackground: (resolved: ResolvedTheme) => string | undefined
  getForeground: (resolved: ResolvedTheme) => string | undefined
}

export interface ThemeContrastPair {
  bg: string
  fg: string
  tokenPath: string
  label: string
  level: TokenSemanticLevel
  required: number | null
}

export interface ThemeContrastAssessment {
  tokenPath: string
  level: TokenSemanticLevel
  ratio: number
  required: number | null
  severity: 'error' | 'warn' | 'skip' | null
  message: string | null
}

const DEFAULT_THEME_VALIDATION_CONFIG: Required<ThemeValidationConfig> = {
  decorativeMode: 'warn',
}

const DECORATIVE_MIN_CONTRAST = 2

const ACTION_FAMILIES = ['primary', 'accent', 'success', 'warn', 'danger', 'info', 'help'] as const

function resolveValidationConfig(config?: ThemeValidationConfig): Required<ThemeValidationConfig> {
  return {
    ...DEFAULT_THEME_VALIDATION_CONFIG,
    ...config,
  }
}

function formatThreshold(value: number): string {
  return value.toFixed(1)
}

function isFamilyVariant(
  tokenPath: string,
  family: (typeof ACTION_FAMILIES)[number],
  variant: 'default' | 'hover' | 'foreground' | 'hoverForeground'
): boolean {
  return tokenPath === `${family}.${variant}`
}

export function classifyToken(tokenPath: string): TokenSemanticLevel {
  if (tokenPath.endsWith('.light') || tokenPath.endsWith('.lightForeground')) {
    return 'decorative'
  }

  if (
    tokenPath === 'background' ||
    tokenPath === 'foreground' ||
    tokenPath === 'card' ||
    tokenPath === 'card.foreground' ||
    tokenPath === 'neutral.foreground' ||
    tokenPath === 'secondaryForeground' ||
    tokenPath === 'neutral.secondaryForeground' ||
    tokenPath === 'sidebar.background' ||
    tokenPath === 'sidebar.foreground'
  ) {
    return 'text'
  }

  if (
    tokenPath === 'secondary' ||
    tokenPath === 'muted' ||
    tokenPath === 'border' ||
    tokenPath === 'input'
  ) {
    return 'subtle'
  }

  if (
    tokenPath === 'sidebar.primary' ||
    tokenPath === 'sidebar.primaryForeground' ||
    tokenPath === 'sidebar.accent' ||
    tokenPath === 'sidebar.accentForeground'
  ) {
    return 'action'
  }

  if (
    ACTION_FAMILIES.some(
      family =>
        isFamilyVariant(tokenPath, family, 'default') ||
        isFamilyVariant(tokenPath, family, 'hover') ||
        isFamilyVariant(tokenPath, family, 'foreground') ||
        isFamilyVariant(tokenPath, family, 'hoverForeground')
    )
  ) {
    return 'action'
  }

  return 'text'
}

export function getContrastThreshold(
  level: TokenSemanticLevel,
  config?: ThemeValidationConfig
): number | null {
  const resolvedConfig = resolveValidationConfig(config)

  switch (level) {
    case 'action':
    case 'text':
      return 4.5
    case 'subtle':
      return 3.0
    case 'decorative':
      return resolvedConfig.decorativeMode === 'ignore' ? null : DECORATIVE_MIN_CONTRAST
  }
}

export function assessTokenContrast(
  tokenPath: string,
  ratio: number,
  config?: ThemeValidationConfig
): ThemeContrastAssessment {
  const resolvedConfig = resolveValidationConfig(config)
  const level = classifyToken(tokenPath)
  const required = getContrastThreshold(level, resolvedConfig)

  if (required === null) {
    return {
      tokenPath,
      level,
      ratio,
      required,
      severity: 'skip',
      message: null,
    }
  }

  if (ratio >= required) {
    return {
      tokenPath,
      level,
      ratio,
      required,
      severity: null,
      message: null,
    }
  }

  if (level === 'decorative' && resolvedConfig.decorativeMode === 'warn') {
    return {
      tokenPath,
      level,
      ratio,
      required,
      severity: 'warn',
      message: `Contrast ratio ${ratio.toFixed(2)}:1 below decorative recommendation ${formatThreshold(required)}:1 (ignored)`,
    }
  }

  const scope = level === 'decorative' ? 'decorative strict' : level

  return {
    tokenPath,
    level,
    ratio,
    required,
    severity: 'error',
    message: `Contrast ratio ${ratio.toFixed(2)}:1 below required ${formatThreshold(required)}:1 (${scope})`,
  }
}

// ---------------------------------------------------------------------------
// Pairs to validate
// ---------------------------------------------------------------------------

export const THEME_CONTRAST_PAIR_SPECS: ThemeContrastPairSpec[] = [
  {
    tokenPath: 'background',
    label: 'background/foreground',
    backgroundVar: '--background',
    foregroundVar: '--foreground',
    getBackground: resolved => resolved.background,
    getForeground: resolved => resolved.foreground,
  },
  {
    tokenPath: 'card',
    label: 'card/foreground',
    backgroundVar: '--card',
    foregroundVar: '--card-foreground',
    getBackground: resolved => resolved.card,
    getForeground: resolved => resolved.cardForeground,
  },
  {
    tokenPath: 'primary.default',
    label: 'primary/default',
    backgroundVar: '--primary',
    foregroundVar: '--primary-foreground',
    getBackground: resolved => resolved.primary.base,
    getForeground: resolved => resolved.primary.foreground,
  },
  {
    tokenPath: 'primary.hover',
    label: 'primary/hover',
    backgroundVar: '--primary-hover',
    foregroundVar: '--primary-hover-foreground',
    getBackground: resolved => resolved.primary.hover,
    getForeground: resolved => resolved.primary.hoverForeground,
  },
  {
    tokenPath: 'primary.light',
    label: 'primary/light',
    backgroundVar: '--primary-light',
    foregroundVar: '--primary-light-foreground',
    getBackground: resolved => resolved.primary.light,
    getForeground: resolved => resolved.primary.lightForeground,
  },
  {
    tokenPath: 'secondary',
    label: 'secondary',
    backgroundVar: '--secondary',
    foregroundVar: '--secondary-foreground',
    getBackground: resolved => resolved.secondary.base,
    getForeground: resolved => resolved.secondary.foreground,
  },
  {
    tokenPath: 'muted',
    label: 'muted',
    backgroundVar: '--muted',
    foregroundVar: '--muted-foreground',
    getBackground: resolved => resolved.muted.base,
    getForeground: resolved => resolved.muted.foreground,
  },
  {
    tokenPath: 'accent.default',
    label: 'accent/default',
    backgroundVar: '--accent',
    foregroundVar: '--accent-foreground',
    getBackground: resolved => resolved.accent.base,
    getForeground: resolved => resolved.accent.foreground,
  },
  {
    tokenPath: 'accent.hover',
    label: 'accent/hover',
    backgroundVar: '--accent-hover',
    foregroundVar: '--accent-hover-foreground',
    getBackground: resolved => resolved.accent.hover,
    getForeground: resolved => resolved.accent.hoverForeground,
  },
  {
    tokenPath: 'accent.light',
    label: 'accent/light',
    backgroundVar: '--accent-light',
    foregroundVar: '--accent-light-foreground',
    getBackground: resolved => resolved.accent.light,
    getForeground: resolved => resolved.accent.lightForeground,
  },
  {
    tokenPath: 'danger.default',
    label: 'danger/default',
    backgroundVar: '--danger',
    foregroundVar: '--danger-foreground',
    getBackground: resolved => resolved.danger.base,
    getForeground: resolved => resolved.danger.foreground,
  },
  {
    tokenPath: 'danger.hover',
    label: 'danger/hover',
    backgroundVar: '--danger-hover',
    foregroundVar: '--danger-hover-foreground',
    getBackground: resolved => resolved.danger.hover,
    getForeground: resolved => resolved.danger.hoverForeground,
  },
  {
    tokenPath: 'danger.light',
    label: 'danger/light',
    backgroundVar: '--danger-light',
    foregroundVar: '--danger-light-foreground',
    getBackground: resolved => resolved.danger.light,
    getForeground: resolved => resolved.danger.lightForeground,
  },
  {
    tokenPath: 'warn.default',
    label: 'warn/default',
    backgroundVar: '--warn',
    foregroundVar: '--warn-foreground',
    getBackground: resolved => resolved.warn.base,
    getForeground: resolved => resolved.warn.foreground,
  },
  {
    tokenPath: 'warn.hover',
    label: 'warn/hover',
    backgroundVar: '--warn-hover',
    foregroundVar: '--warn-hover-foreground',
    getBackground: resolved => resolved.warn.hover,
    getForeground: resolved => resolved.warn.hoverForeground,
  },
  {
    tokenPath: 'warn.light',
    label: 'warn/light',
    backgroundVar: '--warn-light',
    foregroundVar: '--warn-light-foreground',
    getBackground: resolved => resolved.warn.light,
    getForeground: resolved => resolved.warn.lightForeground,
  },
  {
    tokenPath: 'success.default',
    label: 'success/default',
    backgroundVar: '--success',
    foregroundVar: '--success-foreground',
    getBackground: resolved => resolved.success.base,
    getForeground: resolved => resolved.success.foreground,
  },
  {
    tokenPath: 'success.hover',
    label: 'success/hover',
    backgroundVar: '--success-hover',
    foregroundVar: '--success-hover-foreground',
    getBackground: resolved => resolved.success.hover,
    getForeground: resolved => resolved.success.hoverForeground,
  },
  {
    tokenPath: 'success.light',
    label: 'success/light',
    backgroundVar: '--success-light',
    foregroundVar: '--success-light-foreground',
    getBackground: resolved => resolved.success.light,
    getForeground: resolved => resolved.success.lightForeground,
  },
  {
    tokenPath: 'info.default',
    label: 'info/default',
    backgroundVar: '--info',
    foregroundVar: '--info-foreground',
    getBackground: resolved => resolved.info.base,
    getForeground: resolved => resolved.info.foreground,
  },
  {
    tokenPath: 'info.hover',
    label: 'info/hover',
    backgroundVar: '--info-hover',
    foregroundVar: '--info-hover-foreground',
    getBackground: resolved => resolved.info.hover,
    getForeground: resolved => resolved.info.hoverForeground,
  },
  {
    tokenPath: 'info.light',
    label: 'info/light',
    backgroundVar: '--info-light',
    foregroundVar: '--info-light-foreground',
    getBackground: resolved => resolved.info.light,
    getForeground: resolved => resolved.info.lightForeground,
  },
  {
    tokenPath: 'help.default',
    label: 'help/default',
    backgroundVar: '--help',
    foregroundVar: '--help-foreground',
    getBackground: resolved => resolved.help.base,
    getForeground: resolved => resolved.help.foreground,
  },
  {
    tokenPath: 'help.hover',
    label: 'help/hover',
    backgroundVar: '--help-hover',
    foregroundVar: '--help-hover-foreground',
    getBackground: resolved => resolved.help.hover,
    getForeground: resolved => resolved.help.hoverForeground,
  },
  {
    tokenPath: 'help.light',
    label: 'help/light',
    backgroundVar: '--help-light',
    foregroundVar: '--help-light-foreground',
    getBackground: resolved => resolved.help.light,
    getForeground: resolved => resolved.help.lightForeground,
  },
  {
    tokenPath: 'sidebar.background',
    label: 'sidebar/background',
    backgroundVar: '--sidebar-background',
    foregroundVar: '--sidebar-foreground',
    getBackground: resolved => resolved.sidebar.background,
    getForeground: resolved => resolved.sidebar.foreground,
  },
  {
    tokenPath: 'sidebar.primary',
    label: 'sidebar/primary',
    backgroundVar: '--sidebar-primary',
    foregroundVar: '--sidebar-primary-foreground',
    getBackground: resolved => resolved.sidebar.primary,
    getForeground: resolved => resolved.sidebar.primaryForeground,
  },
  {
    tokenPath: 'sidebar.accent',
    label: 'sidebar/accent',
    backgroundVar: '--sidebar-accent',
    foregroundVar: '--sidebar-accent-foreground',
    getBackground: resolved => resolved.sidebar.accent,
    getForeground: resolved => resolved.sidebar.accentForeground,
  },
]

export function getThemeContrastPairs(
  resolved: ResolvedTheme,
  config?: ThemeValidationConfig
): ThemeContrastPair[] {
  const resolvedConfig = resolveValidationConfig(config)

  return THEME_CONTRAST_PAIR_SPECS.flatMap(spec => {
    const bg = spec.getBackground(resolved)
    const fg = spec.getForeground(resolved)

    if (!bg || !fg) {
      return []
    }

    const level = classifyToken(spec.tokenPath)
    return [
      {
        bg,
        fg,
        tokenPath: spec.tokenPath,
        label: spec.label,
        level,
        required: getContrastThreshold(level, resolvedConfig),
      },
    ]
  })
}

// ---------------------------------------------------------------------------
// Main validate
// ---------------------------------------------------------------------------

export function validateTheme(
  resolved: ResolvedTheme,
  config?: ThemeValidationConfig
): ValidationResult[] {
  const results: ValidationResult[] = []

  // Check no undefined tokens
  const requiredHexFields: Array<{ label: string; value: string | undefined }> = [
    { label: 'background', value: resolved.background },
    { label: 'foreground', value: resolved.foreground },
    { label: 'card', value: resolved.card },
    { label: 'cardForeground', value: resolved.cardForeground },
    { label: 'primary.base', value: resolved.primary.base },
    { label: 'primary.foreground', value: resolved.primary.foreground },
    { label: 'secondary.base', value: resolved.secondary.base },
    { label: 'muted.base', value: resolved.muted.base },
    { label: 'border', value: resolved.border },
    { label: 'input', value: resolved.input },
    { label: 'ring', value: resolved.ring },
    { label: 'sidebar.background', value: resolved.sidebar.background },
  ]

  for (const { label, value } of requiredHexFields) {
    if (!value || value === '#000000' || value === 'undefined') {
      results.push({
        token: label,
        severity: 'error',
        message: `Required token "${label}" is undefined or invalid`,
      })
    }
  }

  // Contrast validation
  const pairs = getThemeContrastPairs(resolved, config)
  for (const { bg, fg, tokenPath, label } of pairs) {
    emitThemeEvent({ type: 'TOKEN_DERIVED', token: `validation.${label}`, source: 'semantic' })
    const ratio = contrastRatio(parseColor(bg), parseColor(fg))
    const assessment = assessTokenContrast(tokenPath, ratio, config)

    if (assessment.severity === 'error' || assessment.severity === 'warn') {
      results.push({
        token: label,
        severity: assessment.severity,
        message: assessment.message ?? '',
        level: assessment.level,
        ratio,
        required: assessment.required ?? undefined,
      })
    }
  }

  // Dark mode: warn on pure black
  const bgL = parseColor(resolved.background).l
  if (bgL < 0.02) {
    results.push({
      token: 'background',
      severity: 'warn',
      message: `Background is near-pure black (L=${bgL.toFixed(3)}). Consider using a near-black instead for eye comfort.`,
    })
  }

  const sidebarBgL = parseColor(resolved.sidebar.background).l
  if (sidebarBgL < 0.02) {
    results.push({
      token: 'sidebar.background',
      severity: 'warn',
      message: `Sidebar background is near-pure black (L=${sidebarBgL.toFixed(3)}).`,
    })
  }

  return results
}

const DEFAULT_STRICT_RULES: Required<StrictThemeRules> = {
  noDuplicateValues: true,
  duplicateSeverity: 'warn',
  primaryForegroundMinContrast: 4.5,
  warnWhiteTextLuminanceThreshold: 0.55,
  dangerPrimaryMinDeltaE: 12,
  mode: 'light',
}

function tokenRoot(token: string): string {
  return token.startsWith('sidebar.') ? 'sidebar' : (token.split('.')[0] ?? token)
}

function valuesAreUnrelated(tokens: string[]): boolean {
  const roots = new Set(tokens.map(tokenRoot))
  return roots.size > 1
}

function resolveStrictRules(
  rules: StrictThemeRules | undefined,
  theme: ResolvedTheme
): Required<StrictThemeRules> {
  const inferredMode = relativeLuminance(parseColor(theme.background)) < 0.5 ? 'dark' : 'light'
  return {
    ...DEFAULT_STRICT_RULES,
    ...rules,
    mode: rules?.mode ?? inferredMode,
  }
}

function validateDuplicateValues(
  theme: ResolvedTheme,
  rules: Required<StrictThemeRules>
): StrictValidationResult[] {
  if (!rules.noDuplicateValues) return []

  const byValue: Record<string, string[]> = {}
  const tokens = flattenResolvedTheme(theme)

  for (const [token, value] of Object.entries(tokens)) {
    byValue[value] = [...(byValue[value] ?? []), token]
  }

  return Object.entries(byValue)
    .filter(
      ([, tokensWithValue]) => tokensWithValue.length > 1 && valuesAreUnrelated(tokensWithValue)
    )
    .map(([value, tokensWithValue]) => ({
      token: tokensWithValue[0] ?? value,
      severity: rules.duplicateSeverity,
      rule: 'no-token-duplication',
      tokens: tokensWithValue,
      message: `Duplicate token value ${value} across unrelated tokens: ${tokensWithValue.join(', ')}`,
    }))
}

export function validateThemeStrict(
  theme: ResolvedTheme,
  rules?: StrictThemeRules
): StrictValidationResult[] {
  const resolvedRules = resolveStrictRules(rules, theme)
  const results: StrictValidationResult[] = validateTheme(theme).map(result => ({
    ...result,
    rule: 'wcag-contrast',
  }))

  results.push(...validateDuplicateValues(theme, resolvedRules))

  const primaryRatio = contrastRatio(
    parseColor(theme.primary.base),
    parseColor(theme.primary.foreground)
  )
  if (primaryRatio < resolvedRules.primaryForegroundMinContrast) {
    results.push({
      token: 'primary.foreground',
      severity: 'error',
      rule: 'primary-foreground-contrast',
      ratio: primaryRatio,
      required: resolvedRules.primaryForegroundMinContrast,
      message: `Primary foreground contrast ${primaryRatio.toFixed(2)}:1 is below ${resolvedRules.primaryForegroundMinContrast}:1`,
    })
  }

  const warnFgLuminance = relativeLuminance(parseColor(theme.warn.foreground))
  const warnBgLuminance = relativeLuminance(parseColor(theme.warn.base))
  if (
    resolvedRules.mode === 'light' &&
    warnFgLuminance > 0.95 &&
    warnBgLuminance > resolvedRules.warnWhiteTextLuminanceThreshold
  ) {
    results.push({
      token: 'warn.foreground',
      severity: 'warn',
      rule: 'warn-light-mode-white-text',
      message:
        'Warn foreground should not use white text on high-luminance light-mode warning fills.',
    })
  }

  const dangerPrimaryDelta = deltaE(parseColor(theme.danger.base), parseColor(theme.primary.base))
  if (dangerPrimaryDelta < resolvedRules.dangerPrimaryMinDeltaE) {
    results.push({
      token: 'danger.base',
      severity: 'error',
      rule: 'danger-distinguishable-from-primary',
      deltaE: dangerPrimaryDelta,
      required: resolvedRules.dangerPrimaryMinDeltaE,
      message: `Danger must be distinguishable from primary (deltaE ${dangerPrimaryDelta.toFixed(2)} < ${resolvedRules.dangerPrimaryMinDeltaE}).`,
    })
  }

  return results
}
