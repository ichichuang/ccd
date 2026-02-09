import { useSizeStore } from '@/stores/modules/size'

export interface ChartSystemVariables {
  // 颜色变量（已从 ThemeEngine 生成到 CSS 变量）
  textColor100: string
  textColor200: string
  bgColor200: string
  bgColor300: string
  accent100: string
  primaryColor: string
  successColor: string
  infoColor: string
  warnColor: string
  dangerColor: string
  helpColor: string
  contrastColor: string
  secondaryColor: string

  // 尺寸变量（来自 SizeStore）
  fontSize: number
  fontSizeSmall: number
  paddings: number
  gap: number
  gapl: number
}

const getRootStyle = () => {
  if (typeof window === 'undefined') return null
  return getComputedStyle(document.documentElement)
}

const getCssRgbColor = (token: string): string => {
  const style = getRootStyle()
  if (!style) return ''
  const raw = style.getPropertyValue(`--${token}`).trim()
  if (!raw) return ''
  // ThemeEngine 以 "r g b" 形式写入，图表侧使用标准 rgb() 字符串
  return `rgb(${raw})`
}

/**
 * 统一抽取图表所需的系统级变量
 *
 * 颜色从 ThemeEngine 写入的 CSS 变量中读取；
 * 尺寸从 SizeStore 中读取，保持与全局 Size 系统一致。
 */
export function getChartSystemVariables(): ChartSystemVariables {
  const sizeStore = useSizeStore()

  return {
    // 颜色：根据当前主题 CSS 变量解析
    textColor100: getCssRgbColor('foreground'),
    textColor200: getCssRgbColor('muted-foreground'),
    bgColor200: getCssRgbColor('background'),
    bgColor300: getCssRgbColor('card'),
    accent100: getCssRgbColor('accent'),
    primaryColor: getCssRgbColor('primary'),
    successColor: getCssRgbColor('success'),
    infoColor: getCssRgbColor('info'),
    warnColor: getCssRgbColor('warn'),
    dangerColor: getCssRgbColor('destructive'),
    helpColor: getCssRgbColor('accent'),
    contrastColor: getCssRgbColor('foreground'),
    secondaryColor: getCssRgbColor('secondary'),

    // 尺寸：来自 SizeStore，与全局尺寸阶梯一致（md=基准，sm=小号）
    fontSize: sizeStore.getFontSizeValue,
    fontSizeSmall: sizeStore.getFontSizeSmValue,
    paddings: sizeStore.getPaddingsValue,
    gap: sizeStore.getGap,
    gapl: sizeStore.getGapl,
  }
}

/**
 * 生成图表用调色盘
 *
 * - 优先使用语义颜色：primary / accent / secondary / success / warn / danger / info / contrast
 * - 其次使用 Light 变体：primary-light / accent-light / success-light / warn-light / destructive-light
 * - 当 count 大于可用颜色数量时，循环复用，保证长度满足要求
 */
export function generateChartPalette(baseColor: string, count: number): string[] {
  const vars = getChartSystemVariables()

  const primaryLight = getCssRgbColor('primary-light')
  const accentLight = getCssRgbColor('accent-light')
  const successLight = getCssRgbColor('success-light')
  const warnLight = getCssRgbColor('warn-light')
  const dangerLight = getCssRgbColor('destructive-light')

  const basePalette: string[] = [
    baseColor || vars.primaryColor,
    vars.accent100,
    vars.secondaryColor,
    vars.successColor,
    vars.warnColor,
    vars.dangerColor,
    vars.infoColor,
    vars.helpColor,
    vars.contrastColor,
    primaryLight,
    accentLight,
    successLight,
    warnLight,
    dangerLight,
  ]

  // 去重并过滤空值，保证颜色语义明确
  const unique = Array.from(new Set(basePalette.filter(Boolean)))

  if (unique.length === 0) {
    return []
  }

  if (count <= unique.length) {
    return unique.slice(0, count)
  }

  const result: string[] = []
  for (let i = 0; i < count; i++) {
    result.push(unique[i % unique.length])
  }
  return result
}
