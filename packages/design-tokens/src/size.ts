/**
 * 尺寸系统预设常量 (Size System Presets)
 *
 * 职责：定义所有尺寸预设的唯一数据源（SSOT）
 *
 * 注意：
 * - 内容区高度不在预设中，因为受布局模式（LayoutMode）影响
 * - 应在页面中根据实际布局模式动态计算，例如：
 *   - 有 tabs: calc(100vh - var(--header-height) - var(--footer-height) - var(--tabs-height))
 *   - 无 tabs: calc(100vh - var(--header-height) - var(--footer-height))
 */

import { FONT_SCALE_RATIOS, SPACING_SCALE_RATIOS } from './sizeScale'
import type { SizeMode, SizePreset } from './types'

export const SIDEBAR_COLLAPSED_ICON_SIZE = '2xl' as const

interface SidebarCollapsedGeometrySource {
  spacingBase: number
  fontSizeBase: number
}

/**
 * 侧栏收起宽度必须跟随图标锚点，而不是跟随布局宽度比例。
 *
 * 几何来源与 AdminSidebarMenu 保持一致：
 * - CScrollbar: px-sm
 * - root menu item: px-md 基础上回收一个 xs，做图标光学校正
 * - icon box: sidebar icon size token + spacing-xs
 */
export function deriveSidebarCollapsedWidth(source: SidebarCollapsedGeometrySource): number {
  const spacingXs = source.spacingBase * SPACING_SCALE_RATIOS.xs
  const spacingSm = source.spacingBase * SPACING_SCALE_RATIOS.sm
  const spacingMd = source.spacingBase * SPACING_SCALE_RATIOS.md
  const iconBoxWidth =
    Math.round(source.fontSizeBase * FONT_SCALE_RATIOS[SIDEBAR_COLLAPSED_ICON_SIZE]) + spacingXs
  const rootItemPaddingInline = spacingMd - spacingXs
  const scrollChromeInline = spacingSm * 2
  const iconAnchorItemWidth = rootItemPaddingInline * 2 + iconBoxWidth

  return Math.round(scrollChromeInline + iconAnchorItemWidth)
}

/** 尺寸预设数组 */
export const SIZE_PRESETS: SizePreset[] = [
  // --- 1. 紧凑模式 (Compact) ---
  {
    name: 'compact',
    label: '紧凑模式',
    radius: 6,
    spacingBase: 3,
    fontSizeBase: 14,

    sidebarWidth: 260,
    sidebarCollapsedWidth: deriveSidebarCollapsedWidth({ spacingBase: 3, fontSizeBase: 14 }),
    headerHeight: 48,
    breadcrumbHeight: 28,
    footerHeight: 28,
    tabsHeight: 36,
  },

  // --- 2. 舒适模式 (Comfortable - 默认) ---
  {
    name: 'comfortable',
    label: '舒适模式 (默认)',
    radius: 8,
    spacingBase: 4,
    fontSizeBase: 16,

    sidebarWidth: 280,
    sidebarCollapsedWidth: deriveSidebarCollapsedWidth({ spacingBase: 4, fontSizeBase: 16 }),
    headerHeight: 60,
    breadcrumbHeight: 32,
    footerHeight: 32,
    tabsHeight: 40,
  },

  // --- 3. 宽松模式 (Loose) ---
  {
    name: 'loose',
    label: '宽松模式',
    radius: 12,
    spacingBase: 5,
    fontSizeBase: 18,

    sidebarWidth: 300,
    sidebarCollapsedWidth: deriveSidebarCollapsedWidth({ spacingBase: 5, fontSizeBase: 18 }),
    headerHeight: 66,
    breadcrumbHeight: 36,
    footerHeight: 38,
    tabsHeight: 46,
  },
]

/** 默认尺寸模式 */
export const DEFAULT_SIZE_NAME: SizeMode = 'comfortable'


/**
 * 布局尺寸字段名（与 SizePreset / SizeCssVars 一一对应，SSOT for UnoCSS）
 * 禁止加入 presetUno 已占用的类名片段（如 full / screen / min / max），否则会覆盖默认 w-full、w-screen 等，导致布局异常。
 */
export const LAYOUT_DIMENSION_KEYS = [
  'sidebarWidth',
  'sidebarCollapsedWidth',
  'headerHeight',
  'breadcrumbHeight',
  'footerHeight',
  'tabsHeight',
] as const satisfies readonly (keyof SizePreset)[]

/** 基础尺寸变量名（对应 SizeCssVars 非阶梯基础变量） */
export const SIZE_BASE_VAR_KEYS = ['containerPadding'] as const

/** 全局设置弹窗宽度（px），SSOT；由 sizeEngine 注入为 --dialog-settings-width */
export const DIALOG_SETTINGS_WIDTH_PX = 400
