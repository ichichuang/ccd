import type { Rule, UserShortcuts } from 'unocss'
import { borderRule } from '@/design-engine/rules/borderRule'
import { semanticShortcuts } from '@/design-engine/shortcuts/semanticShortcuts'
import { shadowRule } from '@/design-engine/rules/shadowRule'

// UnoCSS adapter layer for the Design Engine.
export const rules: Rule[] = [borderRule, shadowRule]

/**
 * UnoCSS supports `shortcuts` as a "UserShortcuts" list:
 * - first entry: an object of static shortcuts
 * - (dynamic regex shortcuts live elsewhere; in this phase we only generate borders via `rules`)
 */
export const shortcuts: UserShortcuts = [semanticShortcuts]
