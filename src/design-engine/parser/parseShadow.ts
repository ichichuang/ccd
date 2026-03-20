export interface ParsedShadow {
  size: string
  color?: string
}

/**
 * Parser (Lexer):
 * Parse `shadow-(size)-(color?)` into a structured object.
 *
 * IMPORTANT:
 * - Do NOT validate size/color here. Only parse the shape.
 * - Validation happens later in `shadowRule` via dedicated validators.
 */
export function parseShadow(input: string): ParsedShadow | null {
  const match = input.match(/^shadow-(?<size>[a-z0-9]+)(?:-(?<color>[a-z][a-z0-9-]*))?$/i)
  if (!match?.groups) return null

  const { size, color } = match.groups as { size?: string; color?: string }
  if (!size) return null

  return {
    size,
    color: color ? color : undefined,
  }
}
