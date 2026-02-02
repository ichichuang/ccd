/**
 * 尺寸系统类型定义 (Size System Types)
 *
 * 职责：定义尺寸预设、CSS 变量接口
 * - SizeMode: 尺寸模式（紧凑/舒适/宽松）
 * - SizePreset: 尺寸预设数据结构（包含圆角、间距、字体、布局尺寸等）
 * - SizeCssVars: CSS 变量接口（所有尺寸相关的 CSS 变量）
 */
declare global {
  /** 尺寸模式：紧凑 / 舒适 / 宽松 */
  export type SizeMode = 'compact' | 'comfortable' | 'loose'

  /**
   * 尺寸预设接口
   *
   * 包含：
   * - 基础尺寸：圆角、间距基数、字体基数
   * - 布局尺寸：侧边栏宽度、头部高度等（具体像素值）
   *
   * 注意：内容区高度（contentHeight）不在预设中，因为受布局模式影响，
   * 应在页面中根据实际布局模式动态计算。
   */
  export interface SizePreset {
    /** 预设名称（对应 SizeMode） */
    name: SizeMode
    /** 预设显示标签 */
    label: string

    /** 圆角基数 (rem) */
    radius: number
    /** 间距基数 (px)，用于计算语义化间距 */
    spacingBase: number
    /** 基础字体大小 (px)，用于计算字体阶梯 */
    fontSizeBase: number

    // --- 布局尺寸变量 (px) ---
    /** 侧边栏展开宽度 */
    sidebarWidth: number
    /** 侧边栏收起宽度 */
    sidebarCollapsedWidth: number
    /** 头部高度 */
    headerHeight: number
    /** 面包屑高度 */
    breadcrumbHeight: number
    /** 底部高度 */
    footerHeight: number
    /** 标签页高度 */
    tabsHeight: number
  }

  /* eslint-disable @typescript-eslint/naming-convention */
  /**
   * 尺寸系统 CSS 变量接口
   *
   * 包含：
   * - 基础变量：圆角、间距单位、容器内边距
   * - 布局变量：侧边栏、头部、面包屑等尺寸
   * - 字体阶梯：xs 到 5xl（9 个级别）
   * - 间距阶梯：xs 到 5xl（9 个级别）
   */
  export interface SizeCssVars {
    // --- 基础变量 ---
    /** 圆角基数 */
    '--radius': string
    /** 间距单位基数 */
    '--spacing-unit': string
    /** 容器内边距 */
    '--container-padding': string

    // --- 布局变量 ---
    /** 侧边栏展开宽度 */
    '--sidebar-width': string
    /** 侧边栏收起宽度 */
    '--sidebar-collapsed-width': string
    /** 头部高度 */
    '--header-height': string
    /** 面包屑高度 */
    '--breadcrumb-height': string
    /** 底部高度 */
    '--footer-height': string
    /** 标签页高度 */
    '--tabs-height': string

    // --- 字体阶梯 (xs-5xl) ---
    /** 字体大小：xs (最小) */
    '--font-size-xs': string
    /** 字体大小：sm (小) */
    '--font-size-sm': string
    /** 字体大小：md (中，基准) */
    '--font-size-md': string
    /** 字体大小：lg (大) */
    '--font-size-lg': string
    /** 字体大小：xl (超大) */
    '--font-size-xl': string
    /** 字体大小：2xl */
    '--font-size-2xl': string
    /** 字体大小：3xl */
    '--font-size-3xl': string
    /** 字体大小：4xl */
    '--font-size-4xl': string
    /** 字体大小：5xl (最大) */
    '--font-size-5xl': string

    // --- 间距阶梯 (xs-5xl) ---
    /** 间距：xs (最小) */
    '--spacing-xs': string
    /** 间距：sm (小) */
    '--spacing-sm': string
    /** 间距：md (中，基准) */
    '--spacing-md': string
    /** 间距：lg (大) */
    '--spacing-lg': string
    /** 间距：xl (超大) */
    '--spacing-xl': string
    /** 间距：2xl */
    '--spacing-2xl': string
    /** 间距：3xl */
    '--spacing-3xl': string
    /** 间距：4xl */
    '--spacing-4xl': string
    /** 间距：5xl (最大) */
    '--spacing-5xl': string

    // --- 圆角阶梯 (xs-5xl) ---
    /** 圆角：xs (最小) */
    '--radius-xs': string
    /** 圆角：sm (小) */
    '--radius-sm': string
    /** 圆角：md (中，基准) */
    '--radius-md': string
    /** 圆角：lg (大) */
    '--radius-lg': string
    /** 圆角：xl (超大) */
    '--radius-xl': string
    /** 圆角：2xl */
    '--radius-2xl': string
    /** 圆角：3xl */
    '--radius-3xl': string
    /** 圆角：4xl */
    '--radius-4xl': string
    /** 圆角：5xl (最大) */
    '--radius-5xl': string

    // --- 过渡时长阶梯 (xs-5xl) ---
    /** 过渡时长：xs (微交互) */
    '--transition-xs': string
    /** 过渡时长：sm (快速反馈) */
    '--transition-sm': string
    /** 过渡时长：md (标准过渡) */
    '--transition-md': string
    /** 过渡时长：lg (展开/收起) */
    '--transition-lg': string
    /** 过渡时长：xl (页面过渡) */
    '--transition-xl': string
    /** 过渡时长：2xl */
    '--transition-2xl': string
    /** 过渡时长：3xl */
    '--transition-3xl': string
    /** 过渡时长：4xl */
    '--transition-4xl': string
    /** 过渡时长：5xl (戏剧效果) */
    '--transition-5xl': string
  }
  /* eslint-enable @typescript-eslint/naming-convention */

  /**
   * Size Store 完整状态接口
   *
   * 包含：
   * - sizeName: 当前尺寸模式（持久化）
   */
  export interface SizeStoreState {
    /** 当前尺寸模式 */
    sizeName: SizeMode
  }
}

export {}
