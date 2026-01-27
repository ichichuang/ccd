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
