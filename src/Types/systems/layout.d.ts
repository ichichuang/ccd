declare global {
  /**
   * 布局系统类型 (Layout System)
   * 职责：结构与行为（显示什么、如何排列），与 Size（多大）、Theme（颜色）分离
   */

  /** 页面布局模式：选择使用哪一块布局壳 (layouts/index.vue 根据路由 meta.parent 切换) */
  export type LayoutMode = 'admin' | 'fullscreen' | 'ratio'

  /** 管理布局结构模式：侧边栏在左 / 顶 / 混合 (仅对 admin 壳有效) */
  export enum AdminLayoutMode {
    VERTICAL = 'vertical',
    HORIZONTAL = 'horizontal',
    MIX = 'mix',
  }

  /** 布局配置：显隐、固定、动画等 (不包含具体尺寸像素) */
  export interface LayoutSetting {
    // --- 1. 核心模式 ---
    mode: AdminLayoutMode

    // --- 2. 侧边栏行为 ---
    sidebarCollapse: boolean
    sidebarUniqueOpened: boolean
    sidebarFixed: boolean

    // --- 3. 头部行为 ---
    headerFixed: boolean

    // --- 4. 元素显隐 ---
    showHeader: boolean
    showMenu: boolean
    showSidebar: boolean
    showBreadcrumb: boolean
    showBreadcrumbIcon: boolean
    showTabs: boolean
    showFooter: boolean
    showLogo: boolean

    // --- 5. 动画与缓存 ---
    enableTransition: boolean
    transitionName: string
    enableKeepAlive: boolean
  }

  /**
   * Layout Store 完整状态接口
   *
   * 包含：
   * - LayoutSetting: 布局配置（持久化）
   * - 运行时状态: isLoading, isPageLoading, userAdjusted（不持久化）
   */
  export interface LayoutStoreState extends LayoutSetting {
    /** 全局加载状态 */
    isLoading: boolean
    /** 页面加载状态 */
    isPageLoading: boolean
    /** 用户手动调整标记（运行时状态，不持久化） */
    userAdjusted: boolean
  }
}

export {}
