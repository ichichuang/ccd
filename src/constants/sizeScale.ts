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
 * 实际像素由 sizeEngine：`round(fontSizeBase × ratio)`（见 comfortable 预设 fontSizeBase=16）
 * 大档位阶梯近似 Minor Third (1.2) / Major Third (1.25)，xs–lg 为 UI 可读性做了压缩与微调
 */
export const FONT_SCALE_RATIOS: Record<SizeScaleKey, number> = {
  xs: 0.82, // round → 13px @16
  sm: 0.96, // round → 15px @16
  md: 1, // 16px (Base @16)
  lg: 1.125, // 18px @16
  xl: 1.2, // round → 19px @16
  '2xl': 1.5, // 24px @16
  '3xl': 1.875, // 30px @16
  '4xl': 2.25, // 36px @16
  '5xl': 3, // 48px @16
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
 * 假设 base (md) = 8px
 * 从微圆角到全圆角的完整阶梯
 */
export const RADIUS_SCALE_RATIOS: Record<SizeScaleKey, number> = {
  xs: 0.25, // 2px
  sm: 0.5, // 4px
  md: 1, // 8px (Base)
  lg: 1.5, // 12px
  xl: 2, // 16px
  '2xl': 2.5, // 20px
  '3xl': 3, // 24px
  '4xl': 3.5, // 28px
  '5xl': 999, // 极大值，用于胶囊/全圆角效果
}

/**
 * 布局尺寸倍率表 (按断点缩放，仅 PC 使用；Mobile/Tablet 固定 1)
 * 布局比字体更保守：xl 起才略放大，大屏逐步加至 1.25
 */
export const LAYOUT_SCALE_RATIOS: Record<SizeScaleKey, number> = {
  xs: 0.95,
  sm: 0.98,
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
 * 与 SizeScaleKey 一一对应；完全基于视口短边自适应，确保任何设备下绝对可控且不溢出
 */
export const LOADING_SIZE_CSS: Record<SizeScaleKey, number | string> = {
  xs: 'min(12vw, 12vh)',
  sm: 'min(20vw, 20vh)',
  md: 'min(32vw, 32vh)',
  lg: 'min(42vw, 42vh)',
  xl: 'min(60vw, 60vh)',
  '2xl': 'min(78vw, 78vh)',
  '3xl': 'min(82vw, 82vh)',
  '4xl': 'min(90vw, 90vh)',
  '5xl': 'min(100vw, 100vh)',
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
