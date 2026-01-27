/* eslint-disable @typescript-eslint/naming-convention */

/**
 * 全站响应式断点定义 (v2.0 Standard · Single Source of Truth)
 * 覆盖：移动端 -> 平板 -> 笔记本 -> 桌面 -> 2K -> 4K
 */
export const BREAKPOINTS = {
  // --- 移动端细分 ---
  xs: 480, // 超小屏 / 折叠屏外屏
  sm: 640, // 大屏手机横屏 / 小平板

  // --- 平板与桌面过渡 ---
  md: 768, // iPad Mini 竖屏 (平板分界线)
  lg: 1024, // iPad Pro 横屏 / 桌面端起点 (Sidebar 展开点)

  // --- 桌面端主流 ---
  xl: 1280, // 主流笔记本 (13/14 寸)
  '2xl': 1536, // 大屏笔记本 (15/16 寸) / 办公显示器

  // --- 高清大屏 ---
  '3xl': 1920, // 1080P 全高清
  '4xl': 2560, // 2K QHD
  '5xl': 3840, // 4K UHD
} as const

/** 断点键名，供 TS 与 Store 使用 */
export type BreakpointKey = keyof typeof BREAKPOINTS
