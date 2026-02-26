<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import {
  SIZE_SCALE_KEYS,
  FONT_SCALE_RATIOS,
  SPACING_SCALE_RATIOS,
  RADIUS_SCALE_RATIOS,
  TRANSITION_SCALE_VALUES,
} from '@/constants/sizeScale'
import { LAYOUT_DIMENSION_KEYS, SIZE_PRESETS } from '@/constants/size'
import { useSizeStore } from '@/stores/modules/size'

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
    scaleClass: string
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
    scaleClass: `p-scale-${key}`,
    ratio: SPACING_SCALE_RATIOS[key],
    units: SPACING_SCALE_RATIOS[key],
  }))
)

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
const sizeStore = useSizeStore()
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
  <CScrollbar class="h-full p-padding-lg bg-background">
    <div class="w-full max-w-[90vw] mx-auto flex flex-col gap-xl">
      <!-- Header -->
      <div class="flex flex-col gap-xs">
        <div class="flex items-center gap-md">
          <div class="p-padding-md bg-primary/10 rounded-scale-lg">
            <Icons
              name="i-lucide-ruler"
              class="text-primary fs-2xl"
            />
          </div>
          <div>
            <h1 class="fs-2xl font-bold text-foreground">Size System</h1>
            <p class="text-muted-foreground">
              尺寸系统变量完整参考 · 点击任意类名或变量即可自动复制到剪贴板
            </p>
          </div>
        </div>
      </div>

      <!-- Size Store 尺寸 Store -->
      <Card class="component-border">
        <template #title>
          <div class="flex items-center gap-sm">
            <Icons
              name="i-lucide-settings-2"
              class="text-primary"
            />
            <span>Size Store 尺寸 Store</span>
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
              <Button
                v-for="preset in SIZE_PRESETS"
                :key="preset.name"
                :label="preset.label"
                :severity="sizeStore.sizeName === preset.name ? 'primary' : 'secondary'"
                :outlined="sizeStore.sizeName !== preset.name"
                size="small"
                @click="sizeStore.setSize(preset.name)"
              />
            </div>
            <div class="flex flex-wrap gap-md text-muted-foreground fs-sm">
              <span>
                当前:
                <span class="font-mono font-bold text-foreground">{{ sizeStore.sizeName }}</span>
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

      <!-- Font Size Section -->
      <Card class="component-border">
        <template #title>
          <div class="flex items-center gap-sm">
            <Icons
              name="i-lucide-type"
              class="text-primary"
            />
            <span>Font Size 字体大小阶梯</span>
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
                    class="border-b border-solid border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td class="p-padding-sm">
                      <Tag
                        :value="item.key"
                        severity="info"
                      />
                    </td>
                    <td class="p-padding-sm">
                      <Button
                        :label="item.cssVar"
                        severity="secondary"
                        text
                        size="small"
                        class="font-mono"
                        @click="copyToClipboard(`var(${item.cssVar})`, item.cssVar)"
                      />
                    </td>
                    <td class="p-padding-sm flex gap-xs flex-wrap">
                      <Button
                        :label="item.unoClass"
                        severity="success"
                        text
                        size="small"
                        class="font-mono"
                        @click="copyToClipboard(item.unoClass)"
                      />
                      <Button
                        :label="item.textClass"
                        severity="success"
                        text
                        size="small"
                        class="font-mono"
                        @click="copyToClipboard(item.textClass)"
                      />
                    </td>
                    <td class="p-padding-sm font-mono text-muted-foreground">{{ item.ratio }}×</td>
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
      <Card class="component-border">
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
                    class="border-b border-solid border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td class="p-padding-sm">
                      <Tag
                        :value="item.key"
                        severity="info"
                      />
                    </td>
                    <td class="p-padding-sm">
                      <Button
                        :label="item.cssVar"
                        severity="secondary"
                        text
                        size="small"
                        class="font-mono"
                        @click="copyToClipboard(`var(${item.cssVar})`, item.cssVar)"
                      />
                    </td>
                    <td class="p-padding-sm">
                      <div class="flex gap-xs flex-wrap">
                        <Button
                          :label="item.paddingClass"
                          severity="success"
                          text
                          size="small"
                          class="font-mono"
                          @click="copyToClipboard(item.paddingClass)"
                        />
                        <Button
                          :label="item.gapClass"
                          severity="success"
                          text
                          size="small"
                          class="font-mono"
                          @click="copyToClipboard(item.gapClass)"
                        />
                        <Button
                          :label="item.scaleClass"
                          severity="warn"
                          text
                          size="small"
                          class="font-mono"
                          @click="copyToClipboard(item.scaleClass)"
                        />
                      </div>
                    </td>
                    <td class="p-padding-sm font-mono text-muted-foreground">
                      {{ item.units }} unit
                    </td>
                    <td class="p-padding-sm">
                      <div class="inline-flex">
                        <div
                          class="bg-primary/20 border border-primary/50 rounded-scale-xs"
                          :style="{ width: `var(${item.cssVar})`, height: 'var(--spacing-lg)' }"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </CScrollbar>

            <!-- Spacing Direction Examples -->
            <div class="mt-margin-md p-padding-md bg-muted/30 rounded-scale-md">
              <h4 class="fs-sm font-semibold mb-margin-sm text-foreground">
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
                      <Button
                        :label="`p${item.dir}-padding-md`"
                        severity="secondary"
                        outlined
                        size="small"
                        class="font-mono"
                        @click="copyToClipboard(`p${item.dir}-padding-md`)"
                      />
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
                      <Button
                        :label="`m${item.dir}-margin-md`"
                        severity="secondary"
                        outlined
                        size="small"
                        class="font-mono"
                        @click="copyToClipboard(`m${item.dir}-margin-md`)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Radius Section -->
      <Card class="component-border">
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
                class="flex flex-col items-center gap-sm p-padding-md bg-muted/20 rounded-scale-md hover:bg-muted/40 transition-colors cursor-pointer group"
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
      <Card class="component-border">
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
            <p class="text-muted-foreground fs-sm">固定毫秒值，遵循 Material Design 动效时长指南</p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
              <div
                v-for="item in transitionItems"
                :key="item.key"
                class="flex items-center gap-md p-padding-md bg-muted/20 rounded-scale-md hover:bg-muted/40 transition-colors cursor-pointer group"
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
                  :style="{ transitionDuration: `var(${item.cssVar})`, transitionProperty: 'all' }"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Layout Dimensions Section -->
      <Card class="component-border">
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
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
              <div
                v-for="item in layoutItems"
                :key="item.key"
                class="flex flex-col gap-sm p-padding-md bg-muted/20 rounded-scale-md hover:bg-muted/40 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <span class="font-medium text-foreground">
                    {{ item.description }}
                  </span>
                  <Tag
                    :value="`${currentPreset[item.key as keyof typeof currentPreset]}px`"
                    severity="secondary"
                  />
                </div>
                <div class="flex flex-wrap gap-xs">
                  <Button
                    :label="item.cssVar"
                    severity="secondary"
                    text
                    size="small"
                    class="font-mono"
                    @click="copyToClipboard(`var(${item.cssVar})`, item.cssVar)"
                  />
                  <Button
                    :label="item.unoClass"
                    severity="success"
                    text
                    size="small"
                    class="font-mono"
                    @click="copyToClipboard(item.unoClass)"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Size Presets Section -->
      <Card class="component-border">
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
              class="flex flex-col gap-md p-padding-lg bg-muted/20 rounded-scale-lg border border-solid border-border/50"
            >
              <div class="flex items-center justify-between">
                <h3 class="fs-lg font-semibold text-foreground">
                  {{ preset.label }}
                </h3>
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
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
            <div class="flex flex-col gap-sm">
              <h4 class="font-semibold text-foreground">字体大小 (Font Size)</h4>
              <div
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('fs-{scale}')"
              >
                fs-{scale}
              </div>
              <div
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('text-{scale}')"
              >
                text-{scale}
              </div>
            </div>
            <div class="flex flex-col gap-sm">
              <h4 class="font-semibold text-foreground">间距 (Spacing)</h4>
              <div
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('p-padding-{scale}')"
              >
                p-padding-{scale}
              </div>
              <div
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('gap-{scale}')"
              >
                gap-{scale}
              </div>
              <div
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('m-margin-{scale}')"
              >
                m-margin-{scale}
              </div>
            </div>
            <div class="flex flex-col gap-sm">
              <h4 class="font-semibold text-foreground">圆角 (Border Radius)</h4>
              <div
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('rounded-scale-{scale}')"
              >
                rounded-scale-{scale}
              </div>
            </div>
            <div class="flex flex-col gap-sm">
              <h4 class="font-semibold text-foreground">过渡动画 (Transition)</h4>
              <div
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
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
