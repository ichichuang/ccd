<script setup lang="ts">
import { BREAKPOINTS } from '@/constants/breakpoints'
import type { BreakpointKey } from '@/constants/breakpoints'
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Slider from 'primevue/slider'

const RULER_MAX = 3840
const SLIDER_MIN = 320
const SLIDER_MAX = RULER_MAX

const sliderValue = ref<number | number[]>(1200)

/** Get the current width as a number (handles both single and range slider values) */
const currentWidth = computed(() => {
  const val = sliderValue.value
  return Array.isArray(val) ? val[0] : val
})

// Copy to clipboard utility
function copyToClipboard(text: string, label?: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      window.$message?.success(`已复制: ${label || text}`)
    })
    .catch(() => {
      window.$message?.danger('复制失败')
    })
}

/** Breakpoint entries sorted by value */
const breakpointEntries = computed(() =>
  (Object.entries(BREAKPOINTS) as [BreakpointKey, number][]).sort((a, b) => a[1] - b[1])
)

/** Current matched breakpoint */
const activeBreakpoint = computed<BreakpointKey | null>(() => {
  let matched: BreakpointKey | null = null
  for (const [key, value] of breakpointEntries.value) {
    if (currentWidth.value >= value) matched = key
  }
  return matched
})

/** Grid columns based on width */
const gridCols = computed(() => {
  const w = currentWidth.value
  if (w >= BREAKPOINTS['5xl']) return 12
  if (w >= BREAKPOINTS['4xl']) return 8
  if (w >= BREAKPOINTS['2xl']) return 6
  if (w >= BREAKPOINTS.lg) return 4
  if (w >= BREAKPOINTS.md) return 3
  if (w >= BREAKPOINTS.sm) return 2
  return 1
})

/** Check if breakpoint is active */
function isBreakpointActive(value: number) {
  return currentWidth.value >= value
}

/** Breakpoint percentage position on ruler */
function breakpointPercent(value: number) {
  return (value / RULER_MAX) * 100
}

/** Preset widths for quick selection */
const presetWidths = [
  { label: 'Mobile', value: 375, icon: 'i-lucide-smartphone' },
  { label: 'Tablet', value: 768, icon: 'i-lucide-tablet' },
  { label: 'Laptop', value: 1280, icon: 'i-lucide-laptop' },
  { label: 'Desktop', value: 1920, icon: 'i-lucide-monitor' },
  { label: '4K', value: 3840, icon: 'i-lucide-tv' },
]

/** Breakpoint usage examples */
const breakpointItems = computed(() =>
  breakpointEntries.value.map(([key, value]) => ({
    key,
    value,
    minWidthClass: `${key}:`,
    maxWidthClass: `<${key}:`,
    description:
      key === 'xs'
        ? '超小屏 / 折叠屏外屏'
        : key === 'sm'
          ? '大屏手机横屏 / 小平板'
          : key === 'md'
            ? 'iPad Mini 竖屏 (平板分界线)'
            : key === 'lg'
              ? 'iPad Pro 横屏 / 桌面端起点'
              : key === 'xl'
                ? '主流笔记本 (13/14 寸)'
                : key === '2xl'
                  ? '大屏笔记本 / 办公显示器'
                  : key === '3xl'
                    ? '1080P 全高清'
                    : key === '4xl'
                      ? '2K QHD'
                      : '4K UHD',
  }))
)
</script>

<template>
  <CScrollbar class="h-full p-padding-lg bg-background">
    <div class="w-full max-w-[90vw] mx-auto flex flex-col gap-xl">
      <!-- Header -->
      <div class="flex flex-col gap-xs">
        <div class="flex items-center gap-md">
          <div class="p-padding-md bg-primary/10 rounded-scale-lg">
            <Icons
              name="i-lucide-monitor"
              class="text-primary fs-2xl"
            />
          </div>
          <div>
            <h1 class="fs-2xl font-bold text-foreground">Breakpoint System</h1>
            <p class="text-muted-foreground">
              响应式断点系统完整参考 · 点击任意类名即可自动复制到剪贴板
            </p>
          </div>
        </div>
      </div>

      <!-- Control Panel -->
      <Card class="component-border">
        <template #title>
          <div class="flex items-center gap-sm">
            <Icons
              name="i-lucide-sliders-horizontal"
              class="text-primary"
            />
            <span>Viewport Simulator 视窗模拟器</span>
          </div>
        </template>
        <template #content>
          <div class="flex flex-col gap-lg">
            <!-- Width Slider -->
            <div class="flex flex-col gap-md">
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">Current Width</span>
                <div class="flex items-center gap-md">
                  <span class="font-mono fs-xl font-bold text-foreground"
                    >{{ currentWidth }}px</span
                  >
                  <Tag
                    :value="activeBreakpoint ?? '< xs'"
                    :severity="activeBreakpoint ? 'success' : 'secondary'"
                    class="fs-sm"
                  />
                </div>
              </div>
              <Slider
                v-model="sliderValue"
                :min="SLIDER_MIN"
                :max="SLIDER_MAX"
                class="w-full"
              />
            </div>

            <!-- Preset Buttons -->
            <div class="flex flex-wrap gap-sm">
              <Button
                v-for="preset in presetWidths"
                :key="preset.value"
                :label="preset.label"
                :icon="preset.icon"
                :severity="currentWidth === preset.value ? 'primary' : 'secondary'"
                :outlined="currentWidth !== preset.value"
                size="small"
                @click="sliderValue = preset.value"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Visual Ruler -->
      <Card class="component-border">
        <template #title>
          <div class="flex items-center gap-sm">
            <Icons
              name="i-lucide-ruler"
              class="text-primary"
            />
            <span>Breakpoint Ruler 断点标尺</span>
          </div>
        </template>
        <template #content>
          <div
            class="relative h-20 w-full overflow-hidden rounded-scale-md component-border bg-muted/30"
            role="img"
            aria-label="Breakpoint ruler"
          >
            <!-- Current Width Indicator -->
            <div
              class="absolute top-0 h-full w-px bg-primary z-10 transition-all duration-scale-md"
              :style="{ left: `${(currentWidth / RULER_MAX) * 100}%` }"
            >
              <div
                class="absolute -top-[var(--spacing-xs)] left-1/2 -translate-x-1/2 w-[var(--spacing-sm)] h-[var(--spacing-sm)] bg-primary rounded-full border-2 border-solid border-background"
              />
            </div>

            <!-- Breakpoint Markers -->
            <div
              v-for="[key, value] in breakpointEntries"
              :key="key"
              class="absolute top-0 flex h-full flex-col items-center transition-colors"
              :style="{ left: `${breakpointPercent(value)}%` }"
            >
              <div
                class="h-[var(--spacing-xl)] w-px shrink-0 transition-colors"
                :class="isBreakpointActive(value) ? 'bg-primary' : 'bg-border'"
              />
              <span
                class="mt-margin-xs shrink-0 rounded px-padding-xs fs-xs font-medium cursor-pointer hover:scale-110 transition-transform"
                :class="
                  isBreakpointActive(value)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                "
                @click="copyToClipboard(`${key}:`, `${key}: prefix`)"
              >
                {{ key }}: {{ value }}
              </span>
            </div>
          </div>
        </template>
      </Card>

      <!-- Breakpoint Reference Table -->
      <Card class="component-border">
        <template #title>
          <div class="flex items-center gap-sm">
            <Icons
              name="i-lucide-table"
              class="text-primary"
            />
            <span>Breakpoint Reference 断点参考表</span>
            <Tag
              :value="`${breakpointItems.length} breakpoints`"
              severity="secondary"
            />
          </div>
        </template>
        <template #content>
          <CScrollbar class="w-full min-w-0">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-b-default">
                  <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                    Scale
                  </th>
                  <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                    Min Width
                  </th>
                  <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                    UnoCSS Prefix
                  </th>
                  <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                    Description
                  </th>
                  <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in breakpointItems"
                  :key="item.key"
                  class="border-b border-solid border-border/50 hover:bg-muted/30 transition-colors"
                  :class="{ 'bg-primary/5': isBreakpointActive(item.value) }"
                >
                  <td class="p-padding-sm">
                    <Tag
                      :value="item.key"
                      :severity="isBreakpointActive(item.value) ? 'success' : 'secondary'"
                    />
                  </td>
                  <td class="p-padding-sm font-mono">{{ item.value }}px</td>
                  <td class="p-padding-sm">
                    <div class="flex gap-xs flex-wrap">
                      <Button
                        :label="item.minWidthClass"
                        severity="success"
                        text
                        size="small"
                        class="font-mono"
                        @click="copyToClipboard(item.minWidthClass)"
                      />
                      <Button
                        :label="item.maxWidthClass"
                        severity="warn"
                        text
                        size="small"
                        class="font-mono"
                        @click="copyToClipboard(item.maxWidthClass)"
                      />
                    </div>
                  </td>
                  <td class="p-padding-sm text-muted-foreground fs-sm">{{ item.description }}</td>
                  <td class="p-padding-sm">
                    <div
                      class="w-[var(--spacing-sm)] h-[var(--spacing-sm)] rounded-full"
                      :class="isBreakpointActive(item.value) ? 'bg-success' : 'bg-muted'"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </CScrollbar>
        </template>
      </Card>

      <!-- Grid Demo -->
      <Card class="component-border">
        <template #title>
          <div class="flex items-center gap-sm">
            <Icons
              name="i-lucide-grid-3x3"
              class="text-primary"
            />
            <span>Responsive Grid Demo 响应式网格演示</span>
            <Tag
              :value="`${gridCols} columns`"
              severity="info"
            />
          </div>
        </template>
        <template #content>
          <div class="flex flex-col gap-md">
            <p class="text-muted-foreground fs-sm">
              模拟视窗宽度为 <span class="font-mono font-bold">{{ currentWidth }}px</span>，
              当前断点 <span class="font-mono font-bold">{{ activeBreakpoint ?? '< xs' }}</span
              >， 网格列数 <span class="font-mono font-bold">{{ gridCols }}</span>
            </p>

            <!-- Simulated Viewport -->
            <CScrollbar class="flex justify-center pb-gap-md min-w-0">
              <div
                class="flex shrink-0 flex-col rounded-scale-lg border-2 border-solid border-border bg-card shadow-lg transition-all duration-scale-md"
                :style="{ width: '100%' }"
              >
                <div
                  class="border-b-default px-padding-md py-padding-sm text-center fs-sm text-muted-foreground flex items-center justify-center gap-sm"
                >
                  <Icons
                    name="i-lucide-monitor"
                    class="fs-lg"
                  />
                  <span>Viewport {{ currentWidth }}px · Grid {{ gridCols }} col</span>
                </div>
                <div
                  class="grid gap-sm p-padding-md"
                  :style="{ gridTemplateColumns: `repeat(${Math.min(gridCols, 6)}, 1fr)` }"
                >
                  <div
                    v-for="n in 12"
                    :key="n"
                    class="flex aspect-video items-center justify-center rounded-scale-md component-border bg-muted/50 font-mono fs-lg font-medium text-foreground hover:bg-primary/10 hover:border-primary/50 transition-colors"
                  >
                    {{ n }}
                  </div>
                </div>
              </div>
            </CScrollbar>
          </div>
        </template>
      </Card>

      <!-- Usage Examples -->
      <Card class="component-border">
        <template #title>
          <div class="flex items-center gap-sm">
            <Icons
              name="i-lucide-code"
              class="text-primary"
            />
            <span>Usage Examples 使用示例</span>
          </div>
        </template>
        <template #content>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div class="flex flex-col gap-sm">
              <h4 class="font-semibold text-foreground">最小宽度 (Min-Width Mobile First)</h4>
              <div
                class="rounded-scale-md cursor-pointer hover:bg-muted/70 transition-colors"
                @click="copyToClipboard('md:hidden lg:block')"
              >
                <CScrollbar class="min-w-0">
                  <pre
                    class="m-0 bg-muted/50 p-padding-md fs-sm"
                  ><code class="text-foreground">&lt;div class="hidden md:block"&gt;
  MD 及以上可见
&lt;/div&gt;

&lt;div class="md:hidden lg:block"&gt;
  MD 隐藏，LG 及以上可见
&lt;/div&gt;</code></pre>
                </CScrollbar>
              </div>
            </div>
            <div class="flex flex-col gap-sm">
              <h4 class="font-semibold text-foreground">最大宽度 (Max-Width)</h4>
              <div
                class="rounded-scale-md cursor-pointer hover:bg-muted/70 transition-colors"
                @click="copyToClipboard('<md:text-sm')"
              >
                <CScrollbar class="min-w-0">
                  <pre
                    class="m-0 bg-muted/50 p-padding-md fs-sm"
                  ><code class="text-foreground">&lt;div class="&lt;md:text-sm"&gt;
  移动端小号文字
&lt;/div&gt;

&lt;div class="&lt;lg:grid-cols-1"&gt;
  LG 以下单列布局
&lt;/div&gt;</code></pre>
                </CScrollbar>
              </div>
            </div>
            <div class="flex flex-col gap-sm">
              <h4 class="font-semibold text-foreground">响应式网格 (Responsive Grid)</h4>
              <div
                class="rounded-scale-md cursor-pointer hover:bg-muted/70 transition-colors"
                @click="copyToClipboard('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4')"
              >
                <CScrollbar class="min-w-0">
                  <pre
                    class="m-0 bg-muted/50 p-padding-md fs-sm"
                  ><code class="text-foreground">&lt;div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"&gt;
  &lt;!-- 响应式网格项 --&gt;
&lt;/div&gt;</code></pre>
                </CScrollbar>
              </div>
            </div>
            <div class="flex flex-col gap-sm">
              <h4 class="font-semibold text-foreground">响应式间距 (Responsive Spacing)</h4>
              <div
                class="rounded-scale-md cursor-pointer hover:bg-muted/70 transition-colors"
                @click="copyToClipboard('p-padding-sm md:p-padding-md lg:p-padding-lg')"
              >
                <CScrollbar class="min-w-0">
                  <pre
                    class="m-0 bg-muted/50 p-padding-md fs-sm"
                  ><code class="text-foreground">&lt;div class="p-padding-sm md:p-padding-md lg:p-padding-lg"&gt;
  响应式内边距
&lt;/div&gt;</code></pre>
                </CScrollbar>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Quick Reference -->
      <Card class="component-border bg-gradient-to-br from-primary/5 to-accent/5">
        <template #title>
          <div class="flex items-center gap-sm">
            <Icons
              name="i-lucide-zap"
              class="text-primary"
            />
            <span>Quick Reference 快速参考</span>
          </div>
        </template>
        <template #content>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-md">
            <div
              v-for="[key, value] in breakpointEntries"
              :key="key"
              class="flex flex-col gap-xs p-padding-md bg-card rounded-scale-md component-border cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
              @click="copyToClipboard(`${key}:`)"
            >
              <div class="flex items-center justify-between">
                <Tag
                  :value="key"
                  severity="info"
                />
                <span class="font-mono fs-xs text-muted-foreground">{{ value }}px</span>
              </div>
              <code class="font-mono fs-sm text-foreground">{{ key }}:class</code>
            </div>
          </div>
          <p class="mt-gap-md text-muted-foreground fs-sm">
            断点前缀遵循 Mobile-First 设计原则：<code class="bg-muted px-padding-xs rounded"
              >md:</code
            >
            表示 ≥768px 时应用样式
          </p>
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
