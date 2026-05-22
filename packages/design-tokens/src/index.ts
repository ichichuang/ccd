import type {
  CompleteThemePreset,
  SizeMode,
  SizePreset,
  SizeScaleKey,
  ThemePreset,
  ThemeTransitionDuration,
} from './types'

export type {
  ColorTokenState,
  CompleteColorTokenState,
  CompleteThemeModeConfig,
  CompleteThemePreset,
  FontSizeCssVarName,
  RadiusCssVarName,
  SizeCssVarName,
  SizeCssVars,
  SizeMode,
  SizePreset,
  SizeScaleKey,
  SpacingCssVarName,
  StaticSizeCssVarName,
  ThemeCssVars,
  ThemeMode,
  ThemeModeConfig,
  ThemePreset,
  ThemeTransitionDuration,
  ThemeTransitionMode,
  TransitionCssVarName,
} from './types'

/**
 * 尺寸阶梯键名定义 (xs -> 5xl)
 * 保持与 Breakpoints 命名一致，降低心智负担
 */
export const SIZE_SCALE_KEYS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const
export interface SizeScaleMatrixEntry {
  key: SizeScaleKey
  fontRatio: number
  spacingRatio: number
  radiusRatio: number
  layoutRatio: number
  loadingSizeCss: number | string
  transitionMs: number
}

/**
 * 尺寸阶梯矩阵 SSOT。
 * - fontRatio：相对于 --font-size-base
 * - spacingRatio：相对于 --spacing-unit
 * - radiusRatio：相对于 SizePreset.radius
 * - layoutRatio：PC 断点布局缩放，Mobile/Tablet 固定 1
 * - loadingSizeCss：Loading 动画正方形边长
 * - transitionMs：过渡时长阶梯
 */
export const SIZE_SCALE_MATRIX: readonly SizeScaleMatrixEntry[] = [
  {
    key: 'xs',
    fontRatio: 0.82,
    spacingRatio: 1,
    radiusRatio: 0.25,
    layoutRatio: 0.95,
    loadingSizeCss: 'min(12vw, 12vh)',
    transitionMs: 180,
  },
  {
    key: 'sm',
    fontRatio: 0.96,
    spacingRatio: 2,
    radiusRatio: 0.5,
    layoutRatio: 0.98,
    loadingSizeCss: 'min(20vw, 20vh)',
    transitionMs: 280,
  },
  {
    key: 'md',
    fontRatio: 1,
    spacingRatio: 4,
    radiusRatio: 1,
    layoutRatio: 1,
    loadingSizeCss: 'min(32vw, 32vh)',
    transitionMs: 320,
  },
  {
    key: 'lg',
    fontRatio: 1.125,
    spacingRatio: 6,
    radiusRatio: 1.5,
    layoutRatio: 1,
    loadingSizeCss: 'min(42vw, 42vh)',
    transitionMs: 420,
  },
  {
    key: 'xl',
    fontRatio: 1.2,
    spacingRatio: 8,
    radiusRatio: 2,
    layoutRatio: 1.05,
    loadingSizeCss: 'min(60vw, 60vh)',
    transitionMs: 480,
  },
  {
    key: '2xl',
    fontRatio: 1.5,
    spacingRatio: 12,
    radiusRatio: 2.5,
    layoutRatio: 1.1,
    loadingSizeCss: 'min(78vw, 78vh)',
    transitionMs: 580,
  },
  {
    key: '3xl',
    fontRatio: 1.875,
    spacingRatio: 16,
    radiusRatio: 3,
    layoutRatio: 1.15,
    loadingSizeCss: 'min(82vw, 82vh)',
    transitionMs: 680,
  },
  {
    key: '4xl',
    fontRatio: 2.25,
    spacingRatio: 24,
    radiusRatio: 3.5,
    layoutRatio: 1.2,
    loadingSizeCss: 'min(90vw, 90vh)',
    transitionMs: 780,
  },
  {
    key: '5xl',
    fontRatio: 3,
    spacingRatio: 32,
    radiusRatio: 999,
    layoutRatio: 1.25,
    loadingSizeCss: 'min(100vw, 100vh)',
    transitionMs: 880,
  },
]

function deriveSizeScaleRecord<K extends Exclude<keyof SizeScaleMatrixEntry, 'key'>>(
  field: K
): Record<SizeScaleKey, SizeScaleMatrixEntry[K]> {
  return SIZE_SCALE_MATRIX.reduce(
    (acc, entry) => ({
      ...acc,
      [entry.key]: entry[field],
    }),
    {} as Record<SizeScaleKey, SizeScaleMatrixEntry[K]>
  )
}

/**
 * @deprecated Prefer SIZE_SCALE_MATRIX as the SSOT.
 */
export const FONT_SCALE_RATIOS = deriveSizeScaleRecord('fontRatio')

/**
 * @deprecated Prefer SIZE_SCALE_MATRIX as the SSOT.
 */
export const SPACING_SCALE_RATIOS = deriveSizeScaleRecord('spacingRatio')

/**
 * @deprecated Prefer SIZE_SCALE_MATRIX as the SSOT.
 */
export const RADIUS_SCALE_RATIOS = deriveSizeScaleRecord('radiusRatio')

/**
 * @deprecated Prefer SIZE_SCALE_MATRIX as the SSOT.
 */
export const LAYOUT_SCALE_RATIOS = deriveSizeScaleRecord('layoutRatio')

/**
 * @deprecated Prefer SIZE_SCALE_MATRIX as the SSOT.
 */
export const LOADING_SIZE_CSS = deriveSizeScaleRecord('loadingSizeCss')

/**
 * @deprecated Prefer SIZE_SCALE_MATRIX as the SSOT.
 */
export const TRANSITION_SCALE_MS = deriveSizeScaleRecord('transitionMs')

/* eslint-disable @typescript-eslint/naming-convention */

/**
 * 全站响应式断点定义 (v2.0 Standard · Single Source of Truth)
 * 覆盖：移动端 -> 平板 -> 笔记本 -> 桌面 -> 2K -> 4K
 * 键与 SIZE_SCALE_KEYS 强一致，类型贯通尺寸系统
 */
export const BREAKPOINTS: Record<SizeScaleKey, number> = {
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

/** 断点键名，与尺寸阶梯键统一 (SizeScaleKey) */
export type BreakpointKey = SizeScaleKey

/** 基于物理屏幕短边的平板设备检测阈值（非布局响应断点，仅用于 UA + 屏幕尺寸的设备类型判定） */
export const TABLET_DETECTION_MIN_SHORT_SIDE = 600

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

/**
 * 核心主题预设池 (全状态极致定制版 - The Ultimate 11)
 * * 核心设计理念：
 * 1. 彻底绕过引擎的自动计算，为每一个主题的 Light/Dark 模式显式指定所有状态色。
 * 2. WCAG 严格对比度：深色背景必配白字 (#ffffff)，亮色背景必配极深色字。
 * 3. 色相融合 (Hue Harmony)：状态色不再是干巴巴的纯红纯绿，而是根据主色调做了冷暖偏移。
 */
export const THEME_PRESETS: CompleteThemePreset[] = [
  // =========================================================================
  // 1. Morandi Elegance (Optimized)
  // =========================================================================
  {
    name: 'morandi-elegance',
    colors: {
      light: {
        background: '#F0F2F5',
        foreground: '#333333',
        neutral: {
          base: '#E0E2E5',
          bg: '#F8F9FA',
          foreground: '#333333',
          secondaryForeground: '#6C757D',
          mutedForeground: '#868E96',
        },
        secondary: '#E9ECEF',
        secondaryForeground: '#333333',
        muted: '#F8F9FA',
        mutedForeground: '#868E96',
        border: '#E0E2E5',
        input: '#DEE2E6',
        ring: '#3A6F9B',
        primary: {
          default: '#3A6F9B',
          foreground: '#F8FAFC',
          hover: '#315F85',
          light: '#7AA0C6',
          lightForeground: '#FFFFFF',
        },
        accent: {
          default: '#8A2BE2',
          foreground: '#FFFFFF',
          hover: '#7A24CC',
          light: '#B266FF',
          lightForeground: '#FFFFFF',
        },
        success: {
          default: '#28A745',
          foreground: '#111111',
          hover: '#218838',
          light: '#6FD07C',
          lightForeground: '#FFFFFF',
        },
        info: {
          default: '#17A2B8',
          foreground: '#111111',
          hover: '#138496',
          light: '#5BC0DE',
          lightForeground: '#FFFFFF',
        },
        warn: {
          default: '#FFC107',
          foreground: '#333333',
          hover: '#E0A800',
          light: '#FFD54F',
          lightForeground: '#333333',
        },
        danger: {
          default: '#DC3545',
          foreground: '#FFFFFF',
          hover: '#C82333',
          light: '#EF5350',
          lightForeground: '#FFFFFF',
        },
        help: {
          default: '#6F42C1',
          foreground: '#FFFFFF',
          hover: '#5F38A3',
          light: '#9B7EDD',
          lightForeground: '#FFFFFF',
        },
        sidebar: {
          background: '#FFFFFF',
          foreground: '#333333',
          primary: '#427AA9',
          primaryForeground: '#FFFFFF',
          accent: '#8A2BE2',
          accentForeground: '#FFFFFF',
          border: '#E0E2E5',
          ring: '#4682B4',
        },
      },
      dark: {
        background: '#212529',
        foreground: '#F8F9FA',
        neutral: {
          base: '#495057',
          bg: '#343A40',
          foreground: '#F8F9FA',
          secondaryForeground: '#CED4DA',
          mutedForeground: '#ADB5BD',
        },
        secondary: '#343A40',
        secondaryForeground: '#F8F9FA',
        muted: '#2C3034',
        mutedForeground: '#ADB5BD',
        border: '#495057',
        input: '#6C757D',
        ring: '#3A6F9B',
        primary: {
          default: '#3A6F9B',
          foreground: '#F8FAFC',
          hover: '#5A9BDC',
          light: '#2A4E6C',
          lightForeground: '#F8F9FA',
        },
        accent: {
          default: '#B266FF',
          foreground: '#111111',
          hover: '#C999FF',
          light: '#6A3EB4',
          lightForeground: '#F8F9FA',
        },
        success: {
          default: '#28A745',
          foreground: '#111111',
          hover: '#34D058',
          light: '#1A6B2D',
          lightForeground: '#F8F9FA',
        },
        info: {
          default: '#17A2B8',
          foreground: '#111111',
          hover: '#20C997',
          light: '#0F6B78',
          lightForeground: '#F8F9FA',
        },
        warn: {
          default: '#FFC107',
          foreground: '#333333',
          hover: '#FFD54F',
          light: '#A08000',
          lightForeground: '#F8F9FA',
        },
        danger: {
          default: '#DC3545',
          foreground: '#FFFFFF',
          hover: '#EF5350',
          light: '#8A212B',
          lightForeground: '#F8F9FA',
        },
        help: {
          default: '#6F42C1',
          foreground: '#FFFFFF',
          hover: '#9B7EDD',
          light: '#462A7A',
          lightForeground: '#F8F9FA',
        },
        sidebar: {
          background: '#343A40',
          foreground: '#F8F9FA',
          primary: '#3A6F9B',
          primaryForeground: '#F8FAFC',
          accent: '#B266FF',
          accentForeground: '#111111',
          border: '#495057',
          ring: '#4682B4',
        },
      },
    },
  },

  // =========================================================================
  // 2. Soft Morandi Pastels (Optimized)
  // =========================================================================
  {
    name: 'soft-morandi-pastels',
    colors: {
      light: {
        background: '#F8F0F0',
        foreground: '#333333',
        neutral: {
          base: '#EFE0E0',
          bg: '#FCF8F8',
          foreground: '#333333',
          secondaryForeground: '#6C757D',
          mutedForeground: '#868E96',
        },
        secondary: '#F5EBEB',
        secondaryForeground: '#333333',
        muted: '#FCF8F8',
        mutedForeground: '#868E96',
        border: '#EFE0E0',
        input: '#F2E6E6',
        ring: '#6A5ACD',
        primary: {
          default: '#6A5ACD',
          foreground: '#FFFFFF',
          hover: '#5E4FBC',
          light: '#9388E0',
          lightForeground: '#FFFFFF',
        },
        accent: {
          default: '#20B2AA',
          foreground: '#333333',
          hover: '#1C9A94',
          light: '#66CDAA',
          lightForeground: '#FFFFFF',
        },
        success: {
          default: '#28A745',
          foreground: '#111111',
          hover: '#218838',
          light: '#6FD07C',
          lightForeground: '#FFFFFF',
        },
        info: {
          default: '#17A2B8',
          foreground: '#111111',
          hover: '#138496',
          light: '#5BC0DE',
          lightForeground: '#FFFFFF',
        },
        warn: {
          default: '#FFC107',
          foreground: '#333333',
          hover: '#E0A800',
          light: '#FFD54F',
          lightForeground: '#333333',
        },
        danger: {
          default: '#DC3545',
          foreground: '#FFFFFF',
          hover: '#C82333',
          light: '#EF5350',
          lightForeground: '#FFFFFF',
        },
        help: {
          default: '#8A2BE2',
          foreground: '#FFFFFF',
          hover: '#7A24CC',
          light: '#B266FF',
          lightForeground: '#FFFFFF',
        },
        sidebar: {
          background: '#FFFFFF',
          foreground: '#333333',
          primary: '#6A5ACD',
          primaryForeground: '#FFFFFF',
          accent: '#20B2AA',
          accentForeground: '#333333',
          border: '#EFE0E0',
          ring: '#6A5ACD',
        },
      },
      dark: {
        background: '#212529',
        foreground: '#F8F9FA',
        neutral: {
          base: '#495057',
          bg: '#343A40',
          foreground: '#F8F9FA',
          secondaryForeground: '#CED4DA',
          mutedForeground: '#ADB5BD',
        },
        secondary: '#343A40',
        secondaryForeground: '#F8F9FA',
        muted: '#2C3034',
        mutedForeground: '#ADB5BD',
        border: '#495057',
        input: '#6C757D',
        ring: '#6A5ACD',
        primary: {
          default: '#6A5ACD',
          foreground: '#FFFFFF',
          hover: '#7B6FE0',
          light: '#423782',
          lightForeground: '#F8F9FA',
        },
        accent: {
          default: '#66CDAA',
          foreground: '#333333',
          hover: '#80E0C0',
          light: '#146E6A',
          lightForeground: '#F8F9FA',
        },
        success: {
          default: '#28A745',
          foreground: '#111111',
          hover: '#34D058',
          light: '#1A6B2D',
          lightForeground: '#F8F9FA',
        },
        info: {
          default: '#17A2B8',
          foreground: '#111111',
          hover: '#20C997',
          light: '#0F6B78',
          lightForeground: '#F8F9FA',
        },
        warn: {
          default: '#FFC107',
          foreground: '#333333',
          hover: '#FFD54F',
          light: '#A08000',
          lightForeground: '#F8F9FA',
        },
        danger: {
          default: '#DC3545',
          foreground: '#FFFFFF',
          hover: '#EF5350',
          light: '#8A212B',
          lightForeground: '#F8F9FA',
        },
        help: {
          default: '#8A2BE2',
          foreground: '#FFFFFF',
          hover: '#B266FF',
          light: '#5A1A8A',
          lightForeground: '#F8F9FA',
        },
        sidebar: {
          background: '#343A40',
          foreground: '#F8F9FA',
          primary: '#6A5ACD',
          primaryForeground: '#FFFFFF',
          accent: '#66CDAA',
          accentForeground: '#333333',
          border: '#495057',
          ring: '#6A5ACD',
        },
      },
    },
  },

  // =========================================================================
  // 3. Modern Calm Neutrals + Warm Accents (Optimized)
  // =========================================================================
  {
    name: 'modern-calm-neutrals',
    colors: {
      light: {
        background: '#FDF7F0',
        foreground: '#333333',
        neutral: {
          base: '#EFE5D9',
          bg: '#FFFBF5',
          foreground: '#333333',
          secondaryForeground: '#6C757D',
          mutedForeground: '#868E96',
        },
        secondary: '#F8F0E5',
        secondaryForeground: '#333333',
        muted: '#FFFBF5',
        mutedForeground: '#868E96',
        border: '#EFE5D9',
        input: '#F2EBDD',
        ring: '#A85418',
        primary: {
          default: '#A85418',
          foreground: '#FFF7ED',
          hover: '#8A4213',
          light: '#E08D5E',
          lightForeground: '#FFFFFF',
        },
        accent: {
          default: '#2E8B57',
          foreground: '#000000',
          hover: '#287A4B',
          light: '#66CDAA',
          lightForeground: '#FFFFFF',
        },
        success: {
          default: '#28A745',
          foreground: '#111111',
          hover: '#218838',
          light: '#6FD07C',
          lightForeground: '#FFFFFF',
        },
        info: {
          default: '#17A2B8',
          foreground: '#111111',
          hover: '#138496',
          light: '#5BC0DE',
          lightForeground: '#FFFFFF',
        },
        warn: {
          default: '#FFC107',
          foreground: '#333333',
          hover: '#E0A800',
          light: '#FFD54F',
          lightForeground: '#333333',
        },
        danger: {
          default: '#DC3545',
          foreground: '#FFFFFF',
          hover: '#C82333',
          light: '#EF5350',
          lightForeground: '#FFFFFF',
        },
        help: {
          default: '#8B4513',
          foreground: '#FFFFFF',
          hover: '#7A3D10',
          light: '#B06F3A',
          lightForeground: '#FFFFFF',
        },
        sidebar: {
          background: '#FFFFFF',
          foreground: '#333333',
          primary: '#B95C1A',
          primaryForeground: '#FFFFFF',
          accent: '#2E8B57',
          accentForeground: '#000000',
          border: '#EFE5D9',
          ring: '#D2691E',
        },
      },
      dark: {
        background: '#212529',
        foreground: '#F8F9FA',
        neutral: {
          base: '#495057',
          bg: '#343A40',
          foreground: '#F8F9FA',
          secondaryForeground: '#CED4DA',
          mutedForeground: '#ADB5BD',
        },
        secondary: '#343A40',
        secondaryForeground: '#F8F9FA',
        muted: '#2C3034',
        mutedForeground: '#ADB5BD',
        border: '#495057',
        input: '#6C757D',
        ring: '#A85418',
        primary: {
          default: '#A85418',
          foreground: '#FFF7ED',
          hover: '#E08D5E',
          light: '#8A4213',
          lightForeground: '#F8F9FA',
        },
        accent: {
          default: '#66CDAA',
          foreground: '#333333',
          hover: '#80E0C0',
          light: '#1C5A38',
          lightForeground: '#F8F9FA',
        },
        success: {
          default: '#28A745',
          foreground: '#111111',
          hover: '#34D058',
          light: '#1A6B2D',
          lightForeground: '#F8F9FA',
        },
        info: {
          default: '#17A2B8',
          foreground: '#111111',
          hover: '#20C997',
          light: '#0F6B78',
          lightForeground: '#F8F9FA',
        },
        warn: {
          default: '#FFC107',
          foreground: '#333333',
          hover: '#FFD54F',
          light: '#A08000',
          lightForeground: '#F8F9FA',
        },
        danger: {
          default: '#DC3545',
          foreground: '#FFFFFF',
          hover: '#EF5350',
          light: '#8A212B',
          lightForeground: '#F8F9FA',
        },
        help: {
          default: '#8B4513',
          foreground: '#FFFFFF',
          hover: '#B06F3A',
          light: '#5A2D0C',
          lightForeground: '#F8F9FA',
        },
        sidebar: {
          background: '#343A40',
          foreground: '#F8F9FA',
          primary: '#A85418',
          primaryForeground: '#FFF7ED',
          accent: '#66CDAA',
          accentForeground: '#333333',
          border: '#495057',
          ring: '#D2691E',
        },
      },
    },
  },

  // =========================================================================
  // 4. Eco/Nature-Inspired Earth Tones (Optimized)
  // =========================================================================
  {
    name: 'eco-nature-earth',
    colors: {
      light: {
        background: '#F5F5DC',
        foreground: '#333333',
        neutral: {
          base: '#E8E8D0',
          bg: '#FCFCF8',
          foreground: '#333333',
          secondaryForeground: '#6C757D',
          mutedForeground: '#868E96',
        },
        secondary: '#F0F0E5',
        secondaryForeground: '#333333',
        muted: '#FCFCF8',
        mutedForeground: '#868E96',
        border: '#E8E8D0',
        input: '#EFEFD8',
        ring: '#8B4513',
        primary: {
          default: '#8B4513',
          foreground: '#FFFFFF',
          hover: '#7A3D10',
          light: '#B06F3A',
          lightForeground: '#FFFFFF',
        },
        accent: {
          default: '#228B22',
          foreground: '#000000',
          hover: '#1E7A1E',
          light: '#66CDAA',
          lightForeground: '#FFFFFF',
        },
        success: {
          default: '#28A745',
          foreground: '#111111',
          hover: '#218838',
          light: '#6FD07C',
          lightForeground: '#FFFFFF',
        },
        info: {
          default: '#17A2B8',
          foreground: '#111111',
          hover: '#138496',
          light: '#5BC0DE',
          lightForeground: '#FFFFFF',
        },
        warn: {
          default: '#FFC107',
          foreground: '#333333',
          hover: '#E0A800',
          light: '#FFD54F',
          lightForeground: '#333333',
        },
        danger: {
          default: '#DC3545',
          foreground: '#FFFFFF',
          hover: '#C82333',
          light: '#EF5350',
          lightForeground: '#FFFFFF',
        },
        help: {
          default: '#A0522D',
          foreground: '#FFFFFF',
          hover: '#8A4628',
          light: '#C07D5A',
          lightForeground: '#FFFFFF',
        },
        sidebar: {
          background: '#FFFFFF',
          foreground: '#333333',
          primary: '#8B4513',
          primaryForeground: '#FFFFFF',
          accent: '#228B22',
          accentForeground: '#000000',
          border: '#E8E8D0',
          ring: '#8B4513',
        },
      },
      dark: {
        background: '#212529',
        foreground: '#F8F9FA',
        neutral: {
          base: '#495057',
          bg: '#343A40',
          foreground: '#F8F9FA',
          secondaryForeground: '#CED4DA',
          mutedForeground: '#ADB5BD',
        },
        secondary: '#343A40',
        secondaryForeground: '#F8F9FA',
        muted: '#2C3034',
        mutedForeground: '#ADB5BD',
        border: '#495057',
        input: '#6C757D',
        ring: '#8B4513',
        primary: {
          default: '#8B4513',
          foreground: '#FFFFFF',
          hover: '#B06F3A',
          light: '#5A2D0C',
          lightForeground: '#F8F9FA',
        },
        accent: {
          default: '#66CDAA',
          foreground: '#333333',
          hover: '#80E0C0',
          light: '#1C5A1C',
          lightForeground: '#F8F9FA',
        },
        success: {
          default: '#28A745',
          foreground: '#111111',
          hover: '#34D058',
          light: '#1A6B2D',
          lightForeground: '#F8F9FA',
        },
        info: {
          default: '#17A2B8',
          foreground: '#111111',
          hover: '#20C997',
          light: '#0F6B78',
          lightForeground: '#F8F9FA',
        },
        warn: {
          default: '#FFC107',
          foreground: '#333333',
          hover: '#FFD54F',
          light: '#A08000',
          lightForeground: '#F8F9FA',
        },
        danger: {
          default: '#DC3545',
          foreground: '#FFFFFF',
          hover: '#EF5350',
          light: '#8A212B',
          lightForeground: '#F8F9FA',
        },
        help: {
          default: '#A0522D',
          foreground: '#FFFFFF',
          hover: '#C07D5A',
          light: '#66341C',
          lightForeground: '#F8F9FA',
        },
        sidebar: {
          background: '#343A40',
          foreground: '#F8F9FA',
          primary: '#8B4513',
          primaryForeground: '#FFFFFF',
          accent: '#66CDAA',
          accentForeground: '#333333',
          border: '#495057',
          ring: '#8B4513',
        },
      },
    },
  },

  // =========================================================================
  // 5. Soft Digital Pastels / Elevated Morandi (Optimized)
  // =========================================================================
  {
    name: 'elevated-digital-pastels',
    colors: {
      light: {
        background: '#E0F2F7',
        foreground: '#333333',
        neutral: {
          base: '#D0E6EB',
          bg: '#F0F8FA',
          foreground: '#333333',
          secondaryForeground: '#6C757D',
          mutedForeground: '#868E96',
        },
        secondary: '#E6F0F4',
        secondaryForeground: '#333333',
        muted: '#F0F8FA',
        mutedForeground: '#868E96',
        border: '#D0E6EB',
        input: '#D8EBF0',
        ring: '#006AD5',
        primary: {
          default: '#006AD5',
          foreground: '#F8FAFC',
          hover: '#005AB8',
          light: '#3399FF',
          lightForeground: '#FFFFFF',
        },
        accent: {
          default: '#FF4500',
          foreground: '#111111',
          hover: '#E03E00',
          light: '#FF7033',
          lightForeground: '#FFFFFF',
        },
        success: {
          default: '#28A745',
          foreground: '#111111',
          hover: '#218838',
          light: '#6FD07C',
          lightForeground: '#FFFFFF',
        },
        info: {
          default: '#17A2B8',
          foreground: '#111111',
          hover: '#138496',
          light: '#5BC0DE',
          lightForeground: '#FFFFFF',
        },
        warn: {
          default: '#FFC107',
          foreground: '#333333',
          hover: '#E0A800',
          light: '#FFD54F',
          lightForeground: '#333333',
        },
        danger: {
          default: '#DC3545',
          foreground: '#FFFFFF',
          hover: '#C82333',
          light: '#EF5350',
          lightForeground: '#FFFFFF',
        },
        help: {
          default: '#607D8B',
          foreground: '#000000',
          hover: '#455A64',
          light: '#B0BEC5',
          lightForeground: '#FFFFFF',
        },
        sidebar: {
          background: '#FFFFFF',
          foreground: '#333333',
          primary: '#0071EB',
          primaryForeground: '#FFFFFF',
          accent: '#FF4500',
          accentForeground: '#111111',
          border: '#D0E6EB',
          ring: '#007BFF',
        },
      },
      dark: {
        background: '#212529',
        foreground: '#F8F9FA',
        neutral: {
          base: '#495057',
          bg: '#343A40',
          foreground: '#F8F9FA',
          secondaryForeground: '#CED4DA',
          mutedForeground: '#ADB5BD',
        },
        secondary: '#343A40',
        secondaryForeground: '#F8F9FA',
        muted: '#2C3034',
        mutedForeground: '#ADB5BD',
        border: '#495057',
        input: '#6C757D',
        ring: '#006AD5',
        primary: {
          default: '#006AD5',
          foreground: '#F8FAFC',
          hover: '#3399FF',
          light: '#004A80',
          lightForeground: '#F8F9FA',
        },
        accent: {
          default: '#FF7033',
          foreground: '#333333',
          hover: '#FF9966',
          light: '#A02A00',
          lightForeground: '#F8F9FA',
        },
        success: {
          default: '#28A745',
          foreground: '#111111',
          hover: '#34D058',
          light: '#1A6B2D',
          lightForeground: '#F8F9FA',
        },
        info: {
          default: '#17A2B8',
          foreground: '#111111',
          hover: '#20C997',
          light: '#0F6B78',
          lightForeground: '#F8F9FA',
        },
        warn: {
          default: '#FFC107',
          foreground: '#333333',
          hover: '#FFD54F',
          light: '#A08000',
          lightForeground: '#F8F9FA',
        },
        danger: {
          default: '#DC3545',
          foreground: '#FFFFFF',
          hover: '#EF5350',
          light: '#8A212B',
          lightForeground: '#F8F9FA',
        },
        help: {
          default: '#607D8B',
          foreground: '#000000',
          hover: '#B0BEC5',
          light: '#3A4C5A',
          lightForeground: '#F8F9FA',
        },
        sidebar: {
          background: '#343A40',
          foreground: '#F8F9FA',
          primary: '#006AD5',
          primaryForeground: '#F8FAFC',
          accent: '#FF7033',
          accentForeground: '#333333',
          border: '#495057',
          ring: '#007BFF',
        },
      },
    },
  },

  // =========================================================================
  // 6. Warm Modern UI / Sunset Accents (Optimized)
  // =========================================================================
  {
    name: 'warm-modern-sunset',
    colors: {
      light: {
        background: '#FFF8E1',
        foreground: '#333333',
        neutral: {
          base: '#F5EED5',
          bg: '#FFFCEF',
          foreground: '#333333',
          secondaryForeground: '#6C757D',
          mutedForeground: '#868E96',
        },
        secondary: '#FDF5E6',
        secondaryForeground: '#333333',
        muted: '#FFFCEF',
        mutedForeground: '#868E96',
        border: '#F5EED5',
        input: '#F8F2E0',
        ring: '#974F16',
        primary: {
          default: '#974F16',
          foreground: '#FFF7ED',
          hover: '#7A3F12',
          light: '#F0A56B',
          lightForeground: '#FFFFFF',
        },
        accent: {
          default: '#27AE60',
          foreground: '#111111',
          hover: '#229954',
          light: '#66CDAA',
          lightForeground: '#FFFFFF',
        },
        success: {
          default: '#28A745',
          foreground: '#111111',
          hover: '#218838',
          light: '#6FD07C',
          lightForeground: '#FFFFFF',
        },
        info: {
          default: '#17A2B8',
          foreground: '#111111',
          hover: '#138496',
          light: '#5BC0DE',
          lightForeground: '#FFFFFF',
        },
        warn: {
          default: '#FFC107',
          foreground: '#333333',
          hover: '#E0A800',
          light: '#FFD54F',
          lightForeground: '#333333',
        },
        danger: {
          default: '#DC3545',
          foreground: '#FFFFFF',
          hover: '#C82333',
          light: '#EF5350',
          lightForeground: '#FFFFFF',
        },
        help: {
          default: '#A0522D',
          foreground: '#FFFFFF',
          hover: '#8A4628',
          light: '#C07D5A',
          lightForeground: '#FFFFFF',
        },
        sidebar: {
          background: '#FFFFFF',
          foreground: '#333333',
          primary: '#974F16',
          primaryForeground: '#FFFFFF',
          accent: '#27AE60',
          accentForeground: '#111111',
          border: '#F5EED5',
          ring: '#E67E22',
        },
      },
      dark: {
        background: '#212529',
        foreground: '#F8F9FA',
        neutral: {
          base: '#495057',
          bg: '#343A40',
          foreground: '#F8F9FA',
          secondaryForeground: '#CED4DA',
          mutedForeground: '#ADB5BD',
        },
        secondary: '#343A40',
        secondaryForeground: '#F8F9FA',
        muted: '#2C3034',
        mutedForeground: '#ADB5BD',
        border: '#495057',
        input: '#6C757D',
        ring: '#974F16',
        primary: {
          default: '#974F16',
          foreground: '#FFF7ED',
          hover: '#F0A56B',
          light: '#914F16',
          lightForeground: '#F8F9FA',
        },
        accent: {
          default: '#66CDAA',
          foreground: '#333333',
          hover: '#80E0C0',
          light: '#1A6B3D',
          lightForeground: '#F8F9FA',
        },
        success: {
          default: '#28A745',
          foreground: '#111111',
          hover: '#34D058',
          light: '#1A6B2D',
          lightForeground: '#F8F9FA',
        },
        info: {
          default: '#17A2B8',
          foreground: '#111111',
          hover: '#20C997',
          light: '#0F6B78',
          lightForeground: '#F8F9FA',
        },
        warn: {
          default: '#FFC107',
          foreground: '#333333',
          hover: '#FFD54F',
          light: '#A08000',
          lightForeground: '#F8F9FA',
        },
        danger: {
          default: '#DC3545',
          foreground: '#FFFFFF',
          hover: '#EF5350',
          light: '#8A212B',
          lightForeground: '#F8F9FA',
        },
        help: {
          default: '#A0522D',
          foreground: '#FFFFFF',
          hover: '#C07D5A',
          light: '#66341C',
          lightForeground: '#F8F9FA',
        },
        sidebar: {
          background: '#343A40',
          foreground: '#F8F9FA',
          primary: '#974F16',
          primaryForeground: '#FFF7ED',
          accent: '#66CDAA',
          accentForeground: '#333333',
          border: '#495057',
          ring: '#E67E22',
        },
      },
    },
  },
  // =========================================================================
  // 7. Royal Amethyst (Purple Series)
  // =========================================================================
  {
    name: 'royal-amethyst',
    colors: {
      light: {
        background: '#F8F0FC',
        foreground: '#2A0A3A',
        neutral: {
          base: '#E6D9ED',
          bg: '#FDF9FF',
          foreground: '#2A0A3A',
          secondaryForeground: '#6A3A8A',
          mutedForeground: '#8A5A9A',
        },
        secondary: '#F2E8F7',
        secondaryForeground: '#2A0A3A',
        muted: '#FBF5FF',
        mutedForeground: '#8A5A9A',
        border: '#E6D9ED',
        input: '#EDE0F2',
        ring: '#8A00FF',
        primary: {
          default: '#8A00FF',
          foreground: '#FFFFFF',
          hover: '#7B00E0',
          light: '#A333FF',
          lightForeground: '#FFFFFF',
        },
        accent: {
          default: '#C9A0FF',
          foreground: '#2A0A3A',
          hover: '#B28AE0',
          light: '#DDC9FF',
          lightForeground: '#2A0A3A',
        },
        success: {
          default: '#4CAF50',
          foreground: '#333333',
          hover: '#439B47',
          light: '#6CC470',
          lightForeground: '#FFFFFF',
        },
        info: {
          default: '#2196F3',
          foreground: '#111111',
          hover: '#1976D2',
          light: '#64B5F6',
          lightForeground: '#FFFFFF',
        },
        warn: {
          default: '#FFC107',
          foreground: '#2A0A3A',
          hover: '#E0A800',
          light: '#FFD54F',
          lightForeground: '#2A0A3A',
        },
        danger: {
          default: '#F44336',
          foreground: '#111111',
          hover: '#D32F2F',
          light: '#EF9A9A',
          lightForeground: '#FFFFFF',
        },
        help: {
          default: '#9C27B0',
          foreground: '#FFFFFF',
          hover: '#7B1FA2',
          light: '#CE93D8',
          lightForeground: '#FFFFFF',
        },
        sidebar: {
          background: '#F8F0FC',
          foreground: '#2A0A3A',
          primary: '#8A00FF',
          primaryForeground: '#FFFFFF',
          accent: '#C9A0FF',
          accentForeground: '#2A0A3A',
          border: '#E6D9ED',
          ring: '#8A00FF',
        },
      },
      dark: {
        background: '#1A052A',
        foreground: '#F0E0FF',
        neutral: {
          base: '#4A2A5A',
          bg: '#3A1A4A',
          foreground: '#F0E0FF',
          secondaryForeground: '#B080D0',
          mutedForeground: '#8050A0',
        },
        secondary: '#3A1A4A',
        secondaryForeground: '#F0E0FF',
        muted: '#2A0A3A',
        mutedForeground: '#FFFFFF',
        border: '#4A2A5A',
        input: '#6A3A8A',
        ring: '#8A00FF',
        primary: {
          default: '#8A00FF',
          foreground: '#FFFFFF',
          hover: '#A333FF',
          light: '#5A00A0',
          lightForeground: '#F0E0FF',
        },
        accent: {
          default: '#C9A0FF',
          foreground: '#2A0A3A',
          hover: '#DDC9FF',
          light: '#7A50A0',
          lightForeground: '#F0E0FF',
        },
        success: {
          default: '#6CC470',
          foreground: '#2A0A3A',
          hover: '#4CAF50',
          light: '#3A7A3A',
          lightForeground: '#F0E0FF',
        },
        info: {
          default: '#64B5F6',
          foreground: '#2A0A3A',
          hover: '#2196F3',
          light: '#3A6A8A',
          lightForeground: '#F0E0FF',
        },
        warn: {
          default: '#FFD54F',
          foreground: '#2A0A3A',
          hover: '#FFC107',
          light: '#A0803A',
          lightForeground: '#F0E0FF',
        },
        danger: {
          default: '#EF9A9A',
          foreground: '#2A0A3A',
          hover: '#F44336',
          light: '#A05050',
          lightForeground: '#F0E0FF',
        },
        help: {
          default: '#CE93D8',
          foreground: '#2A0A3A',
          hover: '#9C27B0',
          light: '#6A3A7A',
          lightForeground: '#F0E0FF',
        },
        sidebar: {
          background: '#3A1A4A',
          foreground: '#F0E0FF',
          primary: '#8A00FF',
          primaryForeground: '#FFFFFF',
          accent: '#C9A0FF',
          accentForeground: '#2A0A3A',
          border: '#4A2A5A',
          ring: '#8A00FF',
        },
      },
    },
  },

  // =========================================================================
  // 8. Emerald Forest (Green Series)
  // =========================================================================
  {
    name: 'emerald-forest',
    colors: {
      light: {
        background: '#F0F8F0',
        foreground: '#0A2A0A',
        neutral: {
          base: '#D9EDD9',
          bg: '#F9FFF9',
          foreground: '#0A2A0A',
          secondaryForeground: '#3A6A3A',
          mutedForeground: '#5A8A5A',
        },
        secondary: '#E8F7E8',
        secondaryForeground: '#0A2A0A',
        muted: '#F5FFF5',
        mutedForeground: '#5A8A5A',
        border: '#D9EDD9',
        input: '#E0F2E0',
        ring: '#008A00',
        primary: {
          default: '#008A00',
          foreground: '#FFFFFF',
          hover: '#007B00',
          light: '#33A333',
          lightForeground: '#FFFFFF',
        },
        accent: {
          default: '#A0FFA0',
          foreground: '#0A2A0A',
          hover: '#8AE08A',
          light: '#C9FFC9',
          lightForeground: '#0A2A0A',
        },
        success: {
          default: '#4CAF50',
          foreground: '#333333',
          hover: '#439B47',
          light: '#6CC470',
          lightForeground: '#FFFFFF',
        },
        info: {
          default: '#2196F3',
          foreground: '#111111',
          hover: '#1976D2',
          light: '#64B5F6',
          lightForeground: '#FFFFFF',
        },
        warn: {
          default: '#FFC107',
          foreground: '#0A2A0A',
          hover: '#E0A800',
          light: '#FFD54F',
          lightForeground: '#0A2A0A',
        },
        danger: {
          default: '#F44336',
          foreground: '#111111',
          hover: '#D32F2F',
          light: '#EF9A9A',
          lightForeground: '#FFFFFF',
        },
        help: {
          default: '#8BC34A',
          foreground: '#333333',
          hover: '#689F38',
          light: '#C5E1A5',
          lightForeground: '#FFFFFF',
        },
        sidebar: {
          background: '#F0F8F0',
          foreground: '#0A2A0A',
          primary: '#008A00',
          primaryForeground: '#FFFFFF',
          accent: '#A0FFA0',
          accentForeground: '#0A2A0A',
          border: '#D9EDD9',
          ring: '#008A00',
        },
      },
      dark: {
        background: '#052A05',
        foreground: '#E0FFE0',
        neutral: {
          base: '#2A4A2A',
          bg: '#1A3A1A',
          foreground: '#E0FFE0',
          secondaryForeground: '#80B080',
          mutedForeground: '#50A050',
        },
        secondary: '#1A3A1A',
        secondaryForeground: '#E0FFE0',
        muted: '#0A2A0A',
        mutedForeground: '#50A050',
        border: '#2A4A2A',
        input: '#3A6A3A',
        ring: '#008A00',
        primary: {
          default: '#008A00',
          foreground: '#FFFFFF',
          hover: '#33A333',
          light: '#005A00',
          lightForeground: '#E0FFE0',
        },
        accent: {
          default: '#A0FFA0',
          foreground: '#0A2A0A',
          hover: '#C9FFC9',
          light: '#50A050',
          lightForeground: '#E0FFE0',
        },
        success: {
          default: '#6CC470',
          foreground: '#0A2A0A',
          hover: '#4CAF50',
          light: '#3A7A3A',
          lightForeground: '#E0FFE0',
        },
        info: {
          default: '#64B5F6',
          foreground: '#0A2A0A',
          hover: '#2196F3',
          light: '#3A6A8A',
          lightForeground: '#E0FFE0',
        },
        warn: {
          default: '#FFD54F',
          foreground: '#0A2A0A',
          hover: '#FFC107',
          light: '#A0803A',
          lightForeground: '#E0FFE0',
        },
        danger: {
          default: '#EF9A9A',
          foreground: '#0A2A0A',
          hover: '#F44336',
          light: '#A05050',
          lightForeground: '#E0FFE0',
        },
        help: {
          default: '#C5E1A5',
          foreground: '#0A2A0A',
          hover: '#8BC34A',
          light: '#5A7A3A',
          lightForeground: '#E0FFE0',
        },
        sidebar: {
          background: '#1A3A1A',
          foreground: '#E0FFE0',
          primary: '#008A00',
          primaryForeground: '#FFFFFF',
          accent: '#A0FFA0',
          accentForeground: '#0A2A0A',
          border: '#2A4A2A',
          ring: '#008A00',
        },
      },
    },
  },

  // =========================================================================
  // 9. Midnight Deep Sea (Dark Blue Series)
  // =========================================================================
  {
    name: 'midnight-deep-sea',
    colors: {
      light: {
        background: '#F0F4F8',
        foreground: '#0A1A2A',
        neutral: {
          base: '#D9E3ED',
          bg: '#F9FBFF',
          foreground: '#0A1A2A',
          secondaryForeground: '#3A5A6A',
          mutedForeground: '#5A7A8A',
        },
        secondary: '#E8F0F7',
        secondaryForeground: '#0A1A2A',
        muted: '#F5F8FF',
        mutedForeground: '#5A7A8A',
        border: '#D9E3ED',
        input: '#E0E7F2',
        ring: '#005A8A',
        primary: {
          default: '#005A8A',
          foreground: '#FFFFFF',
          hover: '#004F7B',
          light: '#337AA3',
          lightForeground: '#FFFFFF',
        },
        accent: {
          default: '#FFD700',
          foreground: '#0A1A2A',
          hover: '#E0B800',
          light: '#FFE066',
          lightForeground: '#0A1A2A',
        },
        success: {
          default: '#4CAF50',
          foreground: '#333333',
          hover: '#439B47',
          light: '#6CC470',
          lightForeground: '#FFFFFF',
        },
        info: {
          default: '#2196F3',
          foreground: '#111111',
          hover: '#1976D2',
          light: '#64B5F6',
          lightForeground: '#FFFFFF',
        },
        warn: {
          default: '#FFC107',
          foreground: '#0A1A2A',
          hover: '#E0A800',
          light: '#FFD54F',
          lightForeground: '#0A1A2A',
        },
        danger: {
          default: '#F44336',
          foreground: '#111111',
          hover: '#D32F2F',
          light: '#EF9A9A',
          lightForeground: '#FFFFFF',
        },
        help: {
          default: '#607D8B',
          foreground: '#000000',
          hover: '#455A64',
          light: '#B0BEC5',
          lightForeground: '#FFFFFF',
        },
        sidebar: {
          background: '#F0F4F8',
          foreground: '#0A1A2A',
          primary: '#005A8A',
          primaryForeground: '#FFFFFF',
          accent: '#FFD700',
          accentForeground: '#0A1A2A',
          border: '#D9E3ED',
          ring: '#005A8A',
        },
      },
      dark: {
        background: '#05101A',
        foreground: '#E0F0FF',
        neutral: {
          base: '#2A3A4A',
          bg: '#1A2A3A',
          foreground: '#E0F0FF',
          secondaryForeground: '#80B0D0',
          mutedForeground: '#5080A0',
        },
        secondary: '#1A2A3A',
        secondaryForeground: '#E0F0FF',
        muted: '#0A1A2A',
        mutedForeground: '#5080A0',
        border: '#2A3A4A',
        input: '#3A5A6A',
        ring: '#005A8A',
        primary: {
          default: '#005A8A',
          foreground: '#FFFFFF',
          hover: '#337AA3',
          light: '#003A5A',
          lightForeground: '#E0F0FF',
        },
        accent: {
          default: '#FFD700',
          foreground: '#0A1A2A',
          hover: '#FFE066',
          light: '#A0803A',
          lightForeground: '#E0F0FF',
        },
        success: {
          default: '#6CC470',
          foreground: '#0A1A2A',
          hover: '#4CAF50',
          light: '#3A7A3A',
          lightForeground: '#E0F0FF',
        },
        info: {
          default: '#64B5F6',
          foreground: '#0A1A2A',
          hover: '#2196F3',
          light: '#3A6A8A',
          lightForeground: '#E0F0FF',
        },
        warn: {
          default: '#FFD54F',
          foreground: '#0A1A2A',
          hover: '#FFC107',
          light: '#A0803A',
          lightForeground: '#E0F0FF',
        },
        danger: {
          default: '#EF9A9A',
          foreground: '#0A1A2A',
          hover: '#F44336',
          light: '#A05050',
          lightForeground: '#E0F0FF',
        },
        help: {
          default: '#B0BEC5',
          foreground: '#0A1A2A',
          hover: '#607D8B',
          light: '#5A6A7A',
          lightForeground: '#E0F0FF',
        },
        sidebar: {
          background: '#1A2A3A',
          foreground: '#E0F0FF',
          primary: '#005A8A',
          primaryForeground: '#FFFFFF',
          accent: '#FFD700',
          accentForeground: '#0A1A2A',
          border: '#2A3A4A',
          ring: '#005A8A',
        },
      },
    },
  },

  // =========================================================================
  // 10. Industrial Tech (Advanced Monochrome/Contrast)
  // =========================================================================
  {
    name: 'industrial-tech',
    colors: {
      light: {
        background: '#F0F0F0',
        foreground: '#1A1A1A',
        neutral: {
          base: '#D0D0D0',
          bg: '#F8F8F8',
          foreground: '#1A1A1A',
          secondaryForeground: '#505050',
          mutedForeground: '#707070',
        },
        secondary: '#E8E8E8',
        secondaryForeground: '#1A1A1A',
        muted: '#F5F5F5',
        mutedForeground: '#707070',
        border: '#D0D0D0',
        input: '#E0E0E0',
        ring: '#006AD5',
        primary: {
          default: '#006AD5',
          foreground: '#F8FAFC',
          hover: '#005AB8',
          light: '#3399FF',
          lightForeground: '#FFFFFF',
        },
        accent: {
          default: '#FF4500',
          foreground: '#111111',
          hover: '#E03E00',
          light: '#FF7033',
          lightForeground: '#FFFFFF',
        },
        success: {
          default: '#4CAF50',
          foreground: '#333333',
          hover: '#439B47',
          light: '#6CC470',
          lightForeground: '#FFFFFF',
        },
        info: {
          default: '#2196F3',
          foreground: '#111111',
          hover: '#1976D2',
          light: '#64B5F6',
          lightForeground: '#FFFFFF',
        },
        warn: {
          default: '#FFC107',
          foreground: '#1A1A1A',
          hover: '#E0A800',
          light: '#FFD54F',
          lightForeground: '#1A1A1A',
        },
        danger: {
          default: '#F44336',
          foreground: '#111111',
          hover: '#D32F2F',
          light: '#EF9A9A',
          lightForeground: '#FFFFFF',
        },
        help: {
          default: '#607D8B',
          foreground: '#000000',
          hover: '#455A64',
          light: '#B0BEC5',
          lightForeground: '#FFFFFF',
        },
        sidebar: {
          background: '#F0F0F0',
          foreground: '#1A1A1A',
          primary: '#0071EB',
          primaryForeground: '#FFFFFF',
          accent: '#FF4500',
          accentForeground: '#111111',
          border: '#D0D0D0',
          ring: '#007BFF',
        },
      },
      dark: {
        background: '#1A1A1A',
        foreground: '#F0F0F0',
        neutral: {
          base: '#404040',
          bg: '#2A2A2A',
          foreground: '#F0F0F0',
          secondaryForeground: '#B0B0B0',
          mutedForeground: '#808080',
        },
        secondary: '#2A2A2A',
        secondaryForeground: '#F0F0F0',
        muted: '#1A1A1A',
        mutedForeground: '#808080',
        border: '#404040',
        input: '#505050',
        ring: '#006AD5',
        primary: {
          default: '#006AD5',
          foreground: '#F8FAFC',
          hover: '#3399FF',
          light: '#004A80',
          lightForeground: '#F0F0F0',
        },
        accent: {
          default: '#FF4500',
          foreground: '#111111',
          hover: '#FF7033',
          light: '#A02A00',
          lightForeground: '#F0F0F0',
        },
        success: {
          default: '#6CC470',
          foreground: '#1A1A1A',
          hover: '#4CAF50',
          light: '#3A7A3A',
          lightForeground: '#F0F0F0',
        },
        info: {
          default: '#64B5F6',
          foreground: '#1A1A1A',
          hover: '#2196F3',
          light: '#3A6A8A',
          lightForeground: '#F0F0F0',
        },
        warn: {
          default: '#FFD54F',
          foreground: '#1A1A1A',
          hover: '#FFC107',
          light: '#A0803A',
          lightForeground: '#F0F0F0',
        },
        danger: {
          default: '#EF9A9A',
          foreground: '#1A1A1A',
          hover: '#F44336',
          light: '#A05050',
          lightForeground: '#F0F0F0',
        },
        help: {
          default: '#B0BEC5',
          foreground: '#1A1A1A',
          hover: '#607D8B',
          light: '#5A6A7A',
          lightForeground: '#F0F0F0',
        },
        sidebar: {
          background: '#2A2A2A',
          foreground: '#F0F0F0',
          primary: '#006AD5',
          primaryForeground: '#F8FAFC',
          accent: '#FF4500',
          accentForeground: '#111111',
          border: '#404040',
          ring: '#007BFF',
        },
      },
    },
  },
]

export const DEFAULT_THEME_NAME = 'soft-morandi-pastels'
export const DEFAULT_THEME_MODE = 'auto' as const

/**
 * ProForm ColorPicker 插件示例默认 hex（与 `DEFAULT_THEME_NAME` 下 light.primary.default 一致，避免示例散落任意色值）
 */
export const DEMO_COLOR_PICKER_DEFAULT_HEX = '#1c1d22' as const

/**
 * 获取预设的主色（用于 UI 展示，如配色选择小球）
 * 若定义了 colors.light/dark 则根据 isDark 取对应 primary.default，否则取 preset.primary
 */
export function getPresetPrimaryColor(preset: ThemePreset, isDark: boolean): string {
  const modeKey = isDark ? 'dark' : 'light'
  const primary = preset.colors?.[modeKey]?.primary?.default ?? preset.primary
  return primary ?? '#6b7280'
}

/** 主题切换过渡时长默认值 (ms) */
export const DEFAULT_TRANSITION_DURATION: ThemeTransitionDuration = 600

/** 过渡时长选项（主色色块从浅到深 + i18n labelKey）
 * swatchStyle 使用 CSS 变量，随当前主题主色变化 */
export const TRANSITION_DURATION_OPTIONS: {
  value: ThemeTransitionDuration
  swatchStyle: string
  labelKey: string
}[] = [
  {
    value: 400,
    swatchStyle: 'rgb(var(--primary-hover))',
    labelKey: 'settings.durationUltraFast',
  },
  { value: 600, swatchStyle: 'rgb(var(--primary))', labelKey: 'settings.durationFast' },
  {
    value: 800,
    swatchStyle: 'rgb(var(--primary) / 0.5)',
    labelKey: 'settings.durationComfortable',
  },
  {
    value: 1200,
    swatchStyle: 'rgb(var(--primary) / 0.3)',
    labelKey: 'settings.durationSlow',
  },
  {
    value: 1600,
    swatchStyle: 'rgb(var(--primary-light))',
    labelKey: 'settings.durationUltraSlow',
  },
]

/**
 * Color Usage Contract - 语义 → Token 映射规则
 *
 * ⭐ SSOT (Single Source of Truth)：本文件是颜色语义决策的唯一权威。
 * - Rules 必须引用本文件，不得在文档中重新定义 primary/accent/ring/neutral 语义
 * - Preset 不解释语义，仅实现 Token 映射
 * - Uno 示例必须遵守本映射
 *
 * 供 UI 层参考，不读取 DOM、不修改 engine、不生成 CSS
 */
export const COLOR_USAGE = {
  /* 品牌 */
  brand: 'primary',
  brandForeground: 'primary-foreground',

  /* 交互反馈 — 统一使用 primary 色系 */
  hover: 'primary-hover',
  hoverForeground: 'primary-foreground',
  active: 'primary-hover',
  focus: 'ring',

  /* 聚焦预选态（列表项键盘聚焦、下拉选项聚焦） */
  focusHighlight: 'primary-light',
  focusHighlightForeground: 'primary-light-foreground',

  /* 强调/高亮 — 独立互补色，用于特殊视觉标记（Tab 激活指示线默认使用 primary，仅在需要强对比主题时可选用 accent） */
  accent: 'accent',
  accentForeground: 'accent-foreground',
  /** accent 适用场景：特殊标记、badge、navlink 高亮；Tab 激活指示线仅作为可选风格，不再强制归属 accent */

  /* 选中态 */
  selection: 'primary',
  selectionForeground: 'primary-foreground',

  /* 中性 */
  subtleBg: 'secondary',
  mutedText: 'muted-foreground',
} as const

/** 使用 primary 的推荐场景（包括默认的 Tab 激活指示线） */
export const PRIMARY_USAGE = [
  'logo',
  'primary-button',
  'brand-badge',
  'loading-animation',
  'chart-primary-series',
  'hover-border',
  'hover-background',
  'selected-state',
  'focus-highlight',
  'tab-active-indicator',
] as const

/** accent 的推荐场景（独立互补高亮色，非 hover；Tab 激活指示线仅在需要强对比主题时可选用） */
export const ACCENT_USAGE = ['special-badge', 'navlink-highlight', 'feature-callout'] as const

/**
 * 主题颜色家族元数据
 *
 * 单一 token（直接对应一个 CSS 变量）：
 * - border / input / ring / background / foreground
 *
 * 成对家族（DEFAULT + foreground）：
 * - card / popover / secondary / muted
 *
 * 扩展家族（DEFAULT + foreground + hover + light + light-foreground）：
 * - primary / accent / danger / warn / success / info / help
 *
 * Sidebar 家族：单独使用 sidebar- 前缀的 CSS 变量
 *
 * 说明：
 * 1. `ring` 虽然是 single token，但默认由主题引擎回退到 `primary`
 * 2. 若主题需要独立 focus ring，可在 ThemeModeConfig.ring 中显式覆盖
 *
 * 该元数据仅用于：
 * 1. 约束 generateThemeVars 返回的 CSS 变量命名规范
 * 2. 提供给 UnoCSS 配置做动态 colors 映射（避免硬编码）
 *
 * 与 PrimeVue 主题链的关系：本文件由 engine.ts 使用并参与生成 ThemeCssVars（写入 :root）；
 * PrimeVue preset（primevuePreset.ts）仅消费已写入的 :root 变量，不直接引用本文件。
 */
export const COLOR_FAMILIES = {
  singleTokens: ['border', 'input', 'ring', 'background', 'foreground'] as const,
  pairFamilies: ['card', 'popover', 'secondary', 'muted'] as const,
  quadFamilies: ['primary', 'accent', 'danger', 'warn', 'success', 'info', 'help'] as const,
  sidebar: {
    background: 'sidebar-background',
    foreground: 'sidebar-foreground',
    primary: 'sidebar-primary',
    'primary-foreground': 'sidebar-primary-foreground',
    accent: 'sidebar-accent',
    'accent-foreground': 'sidebar-accent-foreground',
    border: 'sidebar-border',
    ring: 'sidebar-ring',
  } as const,
} as const

// ---------------------------------------------------------------------------
// 主题引擎可调参数（便于调试与统一微调）
// ---------------------------------------------------------------------------
export const THEME_ENGINE = {
  /* 基础层：未指定 backgroundDark/backgroundLight 时的默认色 */
  bgDark: '#09090b',
  bgLight: '#F7F8F9',
  cardLight: '#ffffff',
  fgDark: '#ffffff',
  fgLight: '#09090b',

  /* 中性色：secondary / muted / border 等 */
  neutralDark: '#27272a',
  neutralLight: '#f4f4f5',
  borderLight: '#e4e4e7',

  /* 卡片：默认卡背景及有 backgroundDark/backgroundLight 时的亮度偏移 */
  cardDark: '#18181b',
  cardBrightnessOffset: 5,

  /* Hover：亮度调整，深色模式略亮、浅色模式略暗 */
  hoverBrightnessDark: 10,
  hoverBrightnessLight: -10,

  /* Light 变体：深色模式加亮度；浅色模式与白混合的基色权重 (0~1) */
  lightBrightnessDark: 25,
  /** 浅色模式下与白混合时白色的占比。降低此值可增强 tint，使 bg-*-light 在白底上更易辨认（0.60 ≈ 60% 白 / 40% 色） */
  lightMixWhiteWeight: 0.6,
  lightMixWhite: '#ffffff',

  /** Accent 色相偏移（度），用于从 primary 推导 accent 时的 hue 偏移 */
  accentHueShift: 24,

  /* 状态色默认与固定 */
  dangerDefault: '#ef4444',
  dangerDefaultFg: '#fafafa',
  warnDefault: '#ca8a04',
  successDefault: '#10b981',
  infoDefault: '#0ea5e9',
  helpDefault: '#a855f7', // Purple-500

  /* 次要文案色 */
  secondaryFgDark: '#fafafa',
  mutedFgDark: '#a1a1aa',
  mutedFgLight: '#71717a',

  /* Sidebar：默认及有 backgroundDark/backgroundLight 时的亮度偏移 */
  sidebarDark: '#18181b',
  sidebarLight: '#f4f4f5',
  sidebarBrightnessOffset: -2,

  /** 未配置 primary 时的最终兜底色（仅作最后降级，不作业务默认值） */
  fallbackPrimary: '#000000',
  /** 亮色模式 light 变体前景色计算的黑色混合目标 */
  darkForeground: '#000000',
}

/**
 * 标准化 Hex 颜色值 (修复 3 位 hex 并进行非法校验)
 */
export function normalizeHex(hex: string): string {
  // 基础校验：必须以 # 开头
  if (!hex || !hex.startsWith('#')) {
    return '#000000'
  }

  let h = hex.replace('#', '')

  // 自动处理 3 位 -> 6 位展开
  if (h.length === 3) {
    h = h
      .split('')
      .map(char => char + char)
      .join('')
  }

  // 最终校验：必须是 6 位合法字符
  const hexRegex = /^[0-9a-fA-F]{6}$/
  if (!hexRegex.test(h)) {
    return '#000000'
  }

  return '#' + h
}

/**
 * 将 Hex 颜色转换为 RGB 通道字符串
 * @example "#ffffff" -> "255 255 255"
 */
export function hexToRgb(hex: string): string {
  const h = normalizeHex(hex).replace('#', '')
  const num = parseInt(h, 16)
  return `${(num >> 16) & 255} ${(num >> 8) & 255} ${num & 255}`
}

/**
 * 调整颜色亮度 (修正 3 位 hex 计算逻辑)
 */
export function adjustBrightness(hex: string, percent: number): string {
  const h = normalizeHex(hex).replace('#', '')
  // 限制百分比在安全范围
  const p = Math.max(-100, Math.min(100, percent))

  const num = parseInt(h, 16)
  const amt = Math.round(2.55 * p)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00ff) + amt
  const B = (num & 0x0000ff) + amt

  const clamp = (val: number) => Math.max(0, Math.min(255, val))

  return '#' + (0x1000000 + clamp(R) * 0x10000 + clamp(G) * 0x100 + clamp(B)).toString(16).slice(1)
}

/**
 * 混合两个 Hex 颜色 (用于生成有品牌倾向的 Accent)
 * @param color1 前景色
 * @param color2 背景色
 * @param weight color1 的权重 (0-1)
 */
export function mixHex(color1: string, color2: string, weight: number): string {
  const c1 = normalizeHex(color1).replace('#', '')
  const c2 = normalizeHex(color2).replace('#', '')
  const w = Math.max(0, Math.min(1, weight))
  const num1 = parseInt(c1, 16)
  const num2 = parseInt(c2, 16)
  const r = Math.round(((num1 >> 16) & 255) * w + ((num2 >> 16) & 255) * (1 - w))
  const g = Math.round(((num1 >> 8) & 0xff) * w + ((num2 >> 8) & 0xff) * (1 - w))
  const b = Math.round((num1 & 0xff) * w + (num2 & 0xff) * (1 - w))
  return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)
}

/**
 * 判断颜色是否为深色 (修正 3 位 hex 误判问题)
 */
export function isDarkColor(hex: string): boolean {
  const h = normalizeHex(hex).replace('#', '')
  const rgb = parseInt(h, 16)
  const r = (rgb >> 16) & 0xff
  const g = (rgb >> 8) & 0xff
  const b = (rgb >> 0) & 0xff

  // 基于 Luma 亮度公式判断
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luma < 128
}

/**
 * 将 RGB 通道字符串转换为 Hex 颜色
 * @example "255 255 255" -> "#ffffff"
 */
export function rgbToHex(rgb: string): string {
  const parts = rgb.trim().split(/\s+/)
  if (parts.length !== 3) {
    return '#000000'
  }

  const r = parseInt(parts[0], 10)
  const g = parseInt(parts[1], 10)
  const b = parseInt(parts[2], 10)

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return '#000000'
  }

  const clamp = (val: number) => Math.max(0, Math.min(255, val))
  const hex = (val: number) => clamp(val).toString(16).padStart(2, '0')

  return `#${hex(r)}${hex(g)}${hex(b)}`
}

/**
 * 将颜色叠加透明度，输出为 rgba/hsla 字符串
 * - 支持：#rgb/#rrggbb、rgb/rgba、hsl/hsla
 * - opacity: 0~100
 */
export function applyOpacityToColor(color: string, opacity: number): string {
  // 限定透明度为 0~100
  const alpha = Math.max(0, Math.min(100, opacity)) / 100

  // 移除空格并转小写
  color = color.trim().toLowerCase()

  // 1. rgba(...) / rgb(...)：直接替换/补齐 alpha
  const rgbaMatch = color.match(/^rgba?\(([^)]+)\)$/)
  if (rgbaMatch) {
    const parts = rgbaMatch[1].split(',').map(p => p.trim())
    const [r, g, b] = parts.map(Number)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // 2. HEX #rrggbb or #rgb
  if (color.startsWith('#')) {
    let r = 0
    let g = 0
    let b = 0
    if (color.length === 4) {
      // #rgb
      r = parseInt(color[1] + color[1], 16)
      g = parseInt(color[2] + color[2], 16)
      b = parseInt(color[3] + color[3], 16)
    } else if (color.length === 7) {
      // #rrggbb
      r = parseInt(color.slice(1, 3), 16)
      g = parseInt(color.slice(3, 5), 16)
      b = parseInt(color.slice(5, 7), 16)
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // 3. hsl(...) -> hsla(...)
  const hslMatch = color.match(/^hsl\(([^)]+)\)$/)
  if (hslMatch) {
    return color.replace(/^hsl\(([^)]+)\)$/, `hsla($1, ${alpha})`)
  }

  // 4. hsla(...)：替换 alpha（保留 h/s/l）
  const hslaMatch = color.match(/^hsla\(([^,]+),([^,]+),([^,]+),[^)]+\)$/)
  if (hslaMatch) {
    const [h, s, l] = [hslaMatch[1], hslaMatch[2], hslaMatch[3]]
    return `hsla(${h}, ${s}, ${l}, ${alpha})`
  }

  // 5. 不支持的格式：回退黑色
  return `rgba(0, 0, 0, ${alpha})`
}

// ---------------------------------------------------------------------------
// 内部工具：HSL 转换（供 shiftHue 使用，不 export）
// ---------------------------------------------------------------------------

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const h = normalizeHex(hex).replace('#', '')
  const num = parseInt(h, 16)
  const r = ((num >> 16) & 255) / 255
  const g = ((num >> 8) & 255) / 255
  const b = (num & 255) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let hVal = 0
  let sVal = 0
  const lVal = (max + min) / 2

  if (max !== min) {
    const d = max - min
    sVal = lVal > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        hVal = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        hVal = ((b - r) / d + 2) / 6
        break
      default:
        hVal = ((r - g) / d + 4) / 6
    }
  }

  return {
    h: hVal * 360,
    s: sVal * 100,
    l: lVal * 100,
  }
}

function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  const hNorm = (((h % 360) + 360) % 360) / 360
  const sNorm = Math.max(0, Math.min(100, s)) / 100
  const lNorm = Math.max(0, Math.min(100, l)) / 100

  let r: number
  let g: number
  let b: number

  if (sNorm === 0) {
    r = g = b = lNorm
  } else {
    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm
    const p = 2 * lNorm - q
    r = hue2rgb(p, q, hNorm + 1 / 3)
    g = hue2rgb(p, q, hNorm)
    b = hue2rgb(p, q, hNorm - 1 / 3)
  }

  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val * 255)))
  return '#' + (0x1000000 + clamp(r) * 0x10000 + clamp(g) * 0x100 + clamp(b)).toString(16).slice(1)
}

/**
 * 按色相偏移 HEX 颜色
 * @param hex - 输入 HEX 颜色
 * @param degree - 色相偏移度数（正数顺时针，负数逆时针），会循环 0~360
 * @returns 偏移后的 HEX 颜色
 */
export function shiftHue(hex: string, degree: number): string {
  const hsl = hexToHsl(hex)
  const newH = (hsl.h + degree + 360) % 360
  return normalizeHex(hslToHex(newH, hsl.s, hsl.l))
}
