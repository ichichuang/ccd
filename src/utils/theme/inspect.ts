/**
 * Theme Engine v5 — Runtime Inspection API
 */

import { parseColor, contrastRatio } from './color'
import {
  getTokensByLayer,
  flattenResolvedTheme,
  type ThemeTokenRecord,
  type ThemeTokensByLayer,
} from './tokens'
import { getThemeContrastPairs, validateTheme, type ValidationResult } from './validate'
import type { ResolvedTheme } from './resolver'

export interface ThemeContrastMatrixEntry {
  label: string
  background: string
  foreground: string
  ratio: number
  required: number
  passes: boolean
}

export interface SemanticCompletenessReport {
  complete: boolean
  missingTokens: string[]
}

export interface ThemeInspection {
  tokens: ThemeTokenRecord
  tokensByLayer: ThemeTokensByLayer
  contrastMatrix: ThemeContrastMatrixEntry[]
  invalidTokens: ValidationResult[]
  unusedTokens: string[]
  semanticCompleteness: SemanticCompletenessReport
}

function roundRatio(value: number): number {
  return Math.round(value * 100) / 100
}

function inspectContrast(theme: ResolvedTheme): ThemeContrastMatrixEntry[] {
  return getThemeContrastPairs(theme).map(pair => {
    const ratio = contrastRatio(parseColor(pair.bg), parseColor(pair.fg))
    return {
      label: pair.label,
      background: pair.bg,
      foreground: pair.fg,
      ratio: roundRatio(ratio),
      required: pair.required,
      passes: ratio >= pair.required,
    }
  })
}

function inspectSemanticCompleteness(tokens: ThemeTokenRecord): SemanticCompletenessReport {
  const missingTokens = Object.entries(tokens)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  return {
    complete: missingTokens.length === 0,
    missingTokens,
  }
}

export function inspectTheme(theme: ResolvedTheme): ThemeInspection {
  const tokens = flattenResolvedTheme(theme)

  return {
    tokens,
    tokensByLayer: getTokensByLayer(theme),
    contrastMatrix: inspectContrast(theme),
    invalidTokens: validateTheme(theme),
    unusedTokens: [],
    semanticCompleteness: inspectSemanticCompleteness(tokens),
  }
}
