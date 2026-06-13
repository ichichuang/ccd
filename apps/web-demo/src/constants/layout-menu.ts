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

/** 侧栏菜单激活态：使用 solid primary + primary foreground，作为侧栏最强选中态 */
export const MENU_SIDEBAR_ACTIVE_UNIFIED =
  'bg-primary! [color:rgb(var(--primary-foreground))]! hover:bg-primary! hover:[color:rgb(var(--primary-foreground))]! focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background' as const

/** 侧栏菜单打开/聚焦/选中态：弱于激活态，强于 hover 态 */
export const MENU_SIDEBAR_OPEN_UNIFIED =
  'bg-primary/10! text-primary! hover:bg-primary/14! hover:text-primary!' as const
/** 侧栏菜单 hover 态：低于打开/聚焦态 */
export const MENU_SIDEBAR_HOVER_UNIFIED = 'hover:bg-primary/10 hover:text-primary' as const
/** 侧栏菜单祖先态（展开的父级，非当前叶节点）：比叶节点激活态更轻 */
export const MENU_SIDEBAR_ANCESTOR_UNIFIED = MENU_SIDEBAR_OPEN_UNIFIED
/** Admin 顶栏 / 面包屑 / 标签栏共用高亮文字色：统一对齐 primary 主色 */
export const MENU_ADMIN_CHROME_TEXT_UNIFIED = 'text-primary!' as const
/** Admin 顶部 chrome 区域激活叶节点：复用侧栏最强选中态，图标通过 text-current 继承 */
export const MENU_ADMIN_CHROME_ACTIVE_UNIFIED = MENU_SIDEBAR_ACTIVE_UNIFIED
/** Admin 顶部 chrome 区域打开/聚焦态：复用侧栏轻量高亮反馈 */
export const MENU_ADMIN_CHROME_OPEN_UNIFIED = MENU_SIDEBAR_OPEN_UNIFIED
/** Admin 顶部 chrome 区域 hover 态：复用侧栏弱高亮反馈 */
export const MENU_ADMIN_CHROME_HOVER_UNIFIED = MENU_SIDEBAR_HOVER_UNIFIED
/** Admin 顶部 chrome 区域祖先态：复用侧栏祖先态，弱于叶节点激活态 */
export const MENU_ADMIN_CHROME_ANCESTOR_UNIFIED = MENU_SIDEBAR_ANCESTOR_UNIFIED
/** Admin chrome popup 可读表面：仅承载颜色、边框、阴影、圆角与内边距，不绑定几何宽度 */
export const MENU_ADMIN_POPUP_SURFACE_UNIFIED =
  'bg-popover/95 border border-solid border-border shadow-lg rounded-md p-xs' as const
/** Admin chrome popup 面板：顶栏、面包屑等普通下拉菜单沿用原有几何 */
export const MENU_ADMIN_POPUP_PANEL_UNIFIED =
  `${MENU_ADMIN_POPUP_SURFACE_UNIFIED} min-w-4xl max-w-5xl` as const
/** Admin tabs 右键菜单面板：仅供 tabs 右键菜单使用；全局右键菜单几何在 ContextMenuProvider 中隔离 */
export const MENU_ADMIN_CONTEXT_PANEL_UNIFIED =
  `${MENU_ADMIN_POPUP_SURFACE_UNIFIED} w-max max-w-[calc(100vw-var(--spacing-lg))]` as const
/** Admin chrome popup 菜单项：顶栏、面包屑、tabs 右键菜单共用 */
export const MENU_ADMIN_POPUP_ITEM_UNIFIED =
  'focus:bg-primary/10 focus:text-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-popover' as const
/** Admin 标签栏激活态：比 hover/focus 更强的底色 + 主色文字 */
export const MENU_ADMIN_TAB_ACTIVE_UNIFIED =
  'bg-primary/14 text-primary hover:bg-primary/14 hover:text-primary transition-colors' as const
/** Admin 标签栏关闭按钮：激活时保持可读，hover 时提供独立危险色反馈 */
export const MENU_ADMIN_TAB_CLOSE_UNIFIED =
  'center rounded-sm p-0.5 duration-md text-current opacity-70 hover:opacity-100 hover:bg-danger/12 hover:text-danger' as const
/** 面包屑当前项：轻量底色 + 主色文字，不使用完整按钮外观 */
export const MENU_BREADCRUMB_CURRENT_UNIFIED = 'bg-primary/12! text-primary!' as const
/** 面包屑 hover 态：比当前项更轻的反馈 */
export const MENU_BREADCRUMB_HOVER_UNIFIED = 'hover:bg-primary/10 hover:text-primary' as const
/** Admin 标签栏未激活 hover 态：仅高亮文字/图标，不引入 hover 背景 */
export const MENU_ADMIN_TAB_INACTIVE_UNIFIED =
  'bg-transparent hover:text-primary transition-colors' as const
/** Admin tabs 右键菜单项：统一 hover/active 高亮色到 primary 体系 */
export const MENU_ADMIN_CONTEXT_ITEM_UNIFIED =
  `flex items-center gap-sm whitespace-nowrap cursor-pointer select-none transition-colors duration-md ease-out-expo border-none bg-transparent px-sm py-xs rounded-sm text-sm text-popover-foreground hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-popover group` as const
/** Admin tabs 右键菜单图标 hover 色：统一对齐 primary */
export const MENU_ADMIN_CONTEXT_ICON_UNIFIED = 'text-current transition-none!' as const

/** 未激活项文字（子级） */
export const MENU_INACTIVE_TEXT = 'text-foreground'
/** 未激活项文字（根级） */
export const MENU_INACTIVE_TEXT_ROOT = 'text-foreground'
/** 侧栏未激活项文字 */
export const MENU_SIDEBAR_INACTIVE_TEXT = 'text-sidebar-foreground'

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
