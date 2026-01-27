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
    breadcrumbHeight: 32,
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
    headerHeight: 64,
    breadcrumbHeight: 40,
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
    headerHeight: 80,
    breadcrumbHeight: 56,
    footerHeight: 56,
    tabsHeight: 56,
  },
]

/** 默认尺寸模式 */
export const DEFAULT_SIZE_NAME: SizeMode = 'comfortable'
