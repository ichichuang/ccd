/**
 * Theme Engine v5 — Stable Token Utilities
 */

import type { ResolvedTheme } from './resolver'

export type ThemeTokenRecord = Record<string, string>

export interface ThemeTokensByLayer {
  base: ThemeTokenRecord
  semantic: ThemeTokenRecord
  state: ThemeTokenRecord
  sidebar: ThemeTokenRecord
}

export const RESOLVED_THEME_TOKEN_KEYS = [
  'background',
  'foreground',
  'card',
  'cardForeground',
  'popover',
  'popoverForeground',
  'primary.base',
  'primary.foreground',
  'primary.hover',
  'primary.hoverForeground',
  'primary.light',
  'primary.lightForeground',
  'accent.base',
  'accent.foreground',
  'accent.hover',
  'accent.hoverForeground',
  'accent.light',
  'accent.lightForeground',
  'secondary.base',
  'secondary.foreground',
  'muted.base',
  'muted.foreground',
  'danger.base',
  'danger.foreground',
  'danger.hover',
  'danger.hoverForeground',
  'danger.light',
  'danger.lightForeground',
  'warn.base',
  'warn.foreground',
  'warn.hover',
  'warn.hoverForeground',
  'warn.light',
  'warn.lightForeground',
  'success.base',
  'success.foreground',
  'success.hover',
  'success.hoverForeground',
  'success.light',
  'success.lightForeground',
  'info.base',
  'info.foreground',
  'info.hover',
  'info.hoverForeground',
  'info.light',
  'info.lightForeground',
  'help.base',
  'help.foreground',
  'help.hover',
  'help.hoverForeground',
  'help.light',
  'help.lightForeground',
  'border',
  'input',
  'ring',
  'sidebar.background',
  'sidebar.foreground',
  'sidebar.primary',
  'sidebar.primaryForeground',
  'sidebar.accent',
  'sidebar.accentForeground',
  'sidebar.border',
  'sidebar.ring',
] as const

function addFamilyTokens(
  record: ThemeTokenRecord,
  prefix: string,
  family: ResolvedTheme['primary']
): void {
  record[`${prefix}.base`] = family.base
  record[`${prefix}.foreground`] = family.foreground
  record[`${prefix}.hover`] = family.hover
  record[`${prefix}.hoverForeground`] = family.hoverForeground
  record[`${prefix}.light`] = family.light
  record[`${prefix}.lightForeground`] = family.lightForeground
}

function createTokenRecord(entries: Array<[string, string]>): ThemeTokenRecord {
  const record: ThemeTokenRecord = {}
  for (const [key, value] of entries) {
    record[key] = value
  }
  return record
}

export function flattenResolvedTheme(theme: ResolvedTheme): ThemeTokenRecord {
  const tokens = createTokenRecord([
    ['background', theme.background],
    ['foreground', theme.foreground],
    ['card', theme.card],
    ['cardForeground', theme.cardForeground],
    ['popover', theme.card],
    ['popoverForeground', theme.cardForeground],
    ['secondary.base', theme.secondary.base],
    ['secondary.foreground', theme.secondary.foreground],
    ['muted.base', theme.muted.base],
    ['muted.foreground', theme.muted.foreground],
    ['border', theme.border],
    ['input', theme.input],
    ['ring', theme.ring],
    ['sidebar.background', theme.sidebar.background],
    ['sidebar.foreground', theme.sidebar.foreground],
    ['sidebar.primary', theme.sidebar.primary],
    ['sidebar.primaryForeground', theme.sidebar.primaryForeground],
    ['sidebar.accent', theme.sidebar.accent],
    ['sidebar.accentForeground', theme.sidebar.accentForeground],
    ['sidebar.border', theme.sidebar.border],
    ['sidebar.ring', theme.sidebar.ring],
  ])

  addFamilyTokens(tokens, 'primary', theme.primary)
  addFamilyTokens(tokens, 'accent', theme.accent)
  addFamilyTokens(tokens, 'danger', theme.danger)
  addFamilyTokens(tokens, 'warn', theme.warn)
  addFamilyTokens(tokens, 'success', theme.success)
  addFamilyTokens(tokens, 'info', theme.info)
  addFamilyTokens(tokens, 'help', theme.help)

  return Object.fromEntries(RESOLVED_THEME_TOKEN_KEYS.map(key => [key, tokens[key]]))
}

export function getTokensByLayer(theme: ResolvedTheme): ThemeTokensByLayer {
  return {
    base: createTokenRecord([
      ['background', theme.background],
      ['foreground', theme.foreground],
      ['card', theme.card],
      ['cardForeground', theme.cardForeground],
      ['border', theme.border],
      ['input', theme.input],
      ['ring', theme.ring],
    ]),
    semantic: createTokenRecord([
      ['primary.base', theme.primary.base],
      ['primary.foreground', theme.primary.foreground],
      ['accent.base', theme.accent.base],
      ['accent.foreground', theme.accent.foreground],
      ['secondary.base', theme.secondary.base],
      ['secondary.foreground', theme.secondary.foreground],
      ['muted.base', theme.muted.base],
      ['muted.foreground', theme.muted.foreground],
      ['danger.base', theme.danger.base],
      ['danger.foreground', theme.danger.foreground],
      ['warn.base', theme.warn.base],
      ['warn.foreground', theme.warn.foreground],
      ['success.base', theme.success.base],
      ['success.foreground', theme.success.foreground],
      ['info.base', theme.info.base],
      ['info.foreground', theme.info.foreground],
      ['help.base', theme.help.base],
      ['help.foreground', theme.help.foreground],
    ]),
    state: createTokenRecord([
      ['primary.hover', theme.primary.hover],
      ['primary.hoverForeground', theme.primary.hoverForeground],
      ['primary.light', theme.primary.light],
      ['primary.lightForeground', theme.primary.lightForeground],
      ['accent.hover', theme.accent.hover],
      ['accent.hoverForeground', theme.accent.hoverForeground],
      ['accent.light', theme.accent.light],
      ['accent.lightForeground', theme.accent.lightForeground],
      ['danger.hover', theme.danger.hover],
      ['danger.hoverForeground', theme.danger.hoverForeground],
      ['danger.light', theme.danger.light],
      ['danger.lightForeground', theme.danger.lightForeground],
      ['warn.hover', theme.warn.hover],
      ['warn.hoverForeground', theme.warn.hoverForeground],
      ['warn.light', theme.warn.light],
      ['warn.lightForeground', theme.warn.lightForeground],
      ['success.hover', theme.success.hover],
      ['success.hoverForeground', theme.success.hoverForeground],
      ['success.light', theme.success.light],
      ['success.lightForeground', theme.success.lightForeground],
      ['info.hover', theme.info.hover],
      ['info.hoverForeground', theme.info.hoverForeground],
      ['info.light', theme.info.light],
      ['info.lightForeground', theme.info.lightForeground],
      ['help.hover', theme.help.hover],
      ['help.hoverForeground', theme.help.hoverForeground],
      ['help.light', theme.help.light],
      ['help.lightForeground', theme.help.lightForeground],
    ]),
    sidebar: createTokenRecord([
      ['sidebar.background', theme.sidebar.background],
      ['sidebar.foreground', theme.sidebar.foreground],
      ['sidebar.primary', theme.sidebar.primary],
      ['sidebar.primaryForeground', theme.sidebar.primaryForeground],
      ['sidebar.accent', theme.sidebar.accent],
      ['sidebar.accentForeground', theme.sidebar.accentForeground],
      ['sidebar.border', theme.sidebar.border],
      ['sidebar.ring', theme.sidebar.ring],
    ]),
  }
}
