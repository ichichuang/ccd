<script setup lang="ts">
import { computed } from 'vue'
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

// Copy to clipboard utility
function copyToClipboard(text: string, label?: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      window.$message?.success(`已复制: ${label || text}`)
    })
    .catch(() => {
      window.$message?.error('复制失败')
    })
}

// Font size categories
const fontSizeItems = computed(() =>
  SIZE_SCALE_KEYS.map(key => ({
    key,
    cssVar: `--font-size-${key}`,
    unoClass: `fs-${key}`,
    textClass: `text-${key}`,
    ratio: FONT_SCALE_RATIOS[key],
    example:
      key === 'xs'
        ? 'Extra Small'
        : key === 'sm'
          ? 'Small Text'
          : key === 'md'
            ? 'Medium (Base)'
            : key === 'lg'
              ? 'Large Text'
              : key === 'xl'
                ? 'Extra Large'
                : key === '2xl'
                  ? '2X Large'
                  : key === '3xl'
                    ? '3X Large'
                    : key === '4xl'
                      ? '4X Large'
                      : '5X Large',
  }))
)

// Spacing categories
const spacingItems = computed(() =>
  SIZE_SCALE_KEYS.map(key => ({
    key,
    cssVar: `--spacing-${key}`,
    paddingClass: `p-padding-${key}`,
    marginClass: `m-margin-${key}`,
    gapClass: `gap-gap-${key}`,
    scaleClass: `p-scale-${key}`,
    ratio: SPACING_SCALE_RATIOS[key],
    units: SPACING_SCALE_RATIOS[key],
  }))
)

// Radius categories
const radiusItems = computed(() =>
  SIZE_SCALE_KEYS.map(key => ({
    key,
    cssVar: `--radius-${key}`,
    unoClass: `rounded-scale-${key}`,
    ratio: RADIUS_SCALE_RATIOS[key],
  }))
)

// Transition categories
const transitionItems = computed(() =>
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
const layoutItems = computed(() =>
  LAYOUT_DIMENSION_KEYS.map(key => {
    const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
    const isWidth = LAYOUT_WIDTH_KEYS.includes(key)
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

// Current preset (comfortable as example)
const currentPreset = computed(
  () => SIZE_PRESETS.find(p => p.name === 'comfortable') || SIZE_PRESETS[1]
)
</script>

<template>
  <CScrollbar class="h-full p-padding-lg bg-surface-ground">
    <div class="max-w-7xl mx-auto flex flex-col gap-gap-xl">
      <!-- Header -->
      <div class="flex flex-col gap-gap-xs">
        <div class="flex items-center gap-gap-md">
          <div class="p-3 bg-primary/10 rounded-scale-lg">
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

      <!-- Font Size Section -->
      <Card class="border border-border">
        <template #title>
          <div class="flex items-center gap-gap-sm">
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
          <div class="flex flex-col gap-gap-md">
            <p class="text-muted-foreground fs-sm">
              基于 <code class="bg-muted px-1 rounded">fontSizeBase</code> 与
              <code class="bg-muted px-1 rounded">FONT_SCALE_RATIOS</code> 动态计算
            </p>
            <div class="overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="border-b border-border">
                    <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                      Scale
                    </th>
                    <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                      CSS Variable
                    </th>
                    <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                      UnoCSS Class
                    </th>
                    <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                      Ratio
                    </th>
                    <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                      Preview
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in fontSizeItems"
                    :key="item.key"
                    class="border-b border-border/50 hover:bg-muted/30 transition-colors"
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
                    <td class="p-padding-sm flex gap-gap-xs flex-wrap">
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
                      <span :class="`fs-${item.key}`">{{ item.example }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>
      </Card>

      <!-- Spacing Section -->
      <Card class="border border-border">
        <template #title>
          <div class="flex items-center gap-gap-sm">
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
          <div class="flex flex-col gap-gap-md">
            <p class="text-muted-foreground fs-sm">
              基于 <code class="bg-muted px-1 rounded">spacingBase</code> ×
              <code class="bg-muted px-1 rounded">SPACING_SCALE_RATIOS</code> 动态计算
            </p>
            <div class="overflow-x-auto">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="border-b border-border">
                    <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                      Scale
                    </th>
                    <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                      CSS Variable
                    </th>
                    <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                      Padding Classes
                    </th>
                    <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                      Units
                    </th>
                    <th class="text-left p-padding-sm text-muted-foreground fs-sm font-medium">
                      Preview
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in spacingItems"
                    :key="item.key"
                    class="border-b border-border/50 hover:bg-muted/30 transition-colors"
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
                      <div class="flex gap-gap-xs flex-wrap">
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
            </div>

            <!-- Spacing Direction Examples -->
            <div class="mt-margin-md p-padding-md bg-muted/30 rounded-scale-md">
              <h4 class="fs-sm font-semibold mb-margin-sm text-foreground">
                Direction Variants 方向变体
              </h4>
              <div class="flex flex-wrap gap-gap-md">
                <div
                  v-for="dir in ['', 't', 'b', 'l', 'r', 'x', 'y']"
                  :key="dir"
                  class="flex flex-col gap-gap-xs"
                >
                  <span class="text-muted-foreground fs-xs">{{ dir || 'all' }}</span>
                  <Button
                    :label="`p${dir}-padding-md`"
                    severity="secondary"
                    outlined
                    size="small"
                    class="font-mono"
                    @click="copyToClipboard(`p${dir}-padding-md`)"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Radius Section -->
      <Card class="border border-border">
        <template #title>
          <div class="flex items-center gap-gap-sm">
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
          <div class="flex flex-col gap-gap-md">
            <p class="text-muted-foreground fs-sm">
              基于 <code class="bg-muted px-1 rounded">radius</code> ×
              <code class="bg-muted px-1 rounded">RADIUS_SCALE_RATIOS</code> 动态计算
            </p>
            <div class="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-gap-md">
              <div
                v-for="item in radiusItems"
                :key="item.key"
                class="flex flex-col items-center gap-gap-sm p-padding-md bg-muted/20 rounded-scale-md hover:bg-muted/40 transition-colors cursor-pointer group"
                @click="copyToClipboard(item.unoClass)"
              >
                <div
                  class="w-16 h-16 bg-primary/80 transition-all group-hover:scale-110"
                  :style="{ borderRadius: `var(${item.cssVar})` }"
                />
                <Tag
                  :value="item.key"
                  severity="info"
                  class="group-hover:bg-primary group-hover:text-primary-foreground"
                />
                <span class="font-mono fs-xs text-muted-foreground">{{ item.ratio }}×</span>
                <span class="font-mono fs-xs text-center text-foreground">{{ item.unoClass }}</span>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Transition Duration Section -->
      <Card class="border border-border">
        <template #title>
          <div class="flex items-center gap-gap-sm">
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
          <div class="flex flex-col gap-gap-md">
            <p class="text-muted-foreground fs-sm">固定毫秒值，遵循 Material Design 动效时长指南</p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap-md">
              <div
                v-for="item in transitionItems"
                :key="item.key"
                class="flex items-center gap-gap-md p-padding-md bg-muted/20 rounded-scale-md hover:bg-muted/40 transition-colors cursor-pointer group"
                @click="copyToClipboard(item.unoClass)"
              >
                <div class="flex flex-col gap-gap-xs flex-1">
                  <div class="flex items-center gap-gap-sm">
                    <Tag
                      :value="item.key"
                      severity="info"
                    />
                    <span class="font-mono fs-sm text-foreground">{{ item.value }}ms</span>
                  </div>
                  <span class="text-muted-foreground fs-xs">{{ item.description }}</span>
                  <span class="font-mono fs-xs text-primary">{{ item.unoClass }}</span>
                </div>
                <div
                  class="w-12 h-12 bg-primary rounded-scale-md group-hover:translate-x-2 group-hover:bg-primary-hover"
                  :style="{ transitionDuration: `var(${item.cssVar})`, transitionProperty: 'all' }"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Layout Dimensions Section -->
      <Card class="border border-border">
        <template #title>
          <div class="flex items-center gap-gap-sm">
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
          <div class="flex flex-col gap-gap-md">
            <p class="text-muted-foreground fs-sm">固定像素值，用于布局区域尺寸控制</p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap-md">
              <div
                v-for="item in layoutItems"
                :key="item.key"
                class="flex flex-col gap-gap-sm p-padding-md bg-muted/20 rounded-scale-md hover:bg-muted/40 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <span class="font-medium text-foreground">{{ item.description }}</span>
                  <Tag
                    :value="`${currentPreset[item.key as keyof typeof currentPreset]}px`"
                    severity="secondary"
                  />
                </div>
                <div class="flex flex-wrap gap-gap-xs">
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
      <Card class="border border-border">
        <template #title>
          <div class="flex items-center gap-gap-sm">
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
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-gap-lg">
            <div
              v-for="preset in SIZE_PRESETS"
              :key="preset.name"
              class="flex flex-col gap-gap-md p-padding-lg bg-muted/20 rounded-scale-lg border border-border/50"
            >
              <div class="flex items-center justify-between">
                <h3 class="fs-lg font-semibold text-foreground">{{ preset.label }}</h3>
                <Tag
                  :value="preset.name"
                  :severity="preset.name === 'comfortable' ? 'success' : 'secondary'"
                />
              </div>
              <div class="grid grid-cols-2 gap-gap-sm fs-sm">
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
      <Card class="border border-border bg-gradient-to-br from-primary/5 to-accent/5">
        <template #title>
          <div class="flex items-center gap-gap-sm">
            <Icons
              name="i-lucide-zap"
              class="text-primary"
            />
            <span>Quick Reference 快速参考</span>
          </div>
        </template>
        <template #content>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gap-lg">
            <div class="flex flex-col gap-gap-sm">
              <h4 class="font-semibold text-foreground">Font Size</h4>
              <code
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('fs-{scale}')"
                >fs-{scale}</code
              >
              <code
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('text-{scale}')"
                >text-{scale}</code
              >
            </div>
            <div class="flex flex-col gap-gap-sm">
              <h4 class="font-semibold text-foreground">Spacing</h4>
              <code
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('p-padding-{scale}')"
                >p-padding-{scale}</code
              >
              <code
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('gap-gap-{scale}')"
                >gap-gap-{scale}</code
              >
              <code
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('m-margin-{scale}')"
                >m-margin-{scale}</code
              >
            </div>
            <div class="flex flex-col gap-gap-sm">
              <h4 class="font-semibold text-foreground">Border Radius</h4>
              <code
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('rounded-scale-{scale}')"
                >rounded-scale-{scale}</code
              >
            </div>
            <div class="flex flex-col gap-gap-sm">
              <h4 class="font-semibold text-foreground">Transition</h4>
              <code
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('duration-scale-{scale}')"
                >duration-scale-{scale}</code
              >
            </div>
          </div>
          <p class="mt-margin-md text-muted-foreground fs-sm">
            <span class="font-mono bg-muted px-1 rounded">{scale}</span> = xs | sm | md | lg | xl |
            2xl | 3xl | 4xl | 5xl
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
