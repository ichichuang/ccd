import type { SizeScaleKey } from '@/constants/sizeScale'
import type { ParsedBorder } from '@/design-engine/parser/parseBorder'

/**
 * BORDER_SIZE_MAP:
 * - xs/sm -> ''  (use UnoCSS `border` / `border-t` width=1 semantic)
 * - md/lg -> '2'
 * - xl/2xl -> '4'
 * - 3xl/4xl/5xl -> '8'
 */
export const BORDER_SIZE_MAP: Record<SizeScaleKey, '' | '2' | '4' | '8'> = {
  xs: '',
  sm: '',
  md: '2',
  lg: '2',
  xl: '4',
  ['2xl']: '4',
  ['3xl']: '8',
  ['4xl']: '8',
  ['5xl']: '8',
}

export function resolveBorder(parsedData: ParsedBorder): string | null {
  const widthMap: Record<string, '' | '2' | '4' | '8'> = BORDER_SIZE_MAP
  const borderWidth = widthMap[parsedData.size]
  if (borderWidth === undefined) return null

  const direction = parsedData.direction
  const widthClass = !direction
    ? borderWidth
      ? `border-${borderWidth}`
      : 'border'
    : borderWidth
      ? `border-${direction}-${borderWidth}`
      : `border-${direction}`

  const opacitySuffix = parsedData.opacity ? `/${parsedData.opacity}` : ''
  const colorClass = `border-${parsedData.color}${opacitySuffix}`

  // Example:
  // border-t-2 border-solid border-primary/50
  return `${widthClass} border-solid ${colorClass}`
}
