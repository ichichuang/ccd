/**
 * 全局布局配置
 * 所有可手动配置的变量统一管理在此文件中
 * 其他文件应从此文件导入配置，避免分散定义
 */

/**
 * 默认配置常量
 * 所有可配置的默认值统一管理
 *
 * ⚠️ 重要提示：
 * - 修改此配置后，需要重新编译项目（npm run dev 或 npm run build）
 * - 修改后需要刷新浏览器页面才能看到效果
 * - 此配置会影响所有设备的字体大小计算（通过比例系数）
 */
export const DEFAULT_CONFIG = {
  // 默认根字体大小（px）
  // 注意：此值作为基准，各设备的实际字体大小会基于此值按比例计算
  // 例如：桌面端 baseFontSize = fontSize * 0.875，移动端 baseFontSize = fontSize * 0.75
  // 修改此值后，需要重新编译项目并刷新页面才能生效
  fontSize: 16,
  // 默认防抖/节流时间（毫秒）
  debounceTime: 300,
  // 窗口尺寸限制
  windowSize: {
    minWidth: 375,
    maxWidth: 3840,
    minHeight: 667,
    maxHeight: 2160,
  },
} as const

/**
 * 设备布局尺寸比例配置
 * 基于设备类型的布局尺寸比例，用于超大屏优化
 * 这些比例会应用到布局尺寸的最大值限制和计算中
 */
export const DEVICE_LAYOUT_SIZE_RATIOS = {
  mobile: {
    sidebarWidth: 0.9, // 移动端保持原始比例
    headerHeight: 1.0,
    footerHeight: 1.0,
    breadcrumbHeight: 0.9,
    tabsHeight: 0.9,
    gap: 0.9,
  },
  tablet: {
    sidebarWidth: 0.9,
    headerHeight: 0.9,
    footerHeight: 0.9,
    breadcrumbHeight: 0.9,
    tabsHeight: 0.9,
    gap: 0.9,
  },
  desktop: {
    sidebarWidth: 1.0,
    headerHeight: 1.0,
    footerHeight: 1.0,
    breadcrumbHeight: 1.0,
    tabsHeight: 1.0,
    gap: 1.0,
  },
  largeScreen: {
    sidebarWidth: 1.2, // 大屏侧边栏增大 20%
    headerHeight: 1.1, // 大屏头部增大 20%
    footerHeight: 1.1, // 大屏底部增大 20%
    breadcrumbHeight: 1.0,
    tabsHeight: 1.1,
    gap: 1.1,
  },
  ultraWide: {
    sidebarWidth: 1.8, // 超宽屏侧边栏增大 50%
    headerHeight: 1.6, // 超宽屏头部增大 50%
    footerHeight: 1.6, // 超宽屏底部增大 50%
    breadcrumbHeight: 1.2,
    tabsHeight: 1.4,
    gap: 1.2, // 超宽屏 gap 缩小（从 1.5 调整为 1.0）
  },
  fourK: {
    sidebarWidth: 2.0, // 4K 屏侧边栏增大 50%（从 2.0 调整为 2.0）
    headerHeight: 1.6, // 4K 屏头部增大 50%（从 2.0 调整为 2.0）
    footerHeight: 1.6, // 4K 屏底部增大 50%（从 2.0 调整为 2.0）
    breadcrumbHeight: 1.4,
    tabsHeight: 1.4,
    gap: 1.5, // 4K 屏 gap 大幅缩小（从 2.0 调整为 1.2）
  },
} as const

/**
 * 布局尺寸计算配置
 * 用于创建不同尺寸预设（紧凑、舒适、宽松）的默认配置
 */
export const LAYOUT_SIZE_CONFIG = {
  // 紧凑模式配置
  compact: {
    sidebarWidth: {
      min: 200,
      max: 400,
      ratio: 0.16, // 屏幕宽度的 16%
    },
    sidebarCollapsedWidth: {
      min: 60,
      max: 60,
      ratio: 0.03, // 屏幕宽度的 3%
    },
    headerHeight: {
      min: 44,
      max: 96,
      ratio: 0.05, // 屏幕高度的 5%
    },
    breadcrumbHeight: {
      min: 32,
      max: 48,
      ratio: 0.026, // 屏幕高度的 2.6%
    },
    footerHeight: 20,
    tabsHeight: {
      min: 40,
      max: 56,
      ratio: 0.03, // 屏幕高度的 3%
    },
    gap: 8,
  },
  // 舒适模式配置
  comfortable: {
    sidebarWidth: {
      min: 240,
      max: 500,
      ratio: 0.18, // 屏幕宽度的 18%
    },
    sidebarCollapsedWidth: {
      min: 60,
      max: 60,
      ratio: 0.03, // 屏幕宽度的 3%
    },
    headerHeight: {
      min: 48,
      max: 96,
      ratio: 0.05, // 屏幕高度的 5%
    },
    breadcrumbHeight: {
      min: 36,
      max: 56,
      ratio: 0.03, // 屏幕高度的 3%
    },
    footerHeight: 24,
    tabsHeight: {
      min: 46,
      max: 64,
      ratio: 0.04, // 屏幕高度的 4%
    },
    gap: 16,
  },
  // 宽松模式配置
  loose: {
    sidebarWidth: {
      min: 280,
      max: 600,
      ratio: 0.2, // 屏幕宽度的 20%
    },
    sidebarCollapsedWidth: {
      min: 60,
      max: 60,
      ratio: 0.03, // 屏幕宽度的 3%
    },
    headerHeight: {
      min: 56,
      max: 112,
      ratio: 0.06, // 屏幕高度的 6%
    },
    breadcrumbHeight: {
      min: 40,
      max: 64,
      ratio: 0.04, // 屏幕高度的 4%
    },
    footerHeight: 24,
    tabsHeight: {
      min: 40,
      max: 64,
      ratio: 0.04, // 屏幕高度的 4%
    },
    gap: 24,
  },
} as const

/**
 * 尺寸最大值限制配置接口
 */
export interface SizeMaxLimits {
  sidebarWidth: number
  sidebarCollapsedWidth: number
  headerHeight: number
  breadcrumbHeight: number
  footerHeight: number
  tabsHeight: number
  gap: number
}

/**
 * 默认尺寸最大值限制
 * 三种尺寸预设共用一套最大值限制
 */
export const DEFAULT_SIZE_MAX_LIMITS: SizeMaxLimits = {
  sidebarWidth: 300, // 侧边栏最大宽度
  sidebarCollapsedWidth: 80, // 侧边栏折叠最大宽度
  headerHeight: 60, // 头部最大高度
  breadcrumbHeight: 40, // 面包屑最大高度
  footerHeight: 40, // 底部最大高度
  tabsHeight: 52, // 标签页最大高度
  gap: 32, // 间距最大值
}

/* 统一策略 （控制使用 debounce 还是 throttle） */
export const STRATEGY: 'debounce' | 'throttle' = 'throttle'

/* 是否记住的滚动条距离 */
export const REMEMBER_SCROLLBAR_TOP: boolean = true

/* 统一触发间隔（使用 DEFAULT_CONFIG 中的默认配置） */
export const INTERVAL: number = DEFAULT_CONFIG.debounceTime
