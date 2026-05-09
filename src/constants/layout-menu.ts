/**
 * 菜单视觉常量 (Layout Menu Visual Tokens)
 *
 * 2026-02：从 layout.ts 迁移，保持 layout.ts 只负责布局 SSOT。
 * 菜单样式常量集中在此，便于后续迁移到 menu-nav-misc Preset Token。
 */

/** 激活项及所有父级统一样式（菜单激活态单一权威）：暗色使用 primary-light 避免亮紫底黑字的突兀感 */
export const MENU_ACTIVE_UNIFIED =
  'bg-primary! text-primary-foreground! dark:bg-primary-light! dark:text-primary-light-foreground!' as const

/** 打开/聚焦/hover 态：弱于激活态，用于未命中当前路由但已展开的父级菜单 */
export const MENU_OPEN_UNIFIED =
  'bg-primary/12! text-primary! dark:bg-primary-light/70! dark:text-primary-light-foreground!' as const

/** 未激活项文字（子级） */
export const MENU_INACTIVE_TEXT = 'text-foreground'
/** 未激活项文字（根级） */
export const MENU_INACTIVE_TEXT_ROOT = 'text-foreground'

/** Icons 组件 size 规范：header=lg、sidebar=2xl、breadcrumb=sm、tab=xs */
export const MENU_ICON_SIZE = 'lg' as const
export const MENU_SIDEBAR_ICON_SIZE = '2xl' as const
export const BREADCRUMB_ICON_SIZE = 'sm' as const
export const TAB_ICON_SIZE = 'xs' as const
/** 菜单项缺省图标：折叠态避免展示首字/文字 fallback，保持线性图标体系一致 */
export const MENU_FALLBACK_ICON = 'i-lucide-circle-dot' as const

/** 菜单项 base（仅结构与交互语义，不含过渡，避免与场景层重复叠加） */
export const MENU_ITEM_BASE =
  'flex items-center gap-sm cursor-pointer select-none border-none bg-transparent'
/** 菜单项统一过渡（单一真源，与 sidebar 动画节奏对齐 duration-sm） */
export const MENU_ITEM_TRANSITION = 'transition-[background-color,color] duration-sm ease-smooth'

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
 * 菜单项交互语义类名，用于交互指令（v-tap/v-swipe 等）识别可交互菜单项。
 * 与 @/rules/integrations/07-interaction-patterns.mdc 中的 shortcut registry 对齐。
 */
export const INTERACTIVE_ITEM_CLASS = 'interactive-item' as const
/** TieredMenu 弹层菜单项专属 class：保留 hover 背景反馈，但不继承 interactive-item 的 hover 位移。 */
export const MENU_POPUP_ITEM_CLASS = 'admin-menu-popup__item' as const

/**
 * Panel 缩进常量
 * 当前侧栏层级缩进由 reset.scss 中 .admin-sidebar--fixed .p-panelmenu-submenu 控制，
 * 这里默认保持 pl-md，仅作为未来在 Header/Breadcrumb 等场景下需要额外缩进时的扩展点。
 */
/** Panel 根级缩进 */
export const MENU_PANEL_INDENT_ROOT = 'pl-md'
/** Panel 子级缩进 */
export const MENU_PANEL_INDENT_CHILD = 'pl-md'
