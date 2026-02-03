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
 * 生成边框半径scale (从 SizeCssVars)
 * 完全对齐架构的 size.d.ts SizeCssVars 定义
 */
export function generateBorderRadiusScale(): Record<string, string> {
  return {
    none: '0',
    xs: 'var(--radius-xs)', // SizeCssVars['--radius-xs']
    sm: 'var(--radius-sm)', // SizeCssVars['--radius-sm']
    md: 'var(--radius-md)', // SizeCssVars['--radius-md'] (基准)
    lg: 'var(--radius-lg)', // SizeCssVars['--radius-lg']
    xl: 'var(--radius-xl)', // SizeCssVars['--radius-xl']
  }
}
