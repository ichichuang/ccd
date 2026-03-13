<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { BREAKPOINTS } from '@/constants/breakpoints'
import type { BreakpointKey } from '@/constants/breakpoints'
import { useDeviceStore } from '@/stores/modules/device'
import { getDeviceTypeSync, getBreakpointSync } from '@/utils/deviceSync'

const RULER_MAX = Math.max(...Object.values(BREAKPOINTS))
const SLIDER_MIN = 320
const SLIDER_MAX = RULER_MAX

// Device Store (real-time viewport)，需在 effectiveWidth / watch 前初始化
const deviceStore = useDeviceStore()

const sliderValue = ref<number | number[]>(1200)

/** 跟随真实视口时，模拟器使用 deviceStore.width，与真实布局一致 */
const followViewport = ref(false)

/** Get the current width as a number (handles both single and range slider values) */
const currentWidth = computed<number>(() => {
  const val: number | number[] = sliderValue.value
  return Array.isArray(val) ? val[0] : val
})

/** 模拟器展示用宽度：跟随真实视口时取 deviceStore.width，否则取 slider */
const effectiveWidth = computed<number>(() =>
  followViewport.value ? deviceStore.width : currentWidth.value
)

watch([() => deviceStore.width, followViewport], () => {
  if (followViewport.value) sliderValue.value = deviceStore.width
})

// Copy to clipboard utility（与 size/unocss 一致：成功用 toast，失败用 message）
function copyToClipboard(text: string, label?: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      window.$toast?.successIn('top-right', `已复制: ${label || text}`, `类名: ${text}`)
    })
    .catch(() => {
      window.$message?.danger('复制失败')
    })
}

/** Breakpoint entries sorted by value */
const breakpointEntries = computed<[BreakpointKey, number][]>(() =>
  (Object.entries(BREAKPOINTS) as [BreakpointKey, number][]).sort(
    (a: [BreakpointKey, number], b: [BreakpointKey, number]) => a[1] - b[1]
  )
)

/** Current matched breakpoint */
const activeBreakpoint = computed<BreakpointKey | null>(() => {
  let matched: BreakpointKey | null = null
  for (const [key, value] of breakpointEntries.value) {
    if (effectiveWidth.value >= value) matched = key
  }
  return matched
})

/** Grid columns based on width */
const gridCols = computed<number>(() => {
  const w: number = effectiveWidth.value
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
  return effectiveWidth.value >= value
}

/** Breakpoint percentage position on ruler */
function breakpointPercent(value: number) {
  return (value / RULER_MAX) * 100
}

/** Preset widths for quick selection */
interface PresetWidth {
  label: string
  value: number
  icon: string
}

const presetWidths: PresetWidth[] = [
  { label: 'Mobile', value: 375, icon: 'i-lucide-smartphone' },
  { label: 'Tablet', value: BREAKPOINTS.md, icon: 'i-lucide-tablet' },
  { label: 'Laptop', value: BREAKPOINTS.xl, icon: 'i-lucide-laptop' },
  { label: 'Desktop', value: BREAKPOINTS['3xl'], icon: 'i-lucide-monitor' },
  { label: '4K', value: BREAKPOINTS['5xl'], icon: 'i-lucide-tv' },
]

/** Active preset by width range */
const activePreset = computed<PresetWidth | null>(() => {
  const w: number = effectiveWidth.value
  if (w >= BREAKPOINTS['5xl']) return presetWidths[4]
  if (w >= BREAKPOINTS['3xl']) return presetWidths[3]
  if (w >= BREAKPOINTS.xl) return presetWidths[2]
  if (w >= BREAKPOINTS.md) return presetWidths[1]
  return presetWidths[0]
})

/** Breakpoint usage examples */
interface BreakpointItem {
  key: BreakpointKey
  value: number
  minWidthClass: string
  maxWidthClass: string
  description: string
}

const breakpointItems = computed<BreakpointItem[]>(() =>
  breakpointEntries.value.map(([key, value]: [BreakpointKey, number]) => ({
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

const rulerIndicatorStyle = computed<CSSProperties>(() => ({
  left: `${(effectiveWidth.value / RULER_MAX) * 100}%`,
}))

const gridTemplateStyle = computed<CSSProperties>(() => ({
  gridTemplateColumns: `repeat(${Math.min(gridCols.value, 6)}, 1fr)`,
}))

// deviceSync: sync API for pre-mount (no Pinia)
const deviceSyncInfo = computed<{ deviceType: string; breakpoint: BreakpointKey | null }>(() => ({
  deviceType: getDeviceTypeSync(),
  breakpoint: getBreakpointSync(),
}))
</script>

<template>
  <div
    class="h-full flex flex-col overflow-hidden"
    data-archetype="A1-toolbar-content"
  >
    <!-- Fixed top: Header + Viewport Simulator (Transparent Root · Nested Canvas) -->
    <div class="shrink-0 border-b-default border-primary/50 bg-primary/5">
      <div class="layout-content-wide flex flex-col gap-sm py-padding-sm">
        <!-- Header -->
        <div class="flex flex-col gap-xs">
          <div class="flex items-center gap-md">
            <div class="p-padding-md bg-primary/10 rounded-scale-lg shrink-0">
              <Icons
                name="i-lucide-monitor"
                class="text-primary fs-2xl behavior-hover-transition"
              />
            </div>
            <div class="flex flex-col gap-xs">
              <h1 class="fs-2xl font-bold text-foreground">Breakpoint System</h1>
              <p class="text-muted-foreground fs-sm">
                响应式断点系统完整参考 · 点击任意类名即可自动复制到剪贴板
              </p>
            </div>
          </div>
          <div
            class="border-l-4 border-primary bg-primary/5 p-padding-md rounded-r-scale-md flex gap-md items-start mt-margin-sm"
          >
            <Icons
              name="i-lucide-info"
              class="text-primary fs-xl shrink-0 mt-margin-xs"
            />
            <div class="flex flex-col gap-xs">
              <div class="font-semibold text-primary fs-sm">Architectural Guide 架构引导</div>
              <div class="text-muted-foreground fs-xs leading-relaxed">
                断点数值由
                <span class="bg-muted px-padding-xs rounded-scale-xs font-mono">
                  src/constants/breakpoints.ts
                </span>
                定义。如需修改全局断点，请在该文件中统一调整。同一组键名
                <span class="bg-muted px-padding-xs rounded-scale-xs font-mono">xs ~ 5xl</span>
                也用于尺寸阶梯
                <span class="bg-muted px-padding-xs rounded-scale-xs font-mono">
                  SIZE_SCALE_KEYS
                </span>
                ，便于在字体/间距/圆角/过渡中复用同一心智模型。勾选「跟随真实视口」后，模拟器将使用
                <span class="bg-muted px-padding-xs rounded-scale-xs font-mono">
                  useDeviceStore
                </span>
                的实时宽度，与真实布局一致。
              </div>
            </div>
          </div>
        </div>

        <!-- Control Panel -->
        <Card
          class="bg-card rounded-scale-xl shadow-soft p-padding-xl flex flex-col gap-md"
          :pt="{ title: { class: '!min-h-0 py-padding-sm' } }"
        >
          <template #title>
            <div class="flex items-center gap-sm">
              <Icons
                name="i-lucide-sliders-horizontal"
                class="text-primary"
              />
              <span class="font-semibold">Viewport Simulator 视窗模拟器</span>
            </div>
          </template>
          <template #content>
            <div class="flex flex-col gap-md">
              <!-- 跟随真实视口 -->
              <div class="flex items-center gap-sm">
                <Checkbox
                  v-model="followViewport"
                  :binary="true"
                  input-id="follow-viewport"
                />
                <label
                  for="follow-viewport"
                  class="cursor-pointer select-none text-muted-foreground fs-sm"
                >
                  跟随真实视口 (useDeviceStore.width)
                </label>
                <Tag
                  v-if="followViewport"
                  value="已同步"
                  severity="success"
                  class="fs-xs"
                />
              </div>
              <!-- Width Slider -->
              <div class="flex flex-col gap-sm">
                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground">Current Width</span>
                  <div class="flex items-center gap-md">
                    <span class="font-mono fs-xl font-bold text-foreground">
                      {{ effectiveWidth }}px
                    </span>
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
                  :disabled="followViewport"
                />
              </div>

              <!-- Preset Buttons -->
              <div class="flex flex-wrap gap-sm">
                <div class="flex flex-wrap gap-sm">
                  <div
                    v-for="preset in presetWidths"
                    :key="preset.value"
                    class="flex items-center gap-xs px-padding-sm py-padding-xs rounded-scale-md cursor-pointer select-none transition-all duration-scale-lg ease-in-out fs-sm active:scale-95 interactive-focus-ring"
                    tabindex="0"
                    :class="[
                      activePreset?.value === preset.value
                        ? 'bg-primary text-primary-foreground shadow-soft'
                        : 'surface-item text-muted-foreground hover:bg-muted/60 dark:hover:bg-muted/40',
                    ]"
                    @click="sliderValue = preset.value"
                    @keydown.enter.prevent="sliderValue = preset.value"
                    @keydown.space.prevent="sliderValue = preset.value"
                  >
                    <Icons
                      :name="preset.icon"
                      size="sm"
                      :class="
                        activePreset?.value === preset.value
                          ? 'text-primary-foreground'
                          : 'text-primary'
                      "
                    />
                    <span>{{ preset.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Scrollable content -->
    <CScrollbar class="flex-1 min-h-0">
      <div class="layout-content-wide flex flex-col gap-xl">
        <!-- Device Store 实时状态 -->
        <Card
          class="bg-accent/10 dark:bg-accent/5 rounded-scale-xl shadow-soft p-padding-xl flex flex-col gap-lg"
        >
          <template #title>
            <div class="flex items-center gap-sm border-b-default pb-padding-sm mb-padding-sm">
              <Icons
                name="i-lucide-smartphone"
                class="text-primary"
              />
              <span class="font-semibold">Device Store 实时状态</span>
              <Tag
                value="useDeviceStore"
                severity="info"
              />
            </div>
          </template>
          <template #content>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
              <div
                class="flex flex-col gap-xs p-padding-md surface-item rounded-scale-lg interactive-hover-tile behavior-hover-transition"
              >
                <span class="text-muted-foreground fs-xs">type</span>
                <Tag
                  :value="deviceStore.type"
                  severity="info"
                />
                <span class="font-mono fs-xs text-muted-foreground">PC / Tablet / Mobile</span>
              </div>
              <div
                class="flex flex-col gap-xs p-padding-md surface-item rounded-scale-lg interactive-hover-tile behavior-hover-transition"
              >
                <span class="text-muted-foreground fs-xs">currentBreakpoint</span>
                <Tag
                  :value="deviceStore.currentBreakpoint"
                  severity="success"
                />
              </div>
              <div
                class="flex flex-col gap-xs p-padding-md surface-item rounded-scale-lg interactive-hover-tile behavior-hover-transition"
              >
                <span class="text-muted-foreground fs-xs">isMobileLayout</span>
                <Tag
                  :value="String(deviceStore.isMobileLayout)"
                  :severity="deviceStore.isMobileLayout ? 'warn' : 'secondary'"
                />
                <span class="font-mono fs-xs text-muted-foreground">width &lt; lg</span>
              </div>
              <div
                class="flex flex-col gap-xs p-padding-md surface-item rounded-scale-lg interactive-hover-tile behavior-hover-transition"
              >
                <span class="text-muted-foreground fs-xs">isTabletLayout</span>
                <Tag
                  :value="String(deviceStore.isTabletLayout)"
                  :severity="deviceStore.isTabletLayout ? 'warn' : 'secondary'"
                />
              </div>
            </div>
            <p class="mt-margin-md text-muted-foreground fs-sm">
              布局判定应使用
              <span class="bg-muted px-padding-xs rounded-scale-xs font-mono">useDeviceStore</span>
              的 getters，禁止直接判断 window.innerWidth
            </p>
          </template>
        </Card>

        <!-- deviceSync 同步 API -->
        <Card
          class="bg-accent/10 dark:bg-accent/5 rounded-scale-xl shadow-soft p-padding-xl flex flex-col gap-lg"
        >
          <template #title>
            <div class="flex items-center gap-sm border-b-default pb-padding-sm mb-padding-sm">
              <Icons
                name="i-lucide-cpu"
                class="text-primary"
              />
              <span class="font-semibold">deviceSync 同步 API</span>
              <Tag
                value="mount 前逻辑"
                severity="warn"
              />
            </div>
          </template>
          <template #content>
            <div class="flex flex-col gap-md">
              <p class="text-muted-foreground fs-sm">
                纯函数，不依赖 Pinia · 供 mount 前逻辑（如 sizeEngine.preload）使用 · SSOT:
                <span class="bg-muted px-padding-xs rounded-scale-xs font-mono">
                  src/utils/deviceSync.ts
                </span>
              </p>
              <div class="flex flex-wrap gap-md">
                <div
                  class="fs-xs font-mono bg-muted/30 px-padding-xs py-padding-xs rounded-scale-xs cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-primary/20 hover:text-primary active:scale-95 text-muted-foreground interactive-focus-ring"
                  tabindex="0"
                  @click="copyToClipboard('getDeviceTypeSync()')"
                  @keydown.enter.prevent="copyToClipboard('getDeviceTypeSync()')"
                  @keydown.space.prevent="copyToClipboard('getDeviceTypeSync()')"
                >
                  getDeviceTypeSync()
                </div>
                <div
                  class="fs-xs font-mono bg-muted/30 px-padding-xs py-padding-xs rounded-scale-xs cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-primary/20 hover:text-primary active:scale-95 text-muted-foreground interactive-focus-ring"
                  tabindex="0"
                  @click="copyToClipboard('getBreakpointSync(width?)')"
                  @keydown.enter.prevent="copyToClipboard('getBreakpointSync(width?)')"
                  @keydown.space.prevent="copyToClipboard('getBreakpointSync(width?)')"
                >
                  getBreakpointSync(width?)
                </div>
              </div>
              <div class="flex gap-md text-muted-foreground fs-sm">
                <span>
                  当前 sync 结果: type=
                  <span class="font-mono text-foreground">{{ deviceSyncInfo.deviceType }}</span>
                  , breakpoint=
                  <span class="font-mono text-foreground">{{ deviceSyncInfo.breakpoint }}</span>
                </span>
              </div>
            </div>
          </template>
        </Card>

        <!-- Visual Ruler -->
        <Card class="bg-card rounded-scale-xl shadow-soft p-padding-xl flex flex-col gap-lg">
          <template #title>
            <div class="flex items-center gap-sm">
              <Icons
                name="i-lucide-ruler"
                class="text-primary"
              />
              <span class="font-semibold">Breakpoint Ruler 断点标尺</span>
            </div>
          </template>
          <template #content>
            <div
              class="relative h-[var(--spacing-5xl)] w-full overflow-hidden rounded-scale-md component-border bg-muted/30"
              role="img"
              aria-label="Breakpoint ruler"
            >
              <!-- Current Width Indicator -->
              <div
                class="absolute top-0 h-full w-px bg-accent z-10 transition-all duration-scale-lg"
                :style="rulerIndicatorStyle"
              >
                <div
                  class="absolute -top-[var(--spacing-xs)] left-1/2 -translate-x-1/2 w-[var(--spacing-sm)] h-[var(--spacing-sm)] bg-accent rounded-full shadow-soft"
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
                  :class="isBreakpointActive(value) ? 'bg-accent' : 'bg-border'"
                />
                <span
                  class="mt-margin-xs shrink-0 rounded-scale-xs px-padding-xs fs-xs font-medium cursor-pointer hover:scale-110 transition-transform duration-scale-lg interactive-focus-ring"
                  tabindex="0"
                  :class="
                    isBreakpointActive(value)
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground'
                  "
                  @click="copyToClipboard(`${key}:`, `${key}: prefix`)"
                  @keydown.enter.prevent="copyToClipboard(`${key}:`, `${key}: prefix`)"
                  @keydown.space.prevent="copyToClipboard(`${key}:`, `${key}: prefix`)"
                >
                  {{ key }}: {{ value }}
                </span>
              </div>
            </div>
          </template>
        </Card>

        <!-- Breakpoint Reference Table -->
        <Card class="bg-card rounded-scale-xl shadow-soft p-padding-xl flex flex-col gap-lg">
          <template #title>
            <div class="flex items-center gap-sm">
              <Icons
                name="i-lucide-table"
                class="text-primary"
              />
              <span class="font-semibold">Breakpoint Reference 断点参考表</span>
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
                    class="border-b-default surface-item behavior-hover-transition hover:bg-foreground/5"
                    :class="{ 'bg-accent/5': isBreakpointActive(item.value) }"
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
                        <div
                          class="fs-xs font-mono bg-muted/30 px-padding-xs py-padding-xs rounded-scale-xs cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-success/20 hover:text-success active:scale-95 text-muted-foreground interactive-focus-ring"
                          tabindex="0"
                          @click="copyToClipboard(item.minWidthClass)"
                          @keydown.enter.prevent="copyToClipboard(item.minWidthClass)"
                          @keydown.space.prevent="copyToClipboard(item.minWidthClass)"
                        >
                          {{ item.minWidthClass }}
                        </div>
                        <div
                          class="fs-xs font-mono bg-muted/30 px-padding-xs py-padding-xs rounded-scale-xs cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-warn/20 hover:text-warn active:scale-95 text-muted-foreground interactive-focus-ring"
                          tabindex="0"
                          @click="copyToClipboard(item.maxWidthClass)"
                          @keydown.enter.prevent="copyToClipboard(item.maxWidthClass)"
                          @keydown.space.prevent="copyToClipboard(item.maxWidthClass)"
                        >
                          {{ item.maxWidthClass }}
                        </div>
                      </div>
                    </td>
                    <td class="p-padding-sm text-muted-foreground fs-sm text-single-line-ellipsis">
                      {{ item.description }}
                    </td>
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
        <Card class="bg-card rounded-scale-xl shadow-soft p-padding-xl flex flex-col gap-lg">
          <template #title>
            <div class="flex items-center gap-sm">
              <Icons
                name="i-lucide-grid-3x3"
                class="text-primary"
              />
              <span class="font-semibold">Responsive Grid Demo 响应式网格演示</span>
              <Tag
                :value="`${gridCols} columns`"
                severity="info"
              />
            </div>
          </template>
          <template #content>
            <div class="flex flex-col gap-md">
              <p class="text-muted-foreground fs-sm">
                模拟视窗宽度为
                <span class="font-mono font-bold">{{ effectiveWidth }}px</span>
                ， 当前断点
                <span class="font-mono font-bold">{{ activeBreakpoint ?? '< xs' }}</span>
                ， 网格列数
                <span class="font-mono font-bold">
                  {{ gridCols }}
                </span>
              </p>

              <!-- Simulated Viewport -->
              <CScrollbar class="flex justify-center pb-padding-md min-w-0">
                <div
                  class="flex shrink-0 flex-col rounded-scale-lg component-border bg-card shadow-soft transition-all duration-scale-lg w-full"
                >
                  <div
                    class="border-b-default px-padding-md py-padding-sm text-center fs-sm text-muted-foreground flex items-center justify-center gap-sm"
                  >
                    <Icons
                      name="i-lucide-monitor"
                      class="fs-lg"
                    />
                    <span>Viewport {{ effectiveWidth }}px · Grid {{ gridCols }} col</span>
                  </div>
                  <div
                    class="grid gap-sm p-padding-md"
                    :style="gridTemplateStyle"
                  >
                    <div
                      v-for="n in 12"
                      :key="n"
                      class="flex aspect-video items-center justify-center rounded-scale-md component-border bg-muted/50 font-mono fs-lg font-medium text-foreground interactive-hover-tile behavior-hover-transition"
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
        <Card class="bg-card rounded-scale-xl shadow-soft p-padding-xl flex flex-col gap-lg">
          <template #title>
            <div class="flex items-center gap-sm">
              <Icons
                name="i-lucide-code"
                class="text-primary"
              />
              <span class="font-semibold">Usage Examples 使用示例</span>
            </div>
          </template>
          <template #content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div class="flex flex-col gap-sm">
                <h4 class="fs-sm font-semibold text-foreground mb-margin-xs">
                  最小宽度 (Min-Width Mobile First)
                </h4>
                <div
                  class="rounded-scale-md cursor-pointer hover:bg-muted/70 transition-colors duration-scale-lg interactive-focus-ring"
                  tabindex="0"
                  @click="copyToClipboard('md:hidden lg:block')"
                  @keydown.enter.prevent="copyToClipboard('md:hidden lg:block')"
                  @keydown.space.prevent="copyToClipboard('md:hidden lg:block')"
                >
                  <CScrollbar class="min-w-0">
                    <pre
                      class="m-0 bg-background/50 backdrop-blur-sm rounded-scale-md component-border p-padding-md fs-sm"
                    >
    <code class="text-foreground font-mono">
                    &lt;div class="hidden md:block"&gt;
  MD 及以上可见
&lt;/div&gt;

&lt;div class="md:hidden lg:block"&gt;
  MD 隐藏，LG 及以上可见
&lt;/div&gt;</code></pre>
                  </CScrollbar>
                </div>
              </div>
              <div class="flex flex-col gap-sm">
                <h4 class="fs-sm font-semibold text-foreground mb-margin-xs">
                  最大宽度 (Max-Width)
                </h4>
                <div
                  class="rounded-scale-md cursor-pointer hover:bg-muted/70 transition-colors duration-scale-lg interactive-focus-ring"
                  tabindex="0"
                  @click="copyToClipboard('<md:text-sm')"
                  @keydown.enter.prevent="copyToClipboard('<md:text-sm')"
                  @keydown.space.prevent="copyToClipboard('<md:text-sm')"
                >
                  <CScrollbar class="min-w-0">
                    <pre
                      class="m-0 bg-background/50 backdrop-blur-sm rounded-scale-md component-border p-padding-md fs-sm"
                    ><code class="text-foreground font-mono">&lt;div class="&lt;md:text-sm"&gt;
  移动端小号文字
&lt;/div&gt;

&lt;div class="&lt;lg:grid-cols-1"&gt;
  LG 以下单列布局
&lt;/div&gt;</code></pre>
                  </CScrollbar>
                </div>
              </div>
              <div class="flex flex-col gap-sm">
                <h4 class="fs-sm font-semibold text-foreground mb-margin-xs">
                  响应式网格 (Responsive Grid)
                </h4>
                <div
                  class="rounded-scale-md cursor-pointer hover:bg-muted/70 transition-colors duration-scale-lg interactive-focus-ring"
                  tabindex="0"
                  @click="copyToClipboard('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4')"
                  @keydown.enter.prevent="
                    copyToClipboard('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4')
                  "
                  @keydown.space.prevent="
                    copyToClipboard('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4')
                  "
                >
                  <CScrollbar class="min-w-0">
                    <pre
                      class="m-0 bg-background/50 backdrop-blur-sm rounded-scale-md component-border p-padding-md fs-sm"
                    ><code class="text-foreground font-mono">&lt;div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"&gt;
  &lt;!-- 响应式网格项 --&gt;
&lt;/div&gt;</code></pre>
                  </CScrollbar>
                </div>
              </div>
              <div class="flex flex-col gap-sm">
                <h4 class="fs-sm font-semibold text-foreground mb-margin-xs">
                  响应式间距 (Responsive Spacing)
                </h4>
                <div
                  class="rounded-scale-md cursor-pointer hover:bg-muted/70 transition-colors duration-scale-lg interactive-focus-ring"
                  tabindex="0"
                  @click="copyToClipboard('p-padding-sm md:p-padding-md lg:p-padding-lg')"
                  @keydown.enter.prevent="
                    copyToClipboard('p-padding-sm md:p-padding-md lg:p-padding-lg')
                  "
                  @keydown.space.prevent="
                    copyToClipboard('p-padding-sm md:p-padding-md lg:p-padding-lg')
                  "
                >
                  <CScrollbar class="min-w-0">
                    <pre
                      class="m-0 bg-background/50 backdrop-blur-sm rounded-scale-md component-border p-padding-md fs-sm"
                    ><code class="text-foreground font-mono">&lt;div class="p-padding-sm md:p-padding-md lg:p-padding-lg"&gt;
  响应式内边距
&lt;/div&gt;</code></pre>
                  </CScrollbar>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Quick Reference -->
        <Card class="bg-card rounded-scale-xl shadow-soft p-padding-xl flex flex-col gap-lg">
          <template #title>
            <div class="flex items-center gap-sm">
              <Icons
                name="i-lucide-zap"
                class="text-primary"
              />
              <span class="font-semibold">Quick Reference 快速参考</span>
            </div>
          </template>
          <template #content>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-md">
              <div
                v-for="[key, value] in breakpointEntries"
                :key="key"
                class="flex flex-col gap-xs p-padding-md surface-item rounded-scale-lg interactive-hover-tile behavior-hover-transition cursor-pointer interactive-focus-ring"
                tabindex="0"
                @click="copyToClipboard(`${key}:`)"
                @keydown.enter.prevent="copyToClipboard(`${key}:`)"
                @keydown.space.prevent="copyToClipboard(`${key}:`)"
              >
                <div class="flex items-center justify-between">
                  <Tag
                    :value="key"
                    severity="info"
                  />
                  <span class="font-mono fs-xs text-muted-foreground">{{ value }}px</span>
                </div>
                <div class="font-mono fs-sm text-foreground">{{ key }}:class</div>
              </div>
            </div>
            <p class="mt-margin-md text-muted-foreground fs-sm">
              断点前缀遵循 Mobile-First 设计原则：
              <span class="bg-muted px-padding-xs rounded-scale-xs">md:</span>
              表示 ≥768px 时应用样式
            </p>
          </template>
        </Card>
      </div>
    </CScrollbar>
  </div>
</template>
