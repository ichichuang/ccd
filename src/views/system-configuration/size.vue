<script setup lang="ts">
import { computed } from 'vue'
import { useSizeStore } from '@/stores/modules/size'
import { useDeviceStore } from '@/stores/modules/device'
import { SIZE_PRESETS } from '@/constants/size'
import { SIZE_SCALE_KEYS, FONT_SCALE_RATIOS, SPACING_SCALE_RATIOS } from '@/constants/sizeScale'
import { BREAKPOINTS } from '@/constants/breakpoints'
import { useToast } from 'primevue/usetoast'

const sizeStore = useSizeStore()
const deviceStore = useDeviceStore()
const toast = useToast()

/** 当前预设 */
const currentPreset = computed(() => sizeStore.currentPreset)

/** 布局变量展示配置 */
const LAYOUT_VARS = [
  {
    key: 'sidebarWidth',
    label: '侧边栏宽度',
    cssVar: '--sidebar-width',
    icon: 'i-lucide-panel-left',
  },
  {
    key: 'sidebarCollapsedWidth',
    label: '侧边栏收起',
    cssVar: '--sidebar-collapsed-width',
    icon: 'i-lucide-panel-left-close',
  },
  { key: 'headerHeight', label: '头部高度', cssVar: '--header-height', icon: 'i-lucide-panel-top' },
  {
    key: 'breadcrumbHeight',
    label: '面包屑高度',
    cssVar: '--breadcrumb-height',
    icon: 'i-lucide-navigation',
  },
  {
    key: 'footerHeight',
    label: '底部高度',
    cssVar: '--footer-height',
    icon: 'i-lucide-panel-bottom',
  },
  { key: 'tabsHeight', label: '标签页高度', cssVar: '--tabs-height', icon: 'i-lucide-app-window' },
] as const

/** 设备信息展示 */
const deviceInfo = computed(() => [
  { label: '视口宽度', value: `${deviceStore.width}px`, icon: 'i-lucide-move-horizontal' },
  { label: '视口高度', value: `${deviceStore.height}px`, icon: 'i-lucide-move-vertical' },
  { label: '当前断点', value: deviceStore.currentBreakpoint.toUpperCase(), icon: 'i-lucide-ruler' },
  { label: '设备类型', value: deviceStore.type, icon: 'i-lucide-monitor-smartphone' },
  { label: '操作系统', value: deviceStore.os, icon: 'i-lucide-laptop' },
  {
    label: '屏幕方向',
    value: deviceStore.orientation === 'horizontal' ? '横屏' : '竖屏',
    icon: 'i-lucide-rotate-3d',
  },
])

/** 布局判断展示 */
const layoutFlags = computed(() => [
  { label: 'isMobileLayout', value: deviceStore.isMobileLayout, desc: 'width < lg (1024px)' },
  { label: 'isTabletLayout', value: deviceStore.isTabletLayout, desc: 'md <= width < lg' },
  { label: 'isPCLayout', value: deviceStore.isPCLayout, desc: 'width >= lg' },
  { label: 'isTouchDevice', value: deviceStore.isTouchDevice, desc: 'UA + ontouchstart' },
])

/** 计算字体实际值 */
function getFontSize(key: string): string {
  const ratio = FONT_SCALE_RATIOS[key as keyof typeof FONT_SCALE_RATIOS]
  return `${(currentPreset.value.fontSizeBase * ratio).toFixed(1)}px`
}

/** 计算间距实际值 */
function getSpacing(key: string): string {
  const ratio = SPACING_SCALE_RATIOS[key as keyof typeof SPACING_SCALE_RATIOS]
  return `${currentPreset.value.spacingBase * ratio}px`
}

/** 复制到剪贴板 */
function copyToClipboard(text: string, description = '') {
  navigator.clipboard.writeText(text).then(() => {
    toast.add({
      severity: 'success',
      summary: '已复制',
      detail: description || text,
      life: 2000,
    })
  })
}
</script>

<template>
  <div class="container min-h-screen p-padding-lg gap-gap-xl flex flex-col">
    <header class="border-b border-border pb-padding-md">
      <h1 class="text-2xl font-semibold text-foreground">尺寸系统全览</h1>
      <p class="text-muted-foreground mt-1 text-sm">
        CCD 设计系统尺寸指南 — 开发者参考手册，点击任意项可复制类名或变量
      </p>
    </header>

    <!-- Section 1: Size Mode Switcher -->
    <section class="rounded-xl border border-border bg-card p-padding-lg shadow-sm">
      <h2 class="text-lg font-medium text-card-foreground mb-padding-md flex items-center gap-2">
        <i class="i-lucide-ruler w-5 h-5" />
        尺寸模式切换
      </h2>
      <p class="text-sm text-muted-foreground mb-padding-lg">
        系统提供三种尺寸模式：<strong>紧凑 (Compact)</strong>、<strong>舒适 (Comfortable)</strong
        >、<strong>宽松 (Loose)</strong>，影响全局间距、字体和布局尺寸。
      </p>
      <div class="grid grid-cols-1 gap-gap-md md:grid-cols-3">
        <button
          v-for="preset in SIZE_PRESETS"
          :key="preset.name"
          type="button"
          class="flex flex-col items-start gap-2 rounded-xl border p-padding-lg transition-all cursor-pointer"
          :class="
            sizeStore.sizeName === preset.name
              ? 'border-primary bg-primary/10 shadow-md'
              : 'border-border bg-background hover:bg-muted hover:border-primary/30'
          "
          @click="sizeStore.setSize(preset.name)"
        >
          <div class="flex items-center gap-2 w-full justify-between">
            <span class="font-semibold text-foreground">{{ preset.label }}</span>
            <span
              v-if="sizeStore.sizeName === preset.name"
              class="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full"
            >
              当前
            </span>
          </div>
          <div class="text-xs text-muted-foreground space-y-1 w-full">
            <div class="flex justify-between">
              <span>圆角</span>
              <code class="bg-muted px-1 rounded">{{ preset.radius }}rem</code>
            </div>
            <div class="flex justify-between">
              <span>间距基数</span>
              <code class="bg-muted px-1 rounded">{{ preset.spacingBase }}px</code>
            </div>
            <div class="flex justify-between">
              <span>字体基数</span>
              <code class="bg-muted px-1 rounded">{{ preset.fontSizeBase }}px</code>
            </div>
          </div>
        </button>
      </div>
    </section>

    <!-- Section 2: Font Scale -->
    <section class="rounded-xl border border-border bg-card p-padding-lg shadow-sm">
      <h2 class="text-lg font-medium text-card-foreground mb-padding-md flex items-center gap-2">
        <i class="i-lucide-type w-5 h-5" />
        字体阶梯 (Font Scale)
      </h2>
      <p class="text-sm text-muted-foreground mb-padding-lg">
        基于 <code class="bg-muted px-1 rounded">fontSizeBase × 倍率</code> 生成 9 级字体大小。
        使用类名 <code class="bg-muted px-1 rounded">fs-{scale}</code> 或
        <code class="bg-muted px-1 rounded">text-{scale}</code>。
      </p>
      <div class="grid gap-3">
        <div
          v-for="key in SIZE_SCALE_KEYS"
          :key="key"
          role="button"
          class="flex items-center gap-4 p-3 rounded-lg border border-border/50 bg-background hover:bg-muted/50 cursor-pointer transition-colors"
          @click="copyToClipboard(`fs-${key}`, `--font-size-${key}`)"
        >
          <div class="w-16 text-center">
            <code class="text-xs text-primary font-mono">{{ key }}</code>
          </div>
          <div class="flex-1 flex items-baseline gap-4">
            <span
              :style="{ fontSize: `var(--font-size-${key})` }"
              class="text-foreground font-medium"
            >
              示例文本 Aa
            </span>
          </div>
          <div class="text-right space-x-3 text-xs text-muted-foreground">
            <span>倍率: {{ FONT_SCALE_RATIOS[key] }}</span>
            <span class="text-primary font-mono">{{ getFontSize(key) }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 3: Spacing Scale -->
    <section class="rounded-xl border border-border bg-card p-padding-lg shadow-sm">
      <h2 class="text-lg font-medium text-card-foreground mb-padding-md flex items-center gap-2">
        <i class="i-lucide-space w-5 h-5" />
        间距阶梯 (Spacing Scale)
      </h2>
      <p class="text-sm text-muted-foreground mb-padding-lg">
        基于 <code class="bg-muted px-1 rounded">spacingBase × 倍率</code> 生成 9 级间距。
        支持类名：<code class="bg-muted px-1 rounded">p-scale-{s}</code>、
        <code class="bg-muted px-1 rounded">m-scale-{s}</code>、
        <code class="bg-muted px-1 rounded">gap-scale-{s}</code>。
      </p>
      <div class="grid gap-3">
        <div
          v-for="key in SIZE_SCALE_KEYS"
          :key="key"
          role="button"
          class="flex items-center gap-4 p-3 rounded-lg border border-border/50 bg-background hover:bg-muted/50 cursor-pointer transition-colors"
          @click="copyToClipboard(`p-scale-${key}`, `--spacing-${key}`)"
        >
          <div class="w-16 text-center">
            <code class="text-xs text-primary font-mono">{{ key }}</code>
          </div>
          <div class="flex-1 flex items-center gap-4">
            <!-- 可视化间距 -->
            <div class="relative h-8 bg-muted/30 rounded overflow-hidden flex items-center">
              <div
                class="h-full bg-primary/60 rounded"
                :style="{ width: `var(--spacing-${key})` }"
              ></div>
              <span class="absolute left-2 text-[10px] text-foreground/70 font-mono">
                {{ getSpacing(key) }}
              </span>
            </div>
          </div>
          <div class="text-right space-x-3 text-xs text-muted-foreground">
            <span>倍率: {{ SPACING_SCALE_RATIOS[key] }}</span>
            <code class="text-primary font-mono">--spacing-{{ key }}</code>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 4: Layout Variables -->
    <section class="rounded-xl border border-border bg-card p-padding-lg shadow-sm">
      <h2 class="text-lg font-medium text-card-foreground mb-padding-md flex items-center gap-2">
        <i class="i-lucide-layout w-5 h-5" />
        布局变量 (Layout Variables)
      </h2>
      <p class="text-sm text-muted-foreground mb-padding-lg">
        预设中定义的固定布局尺寸，随尺寸模式自动调整。 支持类名：<code class="bg-muted px-1 rounded"
          >w-sidebarWidth</code
        >、 <code class="bg-muted px-1 rounded">h-headerHeight</code> 等。
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap-md">
        <div
          v-for="item in LAYOUT_VARS"
          :key="item.key"
          role="button"
          class="flex items-center gap-3 p-4 rounded-lg border border-border bg-background hover:bg-muted/50 cursor-pointer transition-colors"
          @click="copyToClipboard(item.cssVar)"
        >
          <div
            class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
          >
            <i :class="[item.icon, 'w-5 h-5']" />
          </div>
          <div class="flex-1">
            <div class="font-medium text-foreground text-sm">{{ item.label }}</div>
            <code class="text-xs text-muted-foreground">{{ item.cssVar }}</code>
          </div>
          <div class="text-right">
            <span class="text-lg font-bold text-primary">
              {{ currentPreset[item.key] }}
            </span>
            <span class="text-xs text-muted-foreground">px</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 5: Breakpoints -->
    <section class="rounded-xl border border-border bg-card p-padding-lg shadow-sm">
      <h2 class="text-lg font-medium text-card-foreground mb-padding-md flex items-center gap-2">
        <i class="i-lucide-monitor w-5 h-5" />
        响应式断点 (Breakpoints)
      </h2>
      <p class="text-sm text-muted-foreground mb-padding-lg">
        断点键名与尺寸阶梯统一 (xs → 5xl)，支持响应式前缀如
        <code class="bg-muted px-1 rounded">md:flex</code>、
        <code class="bg-muted px-1 rounded">lg:hidden</code>。
      </p>
      <div class="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
        <div
          v-for="key in SIZE_SCALE_KEYS"
          :key="key"
          role="button"
          class="flex flex-col items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer"
          :class="
            deviceStore.currentBreakpoint === key
              ? 'border-primary bg-primary/10 shadow-md'
              : 'border-border bg-background hover:bg-muted/50'
          "
          @click="copyToClipboard(`${key}:`)"
        >
          <code
            class="text-sm font-bold"
            :class="deviceStore.currentBreakpoint === key ? 'text-primary' : 'text-foreground'"
          >
            {{ key }}
          </code>
          <span class="text-xs text-muted-foreground">≥{{ BREAKPOINTS[key] }}px</span>
          <div
            v-if="deviceStore.currentBreakpoint === key"
            class="w-2 h-2 rounded-full bg-primary animate-pulse"
          />
        </div>
      </div>
    </section>

    <!-- Section 6: Device Store Info -->
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-gap-lg">
      <div class="rounded-xl border border-border bg-card p-padding-lg shadow-sm">
        <h2 class="text-lg font-medium text-card-foreground mb-padding-md flex items-center gap-2">
          <i class="i-lucide-smartphone w-5 h-5" />
          设备状态 (Device State)
        </h2>
        <p class="text-sm text-muted-foreground mb-padding-lg">
          实时设备信息，响应 resize / orientationchange 自动更新。
        </p>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="item in deviceInfo"
            :key="item.label"
            class="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background"
          >
            <i :class="[item.icon, 'w-4 h-4 text-muted-foreground']" />
            <div class="flex-1">
              <div class="text-xs text-muted-foreground">{{ item.label }}</div>
              <div class="font-medium text-foreground">{{ item.value }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-border bg-card p-padding-lg shadow-sm">
        <h2 class="text-lg font-medium text-card-foreground mb-padding-md flex items-center gap-2">
          <i class="i-lucide-toggle-left w-5 h-5" />
          布局判断 Getters
        </h2>
        <p class="text-sm text-muted-foreground mb-padding-lg">
          Device Store 提供的布局判断 getters，可直接在组件中使用。
        </p>
        <div class="space-y-3">
          <div
            v-for="item in layoutFlags"
            :key="item.label"
            class="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center"
              :class="item.value ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'"
            >
              <i
                :class="item.value ? 'i-lucide-check' : 'i-lucide-x'"
                class="w-4 h-4"
              />
            </div>
            <div class="flex-1">
              <code class="text-sm text-foreground font-mono">{{ item.label }}</code>
              <div class="text-xs text-muted-foreground">{{ item.desc }}</div>
            </div>
            <span
              class="text-sm font-bold"
              :class="item.value ? 'text-success' : 'text-muted-foreground'"
            >
              {{ item.value }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 7: UnoCSS Usage Examples -->
    <section class="rounded-xl border border-border bg-card p-padding-lg shadow-sm">
      <h2 class="text-lg font-medium text-card-foreground mb-padding-md flex items-center gap-2">
        <i class="i-lucide-code w-5 h-5" />
        UnoCSS 类名速查
      </h2>
      <p class="text-sm text-muted-foreground mb-padding-lg">
        常用尺寸系统类名及其对应 CSS 变量映射。
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap-md">
        <!-- Font Size -->
        <div class="p-4 rounded-lg border border-border bg-background">
          <h3 class="font-medium text-foreground mb-3 flex items-center gap-2">
            <i class="i-lucide-type w-4 h-4 text-primary" />
            字体大小
          </h3>
          <div class="space-y-2 text-sm">
            <div
              v-for="key in ['xs', 'sm', 'md', 'lg', 'xl', '2xl']"
              :key="key"
              class="flex justify-between items-center cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
              @click="copyToClipboard(`fs-${key}`)"
            >
              <code class="text-primary">fs-{{ key }}</code>
              <span class="text-muted-foreground text-xs">→ --font-size-{{ key }}</span>
            </div>
          </div>
        </div>

        <!-- Padding / Margin -->
        <div class="p-4 rounded-lg border border-border bg-background">
          <h3 class="font-medium text-foreground mb-3 flex items-center gap-2">
            <i class="i-lucide-box w-4 h-4 text-primary" />
            间距 (Padding / Margin)
          </h3>
          <div class="space-y-2 text-sm">
            <div
              class="flex justify-between items-center cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
              @click="copyToClipboard('p-scale-md')"
            >
              <code class="text-primary">p-scale-md</code>
              <span class="text-muted-foreground text-xs">padding all</span>
            </div>
            <div
              class="flex justify-between items-center cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
              @click="copyToClipboard('px-scale-lg')"
            >
              <code class="text-primary">px-scale-lg</code>
              <span class="text-muted-foreground text-xs">padding x-axis</span>
            </div>
            <div
              class="flex justify-between items-center cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
              @click="copyToClipboard('mt-scale-sm')"
            >
              <code class="text-primary">mt-scale-sm</code>
              <span class="text-muted-foreground text-xs">margin-top</span>
            </div>
            <div
              class="flex justify-between items-center cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
              @click="copyToClipboard('gap-scale-xl')"
            >
              <code class="text-primary">gap-scale-xl</code>
              <span class="text-muted-foreground text-xs">gap</span>
            </div>
          </div>
        </div>

        <!-- Layout Variables -->
        <div class="p-4 rounded-lg border border-border bg-background">
          <h3 class="font-medium text-foreground mb-3 flex items-center gap-2">
            <i class="i-lucide-layout w-4 h-4 text-primary" />
            布局变量
          </h3>
          <div class="space-y-2 text-sm">
            <div
              class="flex justify-between items-center cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
              @click="copyToClipboard('w-sidebarWidth')"
            >
              <code class="text-primary">w-sidebarWidth</code>
              <span class="text-muted-foreground text-xs">width</span>
            </div>
            <div
              class="flex justify-between items-center cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
              @click="copyToClipboard('h-headerHeight')"
            >
              <code class="text-primary">h-headerHeight</code>
              <span class="text-muted-foreground text-xs">height</span>
            </div>
            <div
              class="flex justify-between items-center cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
              @click="copyToClipboard('min-h-footerHeight')"
            >
              <code class="text-primary">min-h-footerHeight</code>
              <span class="text-muted-foreground text-xs">min-height</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 8: Live CSS Variables -->
    <section class="rounded-xl border border-border bg-card p-padding-lg shadow-sm">
      <h2 class="text-lg font-medium text-card-foreground mb-padding-md flex items-center gap-2">
        <i class="i-lucide-variable w-5 h-5" />
        当前 CSS 变量值
      </h2>
      <p class="text-sm text-muted-foreground mb-padding-lg">
        实时展示当前尺寸模式下所有 CSS 变量的计算值。
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Base Variables -->
        <div class="p-4 rounded-lg border border-border bg-background">
          <h3 class="text-sm font-medium text-foreground mb-3">基础变量</h3>
          <div class="space-y-2 text-xs font-mono">
            <div class="flex justify-between">
              <span class="text-muted-foreground">--spacing-unit</span>
              <span class="text-primary">{{ currentPreset.spacingBase }}px</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">--container-padding</span>
              <span class="text-primary">{{ currentPreset.spacingBase * 5 }}px</span>
            </div>
          </div>
        </div>

        <!-- Font Size Variables -->
        <div class="p-4 rounded-lg border border-border bg-background">
          <h3 class="text-sm font-medium text-foreground mb-3">字体阶梯</h3>
          <CScrollbar
            class="max-h-40"
            :options="{ scrollbars: { autoHide: 'leave' } }"
          >
            <div class="space-y-2 text-xs font-mono pr-2">
              <div
                v-for="key in SIZE_SCALE_KEYS"
                :key="key"
                class="flex justify-between"
              >
                <span class="text-muted-foreground">--font-size-{{ key }}</span>
                <span class="text-primary">{{ getFontSize(key) }}</span>
              </div>
            </div>
          </CScrollbar>
        </div>

        <!-- Spacing Variables -->
        <div class="p-4 rounded-lg border border-border bg-background">
          <h3 class="text-sm font-medium text-foreground mb-3">间距阶梯</h3>
          <CScrollbar
            class="max-h-40"
            :options="{ scrollbars: { autoHide: 'leave' } }"
          >
            <div class="space-y-2 text-xs font-mono pr-2">
              <div
                v-for="key in SIZE_SCALE_KEYS"
                :key="key"
                class="flex justify-between"
              >
                <span class="text-muted-foreground">--spacing-{{ key }}</span>
                <span class="text-primary">{{ getSpacing(key) }}</span>
              </div>
            </div>
          </CScrollbar>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
/* 确保点击区域有适当的手型反馈 */
[role='button'] {
  @apply select-none;
}

/* 滚动条美化 */
.overflow-y-auto {
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: hsl(var(--muted));
    border-radius: 2px;
  }
}
</style>
