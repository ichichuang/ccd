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
    'bg-card cursor-pointer transition-all duration-5xl ease-spring ring-1 ring-offset-1 ring-border/20 ring-offset-border/20 dark:ring-border/40 dark:ring-offset-border/40 hover:ring-border/80 hover:ring-offset-border/80 dark:hover:ring-border dark:hover:ring-offset-border',

  // Interactive Item (交互式列表项)
  'interactive-item':
    'cursor-pointer transition-all duration-md hover:bg-primary/5 dark:hover:bg-primary/15 active:bg-primary/10 dark:active:bg-primary/20 hover:scale-101 active:scale-99',

  // 轻微浮起（hover 卡片 / 列表）
  'material-elevated': `
    bg-card text-card-foreground
    rounded-lg
    p-md
    shadow-sm
    shadow-foreground/20
    dark:shadow-foreground/30
    transition-all duration-md
    hover:shadow-md
  `,

  // Material Solid（表格/数据网格基础材质）
  'material-solid':
    'bg-card text-card-foreground rounded-lg shadow-sm shadow-foreground/10 dark:shadow-foreground/20',

  // INTERNAL - DO NOT USE DIRECTLY
  'glass-base': 'backdrop-blur-xl bg-background/70 dark:bg-card/40',

  // Glass Panel（浮层面板）
  'glass-panel': 'glass-base rounded-xl p-md border border-border/10',

  // Glass Shell（布局壳层）
  'glass-shell': 'glass-base rounded-2xl',

  // Glass Card（玻璃卡片）
  'glass-card': 'glass-base rounded-lg p-md shadow-sm',

  // Glass Icon Box（图标玻璃盒）
  'glass-icon-box': 'glass-base rounded-lg p-sm flex items-center justify-center',

  // 交互原子能力
  'motion-lift': 'transition-all duration-sm shadow-none hover:-translate-y-1 hover:shadow-md',
  'interaction-shrink': 'active:scale-95 transition-transform duration-sm',
  'ring-focus-focus':
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',

  // 胶囊（Header / Sidebar）
  'glass-capsule': `
    bg-background/70 dark:bg-card/40
    backdrop-blur-[20px]
    rounded-2xl
    px-[var(--spacing-md)] py-[var(--spacing-sm)]
  `,

  /** 文档页演示 Well：V6 材质槽位（系统配置 UnoCSS 页等） */
  'demo-well': `
    bg-muted
    border border-border
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

  // Z-Index System (Z-Index System)
  'z-base': 'z-0', // 背景层
  'z-content': 'z-10', // 内容层
  'z-layout': 'z-40', // 布局层
  'z-overlay': 'z-50', // 覆盖层
  'z-popover': 'z-60', // 弹窗层
  'z-toast': 'z-100', // 提示层
} as const
