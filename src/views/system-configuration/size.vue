<script setup lang="ts">
import {
  SIZE_SCALE_KEYS,
  FONT_SCALE_RATIOS,
  SPACING_SCALE_RATIOS,
  RADIUS_SCALE_RATIOS,
  TRANSITION_SCALE_VALUES,
} from '@/constants/sizeScale'
import { LAYOUT_DIMENSION_KEYS, SIZE_PRESETS } from '@/constants/size'
import { useSizeStore } from '@/stores/modules/size'
import { useDeviceStore } from '@/stores/modules/device'

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

// Font size categories
const fontSizeItems = computed<
  Array<{
    key: string
    cssVar: string
    unoClass: string
    textClass: string
    ratio: number
    example: string
  }>
>(() =>
  SIZE_SCALE_KEYS.map(key => ({
    key,
    cssVar: `--font-size-${key}`,
    unoClass: `fs-${key}`,
    textClass: `text-${key}`,
    ratio: FONT_SCALE_RATIOS[key],
    example:
      key === 'xs'
        ? '超小号'
        : key === 'sm'
          ? '小号文本'
          : key === 'md'
            ? '中号 (基准)'
            : key === 'lg'
              ? '大号文本'
              : key === 'xl'
                ? '超大号'
                : key === '2xl'
                  ? '2X 大号'
                  : key === '3xl'
                    ? '3X 大号'
                    : key === '4xl'
                      ? '4X 大号'
                      : '5X 大号',
  }))
)

// Spacing categories
const spacingItems = computed<
  Array<{
    key: string
    cssVar: string
    paddingClass: string
    marginClass: string
    gapClass: string
    gapXClass: string
    gapYClass: string
    scrollGapClass: string
    pScaleClass: string
    mScaleClass: string
    gapScaleClass: string
    ratio: number
    units: number
  }>
>(() =>
  SIZE_SCALE_KEYS.map(key => ({
    key,
    cssVar: `--spacing-${key}`,
    paddingClass: `p-padding-${key}`,
    marginClass: `m-margin-${key}`,
    gapClass: `gap-${key}`,
    gapXClass: `gap-x-${key}`,
    gapYClass: `gap-y-${key}`,
    scrollGapClass: `scroll-m-gap-${key}`,
    pScaleClass: `p-scale-${key}`,
    mScaleClass: `m-scale-${key}`,
    gapScaleClass: `gap-scale-${key}`,
    ratio: SPACING_SCALE_RATIOS[key],
    units: SPACING_SCALE_RATIOS[key],
  }))
)

// Base variables (SSOT: SIZE_BASE_VAR_KEYS)
const baseVarItems = [
  {
    key: 'containerPadding',
    cssVar: '--container-padding',
    unoClass: 'p-container-padding',
    description: '容器全局内边距',
  },
]

// Radius categories
const radiusItems = computed<
  Array<{
    key: string
    cssVar: string
    unoClass: string
    ratio: number
  }>
>(() =>
  SIZE_SCALE_KEYS.map(key => ({
    key,
    cssVar: `--radius-${key}`,
    unoClass: `rounded-scale-${key}`,
    ratio: RADIUS_SCALE_RATIOS[key],
  }))
)

// Transition categories
const transitionItems = computed<
  Array<{
    key: string
    cssVar: string
    unoClass: string
    value: number
    description: string
  }>
>(() =>
  SIZE_SCALE_KEYS.map(key => ({
    key,
    cssVar: `--transition-${key}`,
    unoClass: `duration-scale-${key}`,
    value: TRANSITION_SCALE_VALUES[key],
    description:
      key === 'xs'
        ? '微交互'
        : key === 'sm'
          ? '快速反馈'
          : key === 'md'
            ? '标准过渡'
            : key === 'lg'
              ? '展开/收起'
              : key === 'xl'
                ? '页面过渡'
                : key === '2xl'
                  ? '复杂动画'
                  : key === '3xl'
                    ? '慢动画'
                    : key === '4xl'
                      ? '强调动画'
                      : '戏剧效果',
  }))
)

/** 布局宽度类 key（其余为高度 h-*） */
const LAYOUT_WIDTH_KEYS = ['sidebarWidth', 'sidebarCollapsedWidth'] as const

// Layout dimension items
const layoutItems = computed<
  Array<{
    key: string
    cssVar: string
    unoClass: string
    description: string
  }>
>(() =>
  LAYOUT_DIMENSION_KEYS.map(key => {
    const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
    const isWidth = (LAYOUT_WIDTH_KEYS as readonly string[]).includes(key)
    return {
      key,
      cssVar,
      unoClass: isWidth ? `w-${key}` : `h-${key}`,
      description:
        key === 'sidebarWidth'
          ? '侧边栏展开宽度'
          : key === 'sidebarCollapsedWidth'
            ? '侧边栏收起宽度'
            : key === 'headerHeight'
              ? '头部高度'
              : key === 'breadcrumbHeight'
                ? '面包屑高度'
                : key === 'footerHeight'
                  ? '底部高度'
                  : '标签页高度',
    }
  })
)

// Current preset (from store for demo, fallback to comfortable)
const sizeStore: ReturnType<typeof useSizeStore> = useSizeStore()
const deviceStore = useDeviceStore()
const currentPreset = computed<(typeof SIZE_PRESETS)[number]>(() => sizeStore.currentPreset)

// Margin direction variants (same pattern as padding)
const marginDirMap = [
  { dir: '', label: 'all' },
  { dir: 't', label: 't' },
  { dir: 'b', label: 'b' },
  { dir: 'l', label: 'l' },
  { dir: 'r', label: 'r' },
  { dir: 'x', label: 'x' },
  { dir: 'y', label: 'y' },
] as const
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <!-- Toolbar: Header (non-scroll) -->
    <div class="shrink-0 px-padding-lg py-padding-md border-b-default">
      <div class="layout-content-wide flex flex-col gap-xs">
        <div class="flex items-center gap-md">
          <div class="p-padding-md bg-primary/10 rounded-scale-lg shrink-0">
            <Icons
              name="i-lucide-ruler"
              class="text-primary fs-2xl"
            />
          </div>
          <div>
            <h1 class="fs-2xl font-bold text-foreground">Size System</h1>
            <p class="text-muted-foreground fs-sm">
              尺寸系统变量完整参考 · 点击任意类名或变量即可自动复制到剪贴板
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
              尺寸阶梯由
              <span class="bg-muted px-padding-xs rounded font-mono">
                src/constants/sizeScale.ts
              </span>
              定义。如需修改全局比例，请编辑该文件而非在此页面调整。
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scrollable content -->
    <CScrollbar class="flex-1 min-h-0">
      <div class="p-padding-lg">
        <div class="layout-content-wide flex flex-col gap-xl">
          <!-- Size Store 尺寸 Store -->
          <Card class="component-border hover:shadow-md transition-all duration-scale-lg">
            <template #title>
              <div class="flex items-center gap-sm">
                <Icons
                  name="i-lucide-settings-2"
                  class="text-primary"
                />
                <span class="font-semibold">Size Store 尺寸 Store</span>
                <Tag
                  value="useSizeStore"
                  severity="info"
                />
              </div>
            </template>
            <template #content>
              <div class="flex flex-col gap-md">
                <p class="text-muted-foreground fs-sm">
                  切换预设可实时更新根字号、布局变量等，影响全站尺寸阶梯
                </p>
                <div class="flex flex-wrap gap-sm">
                  <div
                    v-for="preset in SIZE_PRESETS"
                    :key="preset.name"
                    class="p-padding-sm py-1 rounded-scale-md cursor-pointer select-none transition-all duration-scale-lg ease-in-out fs-sm active:scale-95"
                    :class="[
                      sizeStore.sizeName === preset.name
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'surface-item text-muted-foreground hover:bg-muted/60 dark:hover:bg-muted/40',
                    ]"
                    @click="sizeStore.setSize(preset.name)"
                  >
                    {{ preset.label }}
                  </div>
                </div>
                <div class="flex flex-wrap gap-md text-muted-foreground fs-sm">
                  <span>
                    当前:
                    <span class="font-mono font-bold text-foreground">
                      {{ sizeStore.sizeName }}
                    </span>
                  </span>
                  <span>
                    fontSizeBase:
                    <span class="font-mono">{{ currentPreset.fontSizeBase }}px</span>
                  </span>
                  <span>
                    spacingBase:
                    <span class="font-mono">{{ currentPreset.spacingBase }}px</span>
                  </span>
                </div>
              </div>
            </template>
          </Card>

          <!-- Device Store 当前设备/断点 -->
          <Card class="component-border hover:shadow-md transition-all duration-scale-lg">
            <template #title>
              <div class="flex items-center gap-sm">
                <Icons
                  name="i-lucide-smartphone"
                  class="text-primary"
                />
                <span class="font-semibold">Device Store 当前设备/断点</span>
                <Tag
                  value="useDeviceStore"
                  severity="info"
                />
              </div>
            </template>
            <template #content>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
                <div
                  class="flex flex-col gap-xs p-padding-md surface-item rounded-scale-md component-border hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-all duration-scale-lg"
                >
                  <span class="text-muted-foreground fs-xs">type</span>
                  <Tag
                    :value="deviceStore.type"
                    severity="info"
                  />
                </div>
                <div
                  class="flex flex-col gap-xs p-padding-md surface-item rounded-scale-md component-border hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-all duration-scale-lg"
                >
                  <span class="text-muted-foreground fs-xs">currentBreakpoint</span>
                  <Tag
                    :value="deviceStore.currentBreakpoint"
                    severity="success"
                  />
                </div>
                <div
                  class="flex flex-col gap-xs p-padding-md surface-item rounded-scale-md component-border hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-all duration-scale-lg"
                >
                  <span class="text-muted-foreground fs-xs">isMobileLayout</span>
                  <Tag
                    :value="String(deviceStore.isMobileLayout)"
                    :severity="deviceStore.isMobileLayout ? 'warn' : 'secondary'"
                  />
                </div>
                <div
                  class="flex flex-col gap-xs p-padding-md surface-item rounded-scale-md component-border hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-all duration-scale-lg"
                >
                  <span class="text-muted-foreground fs-xs">width × height</span>
                  <span class="font-mono fs-sm">
                    {{ deviceStore.width }} × {{ deviceStore.height }}
                  </span>
                </div>
              </div>
              <p class="mt-margin-md text-muted-foreground fs-xs">
                布局判定应使用 useDeviceStore 的 getters，详见
                <RouterLink
                  to="/system-configuration/layout"
                  class="text-primary hover:underline"
                >
                  布局与设备
                </RouterLink>
                。
              </p>
            </template>
          </Card>

          <!-- Font Size Section -->
          <Card class="component-border hover:shadow-md transition-all duration-scale-lg">
            <template #title>
              <div class="flex items-center gap-sm">
                <Icons
                  name="i-lucide-type"
                  class="text-primary"
                />
                <span class="font-semibold">Font Size 字体大小阶梯</span>
                <Tag
                  value="9 scales"
                  severity="secondary"
                />
              </div>
            </template>
            <template #content>
              <div class="flex flex-col gap-md">
                <p class="text-muted-foreground fs-sm">
                  基于
                  <span class="bg-muted px-padding-xs rounded">fontSizeBase</span>
                  与
                  <span class="bg-muted px-padding-xs rounded">FONT_SCALE_RATIOS</span>
                  动态计算
                </p>
                <CScrollbar class="w-full min-w-0">
                  <table class="w-full border-collapse">
                    <thead>
                      <tr class="border-b-default">
                        <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                          等级
                        </th>
                        <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                          CSS 变量
                        </th>
                        <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                          UnoCSS 类名
                        </th>
                        <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                          比例
                        </th>
                        <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                          预览
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="item in fontSizeItems"
                        :key="item.key"
                        class="border-b border-solid border-border/50 hover:bg-muted/30 transition-colors duration-scale-lg"
                      >
                        <td class="p-padding-sm">
                          <Tag
                            :value="item.key"
                            severity="info"
                          />
                        </td>
                        <td class="p-padding-sm">
                          <div
                            class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-primary/20 hover:text-primary active:scale-95 text-muted-foreground w-fit"
                            @click="copyToClipboard(`var(${item.cssVar})`, item.cssVar)"
                          >
                            {{ item.cssVar }}
                          </div>
                        </td>
                        <td class="p-padding-sm flex gap-xs flex-wrap">
                          <div
                            class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-success/20 hover:text-success active:scale-95 text-muted-foreground"
                            @click="copyToClipboard(item.unoClass)"
                          >
                            {{ item.unoClass }}
                          </div>
                          <div
                            class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-success/20 hover:text-success active:scale-95 text-muted-foreground"
                            @click="copyToClipboard(item.textClass)"
                          >
                            {{ item.textClass }}
                          </div>
                        </td>
                        <td class="p-padding-sm font-mono text-muted-foreground">
                          {{ item.ratio }}×
                        </td>
                        <td class="p-padding-sm">
                          <span :class="`fs-${item.key}`">
                            {{ item.example }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CScrollbar>
              </div>
            </template>
          </Card>

          <!-- Spacing Section -->
          <Card class="component-border hover:shadow-md transition-all duration-scale-lg">
            <template #title>
              <div class="flex items-center gap-sm">
                <Icons
                  name="i-lucide-space"
                  class="text-primary"
                />
                <span>Spacing 间距阶梯</span>
                <Tag
                  value="9 scales"
                  severity="secondary"
                />
              </div>
            </template>
            <template #content>
              <div class="flex flex-col gap-md">
                <p class="text-muted-foreground fs-sm">
                  基于
                  <span class="bg-muted px-padding-xs rounded">spacingBase</span>
                  ×
                  <span class="bg-muted px-padding-xs rounded">SPACING_SCALE_RATIOS</span>
                  动态计算
                </p>
                <CScrollbar class="w-full min-w-0">
                  <table class="w-full border-collapse">
                    <thead>
                      <tr class="border-b-default">
                        <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                          等级
                        </th>
                        <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                          CSS 变量
                        </th>
                        <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                          Padding 类名
                        </th>
                        <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                          单位
                        </th>
                        <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                          预览
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="item in spacingItems"
                        :key="item.key"
                        class="border-b border-solid border-border/50 hover:bg-muted/30 transition-colors duration-scale-lg"
                      >
                        <td class="p-padding-sm">
                          <Tag
                            :value="item.key"
                            severity="info"
                          />
                        </td>
                        <td class="p-padding-sm">
                          <div
                            class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-primary/20 hover:text-primary active:scale-95 text-muted-foreground w-fit"
                            @click="copyToClipboard(`var(${item.cssVar})`, item.cssVar)"
                          >
                            {{ item.cssVar }}
                          </div>
                        </td>
                        <td class="p-padding-sm">
                          <div class="flex gap-xs flex-wrap">
                            <div
                              class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-success/20 hover:text-success active:scale-95 text-muted-foreground"
                              @click="copyToClipboard(item.paddingClass)"
                            >
                              {{ item.paddingClass }}
                            </div>
                            <div
                              class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-success/20 hover:text-success active:scale-95 text-muted-foreground"
                              @click="copyToClipboard(item.gapClass)"
                            >
                              {{ item.gapClass }}
                            </div>
                            <div
                              class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-success/20 hover:text-success active:scale-95 text-muted-foreground"
                              @click="copyToClipboard(item.gapXClass)"
                            >
                              {{ item.gapXClass }}
                            </div>
                            <div
                              class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-success/20 hover:text-success active:scale-95 text-muted-foreground"
                              @click="copyToClipboard(item.gapYClass)"
                            >
                              {{ item.gapYClass }}
                            </div>
                            <div
                              class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-success/20 hover:text-success active:scale-95 text-muted-foreground"
                              @click="copyToClipboard(item.scrollGapClass)"
                            >
                              {{ item.scrollGapClass }}
                            </div>
                            <div
                              class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-warn/20 hover:text-warn active:scale-95 text-muted-foreground"
                              @click="copyToClipboard(item.pScaleClass)"
                            >
                              {{ item.pScaleClass }}
                            </div>
                            <div
                              class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-warn/20 hover:text-warn active:scale-95 text-muted-foreground"
                              @click="copyToClipboard(item.mScaleClass)"
                            >
                              {{ item.mScaleClass }}
                            </div>
                            <div
                              class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-warn/20 hover:text-warn active:scale-95 text-muted-foreground"
                              @click="copyToClipboard(item.gapScaleClass)"
                            >
                              {{ item.gapScaleClass }}
                            </div>
                          </div>
                        </td>
                        <td class="p-padding-sm font-mono text-muted-foreground">
                          {{ item.units }} unit
                        </td>
                        <td class="p-padding-sm">
                          <div class="inline-flex">
                            <div
                              class="bg-primary/20 border border-primary/50 rounded-scale-xs h-spacing-lg"
                              :style="{ width: `var(${item.cssVar})` }"
                            />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CScrollbar>

                <!-- Spacing Direction Examples -->
                <div class="mt-margin-md p-padding-md bg-muted/30 rounded-scale-md">
                  <h4 class="fs-sm font-semibold text-foreground mb-margin-xs">
                    Direction Variants 方向变体
                  </h4>
                  <div class="flex flex-col gap-md">
                    <div>
                      <span class="text-muted-foreground fs-xs mb-margin-xs block">Padding</span>
                      <div class="flex flex-wrap gap-md">
                        <div
                          v-for="item in marginDirMap"
                          :key="'p-' + item.dir"
                          class="flex flex-col gap-xs"
                        >
                          <span class="text-muted-foreground fs-xs">
                            {{ item.label }}
                          </span>
                          <div
                            class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-primary/20 hover:text-primary active:scale-95 text-muted-foreground"
                            @click="copyToClipboard(`p${item.dir}-padding-md`)"
                          >
                            p{{ item.dir }}-padding-md
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span class="text-muted-foreground fs-xs mb-margin-xs block">Margin</span>
                      <div class="flex flex-wrap gap-md">
                        <div
                          v-for="item in marginDirMap"
                          :key="'m-' + item.dir"
                          class="flex flex-col gap-xs"
                        >
                          <span class="text-muted-foreground fs-xs">
                            {{ item.label }}
                          </span>
                          <div
                            class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-primary/20 hover:text-primary active:scale-95 text-muted-foreground"
                            @click="copyToClipboard(`m${item.dir}-margin-md`)"
                          >
                            m{{ item.dir }}-margin-md
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- Radius Section -->
          <Card class="component-border hover:shadow-md transition-all duration-scale-lg">
            <template #title>
              <div class="flex items-center gap-sm">
                <Icons
                  name="i-lucide-square"
                  class="text-primary"
                />
                <span>Border Radius 圆角阶梯</span>
                <Tag
                  value="9 scales"
                  severity="secondary"
                />
              </div>
            </template>
            <template #content>
              <div class="flex flex-col gap-md">
                <p class="text-muted-foreground fs-sm">
                  基于
                  <span class="bg-muted px-padding-xs rounded">radius</span>
                  ×
                  <span class="bg-muted px-padding-xs rounded">RADIUS_SCALE_RATIOS</span>
                  动态计算
                </p>
                <div class="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-md">
                  <div
                    v-for="item in radiusItems"
                    :key="item.key"
                    class="flex flex-col items-center gap-sm p-padding-md surface-item rounded-scale-md hover:bg-muted/60 dark:hover:bg-muted/40 transition-colors duration-scale-lg cursor-pointer group"
                    @click="copyToClipboard(item.unoClass)"
                  >
                    <div
                      class="w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] bg-primary/80 transition-all group-hover:scale-110"
                      :style="{ borderRadius: `var(${item.cssVar})` }"
                    />
                    <Tag
                      :value="item.key"
                      severity="info"
                      class="group-hover:bg-accent group-hover:text-accent-foreground"
                    />
                    <span class="font-mono fs-xs text-muted-foreground">{{ item.ratio }}×</span>
                    <span class="font-mono fs-xs text-center text-foreground">
                      {{ item.unoClass }}
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- Transition Duration Section -->
          <Card class="component-border hover:shadow-md transition-all duration-scale-lg">
            <template #title>
              <div class="flex items-center gap-sm">
                <Icons
                  name="i-lucide-timer"
                  class="text-primary"
                />
                <span>Transition Duration 过渡时长阶梯</span>
                <Tag
                  value="9 scales"
                  severity="secondary"
                />
              </div>
            </template>
            <template #content>
              <div class="flex flex-col gap-md">
                <p class="text-muted-foreground fs-sm">
                  固定毫秒值，遵循 Material Design 动效时长指南
                </p>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                  <div
                    v-for="item in transitionItems"
                    :key="item.key"
                    class="flex items-center gap-md p-padding-md surface-item rounded-scale-md hover:bg-muted/60 dark:hover:bg-muted/40 transition-colors duration-scale-lg cursor-pointer group"
                    @click="copyToClipboard(item.unoClass)"
                  >
                    <div class="flex flex-col gap-xs flex-1">
                      <div class="flex items-center gap-sm">
                        <Tag
                          :value="item.key"
                          severity="info"
                        />
                        <span class="font-mono fs-sm text-foreground">{{ item.value }}ms</span>
                      </div>
                      <span class="text-muted-foreground fs-xs">
                        {{ item.description }}
                      </span>
                      <span class="font-mono fs-xs text-primary">
                        {{ item.unoClass }}
                      </span>
                    </div>
                    <div
                      class="w-[var(--spacing-2xl)] h-[var(--spacing-2xl)] bg-primary rounded-scale-md group-hover:translate-x-[var(--spacing-sm)] group-hover:bg-accent-hover"
                      :style="{
                        transitionDuration: `var(${item.cssVar})`,
                        transitionProperty: 'all',
                      }"
                    />
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- Layout Dimensions Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-xl">
            <Card class="component-border h-full hover:shadow-md transition-all duration-scale-lg">
              <template #title>
                <div class="flex items-center gap-sm">
                  <Icons
                    name="i-lucide-layout"
                    class="text-primary"
                  />
                  <span>Layout Dimensions 布局尺寸</span>
                  <Tag
                    :value="`${layoutItems.length} vars`"
                    severity="secondary"
                  />
                </div>
              </template>
              <template #content>
                <div class="flex flex-col gap-md">
                  <p class="text-muted-foreground fs-sm">固定像素值，用于布局区域尺寸控制</p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div
                      v-for="item in layoutItems"
                      :key="item.key"
                      class="flex flex-col gap-sm p-padding-md surface-item rounded-scale-md hover:bg-muted/60 dark:hover:bg-muted/40 transition-colors duration-scale-lg"
                    >
                      <div class="flex items-center justify-between">
                        <span class="font-medium text-foreground fs-xs">
                          {{ item.description }}
                        </span>
                        <Tag
                          :value="`${currentPreset[item.key as keyof typeof currentPreset]}px`"
                          severity="secondary"
                        />
                      </div>
                      <div class="flex flex-wrap gap-xs">
                        <div
                          class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-primary/20 hover:text-primary active:scale-95 text-muted-foreground w-fit"
                          @click="copyToClipboard(`var(${item.cssVar})`, item.cssVar)"
                        >
                          {{ item.cssVar }}
                        </div>
                        <div
                          class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-success/20 hover:text-success active:scale-95 text-muted-foreground w-fit"
                          @click="copyToClipboard(item.unoClass)"
                        >
                          {{ item.unoClass }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </Card>

            <!-- Base Variables Section -->
            <Card class="component-border h-full hover:shadow-md transition-all duration-scale-lg">
              <template #title>
                <div class="flex items-center gap-sm">
                  <Icons
                    name="i-lucide-database"
                    class="text-primary"
                  />
                  <span>Base Variables 基础变量</span>
                  <Tag
                    :value="`${baseVarItems.length} vars`"
                    severity="secondary"
                  />
                </div>
              </template>
              <template #content>
                <div class="flex flex-col gap-md">
                  <p class="text-muted-foreground fs-sm">
                    SSOT 定义的基础全局变量类名 (SIZE_BASE_VAR_KEYS)
                  </p>
                  <div class="grid grid-cols-1 gap-md">
                    <div
                      v-for="item in baseVarItems"
                      :key="item.key"
                      class="flex flex-col gap-sm p-padding-md surface-item rounded-scale-md hover:bg-muted/60 dark:hover:bg-muted/40 transition-colors duration-scale-lg"
                    >
                      <div class="flex items-center justify-between">
                        <span class="font-medium text-foreground">
                          {{ item.description }}
                        </span>
                        <span class="font-mono text-primary fs-sm">{{ item.key }}</span>
                      </div>
                      <div class="flex flex-wrap gap-xs">
                        <div
                          class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-primary/20 hover:text-primary active:scale-95 text-muted-foreground w-fit"
                          @click="copyToClipboard(`var(${item.cssVar})`, item.cssVar)"
                        >
                          {{ item.cssVar }}
                        </div>
                        <div
                          class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-success/20 hover:text-success active:scale-95 text-muted-foreground w-fit"
                          @click="copyToClipboard(item.unoClass)"
                        >
                          {{ item.unoClass }}
                        </div>
                      </div>
                      <!-- Preview -->
                      <div
                        class="mt-margin-xs p-container-padding bg-primary/10 rounded-scale-sm border border-dashed border-primary/30"
                      >
                        <div
                          class="bg-primary/20 h-8 flex items-center justify-center fs-xs text-primary"
                        >
                          Content with p-container-padding
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </div>

          <!-- Size Presets Section -->
          <Card class="component-border hover:shadow-md transition-all duration-scale-lg">
            <template #title>
              <div class="flex items-center gap-sm">
                <Icons
                  name="i-lucide-settings"
                  class="text-primary"
                />
                <span>Size Presets 尺寸预设</span>
                <Tag
                  :value="`${SIZE_PRESETS.length} presets`"
                  severity="secondary"
                />
              </div>
            </template>
            <template #content>
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-lg">
                <div
                  v-for="preset in SIZE_PRESETS"
                  :key="preset.name"
                  class="flex flex-col gap-md p-padding-lg surface-item rounded-scale-lg component-border hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-all duration-scale-lg"
                >
                  <div class="flex items-center justify-between">
                    <h4 class="fs-sm font-semibold text-foreground mb-margin-xs">
                      {{ preset.label }}
                    </h4>
                    <Tag
                      :value="preset.name"
                      :severity="preset.name === 'comfortable' ? 'success' : 'secondary'"
                    />
                  </div>
                  <div class="grid grid-cols-2 gap-sm fs-sm">
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">radius:</span>
                      <span class="font-mono">{{ preset.radius }}rem</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">spacingBase:</span>
                      <span class="font-mono">{{ preset.spacingBase }}px</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">fontSizeBase:</span>
                      <span class="font-mono">{{ preset.fontSizeBase }}px</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">headerHeight:</span>
                      <span class="font-mono">{{ preset.headerHeight }}px</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">sidebarWidth:</span>
                      <span class="font-mono">{{ preset.sidebarWidth }}px</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-muted-foreground">tabsHeight:</span>
                      <span class="font-mono">{{ preset.tabsHeight }}px</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- Quick Reference -->
          <Card
            class="component-border bg-gradient-to-br from-primary/5 to-accent/5 hover:shadow-md transition-all duration-scale-lg"
          >
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
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
                <div class="flex flex-col gap-sm">
                  <h4 class="fs-sm font-semibold text-foreground mb-margin-xs">
                    字体大小 (Font Size)
                  </h4>
                  <div
                    class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                    @click="copyToClipboard('fs-{scale}')"
                  >
                    fs-{scale}
                  </div>
                  <div
                    class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                    @click="copyToClipboard('text-{scale}')"
                  >
                    text-{scale}
                  </div>
                </div>
                <div class="flex flex-col gap-sm">
                  <h4 class="fs-sm font-semibold text-foreground mb-margin-xs">间距 (Spacing)</h4>
                  <div
                    class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                    @click="copyToClipboard('p-padding-{scale}')"
                  >
                    p-padding-{scale}
                  </div>
                  <div
                    class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                    @click="copyToClipboard('gap-{scale}')"
                  >
                    gap-{scale}
                  </div>
                  <div
                    class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                    @click="copyToClipboard('gap-x-{scale}')"
                  >
                    gap-x-{scale}
                  </div>
                  <div
                    class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                    @click="copyToClipboard('scroll-m-gap-{scale}')"
                  >
                    scroll-m-gap-{scale}
                  </div>
                  <div
                    class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                    @click="copyToClipboard('m-gap-{scale}')"
                  >
                    m-gap-{scale}
                  </div>
                  <div
                    class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                    @click="copyToClipboard('gap-scale-{scale}')"
                  >
                    gap-scale-{scale}
                  </div>
                  <div
                    class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                    @click="copyToClipboard('m-margin-{scale}')"
                  >
                    m-margin-{scale}
                  </div>
                </div>
                <div class="flex flex-col gap-sm">
                  <h4 class="fs-sm font-semibold text-foreground mb-margin-xs">
                    圆角 (Border Radius)
                  </h4>
                  <div
                    class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                    @click="copyToClipboard('rounded-scale-{scale}')"
                  >
                    rounded-scale-{scale}
                  </div>
                </div>
                <div class="flex flex-col gap-sm">
                  <h4 class="fs-sm font-semibold text-foreground mb-margin-xs">
                    过渡动画 (Transition)
                  </h4>
                  <div
                    class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                    @click="copyToClipboard('duration-scale-{scale}')"
                  >
                    duration-scale-{scale}
                  </div>
                </div>
              </div>
              <p class="mt-margin-md text-muted-foreground fs-sm">
                <span class="font-mono bg-muted px-padding-xs rounded">{scale}</span>
                = xs | sm | md | lg | xl | 2xl | 3xl | 4xl | 5xl
              </p>
              <p class="mt-margin-xs text-muted-foreground fs-xs">
                <span class="bg-muted px-padding-xs rounded font-mono">m-gap-*</span>
                适合作为与
                <span class="bg-muted px-padding-xs rounded font-mono">gap-*</span>
                成对使用的「语义化外间距」；若仅需普通 margin，可使用
                <span class="bg-muted px-padding-xs rounded font-mono">m-margin-*</span>
                。
              </p>
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
