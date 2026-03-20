import { SIZE_SCALE_KEYS, type SizeScaleKey } from '@/constants/sizeScale'

const VALID_SIZE_SET: ReadonlySet<string> = new Set<string>(SIZE_SCALE_KEYS)

/**
 * Validate the Design Engine "size scale key".
 * Allowed values: `xs` | `sm` | `md` | ... | `5xl`
 */
export function isValidSize(size: string): size is SizeScaleKey {
  return VALID_SIZE_SET.has(size)
}
