import {
  FONT_SCALE_RATIOS,
  SPACING_SCALE_RATIOS,
  RADIUS_SCALE_RATIOS,
  TRANSITION_SCALE_VALUES,
  SIZE_SCALE_KEYS,
} from '@/constants/sizeScale'

/**
 * 生成系统尺寸 CSS 变量 (含阶梯系统)
 *
 * @param preset - 尺寸预设对象
 * @returns 完整的 SizeCssVars 对象，包含所有尺寸相关的 CSS 变量
 *
 * 生成内容：
 * 1. 基础变量：圆角、间距单位、容器内边距
 * 2. 布局变量：侧边栏、头部、面包屑等尺寸
 * 3. 字体阶梯：xs 到 5xl（基于 fontSizeBase × FONT_SCALE_RATIOS）
 * 4. 间距阶梯：xs 到 5xl（基于 spacingBase × SPACING_SCALE_RATIOS）
 * 5. 圆角阶梯：xs 到 5xl（基于 radius × RADIUS_SCALE_RATIOS）
 * 6. 过渡阶梯：xs 到 5xl（固定毫秒值 TRANSITION_SCALE_VALUES）
 */
export function generateSizeVars(preset: SizePreset): SizeCssVars {
  // 使用 Partial<SizeCssVars> 构建，最后类型断言为完整类型
  const vars: Partial<SizeCssVars> = {
    // --- 基础变量 ---
    '--radius': `${preset.radius}rem`,
    '--spacing-unit': `${preset.spacingBase}px`,
    '--container-padding': `${preset.spacingBase * 5}px`,

    // --- 布局变量 ---
    '--sidebar-width': `${preset.sidebarWidth}px`,
    '--sidebar-collapsed-width': `${preset.sidebarCollapsedWidth}px`,
    '--header-height': `${preset.headerHeight}px`,
    '--breadcrumb-height': `${preset.breadcrumbHeight}px`,
    '--footer-height': `${preset.footerHeight}px`,
    '--tabs-height': `${preset.tabsHeight}px`,
  }

  // --- 生成字体阶梯变量 (xs-5xl) ---
  // 公式: fontSizeBase × FONT_SCALE_RATIOS[key]
  SIZE_SCALE_KEYS.forEach(key => {
    const size = preset.fontSizeBase * FONT_SCALE_RATIOS[key]
    vars[`--font-size-${key}`] = `${size}px`
  })

  // --- 生成间距阶梯变量 (xs-5xl) ---
  // 公式: spacingBase × SPACING_SCALE_RATIOS[key]
  SIZE_SCALE_KEYS.forEach(key => {
    const size = preset.spacingBase * SPACING_SCALE_RATIOS[key]
    vars[`--spacing-${key}`] = `${size}px`
  })

  // --- 生成圆角阶梯变量 (xs-5xl) ---
  // 公式: radius × RADIUS_SCALE_RATIOS[key]
  SIZE_SCALE_KEYS.forEach(key => {
    const size = preset.radius * RADIUS_SCALE_RATIOS[key]
    vars[`--radius-${key}`] = `${size}rem`
  })

  // --- 生成过渡时长阶梯变量 (xs-5xl) ---
  // 直接使用 TRANSITION_SCALE_VALUES 毫秒值
  SIZE_SCALE_KEYS.forEach(key => {
    vars[`--transition-${key}`] = `${TRANSITION_SCALE_VALUES[key]}ms`
  })

  // 类型断言：确保返回完整的 SizeCssVars
  // 由于我们按接口完整构建，这里可以安全断言
  return vars as SizeCssVars
}

/**
 * 将尺寸 CSS 变量应用到文档根元素
 *
 * @param vars - SizeCssVars 对象，包含所有要应用的 CSS 变量
 */
export function applySizeTheme(vars: SizeCssVars) {
  const root = document.documentElement
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value)
  })
}
