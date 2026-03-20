import type { Rule } from 'unocss'
import { parseBorder } from '@/design-engine/parser/parseBorder'
import { isValidColor } from '@/design-engine/validators/colorValidator'
import { isValidSize } from '@/design-engine/validators/sizeValidator'
import { resolveBorder } from '@/design-engine/resolvers/borderResolver'

/**
 * UnoCSS Rule:
 * - Match: `border-(dir?)-(size)-(color)/(opacity?)`
 * - Pipeline: parse -> validate(size/color) -> resolve(uno class string)
 */
export const borderRule: Rule = [
  /^border-(.+)$/,
  (match: RegExpMatchArray) => {
    const parsed = parseBorder(match[0] ?? '')
    if (!parsed) return

    if (!isValidSize(parsed.size)) return
    if (!isValidColor(parsed.color)) return

    const resolved = resolveBorder(parsed)
    return resolved ?? undefined
  },
]
