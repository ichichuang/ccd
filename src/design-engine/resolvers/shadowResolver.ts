import type { SizeScaleKey } from '@/constants/sizeScale'
import type { ParsedShadow } from '@/design-engine/parser/parseShadow'

/**
 * SHADOW_SIZE_MAP:
 * - xs/sm -> sm
 * - md -> md
 * - lg -> lg
 * - xl -> xl
 * - 2xl+ -> 2xl
 */
export const SHADOW_SIZE_MAP: Record<SizeScaleKey, 'sm' | 'md' | 'lg' | 'xl' | '2xl'> = {
  xs: 'sm',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
  ['2xl']: '2xl',
  ['3xl']: '2xl',
  ['4xl']: '2xl',
  ['5xl']: '2xl',
}

export function resolveShadow(parsedData: ParsedShadow): string | null {
  const sizeMapped = SHADOW_SIZE_MAP[parsedData.size as SizeScaleKey]
  if (!sizeMapped) return null

  const sizeClass = `shadow-${sizeMapped}`
  const color = parsedData.color
  if (!color) return sizeClass

  return `${sizeClass} shadow-${color}`
}
