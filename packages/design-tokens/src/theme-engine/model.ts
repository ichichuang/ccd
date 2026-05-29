import type { ThemeMode } from '../types.js'

export type TokenNodeSource = 'base' | 'derived' | 'fallback'

export interface TokenNode {
  value: string
  source: TokenNodeSource
  dependencies: string[]
}

export interface TokenGraph {
  nodes: Record<string, TokenNode>
  edges: Array<{ from: string; to: string }>
}

export interface ResolvedColorFamily {
  base: string
  foreground: string
  hover: string
  hoverForeground: string
  light: string
  lightForeground: string
}

export interface ResolvedSidebar {
  background: string
  foreground: string
  primary: string
  primaryForeground: string
  accent: string
  accentForeground: string
  border: string
  ring: string
}

export interface ResolvedTheme {
  background: string
  foreground: string
  card: string
  cardForeground: string
  primary: ResolvedColorFamily
  accent: ResolvedColorFamily
  secondary: { base: string; foreground: string }
  muted: { base: string; foreground: string }
  danger: ResolvedColorFamily
  warn: ResolvedColorFamily
  success: ResolvedColorFamily
  info: ResolvedColorFamily
  help: ResolvedColorFamily
  border: string
  input: string
  ring: string
  sidebar: ResolvedSidebar
  graph?: TokenGraph
}

export interface ThemeResolutionOptions {
  preset?: string
  mode?: ThemeMode
}

export interface ThemeResolutionResult {
  theme: ResolvedTheme
  graph: TokenGraph
}
