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
    radius: 6,
    spacingBase: 3,
    fontSizeBase: 14,

    sidebarWidth: 260,
    sidebarCollapsedWidth: 56,
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
    sidebarCollapsedWidth: 60,
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
    sidebarCollapsedWidth: 80,
    headerHeight: 66,
    breadcrumbHeight: 36,
    footerHeight: 38,
    tabsHeight: 46,
  },
]

/** 默认尺寸模式 */
export const DEFAULT_SIZE_NAME: SizeMode = 'comfortable'

function resolveSizePersistKey(): string {
  const prefix = import.meta.env?.VITE_PINIA_PERSIST_KEY_PREFIX?.trim()
  if (prefix) {
    return `${prefix}-size`
  }

  if (import.meta.env?.DEV) {
    throw new Error('VITE_PINIA_PERSIST_KEY_PREFIX is required for size persistence in dev.')
  }

  return 'ccd-storage-size'
}

/** Size Store 持久化 key（与 stores/modules/size.ts persist.key 一致，供 preload 等 mount 前逻辑使用） */
export const SIZE_PERSIST_KEY = resolveSizePersistKey()

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
