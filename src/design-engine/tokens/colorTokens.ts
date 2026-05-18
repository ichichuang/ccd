import { COLOR_FAMILIES } from '../../utils/theme/metadata'

/**
 * Color token constraints for the Design Engine.
 *
 * These are the valid "color suffix" names used by UnoCSS classes like:
 * - `bg-primary`
 * - `border-primary/50`
 * - `bg-sidebar-primary`
 *
 * Note: We validate only the suffix part (no `border-` / `bg-` prefix and no `/opacity`).
 */
export const VALID_COLORS: Set<string> = new Set<string>()

// Single tokens (direct CSS vars)
for (const token of COLOR_FAMILIES.singleTokens) {
  VALID_COLORS.add(token)
}

// Pair families: DEFAULT + foreground
for (const family of COLOR_FAMILIES.pairFamilies) {
  VALID_COLORS.add(family)
  VALID_COLORS.add(`${family}-foreground`)
}

// Quad families: DEFAULT + foreground + hover + hover-foreground + light + light-foreground
for (const family of COLOR_FAMILIES.quadFamilies) {
  VALID_COLORS.add(family)
  VALID_COLORS.add(`${family}-foreground`)
  VALID_COLORS.add(`${family}-hover`)
  VALID_COLORS.add(`${family}-hover-foreground`)
  VALID_COLORS.add(`${family}-light`)
  VALID_COLORS.add(`${family}-light-foreground`)
}

// Sidebar utility keys (align with `theme.colors.sidebar` exposed UnoCSS keys)
VALID_COLORS.add('sidebar') // Maps to sidebar.DEFAULT
VALID_COLORS.add('sidebar-foreground')
VALID_COLORS.add('sidebar-primary')
VALID_COLORS.add('sidebar-primary-foreground')
VALID_COLORS.add('sidebar-accent')
VALID_COLORS.add('sidebar-accent-foreground')
VALID_COLORS.add('sidebar-border')
VALID_COLORS.add('sidebar-ring')
