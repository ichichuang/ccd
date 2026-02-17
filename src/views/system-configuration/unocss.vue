<script setup lang="ts">
import { ref, computed } from 'vue'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import { BREAKPOINTS } from '@/constants/breakpoints'

const searchQuery = ref<string | undefined>('')

// 复制到剪贴板
const copyToClipboard = (text: string, label?: string) => {
  navigator.clipboard.writeText(text).then(() => {
    window.$toast?.successIn('top-right', `已复制: ${label || text}`, `类名: ${text}`)
  })
}

// 搜索过滤（仅作用于 Shortcuts）
const matchesSearch = (text: string) => {
  if (!searchQuery.value) return true
  return text.toLowerCase().includes(searchQuery.value.toLowerCase())
}

// ==================== Shortcuts（完整覆盖 uno.config.ts） ====================
interface ShortcutItem {
  name: string
  classes: string
  desc?: string
}
interface ShortcutGroup {
  category: string
  icon: string
  items: ShortcutItem[]
}

const shortcutGroups: ShortcutGroup[] = [
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
      { name: 'hover-elevated', classes: 'hover:shadow-md hover:border-primary/50' },
      { name: 'interactive-hover', classes: 'behavior-hover-transition hover-elevated' },
      {
        name: 'interactive-click',
        classes:
          'cursor-pointer select-none active:scale-95 transition-transform duration-scale-xs',
      },
      {
        name: 'interactive-focus-ring',
        classes: 'focus:outline-none focus:ring-2 focus:ring-primary/50',
      },
    ],
  },
  {
    category: 'Component 组件基础',
    icon: 'i-lucide-component',
    items: [
      { name: 'component-border', classes: 'border border-solid border-border' },
      {
        name: 'component-card-base',
        classes: 'rounded-scale-md bg-card text-card-foreground component-border shadow-sm',
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
        classes: 'transition-[width] duration-scale-lg ease-in-out',
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
]

const filteredShortcutGroups = computed(() =>
  shortcutGroups
    .map(g => ({
      ...g,
      items: g.items.filter(i => matchesSearch(i.name) || matchesSearch(i.classes)),
    }))
    .filter(g => g.items.length > 0)
)

/** Shortcuts 预览类型：按分组决定右侧 demo 的 DOM 结构，使类名效果可见 */
type ShortcutDemoKind =
  | 'density'
  | 'flex'
  | 'flex-justify'
  | 'flex-align'
  | 'flex-combo'
  | 'layout'
  | 'text'
  | 'interaction'
  | 'component'
  | 'size'
  | 'design-defaults'
  | 'default'

function getShortcutDemoKind(category: string): ShortcutDemoKind {
  if (category === 'Density 密度语义') return 'density'
  if (category === 'Flex 基础') return 'flex'
  if (category === 'Flex 主轴对齐 (justify-content)') return 'flex-justify'
  if (category === 'Flex 交叉轴对齐 (align-items)') return 'flex-align'
  if (category === 'Flex 高频组合') return 'flex-combo'
  if (category === 'Layout 布局结构') return 'layout'
  if (category === 'Text 文本排版') return 'text'
  if (category === 'Interaction 交互行为') return 'interaction'
  if (category === 'Component 组件基础') return 'component'
  if (category === 'Size & Visual 尺寸视觉') return 'size'
  if (category === 'Design Defaults 设计默认值') return 'design-defaults'
  return 'default'
}

// 预览区通用尺寸与边框（relative 供 layout-absolute-center 等定位），子内容按 demoKind 填充
const shortcutPreviewBoxClass =
  'relative w-20 h-12 shrink-0 rounded-scale-sm overflow-hidden border border-primary/30 bg-primary/5 flex items-center justify-center'

// ==================== 断点 / 安全区 ====================
const breakpoints = computed(() =>
  Object.entries(BREAKPOINTS).map(([key, value]) => ({
    key,
    value: typeof value === 'number' ? `${value}px` : value,
  }))
)
const safeAreaRules = [
  { name: 'safe-top', css: 'padding-top: env(safe-area-inset-top)', desc: '顶部安全区' },
  { name: 'safe-bottom', css: 'padding-bottom: env(safe-area-inset-bottom)', desc: '底部安全区' },
]
</script>

<template>
  <CScrollbar class="h-full p-padding-lg bg-background">
    <div class="w-full max-w-[90vw] mx-auto flex flex-col gap-xl">
      <!-- Header -->
      <div class="flex flex-col gap-xs">
        <div class="flex items-center gap-md">
          <div class="p-padding-md bg-primary/10 rounded-scale-lg">
            <Icons
              name="i-lucide-paintbrush"
              class="text-primary fs-2xl"
            />
          </div>
          <div>
            <h1 class="fs-2xl font-bold text-foreground">UnoCSS 特性展示</h1>
            <p class="text-muted-foreground">
              快捷类名、断点用法、安全区规则 · 配色与尺寸系统详见
              <RouterLink
                to="/system-configuration/theme"
                class="text-primary hover:underline"
              >
                主题</RouterLink
              >、
              <RouterLink
                to="/system-configuration/size"
                class="text-primary hover:underline"
                >尺寸</RouterLink
              >
              页 · 点击类名即可复制
            </p>
          </div>
        </div>
      </div>

      <!-- Search -->
      <div class="w-full max-w-lg">
        <IconField>
          <InputIcon>
            <i class="i-lucide-search" />
          </InputIcon>
          <InputText
            v-model="searchQuery"
            placeholder="搜索快捷类名..."
            class="w-full"
          />
        </IconField>
      </div>

      <!-- Shortcuts 快捷方式 -->
      <Card
        v-if="filteredShortcutGroups.length > 0"
        class="component-border"
      >
        <template #title>
          <div class="flex items-center gap-sm">
            <Icons
              name="i-lucide-zap"
              class="text-primary"
            />
            <span>Shortcuts 快捷方式</span>
            <Tag
              :value="`${shortcutGroups.reduce((a, g) => a + g.items.length, 0)} shortcuts`"
              severity="secondary"
            />
          </div>
        </template>
        <template #content>
          <div class="flex flex-col gap-lg">
            <p class="text-muted-foreground fs-sm">
              业务层推荐只使用 shortcuts · 涵盖密度、布局、文本、交互、组件语义
            </p>
            <div
              v-for="group in filteredShortcutGroups"
              :key="group.category"
              class="flex flex-col gap-md"
            >
              <div class="flex items-center gap-sm">
                <Icons
                  :name="group.icon"
                  class="text-primary"
                />
                <h3 class="fs-lg font-semibold text-foreground">{{ group.category }}</h3>
                <Tag
                  :value="`${group.items.length}`"
                  severity="secondary"
                />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-sm">
                <div
                  v-for="item in group.items"
                  :key="item.name"
                  class="flex items-center gap-md p-padding-md bg-muted/20 rounded-scale-md hover:bg-muted/40 transition-colors cursor-pointer"
                  @click="copyToClipboard(item.name)"
                >
                  <div class="flex flex-col flex-1 min-w-0">
                    <span class="font-semibold text-foreground">{{ item.name }}</span>
                    <span class="font-mono fs-xs text-muted-foreground text-single-line-ellipsis">{{
                      item.classes
                    }}</span>
                    <span
                      v-if="item.desc"
                      class="fs-xs text-info"
                      >{{ item.desc }}</span
                    >
                  </div>
                  <!-- 按分组渲染可视化预览，使类名效果一目了然 -->
                  <div
                    :class="shortcutPreviewBoxClass"
                    @click.stop
                  >
                    <!-- Density：多子块展示 gap + padding -->
                    <div
                      v-if="getShortcutDemoKind(group.category) === 'density'"
                      :class="[item.name, 'flex flex-wrap w-full h-full p-padding-xs']"
                    >
                      <span
                        v-for="i in 4"
                        :key="i"
                        class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-sm bg-primary/60 shrink-0"
                      />
                    </div>
                    <!-- Flex 基础：direction/center 等 -->
                    <div
                      v-else-if="getShortcutDemoKind(group.category) === 'flex'"
                      :class="[item.name, 'w-full h-full p-padding-xs gap-xs']"
                    >
                      <span
                        v-for="i in 3"
                        :key="i"
                        class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-sm bg-primary/60 shrink-0"
                      />
                    </div>
                    <!-- Flex 主轴对齐：需配合 flex flex-row -->
                    <div
                      v-else-if="getShortcutDemoKind(group.category) === 'flex-justify'"
                      :class="['flex flex-row w-full h-full p-padding-xs', item.name]"
                    >
                      <span
                        v-for="i in 3"
                        :key="i"
                        class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-sm bg-primary/60 shrink-0"
                      />
                    </div>
                    <!-- Flex 交叉轴对齐：需配合 flex flex-row，子块不同高以见 align -->
                    <div
                      v-else-if="getShortcutDemoKind(group.category) === 'flex-align'"
                      :class="['flex flex-row w-full h-full p-padding-xs gap-xs', item.name]"
                    >
                      <span
                        class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-sm bg-primary/60 shrink-0"
                      />
                      <span
                        class="w-[var(--spacing-xs)] h-[var(--spacing-sm)] rounded-sm bg-primary/60 shrink-0"
                      />
                      <span
                        class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-sm bg-primary/60 shrink-0"
                      />
                    </div>
                    <!-- Flex 高频组合 -->
                    <div
                      v-else-if="getShortcutDemoKind(group.category) === 'flex-combo'"
                      :class="[item.name, 'w-full h-full p-padding-xs gap-xs']"
                    >
                      <span
                        v-for="i in 3"
                        :key="i"
                        class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-sm bg-primary/60 shrink-0"
                      />
                    </div>
                    <!-- Layout：stack/wrap/grid 需子元素，其余单层 -->
                    <template v-else-if="getShortcutDemoKind(group.category) === 'layout'">
                      <div
                        v-if="
                          ['layout-stack', 'layout-wrap', 'layout-grid-center'].includes(item.name)
                        "
                        :class="[item.name, 'w-full h-full p-padding-xs gap-xs']"
                      >
                        <span
                          v-for="i in 3"
                          :key="i"
                          class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-sm bg-primary/60 shrink-0"
                        />
                      </div>
                      <div
                        v-else
                        :class="[item.name, 'w-full h-full rounded-scale-sm bg-primary/10']"
                      />
                    </template>
                    <!-- Text：固定宽度 + 示例文案以展示 ellipsis / line-clamp -->
                    <div
                      v-else-if="getShortcutDemoKind(group.category) === 'text'"
                      class="w-full h-full p-padding-xs flex items-center"
                    >
                      <p
                        v-if="item.name === 'text-single-line-ellipsis'"
                        :class="item.name"
                        class="w-full fs-xs text-foreground m-0"
                      >
                        这是一段会溢出并显示省略号的长文本示例
                      </p>
                      <p
                        v-else-if="item.name === 'text-two-line-ellipsis'"
                        :class="item.name"
                        class="w-full fs-xs text-foreground m-0 max-w-full"
                      >
                        第一行文字内容第二行超出部分省略
                      </p>
                      <span
                        v-else
                        :class="item.name"
                        class="fs-xs"
                        >示例文字</span
                      >
                    </div>
                    <!-- Interaction：可悬停/聚焦的小块 + 说明，效果需悬停/聚焦可见 -->
                    <div
                      v-else-if="getShortcutDemoKind(group.category) === 'interaction'"
                      class="w-full h-full flex flex-col items-center justify-center gap-xs p-padding-xs"
                    >
                      <div
                        :class="item.name"
                        class="min-w-[var(--spacing-lg)] min-h-[var(--spacing-md)] rounded-scale-sm bg-primary/20 border border-primary/40 flex items-center justify-center cursor-pointer select-none fs-xs text-foreground"
                        tabindex="0"
                      >
                        悬停
                      </div>
                      <span class="fs-xs text-muted-foreground">悬停/聚焦可见</span>
                    </div>
                    <!-- Component：不覆盖 shortcut 的尺寸/背景，卡片类加占位文案，row-center 加子块 -->
                    <div
                      v-else-if="getShortcutDemoKind(group.category) === 'component'"
                      class="w-full h-full flex items-center justify-center p-padding-xs"
                    >
                      <div
                        :class="[
                          item.name,
                          'min-w-[var(--spacing-lg)] min-h-[var(--spacing-lg)] rounded-scale-sm',
                          ['component-card-content', 'component-card', 'row-center'].includes(
                            item.name
                          )
                            ? 'min-w-[var(--spacing-2xl)] min-h-[var(--spacing-xl)] flex flex-row items-center justify-center gap-xs p-padding-xs'
                            : '',
                        ]"
                      >
                        <template
                          v-if="['component-card-base', 'component-card'].includes(item.name)"
                        >
                          <span class="fs-xs">示例</span>
                        </template>
                        <template
                          v-else-if="
                            ['component-card-content', 'component-card', 'row-center'].includes(
                              item.name
                            )
                          "
                        >
                          <span
                            v-for="i in 3"
                            :key="i"
                            class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-sm bg-primary/60 shrink-0"
                          />
                        </template>
                      </div>
                    </div>
                    <!-- Size & Visual：不覆盖尺寸，swatch 显小圆，select-min 显 min-width，transition 显条 -->
                    <div
                      v-else-if="getShortcutDemoKind(group.category) === 'size'"
                      class="w-full h-full flex items-center justify-center p-padding-xs"
                    >
                      <div
                        v-if="item.name === 'size-theme-swatch'"
                        :class="item.name"
                        class="shrink-0 bg-primary/50"
                      />
                      <div
                        v-else-if="item.name === 'size-select-min'"
                        class="flex w-full justify-start"
                      >
                        <div
                          :class="item.name"
                          class="h-[var(--spacing-md)] rounded-scale-sm bg-primary/30 shrink-0"
                        />
                      </div>
                      <div
                        v-else
                        :class="item.name"
                        class="w-1/2 h-[var(--spacing-sm)] rounded-scale-sm bg-primary/30"
                      />
                    </div>
                    <!-- Design Defaults：内层有内容以展示 padding/margin/rounded/font-size -->
                    <div
                      v-else-if="getShortcutDemoKind(group.category) === 'design-defaults'"
                      class="w-full h-full flex items-center justify-center p-padding-xs"
                    >
                      <div
                        v-if="item.name === 'default-gap'"
                        :class="item.name"
                        class="flex flex-wrap min-w-0 min-h-0"
                      >
                        <span
                          v-for="i in 2"
                          :key="i"
                          class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-sm bg-primary/50 shrink-0"
                        />
                      </div>
                      <span
                        v-else-if="item.name === 'default-font-size'"
                        :class="item.name"
                        class="text-foreground"
                        >A</span
                      >
                      <div
                        v-else
                        :class="item.name"
                        class="min-w-6 min-h-6 flex items-center justify-center rounded-scale-sm bg-primary/15"
                      >
                        <span class="fs-xs text-foreground">A</span>
                      </div>
                    </div>
                    <!-- 默认：仅 w-full h-full，不覆盖 shortcut 的 bg/rounded，让边框/卡片等可见 -->
                    <div
                      v-else
                      :class="[item.name, 'w-full h-full']"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- 断点系统 -->
      <Card class="component-border">
        <template #title>
          <div class="flex items-center gap-sm">
            <Icons
              name="i-lucide-monitor"
              class="text-primary"
            />
            <span>Breakpoints 断点系统</span>
            <Tag
              :value="`${breakpoints.length} breakpoints`"
              severity="secondary"
            />
          </div>
        </template>
        <template #content>
          <div class="flex flex-col gap-md">
            <p class="text-muted-foreground fs-sm">
              使用方式: <code class="bg-muted px-padding-xs rounded">{breakpoint}:类名</code> ·
              SSOT:
              <code class="bg-muted px-padding-xs rounded">src/constants/breakpoints.ts</code>
            </p>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-md">
              <div
                v-for="bp in breakpoints"
                :key="bp.key"
                class="flex flex-col items-center gap-sm p-padding-md bg-muted/20 rounded-scale-md hover:bg-muted/40 transition-colors cursor-pointer"
                @click="copyToClipboard(bp.key + ':', bp.key)"
              >
                <span class="font-bold fs-lg text-primary">{{ bp.key }}</span>
                <span class="font-mono text-muted-foreground">{{ bp.value }}</span>
                <span class="fs-xs text-muted-foreground">{{ bp.key }}:类名</span>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- 安全区规则 -->
      <Card class="component-border">
        <template #title>
          <div class="flex items-center gap-sm">
            <Icons
              name="i-lucide-shield"
              class="text-primary"
            />
            <span>Safe Area 安全区规则</span>
          </div>
        </template>
        <template #content>
          <div class="flex flex-col gap-md">
            <p class="text-muted-foreground fs-sm">
              移动端安全区适配 · 自动使用
              <code class="bg-muted px-padding-xs rounded">env(safe-area-inset-*)</code>
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div
                v-for="rule in safeAreaRules"
                :key="rule.name"
                class="flex items-center gap-md p-padding-md bg-muted/20 rounded-scale-md hover:bg-muted/40 transition-colors cursor-pointer"
                @click="copyToClipboard(rule.name)"
              >
                <div class="flex flex-col flex-1">
                  <span class="font-semibold text-foreground">{{ rule.name }}</span>
                  <span class="font-mono fs-xs text-muted-foreground">{{ rule.css }}</span>
                </div>
                <Tag
                  :value="rule.desc"
                  severity="info"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Quick Reference（仅 Uno 特性） -->
      <Card class="component-border bg-gradient-to-br from-primary/5 to-accent/5">
        <template #title>
          <div class="flex items-center gap-sm">
            <Icons
              name="i-lucide-book-open"
              class="text-primary"
            />
            <span>Quick Reference 快速参考</span>
          </div>
        </template>
        <template #content>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
            <div class="flex flex-col gap-sm">
              <h4 class="font-semibold text-foreground">Shortcuts 快捷类名</h4>
              <p class="fs-xs text-muted-foreground">
                业务层优先使用 shortcuts（密度、布局、文本、交互、组件语义），避免手写原子类组合。
              </p>
              <code
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('row-center')"
                >row-center</code
              >
              <code
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('density-normal')"
                >density-normal</code
              >
            </div>
            <div class="flex flex-col gap-sm">
              <h4 class="font-semibold text-foreground">断点前缀 (Breakpoints)</h4>
              <p class="fs-xs text-muted-foreground">
                用法 <code class="bg-muted px-padding-xs rounded fs-xs">{breakpoint}:类名</code> ·
                SSOT:
                <code class="bg-muted px-padding-xs rounded fs-xs"
                  >src/constants/breakpoints.ts</code
                >
              </p>
              <RouterLink
                to="/system-configuration/breakpoints"
                class="text-primary hover:underline fs-sm"
              >
                断点尺子与用法示例 →
              </RouterLink>
            </div>
            <div class="flex flex-col gap-sm">
              <h4 class="font-semibold text-foreground">安全区 (Safe Area)</h4>
              <code
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('safe-top')"
                >safe-top</code
              >
              <code
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('safe-bottom')"
                >safe-bottom</code
              >
              <p class="fs-xs text-muted-foreground">移动端安全区 · env(safe-area-inset-*)</p>
            </div>
            <div class="flex flex-col gap-sm">
              <h4 class="font-semibold text-foreground">规则 (Rules)</h4>
              <p class="fs-xs text-muted-foreground">
                <code class="bg-muted px-padding-xs rounded">main-*</code> /
                <code class="bg-muted px-padding-xs rounded">cross-*</code> 须与
                <code class="bg-muted px-padding-xs rounded">row</code> 或
                <code class="bg-muted px-padding-xs rounded">column</code>
                同用，否则主轴/交叉轴语义不明。
              </p>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </CScrollbar>
</template>

<style scoped>
code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
