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

// 注意：类型 SizePreset 和 SizeMode 已经在 src/types/size.d.ts 中全局定义，无需导入

/** 尺寸预设数组 */
export const SIZE_PRESETS: SizePreset[] = [
  // --- 1. 紧凑模式 (Compact) ---
  {
    name: 'compact',
    label: '紧凑模式',
    radius: 0.3,
    spacingBase: 3,
    fontSizeBase: 14, // 基准 14px

    sidebarWidth: 200,
    sidebarCollapsedWidth: 56,
    headerHeight: 48,
    breadcrumbHeight: 28,
    footerHeight: 32,
    tabsHeight: 32,
  },

  // --- 2. 舒适模式 (Comfortable - 默认) ---
  {
    name: 'comfortable',
    label: '舒适模式 (默认)',
    radius: 0.5,
    spacingBase: 4,
    fontSizeBase: 16, // 基准 16px

    sidebarWidth: 240,
    sidebarCollapsedWidth: 64,
    headerHeight: 60,
    breadcrumbHeight: 32,
    footerHeight: 40,
    tabsHeight: 40,
  },

  // --- 3. 宽松模式 (Loose) ---
  {
    name: 'loose',
    label: '宽松模式',
    radius: 0.8,
    spacingBase: 6,
    fontSizeBase: 18, // 基准 18px

    sidebarWidth: 280,
    sidebarCollapsedWidth: 80,
    headerHeight: 74,
    breadcrumbHeight: 48,
    footerHeight: 56,
    tabsHeight: 56,
  },
]

/** 默认尺寸模式 */
export const DEFAULT_SIZE_NAME: SizeMode = 'comfortable'

/** Size Store 持久化 key（与 stores/modules/size.ts persist.key 一致，供 preload 等 mount 前逻辑使用；config 加载阶段 env 未注入时用默认前缀避免报错） */
export const SIZE_PERSIST_KEY = `${import.meta.env?.VITE_PINIA_PERSIST_KEY_PREFIX ?? 'ccd-storage-kernel'}-size`

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
/** 供 openDialog width 使用的 CSS 变量名，避免业务硬编码 px */
export const DIALOG_SETTINGS_WIDTH = 'var(--dialog-settings-width)'
