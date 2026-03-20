import type { Rule } from 'unocss'
import { parseShadow } from '@/design-engine/parser/parseShadow'
import { isValidColor } from '@/design-engine/validators/colorValidator'
import { isValidSize } from '@/design-engine/validators/sizeValidator'
import { resolveShadow } from '@/design-engine/resolvers/shadowResolver'

/**
 * UnoCSS Rule:
 * - Match: `shadow-(size)-(color?)`
 * - Pipeline: parse -> validate(size/color) -> resolve(uno class string)
 */
export const shadowRule: Rule = [
  /^shadow-(.+)$/,
  (match: RegExpMatchArray) => {
    const parsed = parseShadow(match[0] ?? '')
    if (!parsed) return

    if (!isValidSize(parsed.size)) return
    if (parsed.color && !isValidColor(parsed.color)) return

    return resolveShadow(parsed) ?? undefined
  },
]
