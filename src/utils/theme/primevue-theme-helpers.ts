/**
 * PrimeVue主题辅助函数
 * 用于从CCD的CSS变量生成PrimeVue期望的Token结构
 */

/**
 * 从单一CSS变量生成完整的50-950色阶
 * 使用color-mix实现渐变效果
 *
 * @param baseCssVar - CSS变量名 (不含 --)，如 'primary'
 * @param options - 可选配置
 * @returns 包含50-950色阶的对象
 */
export function generateColorScale(
  baseCssVar: string,
  options: {
    /** 是否有hover变体 */
    hasHover?: boolean
    /** 自定义特定档位的映射 */
    customMappings?: Record<number, string>
  } = {}
): Record<number, string> {
  const { hasHover = true, customMappings = {} } = options

  const baseColor = `rgb(var(--${baseCssVar}))`
  const hoverColor = hasHover ? `rgb(var(--${baseCssVar}-hover))` : baseColor

  // 默认色阶映射
  const defaultScale: Record<number, string> = {
    // 极浅色 (mix with white)
    50: `color-mix(in srgb, ${baseColor}, white 92%)`,
    100: `color-mix(in srgb, ${baseColor}, white 80%)`,
    200: `color-mix(in srgb, ${baseColor}, white 60%)`,
    300: `color-mix(in srgb, ${baseColor}, white 40%)`,
    400: `color-mix(in srgb, ${baseColor}, white 20%)`,

    // 主色
    500: baseColor,

    // 深色 (mix with black or use hover)
    600: hoverColor,
    700: `color-mix(in srgb, ${hoverColor}, black 20%)`,
    800: `color-mix(in srgb, ${hoverColor}, black 40%)`,
    900: `color-mix(in srgb, ${hoverColor}, black 60%)`,
    950: `color-mix(in srgb, ${hoverColor}, black 80%)`,
  }

  // 合并自定义映射
  return { ...defaultScale, ...customMappings }
}

/**
 * 生成中性色scale (从background/foreground/muted变量)
 */
export function generateNeutralScale(isDark: boolean = false): Record<number, string> {
  const bgColor = 'rgb(var(--background))'
  const fgColor = 'rgb(var(--foreground))'
  const mutedColor = 'rgb(var(--muted))'
  const mutedFgColor = 'rgb(var(--muted-foreground))'
  const borderColor = 'rgb(var(--border))'

  if (isDark) {
    // 暗色模式: 0是最浅 (白色调) -> using background as base if needed, or keeping explicit logic?
    // User request: No fixed colors. 0 usually implies the lightest possible surface.
    // In dark mode, strict neutral 0 should probably be white, but if "no fixed colors" is the rule:
    return {
      0: 'rgb(var(--background))', // Using background variable instead of #ffffff
      50: `color-mix(in srgb, ${fgColor}, white 20%)`,
      100: fgColor,
      200: mutedFgColor,
      300: borderColor,
      400: `color-mix(in srgb, ${mutedColor}, ${fgColor} 40%)`,
      500: `color-mix(in srgb, ${mutedColor}, ${fgColor} 20%)`,
      600: mutedColor,
      700: `color-mix(in srgb, ${bgColor}, ${fgColor} 20%)`,
      800: `color-mix(in srgb, ${bgColor}, ${fgColor} 10%)`,
      900: `color-mix(in srgb, ${bgColor}, ${fgColor} 5%)`,
      950: bgColor,
    }
  } else {
    // 亮色模式: 0是纯白 -> mapped to background variable
    return {
      0: 'rgb(var(--background))', // Using background variable instead of #ffffff
      50: mutedColor,
      100: `color-mix(in srgb, ${mutedColor}, ${bgColor} 60%)`,
      200: `color-mix(in srgb, ${borderColor}, ${bgColor} 20%)`,
      300: borderColor,
      400: mutedFgColor,
      500: `color-mix(in srgb, ${fgColor}, ${bgColor} 40%)`,
      600: `color-mix(in srgb, ${fgColor}, ${bgColor} 20%)`,
      700: fgColor,
      800: `color-mix(in srgb, ${fgColor}, black 20%)`,
      900: `color-mix(in srgb, ${fgColor}, black 40%)`,
      950: `color-mix(in srgb, ${fgColor}, black 60%)`,
    }
  }
}

/**
 * 生成边框半径scale (从CSS变量)
 */
export function generateBorderRadiusScale(): Record<string, string> {
  return {
    none: '0',
    xs: '2px',
    sm: '4px',
    md: 'var(--radius)',
    lg: 'calc(var(--radius) * 1.5)',
    xl: 'calc(var(--radius) * 2)',
  }
}
