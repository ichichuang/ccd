/**
 * 菜单视觉逻辑桥接 (Menu Visual Logic Bridge)
 *
 * 统一 Header / Sidebar / Breadcrumb 的 base、激活态、图标尺寸等，
 * 与 layout-menu.ts + uno.config shortcuts 对齐。
 */

import {
  MENU_ITEM_BASE,
  MENU_ITEM_TRANSITION,
  MENU_PANEL_PADDING,
  MENU_ICON_SIZE,
  MENU_SIDEBAR_ICON_SIZE,
  BREADCRUMB_ICON_SIZE,
  MENU_ACTIVE_UNIFIED,
  MENU_OPEN_UNIFIED,
  MENU_SIDEBAR_ACTIVE_UNIFIED,
  MENU_SIDEBAR_OPEN_UNIFIED,
  MENU_INACTIVE_TEXT,
  MENU_INACTIVE_TEXT_ROOT,
  MENU_SIDEBAR_INACTIVE_TEXT,
} from '@/constants/layout-menu'

export type MenuVisualContext = 'header' | 'sidebar' | 'breadcrumb'

/** 返回指定上下文的 base 类（使用 MENU_PANEL_PADDING 统一内边距；过渡统一 duration-md + ease-out-expo，与 layout-menu / uno.config 菜单交互语义一致） */
export function getMenuItemBase(context: MenuVisualContext): string {
  const colorClass = context === 'sidebar' ? MENU_SIDEBAR_INACTIVE_TEXT : MENU_INACTIVE_TEXT_ROOT
  const base: string = `${MENU_ITEM_BASE} ${MENU_PANEL_PADDING} ${MENU_ITEM_TRANSITION} ${colorClass} text-current! group rounded-md`
  return context === 'breadcrumb' ? `${base} text-sm` : base
}

/**
 * 返回激活态类（bg + text），统一使用 MENU_ACTIVE_UNIFIED（bg-primary + text-primary-foreground）保证对比度。
 * - 激活项（distance 0）及所有父级（distance 1/2/3+）统一：primary 背景 + primary-foreground 文字/图标
 * - distance < 0 表示未激活，仅用于 getMenuStateClasses 的输入，此时应由调用方根据 inactive/hover 规则自行处理
 */
export function getMenuItemActive(distance: number, context: MenuVisualContext = 'header'): string {
  if (distance >= 0) {
    return context === 'sidebar' ? MENU_SIDEBAR_ACTIVE_UNIFIED : MENU_ACTIVE_UNIFIED
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
 * - 其余按优先级：isFocused → isSubmenuOpen → 根级/子级 inactive 文案 + MENU_OPEN_UNIFIED hover
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
    return context === 'sidebar' ? MENU_SIDEBAR_OPEN_UNIFIED : MENU_OPEN_UNIFIED
  }

  if (isSubmenuOpen) {
    return context === 'sidebar' ? MENU_SIDEBAR_OPEN_UNIFIED : MENU_OPEN_UNIFIED
  }

  const rootFallback: string =
    context === 'sidebar' ? MENU_SIDEBAR_INACTIVE_TEXT : MENU_INACTIVE_TEXT_ROOT
  const childFallback: string =
    context === 'sidebar' ? MENU_SIDEBAR_INACTIVE_TEXT : MENU_INACTIVE_TEXT
  const rootClass: string = inactiveRootClass ?? rootFallback
  const childClass: string = inactiveChildClass ?? childFallback
  const isRoot: boolean = typeof level === 'number' ? level <= 0 : true

  const baseInactiveClass: string = isRoot ? rootClass : childClass
  if (context === 'sidebar') {
    return `${baseInactiveClass} hover:bg-sidebar-primary/12! hover:text-sidebar-primary!`
  }
  return `${baseInactiveClass} hover:bg-primary/12! hover:text-primary! dark:hover:bg-primary-light/70! dark:hover:text-primary-light-foreground!`
}

/** 返回指定上下文的图标 size（Icons 组件用） */
export function getIconSize(context: MenuVisualContext): '2xl' | 'lg' | 'sm' {
  if (context === 'sidebar') return MENU_SIDEBAR_ICON_SIZE
  return context === 'breadcrumb' ? BREADCRUMB_ICON_SIZE : MENU_ICON_SIZE
}
