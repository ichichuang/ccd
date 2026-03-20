import { VALID_COLORS } from '@/design-engine/tokens/colorTokens'

/**
 * Validate UnoCSS "color suffix" tokens.
 * Example accepted values: `primary`, `accent-foreground`, `sidebar-border`
 */
export function isValidColor(color: string): boolean {
  return VALID_COLORS.has(color)
}
