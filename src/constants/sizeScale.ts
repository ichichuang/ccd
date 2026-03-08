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
  xs: 0.85, // 12px
  sm: 0.95, // 14px
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
 * 布局尺寸倍率表 (按断点缩放，仅 PC 使用；Mobile/Tablet 固定 1)
 * 布局比字体更保守：xl 起才略放大，大屏逐步加至 1.25
 */
export const LAYOUT_SCALE_RATIOS: Record<SizeScaleKey, number> = {
  xs: 1,
  sm: 1,
  md: 1,
  lg: 1,
  xl: 1.05,
  '2xl': 1.1,
  '3xl': 1.15,
  '4xl': 1.2,
  '5xl': 1.25,
}

/**
 * Loading 动画尺寸映射（vw）
 * 用于 Lottie 等固定像素渲染，与 SizeScaleKey 一一对应
 */
export const LOADING_SIZE_PERCENT: Record<SizeScaleKey, number> = {
  xs: 8, // 内联/按钮旁
  sm: 18, // 小区域
  md: 28, // 中等
  lg: 36, // 页面 loading
  xl: 48, // 大区域
  '2xl': 60, // 全局 loading 偏小
  '3xl': 72, // 全局 loading 推荐
  '4xl': 86, // 大屏/强调
  '5xl': 100, // 全屏/hero
}

/**
 * Loading 动画尺寸（正方形，避免宽高比失真）
 * 与 SizeScaleKey 一一对应；xs～4xl 为固定 px，5xl 为流体 CSS 实现巨型全屏 loader
 */
export const LOADING_SIZE_CSS: Record<SizeScaleKey, number | string> = {
  xs: 32,
  sm: 48,
  md: 64,
  lg: 80,
  xl: 96,
  '2xl': 104,
  '3xl': 112,
  '4xl': 120,
  '5xl': 'min(80vw, 80vh)', // 流体巨型正方形，与 index.html .lottie-preload 一致
}

/**
 * 过渡时长表 (毫秒)
 * 从微交互到慢动画的完整阶梯
 * 遵循 Material Design 动效时长指南
 */
export const TRANSITION_SCALE_VALUES: Record<SizeScaleKey, number> = {
  xs: 180, // 微交互 (hover 高亮)
  sm: 280, // 快速反馈
  md: 320, // 标准过渡
  lg: 420, // 展开/收起
  xl: 480, // 页面过渡
  '2xl': 580, // 复杂动画
  '3xl': 680, // 慢动画
  '4xl': 780, // 强调动画
  '5xl': 880, // 戏剧效果
}
