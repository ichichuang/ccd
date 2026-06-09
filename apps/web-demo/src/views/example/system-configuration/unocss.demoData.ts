export const LAYOUT_MACRO_KEYS = [
  'layout-screen',
  'layout-full',
  'layout-container',
  'layout-narrow',
] as const

export type LayoutMacroKey = (typeof LAYOUT_MACRO_KEYS)[number]

export const COPY_TOAST_GROUP = 'tr' as const

interface FlexMacroDemo {
  className: string
  label: string
  note: string
}

interface LayoutMacroDemo {
  className: LayoutMacroKey
  label: string
  note: string
}

type MaterialClassName =
  | 'bg-card'
  | 'glass-card'
  | 'material-solid'
  | 'glass-card'
  | 'glass-panel'
  | 'glass-shell'
  | 'glass-icon-box'
  | 'glass-capsule'

type InteractionClassName =
  | 'interactive-card'
  | 'interactive-item'
  | 'motion-lift'
  | 'interaction-shrink'
  | 'ring-focus-focus'

interface MaterialShowcaseItem {
  className: MaterialClassName
  title: string
  note: string
  scene: 'card' | 'panel' | 'capsule' | 'solid' | 'shell' | 'iconbox'
}

interface InteractionShowcaseItem {
  className: InteractionClassName
  title: string
  note: string
  scene: 'card-grid' | 'list-row'
}

interface ZLayerCard {
  zClass: string
  numericValue: number
  uiRole: string
  colorClass: string
  blurClass: string
  borderColorClass: string
  badgeSeverity: 'secondary' | 'info' | 'primary' | 'contrast' | 'success' | 'warn' | 'danger'
  positionStyle: Record<string, string>
}

interface MailItem {
  sender: string
  avatar: string
  subject: string
  time: string
}

interface ProductCard {
  name: string
  icon: string
  description: string
}

interface EasingDemo {
  className: string
  label: string
  description: string
  curveHint: string
}

export const flexMacroItems: readonly FlexMacroDemo[] = [
  { className: 'center', label: 'Center', note: '水平 + 垂直绝对居中' },
  { className: 'row-center', label: 'Row Center', note: '横向排列并居中对齐' },
  { className: 'row-between', label: 'Row Between', note: '首尾分布，常用于工具条' },
  { className: 'row-start', label: 'Row Start', note: '横向从起点堆叠' },
  { className: 'row-end', label: 'Row End', note: '横向向末端收拢' },
  { className: 'col-center', label: 'Col Center', note: '纵向排列并居中' },
  { className: 'col-between', label: 'Col Between', note: '纵向首尾分布' },
  { className: 'col-stretch', label: 'Col Stretch', note: '纵向并拉伸子项' },
  { className: 'col-fill', label: 'Col Fill', note: '弹性占满剩余高度' },
]

export const layoutMacroItems: readonly LayoutMacroDemo[] = [
  {
    className: 'layout-screen',
    label: 'Layout Screen',
    note: '全屏锁定视口',
  },
  {
    className: 'layout-full',
    label: 'Layout Full',
    note: '填满父容器',
  },
  {
    className: 'layout-container',
    label: 'Layout Container',
    note: '响应式内边距容器',
  },
  {
    className: 'layout-narrow',
    label: 'Layout Narrow',
    note: '窄幅阅读黄金容器',
  },
]

export const materialShowcaseItems: readonly MaterialShowcaseItem[] = [
  {
    className: 'bg-card',
    title: '基础面',
    note: '基础卡片背景，适合默认信息承载',
    scene: 'card',
  },
  {
    className: 'glass-card',
    title: '浮起面',
    note: '强调 hover 阴影层级，适合区块容器',
    scene: 'card',
  },
  {
    className: 'material-solid',
    title: '实体面',
    note: '表格/数据网格基础材质（ProTable）',
    scene: 'solid',
  },
  {
    className: 'glass-card',
    title: '玻璃卡片',
    note: '轻量毛玻璃卡片，适合卡片化视觉模块',
    scene: 'card',
  },
  {
    className: 'glass-panel',
    title: '浮层面板',
    note: '用于弹层/对话框内容区，不用于页面根容器',
    scene: 'panel',
  },
  {
    className: 'glass-shell',
    title: '玻璃壳层',
    note: '侧栏/顶栏等大壳层（勿与 glass-card 嵌套）',
    scene: 'shell',
  },
  {
    className: 'glass-icon-box',
    title: '图标玻璃盒',
    note: '页头/卡片角标等图标容器',
    scene: 'iconbox',
  },
  {
    className: 'glass-capsule',
    title: '胶囊容器',
    note: '用于 Header 标签、状态胶囊等轻量浮动元素',
    scene: 'capsule',
  },
]

export const interactionShowcaseItems: readonly InteractionShowcaseItem[] = [
  {
    className: 'interactive-card',
    title: '交互卡片',
    note: 'ring 渐强 + 轻微动效，适合整卡可点击区域',
    scene: 'card-grid',
  },
  {
    className: 'interactive-item',
    title: '交互列表项',
    note: '行级 hover/active 反馈，适合列表行或菜单项',
    scene: 'list-row',
  },
  {
    className: 'motion-lift',
    title: '悬停抬升',
    note: '仅提供 hover 抬升能力，可复用到中性卡片',
    scene: 'card-grid',
  },
  {
    className: 'ring-focus-focus',
    title: '聚焦环绕',
    note: 'focus-visible ring 反馈，适合键盘导航/表单控件',
    scene: 'list-row',
  },
  {
    className: 'interaction-shrink',
    title: '按压收缩',
    note: '仅提供 active 按压反馈，适合作为交互补充原子类',
    scene: 'list-row',
  },
]

export const zLayerCards: readonly ZLayerCard[] = [
  {
    zClass: 'z-base',
    numericValue: 0,
    uiRole: '页面画布',
    colorClass: 'bg-muted/25',
    blurClass: '',
    borderColorClass: 'border-border/30',
    badgeSeverity: 'secondary',
    positionStyle: {
      top: 'calc(var(--spacing-sm) + var(--spacing-xs))',
      left: 'calc(var(--spacing-sm) + var(--spacing-xs))',
      width: '88%',
      height: 'calc(var(--spacing-2xl) + var(--spacing-sm) + var(--spacing-xs))',
    },
  },
  {
    zClass: 'z-content',
    numericValue: 10,
    uiRole: '内容卡片',
    colorClass: 'bg-card/85',
    blurClass: 'backdrop-blur-sm',
    borderColorClass: 'border-border/50',
    badgeSeverity: 'info',
    positionStyle: {
      top: 'calc(var(--spacing-3xl) + var(--spacing-md))',
      left: 'calc(var(--spacing-sm) + var(--spacing-md) + var(--spacing-xs))',
      width: '52%',
      height: 'calc(var(--spacing-3xl) + var(--spacing-sm))',
    },
  },
  {
    zClass: 'z-layout',
    numericValue: 40,
    uiRole: 'Sticky 顶栏',
    colorClass: 'bg-primary/12',
    blurClass: 'backdrop-blur-md',
    borderColorClass: 'border-primary/30',
    badgeSeverity: 'primary',
    positionStyle: {
      top: 'var(--spacing-sm)',
      left: 'var(--spacing-sm)',
      width: '84%',
      height: 'calc(var(--spacing-xl) + var(--spacing-sm) + var(--spacing-xs))',
    },
  },
  {
    zClass: 'z-overlay',
    numericValue: 50,
    uiRole: 'Modal 遮罩',
    colorClass: 'bg-background/25',
    blurClass: 'backdrop-blur-sm',
    borderColorClass: 'border-border/20',
    badgeSeverity: 'contrast',
    positionStyle: { top: '4%', left: '4%', width: '92%', height: '92%' },
  },
  {
    zClass: 'z-popover',
    numericValue: 60,
    uiRole: 'Dropdown 弹层',
    colorClass: 'bg-card/95',
    blurClass: 'backdrop-blur-lg',
    borderColorClass: 'border-border/70',
    badgeSeverity: 'warn',
    positionStyle: {
      top: '42%',
      left: '28%',
      width: '38%',
      height: 'var(--spacing-3xl)',
    },
  },
  {
    zClass: 'z-toast',
    numericValue: 100,
    uiRole: 'Toast 通知',
    colorClass: 'bg-success/15',
    blurClass: 'backdrop-blur-md',
    borderColorClass: 'border-success/50',
    badgeSeverity: 'success',
    positionStyle: {
      top: 'var(--spacing-md)',
      left: '62%',
      width: '30%',
      height: 'var(--spacing-2xl)',
    },
  },
]

export const mailItems: readonly MailItem[] = [
  {
    sender: 'Design System',
    avatar: 'D',
    subject:
      'UnoCSS 引擎强调语义宏与原子类共存，通过最小表达式获得最大布局可读性，并让页面结构在不同场景中保持稳定一致。',
    time: '10:24',
  },
  {
    sender: 'Auth Service',
    avatar: 'A',
    subject:
      'Router Guard Pipeline 触发了新的权限拦截事件，需要审查动态路由注册流程中的 Token 验证边界逻辑与 Refresh 策略。',
    time: '09:51',
  },
  {
    sender: 'Release Bot',
    avatar: 'R',
    subject:
      'v2.4.0 已发布：新增 ProForm Engine 批量事务更新、Z-Axis 物理剧场可视化、Size Engine V2 全景密度矩阵与语义快捷类系统。',
    time: '昨天',
  },
]

export const productCards: readonly ProductCard[] = [
  {
    name: 'ProForm Engine',
    icon: 'i-lucide-layout-template',
    description: '支持 14 种字段类型、依赖图 DAG、事务批量更新、竞态安全校验的企业表单引擎',
  },
  {
    name: 'Design Tokens',
    icon: 'i-lucide-palette',
    description: '全语义色彩体系，双模式响应，7 套主题预设，运行时无闪烁切换',
  },
  {
    name: 'Z-Axis Engine',
    icon: 'i-lucide-layers',
    description: '从 z-base 到 z-toast 的物理层级契约，确保 Modal/Popover/Toast 永不穿插',
  },
  {
    name: 'Size Engine V2',
    icon: 'i-lucide-ruler',
    description: 'Compact/Comfortable/Loose 三密度预设，全局级联更新字号间距圆角',
  },
]

export const topicTags: readonly string[] = [
  'Router Guard',
  'Auth Boundary',
  'Dynamic Routes',
  'Semantic Theme',
  'Density Engine',
  'PrimeVue PT',
  'ECharts Hook',
  'Retry Policy',
  'Connection Bus',
  'A11y Ring',
  'Virtualization',
  'Token Sync',
  'ProForm DAG',
  'Z-Axis Stack',
]

export const layoutMacroDemoCount = flexMacroItems.length + layoutMacroItems.length + 1

export const UNOCSS_PAGE_SECTION_COUNT = 5

export const easingDemos: readonly EasingDemo[] = [
  {
    className: 'ease-spring',
    label: 'ease-spring',
    description: '弹性过冲',
    curveHint: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
  {
    className: 'ease-smooth',
    label: 'ease-smooth',
    description: '平滑退出',
    curveHint: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  {
    className: 'ease-out-expo',
    label: 'ease-out-expo',
    description: '指数衰减',
    curveHint: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  {
    className: 'ease-out-quart',
    label: 'ease-out-quart',
    description: '四次方退',
    curveHint: 'cubic-bezier(0.25, 1, 0.5, 1)',
  },
  {
    className: 'ease-in-out-expo',
    label: 'ease-in-out-expo',
    description: '双向指数',
    curveHint: 'cubic-bezier(0.87, 0, 0.13, 1)',
  },
]
