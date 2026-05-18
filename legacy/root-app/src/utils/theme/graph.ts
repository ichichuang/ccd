/**
 * Theme Engine v5 — Debuggable Token Graph
 */

import type { ResolvedColorFamily, ResolvedTheme } from './resolver'

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

interface TokenGraphEntry {
  token: string
  value: string
  source: TokenNodeSource
  dependencies: string[]
}

function hasToken(value: string | undefined): boolean {
  return value !== undefined && value.length > 0
}

function explicitSource(isExplicit: boolean, fallbackSource: TokenNodeSource): TokenNodeSource {
  return isExplicit ? 'base' : fallbackSource
}

function colorFamilyEntries(
  prefix: string,
  family: ResolvedColorFamily,
  config: Partial<ColorTokenState> | undefined,
  baseSource: TokenNodeSource,
  baseDependencies: string[]
): TokenGraphEntry[] {
  const baseToken = `${prefix}.base`
  const hoverToken = `${prefix}.hover`
  const lightToken = `${prefix}.light`

  return [
    {
      token: baseToken,
      value: family.base,
      source: baseSource,
      dependencies: baseDependencies,
    },
    {
      token: `${prefix}.foreground`,
      value: family.foreground,
      source: explicitSource(hasToken(config?.foreground), 'derived'),
      dependencies: [baseToken, 'foreground'],
    },
    {
      token: hoverToken,
      value: family.hover,
      source: explicitSource(hasToken(config?.hover), 'derived'),
      dependencies: [baseToken],
    },
    {
      token: `${prefix}.hoverForeground`,
      value: family.hoverForeground,
      source: 'derived',
      dependencies: [hoverToken, 'foreground'],
    },
    {
      token: lightToken,
      value: family.light,
      source: explicitSource(hasToken(config?.light), 'derived'),
      dependencies: [baseToken, 'background'],
    },
    {
      token: `${prefix}.lightForeground`,
      value: family.lightForeground,
      source: explicitSource(hasToken(config?.lightForeground), 'derived'),
      dependencies: [lightToken, baseToken],
    },
  ]
}

function createTokenGraph(entries: TokenGraphEntry[]): TokenGraph {
  const sortedEntries = [...entries].sort((a, b) => a.token.localeCompare(b.token))
  const nodes: Record<string, TokenNode> = {}
  const edges: Array<{ from: string; to: string }> = []

  for (const entry of sortedEntries) {
    nodes[entry.token] = {
      value: entry.value,
      source: entry.source,
      dependencies: [...entry.dependencies].sort(),
    }
  }

  for (const entry of sortedEntries) {
    for (const dependency of entry.dependencies) {
      if (nodes[dependency]) {
        edges.push({ from: dependency, to: entry.token })
      }
    }
  }

  edges.sort((a, b) => `${a.from}:${a.to}`.localeCompare(`${b.from}:${b.to}`))
  assertAcyclic(nodes, edges)

  return { nodes, edges }
}

function assertAcyclic(
  nodes: Record<string, TokenNode>,
  edges: Array<{ from: string; to: string }>
): void {
  const state: Record<string, 0 | 1 | 2> = {}
  const adjacency: Record<string, string[]> = {}

  for (const key of Object.keys(nodes)) {
    state[key] = 0
    adjacency[key] = []
  }

  for (const edge of edges) {
    adjacency[edge.from]?.push(edge.to)
  }

  const visit = (token: string, trail: string[]): void => {
    if (state[token] === 1) {
      throw new Error(`[theme graph] circular dependency: ${[...trail, token].join(' -> ')}`)
    }
    if (state[token] === 2) return

    state[token] = 1
    for (const next of adjacency[token] ?? []) {
      visit(next, [...trail, token])
    }
    state[token] = 2
  }

  for (const token of Object.keys(nodes)) {
    visit(token, [])
  }
}

export function buildTokenGraph(resolved: ResolvedTheme, config: ThemeModeConfig): TokenGraph {
  const primarySource: TokenNodeSource = hasToken(config.primary?.default) ? 'base' : 'fallback'
  const accentSource: TokenNodeSource = hasToken(config.accent?.default) ? 'base' : 'derived'

  return createTokenGraph([
    {
      token: 'background',
      value: resolved.background,
      source: explicitSource(hasToken(config.background), 'fallback'),
      dependencies: [],
    },
    {
      token: 'foreground',
      value: resolved.foreground,
      source: explicitSource(hasToken(config.foreground), 'derived'),
      dependencies: ['background'],
    },
    {
      token: 'card',
      value: resolved.card,
      source: explicitSource(hasToken(config.neutral?.bg), 'derived'),
      dependencies: ['background'],
    },
    {
      token: 'cardForeground',
      value: resolved.cardForeground,
      source: explicitSource(hasToken(config.neutral?.foreground), 'derived'),
      dependencies: ['card', 'foreground'],
    },
    {
      token: 'popover',
      value: resolved.card,
      source: 'derived',
      dependencies: ['card'],
    },
    {
      token: 'popoverForeground',
      value: resolved.cardForeground,
      source: 'derived',
      dependencies: ['cardForeground'],
    },
    ...colorFamilyEntries('primary', resolved.primary, config.primary, primarySource, []),
    ...colorFamilyEntries('accent', resolved.accent, config.accent, accentSource, ['primary.base']),
    ...colorFamilyEntries(
      'danger',
      resolved.danger,
      config.danger,
      explicitSource(hasToken(config.danger?.default), 'fallback'),
      []
    ),
    ...colorFamilyEntries(
      'warn',
      resolved.warn,
      config.warn,
      explicitSource(hasToken(config.warn?.default), 'fallback'),
      []
    ),
    ...colorFamilyEntries(
      'success',
      resolved.success,
      config.success,
      explicitSource(hasToken(config.success?.default), 'fallback'),
      []
    ),
    ...colorFamilyEntries(
      'info',
      resolved.info,
      config.info,
      explicitSource(hasToken(config.info?.default), 'fallback'),
      []
    ),
    ...colorFamilyEntries(
      'help',
      resolved.help,
      config.help,
      explicitSource(hasToken(config.help?.default), 'fallback'),
      []
    ),
    {
      token: 'secondary.base',
      value: resolved.secondary.base,
      source: explicitSource(hasToken(config.secondary), 'derived'),
      dependencies: ['card'],
    },
    {
      token: 'secondary.foreground',
      value: resolved.secondary.foreground,
      source: explicitSource(
        hasToken(config.secondaryForeground) || hasToken(config.neutral?.secondaryForeground),
        'derived'
      ),
      dependencies: ['secondary.base', 'cardForeground'],
    },
    {
      token: 'muted.base',
      value: resolved.muted.base,
      source: explicitSource(hasToken(config.muted), 'derived'),
      dependencies: ['card'],
    },
    {
      token: 'muted.foreground',
      value: resolved.muted.foreground,
      source: explicitSource(
        hasToken(config.mutedForeground) || hasToken(config.neutral?.mutedForeground),
        'derived'
      ),
      dependencies: ['muted.base'],
    },
    {
      token: 'border',
      value: resolved.border,
      source: explicitSource(hasToken(config.border) || hasToken(config.neutral?.base), 'fallback'),
      dependencies: [],
    },
    {
      token: 'input',
      value: resolved.input,
      source: explicitSource(hasToken(config.input), 'derived'),
      dependencies: ['border'],
    },
    {
      token: 'ring',
      value: resolved.ring,
      source: explicitSource(hasToken(config.ring), 'derived'),
      dependencies: ['primary.base'],
    },
    {
      token: 'sidebar.background',
      value: resolved.sidebar.background,
      source: explicitSource(hasToken(config.sidebar?.background), 'derived'),
      dependencies: ['card'],
    },
    {
      token: 'sidebar.foreground',
      value: resolved.sidebar.foreground,
      source: explicitSource(hasToken(config.sidebar?.foreground), 'derived'),
      dependencies: ['sidebar.background', 'foreground'],
    },
    {
      token: 'sidebar.primary',
      value: resolved.sidebar.primary,
      source: explicitSource(hasToken(config.sidebar?.primary), 'derived'),
      dependencies: ['primary.base'],
    },
    {
      token: 'sidebar.primaryForeground',
      value: resolved.sidebar.primaryForeground,
      source: explicitSource(hasToken(config.sidebar?.primaryForeground), 'derived'),
      dependencies: ['sidebar.primary', 'foreground'],
    },
    {
      token: 'sidebar.accent',
      value: resolved.sidebar.accent,
      source: explicitSource(hasToken(config.sidebar?.accent), 'derived'),
      dependencies: ['accent.base'],
    },
    {
      token: 'sidebar.accentForeground',
      value: resolved.sidebar.accentForeground,
      source: explicitSource(hasToken(config.sidebar?.accentForeground), 'derived'),
      dependencies: ['sidebar.accent', 'foreground'],
    },
    {
      token: 'sidebar.border',
      value: resolved.sidebar.border,
      source: explicitSource(hasToken(config.sidebar?.border), 'derived'),
      dependencies: ['border'],
    },
    {
      token: 'sidebar.ring',
      value: resolved.sidebar.ring,
      source: explicitSource(hasToken(config.sidebar?.ring), 'derived'),
      dependencies: ['accent.base'],
    },
  ])
}
