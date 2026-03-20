import type { Rule, UserShortcuts } from 'unocss'
import { borderRule } from '@/design-engine/rules/borderRule'
import { semanticShortcuts } from '@/design-engine/shortcuts/semanticShortcuts'

// UnoCSS adapter layer for the Design Engine.
export const rules: Rule[] = [borderRule]

/**
 * UnoCSS supports `shortcuts` as a "UserShortcuts" list:
 * - first entry: an object of static shortcuts
 * - (dynamic regex shortcuts live elsewhere; in this phase we only generate borders via `rules`)
 */
export const shortcuts: UserShortcuts = [semanticShortcuts]
