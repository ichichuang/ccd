/**
 * 菜单视觉常量 (Layout Menu Visual Tokens)
 *
 * 2026-02：从 layout.ts 迁移，保持 layout.ts 只负责布局 SSOT。
 * 菜单样式常量集中在此，便于后续迁移到 menu-nav-misc Preset Token。
 */

/**
 * 激活态背景映射（可选/扩展用）
 * 当前未使用，仅供未来按 distance 分级时参考；getMenuItemActive 对整条激活路径使用 MENU_ACTIVE_UNIFIED 统一样式。
 * distance 0=叶子, 1=直接父级, 2=祖父级...
 */
export const MENU_ACTIVE_BG_MAPPING: Record<number, string> = {
  0: 'bg-primary!',
  1: 'bg-primary/30!',
  2: 'bg-primary/20!',
  3: 'bg-primary/10!',
}

/** 激活项及所有父级统一样式（菜单激活态单一权威）：primary 背景 + primary-foreground 文字/图标，用于侧栏/Header/面包屑等所有菜单场景 */
export const MENU_ACTIVE_UNIFIED = 'bg-primary! text-primary-foreground!' as const

/** 未激活项文字（子级） */
export const MENU_INACTIVE_TEXT = 'text-foreground'
/** 未激活项文字（根级） */
export const MENU_INACTIVE_TEXT_ROOT = 'text-foreground'
/** 未激活项图标 */
export const MENU_INACTIVE_ICON = 'text-foreground'
/** 未激活项 chevron */
export const MENU_INACTIVE_CHEVRON = 'text-foreground'

/** Icons 组件 size 规范：nav=lg、breadcrumb=sm、tab=xs */
export const MENU_ICON_SIZE = 'lg' as const
export const BREADCRUMB_ICON_SIZE = 'sm' as const
export const TAB_ICON_SIZE = 'xs' as const

/** 菜单项 base（与 uno.config menu-item-base 完全一致） */
export const MENU_ITEM_BASE =
  'flex items-center gap-sm cursor-pointer select-none transition-all duration-scale-md ease-in-out border-none bg-transparent'

/** 菜单项间距 */
export const MENU_ITEM_GAP = 'gap-sm'
/** 文字字重 */
export const MENU_TEXT_WEIGHT = 'font-medium'
/** 面板项内边距 */
export const MENU_PANEL_PADDING = 'px-padding-md py-padding-sm'
/** 文字样式 */
export const MENU_TEXT_CLASS = 'fs-md font-sans leading-none'
/** 图标通用 class（transition-none 使图标随 wrapper 同帧变化，不独立过渡） */
export const MENU_ICON_COMMON_CLASS =
  'w-5 text-center flex-shrink-0 flex items-center justify-center transition-none!'

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
export const MENU_COLLAPSED_BUTTON_PADDING = 'p-padding-sm'
/** 收缩态按钮尺寸（使用 spacing 变量） */
export const MENU_COLLAPSED_BUTTON_SIZE =
  'min-w-[var(--spacing-2xl)] min-h-[var(--spacing-2xl)] aspect-square'
/** 收缩态无图标时的 fallback 圆圈尺寸（略小于按钮本身） */
export const MENU_COLLAPSED_FALLBACK_SIZE = 'min-w-[var(--spacing-2xl)] min-h-[var(--spacing-2xl)]'
/** 收缩态 fallback 文字（更大一档，让首字母不显得拥挤） */
export const MENU_COLLAPSED_FALLBACK_TEXT = 'fs-md'

/** 收缩态侧栏一级菜单图标尺寸：比 TieredMenu 子项（lg）大 2 档，仅用于收缩态图标按钮 */
export const MENU_ICON_SIZE_COLLAPSED = '2xl' as const

/** Typography scale：标题 fs-2xl、正文 fs-md、辅助 fs-sm */
export const TYPO_TITLE = 'fs-2xl' as const
export const TYPO_BODY = 'fs-md' as const
export const TYPO_CAPTION = 'fs-sm' as const

/** 圆角规范：导航/Tab/菜单 rounded-scale-md、表单/卡片 rounded-scale-sm */
export const ROUNDED_NAV = 'rounded-scale-md' as const
export const ROUNDED_TAB = 'rounded-scale-md' as const
export const ROUNDED_CARD = 'rounded-scale-sm' as const
