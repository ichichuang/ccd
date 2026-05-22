/**
 * 菜单视觉逻辑桥接 (Menu Visual Logic Bridge)
 *
 * 统一 Header / Sidebar / Breadcrumb 的 base、激活态、图标尺寸等，
 * 与 layout-menu.ts + uno.config shortcuts 对齐。
 */

import {
  BREADCRUMB_ICON_SIZE,
  MENU_ADMIN_CHROME_ACTIVE_UNIFIED,
  MENU_ADMIN_CHROME_ANCESTOR_UNIFIED,
  MENU_ADMIN_CHROME_HOVER_UNIFIED,
  MENU_ADMIN_CHROME_OPEN_UNIFIED,
  MENU_SIDEBAR_ACTIVE_UNIFIED,
  MENU_SIDEBAR_ANCESTOR_UNIFIED,
  MENU_ICON_SIZE,
  MENU_ITEM_BASE,
  MENU_ITEM_TRANSITION,
  MENU_PANEL_PADDING,
  MENU_SIDEBAR_ICON_SIZE,
  MENU_SIDEBAR_OPEN_UNIFIED,
  MENU_INACTIVE_TEXT,
  MENU_INACTIVE_TEXT_ROOT,
  MENU_SIDEBAR_INACTIVE_TEXT,
} from '@/constants/layout-menu'

export type MenuVisualContext = 'header' | 'sidebar' | 'breadcrumb'

function isSidebarContext(context: MenuVisualContext): boolean {
  return context === 'sidebar'
}

/** 返回指定上下文的 base 类（使用 MENU_PANEL_PADDING 统一内边距；过渡统一 duration-md + ease-out-expo，与 layout-menu / uno.config 菜单交互语义一致） */
export function getMenuItemBase(context: MenuVisualContext): string {
  const base: string = `${MENU_ITEM_BASE} ${MENU_PANEL_PADDING} ${MENU_ITEM_TRANSITION} group rounded-md`
  return context === 'breadcrumb' ? `${base} text-sm` : base
}

/**
 * 返回激活态类（bg + text）。
 * - sidebar 区分叶节点（distance===0，最强）和祖先（distance>0，轻量）
 * - header/breadcrumb 不区分层级：所有命中激活路径的项使用统一强激活态
 * - distance < 0：未激活
 */
export function getMenuItemActive(distance: number, context: MenuVisualContext = 'header'): string {
  if (distance >= 0) {
    if (isSidebarContext(context)) {
      return distance === 0 ? MENU_SIDEBAR_ACTIVE_UNIFIED : MENU_SIDEBAR_ANCESTOR_UNIFIED
    }
    return distance === 0 ? MENU_ADMIN_CHROME_ACTIVE_UNIFIED : MENU_ADMIN_CHROME_ANCESTOR_UNIFIED
  }
  return ''
}

export interface MenuStateOptions {
  context?: MenuVisualContext
  distance: number
  isFocused?: boolean
  isSubmenuOpen?: boolean
  level?: number
  inactiveRootClass?: string
  inactiveChildClass?: string
}

/**
 * 统一菜单 stateClasses 计算逻辑：
 * - distance >= 0：使用 getMenuItemActive（激活路径统一样式）
 * - 其余按优先级：isFocused → isSubmenuOpen → 根级/子级 inactive 文案 + 对应上下文的 open/hover 语义
 */
export function getMenuStateClasses(options: MenuStateOptions): string {
  const {
    context = 'header',
    distance,
    isFocused,
    isSubmenuOpen,
    level,
    inactiveRootClass,
    inactiveChildClass,
  }: MenuStateOptions = options

  if (distance >= 0) {
    return getMenuItemActive(distance, context)
  }

  if (isFocused) {
    return isSidebarContext(context) ? MENU_SIDEBAR_OPEN_UNIFIED : MENU_ADMIN_CHROME_OPEN_UNIFIED
  }

  if (isSubmenuOpen) {
    return isSidebarContext(context) ? MENU_SIDEBAR_OPEN_UNIFIED : MENU_ADMIN_CHROME_OPEN_UNIFIED
  }

  const rootFallback: string =
    context === 'sidebar' ? MENU_SIDEBAR_INACTIVE_TEXT : MENU_INACTIVE_TEXT_ROOT
  const childFallback: string =
    context === 'sidebar' ? MENU_SIDEBAR_INACTIVE_TEXT : MENU_INACTIVE_TEXT
  const rootClass: string = inactiveRootClass ?? rootFallback
  const childClass: string = inactiveChildClass ?? childFallback
  const isRoot: boolean = typeof level === 'number' ? level <= 0 : true

  const baseInactiveClass: string = isRoot ? rootClass : childClass
  return `${baseInactiveClass} ${MENU_ADMIN_CHROME_HOVER_UNIFIED}`
}

/** 返回指定上下文的图标 size（Icons 组件用） */
export function getIconSize(context: MenuVisualContext): '2xl' | 'lg' | 'sm' {
  if (context === 'sidebar') return MENU_SIDEBAR_ICON_SIZE
  return context === 'breadcrumb' ? BREADCRUMB_ICON_SIZE : MENU_ICON_SIZE
}
