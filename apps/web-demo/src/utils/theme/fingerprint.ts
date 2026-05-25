/**
 * Theme Engine v5 — Deterministic Fingerprinting
 */

import { fnv1a, stableSerializeRecord } from '@ccd/shared-utils'
import type { ResolvedTheme } from './resolver'
import { flattenResolvedTheme } from './tokens'

export function fingerprintTheme(theme: ResolvedTheme): string {
  return `theme-${fnv1a(stableSerializeRecord(flattenResolvedTheme(theme)))}`
}
