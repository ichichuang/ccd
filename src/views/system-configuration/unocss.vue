<script setup lang="ts">
import { BREAKPOINTS } from '@/constants/breakpoints'
import { shortcutGroups } from './configs/shortcutGroups'
import type { ShortcutGroup } from './configs/shortcutGroups'
import { useDeviceStore } from '@/stores/modules/device'

const deviceStore = useDeviceStore()
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
  'relative w-20 h-12 shrink-0 rounded-scale-sm overflow-visible border border-primary/30 bg-primary/5 flex items-center justify-center'

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
  <div class="h-full flex flex-col overflow-hidden">
    <!-- Toolbar: Header + Search (non-scroll) -->
    <div class="shrink-0 px-padding-lg py-padding-md bg-background border-b-default">
      <div class="layout-content-wide flex flex-col gap-md">
        <!-- Header -->
        <div class="flex flex-col gap-xs">
          <div class="flex items-center gap-md">
            <div class="p-padding-md bg-primary/10 rounded-scale-lg shrink-0">
              <Icons
                name="i-lucide-paintbrush"
                class="text-primary fs-2xl transition-all duration-scale-lg"
              />
            </div>
            <div>
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
            class="border-l-4 border-primary bg-primary/5 p-padding-md rounded-r-scale-md flex gap-md items-start mt-margin-sm"
          >
            <Icons
              name="i-lucide-info"
              class="text-primary fs-xl shrink-0 mt-0.5"
            />
            <div class="flex flex-col gap-0.5">
              <div class="font-semibold text-primary fs-sm">Architectural Guide 架构引导</div>
              <div class="text-muted-foreground fs-xs leading-relaxed">
                本页面展示由
                <span class="bg-muted px-padding-xs rounded font-mono">uno.config.ts</span>
                定义的快捷类名与规则。业务组件应优先使用逻辑语义相关的快捷类名。
              </div>
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
      </div>
    </div>

    <!-- Scrollable content -->
    <CScrollbar class="flex-1 min-h-0">
      <div class="p-padding-lg bg-background">
        <div class="layout-content-wide flex flex-col gap-xl">
          <!-- Shortcuts 快捷方式 -->
          <Card
            v-if="filteredShortcutGroups.length > 0"
            class="component-border hover:shadow-md transition-all duration-scale-lg"
          >
            <template #title>
              <div class="flex items-center gap-sm">
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
                        class="flex flex-col rounded-scale-md overflow-hidden cursor-pointer surface-item component-border shadow-sm hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-scale-lg"
                        @click="copyToClipboard(item.name)"
                      >
                        <!-- 示意图区域 -->
                        <div
                          class="relative h-20 bg-primary/5 border-b border-border overflow-hidden"
                        >
                          <!-- layout-full: 四边锚点 + 填充块 -->
                          <template v-if="item.name === 'layout-full'">
                            <div
                              class="absolute inset-2 bg-primary/20 rounded-sm border border-primary/30 flex items-center justify-center"
                            >
                              <span class="fs-xs text-primary font-mono">w-full h-full</span>
                            </div>
                            <div
                              class="absolute top-2 left-2 w-2 h-2 border-l-2 border-t-2 border-primary/60 rounded-tl-sm"
                            />
                            <div
                              class="absolute top-2 right-2 w-2 h-2 border-r-2 border-t-2 border-primary/60 rounded-tr-sm"
                            />
                            <div
                              class="absolute bottom-2 left-2 w-2 h-2 border-l-2 border-b-2 border-primary/60 rounded-bl-sm"
                            />
                            <div
                              class="absolute bottom-2 right-2 w-2 h-2 border-r-2 border-b-2 border-primary/60 rounded-br-sm"
                            />
                          </template>
                          <!-- layout-screen: 浏览器 chrome 示意 -->
                          <template v-else-if="item.name === 'layout-screen'">
                            <div
                              class="absolute inset-2 rounded-sm border border-primary/40 bg-primary/10 flex flex-col overflow-hidden"
                            >
                              <div
                                class="shrink-0 h-3 bg-primary/25 border-b border-primary/20 flex items-center px-1 gap-0.5"
                              >
                                <span class="w-1.5 h-1.5 rounded-full bg-error/60" />
                                <span class="w-1.5 h-1.5 rounded-full bg-warning/60" />
                                <span class="w-1.5 h-1.5 rounded-full bg-success/60" />
                              </div>
                              <div class="flex-1 flex items-center justify-center">
                                <span class="fs-xs text-primary/70 font-mono">100vw × 100vh</span>
                              </div>
                            </div>
                          </template>
                          <!-- layout-container: 双色区块示意 bg-background + text-foreground -->
                          <template v-else-if="item.name === 'layout-container'">
                            <div
                              class="absolute inset-2 rounded-sm overflow-hidden flex gap-px bg-border"
                            >
                              <div class="flex-1 bg-background flex items-center justify-center">
                                <div class="flex flex-col items-center gap-0.5">
                                  <div class="w-5 h-1 rounded-full bg-foreground/20" />
                                  <div class="w-7 h-1 rounded-full bg-foreground/15" />
                                  <div class="w-4 h-1 rounded-full bg-foreground/10" />
                                </div>
                              </div>
                              <div class="flex-1 bg-card flex items-center justify-center">
                                <span class="fs-xs text-foreground/50 font-mono">text</span>
                              </div>
                            </div>
                          </template>
                          <!-- layout-stack: 竖向堆叠 + gap 标注 -->
                          <template v-else-if="item.name === 'layout-stack'">
                            <div class="absolute inset-2 flex flex-col justify-center gap-1.5">
                              <div
                                v-for="i in 3"
                                :key="i"
                                class="h-3 rounded-sm bg-primary/30 border border-primary/20 w-full"
                              />
                            </div>
                            <div
                              class="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 opacity-70"
                            >
                              <div class="w-px h-2 bg-primary/60" />
                              <span class="fs-xs text-primary leading-none font-mono">gap</span>
                              <div class="w-px h-2 bg-primary/60" />
                            </div>
                          </template>
                          <!-- layout-wrap: 换行示意 -->
                          <template v-else-if="item.name === 'layout-wrap'">
                            <div class="absolute inset-2 flex flex-wrap gap-1 content-start">
                              <div
                                v-for="i in 6"
                                :key="i"
                                class="w-5 h-4 rounded-sm shrink-0 border"
                                :class="
                                  i <= 3
                                    ? 'bg-primary/50 border-primary/40'
                                    : 'bg-primary/20 border-primary/20'
                                "
                              />
                            </div>
                            <span class="absolute bottom-2 right-2 fs-xs text-primary/60 font-mono">
                              ↩
                            </span>
                          </template>
                          <!-- layout-grid-center: 3×3 网格中心高亮 -->
                          <template v-else-if="item.name === 'layout-grid-center'">
                            <div class="absolute inset-2 grid grid-cols-3 grid-rows-3 gap-0.5">
                              <div
                                v-for="i in 9"
                                :key="i"
                                class="rounded-sm border"
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
                              class="absolute inset-2 rounded-sm border border-dashed border-primary/30 bg-primary/5"
                            >
                              <div
                                class="absolute top-1/2 left-0 right-0 h-px bg-primary/30 -translate-y-1/2"
                              />
                              <div
                                class="absolute left-1/2 top-0 bottom-0 w-px bg-primary/30 -translate-x-1/2"
                              />
                              <div
                                class="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-primary/70 -translate-x-1/2 -translate-y-1/2 border-2 border-primary/80"
                              />
                            </div>
                          </template>
                          <!-- fallback -->
                          <template v-else>
                            <div
                              class="absolute inset-2 rounded-sm bg-primary/15 border border-primary/20 flex items-center justify-center"
                            >
                              <span class="fs-xs text-primary/60">{{ item.name }}</span>
                            </div>
                          </template>
                        </div>
                        <!-- 信息区 -->
                        <div class="p-padding-sm flex flex-col gap-1">
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
                    <div class="flex flex-col gap-sm">
                      <div
                        v-for="item in group.items"
                        :key="item.name"
                        class="flex items-center gap-md p-padding-md surface-item rounded-scale-md component-border shadow-sm hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 cursor-pointer active:scale-95 transition-all duration-scale-lg"
                        @click="copyToClipboard(item.name)"
                      >
                        <!-- 文字信息 -->
                        <div class="flex flex-col flex-1 min-w-0 gap-xs">
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
                          class="shrink-0 flex items-center gap-sm"
                          @click.stop
                        >
                          <!-- 左：默认态 -->
                          <div class="flex flex-col items-center gap-xs">
                            <div
                              class="px-padding-sm py-padding-xs rounded-scale-sm bg-card component-border fs-xs text-muted-foreground whitespace-nowrap min-w-12 text-center"
                            >
                              默认
                            </div>
                            <span class="fs-xs text-muted-foreground/50 leading-none">default</span>
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
                            class="flex flex-col items-center gap-xs"
                          >
                            <div
                              class="px-padding-sm py-padding-xs rounded-scale-sm bg-card component-border fs-xs text-primary -translate-y-0.5 opacity-80 whitespace-nowrap min-w-12 text-center transition-none"
                            >
                              过渡中
                            </div>
                            <span class="fs-xs text-muted-foreground/50 leading-none">
                              transitioning
                            </span>
                          </div>
                          <!-- hover-elevated: 展示 shadow + border-primary-hover/50 -->
                          <div
                            v-else-if="item.name === 'hover-elevated'"
                            class="flex flex-col items-center gap-xs"
                          >
                            <div
                              class="px-padding-sm py-padding-xs rounded-scale-sm bg-card shadow-md border border-primary/40 fs-xs text-primary whitespace-nowrap min-w-12 text-center"
                            >
                              阴影浮起
                            </div>
                            <span class="fs-xs text-muted-foreground/50 leading-none">hover</span>
                          </div>
                          <!-- interactive-hover: hover-elevated + translate（组合效果） -->
                          <div
                            v-else-if="item.name === 'interactive-hover'"
                            class="flex flex-col items-center gap-xs"
                          >
                            <div
                              class="px-padding-sm py-padding-xs rounded-scale-sm bg-card shadow-md border border-primary/40 -translate-y-0.5 fs-xs text-primary whitespace-nowrap min-w-12 text-center transition-none"
                            >
                              ↑ 悬浮提升
                            </div>
                            <span class="fs-xs text-muted-foreground/50 leading-none">hover</span>
                          </div>
                          <!-- interactive-click: scale-95 按下缩小 -->
                          <div
                            v-else-if="item.name === 'interactive-click'"
                            class="flex flex-col items-center gap-xs"
                          >
                            <div
                              class="px-padding-sm py-padding-xs rounded-scale-sm bg-primary/20 border border-primary/40 scale-95 fs-xs text-primary whitespace-nowrap min-w-12 text-center transition-none"
                            >
                              ↓ 按下
                            </div>
                            <span class="fs-xs text-muted-foreground/50 leading-none">active</span>
                          </div>
                          <!-- interactive-focus-ring: 静态展示 ring 效果 -->
                          <div
                            v-else-if="item.name === 'interactive-focus-ring'"
                            class="flex flex-col items-center gap-xs"
                          >
                            <button
                              type="button"
                              class="px-padding-sm py-padding-xs rounded-scale-sm bg-card border border-primary/40 fs-xs text-primary ring-2 ring-ring ring-offset-2 outline-none whitespace-nowrap min-w-12 text-center"
                            >
                              Tab 聚焦
                            </button>
                            <span class="fs-xs text-muted-foreground/50 leading-none">
                              focus-visible
                            </span>
                          </div>
                          <!-- fallback -->
                          <div
                            v-else
                            class="flex flex-col items-center gap-xs"
                          >
                            <div
                              class="px-padding-sm py-padding-xs rounded-scale-sm bg-primary/20 border border-primary/40 fs-xs text-foreground whitespace-nowrap min-w-12 text-center"
                            >
                              激活
                            </div>
                            <span class="fs-xs text-muted-foreground/50 leading-none">active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>

                  <!-- Menu 菜单交互：迷你菜单模拟器 -->
                  <template v-else-if="group.category === 'Menu 菜单交互'">
                    <div class="flex flex-col gap-md">
                      <!-- 模拟菜单面板：三态对比 -->
                      <div class="rounded-scale-md component-border bg-card overflow-hidden">
                        <div
                          class="px-padding-md py-padding-sm border-b-default flex items-center justify-between"
                        >
                          <span class="fs-xs font-semibold text-muted-foreground">
                            Menu 状态模拟器
                          </span>
                          <span class="fs-xs text-muted-foreground/50">点击行复制类名</span>
                        </div>
                        <div class="p-padding-xs flex flex-col gap-1">
                          <div
                            v-for="item in group.items"
                            :key="item.name"
                            class="flex items-center justify-between px-padding-sm py-padding-xs rounded-scale-sm cursor-pointer"
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
                            <div class="flex items-center gap-sm flex-1 min-w-0">
                              <div class="flex flex-col min-w-0">
                                <span class="fs-sm font-medium text-single-line-ellipsis">
                                  {{ item.desc || item.name }}
                                </span>
                                <span class="font-mono fs-xs opacity-50">{{ item.name }}</span>
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
                        <div class="px-padding-md py-padding-xs border-t-default surface-item">
                          <span class="fs-xs text-muted-foreground/60">
                            menu-item-hover / active-leaf 由程序逻辑赋予，非 CSS :hover 触发
                          </span>
                        </div>
                      </div>
                      <!-- classes 详细说明卡 -->
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-sm">
                        <div
                          v-for="item in group.items"
                          :key="`info-${item.name}`"
                          class="flex flex-col gap-xs p-padding-sm surface-item rounded-scale-md component-border shadow-sm hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 cursor-pointer active:scale-95 transition-all duration-scale-lg"
                          @click="copyToClipboard(item.name)"
                        >
                          <span class="font-semibold fs-sm text-foreground">{{ item.name }}</span>
                          <span class="font-mono fs-xs text-muted-foreground leading-relaxed">
                            {{ item.classes }}
                          </span>
                          <span
                            v-if="item.desc"
                            class="fs-xs text-info"
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
                      class="flex items-center gap-md p-padding-md surface-item rounded-scale-md component-border shadow-sm hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 cursor-pointer active:scale-95 transition-all duration-scale-lg"
                      @click="copyToClipboard(item.name)"
                    >
                      <div class="flex flex-col flex-1 min-w-0">
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
                              ['layout-stack', 'layout-wrap', 'layout-grid-center'].includes(
                                item.name
                              )
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
                            v-else-if="item.name === 'layout-absolute-center'"
                            class="w-full h-full"
                          >
                            <div
                              class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-sm bg-primary/60 layout-absolute-center"
                            />
                          </div>
                          <div
                            v-else-if="item.name === 'layout-screen'"
                            class="w-full h-full overflow-hidden rounded-scale-sm bg-primary/10 component-border flex items-center justify-center"
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
                          >
                            示例文字
                          </span>
                        </div>
                        <!-- Interaction：可悬停/聚焦的小块 + 说明，效果需悬停/聚焦可见 -->
                        <div
                          v-else-if="getShortcutDemoKind(group.category) === 'interaction'"
                          class="w-full h-full flex flex-col items-center justify-center gap-xs p-padding-xs"
                        >
                          <button
                            v-if="item.name === 'interactive-focus-ring'"
                            type="button"
                            :class="item.name"
                            class="min-w-[var(--spacing-2xl)] min-h-[var(--spacing-md)] rounded-scale-sm bg-primary/20 border border-primary/40 flex items-center justify-center cursor-pointer select-none fs-xs text-foreground"
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
                            class="min-w-[var(--spacing-2xl)] min-h-[var(--spacing-md)] rounded-scale-sm bg-primary/20 border border-primary/40 flex items-center justify-center cursor-pointer select-none fs-xs text-foreground"
                            tabindex="0"
                          >
                            预览
                          </div>
                          <span class="fs-xs text-muted-foreground">
                            {{
                              item.name === 'interactive-focus-ring'
                                ? '按 Tab 可见 ring'
                                : '悬停/按下可见'
                            }}
                          </span>
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
                            <template v-if="item.name === 'component-card-layout'">
                              <div class="w-full h-full flex flex-col">
                                <div
                                  class="flex flex-wrap"
                                  :class="item.name"
                                >
                                  <span
                                    v-for="i in 3"
                                    :key="i"
                                    class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-sm bg-primary/60 shrink-0"
                                  />
                                </div>
                              </div>
                            </template>
                            <template v-else-if="item.name === 'component-card-hoverable'">
                              <div
                                class="w-full h-full component-card-base component-card-hoverable flex items-center justify-center"
                              >
                                <span class="fs-xs text-foreground">Hover</span>
                              </div>
                            </template>
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
                          >
                            A
                          </span>
                          <div
                            v-else
                            :class="item.name"
                            class="min-w-6 min-h-6 flex items-center justify-center rounded-scale-sm bg-primary/15"
                          >
                            <span class="fs-xs text-foreground">A</span>
                          </div>
                        </div>
                        <!-- Responsive Gaps：通配符 name=gap-x-* 仅用于说明，预览用具体类展示 -->
                        <div
                          v-else-if="getShortcutDemoKind(group.category) === 'responsive-gaps'"
                          class="w-full h-full flex items-center justify-center p-padding-xs"
                        >
                          <div
                            v-if="item.name.startsWith('gap-x')"
                            class="w-full flex flex-row justify-center gap-x-md"
                          >
                            <span
                              v-for="i in 3"
                              :key="i"
                              class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-sm bg-primary/60 shrink-0"
                            />
                          </div>
                          <div
                            v-else
                            class="h-full flex flex-col justify-center gap-y-md"
                          >
                            <span
                              v-for="i in 3"
                              :key="i"
                              class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-sm bg-primary/60 shrink-0"
                            />
                          </div>
                        </div>
                        <!-- Special Spacing：通配符 name=m-gap-* / scroll-m-gap-* 仅用于说明，预览用代表性类 -->
                        <div
                          v-else-if="getShortcutDemoKind(group.category) === 'special-spacing'"
                          class="w-full h-full flex items-center justify-center p-padding-xs"
                        >
                          <div
                            v-if="item.name.startsWith('m-gap')"
                            class="w-full h-full flex items-center justify-center bg-primary/5 rounded-scale-sm"
                          >
                            <div class="flex flex-row">
                              <span
                                class="m-gap-md w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-sm bg-primary/60 shrink-0"
                              />
                              <span
                                class="m-gap-md w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-sm bg-primary/60 shrink-0"
                              />
                            </div>
                          </div>
                          <div
                            v-else
                            class="w-full h-full flex items-center justify-center"
                          >
                            <div
                              class="w-full h-full overflow-hidden rounded-scale-sm bg-primary/5 component-border"
                            >
                              <div class="h-full overflow-y-auto">
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
                              </div>
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
          </Card>

          <!-- 断点系统 -->
          <Card class="component-border">
            <template #title>
              <div class="flex items-center gap-sm">
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
              <div class="flex flex-col gap-md">
                <p class="text-muted-foreground fs-sm">
                  使用方式:
                  <span class="bg-muted px-padding-xs rounded">{breakpoint}:类名</span>
                  · SSOT:
                  <span class="bg-muted px-padding-xs rounded">src/constants/breakpoints.ts</span>
                </p>
                <div class="flex items-center gap-sm flex-wrap">
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
                    class="flex flex-col items-center gap-sm p-padding-md rounded-scale-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-all duration-scale-lg cursor-pointer shadow-sm hover:shadow-md"
                    :class="
                      bp.key === deviceStore.currentBreakpoint
                        ? 'bg-accent/10 component-border border-accent/50'
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
          <Card class="component-border">
            <template #title>
              <div class="flex items-center gap-sm">
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
              <div class="flex flex-col gap-md">
                <p class="text-muted-foreground fs-sm">
                  将抽象业务需求映射到具体配色 · 详见
                  <span class="bg-muted px-padding-xs rounded">uno.config.ts</span>
                </p>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                  <div
                    v-for="item in semanticAliases"
                    :key="item.name"
                    class="flex items-center gap-md p-padding-md surface-item rounded-scale-md component-border shadow-sm hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-all duration-scale-lg cursor-pointer"
                    @click="copyToClipboard(item.name)"
                  >
                    <div
                      class="w-8 h-8 rounded-full shrink-0 border border-primary/20"
                      :class="item.classes"
                    />
                    <div class="flex flex-col flex-1">
                      <span class="font-semibold text-foreground">{{ item.name }}</span>
                      <span class="fs-xs text-muted-foreground">{{ item.desc }}</span>
                    </div>
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
                <span class="font-semibold">Safe Area 安全区规则</span>
              </div>
            </template>
            <template #content>
              <div class="flex flex-col gap-md">
                <p class="text-muted-foreground fs-sm">
                  移动端安全区适配 · 自动使用
                  <span class="bg-muted px-padding-xs rounded">env(safe-area-inset-*)</span>
                </p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div
                    v-for="rule in safeAreaRules"
                    :key="rule.name"
                    class="flex items-center gap-md p-padding-md surface-item rounded-scale-md hover:bg-muted/60 dark:hover:bg-muted/40 transition-colors duration-scale-lg cursor-pointer"
                    @click="copyToClipboard(rule.name)"
                  >
                    <div class="flex flex-col flex-1">
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
          <Card class="component-border hover:shadow-md transition-all duration-scale-lg">
            <template #title>
              <div class="flex items-center gap-sm">
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
              <div class="flex flex-col gap-md">
                <p class="text-muted-foreground fs-sm">
                  基于
                  <span class="bg-muted px-padding-xs rounded font-mono">surface-*</span>
                  /
                  <span class="bg-muted px-padding-xs rounded font-mono">glass-surface*</span>
                  /
                  <span class="bg-muted px-padding-xs rounded font-mono">shadow-*</span>
                  的视觉层语义，推荐用于布局区域、Inspector、抽屉等。
                </p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
                  <div
                    class="flex flex-col gap-xs p-padding-md rounded-scale-md surface-base component-border transition-all duration-scale-lg"
                  >
                    <span class="font-semibold fs-xs text-foreground">surface-base</span>
                    <span class="fs-xs text-muted-foreground">页面基础背景 · bg-background</span>
                  </div>
                  <div
                    class="flex flex-col gap-xs p-padding-md rounded-scale-md surface-elevated transition-all duration-scale-lg"
                  >
                    <span class="font-semibold fs-xs text-foreground">surface-elevated</span>
                    <span class="fs-xs text-muted-foreground">
                      提升卡片/面板 · bg-card + shadow-soft
                    </span>
                  </div>
                  <div
                    class="flex flex-col gap-xs p-padding-md rounded-scale-md surface-sunken transition-all duration-scale-lg"
                  >
                    <span class="font-semibold fs-xs text-foreground">surface-sunken</span>
                    <span class="fs-xs text-muted-foreground">次级背景/沉降区域 · bg-muted</span>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-md">
                  <div
                    class="glass-surface rounded-scale-md p-padding-md flex flex-col gap-xs component-border transition-all duration-scale-lg"
                  >
                    <span class="font-semibold fs-xs text-foreground">glass-surface</span>
                    <span class="fs-xs text-muted-foreground">
                      抽屉 / Inspector · 半透明 + backdrop-blur-md
                    </span>
                  </div>
                  <div
                    class="glass-surface-lg rounded-scale-md p-padding-md flex flex-col gap-xs component-border transition-all duration-scale-lg"
                  >
                    <span class="font-semibold fs-xs text-foreground">glass-surface-lg</span>
                    <span class="fs-xs text-muted-foreground">更强模糊，适合全屏浮层</span>
                  </div>
                  <div class="flex flex-col gap-xs">
                    <span class="font-semibold fs-xs text-foreground">
                      shadow-soft / shadow-float
                    </span>
                    <div class="flex items-center gap-md">
                      <div
                        class="w-[var(--spacing-3xl)] h-[var(--spacing-2xl)] rounded-scale-md bg-card shadow-soft"
                      />
                      <div
                        class="w-[var(--spacing-3xl)] h-[var(--spacing-2xl)] rounded-scale-md bg-card shadow-float"
                      />
                    </div>
                    <span class="fs-xs text-muted-foreground">
                      soft：列表卡片 | float：Drawer / 浮动面板（暗色模式自动加深）
                    </span>
                  </div>
                </div>
                <div class="flex flex-col gap-sm">
                  <span class="font-semibold fs-xs text-foreground">
                    transition-fluid · GPU 友好布局过渡
                  </span>
                  <div class="flex items-center gap-md">
                    <div
                      class="w-[var(--spacing-3xl)] h-[var(--spacing-2xl)] rounded-scale-md bg-primary/40 transition-fluid cursor-pointer"
                    >
                      <!-- 占位块，hover 时由 transition-fluid 控制 transform/opacity -->
                    </div>
                    <p class="fs-xs text-muted-foreground">
                      <span class="bg-muted px-padding-xs rounded font-mono">transition-fluid</span>
                      = transition-[transform,opacity] duration-scale-lg ease-out-expo ·
                      布局区域推荐统一使用
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- 架构能力索引 -->
          <Card class="component-border">
            <template #title>
              <div class="flex items-center gap-sm">
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
              <div class="flex flex-col gap-md">
                <p class="text-muted-foreground fs-sm">
                  system-configuration 展示设计系统常量与类名；以下架构能力示例位于 example
                  目录或文档
                </p>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                  <RouterLink
                    to="/example/charts/use-echarts"
                    class="flex items-center gap-sm p-padding-md surface-item rounded-scale-md component-border shadow-sm hover:shadow-md behavior-hover-transition hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-colors duration-scale-lg"
                  >
                    <Icons
                      name="i-lucide-chart-bar"
                      class="text-primary shrink-0"
                    />
                    <span>UseEcharts · ECharts 主题</span>
                  </RouterLink>
                  <RouterLink
                    to="/example/basic-ui/icons"
                    class="flex items-center gap-sm p-padding-md surface-item rounded-scale-md component-border shadow-sm hover:shadow-md behavior-hover-transition hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-colors duration-scale-lg"
                  >
                    <Icons
                      name="i-lucide-brush"
                      class="text-primary shrink-0"
                    />
                    <span>Icons 图标体系</span>
                  </RouterLink>
                  <RouterLink
                    to="/example/forms/schema-form"
                    class="flex items-center gap-sm p-padding-md surface-item rounded-scale-md component-border shadow-sm hover:shadow-md behavior-hover-transition hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-colors"
                  >
                    <Icons
                      name="i-lucide-clipboard-list"
                      class="text-primary shrink-0"
                    />
                    <span>SchemaForm</span>
                  </RouterLink>
                  <RouterLink
                    to="/example/tables/data-table"
                    class="flex items-center gap-sm p-padding-md surface-item rounded-scale-md component-border shadow-sm hover:shadow-md behavior-hover-transition hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-colors"
                  >
                    <Icons
                      name="i-lucide-table"
                      class="text-primary shrink-0"
                    />
                    <span>DataTable</span>
                  </RouterLink>
                  <RouterLink
                    to="/example/basic-ui/primevue-dialog"
                    class="flex items-center gap-sm p-padding-md surface-item rounded-scale-md component-border shadow-sm hover:shadow-md behavior-hover-transition hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-colors"
                  >
                    <Icons
                      name="i-lucide-box"
                      class="text-primary shrink-0"
                    />
                    <span>PrimeDialog · useDialog</span>
                  </RouterLink>
                  <div class="flex items-center gap-sm p-padding-md surface-item rounded-scale-md">
                    <Icons
                      name="i-lucide-layout"
                      class="text-primary shrink-0"
                    />
                    <span class="text-muted-foreground fs-sm">
                      Layout 适配 · docs/ADAPTIVE_LAYOUT.md
                    </span>
                  </div>
                  <div class="flex items-center gap-sm p-padding-md surface-item rounded-scale-md">
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
                    业务层优先使用
                    shortcuts（密度、布局、文本、交互、组件语义），避免手写原子类组合。
                  </p>
                  <div
                    class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                    @click="copyToClipboard('row-center')"
                  >
                    row-center
                  </div>
                  <div
                    class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                    @click="copyToClipboard('density-normal')"
                  >
                    density-normal
                  </div>
                </div>
                <div class="flex flex-col gap-sm">
                  <h4 class="font-semibold text-foreground">断点前缀 (Breakpoints)</h4>
                  <p class="fs-xs text-muted-foreground">
                    用法
                    <span class="bg-muted px-padding-xs rounded fs-xs">{breakpoint}:类名</span>
                    · SSOT:
                    <span class="bg-muted px-padding-xs rounded fs-xs">
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
                <div class="flex flex-col gap-sm">
                  <h4 class="font-semibold text-foreground">安全区 (Safe Area)</h4>
                  <div
                    class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                    @click="copyToClipboard('scroll-m-gap-md')"
                  >
                    scroll-m-gap-{scale}
                  </div>
                  <div
                    class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                    @click="copyToClipboard('m-gap-md')"
                  >
                    m-gap-{scale}
                  </div>
                  <p class="fs-xs text-muted-foreground">移动端安全区 · env(safe-area-inset-*)</p>
                </div>
                <div class="flex flex-col gap-sm">
                  <h4 class="font-semibold text-foreground">规则 (Rules)</h4>
                  <p class="fs-xs text-muted-foreground">
                    <span class="bg-muted px-padding-xs rounded">gap-x-*</span>
                    /
                    <span class="bg-muted px-padding-xs rounded">gap-y-*</span>
                    独立轴向间距。
                  </p>
                  <p class="fs-xs text-muted-foreground">
                    <span class="bg-muted px-padding-xs rounded">main-*</span>
                    /
                    <span class="bg-muted px-padding-xs rounded">cross-*</span>
                    须与
                    <span class="bg-muted px-padding-xs rounded">row</span>
                    或
                    <span class="bg-muted px-padding-xs rounded">column</span>
                    同用，否则主轴/交叉轴语义不明。
                  </p>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </CScrollbar>
  </div>
</template>

<style scoped>
code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
