export type BorderDirection = 't' | 'b' | 'l' | 'r' | 'x' | 'y' | 'tl' | 'tr' | 'bl' | 'br'

export interface ParsedBorder {
  direction?: BorderDirection
  size: string
  color: string
  opacity?: string
}

/**
 * Parser (Lexer):
 * Parse `border-(dir?)-(size)-(color)/(opacity?)` into a structured object.
 *
 * IMPORTANT:
 * - Do NOT validate size/color here. Only parse the shape.
 * - Validation happens later in `borderRule` via dedicated validators.
 */
export function parseBorder(input: string): ParsedBorder | null {
  const match = input.match(
    /^border-(?:(?<direction>t|b|l|r|x|y|tl|tr|bl|br)-)?(?<size>[a-z0-9]+)-(?<color>[a-z][a-z0-9-]*)(?:\/(?<opacity>\d{1,3}))?$/i
  )

  if (!match?.groups) return null

  const { direction, size, color, opacity } = match.groups as {
    direction?: string
    size?: string
    color?: string
    opacity?: string
  }

  if (!size || !color) return null

  return {
    direction: direction ? (direction as BorderDirection) : undefined,
    size,
    color,
    opacity,
  }
}
