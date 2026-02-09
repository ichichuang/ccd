/**
 * 布局层常量
 *
 * 2026-02：showXxx 改为「按 AdminLayoutMode 独立保存」：
 * - DEFAULT_LAYOUT_SETTING：仍用于兼容/基准（包含 showXxx）
 * - DEFAULT_LAYOUT_VISIBILITY_SETTINGS：三种模式的独立显隐默认值（SSOT）
 * - LAYOUT_PERSIST_PICK：显式列出持久化字段（避免依赖 Object.keys 推导导致迁移期混乱）
 */

/** 布局默认配置（兼容基准：包含 showXxx，但 store 不再以平铺 showXxx 作为 SSOT） */
export const DEFAULT_LAYOUT_SETTING: LayoutSetting = {
  mode: 'vertical' as AdminLayoutMode,
  sidebarCollapse: false,
  sidebarUniqueOpened: true,
  sidebarFixed: true,
  headerFixed: true,
  enableTransition: true,
  transitionName: 'fade-slide',
  enableKeepAlive: true,
}

/** 三种布局模式的显隐默认值（互不影响） */
export const DEFAULT_LAYOUT_VISIBILITY_SETTINGS: Record<AdminLayoutMode, LayoutVisibilitySetting> =
  {
    vertical: {
      showHeader: true,
      showMenu: false, // vertical 下无 Top Menu（LayoutAdmin 中也不会渲染）
      showSidebar: true,
      showBreadcrumb: true,
      showBreadcrumbIcon: true,
      showTabs: true,
      showFooter: true,
      showLogo: true,
    },
    horizontal: {
      showHeader: true,
      showMenu: true,
      showSidebar: false, // horizontal 下不渲染 Sidebar
      showBreadcrumb: true,
      showBreadcrumbIcon: true,
      showTabs: true,
      showFooter: true,
      showLogo: true,
    },
    mix: {
      showHeader: true,
      showMenu: true,
      showSidebar: true,
      showBreadcrumb: true,
      showBreadcrumbIcon: true,
      showTabs: true,
      showFooter: true,
      showLogo: true,
    },
  }

/** 持久化字段（显式列出，避免迁移期因 keys 推导导致字段漂移） */
export const LAYOUT_PERSIST_PICK: (keyof LayoutStoreState)[] = [
  'mode',
  'sidebarCollapse',
  'sidebarUniqueOpened',
  'sidebarFixed',
  'headerFixed',
  'enableTransition',
  'transitionName',
  'enableKeepAlive',
  'visibilitySettings',
  'expandedMenuKeys',
  'userAdjusted',
] as (keyof LayoutStoreState)[]
