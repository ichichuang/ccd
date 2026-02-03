/* eslint-disable @typescript-eslint/naming-convention */
// src/constants/sizeScale.ts

/**
 * 尺寸阶梯键名定义 (xs -> 5xl)
 * 保持与 Breakpoints 命名一致，降低心智负担
 */
export const SIZE_SCALE_KEYS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const
export type SizeScaleKey = (typeof SIZE_SCALE_KEYS)[number]

/**
 * 字体大小倍率表 (相对于 --font-size-base)
 * 假设 base (md) = 1rem (16px)
 * 遵循 Minor Third (1.2) 或 Major Third (1.25) 调性
 */
export const FONT_SCALE_RATIOS: Record<SizeScaleKey, number> = {
  xs: 0.75, // 12px
  sm: 0.875, // 14px
  md: 1, // 16px (Base)
  lg: 1.125, // 18px
  xl: 1.25, // 20px
  '2xl': 1.5, // 24px
  '3xl': 1.875, // 30px
  '4xl': 2.25, // 36px
  '5xl': 3, // 48px
}

/**
 * 间距倍率表 (相对于 --spacing-unit)
 * 假设 unit = 4px
 * 遵循 8pt Grid System
 */
export const SPACING_SCALE_RATIOS: Record<SizeScaleKey, number> = {
  xs: 1, // 4px (1 unit)
  sm: 2, // 8px
  md: 4, // 16px (Standard Gap)
  lg: 6, // 24px
  xl: 8, // 32px
  '2xl': 12, // 48px
  '3xl': 16, // 64px
  '4xl': 24, // 96px
  '5xl': 32, // 128px
}

/**
 * 圆角倍率表 (相对于 SizePreset.radius，对应 --radius-md 的基准值)
 * 假设 base (md) = 0.5rem (8px)
 * 从微圆角到全圆角的完整阶梯
 */
export const RADIUS_SCALE_RATIOS: Record<SizeScaleKey, number> = {
  xs: 0.25, // 2px
  sm: 0.5, // 4px
  md: 1, // 8px (Base)
  lg: 1.5, // 12px
  xl: 2, // 16px
  '2xl': 3, // 24px
  '3xl': 4, // 32px
  '4xl': 5, // 40px
  '5xl': 6, // 48px (接近全圆)
}

/**
 * 过渡时长表 (毫秒)
 * 从微交互到慢动画的完整阶梯
 * 遵循 Material Design 动效时长指南
 */
export const TRANSITION_SCALE_VALUES: Record<SizeScaleKey, number> = {
  xs: 75, // 微交互 (hover 高亮)
  sm: 150, // 快速反馈
  md: 200, // 标准过渡
  lg: 300, // 展开/收起
  xl: 400, // 页面过渡
  '2xl': 500, // 复杂动画
  '3xl': 700, // 慢动画
  '4xl': 1000, // 强调动画
  '5xl': 1500, // 戏剧效果
}
