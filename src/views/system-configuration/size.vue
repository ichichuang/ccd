<script setup lang="ts">
import { useSizeStore } from '@/stores/modules/size'
import { SIZE_PRESETS } from '@/constants/size'
import { SIZE_SCALE_KEYS } from '@/constants/sizeScale'

const sizeStore = useSizeStore()

// 获取当前 CSS 变量值（从 DOM 读取）
function getCssVar(name: string): string {
  if (typeof window === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

// 计算当前预设的所有变量
const currentVars = computed(() => {
  const preset = sizeStore.currentPreset
  return {
    radius: getCssVar('--radius'),
    spacingUnit: getCssVar('--spacing-unit'),
    containerPadding: getCssVar('--container-padding'),
    fontSizeBase: preset.fontSizeBase,
    fontSizes: SIZE_SCALE_KEYS.map(key => ({
      key,
      value: getCssVar(`--font-size-${key}`),
    })),
    spacings: SIZE_SCALE_KEYS.map(key => ({
      key,
      value: getCssVar(`--spacing-${key}`),
    })),
  }
})

// 方向控制示例（用于阶梯系统）
const paddingDirections = [
  { key: '', label: '全方向', example: 'p-scale-md' },
  { key: 't', label: 'Top', example: 'pt-scale-md' },
  { key: 'b', label: 'Bottom', example: 'pb-scale-lg' },
  { key: 'l', label: 'Left', example: 'pl-scale-sm' },
  { key: 'r', label: 'Right', example: 'pr-scale-xl' },
  { key: 'x', label: 'X轴', example: 'px-scale-2xl' },
  { key: 'y', label: 'Y轴', example: 'py-scale-3xl' },
]

const marginDirections = [
  { key: '', label: '全方向', example: 'm-scale-md' },
  { key: 't', label: 'Top', example: 'mt-scale-md' },
  { key: 'b', label: 'Bottom', example: 'mb-scale-lg' },
  { key: 'l', label: 'Left', example: 'ml-scale-sm' },
  { key: 'r', label: 'Right', example: 'mr-scale-xl' },
  { key: 'x', label: 'X轴', example: 'mx-scale-2xl' },
  { key: 'y', label: 'Y轴', example: 'my-scale-3xl' },
]
</script>

<template>
  <div
    class="h-screen max-h-screen w-full overflow-y-auto overflow-x-hidden bg-background text-foreground transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto p-padding pb-paddingl flex flex-col gap-unitl">
      <!-- 1. 头部：标题 + 模式切换 -->
      <header
        class="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-unit pb-padding border-b border-border"
      >
        <div>
          <h1 class="text-2xl font-bold flex items-center gap-unit">
            <span class="i-lucide-ruler w-7 h-7 text-primary" />
            CCD 尺寸系统实验室
          </h1>
          <p class="text-muted-foreground text-sm mt-1">
            当前模式:
            <span class="text-primary font-mono font-bold">{{ sizeStore.sizeName }}</span>
            · 基准字体:
            <span class="text-foreground font-mono font-bold"
              >{{ currentVars.fontSizeBase }}px</span
            >
            · 间距基数:
            <span class="text-foreground font-mono font-bold"
              >{{ sizeStore.currentPreset.spacingBase }}px</span
            >
          </p>
        </div>
        <div class="flex gap-unit">
          <button
            v-for="preset in SIZE_PRESETS"
            :key="preset.name"
            type="button"
            class="px-padding py-paddings rounded-md text-sm font-medium border transition-all"
            :class="
              sizeStore.sizeName === preset.name
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-border hover:border-primary/50'
            "
            @click="sizeStore.setSize(preset.name)"
          >
            {{ preset.label }}
          </button>
        </div>
      </header>

      <!-- 2. 当前预设信息 -->
      <section class="rounded-lg border border-border bg-card p-padding">
        <h2 class="text-lg font-semibold mb-padding">当前预设变量 (CSS Variables)</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-unit">
          <div class="p-padding rounded-md border border-border bg-muted/30">
            <div class="text-xs text-muted-foreground mb-paddings">基础变量</div>
            <div class="space-y-1 text-xs font-mono">
              <div class="flex justify-between">
                <span class="text-muted-foreground">--radius:</span>
                <span class="text-foreground">{{ currentVars.radius }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">--spacing-unit:</span>
                <span class="text-foreground">{{ currentVars.spacingUnit }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">--container-padding:</span>
                <span class="text-foreground">{{ currentVars.containerPadding }}</span>
              </div>
            </div>
          </div>
          <div class="p-padding rounded-md border border-border bg-muted/30">
            <div class="text-xs text-muted-foreground mb-paddings">Store Getters (JS)</div>
            <div class="space-y-1 text-xs font-mono">
              <div class="flex justify-between">
                <span class="text-muted-foreground">getFontSizeValue:</span>
                <span class="text-foreground">{{ sizeStore.getFontSizeValue }}px</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">getFontSizesValue:</span>
                <span class="text-foreground">{{ sizeStore.getFontSizesValue }}px</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">getGap:</span>
                <span class="text-foreground">{{ sizeStore.getGap }}px</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">getPaddingsValue:</span>
                <span class="text-foreground">{{ sizeStore.getPaddingsValue }}px</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. 圆角系统 -->
      <section class="rounded-lg border border-border bg-card p-padding">
        <h2 class="text-lg font-semibold mb-padding">圆角系统 (Border Radius)</h2>
        <p class="text-sm text-muted-foreground mb-padding">
          使用 <code class="bg-muted px-1 rounded-sm text-xs">rounded-lg</code>、
          <code class="bg-muted px-1 rounded-sm text-xs">rounded-md</code>、
          <code class="bg-muted px-1 rounded-sm text-xs">rounded-sm</code>，基于
          <code class="bg-muted px-1 rounded-sm text-xs">var(--radius)</code>
        </p>
        <div class="flex gap-unit items-center">
          <div class="flex flex-col items-center gap-paddings">
            <div class="w-20 h-20 rounded-sm bg-primary/20 border-2 border-primary" />
            <span class="text-xs font-mono text-muted-foreground">rounded-sm</span>
          </div>
          <div class="flex flex-col items-center gap-paddings">
            <div class="w-20 h-20 rounded-md bg-primary/20 border-2 border-primary" />
            <span class="text-xs font-mono text-muted-foreground">rounded-md</span>
          </div>
          <div class="flex flex-col items-center gap-paddings">
            <div class="w-20 h-20 rounded-lg bg-primary/20 border-2 border-primary" />
            <span class="text-xs font-mono text-muted-foreground">rounded-lg</span>
          </div>
        </div>
      </section>

      <!-- 4. 字体阶梯 -->
      <section class="rounded-lg border border-border bg-card p-padding">
        <h2 class="text-lg font-semibold mb-padding">字体阶梯 (Font Scale: xs → 5xl)</h2>
        <p class="text-sm text-muted-foreground mb-padding">
          使用 <code class="bg-muted px-1 rounded-sm text-xs">fs-xs</code> 到
          <code class="bg-muted px-1 rounded-sm text-xs">fs-5xl</code>，基于
          <code class="bg-muted px-1 rounded-sm text-xs">var(--font-size-*)</code>
        </p>
        <div class="space-y-unit">
          <div
            v-for="item in currentVars.fontSizes"
            :key="item.key"
            class="flex items-center gap-unit p-padding rounded-md border border-border bg-muted/30"
          >
            <span class="w-16 text-xs font-mono text-muted-foreground text-right"
              >fs-{{ item.key }}</span
            >
            <div
              :class="`fs-${item.key}`"
              class="flex-1 font-bold text-primary overflow-hidden text-ellipsis whitespace-nowrap"
            >
              The quick brown fox jumps over the lazy dog
            </div>
            <span class="w-20 text-xs font-mono text-muted-foreground text-right">{{
              item.value
            }}</span>
          </div>
        </div>
      </section>

      <!-- 5. 间距阶梯：Padding -->
      <section class="rounded-lg border border-border bg-card p-padding">
        <h2 class="text-lg font-semibold mb-padding">间距阶梯：Padding (p-scale-*)</h2>
        <p class="text-sm text-muted-foreground mb-padding">
          使用 <code class="bg-muted px-1 rounded-sm text-xs">p-scale-xs</code> 到
          <code class="bg-muted px-1 rounded-sm text-xs">p-scale-5xl</code>，基于
          <code class="bg-muted px-1 rounded-sm text-xs">var(--spacing-*)</code>
        </p>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-unit mb-unitl">
          <div
            v-for="item in currentVars.spacings"
            :key="item.key"
            class="p-padding rounded-md border border-border bg-muted/30"
          >
            <div class="text-xs text-muted-foreground mb-paddings">p-scale-{{ item.key }}</div>
            <div
              :class="`p-scale-${item.key}`"
              class="rounded bg-primary/20 border border-primary/30 min-h-12"
            />
            <div class="text-xs font-mono text-muted-foreground mt-paddings">{{ item.value }}</div>
          </div>
        </div>
        <div>
          <h3 class="text-sm font-semibold mb-padding">方向控制 (Directional Padding)</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-unit">
            <div
              v-for="dir in paddingDirections"
              :key="dir.key"
              class="p-padding rounded-md border border-border bg-muted/30"
            >
              <div class="text-xs text-muted-foreground mb-paddings">{{ dir.label }}</div>
              <div
                :class="dir.example"
                class="rounded bg-primary/20 border border-primary/30 min-h-12"
              />
              <div
                class="text-xs font-mono text-muted-foreground mt-paddings text-center break-all"
              >
                {{ dir.example }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. 间距阶梯：Margin -->
      <section class="rounded-lg border border-border bg-card p-padding">
        <h2 class="text-lg font-semibold mb-padding">间距阶梯：Margin (m-scale-*)</h2>
        <p class="text-sm text-muted-foreground mb-padding">
          使用 <code class="bg-muted px-1 rounded-sm text-xs">m-scale-xs</code> 到
          <code class="bg-muted px-1 rounded-sm text-xs">m-scale-5xl</code>，基于
          <code class="bg-muted px-1 rounded-sm text-xs">var(--spacing-*)</code>
        </p>
        <div class="flex flex-col gap-unit mb-unitl">
          <div
            v-for="item in currentVars.spacings"
            :key="item.key"
            class="p-padding rounded-md border border-border bg-muted/30"
          >
            <div class="flex items-center justify-between mb-paddings">
              <div class="text-sm font-semibold">m-scale-{{ item.key }}</div>
              <div class="text-xs font-mono text-muted-foreground">{{ item.value }}</div>
            </div>
            <div class="rounded bg-muted/50 border border-border overflow-visible">
              <div
                :class="`mx-scale-${item.key}`"
                class="rounded bg-primary/20 border border-primary/30 h-16 flex items-center justify-center"
              >
                <span class="text-xs font-mono text-primary">内容区域</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 class="text-sm font-semibold mb-padding">方向控制 (Directional Margin)</h3>
          <div class="flex flex-col gap-unit">
            <div
              v-for="dir in marginDirections"
              :key="dir.key"
              class="p-padding rounded-md border border-border bg-muted/30"
            >
              <div class="flex items-center justify-between mb-paddings">
                <div class="text-sm font-semibold">{{ dir.label }}</div>
                <div class="text-xs font-mono text-muted-foreground">{{ dir.example }}</div>
              </div>
              <div class="rounded bg-muted/50 border border-border overflow-visible">
                <div
                  :class="dir.example"
                  class="rounded bg-primary/20 border border-primary/30 h-16 flex items-center justify-center"
                >
                  <span class="text-xs font-mono text-primary">内容区域</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. 间距阶梯：Gap -->
      <section class="rounded-lg border border-border bg-card p-padding">
        <h2 class="text-lg font-semibold mb-padding">间距阶梯：Gap (gap-scale-*)</h2>
        <p class="text-sm text-muted-foreground mb-padding">
          使用 <code class="bg-muted px-1 rounded-sm text-xs">gap-scale-xs</code> 到
          <code class="bg-muted px-1 rounded-sm text-xs">gap-scale-5xl</code>，基于
          <code class="bg-muted px-1 rounded-sm text-xs">var(--spacing-*)</code>
        </p>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-unit mb-unitl">
          <div
            v-for="item in currentVars.spacings"
            :key="item.key"
            class="p-padding rounded-md border border-border bg-muted/30"
          >
            <div class="text-xs text-muted-foreground mb-paddings">gap-scale-{{ item.key }}</div>
            <div :class="`flex gap-scale-${item.key} min-h-20 flex-wrap`">
              <div class="w-8 h-8 rounded bg-primary/30 flex-shrink-0" />
              <div class="w-8 h-8 rounded bg-primary/30 flex-shrink-0" />
              <div class="w-8 h-8 rounded bg-primary/30 flex-shrink-0" />
            </div>
            <div class="text-xs font-mono text-muted-foreground mt-paddings">{{ item.value }}</div>
          </div>
        </div>
        <div>
          <h3 class="text-sm font-semibold mb-padding">方向控制 (Directional Gap)</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-unit">
            <div class="p-padding rounded-md border border-border bg-muted/30">
              <div class="text-xs text-muted-foreground mb-paddings">
                gap-x-scale-md (column-gap)
              </div>
              <div class="flex gap-x-scale-md">
                <div class="w-8 h-8 rounded bg-primary/30" />
                <div class="w-8 h-8 rounded bg-primary/30" />
                <div class="w-8 h-8 rounded bg-primary/30" />
              </div>
            </div>
            <div class="p-padding rounded-md border border-border bg-muted/30">
              <div class="text-xs text-muted-foreground mb-paddings">gap-y-scale-lg (row-gap)</div>
              <div class="flex flex-col gap-y-scale-lg">
                <div class="w-full h-8 rounded bg-primary/30" />
                <div class="w-full h-8 rounded bg-primary/30" />
                <div class="w-full h-8 rounded bg-primary/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 8. Script 使用示例 -->
      <section class="rounded-lg border border-border bg-card p-padding">
        <h2 class="text-lg font-semibold mb-padding">Script 中使用 (Store API)</h2>
        <div class="p-padding rounded-md border border-border bg-muted/30">
          <pre
            class="text-xs font-mono text-foreground overflow-x-auto"
          ><code>import { useSizeStore } from '@/stores/modules/size'

const sizeStore = useSizeStore()

// 切换尺寸模式
sizeStore.setSize('compact')  // 或 'comfortable' | 'loose'

// 获取当前预设
const preset = sizeStore.currentPreset
console.log(preset.fontSizeBase)  // 14 | 16 | 18
console.log(preset.spacingBase)   // 3 | 4 | 6

// 使用 Getters
const fontSize = sizeStore.getFontSizeValue      // 当前基准字体
const titleSize = sizeStore.getFontSizesValue    // 标题字体 (+2px)
const gap = sizeStore.getGap                     // 间距 (spacingBase × 4)
const padding = sizeStore.getPaddingsValue       // 内边距 (spacingBase × 4)</code></pre>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* 仅用 UnoCSS 语义类 */
</style>
