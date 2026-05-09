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
  ratio?: number
  required?: number
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

// ---------------------------------------------------------------------------
// Contrast thresholds
// ---------------------------------------------------------------------------

const WCAG = {
  body: 4.5,
  action: 4.5,
  subtle: 3.0,
} as const

type ContrastRole = keyof typeof WCAG

// ---------------------------------------------------------------------------
// Pairs to validate
// ---------------------------------------------------------------------------

export function getThemeContrastPairs(
  resolved: ResolvedTheme
): Array<{ bg: string; fg: string; role: ContrastRole; label: string; required: number }> {
  const pairs: Array<{ bg: string; fg: string; role: ContrastRole; label: string }> = [
    {
      bg: resolved.background,
      fg: resolved.foreground,
      role: 'body',
      label: 'background/foreground',
    },
    { bg: resolved.card, fg: resolved.cardForeground, role: 'body', label: 'card/card-foreground' },
    {
      bg: resolved.primary.base,
      fg: resolved.primary.foreground,
      role: 'action',
      label: 'primary/primary-fg',
    },
    {
      bg: resolved.primary.hover,
      fg: resolved.primary.hoverForeground,
      role: 'action',
      label: 'primary-hover/hover-fg',
    },
    {
      bg: resolved.primary.light,
      fg: resolved.primary.lightForeground,
      role: 'action',
      label: 'primary-light/light-fg',
    },
    {
      bg: resolved.secondary.base,
      fg: resolved.secondary.foreground,
      role: 'subtle',
      label: 'secondary/secondary-fg',
    },
    {
      bg: resolved.muted.base,
      fg: resolved.muted.foreground,
      role: 'subtle',
      label: 'muted/muted-fg',
    },
    {
      bg: resolved.accent.base,
      fg: resolved.accent.foreground,
      role: 'action',
      label: 'accent/accent-fg',
    },
    {
      bg: resolved.accent.hover,
      fg: resolved.accent.hoverForeground,
      role: 'action',
      label: 'accent-hover/hover-fg',
    },
    {
      bg: resolved.accent.light,
      fg: resolved.accent.lightForeground,
      role: 'action',
      label: 'accent-light/light-fg',
    },
    {
      bg: resolved.danger.base,
      fg: resolved.danger.foreground,
      role: 'action',
      label: 'danger/danger-fg',
    },
    { bg: resolved.warn.base, fg: resolved.warn.foreground, role: 'action', label: 'warn/warn-fg' },
    {
      bg: resolved.success.base,
      fg: resolved.success.foreground,
      role: 'action',
      label: 'success/success-fg',
    },
    { bg: resolved.info.base, fg: resolved.info.foreground, role: 'action', label: 'info/info-fg' },
    { bg: resolved.help.base, fg: resolved.help.foreground, role: 'action', label: 'help/help-fg' },
    {
      bg: resolved.sidebar.background,
      fg: resolved.sidebar.foreground,
      role: 'body',
      label: 'sidebar-bg/sidebar-fg',
    },
    {
      bg: resolved.sidebar.primary,
      fg: resolved.sidebar.primaryForeground,
      role: 'action',
      label: 'sidebar-primary/primary-fg',
    },
    {
      bg: resolved.sidebar.accent,
      fg: resolved.sidebar.accentForeground,
      role: 'action',
      label: 'sidebar-accent/accent-fg',
    },
  ]

  return pairs.map(pair => ({ ...pair, required: WCAG[pair.role] }))
}

// ---------------------------------------------------------------------------
// Main validate
// ---------------------------------------------------------------------------

export function validateTheme(resolved: ResolvedTheme): ValidationResult[] {
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
  const pairs = getThemeContrastPairs(resolved)
  for (const { bg, fg, role, label, required } of pairs) {
    emitThemeEvent({ type: 'TOKEN_DERIVED', token: `validation.${label}`, source: 'semantic' })
    const ratio = contrastRatio(parseColor(bg), parseColor(fg))
    if (ratio < required) {
      results.push({
        token: label,
        severity: 'error',
        message: `Contrast ratio ${ratio.toFixed(2)}:1 below required ${required}:1 (${role})`,
        ratio,
        required,
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
