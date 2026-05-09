/**
 * Theme Engine v5 — Deterministic Fingerprinting
 */

import type { ResolvedTheme } from './resolver'
import { flattenResolvedTheme } from './tokens'

function stableSerializeRecord(record: Record<string, string>): string {
  return Object.keys(record)
    .sort()
    .map(key => `${key}:${record[key]}`)
    .join('|')
}

function fnv1a(input: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export function fingerprintTheme(theme: ResolvedTheme): string {
  return `theme-${fnv1a(stableSerializeRecord(flattenResolvedTheme(theme)))}`
}
