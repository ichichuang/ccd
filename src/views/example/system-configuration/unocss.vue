<script setup lang="ts">
import { semanticShortcuts } from '@/design-engine/shortcuts/semanticShortcuts'
import { goToRoute } from '@/router/utils/helper'

defineOptions({ name: 'UnoCssSystemPage' })

const LAYOUT_MACRO_KEYS = [
  'layout-screen',
  'layout-full',
  'layout-container',
  'layout-narrow',
] as const

type LayoutMacroKey = (typeof LAYOUT_MACRO_KEYS)[number]

const COPY_TOAST_GROUP = 'tr' as const

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
  | 'material-elevated'
  | 'glass-card'
  | 'glass-panel'
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
  scene: 'card' | 'panel' | 'capsule'
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

const flexMacroItems: readonly FlexMacroDemo[] = [
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

const layoutMacroItems: readonly LayoutMacroDemo[] = [
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

const materialShowcaseItems: readonly MaterialShowcaseItem[] = [
  {
    className: 'bg-card',
    title: '基础面',
    note: '基础卡片背景，适合默认信息承载',
    scene: 'card',
  },
  {
    className: 'material-elevated',
    title: '浮起面',
    note: '强调 hover 阴影层级，适合区块容器',
    scene: 'card',
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
    className: 'glass-capsule',
    title: '胶囊容器',
    note: '用于 Header 标签、状态胶囊等轻量浮动元素',
    scene: 'capsule',
  },
]

const interactionShowcaseItems: readonly InteractionShowcaseItem[] = [
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

const layoutMacroExpandedTokens = computed<Record<LayoutMacroKey, string[]>>(() => {
  return Object.fromEntries(
    LAYOUT_MACRO_KEYS.map(key => {
      const raw = semanticShortcuts[key]
      const normalized = typeof raw === 'string' ? raw.replace(/\s+/g, ' ').trim() : ''
      const tokens = normalized ? normalized.split(' ').filter(Boolean) : []
      return [key, tokens]
    })
  ) as Record<LayoutMacroKey, string[]>
})

const section3ShortcutTokens = computed<Record<string, string[]>>(() => {
  const classNames: string[] = [
    ...materialShowcaseItems.map(item => item.className),
    ...interactionShowcaseItems.map(item => item.className),
  ]

  const uniqueClassNames = Array.from(new Set(classNames))
  return Object.fromEntries(
    uniqueClassNames.map(className => {
      const raw = semanticShortcuts[className as keyof typeof semanticShortcuts]
      const normalized = typeof raw === 'string' ? raw.replace(/\s+/g, ' ').trim() : className
      const tokens = normalized ? normalized.split(' ').filter(Boolean) : [className]
      return [className, tokens]
    })
  )
})

const zLayerCards: readonly ZLayerCard[] = [
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

const mailItems: readonly MailItem[] = [
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

const productCards: readonly ProductCard[] = [
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

const topicTags: readonly string[] = [
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

const easingDemos: readonly EasingDemo[] = [
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

async function copyClassName(className: string, label: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(className)
    window.$toast?.add({
      severity: 'success',
      summary: '已复制',
      detail: `${className}（${label}）`,
      life: 2000,
      group: COPY_TOAST_GROUP,
    })
  } catch {
    window.$toast?.add({
      severity: 'error',
      summary: '复制失败',
      detail: '请检查剪贴板权限',
      life: 2000,
      group: COPY_TOAST_GROUP,
    })
  }
}
</script>

<template>
  <div data-archetype="A1-toolbar-content">
    <CScrollbar>
      <div class="layout-narrow">
        <!-- Header -->
        <header class="col-stretch gap-xs md:gap-sm">
          <h1 class="text-2xl font-bold text-foreground m-0 tracking-tight">
            UnoCSS 引擎快捷类全景
          </h1>
          <p class="text-sm text-muted-foreground m-0">
            布局宏 · Z-Axis 层级 · 材质系统 · 文本溢出 · 动效缓动——Theme / Size 之外的底层能力
          </p>
          <div class="text-xs text-muted-foreground m-0 row-start gap-xs flex-wrap">
            <span>覆盖快捷类：</span>
            <span class="font-mono text-primary">
              {{ flexMacroItems.length + layoutMacroItems.length + 1 }} 个布局宏
            </span>
            <span class="text-muted-foreground/40">·</span>
            <span>相关页面：</span>
            <div
              role="button"
              tabindex="0"
              class="interactive-item ring-focus-focus text-primary"
              @click="goToRoute('theme')"
              @keydown.enter.prevent="goToRoute('theme')"
              @keydown.space.prevent="goToRoute('theme')"
            >
              主题系统
            </div>
            <span>·</span>
            <div
              role="button"
              tabindex="0"
              class="interactive-item ring-focus-focus text-primary"
              @click="goToRoute('size')"
              @keydown.enter.prevent="goToRoute('size')"
              @keydown.space.prevent="goToRoute('size')"
            >
              尺寸系统
            </div>
          </div>
        </header>

        <!-- Section 1: 布局引擎宏 -->
        <section class="material-elevated col-stretch gap-lg">
          <div class="col-stretch gap-xs md:gap-sm">
            <h2 class="text-lg font-semibold text-foreground m-0">Section 1 · 布局引擎宏</h2>
            <p class="text-xs text-muted-foreground m-0">
              Flex 9-Grid 语义宏、absolute-center 定位、Layout 容器宏——点击类名可复制
            </p>
          </div>

          <!-- Flex 9-Grid -->
          <div class="col-stretch gap-sm">
            <p class="text-sm font-medium text-foreground m-0">Flex 9-Grid 语义宏</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg xl:gap-xl">
              <div
                v-for="item in flexMacroItems"
                :key="item.className"
                class="col-stretch gap-sm"
              >
                <div
                  role="button"
                  tabindex="0"
                  class="interactive-item ring-focus-focus row-start font-mono text-primary"
                  @click="copyClassName(item.className, '布局宏')"
                  @keydown.enter.prevent="copyClassName(item.className, '布局宏')"
                  @keydown.space.prevent="copyClassName(item.className, '布局宏')"
                >
                  .{{ item.className }}
                </div>
                <p class="text-xs text-muted-foreground m-0">{{ item.note }}</p>
                <div
                  class="bg-muted/30 dark:bg-muted/20 border border-border/40 rounded-lg p-md overflow-hidden min-h-[var(--spacing-4xl)]"
                >
                  <div class="demo-stage h-15vh px-sm py-xs">
                    <div
                      v-if="item.className === 'col-fill'"
                      class="col-stretch layout-full"
                    >
                      <div class="h-[var(--spacing-md)] rounded-md bg-primary/15" />
                      <div class="col-fill px-xs py-xs">
                        <div class="h-full col-between">
                          <div
                            class="w-[var(--spacing-md)] h-[var(--spacing-md)] rounded-md bg-primary/25"
                          />
                          <div
                            class="w-[var(--spacing-md)] h-[var(--spacing-md)] rounded-md bg-primary/35"
                          />
                          <div
                            class="w-[var(--spacing-md)] h-[var(--spacing-md)] rounded-md bg-primary/45"
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      v-else-if="item.className === 'col-stretch'"
                      :class="item.className"
                      class="layout-full"
                    >
                      <div class="h-[var(--spacing-md)] rounded-md bg-primary/25" />
                      <div class="h-[var(--spacing-md)] rounded-md bg-primary/35" />
                      <div class="h-[var(--spacing-md)] rounded-md bg-primary/45" />
                    </div>
                    <div
                      v-else-if="item.className === 'center'"
                      :class="item.className"
                      class="layout-full"
                    >
                      <div class="row-center gap-xs">
                        <div
                          class="w-[var(--spacing-md)] h-[var(--spacing-md)] rounded-md bg-primary/25"
                        />
                        <div
                          class="w-[var(--spacing-md)] h-[var(--spacing-md)] rounded-md bg-primary/35"
                        />
                        <div
                          class="w-[var(--spacing-md)] h-[var(--spacing-md)] rounded-md bg-primary/45"
                        />
                      </div>
                    </div>
                    <div
                      v-else
                      :class="item.className"
                      class="layout-full"
                    >
                      <div
                        class="w-[var(--spacing-md)] h-[var(--spacing-md)] rounded-md bg-primary/25"
                      />
                      <div
                        class="w-[var(--spacing-md)] h-[var(--spacing-md)] rounded-md bg-primary/35"
                      />
                      <div
                        class="w-[var(--spacing-md)] h-[var(--spacing-md)] rounded-md bg-primary/45"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- absolute-center -->
          <div class="col-stretch gap-sm">
            <p class="text-sm font-medium text-foreground m-0">absolute-center · 绝对居中定位</p>
            <p class="text-xs text-muted-foreground m-0">
              父容器需设置
              <code class="code-inline">position: relative</code>
              ，子元素使用此快捷类自动居中
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-sm items-center">
              <div
                role="button"
                tabindex="0"
                class="interactive-item ring-focus-focus row-start font-mono text-primary self-start"
                @click="copyClassName('absolute-center', '绝对居中')"
                @keydown.enter.prevent="copyClassName('absolute-center', '绝对居中')"
                @keydown.space.prevent="copyClassName('absolute-center', '绝对居中')"
              >
                .absolute-center
              </div>
              <div
                class="bg-muted/30 dark:bg-muted/20 border border-border/40 rounded-lg p-md overflow-hidden relative h-[var(--spacing-5xl)]"
              >
                <div class="absolute-center col-center gap-xs">
                  <ProgressSpinner
                    class="w-[var(--spacing-xl)] h-[var(--spacing-xl)]"
                    stroke-width="3"
                  />
                  <span class="text-xs text-muted-foreground text-no-wrap">absolute-center</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Layout 容器宏 -->
          <div class="col-stretch gap-sm">
            <p class="text-sm font-medium text-foreground m-0">Layout 容器宏</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-sm">
              <div
                v-for="item in layoutMacroItems"
                :key="item.className"
                role="button"
                tabindex="0"
                class="interactive-card ring-focus-focus rounded-lg p-sm col-stretch gap-xs w-full"
                @click="copyClassName(item.className, '容器宏')"
                @keydown.enter.prevent="copyClassName(item.className, '容器宏')"
                @keydown.space.prevent="copyClassName(item.className, '容器宏')"
              >
                <div class="row-between gap-xs">
                  <Tag
                    :value="item.className"
                    severity="secondary"
                    class="shrink-0"
                  />
                  <Tag
                    :value="item.note"
                    class="shrink-0"
                  />
                </div>
                <div class="demo-well col-stretch gap-xs w-full">
                  <div class="row-start gap-xs flex-wrap">
                    <Tag
                      v-for="cls in layoutMacroExpandedTokens[item.className]"
                      :key="`${item.className}-${cls}`"
                      :value="cls"
                      severity="secondary"
                      class="shrink-0 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 2: 材质与交互系统 -->
        <section class="material-elevated col-stretch gap-lg">
          <div class="col-stretch gap-xs md:gap-sm">
            <h2 class="text-lg font-semibold text-foreground m-0">Section 2 · 材质与交互系统</h2>
            <p class="text-xs text-muted-foreground m-0">
              语义材质层 + 交互原子能力：可复制、可展开、可对比，保持与布局宏一致的学习路径
            </p>
          </div>

          <div class="col-stretch gap-md">
            <p class="text-sm font-medium text-foreground m-0">材质系统示例（语义面 + 浮层面）</p>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
              <div
                v-for="item in materialShowcaseItems"
                :key="item.className"
                class="col-stretch gap-sm"
              >
                <div
                  role="button"
                  tabindex="0"
                  class="interactive-item ring-focus-focus row-start font-mono text-primary"
                  @click="copyClassName(item.className, '材质系统')"
                  @keydown.enter.prevent="copyClassName(item.className, '材质系统')"
                  @keydown.space.prevent="copyClassName(item.className, '材质系统')"
                >
                  .{{ item.className }}
                </div>
                <p class="text-xs text-muted-foreground m-0">{{ item.note }}</p>
                <div class="demo-well col-stretch gap-sm">
                  <div class="row-start gap-xs flex-wrap">
                    <Tag
                      v-for="token in section3ShortcutTokens[item.className]"
                      :key="`${item.className}-${token}`"
                      :value="token"
                      severity="secondary"
                      class="shrink-0 font-mono text-xs"
                    />
                  </div>
                  <div class="demo-stage h-15vh p-sm center">
                    <div
                      v-if="item.scene === 'card'"
                      :class="[
                        item.className,
                        'w-full rounded-lg p-sm col-stretch gap-xs border border-border/30',
                      ]"
                    >
                      <div class="h-[var(--spacing-sm)] rounded-sm bg-muted/50 w-3/4" />
                      <div class="h-[var(--spacing-sm)] rounded-sm bg-muted/30 w-1/2" />
                      <div class="h-[var(--spacing-sm)] rounded-sm bg-muted/20 w-2/3" />
                    </div>
                    <div
                      v-else-if="item.scene === 'panel'"
                      class="w-full h-full center rounded-lg border border-border/30 bg-muted/20 p-sm"
                    >
                      <div :class="[item.className, 'w-84% col-stretch gap-xs']">
                        <div class="row-between">
                          <span class="text-xs font-medium text-foreground">Panel Header</span>
                          <Icons
                            name="i-lucide-x"
                            size="sm"
                            class="text-muted-foreground"
                          />
                        </div>
                        <div class="h-[var(--spacing-sm)] rounded-sm bg-muted/40 w-full" />
                        <div class="h-[var(--spacing-sm)] rounded-sm bg-muted/30 w-2/3" />
                      </div>
                    </div>
                    <div
                      v-else
                      class="w-full h-full center rounded-lg border border-border/30 bg-muted/20"
                    >
                      <div :class="[item.className, 'col-center gap-xs']">
                        <span class="text-xs font-mono text-foreground font-semibold">
                          {{ item.className }}
                        </span>
                        <Tag
                          value="capsule"
                          severity="secondary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-stretch gap-md">
            <p class="text-sm font-medium text-foreground m-0">交互系统示例（卡片态 / 列表态）</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div
                v-for="item in interactionShowcaseItems"
                :key="item.className"
                class="col-stretch gap-sm"
              >
                <div
                  role="button"
                  tabindex="0"
                  class="interactive-item ring-focus-focus row-start font-mono text-primary"
                  @click="copyClassName(item.className, '交互系统')"
                  @keydown.enter.prevent="copyClassName(item.className, '交互系统')"
                  @keydown.space.prevent="copyClassName(item.className, '交互系统')"
                >
                  .{{ item.className }}
                </div>
                <p class="text-xs text-muted-foreground m-0">{{ item.note }}</p>
                <!-- 与 demo-well 同视觉，但不使用 overflow-hidden，避免 hover 阴影被裁切 -->
                <div class="bg-muted border border-border rounded-xl p-md col-stretch gap-sm">
                  <div class="row-start gap-xs flex-wrap">
                    <Tag
                      v-for="token in section3ShortcutTokens[item.className]"
                      :key="`${item.className}-${token}`"
                      :value="token"
                      severity="secondary"
                      class="shrink-0 font-mono text-xs"
                    />
                  </div>
                  <div
                    v-if="item.scene === 'card-grid'"
                    class="demo-stage p-md grid grid-cols-3 gap-sm"
                  >
                    <template v-if="item.className === 'motion-lift'">
                      <!-- 勿挂 Button：.p-button overflow:hidden 会裁切阴影；用 div 还原 motion-lift -->
                      <div
                        v-for="i in 3"
                        :key="`motion-lift-card-${i}`"
                        class="motion-lift w-full rounded-lg p-sm col-center gap-xs bg-card border border-border/30"
                      >
                        <Icons
                          name="i-lucide-layers"
                          size="md"
                          class="text-primary"
                        />
                        <span class="text-xs text-foreground">卡片 {{ i }}</span>
                      </div>
                    </template>
                    <template v-else>
                      <div
                        v-for="i in 3"
                        :key="`${item.className}-card-${i}`"
                        role="button"
                        :tabindex="item.className === 'ring-focus-focus' ? 0 : -1"
                        class="w-full rounded-lg p-sm col-center gap-xs"
                        :class="item.className"
                        @keydown.enter.prevent
                        @keydown.space.prevent
                      >
                        <Icons
                          name="i-lucide-layers"
                          size="md"
                          class="text-primary"
                        />
                        <span class="text-xs text-foreground">卡片 {{ i }}</span>
                      </div>
                    </template>
                  </div>
                  <div
                    v-else
                    class="demo-stage p-sm col-stretch gap-xs"
                  >
                    <div
                      v-for="i in 3"
                      :key="`${item.className}-row-${i}`"
                      role="button"
                      :tabindex="item.className === 'ring-focus-focus' ? 0 : -1"
                      class="w-full rounded-md px-sm py-xs row-between"
                      :class="item.className"
                      @keydown.enter.prevent
                      @keydown.space.prevent
                    >
                      <span class="text-xs text-foreground">列表行 {{ i }}</span>
                      <Icons
                        name="i-lucide-chevron-right"
                        size="sm"
                        class="text-muted-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 3: 文本控制与溢出 -->
        <section class="material-elevated col-stretch gap-lg">
          <div class="col-stretch gap-xs md:gap-sm">
            <h2 class="text-lg font-semibold text-foreground m-0">Section 3 · 文本控制与溢出</h2>
            <p class="text-xs text-muted-foreground m-0">
              text-ellipsis-1/2 · scrollbar-none · text-no-wrap——在真实业务 UI 语境中理解截断行为
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div class="col-stretch gap-lg">
              <!-- text-ellipsis-1 -->
              <div class="col-stretch gap-sm">
                <div class="row-between gap-sm">
                  <div
                    role="button"
                    tabindex="0"
                    class="interactive-item ring-focus-focus row-start font-mono text-primary shrink"
                    @click="copyClassName('text-ellipsis-1', '单行截断')"
                    @keydown.enter.prevent="copyClassName('text-ellipsis-1', '单行截断')"
                    @keydown.space.prevent="copyClassName('text-ellipsis-1', '单行截断')"
                  >
                    .text-ellipsis-1
                  </div>
                  <span class="text-xs text-muted-foreground shrink-0">邮件收件箱行</span>
                </div>
                <div
                  class="bg-muted/30 dark:bg-muted/20 border border-border/40 rounded-lg p-md overflow-hidden col-stretch gap-xs"
                >
                  <div
                    v-for="mail in mailItems"
                    :key="mail.sender"
                    role="button"
                    tabindex="0"
                    class="w-full interactive-item ring-focus-focus rounded-md px-sm py-xs row-start gap-sm"
                    @keydown.enter.prevent
                    @keydown.space.prevent
                  >
                    <div
                      class="w-[var(--spacing-xl)] h-[var(--spacing-xl)] rounded-full bg-primary/20 center shrink-0"
                    >
                      <span class="text-xs font-bold text-primary">{{ mail.avatar }}</span>
                    </div>
                    <div class="col-stretch flex-1 min-w-0 gap-xs text-left">
                      <span class="text-xs font-semibold text-foreground text-no-wrap">
                        {{ mail.sender }}
                      </span>
                      <span class="text-xs text-muted-foreground text-ellipsis-1">
                        {{ mail.subject }}
                      </span>
                    </div>
                    <span class="text-xs text-muted-foreground shrink-0">{{ mail.time }}</span>
                  </div>
                </div>
              </div>

              <!-- text-ellipsis-2 -->
              <div class="col-stretch gap-sm">
                <div class="row-between gap-sm">
                  <div
                    role="button"
                    tabindex="0"
                    class="interactive-item ring-focus-focus row-start font-mono text-primary shrink"
                    @click="copyClassName('text-ellipsis-2', '双行截断')"
                    @keydown.enter.prevent="copyClassName('text-ellipsis-2', '双行截断')"
                    @keydown.space.prevent="copyClassName('text-ellipsis-2', '双行截断')"
                  >
                    .text-ellipsis-2
                  </div>
                  <span class="text-xs text-muted-foreground shrink-0">产品卡片描述</span>
                </div>
                <div
                  class="grid grid-cols-2 gap-sm bg-muted/30 dark:bg-muted/20 border border-border/40 rounded-lg p-md overflow-hidden"
                >
                  <div
                    v-for="product in productCards"
                    :key="product.name"
                    role="button"
                    tabindex="0"
                    class="interactive-item ring-focus-focus rounded-lg p-sm col-stretch gap-xs w-full"
                    @click="copyClassName('text-ellipsis-2', '双行截断')"
                    @keydown.enter.prevent="copyClassName('text-ellipsis-2', '双行截断')"
                    @keydown.space.prevent="copyClassName('text-ellipsis-2', '双行截断')"
                  >
                    <div class="glass-card aspect-[4/3] center border border-border/10">
                      <Icons
                        :name="product.icon"
                        size="sm"
                        class="text-muted-foreground/40"
                      />
                    </div>
                    <span class="text-xs font-semibold text-foreground text-no-wrap">
                      {{ product.name }}
                    </span>
                    <span
                      class="text-xs leading-sm max-h-[var(--spacing-xl)] text-muted-foreground text-ellipsis-2"
                    >
                      {{ product.description }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-stretch gap-lg">
              <!-- scrollbar-none -->
              <div class="col-stretch gap-sm">
                <div class="row-between gap-sm">
                  <div
                    role="button"
                    tabindex="0"
                    class="interactive-item ring-focus-focus row-start font-mono text-primary shrink"
                    @click="copyClassName('scrollbar-none', '隐藏滚动条')"
                    @keydown.enter.prevent="copyClassName('scrollbar-none', '隐藏滚动条')"
                    @keydown.space.prevent="copyClassName('scrollbar-none', '隐藏滚动条')"
                  >
                    .scrollbar-none
                  </div>
                  <span class="text-xs text-muted-foreground shrink-0">Topic Tag 横向滚动</span>
                </div>
                <div
                  class="overflow-x-auto scrollbar-none rounded-full bg-muted/30 border border-border/30 px-xs py-xs"
                >
                  <div
                    class="row-start gap-xs"
                    style="width: max-content"
                  >
                    <Tag
                      v-for="tag in topicTags"
                      :key="tag"
                      :value="tag"
                      severity="secondary"
                      class="text-no-wrap shrink-0"
                    />
                  </div>
                </div>
                <p class="text-xs text-muted-foreground/60 m-0">
                  ← 横向滑动（滚动条已隐藏，内容仍可滚动）
                </p>
              </div>

              <!-- text-no-wrap -->
              <div class="col-stretch gap-sm">
                <div class="row-between gap-sm">
                  <div
                    role="button"
                    tabindex="0"
                    class="interactive-item ring-focus-focus row-start font-mono text-primary shrink"
                    @click="copyClassName('text-no-wrap', '不换行')"
                    @keydown.enter.prevent="copyClassName('text-no-wrap', '不换行')"
                    @keydown.space.prevent="copyClassName('text-no-wrap', '不换行')"
                  >
                    .text-no-wrap
                  </div>
                  <span class="text-xs text-muted-foreground shrink-0">面包屑防折行</span>
                </div>
                <div
                  class="bg-muted/30 dark:bg-muted/20 border border-border/40 rounded-lg p-md overflow-hidden"
                >
                  <div class="row-start gap-xs overflow-hidden">
                    <Icons
                      name="i-lucide-home"
                      size="sm"
                      class="text-muted-foreground shrink-0"
                    />
                    <span class="text-xs text-muted-foreground">/</span>
                    <span class="text-xs text-muted-foreground text-no-wrap shrink-0">
                      系统配置
                    </span>
                    <span class="text-xs text-muted-foreground">/</span>
                    <span class="text-xs font-medium text-foreground text-no-wrap text-ellipsis-1">
                      UnoCSS 引擎快捷类全景与布局演示系统
                    </span>
                  </div>
                </div>
                <p class="text-xs text-muted-foreground/60 m-0">
                  路径文字强制单行，配合 text-ellipsis-1 截断末段
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 4: 动效缓动系统 -->
        <section class="material-elevated col-stretch gap-lg">
          <div class="col-stretch gap-xs md:gap-sm">
            <h2 class="text-lg font-semibold text-foreground m-0">Section 4 · 动效缓动系统</h2>
            <p class="text-xs text-muted-foreground m-0">
              5 条缓动曲线对比（group-hover 滑轨）· Orb 关键帧动画舞台
            </p>
          </div>

          <div class="col-stretch gap-sm">
            <p class="text-sm font-medium text-foreground m-0">缓动曲线对比（悬停区域触发滑轨）</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
              <div
                v-for="demo in easingDemos"
                :key="demo.className"
                class="motion-lift bg-muted/20 border border-border/40 rounded-lg p-md overflow-hidden col-stretch gap-sm"
              >
                <div class="row-start flex-wrap gap-xs">
                  <div
                    role="button"
                    tabindex="0"
                    class="ring-focus-focus row-start font-mono text-primary bg-primary/10 rounded-sm px-xs py-xs flex-1 min-w-0"
                    @click="copyClassName(demo.className, '缓动曲线')"
                    @keydown.enter.prevent="copyClassName(demo.className, '缓动曲线')"
                    @keydown.space.prevent="copyClassName(demo.className, '缓动曲线')"
                  >
                    .{{ demo.className }}
                  </div>
                  <Tag
                    :value="demo.description"
                    severity="secondary"
                    class="shrink-0 max-w-full"
                  />
                </div>
                <p class="text-xs font-mono text-muted-foreground/50 m-0 text-ellipsis-1">
                  {{ demo.curveHint }}
                </p>
                <div class="demo-stage relative h-[var(--spacing-2xl)] bg-background/40">
                  <div class="group relative h-full w-full overflow-hidden px-sm">
                    <div
                      class="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[var(--spacing-xs)] rounded-full bg-foreground/[0.12]"
                    />
                    <div
                      class="absolute right-0 top-1/2 -translate-y-1/2 w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-full bg-foreground/[0.25]"
                    />
                    <div
                      class="absolute top-1/2 -translate-y-1/2 left-0 rounded-sm bg-primary/70 transition-[left] duration-sm group-hover:left-[calc(100%-var(--spacing-xl))]"
                      :class="[demo.className, 'w-[var(--spacing-xl)] h-[var(--spacing-md)]']"
                    />
                  </div>
                </div>
                <p class="text-xs text-muted-foreground/60 m-0">
                  悬停卡片观察滑块位移与减速手感差异
                </p>
              </div>
            </div>
          </div>

          <div class="col-stretch gap-sm">
            <p class="text-sm font-medium text-foreground m-0">Orb 关键帧动画</p>
            <div
              class="demo-stage relative w-full min-h-[var(--spacing-5xl)] aspect-video overflow-hidden bg-muted/20 p-md"
              style="
                background-image: radial-gradient(
                  circle,
                  rgb(var(--foreground) / 0.045) 1px,
                  transparent 1px
                );
                background-size: var(--spacing-lg) var(--spacing-lg);
              "
            >
              <div
                class="absolute inset-0 z-base bg-foreground/[0.03] animate-pulse pointer-events-none"
              />
              <div class="absolute-center col-center gap-xs pointer-events-none">
                <span class="text-xs text-muted-foreground/40 font-mono">
                  subtle pulse · restrained stage light
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 5: Z-Axis 物理剧场 -->
        <section class="material-elevated col-stretch gap-lg">
          <div class="col-stretch gap-xs md:gap-sm">
            <h2 class="text-lg font-semibold text-foreground m-0">Section 5 · Z-Axis 物理剧场</h2>
            <p class="text-xs text-muted-foreground m-0">
              进阶附录：z-base（0）→
              z-toast（100）的覆盖层次，帮助理解布局层、遮罩层与通知层的稳定关系
            </p>
          </div>

          <div
            class="relative w-full aspect-video min-h-[var(--spacing-5xl)] rounded-lg overflow-hidden bg-muted/30 dark:bg-muted/20 border border-border/40 p-md"
          >
            <div
              class="absolute inset-0 z-base bg-foreground/5 animate-pulse pointer-events-none"
            />
            <div
              v-for="card in zLayerCards"
              :key="card.zClass"
              class="absolute rounded-lg border row-between px-sm py-xs transition-all duration-md"
              :class="[card.zClass, card.colorClass, card.blurClass, card.borderColorClass]"
              :style="card.positionStyle"
            >
              <div class="col-stretch gap-xs min-w-0 overflow-hidden">
                <div
                  role="button"
                  tabindex="0"
                  class="interactive-item ring-focus-focus row-start font-mono text-foreground"
                  @click="copyClassName(card.zClass, 'Z 语义层')"
                  @keydown.enter.prevent="copyClassName(card.zClass, 'Z 语义层')"
                  @keydown.space.prevent="copyClassName(card.zClass, 'Z 语义层')"
                >
                  .{{ card.zClass }}
                </div>
                <span class="text-xs text-muted-foreground text-no-wrap">{{ card.uiRole }}</span>
              </div>
              <div class="glass-capsule shrink-0 ml-xs">
                <Badge
                  :value="`z=${card.numericValue}`"
                  :severity="card.badgeSeverity"
                />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-sm">
            <div
              v-for="card in zLayerCards"
              :key="`legend-${card.zClass}`"
              role="button"
              tabindex="0"
              class="interactive-item ring-focus-focus rounded-md p-sm row-between w-full"
              @click="copyClassName(card.zClass, 'Z 层级')"
              @keydown.enter.prevent="copyClassName(card.zClass, 'Z 层级')"
              @keydown.space.prevent="copyClassName(card.zClass, 'Z 层级')"
            >
              <span class="text-xs font-mono text-primary">.{{ card.zClass }}</span>
              <span class="text-xs text-muted-foreground">
                z={{ card.numericValue }} · {{ card.uiRole }}
              </span>
            </div>
          </div>
        </section>
      </div>
    </CScrollbar>
  </div>
</template>

<style lang="scss" scoped></style>
