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
      {
        name: 'col-fill',
        classes: 'flex-1 min-h-0 flex flex-col overflow-hidden',
        desc: '填充列防溢出',
      },
      { name: 'row-y-center', classes: 'flex flex-row items-center' },
      { name: 'row-end', classes: 'flex flex-row items-center justify-end' },
      { name: 'col-stack-xs', classes: 'flex flex-col gap-xs' },
      { name: 'col-stack-sm', classes: 'flex flex-col gap-sm' },
      { name: 'col-stack-md', classes: 'flex flex-col gap-md' },
      { name: 'col-stack-lg', classes: 'flex flex-col gap-lg' },
      { name: 'col-stack-xl', classes: 'flex flex-col gap-xl' },
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
      {
        name: 'layout-content-narrow',
        classes:
          'py-padding-sm md:py-padding-md xl:py-padding-lg 2xl:py-padding-xl mx-auto max-w-[88%] sm:max-w-[84%] md:max-w-[82%] lg:max-w-[80%] xl:max-w-[78%] 2xl:max-w-[76%]',
        desc: '极窄内容容器 (流体)',
      },
      {
        name: 'layout-content',
        classes:
          'py-padding-sm md:py-padding-md xl:py-padding-lg 2xl:py-padding-xl mx-auto max-w-[90%] sm:max-w-[88%] md:max-w-[86%] lg:max-w-[84%] xl:max-w-[82%] 2xl:max-w-[80%]',
        desc: '标准内容容器 (流体)',
      },
      {
        name: 'layout-content-wide',
        classes:
          'py-padding-sm md:py-padding-md xl:py-padding-lg 2xl:py-padding-xl mx-auto max-w-[92%] sm:max-w-[94%] md:max-w-[92%] lg:max-w-[90%] xl:max-w-[88%] 2xl:max-w-[86%] 3xl:max-w-[84%]',
        desc: '加宽内容容器 (流体)',
      },
      { name: 'layout-dialog-sm', classes: 'w-full max-w-[var(--dialog-sm,30vw)]' },
      { name: 'layout-dialog', classes: 'w-full max-w-[var(--dialog-md,40vw)]' },
      { name: 'layout-dialog-lg', classes: 'w-full max-w-[var(--dialog-lg,50vw)]' },
      { name: 'layout-sidepanel', classes: 'w-[var(--sidebar-width,15vw)]' },
      { name: 'layout-scroll-panel', classes: 'max-h-[50vh]' },
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
      { name: 'hover-elevated', classes: 'hover:shadow-md' },
      { name: 'interactive-hover', classes: 'behavior-hover-transition hover-elevated' },
      {
        name: 'interactive-click',
        classes:
          'cursor-pointer select-none active:scale-95 transition-transform duration-scale-md',
      },
      {
        name: 'interactive-focus-ring',
        classes:
          'focus-visible:shadow-[0_0_0_2px_rgb(var(--primary)/0.3)] focus-visible:outline-none',
      },
      {
        name: 'touch-target',
        classes: 'min-w-[44px] min-h-[44px] flex items-center justify-center',
      },
      {
        name: 'header-icon-btn',
        classes:
          'cursor-pointer bg-transparent border-none outline-none duration-scale-sm hover:scale-110 hover:text-accent active:scale-105',
      },
      {
        name: 'interactive-tag',
        classes:
          'fs-xs font-mono bg-muted/30 px-padding-xs py-padding-xs rounded-scale-xs cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-primary/20 hover:text-primary active:scale-95 text-muted-foreground',
        desc: '标签按钮',
      },
      {
        name: 'interactive-tile',
        classes:
          'row-y-center gap-sm px-padding-sm py-padding-xs rounded-scale-md cursor-pointer select-none transition-all duration-scale-lg ease-in-out fs-sm active:scale-95 surface-item interactive-hover-tile interactive-focus-ring',
        desc: '列表项/磁贴',
      },
      {
        name: 'interactive-hover-card',
        classes:
          'transition-all duration-scale-md ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_0_0_1px_rgb(var(--foreground)/0.12),0_8px_30px_rgb(var(--background)/0.85)]',
        desc: '卡片悬浮特效',
      },
      {
        name: 'interactive-hover-tile',
        classes:
          'shadow-soft transition-all duration-scale-xl ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_0_0_1px_rgb(var(--foreground)/0.12),0_8px_30px_rgb(var(--background)/0.85)]',
        desc: '磁贴悬浮特效',
      },
      { name: 'pt-hairline', classes: 'pt-px' },
      { name: 'bg-interactive', classes: 'bg-primary-hover' },
      { name: 'bg-brand', classes: 'bg-primary' },
      { name: 'text-interactive', classes: 'text-primary-hover' },
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
        classes: 'bg-primary/12! dark:bg-primary/30! text-primary!',
        desc: '菜单项悬停态',
      },
      {
        name: 'menu-item-active-leaf',
        classes: 'bg-primary! text-primary-foreground! dark:text-white!',
        desc: '菜单项选中态',
      },
    ],
  },
  {
    category: 'Component 组件基础',
    icon: 'i-lucide-component',
    items: [
      { name: 'component-border', classes: 'shadow-soft' },
      {
        name: 'border-b-default',
        classes: 'border-0 border-b border-solid border-border/15',
        desc: '底部弱边框',
      },
      {
        name: 'border-t-default',
        classes: 'border-0 border-t border-solid border-border/15',
        desc: '顶部弱边框',
      },
      {
        name: 'border-l-default',
        classes: 'border-0 border-l border-solid border-border/15',
        desc: '左侧弱边框',
      },
      {
        name: 'border-r-default',
        classes: 'border-0 border-r border-solid border-border/15',
        desc: '右侧弱边框',
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
    category: 'Premium 视觉系统',
    icon: 'i-lucide-sparkles',
    items: [
      { name: 'glass-surface', classes: 'bg-background/70 backdrop-blur-md' },
      { name: 'glass-surface-lg', classes: 'bg-background/80 backdrop-blur-lg' },
      {
        name: 'shadow-soft',
        classes:
          'shadow-[0_1px_3px_rgb(var(--foreground)/0.10),0_2px_8px_rgb(var(--foreground)/0.08)] dark:shadow-[0_0_0_1px_rgb(var(--foreground)/0.12),0_1px_3px_rgb(var(--background)/0.7),0_2px_8px_rgb(var(--background)/0.5)]',
        desc: '平缓阴影',
      },
      {
        name: 'shadow-float',
        classes:
          'shadow-[0_4px_12px_rgb(var(--foreground)/0.14),0_8px_24px_rgb(var(--foreground)/0.10)] dark:shadow-[0_0_0_1px_rgb(var(--foreground)/0.12),0_4px_12px_rgb(var(--background)/0.9),0_8px_24px_rgb(var(--background)/0.7)]',
        desc: '悬浮阴影',
      },
      { name: 'surface-base', classes: 'bg-background' },
      { name: 'surface-elevated', classes: 'bg-card shadow-soft' },
      {
        name: 'panel-base',
        classes: 'bg-card rounded-scale-xl shadow-soft p-padding-xl flex flex-col gap-lg',
        desc: '大圆角面板',
      },
      {
        name: 'panel-base-md',
        classes: 'bg-card rounded-scale-lg shadow-soft p-padding-lg flex flex-col gap-md',
        desc: '中圆角面板',
      },
      { name: 'surface-sunken', classes: 'bg-muted', desc: '凹陷背景' },
      { name: 'surface-item', classes: 'bg-muted/60 dark:bg-muted', desc: '列表项背景' },
      { name: 'brand-primary', classes: 'text-primary' },
      {
        name: 'transition-fluid',
        classes:
          'transition-[transform,opacity] duration-scale-md ease-[cubic-bezier(0.16,1,0.3,1)]',
      },
      {
        name: 'transition-fade',
        classes: 'transition-opacity duration-scale-sm ease-[cubic-bezier(0.4,0,0.2,1)]',
      },
      { name: 'min-h-kpi-card', classes: 'min-h-[var(--kpi-card-height,20vh)]' },
    ],
  },
  {
    category: 'Size & Visual 尺寸视觉',
    icon: 'i-lucide-scaling',
    items: [
      {
        name: 'size-theme-swatch',
        classes: 'w-[var(--spacing-xl)] h-[var(--spacing-xl)] rounded-scale-md',
      },
      { name: 'size-select-min', classes: 'min-w-[var(--spacing-3xl)]' },
      { name: 'w-table-actions', classes: 'w-[var(--spacing-5xl)]' },
      { name: 'w-dialog-settings', classes: 'w-[var(--dialog-settings-width)] max-w-full' },
      { name: 'h-spacing-lg', classes: 'h-[var(--spacing-lg)]' },
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
      { name: 'def-rounded', classes: 'rounded-scale-md!' },
      { name: 'def-duration', classes: 'duration-scale-md!' },
      { name: 'def-padding', classes: 'p-padding-md!' },
      { name: 'def-margin', classes: 'm-margin-md!' },
      { name: 'def-gap', classes: 'gap-md!' },
      { name: 'def-fs', classes: 'fs-md!' },
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
