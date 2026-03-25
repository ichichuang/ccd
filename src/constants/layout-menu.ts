/**
 * 菜单视觉常量 (Layout Menu Visual Tokens)
 *
 * 2026-02：从 layout.ts 迁移，保持 layout.ts 只负责布局 SSOT。
 * 菜单样式常量集中在此，便于后续迁移到 menu-nav-misc Preset Token。
 */

/** 激活项及所有父级统一样式（菜单激活态单一权威）：primary 背景 + primary-foreground 文字/图标，用于侧栏/Header/面包屑等所有菜单场景 */
export const MENU_ACTIVE_UNIFIED = 'bg-primary! text-primary-foreground!' as const

/** 未激活项文字（子级） */
export const MENU_INACTIVE_TEXT = 'text-foreground'
/** 未激活项文字（根级） */
export const MENU_INACTIVE_TEXT_ROOT = 'text-foreground'

/** Icons 组件 size 规范：nav=lg、breadcrumb=sm、tab=xs */
export const MENU_ICON_SIZE = 'lg' as const
export const BREADCRUMB_ICON_SIZE = 'sm' as const
export const TAB_ICON_SIZE = 'xs' as const

/** 菜单项 base（仅结构与交互语义，不含过渡，避免与场景层重复叠加） */
export const MENU_ITEM_BASE =
  'flex items-center gap-sm cursor-pointer select-none border-none bg-transparent'
/** 菜单项统一过渡（单一真源，避免分散写 ease-*） */
export const MENU_ITEM_TRANSITION = 'transition-all duration-md ease-out-expo'

/** 菜单项间距 */
export const MENU_ITEM_GAP = 'gap-sm'
/** 文字字重 */
export const MENU_TEXT_WEIGHT = 'font-medium'
/** 面板项内边距 */
export const MENU_PANEL_PADDING = 'px-md py-sm'
/** 文字样式 */
export const MENU_TEXT_CLASS = 'text-md font-sans'
/** 图标通用 class（transition-none 使图标随 wrapper 同帧变化，不独立过渡） */
export const MENU_ICON_COMMON_CLASS = 'w-5 text-center flex-shrink-0 center transition-none!'

/**
 * Panel 缩进常量
 * 当前侧栏层级缩进由 reset.scss 中 .admin-sidebar--fixed .p-panelmenu-submenu 控制，
 * 这里默认保持 pl-md，仅作为未来在 Header/Breadcrumb 等场景下需要额外缩进时的扩展点。
 */
/** Panel 根级缩进 */
export const MENU_PANEL_INDENT_ROOT = 'pl-md'
/** Panel 子级缩进 */
export const MENU_PANEL_INDENT_CHILD = 'pl-md'

/** 收缩态按钮内边距（仅图标，适当放大点击热区） */
export const MENU_COLLAPSED_BUTTON_PADDING = 'p-sm'
/** 收缩态按钮尺寸（使用 spacing 变量） */
export const MENU_COLLAPSED_BUTTON_SIZE =
  'min-w-[var(--spacing-2xl)] min-h-[var(--spacing-2xl)] aspect-square'
/** 收缩态无图标时的 fallback 圆圈尺寸（略小于按钮本身） */
export const MENU_COLLAPSED_FALLBACK_SIZE = 'min-w-[var(--spacing-2xl)] min-h-[var(--spacing-2xl)]'
/** 收缩态 fallback 文字（更大一档，让首字母不显得拥挤） */
export const MENU_COLLAPSED_FALLBACK_TEXT = 'text-md'

/** 收缩态侧栏一级菜单图标尺寸：比 TieredMenu 子项（lg）大 2 档，仅用于收缩态图标按钮 */
export const MENU_ICON_SIZE_COLLAPSED = '2xl' as const
/** 圆角规范：导航/菜单 rounded-md */
export const ROUNDED_NAV = 'rounded-md' as const
