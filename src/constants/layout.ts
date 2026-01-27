/**
 * 布局层常量 (与 src/types/layout.d.ts LayoutSetting 对齐)
 * 新增 LayoutSetting 字段时，只需在 DEFAULT_LAYOUT_SETTING 中补全，LAYOUT_PERSIST_PICK 会自动包含该字段。
 */

/** 布局默认配置（唯一维护源：持久化 pick 据此推导） */
export const DEFAULT_LAYOUT_SETTING: LayoutSetting = {
  mode: 'vertical' as AdminLayoutMode,
  sidebarCollapse: false,
  sidebarUniqueOpened: true,
  sidebarFixed: true,
  headerFixed: true,
  showHeader: true,
  showMenu: true,
  showSidebar: true,
  showBreadcrumb: true,
  showBreadcrumbIcon: true,
  showTabs: true,
  showFooter: true,
  showLogo: true,
  enableTransition: true,
  transitionName: 'fade-slide',
  enableKeepAlive: true,
}

/** 持久化时写入的字段，由 DEFAULT_LAYOUT_SETTING 的 key 推导，不包含 isLoading / isPageLoading */
export const LAYOUT_PERSIST_PICK: (keyof LayoutSetting)[] = Object.keys(
  DEFAULT_LAYOUT_SETTING
) as (keyof LayoutSetting)[]
