<script setup lang="ts">
import { BREAKPOINTS } from '@/constants/breakpoints'
import { shortcutGroups } from './configs/shortcutGroups'
import type { ShortcutGroup } from './configs/shortcutGroups'
import { useDeviceStore } from '@/stores/modules/device'

const deviceStore = useDeviceStore()
const searchQuery = ref<string | undefined>('')
const shortcutsSectionRef = ref<HTMLElement | null>(null)

// 搜索后滚动到 Shortcuts 结果区（避免固定顶栏下结果区不可见）
watch(
  searchQuery,
  val => {
    if (val?.trim()) {
      nextTick(() => {
        shortcutsSectionRef.value?.scrollIntoView({ block: 'start', behavior: 'smooth' })
      })
    }
  },
  { flush: 'post' }
)

// 复制到剪贴板（支持非安全上下文：HTTP IP / file:// 等）
const copyToClipboard = async (text: string, label?: string) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'absolute'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      const successful = document.execCommand('copy')
      textArea.remove()

      if (!successful) throw new Error('Fallback copy failed')
    }

    window.$toast?.successIn('top-right', `已复制: ${label || text}`, `类名: ${text}`)
  } catch (_error) {
    window.$message?.danger('复制失败')
  }
}

// 搜索过滤（仅作用于 Shortcuts）
const matchesSearch = (text: string) => {
  if (!searchQuery.value) return true
  return text.toLowerCase().includes(searchQuery.value.toLowerCase())
}

const filteredShortcutGroups = computed<ShortcutGroup[]>(() =>
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
  | 'responsive-gaps'
  | 'special-spacing'
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
  if (category === 'Menu 菜单交互') return 'flex'
  if (category === 'Component 组件基础') return 'component'
  if (category === 'Size & Visual 尺寸视觉') return 'size'
  if (category === 'Design Defaults 设计默认值') return 'design-defaults'
  if (category === 'Responsive Gaps 响应式间距') return 'responsive-gaps'
  if (category === 'Special Spacing Rules 特殊间距规则') return 'special-spacing'
  return 'default'
}

// 预览区通用尺寸与边框（relative 供 layout-absolute-center 等定位），子内容按 demoKind 填充
const shortcutPreviewBoxClass =
  'relative w-[var(--spacing-5xl)] h-[var(--spacing-xl)] shrink-0 rounded-scale-sm overflow-visible component-border bg-primary/5 row-y-center justify-center'

// ==================== 断点 / 安全区 ====================
const breakpoints = computed<Array<{ key: string; value: string }>>(() =>
  Object.entries(BREAKPOINTS).map(([key, value]) => ({
    key,
    value: typeof value === 'number' ? `${value}px` : value,
  }))
)
const safeAreaRules: Array<{ name: string; css: string; desc: string }> = [
  { name: 'safe-top', css: 'padding-top: env(safe-area-inset-top)', desc: '顶部安全区' },
  { name: 'safe-bottom', css: 'padding-bottom: env(safe-area-inset-bottom)', desc: '底部安全区' },
]

// ==================== 语义别名 ====================
const semanticAliases: Array<{ name: string; classes: string; desc: string }> = [
  { name: 'bg-brand', classes: 'bg-primary', desc: '品牌大背景' },
  { name: 'bg-interactive', classes: 'bg-primary-hover', desc: '交互背景' },
  { name: 'text-interactive', classes: 'text-primary-hover', desc: '交互文字颜色' },
]
</script>

<template>
  <div
    class="h-full column overflow-hidden"
    data-archetype="A1-toolbar-content"
  >
    <!-- Toolbar: Header + Search (Transparent Root · Nested Canvas) -->
    <div class="shrink-0 border-b-default border-primary/50 bg-primary/5">
      <div class="layout-content-wide col-stack-sm py-padding-sm">
        <!-- Header -->
        <div class="col-stack-xs">
          <div class="row-y-center gap-md">
            <div class="p-padding-md bg-primary/10 rounded-scale-lg shrink-0">
              <Icons
                name="i-lucide-paintbrush"
                class="text-primary fs-2xl behavior-hover-transition"
              />
            </div>
            <div class="col-stack-xs">
              <h1 class="fs-2xl font-bold text-foreground">UnoCSS 特性展示</h1>
              <p class="text-muted-foreground fs-sm">
                快捷类名、断点用法、安全区规则 · 配色与尺寸系统详见
                <RouterLink
                  to="/system-configuration/theme"
                  class="text-primary hover:underline"
                >
                  主题
                </RouterLink>
                、
                <RouterLink
                  to="/system-configuration/size"
                  class="text-primary hover:underline"
                >
                  尺寸
                </RouterLink>
                页 · 点击类名即可复制 · 更多系统能力示例在
                <RouterLink
                  to="/example"
                  class="text-primary hover:underline"
                >
                  example
                </RouterLink>
                目录
              </p>
            </div>
          </div>
          <div
            class="surface-item p-padding-md rounded-scale-md row-start gap-md component-border mt-margin-sm"
          >
            <Icons
              name="i-lucide-info"
              class="text-primary fs-xl shrink-0 mt-margin-xs"
            />
            <div class="col-stack-xs">
              <div class="font-semibold text-primary fs-sm">Architectural Guide 架构引导</div>
              <div class="text-muted-foreground fs-xs leading-relaxed">
                本页面展示由
                <span class="bg-muted px-padding-xs rounded-scale-xs font-mono">uno.config.ts</span>
                定义的快捷类名与规则。业务组件应优先使用逻辑语义相关的快捷类名。
              </div>
            </div>
          </div>
        </div>

        <!-- Search -->
        <div class="w-full layout-dialog">
          <IconField>
            <InputIcon>
              <Icons
                name="i-lucide-search"
                size="sm"
              />
            </InputIcon>
            <InputText
              v-model="searchQuery"
              placeholder="搜索快捷类名..."
              class="w-full"
            />
          </IconField>
        </div>
      </div>
    </div>

    <!-- Scrollable content -->
    <CScrollbar class="flex-1 min-h-0">
      <div class="layout-content-wide col-stack-xl">
        <!-- Shortcuts 快捷方式（搜索后滚动到此区） -->
        <div
          ref="shortcutsSectionRef"
          class="min-h-0"
        >
          <Card class="panel-base bg-primary/10 dark:bg-primary/5">
            <template #title>
              <div class="row-y-center gap-sm border-b-default pb-padding-sm mb-padding-sm">
                <Icons
                  name="i-lucide-zap"
                  class="text-primary"
                />
                <span class="font-semibold">Shortcuts 快捷方式</span>
                <Tag
                  :value="`${shortcutGroups.reduce((a, g) => a + g.items.length, 0)} shortcuts`"
                  severity="secondary"
                />
              </div>
            </template>
            <template #content>
              <template v-if="filteredShortcutGroups.length > 0">
                <div class="col-stack-lg">
                  <div class="border-b-default pb-padding-sm mb-padding-sm">
                    <p class="text-muted-foreground fs-sm">
                      业务层推荐只使用 shortcuts · 涵盖密度、布局、文本、交互、组件语义
                    </p>
                  </div>
                  <div
                    v-for="group in filteredShortcutGroups"
                    :key="group.category"
                    class="col-stack-md"
                  >
                    <div class="row-y-center gap-sm">
                      <Icons
                        :name="group.icon"
                        class="text-primary"
                      />
                      <h4 class="fs-sm font-semibold text-foreground mb-margin-xs">
                        {{ group.category }}
                      </h4>
                      <Tag
                        :value="`${group.items.length}`"
                        severity="secondary"
                      />
                    </div>
                    <!-- === Layout / Interaction / Menu 专属渲染 === -->

                    <!-- Layout 布局结构：结构图意卡片 -->
                    <template v-if="group.category === 'Layout 布局结构'">
                      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-sm">
                        <div
                          v-for="item in group.items"
                          :key="item.name"
                          class="column rounded-scale-lg overflow-hidden cursor-pointer surface-item interactive-hover-tile active:scale-95 behavior-hover-transition"
                          @click="copyToClipboard(item.name)"
                        >
                          <!-- 示意图区域 -->
                          <div
                            class="relative h-[var(--spacing-5xl)] bg-primary/5 border-b-default overflow-hidden"
                          >
                            <!-- layout-full: 四边锚点 + 填充块 -->
                            <template v-if="item.name === 'layout-full'">
                              <div
                                class="absolute inset-[var(--spacing-xs)] bg-primary/20 rounded-scale-sm component-border center"
                              >
                                <span class="fs-xs text-primary font-mono">w-full h-full</span>
                              </div>
                              <div
                                class="absolute top-[var(--spacing-xs)] left-[var(--spacing-xs)] w-[var(--spacing-xs)] h-[var(--spacing-xs)] border-l-2 border-t-2 border-primary/60 rounded-scale-sm"
                              />
                              <div
                                class="absolute top-[var(--spacing-xs)] right-[var(--spacing-xs)] w-[var(--spacing-xs)] h-[var(--spacing-xs)] border-r-2 border-t-2 border-primary/60 rounded-scale-sm"
                              />
                              <div
                                class="absolute bottom-[var(--spacing-xs)] left-[var(--spacing-xs)] w-[var(--spacing-xs)] h-[var(--spacing-xs)] border-l-2 border-b-2 border-primary/60 rounded-scale-sm"
                              />
                              <div
                                class="absolute bottom-[var(--spacing-xs)] right-[var(--spacing-xs)] w-[var(--spacing-xs)] h-[var(--spacing-xs)] border-r-2 border-b-2 border-primary/60 rounded-scale-sm"
                              />
                            </template>
                            <!-- layout-screen: 浏览器 chrome 示意 -->
                            <template v-else-if="item.name === 'layout-screen'">
                              <div
                                class="absolute inset-[var(--spacing-xs)] rounded-scale-sm component-border bg-primary/10 column overflow-hidden"
                              >
                                <div
                                  class="shrink-0 h-[var(--spacing-md)] bg-primary/25 border-b-default row-y-center px-padding-xs gap-xs"
                                >
                                  <span
                                    class="w-[var(--spacing-sm)] h-[var(--spacing-sm)] rounded-full bg-error/60"
                                  />
                                  <span
                                    class="w-[var(--spacing-sm)] h-[var(--spacing-sm)] rounded-full bg-warn/60"
                                  />
                                  <span
                                    class="w-[var(--spacing-sm)] h-[var(--spacing-sm)] rounded-full bg-success/60"
                                  />
                                </div>
                                <div class="flex-1 center">
                                  <span class="fs-xs text-primary/70 font-mono">100vw × 100vh</span>
                                </div>
                              </div>
                            </template>
                            <!-- layout-container: 双色区块示意 bg-background + text-foreground -->
                            <template v-else-if="item.name === 'layout-container'">
                              <div
                                class="absolute inset-[var(--spacing-xs)] rounded-scale-sm overflow-hidden flex gap-px bg-border"
                              >
                                <div class="flex-1 bg-background center">
                                  <div class="layout-stack items-center gap-xs">
                                    <div
                                      class="w-[var(--spacing-xl)] h-[var(--spacing-xs)] rounded-full bg-foreground/20"
                                    />
                                    <div
                                      class="w-[var(--spacing-2xl)] h-[var(--spacing-xs)] rounded-full bg-foreground/15"
                                    />
                                    <div
                                      class="w-[var(--spacing-lg)] h-[var(--spacing-xs)] rounded-full bg-foreground/10"
                                    />
                                  </div>
                                </div>
                                <div class="flex-1 bg-card center">
                                  <span class="fs-xs text-foreground/50 font-mono">text</span>
                                </div>
                              </div>
                            </template>
                            <!-- layout-stack: 竖向堆叠 + gap 标注 -->
                            <template v-else-if="item.name === 'layout-stack'">
                              <div
                                class="absolute inset-[var(--spacing-xs)] layout-stack justify-center gap-sm"
                              >
                                <div
                                  v-for="i in 3"
                                  :key="i"
                                  class="h-[var(--spacing-md)] rounded-scale-sm bg-primary/30 component-border w-full"
                                />
                              </div>
                              <div
                                class="absolute right-[var(--spacing-xs)] top-1/2 -translate-y-1/2 column items-center gap-xs opacity-70"
                              >
                                <div class="w-px h-[var(--spacing-xs)] bg-primary/60" />
                                <span class="fs-xs text-primary font-mono">gap</span>
                                <div class="w-px h-[var(--spacing-xs)] bg-primary/60" />
                              </div>
                            </template>
                            <!-- layout-wrap: 换行示意 -->
                            <template v-else-if="item.name === 'layout-wrap'">
                              <div
                                class="absolute inset-[var(--spacing-xs)] layout-wrap gap-xs content-start"
                              >
                                <div
                                  v-for="i in 6"
                                  :key="i"
                                  class="w-[var(--spacing-xl)] h-[var(--spacing-lg)] rounded-scale-sm shrink-0 component-border"
                                  :class="
                                    i <= 3
                                      ? 'bg-primary/50 border-primary/40'
                                      : 'bg-primary/20 border-primary/20'
                                  "
                                />
                              </div>
                              <span
                                class="absolute bottom-[var(--spacing-xs)] right-[var(--spacing-xs)] fs-xs text-primary/60 font-mono"
                              >
                                ↩
                              </span>
                            </template>
                            <!-- layout-grid-center: 3×3 网格中心高亮 -->
                            <template v-else-if="item.name === 'layout-grid-center'">
                              <div
                                class="absolute inset-[var(--spacing-xs)] grid grid-cols-3 grid-rows-3 gap-xs"
                              >
                                <div
                                  v-for="i in 9"
                                  :key="i"
                                  class="rounded-scale-sm component-border"
                                  :class="
                                    i === 5
                                      ? 'bg-primary/70 border-primary/60'
                                      : 'bg-primary/10 border-primary/15'
                                  "
                                />
                              </div>
                            </template>
                            <!-- layout-absolute-center: 十字线 + 中心点 -->
                            <template v-else-if="item.name === 'layout-absolute-center'">
                              <div
                                class="absolute inset-[var(--spacing-xs)] rounded-scale-sm border border-dashed border-primary/30 bg-primary/5"
                              >
                                <div
                                  class="absolute top-1/2 left-0 right-0 h-px bg-primary/30 -translate-y-1/2"
                                />
                                <div
                                  class="absolute left-1/2 top-0 bottom-0 w-px bg-primary/30 -translate-x-1/2"
                                />
                                <div
                                  class="absolute top-1/2 left-1/2 w-[var(--spacing-md)] h-[var(--spacing-md)] rounded-full bg-primary/70 -translate-x-1/2 -translate-y-1/2 border-2 border-primary/80"
                                />
                              </div>
                            </template>
                            <!-- fallback -->
                            <template v-else>
                              <div
                                class="absolute inset-[var(--spacing-xs)] rounded-scale-sm bg-primary/15 component-border center"
                              >
                                <span class="fs-xs text-primary/60">{{ item.name }}</span>
                              </div>
                            </template>
                          </div>
                          <!-- 信息区 -->
                          <div class="p-padding-sm col-stack-xs">
                            <span class="font-semibold fs-sm text-foreground">{{ item.name }}</span>
                            <span
                              class="font-mono fs-xs text-muted-foreground text-single-line-ellipsis"
                            >
                              {{ item.classes }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- Interaction 交互行为：双状态对比卡 -->
                    <template v-else-if="group.category === 'Interaction 交互行为'">
                      <div class="col-stack-sm">
                        <div
                          v-for="item in group.items"
                          :key="item.name"
                          class="row-y-center gap-md p-padding-md surface-item rounded-scale-lg interactive-hover-tile cursor-pointer active:scale-95 behavior-hover-transition"
                          @click="copyToClipboard(item.name)"
                        >
                          <!-- 文字信息 -->
                          <div class="column flex-1 min-w-0 gap-xs">
                            <span class="font-semibold text-foreground">{{ item.name }}</span>
                            <span
                              class="font-mono fs-xs text-muted-foreground text-single-line-ellipsis"
                            >
                              {{ item.classes }}
                            </span>
                            <span
                              v-if="item.desc"
                              class="fs-xs text-info"
                            >
                              {{ item.desc }}
                            </span>
                          </div>
                          <!-- 双状态对比区 -->
                          <div
                            class="shrink-0 row-y-center gap-sm"
                            @click.stop
                          >
                            <!-- 左：默认态 -->
                            <div class="col-stack-xs items-center">
                              <div
                                class="px-padding-sm py-padding-xs rounded-scale-sm bg-card component-border fs-xs text-muted whitespace-nowrap min-w-[var(--spacing-2xl)] text-center"
                              >
                                默认
                              </div>
                              <span class="fs-xs text-muted-foreground/50">default</span>
                            </div>
                            <Icons
                              name="i-lucide-arrow-right"
                              size="xs"
                              class="text-muted-foreground/40 shrink-0"
                            />
                            <!-- 右：效果态（静态呈现各自最终状态） -->
                            <!-- behavior-hover-transition: 展示过渡后的位移 + 透明度变化 -->
                            <div
                              v-if="item.name === 'behavior-hover-transition'"
                              class="col-stack-xs items-center"
                            >
                              <div
                                class="px-padding-sm py-padding-xs rounded-scale-sm bg-card component-border fs-xs text-primary -translate-y-0.5 opacity-80 whitespace-nowrap min-w-[var(--spacing-2xl)] text-center transition-none"
                              >
                                过渡中
                              </div>
                              <span class="fs-xs text-muted-foreground/50">transitioning</span>
                            </div>
                            <!-- hover-elevated: 展示 shadow + border-primary-hover/50 -->
                            <div
                              v-else-if="item.name === 'hover-elevated'"
                              class="col-stack-xs items-center"
                            >
                              <div
                                class="px-padding-sm py-padding-xs rounded-scale-sm surface-elevated component-border fs-xs text-primary whitespace-nowrap min-w-[var(--spacing-2xl)] text-center"
                              >
                                阴影浮起
                              </div>
                              <span class="fs-xs text-muted-foreground/50">hover</span>
                            </div>
                            <!-- interactive-hover: hover-elevated + translate（组合效果） -->
                            <div
                              v-else-if="item.name === 'interactive-hover'"
                              class="col-stack-xs items-center"
                            >
                              <div
                                class="px-padding-sm py-padding-xs rounded-scale-sm surface-elevated component-border -translate-y-0.5 fs-xs text-primary whitespace-nowrap min-w-[var(--spacing-2xl)] text-center transition-none"
                              >
                                ↑ 悬浮提升
                              </div>
                              <span class="fs-xs text-muted-foreground/50">hover</span>
                            </div>
                            <!-- interactive-click: scale-95 按下缩小 -->
                            <div
                              v-else-if="item.name === 'interactive-click'"
                              class="col-stack-xs items-center"
                            >
                              <div
                                class="px-padding-sm py-padding-xs rounded-scale-sm bg-primary/20 component-border scale-95 fs-xs text-primary whitespace-nowrap min-w-[var(--spacing-2xl)] text-center transition-none"
                              >
                                ↓ 按下
                              </div>
                              <span class="fs-xs text-muted-foreground/50">active</span>
                            </div>
                            <!-- interactive-focus-ring: 静态展示焦点 shadow 效果；原生 button 便于演示 focus-visible，符合 29-focus-outline -->
                            <div
                              v-else-if="item.name === 'interactive-focus-ring'"
                              class="col-stack-xs items-center"
                            >
                              <button
                                type="button"
                                class="px-padding-sm py-padding-xs rounded-scale-sm bg-card fs-xs text-primary interactive-focus-ring whitespace-nowrap min-w-[var(--spacing-2xl)] text-center"
                              >
                                Tab 聚焦
                              </button>
                              <span class="fs-xs text-muted-foreground/50">focus-visible</span>
                            </div>
                            <!-- fallback -->
                            <div
                              v-else
                              class="col-stack-xs items-center"
                            >
                              <div
                                class="px-padding-sm py-padding-xs rounded-scale-sm bg-primary/20 component-border fs-xs text-foreground whitespace-nowrap min-w-[var(--spacing-2xl)] text-center"
                              >
                                激活
                              </div>
                              <span class="fs-xs text-muted-foreground/50">active</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- Menu 菜单交互：迷你菜单模拟器 -->
                    <template v-else-if="group.category === 'Menu 菜单交互'">
                      <div class="col-stack-xl">
                        <!-- 模拟菜单面板：三态对比 -->
                        <div class="surface-elevated rounded-scale-lg overflow-hidden shadow-soft">
                          <div
                            class="px-padding-lg py-padding-md border-b-default row-between gap-sm"
                          >
                            <div class="row-y-center gap-sm">
                              <Icons
                                name="i-lucide-menu"
                                class="text-primary fs-md"
                              />
                              <span class="fs-sm font-semibold text-foreground">
                                Menu 状态模拟器
                              </span>
                            </div>
                            <span class="fs-xs text-muted-foreground">点击行复制类名</span>
                          </div>
                          <div class="p-padding-md col-stack-sm">
                            <div
                              v-for="item in group.items"
                              :key="item.name"
                              class="row-between px-padding-lg py-padding-md rounded-scale-md cursor-pointer behavior-hover-transition"
                              :class="[
                                item.name === 'menu-item-base' ? 'menu-item-base' : '',
                                item.name === 'menu-item-hover'
                                  ? 'menu-item-base menu-item-hover'
                                  : '',
                                item.name === 'menu-item-active-leaf'
                                  ? 'menu-item-base menu-item-active-leaf'
                                  : '',
                              ]"
                              @click="copyToClipboard(item.name)"
                            >
                              <div class="row-y-center gap-sm flex-1 min-w-0">
                                <div class="column min-w-0 gap-xs">
                                  <span class="fs-sm font-medium text-single-line-ellipsis">
                                    {{ item.desc || item.name }}
                                  </span>
                                  <span class="font-mono fs-xs opacity-60">{{ item.name }}</span>
                                </div>
                              </div>
                              <Tag
                                :value="
                                  item.name === 'menu-item-base'
                                    ? '默认态'
                                    : item.name === 'menu-item-hover'
                                      ? '悬停态'
                                      : '选中态'
                                "
                                :severity="
                                  item.name === 'menu-item-active-leaf'
                                    ? 'success'
                                    : item.name === 'menu-item-hover'
                                      ? 'info'
                                      : 'secondary'
                                "
                                class="shrink-0"
                              />
                            </div>
                          </div>
                          <div class="px-padding-lg py-padding-md border-t-default bg-muted/20">
                            <span class="fs-xs text-muted-foreground">
                              menu-item-hover / active-leaf 由程序逻辑赋予，非 CSS :hover 触发
                            </span>
                          </div>
                        </div>
                        <!-- classes 详细说明卡 -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-lg">
                          <div
                            v-for="item in group.items"
                            :key="`info-${item.name}`"
                            class="col-stack-md p-padding-lg surface-item rounded-scale-lg interactive-hover-tile cursor-pointer active:scale-95 behavior-hover-transition"
                            @click="copyToClipboard(item.name)"
                          >
                            <span class="font-semibold fs-sm text-foreground">{{ item.name }}</span>
                            <div
                              class="font-mono fs-xs text-muted-foreground leading-relaxed bg-muted/20 px-padding-sm py-padding-xs rounded-scale-sm break-words"
                            >
                              {{ item.classes }}
                            </div>
                            <span
                              v-if="item.desc"
                              class="fs-xs text-muted-foreground"
                            >
                              {{ item.desc }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- 其余所有分组：保持原有 info + 缩略图 结构 -->
                    <div
                      v-else
                      class="grid grid-cols-1 md:grid-cols-2 gap-sm"
                    >
                      <div
                        v-for="item in group.items"
                        :key="item.name"
                        class="row-y-center gap-md p-padding-md surface-item rounded-scale-lg interactive-hover-tile behavior-hover-transition cursor-pointer active:scale-95"
                        @click="copyToClipboard(item.name)"
                      >
                        <div class="column flex-1 min-w-0">
                          <span class="font-semibold text-foreground">
                            {{ item.name }}
                          </span>
                          <span
                            class="font-mono fs-xs text-muted-foreground text-single-line-ellipsis"
                          >
                            {{ item.classes }}
                          </span>
                          <span
                            v-if="item.desc"
                            class="fs-xs text-info"
                          >
                            {{ item.desc }}
                          </span>
                        </div>
                        <!-- 按分组渲染可视化预览，使类名效果一目了然 -->
                        <div
                          :class="shortcutPreviewBoxClass"
                          @click.stop
                        >
                          <!-- Density：多子块展示 gap + padding -->
                          <div
                            v-if="getShortcutDemoKind(group.category) === 'density'"
                            :class="[item.name, 'layout-wrap w-full h-full p-padding-xs']"
                          >
                            <span
                              v-for="i in 4"
                              :key="i"
                              class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-scale-xs bg-primary/60 shrink-0"
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
                              class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-scale-xs bg-primary/60 shrink-0"
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
                              class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-scale-xs bg-primary/60 shrink-0"
                            />
                          </div>
                          <!-- Flex 交叉轴对齐：需配合 flex flex-row，子块不同高以见 align -->
                          <div
                            v-else-if="getShortcutDemoKind(group.category) === 'flex-align'"
                            :class="['flex flex-row w-full h-full p-padding-xs gap-xs', item.name]"
                          >
                            <span
                              class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-scale-xs bg-primary/60 shrink-0"
                            />
                            <span
                              class="w-[var(--spacing-xs)] h-[var(--spacing-sm)] rounded-scale-xs bg-primary/60 shrink-0"
                            />
                            <span
                              class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-scale-xs bg-primary/60 shrink-0"
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
                              class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-scale-xs bg-primary/60 shrink-0"
                            />
                          </div>
                          <!-- Layout：stack/wrap/grid 需子元素，其余单层 -->
                          <template v-else-if="getShortcutDemoKind(group.category) === 'layout'">
                            <div
                              v-if="
                                ['layout-stack', 'layout-wrap', 'layout-grid-center'].includes(
                                  item.name
                                )
                              "
                              :class="[item.name, 'w-full h-full p-padding-xs gap-xs']"
                            >
                              <span
                                v-for="i in 3"
                                :key="i"
                                class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-scale-xs bg-primary/60 shrink-0"
                              />
                            </div>
                            <div
                              v-else-if="item.name === 'layout-absolute-center'"
                              class="w-full h-full"
                            >
                              <div
                                class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-scale-xs bg-primary/60 layout-absolute-center"
                              />
                            </div>
                            <div
                              v-else-if="item.name === 'layout-screen'"
                              class="w-full h-full overflow-hidden rounded-scale-sm bg-primary/10 component-border center"
                            >
                              <div class="w-full h-full relative">
                                <div class="absolute inset-0 bg-primary/10" />
                                <div
                                  class="absolute left-0 top-0 w-[var(--spacing-sm)] h-full bg-primary/20"
                                />
                                <div
                                  class="absolute left-0 top-0 w-full h-[var(--spacing-xs)] bg-primary/20"
                                />
                                <span class="layout-absolute-center fs-xs text-muted-foreground">
                                  screen
                                </span>
                              </div>
                            </div>
                            <div
                              v-else
                              :class="[item.name, 'w-full h-full rounded-scale-sm bg-primary/10']"
                            />
                          </template>
                          <!-- Text：固定宽度 + 示例文案以展示 ellipsis / line-clamp -->
                          <div
                            v-else-if="getShortcutDemoKind(group.category) === 'text'"
                            class="w-full h-full p-padding-xs row-y-center"
                          >
                            <p
                              v-if="item.name === 'text-single-line-ellipsis'"
                              :class="item.name"
                              class="w-full fs-xs text-foreground m-0 row-y-center"
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
                            >
                              示例文字
                            </span>
                          </div>
                          <!-- Interaction：可悬停/聚焦的小块 + 说明；原生 button 用于演示 interactive-focus-ring 的 focus-visible shadow -->
                          <div
                            v-else-if="getShortcutDemoKind(group.category) === 'interaction'"
                            class="w-full h-full col-stack-xs items-center justify-center p-padding-xs"
                          >
                            <button
                              v-if="item.name === 'interactive-focus-ring'"
                              type="button"
                              :class="item.name"
                              class="min-w-[var(--spacing-2xl)] min-h-[var(--spacing-md)] rounded-scale-sm bg-primary/20 component-border center cursor-pointer select-none fs-xs text-foreground"
                            >
                              Tab 聚焦
                            </button>
                            <div
                              v-else
                              :class="[
                                item.name,
                                item.name === 'behavior-hover-transition'
                                  ? 'hover:-translate-y-0.5 hover:opacity-80'
                                  : '',
                                item.name === 'interactive-hover' ? 'hover:-translate-y-0.5' : '',
                              ]"
                              class="min-w-[var(--spacing-2xl)] min-h-[var(--spacing-md)] rounded-scale-sm bg-primary/20 component-border center cursor-pointer select-none fs-xs text-foreground"
                              tabindex="0"
                            >
                              预览
                            </div>
                            <span class="fs-xs text-muted-foreground">
                              {{
                                item.name === 'interactive-focus-ring'
                                  ? '按 Tab 可见焦点 shadow'
                                  : '悬停/按下可见'
                              }}
                            </span>
                          </div>
                          <!-- Component：不覆盖 shortcut 的尺寸/背景，卡片类加占位文案，row-center 加子块 -->
                          <div
                            v-else-if="getShortcutDemoKind(group.category) === 'component'"
                            :class="[
                              item.name,
                              'w-full h-full p-padding-xs center',
                              // 针对边框类示例，强制添加对比背景，让 /15 透明度的边线浮现出来
                              item.name.includes('border-')
                                ? 'bg-surface-sunken/50 rounded-scale-xs'
                                : '',
                            ]"
                          >
                            <span
                              v-if="item.name.includes('border-')"
                              class="fs-2xs text-muted-foreground/40 italic"
                            >
                              Preview Area
                            </span>
                            <span
                              v-else
                              class="fs-xs font-medium"
                            >
                              ABC
                            </span>
                          </div>
                          <!-- Size & Visual：不覆盖尺寸，swatch 显小圆，select-min 显 min-width，transition 显条 -->
                          <div
                            v-else-if="getShortcutDemoKind(group.category) === 'size'"
                            class="w-full h-full center p-padding-xs"
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
                            class="w-full h-full center p-padding-xs"
                          >
                            <div
                              v-if="item.name === 'def-gap'"
                              :class="item.name"
                              class="layout-wrap min-w-0 min-h-0"
                            >
                              <span
                                v-for="i in 2"
                                :key="i"
                                class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-scale-xs bg-primary/50 shrink-0"
                              />
                            </div>
                            <span
                              v-else-if="item.name === 'def-fs'"
                              :class="item.name"
                              class="text-foreground"
                            >
                              A
                            </span>
                            <div
                              v-else
                              :class="item.name"
                              class="min-w-[var(--spacing-lg)] min-h-[var(--spacing-lg)] center rounded-scale-sm bg-primary/15"
                            >
                              <span class="fs-xs text-foreground">A</span>
                            </div>
                          </div>
                          <!-- Responsive Gaps：通配符 name=gap-x-* 仅用于说明，预览用具体类展示 -->
                          <div
                            v-else-if="getShortcutDemoKind(group.category) === 'responsive-gaps'"
                            class="w-full h-full center p-padding-xs"
                          >
                            <div
                              v-if="item.name.startsWith('gap-x')"
                              class="w-full flex flex-row justify-center gap-x-md"
                            >
                              <span
                                v-for="i in 3"
                                :key="i"
                                class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-scale-xs bg-primary/60 shrink-0"
                              />
                            </div>
                            <div
                              v-else
                              class="h-full column justify-center gap-y-md"
                            >
                              <span
                                v-for="i in 3"
                                :key="i"
                                class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-scale-xs bg-primary/60 shrink-0"
                              />
                            </div>
                          </div>
                          <!-- Special Spacing：通配符 name=m-gap-* / scroll-m-gap-* 仅用于说明，预览用代表性类 -->
                          <div
                            v-else-if="getShortcutDemoKind(group.category) === 'special-spacing'"
                            class="w-full h-full center p-padding-xs"
                          >
                            <div
                              v-if="item.name.startsWith('m-gap')"
                              class="w-full h-full center bg-primary/5 rounded-scale-sm"
                            >
                              <div class="flex flex-row">
                                <span
                                  class="m-gap-md w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-scale-xs bg-primary/60 shrink-0"
                                />
                                <span
                                  class="m-gap-md w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-scale-xs bg-primary/60 shrink-0"
                                />
                              </div>
                            </div>
                            <div
                              v-else
                              class="w-full h-full center"
                            >
                              <div
                                class="w-full h-full overflow-hidden rounded-scale-sm bg-primary/5 component-border"
                              >
                                <CScrollbar class="h-full">
                                  <div class="p-padding-xs">
                                    <div
                                      class="h-[var(--spacing-md)] bg-primary/10 rounded-scale-xs mb-margin-xs"
                                    />
                                    <div
                                      class="h-[var(--spacing-md)] bg-primary/10 rounded-scale-xs mb-margin-xs"
                                    />
                                    <div
                                      class="h-[var(--spacing-md)] bg-primary/20 rounded-scale-xs scroll-m-gap-lg"
                                    />
                                  </div>
                                </CScrollbar>
                              </div>
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
              <template v-else>
                <div class="col-stack-md items-center py-padding-xl">
                  <EmptyState
                    icon="i-lucide-search-x"
                    title="未找到匹配的快捷类名"
                    description="请尝试其他关键词或清空搜索框"
                  />
                  <Button
                    label="清空搜索"
                    severity="secondary"
                    class="mt-margin-md"
                    @click="searchQuery = ''"
                  />
                </div>
              </template>
            </template>
          </Card>
        </div>

        <!-- 断点系统 -->
        <Card class="panel-base bg-accent/10 dark:bg-accent/5">
          <template #title>
            <div class="row-y-center gap-sm border-b-default pb-padding-sm mb-padding-sm">
              <Icons
                name="i-lucide-monitor"
                class="text-primary"
              />
              <span class="font-semibold">Breakpoints 断点系统</span>
              <Tag
                :value="`${breakpoints.length} breakpoints`"
                severity="secondary"
              />
            </div>
          </template>
          <template #content>
            <div class="col-stack-md">
              <div class="border-b-default pb-padding-sm mb-padding-sm">
                <p class="text-muted-foreground fs-sm">
                  使用方式:
                  <span class="bg-muted px-padding-xs rounded-scale-xs">{breakpoint}:类名</span>
                  · SSOT:
                  <span class="bg-muted px-padding-xs rounded-scale-xs">
                    src/constants/breakpoints.ts
                  </span>
                </p>
              </div>
              <div class="row-y-center gap-sm flex-wrap">
                <span class="text-muted-foreground fs-sm">当前匹配断点:</span>
                <Tag
                  :value="deviceStore.currentBreakpoint"
                  severity="success"
                />
                <span class="font-mono fs-xs text-muted-foreground">
                  (useDeviceStore · 视口 {{ deviceStore.width }}px)
                </span>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-md">
                <div
                  v-for="bp in breakpoints"
                  :key="bp.key"
                  class="col-stack-sm items-center p-padding-md rounded-scale-lg interactive-hover-tile cursor-pointer behavior-hover-transition"
                  :class="
                    bp.key === deviceStore.currentBreakpoint
                      ? 'bg-accent/10 shadow-soft interactive-focus-ring'
                      : 'surface-item'
                  "
                  @click="copyToClipboard(bp.key + ':', bp.key)"
                >
                  <span class="font-bold fs-lg text-primary">
                    {{ bp.key }}
                  </span>
                  <span class="font-mono text-muted-foreground">
                    {{ bp.value }}
                  </span>
                  <span class="fs-xs text-muted-foreground">{{ bp.key }}:类名</span>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- 语义别名 (Semantic Aliases) -->
        <Card class="panel-base bg-primary/5 dark:bg-primary/10">
          <template #title>
            <div class="row-y-center gap-sm border-b-default pb-padding-sm mb-padding-sm">
              <Icons
                name="i-lucide-tags"
                class="text-primary"
              />
              <span class="font-semibold">Semantic Aliases 语义别名</span>
              <Tag
                value="推荐业务层使用"
                severity="success"
              />
            </div>
          </template>
          <template #content>
            <div class="col-stack-md">
              <div class="border-b-default pb-padding-sm mb-padding-sm">
                <p class="text-muted-foreground fs-sm">
                  将抽象业务需求映射到具体配色 · 详见
                  <span class="bg-muted px-padding-xs rounded-scale-xs">uno.config.ts</span>
                </p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                <div
                  v-for="item in semanticAliases"
                  :key="item.name"
                  class="row-y-center gap-md p-padding-md surface-item rounded-scale-lg interactive-hover-tile cursor-pointer behavior-hover-transition"
                  @click="copyToClipboard(item.name)"
                >
                  <div
                    class="w-[var(--spacing-xl)] h-[var(--spacing-xl)] rounded-full shrink-0 component-border"
                    :class="item.classes"
                  />
                  <div class="column flex-1">
                    <span class="font-semibold text-foreground">{{ item.name }}</span>
                    <span class="fs-xs text-muted-foreground">{{ item.desc }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- 安全区规则 -->
        <Card class="panel-base">
          <template #title>
            <div class="row-y-center gap-sm border-b-default pb-padding-sm mb-padding-sm">
              <Icons
                name="i-lucide-shield"
                class="text-primary"
              />
              <span class="font-semibold">Safe Area 安全区规则</span>
            </div>
          </template>
          <template #content>
            <div class="col-stack-md">
              <div class="border-b-default pb-padding-sm mb-padding-sm">
                <p class="text-muted-foreground fs-sm">
                  移动端安全区适配 · 自动使用
                  <span class="bg-muted px-padding-xs rounded-scale-xs">
                    env(safe-area-inset-*)
                  </span>
                </p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div
                  v-for="rule in safeAreaRules"
                  :key="rule.name"
                  class="row-y-center gap-md p-padding-md surface-item rounded-scale-lg interactive-hover-tile cursor-pointer behavior-hover-transition"
                  @click="copyToClipboard(rule.name)"
                >
                  <div class="column flex-1">
                    <span class="font-semibold text-foreground">
                      {{ rule.name }}
                    </span>
                    <span class="font-mono fs-xs text-muted-foreground">
                      {{ rule.css }}
                    </span>
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

        <!-- Surface & Elevation / Glassmorphism -->
        <Card class="panel-base">
          <template #title>
            <div class="row-y-center gap-sm border-b-default pb-padding-sm mb-padding-sm">
              <Icons
                name="i-lucide-layers-3"
                class="text-primary"
              />
              <span class="font-semibold">Surface & Elevation · Glassmorphism</span>
              <Tag
                value="Premium 视觉系统"
                severity="secondary"
              />
            </div>
          </template>
          <template #content>
            <div class="col-stack-md">
              <div class="border-b-default pb-padding-sm mb-padding-sm">
                <p class="text-muted-foreground fs-sm">
                  基于
                  <span class="bg-muted px-padding-xs rounded-scale-xs font-mono">surface-*</span>
                  /
                  <span class="bg-muted px-padding-xs rounded-scale-xs font-mono">
                    glass-surface*
                  </span>
                  /
                  <span class="bg-muted px-padding-xs rounded-scale-xs font-mono">shadow-*</span>
                  的视觉层语义，推荐用于布局区域、Inspector、抽屉等。
                </p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
                <div
                  class="col-stack-xs p-padding-md rounded-scale-md surface-base component-border surface-item interactive-hover-tile cursor-pointer behavior-hover-transition"
                  @click="copyToClipboard('surface-base')"
                >
                  <span class="font-semibold fs-xs text-foreground">surface-base</span>
                  <span class="fs-xs text-muted-foreground">页面基础背景 · bg-background</span>
                </div>
                <div
                  class="col-stack-xs p-padding-md rounded-scale-md surface-elevated interactive-hover-tile cursor-pointer"
                  @click="copyToClipboard('surface-elevated')"
                >
                  <span class="font-semibold fs-xs text-foreground">surface-elevated</span>
                  <span class="fs-xs text-muted-foreground">
                    提升卡片/面板 · bg-card + shadow-soft
                  </span>
                </div>
                <div
                  class="col-stack-xs p-padding-md rounded-scale-md surface-sunken surface-item interactive-hover-tile cursor-pointer behavior-hover-transition"
                  @click="copyToClipboard('surface-sunken')"
                >
                  <span class="font-semibold fs-xs text-foreground">surface-sunken</span>
                  <span class="fs-xs text-muted-foreground">次级背景/沉降区域 · bg-muted</span>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
                <div
                  class="glass-surface rounded-scale-md p-padding-md col-stack-xs component-border surface-item interactive-hover-tile cursor-pointer behavior-hover-transition"
                  @click="copyToClipboard('glass-surface')"
                >
                  <span class="font-semibold fs-xs text-foreground">glass-surface</span>
                  <span class="fs-xs text-muted-foreground">
                    抽屉 / Inspector · 半透明 + backdrop-blur-md（浮层场景下效果更明显）
                  </span>
                </div>
                <div
                  class="glass-surface-lg rounded-scale-md p-padding-md col-stack-xs component-border surface-item interactive-hover-tile cursor-pointer behavior-hover-transition"
                  @click="copyToClipboard('glass-surface-lg')"
                >
                  <span class="font-semibold fs-xs text-foreground">glass-surface-lg</span>
                  <span class="fs-xs text-muted-foreground">更强模糊，适合全屏浮层</span>
                </div>
                <div class="col-stack-xs">
                  <span class="font-semibold fs-xs text-foreground">
                    shadow-soft / shadow-float
                  </span>
                  <div class="row-y-center gap-md">
                    <div
                      class="w-[var(--spacing-3xl)] h-[var(--spacing-2xl)] rounded-scale-md surface-elevated cursor-pointer interactive-hover-tile behavior-hover-transition"
                      title="点击复制 shadow-soft"
                      @click="copyToClipboard('shadow-soft')"
                    />
                    <div
                      class="w-[var(--spacing-3xl)] h-[var(--spacing-2xl)] surface-elevated cursor-pointer interactive-hover-tile behavior-hover-transition"
                      title="点击复制 shadow-float"
                      @click="copyToClipboard('shadow-float')"
                    />
                  </div>
                  <span class="fs-xs text-muted-foreground">
                    soft：列表卡片 | float：Drawer / 浮动面板（暗色模式自动加深）· 点击色块复制类名
                  </span>
                </div>
              </div>
              <div class="col-stack-sm">
                <span class="font-semibold fs-xs text-foreground">
                  transition-fluid · GPU 友好布局过渡
                </span>
                <div class="row-y-center gap-md">
                  <div
                    class="w-[var(--spacing-3xl)] h-[var(--spacing-2xl)] rounded-scale-md bg-primary/40 transition-fluid cursor-pointer interactive-hover-tile behavior-hover-transition"
                    title="点击复制 transition-fluid"
                    @click="copyToClipboard('transition-fluid')"
                  >
                    <!-- 占位块，hover 时由 transition-fluid 控制 transform/opacity -->
                  </div>
                  <p class="fs-xs text-muted-foreground">
                    <span class="bg-muted px-padding-xs rounded-scale-xs font-mono">
                      transition-fluid
                    </span>
                    = transition-[transform,opacity] duration-scale-lg ease-out-expo ·
                    布局区域推荐统一使用
                  </p>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- 架构能力索引 -->
        <Card class="panel-base bg-primary/10 dark:bg-primary/5">
          <template #title>
            <div class="row-y-center gap-sm border-b-default pb-padding-sm mb-padding-sm">
              <Icons
                name="i-lucide-network"
                class="text-primary"
              />
              <span class="font-semibold">架构能力索引</span>
              <Tag
                value="更多示例在 example 目录"
                severity="info"
              />
            </div>
          </template>
          <template #content>
            <div class="col-stack-md">
              <div class="border-b-default pb-padding-sm mb-padding-sm">
                <p class="text-muted-foreground fs-sm">
                  system-configuration 展示设计系统常量与类名；以下架构能力示例位于 example
                  目录或文档
                </p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                <RouterLink
                  to="/example/charts"
                  class="row-y-center gap-sm p-padding-md surface-item rounded-scale-lg interactive-hover-tile"
                >
                  <Icons
                    name="i-lucide-chart-bar"
                    class="text-primary shrink-0"
                  />
                  <span>UseEcharts · ECharts 主题</span>
                </RouterLink>
                <RouterLink
                  to="/example/basic-ui/icons"
                  class="row-y-center gap-sm p-padding-md surface-item rounded-scale-lg interactive-hover-tile"
                >
                  <Icons
                    name="i-lucide-brush"
                    class="text-primary shrink-0"
                  />
                  <span>Icons 图标体系</span>
                </RouterLink>
                <RouterLink
                  to="/example/pro-form/basic"
                  class="row-y-center gap-sm p-padding-md surface-item rounded-scale-lg interactive-hover-tile"
                >
                  <Icons
                    name="i-lucide-clipboard-list"
                    class="text-primary shrink-0"
                  />
                  <span>ProForm · Schema 驱动表单</span>
                </RouterLink>
                <RouterLink
                  to="/example/pro-table/playground"
                  class="row-y-center gap-sm p-padding-md surface-item rounded-scale-lg interactive-hover-tile"
                >
                  <Icons
                    name="i-lucide-table"
                    class="text-primary shrink-0"
                  />
                  <span>ProTable · Playground</span>
                </RouterLink>
                <RouterLink
                  to="/example/basic-ui/primevue-dialog"
                  class="row-y-center gap-sm p-padding-md surface-item rounded-scale-lg interactive-hover-tile"
                >
                  <Icons
                    name="i-lucide-box"
                    class="text-primary shrink-0"
                  />
                  <span>PrimeDialog · useDialog</span>
                </RouterLink>
                <div
                  class="row-y-center gap-sm p-padding-md surface-item rounded-scale-lg interactive-hover-tile"
                >
                  <Icons
                    name="i-lucide-layout"
                    class="text-primary shrink-0"
                  />
                  <span class="text-muted-foreground fs-sm">
                    Layout 适配 · docs/ADAPTIVE_LAYOUT.md
                  </span>
                </div>
                <div
                  class="row-y-center gap-sm p-padding-md surface-item rounded-scale-lg interactive-hover-tile"
                >
                  <Icons
                    name="i-lucide-lock"
                    class="text-primary shrink-0"
                  />
                  <span class="text-muted-foreground fs-sm">
                    安全存储 · PROJECT_PROTOCOL §8.4.7
                  </span>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Quick Reference（仅 Uno 特性） -->
        <Card class="panel-base bg-gradient-to-br from-primary/5 to-accent/5">
          <template #title>
            <div class="row-y-center gap-sm border-b-default pb-padding-sm mb-padding-sm">
              <Icons
                name="i-lucide-book-open"
                class="text-primary"
              />
              <span>Quick Reference 快速参考</span>
            </div>
          </template>
          <template #content>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
              <div class="col-stack-sm">
                <h4 class="font-semibold text-foreground">Shortcuts 快捷类名</h4>
                <p class="fs-xs text-muted-foreground">
                  业务层优先使用 shortcuts（密度、布局、文本、交互、组件语义），避免手写原子类组合。
                </p>
                <div
                  class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                  @click="copyToClipboard('row-center')"
                >
                  row-center
                </div>
                <div
                  class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                  @click="copyToClipboard('density-normal')"
                >
                  density-normal
                </div>
              </div>
              <div class="col-stack-sm">
                <h4 class="font-semibold text-foreground">断点前缀 (Breakpoints)</h4>
                <p class="fs-xs text-muted-foreground">
                  用法
                  <span class="bg-muted px-padding-xs rounded-scale-xs fs-xs">
                    {breakpoint}:类名
                  </span>
                  · SSOT:
                  <span class="bg-muted px-padding-xs rounded-scale-xs fs-xs">
                    src/constants/breakpoints.ts
                  </span>
                </p>
                <RouterLink
                  to="/system-configuration/breakpoints"
                  class="text-primary hover:underline fs-sm"
                >
                  断点尺子与用法示例 →
                </RouterLink>
              </div>
              <div class="col-stack-sm">
                <h4 class="font-semibold text-foreground">安全区 (Safe Area)</h4>
                <div
                  class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                  @click="copyToClipboard('scroll-m-gap-md')"
                >
                  scroll-m-gap-{scale}
                </div>
                <div
                  class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                  @click="copyToClipboard('m-gap-md')"
                >
                  m-gap-{scale}
                </div>
                <p class="fs-xs text-muted-foreground">移动端安全区 · env(safe-area-inset-*)</p>
              </div>
              <div class="col-stack-sm">
                <h4 class="font-semibold text-foreground">规则 (Rules)</h4>
                <p class="fs-xs text-muted-foreground">
                  <span
                    class="bg-muted px-padding-xs rounded-scale-xs cursor-pointer hover:bg-muted/80"
                    @click="copyToClipboard('gap-x-md')"
                  >
                    gap-x-*
                  </span>
                  /
                  <span
                    class="bg-muted px-padding-xs rounded-scale-xs cursor-pointer hover:bg-muted/80"
                    @click="copyToClipboard('gap-y-md')"
                  >
                    gap-y-*
                  </span>
                  独立轴向间距。
                </p>
                <p class="fs-xs text-muted-foreground">
                  <span
                    class="bg-muted px-padding-xs rounded-scale-xs cursor-pointer hover:bg-muted/80"
                    @click="copyToClipboard('main-center')"
                  >
                    main-*
                  </span>
                  /
                  <span
                    class="bg-muted px-padding-xs rounded-scale-xs cursor-pointer hover:bg-muted/80"
                    @click="copyToClipboard('cross-center')"
                  >
                    cross-*
                  </span>
                  须与
                  <span
                    class="bg-muted px-padding-xs rounded-scale-xs cursor-pointer hover:bg-muted/80"
                    @click="copyToClipboard('row')"
                  >
                    row
                  </span>
                  或
                  <span
                    class="bg-muted px-padding-xs rounded-scale-xs cursor-pointer hover:bg-muted/80"
                    @click="copyToClipboard('column')"
                  >
                    column
                  </span>
                  同用，否则主轴/交叉轴语义不明。
                </p>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </CScrollbar>
  </div>
</template>

<style scoped>
code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
