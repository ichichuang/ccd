/**
 * Theme Engine v4 — Theme Diff System
 *
 * Compares two ResolvedThemes and reports changed tokens, contrast shift,
 * and visual weight difference. Useful for debugging and observability.
 */

import { parseColor, contrastRatio, relativeLuminance, deltaE } from './color.js'
import type { ResolvedTheme } from './resolver.js'
import { flattenResolvedTheme } from './tokens.js'
import { getThemeContrastPairs } from './validate.js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ThemeDiff {
  changedTokens: string[]
  contrastDiff: number
  visualWeightShift: number
  perceptualDiff: {
    averageDeltaE: number
    maxDeltaE: number
    tokens: Array<{ token: string; before: string; after: string; deltaE: number }>
  }
  contrastImpact: {
    averageDelta: number
    maxDelta: number
    impactedPairs: Array<{ pair: string; before: number; after: number; delta: number }>
  }
  semanticImpactScore: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Average luminance of all key background/fill tokens in a theme. */
function averageLuminance(theme: ResolvedTheme): number {
  const tokens = [
    theme.background,
    theme.card,
    theme.primary.base,
    theme.secondary.base,
    theme.muted.base,
    theme.sidebar.background,
  ]
  const luminances = tokens.map(hex => relativeLuminance(parseColor(hex)))
  return luminances.reduce((a, b) => a + b, 0) / luminances.length
}

/** Average contrast across body pairs. */
function averageBodyContrast(theme: ResolvedTheme): number {
  const pairs = [
    [theme.background, theme.foreground],
    [theme.card, theme.cardForeground],
    [theme.sidebar.background, theme.sidebar.foreground],
  ]
  const ratios = pairs.map(([bg, fg]) => contrastRatio(parseColor(bg), parseColor(fg)))
  return ratios.reduce((a, b) => a + b, 0) / ratios.length
}

function round(value: number, precision = 3): number {
  const scale = Math.pow(10, precision)
  return Math.round(value * scale) / scale
}

function diffTokenValues(
  a: ResolvedTheme,
  b: ResolvedTheme
): Array<{ token: string; before: string; after: string }> {
  const aTokens = flattenResolvedTheme(a)
  const bTokens = flattenResolvedTheme(b)
  const keys = Array.from(new Set([...Object.keys(aTokens), ...Object.keys(bTokens)])).sort()

  return keys
    .map(token => ({
      token,
      before: aTokens[token] ?? '',
      after: bTokens[token] ?? '',
    }))
    .filter(entry => entry.before !== entry.after)
}

function calculatePerceptualDiff(
  changes: Array<{ token: string; before: string; after: string }>
): ThemeDiff['perceptualDiff'] {
  const tokens = changes.map(change => ({
    ...change,
    deltaE: round(deltaE(parseColor(change.before), parseColor(change.after))),
  }))
  const total = tokens.reduce((sum, token) => sum + token.deltaE, 0)
  const maxDeltaE = tokens.reduce((max, token) => Math.max(max, token.deltaE), 0)

  return {
    averageDeltaE: tokens.length === 0 ? 0 : round(total / tokens.length),
    maxDeltaE,
    tokens,
  }
}

function calculateContrastImpact(a: ResolvedTheme, b: ResolvedTheme): ThemeDiff['contrastImpact'] {
  const aPairs = getThemeContrastPairs(a)
  const bPairs = getThemeContrastPairs(b)
  const impactedPairs = aPairs.map((pair, index) => {
    const nextPair = bPairs[index] ?? pair
    const before = contrastRatio(parseColor(pair.bg), parseColor(pair.fg))
    const after = contrastRatio(parseColor(nextPair.bg), parseColor(nextPair.fg))
    return {
      pair: pair.label,
      before: round(before, 2),
      after: round(after, 2),
      delta: round(after - before, 2),
    }
  })

  const totalDelta = impactedPairs.reduce((sum, pair) => sum + pair.delta, 0)
  const maxDelta = impactedPairs.reduce((max, pair) => Math.max(max, Math.abs(pair.delta)), 0)

  return {
    averageDelta: impactedPairs.length === 0 ? 0 : round(totalDelta / impactedPairs.length, 2),
    maxDelta: round(maxDelta, 2),
    impactedPairs: impactedPairs.filter(pair => pair.delta !== 0),
  }
}

function semanticImpactScore(
  changedTokenCount: number,
  perceptualDiff: ThemeDiff['perceptualDiff'],
  contrastImpact: ThemeDiff['contrastImpact']
): number {
  const accessibilityPenalty = contrastImpact.impactedPairs
    .filter(pair => pair.delta < 0)
    .reduce((sum, pair) => sum + Math.abs(pair.delta), 0)
  const score = changedTokenCount + perceptualDiff.averageDeltaE * 3 + accessibilityPenalty * 5
  return round(Math.min(100, score), 2)
}

// ---------------------------------------------------------------------------
// Main diff
// ---------------------------------------------------------------------------

export function diffThemes(a: ResolvedTheme, b: ResolvedTheme): ThemeDiff {
  const changes = diffTokenValues(a, b)
  const changedTokens = changes.map(change => change.token)

  const contrastA = averageBodyContrast(a)
  const contrastB = averageBodyContrast(b)
  const contrastDiff = Math.round((contrastB - contrastA) * 100) / 100

  const luminanceA = averageLuminance(a)
  const luminanceB = averageLuminance(b)
  const visualWeightShift = Math.round((luminanceB - luminanceA) * 1000) / 1000
  const perceptualDiff = calculatePerceptualDiff(changes)
  const contrastImpact = calculateContrastImpact(a, b)

  return {
    changedTokens,
    contrastDiff,
    visualWeightShift,
    perceptualDiff,
    contrastImpact,
    semanticImpactScore: semanticImpactScore(changedTokens.length, perceptualDiff, contrastImpact),
  }
}
