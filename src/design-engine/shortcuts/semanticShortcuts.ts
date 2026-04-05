/**
 * Pure semantic shortcut object for UnoCSS.
 *
 * NO dynamic regex here. All dynamic/validated generation lives in `src/design-engine/rules/**`.
 */
export const semanticShortcuts = {
  // Flex 9-grid (9个高频 flex 定位语义)
  center: 'flex justify-center items-center',
  'row-center': 'flex flex-row items-center justify-center',
  'row-between': 'flex flex-row items-center justify-between',
  'row-start': 'flex flex-row items-start justify-start',
  'row-end': 'flex flex-row items-center justify-end',
  'col-center': 'flex flex-col items-center justify-center',
  'col-between': 'flex flex-col justify-between',
  'col-stretch': 'flex flex-col items-stretch',
  'col-fill': 'flex-1 min-h-0 flex flex-col overflow-hidden',

  // Layout Containers (Layout Mode)
  'layout-screen': 'w-screen h-100dvh overflow-hidden', // 全屏布局容器（动态视口高度，避免移动端地址栏裁切）
  'layout-full': 'w-full h-full', // 全屏布局容器
  'layout-container':
    'w-full flex flex-col p-xs sm:p-sm md:p-md lg:p-lg gap-sm md:gap-md lg:gap-lg', // 响应式容器
  'layout-narrow':
    'flex flex-col mx-auto p-xs sm:p-sm md:p-md lg:p-lg xl:p-xl w-98% sm:w-92% md:w-88% lg:w-84% xl:w-82% 2xl:w-78%  gap-sm md:gap-md lg:gap-lg', // 窄屏布局容器

  // Positioning (Absolute Center)
  'absolute-center': 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2', // 绝对居中定位

  /** Single-line no wrap — alias avoids `whitespace-*` in templates when banning literal `white` substring audits. */
  'text-no-wrap': 'whitespace-nowrap', // 单行不换行

  // Typography truncation (Text Ellipsis)
  ['text-ellipsis-1']: 'overflow-hidden whitespace-nowrap text-ellipsis', // 单行省略
  ['text-ellipsis-2']: 'line-clamp-2 overflow-hidden', // 多行省略

  // Scrollbars (禁止滚动条)
  'scrollbar-none':
    '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', // 禁止滚动条

  // Interactive Card (交互式卡片)
  'interactive-card':
    'bg-card rounded-lg p-md transition-all duration-lg ease-spring ring-1 ring-offset-1 ring-border/20 ring-offset-border/20 dark:ring-border/40 dark:ring-offset-border/40 hover:ring-border/80 hover:ring-offset-border/80 dark:hover:ring-border dark:hover:ring-offset-border',

  // Interactive Item (交互式列表项)
  'interactive-item':
    'cursor-pointer px-md py-sm rounded-sm transition-all duration-md hover:bg-primary/5 dark:hover:bg-foreground/[0.05] active:bg-primary/10 dark:active:bg-foreground/[0.08] hover:translate-y--1px',

  // 轻微浮起（hover 卡片 / 列表）
  'material-elevated':
    'bg-card text-card-foreground rounded-lg p-md border border-solid border-transparent dark:border-border/15 shadow-sm transition-all duration-md hover:shadow-md dark:shadow-[inset_0_1px_0_0_rgb(var(--foreground)/0.05)] dark:hover:shadow-[inset_0_1px_0_0_rgb(var(--foreground)/0.1)]',

  // Material Solid（表格/数据网格基础材质）
  'material-solid':
    'bg-card text-card-foreground rounded-lg border border-solid border-transparent shadow-sm dark:border-border/15 dark:shadow-none',

  // INTERNAL - DO NOT USE DIRECTLY
  // 移动端降低 blur 强度并提升底色不透明度；md+ 恢复完整玻璃模糊。
  'glass-base':
    'backdrop-blur-sm md:backdrop-blur-xl bg-card/60! md:bg-card/36! dark:bg-card/70! md:dark:bg-card/40! transform-gpu will-change-[backdrop-filter]',

  // Glass Panel（浮层面板）
  'glass-panel':
    'glass-base rounded-xl p-md border border-solid border-border/15 dark:border-border/30 shadow-sm dark:shadow-[inset_0_1px_0_0_rgb(var(--foreground)/0.05)]',

  // Glass Shell（布局壳层）
  'glass-shell': 'glass-base rounded-2xl border border-solid border-border/5 dark:border-border/15',

  // Glass Card（玻璃卡片）
  'glass-card':
    'glass-base rounded-lg p-md border border-solid border-border/10 dark:border-border/20 shadow-sm dark:shadow-[inset_0_1px_0_0_rgb(var(--foreground)/0.05)]',

  // Glass Icon Box（图标玻璃盒）
  'glass-icon-box':
    'glass-base center rounded-lg p-sm border border-solid border-border/10 dark:border-border/20',

  // 交互原子能力
  'motion-lift': 'transition-all duration-sm shadow-none hover:-translate-y-1 hover:shadow-md',
  'interaction-shrink': 'active:scale-95 transition-transform duration-sm',
  'ring-focus-focus':
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',

  // 胶囊（Header / Sidebar）
  'glass-capsule': 'glass-base rounded-2xl px-md py-sm',

  /** 文档页演示 Well：V6 材质槽位（系统配置 UnoCSS 页等） */
  'demo-well': `
    bg-muted
    border border-solid border-border
    rounded-xl
    p-md
    overflow-hidden
  `,

  /** demo-well 内嵌布局舞台（轻分隔、无叠影） */
  'demo-stage': `
    rounded-md
    border border-dashed border-border
    min-h-0
  `,

  // Code Display
  /** Pre block: monospaced, muted bg, horizontal scroll */
  'code-block': 'text-xs font-mono text-foreground bg-muted rounded-md p-sm overflow-x-auto',
  /** Inline code span: monospaced, minimal */
  'code-inline': 'font-mono text-xs text-foreground',
  /** Debug/preview pre: wrapping monospaced, no margin */
  'code-preview': 'm-0 whitespace-pre-wrap break-words text-xs font-mono',

  // Soft Colored Surfaces (柔和彩色信息面)
  'surface-primary': 'bg-primary/10 text-primary dark:bg-primary/15',
  'surface-success': 'bg-success/10 text-success dark:bg-success/15',
  'surface-warn': 'bg-warn/10 text-warn dark:bg-warn/15',
  'surface-danger': 'bg-danger/10 text-danger dark:bg-danger/15',
  'surface-info': 'bg-info/10 text-info dark:bg-info/15',

  // Z-Index System (Z-Index System)
  'z-base': 'z-0', // 背景层
  'z-content': 'z-10', // 内容层
  'z-layout': 'z-40', // 布局层
  'z-overlay': 'z-50', // 覆盖层
  'z-popover': 'z-60', // 弹窗层
  'z-toast': 'z-100', // 提示层
} as const
