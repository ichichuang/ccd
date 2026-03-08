/**
 * UnoCSS 快捷类名配置（完整覆盖 uno.config.ts）
 * 抽取自 unocss.vue，减少主文件体积
 */

export interface ShortcutItem {
  name: string
  classes: string
  desc?: string
}

export interface ShortcutGroup {
  category: string
  icon: string
  items: ShortcutItem[]
}

export const shortcutGroups: ShortcutGroup[] = [
  {
    category: 'Density 密度语义',
    icon: 'i-lucide-rows-3',
    items: [
      { name: 'density-compact', classes: 'gap-sm p-padding-sm', desc: '紧凑模式' },
      { name: 'density-normal', classes: 'gap-md p-padding-md', desc: '标准模式' },
      { name: 'density-comfortable', classes: 'gap-lg p-padding-lg', desc: '舒适模式' },
      { name: 'density-responsive', classes: 'density-compact md:density-normal', desc: '响应式' },
    ],
  },
  {
    category: 'Flex 基础',
    icon: 'i-lucide-columns-3',
    items: [
      { name: 'center', classes: 'flex justify-center items-center' },
      { name: 'row', classes: 'flex flex-row' },
      { name: 'column', classes: 'flex flex-col' },
      { name: 'flex-row', classes: 'flex flex-row' },
      { name: 'flex-col', classes: 'flex flex-col' },
      { name: 'flex-wrap', classes: 'flex flex-wrap' },
      { name: 'flex-nowrap', classes: 'flex flex-nowrap' },
    ],
  },
  {
    category: 'Flex 主轴对齐 (justify-content)',
    icon: 'i-lucide-align-horizontal-justify-center',
    items: [
      { name: 'main-start', classes: 'justify-start' },
      { name: 'main-center', classes: 'justify-center' },
      { name: 'main-end', classes: 'justify-end' },
      { name: 'main-between', classes: 'justify-between' },
      { name: 'main-around', classes: 'justify-around' },
      { name: 'main-evenly', classes: 'justify-evenly' },
    ],
  },
  {
    category: 'Flex 交叉轴对齐 (align-items)',
    icon: 'i-lucide-align-vertical-justify-center',
    items: [
      { name: 'cross-start', classes: 'items-start' },
      { name: 'cross-center', classes: 'items-center' },
      { name: 'cross-end', classes: 'items-end' },
      { name: 'cross-stretch', classes: 'items-stretch' },
    ],
  },
  {
    category: 'Flex 高频组合',
    icon: 'i-lucide-layout-grid',
    items: [
      { name: 'row-center', classes: 'flex flex-row items-center justify-center' },
      { name: 'row-between', classes: 'flex flex-row items-center justify-between' },
      { name: 'row-start', classes: 'flex flex-row items-start justify-start' },
      { name: 'column-center', classes: 'flex flex-col items-center justify-center' },
      { name: 'column-between', classes: 'flex flex-col justify-between' },
    ],
  },
  {
    category: 'Layout 布局结构',
    icon: 'i-lucide-layout',
    items: [
      { name: 'layout-full', classes: 'w-full h-full' },
      { name: 'layout-screen', classes: 'w-screen h-screen' },
      { name: 'layout-container', classes: 'bg-background text-foreground' },
      { name: 'layout-stack', classes: 'flex flex-col density-normal' },
      { name: 'layout-wrap', classes: 'flex flex-wrap density-normal' },
      { name: 'layout-grid-center', classes: 'grid place-items-center' },
      {
        name: 'layout-absolute-center',
        classes: 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      },
    ],
  },
  {
    category: 'Text 文本排版',
    icon: 'i-lucide-type',
    items: [
      {
        name: 'text-single-line-ellipsis',
        classes: 'overflow-hidden whitespace-nowrap text-ellipsis',
      },
      { name: 'text-two-line-ellipsis', classes: 'line-clamp-2 overflow-hidden' },
      { name: 'text-muted', classes: 'text-muted-foreground' },
      { name: 'text-secondary', classes: 'text-secondary-foreground' },
    ],
  },
  {
    category: 'Interaction 交互行为',
    icon: 'i-lucide-pointer',
    items: [
      { name: 'behavior-hover-transition', classes: 'transition-all duration-scale-md' },
      { name: 'hover-elevated', classes: 'hover:shadow-md hover:border-primary-hover/50' },
      { name: 'interactive-hover', classes: 'behavior-hover-transition hover-elevated' },
      {
        name: 'interactive-click',
        classes:
          'cursor-pointer select-none active:scale-95 transition-transform duration-scale-md',
      },
      {
        name: 'interactive-focus-ring',
        classes: 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      },
    ],
  },
  {
    category: 'Menu 菜单交互',
    icon: 'i-lucide-menu',
    items: [
      {
        name: 'menu-item-base',
        classes:
          'flex items-center gap-sm cursor-pointer select-none transition-all duration-scale-md ease-in-out border-none bg-transparent',
        desc: '菜单项基础样式',
      },
      {
        name: 'menu-item-hover',
        classes: 'bg-primary/12! text-primary! dark:text-white!',
        desc: '菜单项悬停态 (12% 标准)',
      },
      {
        name: 'menu-item-active-leaf',
        classes: 'bg-primary! text-primary-foreground! dark:text-white!',
        desc: '菜单项选中态（primary 背景 + primary-foreground 统一样式）',
      },
    ],
  },
  {
    category: 'Component 组件基础',
    icon: 'i-lucide-component',
    items: [
      { name: 'component-border', classes: 'border border-solid border-border' },
      {
        name: 'border-b-default',
        classes: 'border-0 border-b border-solid border-border',
        desc: '底部边框',
      },
      {
        name: 'border-t-default',
        classes: 'border-0 border-t border-solid border-border',
        desc: '顶部边框',
      },
      {
        name: 'component-card-base',
        classes: 'rounded-scale-md bg-card text-card-foreground component-border',
      },
      { name: 'component-card-hoverable', classes: 'behavior-hover-transition hover-elevated' },
      { name: 'component-card-layout', classes: 'density-normal' },
      { name: 'component-card-content', classes: 'row-center' },
      {
        name: 'component-card',
        classes:
          'component-card-base component-card-hoverable component-card-layout component-card-content',
      },
    ],
  },
  {
    category: 'Size & Visual 尺寸视觉',
    icon: 'i-lucide-scaling',
    items: [
      {
        name: 'size-theme-swatch',
        classes: 'w-[var(--spacing-lg)] h-[var(--spacing-lg)] rounded-full',
      },
      { name: 'size-select-min', classes: 'min-w-[var(--spacing-3xl)]' },
      {
        name: 'sidebar-width-transition',
        classes: 'transition-[width] duration-scale-md ease-in-out',
      },
    ],
  },
  {
    category: 'Design Defaults 设计默认值',
    icon: 'i-lucide-settings',
    items: [
      { name: 'default-rounded', classes: 'rounded-scale-md' },
      { name: 'default-duration', classes: 'duration-scale-md' },
      { name: 'default-padding', classes: 'p-padding-md' },
      { name: 'default-margin', classes: 'm-margin-md' },
      { name: 'default-gap', classes: 'gap-md' },
      { name: 'default-font-size', classes: 'fs-md' },
    ],
  },
  {
    category: 'Responsive Gaps 响应式间距',
    icon: 'i-lucide-split',
    items: [
      { name: 'gap-x-*', classes: 'gap-x-sm | gap-x-md | gap-x-lg', desc: '水平间距阶梯' },
      { name: 'gap-y-*', classes: 'gap-y-sm | gap-y-md | gap-y-lg', desc: '垂直间距阶梯' },
    ],
  },
  {
    category: 'Special Spacing Rules 特殊间距规则',
    icon: 'i-lucide-move',
    items: [
      { name: 'm-gap-*', classes: 'm-gap-md', desc: 'Margin 匹配 Gap (SSOT)' },
      { name: 'scroll-m-gap-*', classes: 'scroll-m-gap-lg', desc: '滚动贴合偏移 (匹配 Gap)' },
    ],
  },
]
