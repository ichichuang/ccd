<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import { COLOR_FAMILIES } from '@/utils/theme/metadata'

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

// Single token colors
const singleTokens = computed(() =>
  COLOR_FAMILIES.singleTokens.map(token => ({
    token,
    cssVar: `--${token}`,
    bgClass: `bg-${token}`,
    textClass: `text-${token}`,
    borderClass: ['border', 'input', 'ring'].includes(token) ? `border-${token}` : null,
  }))
)

// Pair family colors
const pairFamilies = computed(() =>
  COLOR_FAMILIES.pairFamilies.map(family => ({
    family,
    variants: [
      {
        name: 'DEFAULT',
        cssVar: `--${family}`,
        bgClass: `bg-${family}`,
        textClass: `text-${family}`,
      },
      {
        name: 'foreground',
        cssVar: `--${family}-foreground`,
        bgClass: null,
        textClass: `text-${family}-foreground`,
      },
    ],
  }))
)

// Quad family colors (extended families)
const quadFamilies = computed(() =>
  COLOR_FAMILIES.quadFamilies.map(family => ({
    family,
    variants: [
      {
        name: 'DEFAULT',
        cssVar: `--${family}`,
        bgClass: `bg-${family}`,
        textClass: `text-${family}`,
        borderClass: `border-${family}`,
      },
      {
        name: 'foreground',
        cssVar: `--${family}-foreground`,
        bgClass: null,
        textClass: `text-${family}-foreground`,
      },
      {
        name: 'hover',
        cssVar: `--${family}-hover`,
        bgClass: `bg-${family}-hover`,
        textClass: null,
        borderClass: `border-${family}-hover`,
      },
      {
        name: 'hover-foreground',
        cssVar: `--${family}-hover-foreground`,
        bgClass: null,
        textClass: `text-${family}-hover-foreground`,
      },
      {
        name: 'light',
        cssVar: `--${family}-light`,
        bgClass: `bg-${family}-light`,
        textClass: null,
        borderClass: `border-${family}-light`,
      },
      {
        name: 'light-foreground',
        cssVar: `--${family}-light-foreground`,
        bgClass: null,
        textClass: `text-${family}-light-foreground`,
      },
    ],
  }))
)

/** Sidebar 类名映射：uno.config.ts buildThemeColors 使用 DEFAULT/foreground/primary 等 key，对应 bg-sidebar、bg-sidebar-foreground 等 */
const SIDEBAR_KEY_TO_CLASS: Record<
  keyof typeof COLOR_FAMILIES.sidebar,
  { bgClass: string; textClass: string; borderClass: string | null; copyClass: string }
> = {
  background: {
    bgClass: 'bg-sidebar',
    textClass: 'text-sidebar',
    borderClass: null,
    copyClass: 'bg-sidebar',
  },
  foreground: {
    bgClass: 'bg-sidebar-foreground',
    textClass: 'text-sidebar-foreground',
    borderClass: null,
    copyClass: 'bg-sidebar-foreground',
  },
  primary: {
    bgClass: 'bg-sidebar-primary',
    textClass: 'text-sidebar-primary-foreground',
    borderClass: null,
    copyClass: 'bg-sidebar-primary',
  },
  'primary-foreground': {
    bgClass: 'bg-sidebar-primary-foreground',
    textClass: 'text-sidebar-primary-foreground',
    borderClass: null,
    copyClass: 'bg-sidebar-primary-foreground',
  },
  accent: {
    bgClass: 'bg-sidebar-accent',
    textClass: 'text-sidebar-accent-foreground',
    borderClass: null,
    copyClass: 'bg-sidebar-accent',
  },
  'accent-foreground': {
    bgClass: 'bg-sidebar-accent-foreground',
    textClass: 'text-sidebar-accent-foreground',
    borderClass: null,
    copyClass: 'bg-sidebar-accent-foreground',
  },
  border: {
    bgClass: 'border-4 border-sidebar-border bg-transparent',
    textClass: 'text-sidebar-border',
    borderClass: 'border-sidebar-border',
    copyClass: 'border-sidebar-border',
  },
  ring: {
    bgClass: 'border-4 border-sidebar-ring bg-transparent',
    textClass: 'text-sidebar-ring',
    borderClass: 'border-sidebar-ring',
    copyClass: 'border-sidebar-ring',
  },
}

// Sidebar colors：使用与 uno.config.ts buildThemeColors 一致的类名
const sidebarColors = computed(() =>
  (Object.keys(COLOR_FAMILIES.sidebar) as (keyof typeof COLOR_FAMILIES.sidebar)[]).map(key => {
    const mapping = SIDEBAR_KEY_TO_CLASS[key]
    const varName = COLOR_FAMILIES.sidebar[key]
    return {
      key,
      varName,
      cssVar: `--${varName}`,
      bgClass: mapping.bgClass,
      textClass: mapping.textClass,
      borderClass: mapping.borderClass,
      copyClass: mapping.copyClass,
    }
  })
)

// Opacity variants helper
const opacityVariants = [10, 20, 30, 40, 50, 60, 70, 80, 90] as const
</script>

<template>
  <CScrollbar class="h-full p-padding-lg bg-background">
    <div class="w-full max-w-[90vw] mx-auto flex flex-col gap-xl">
      <!-- Header -->
      <div class="flex flex-col gap-xs">
        <div class="flex items-center gap-md">
          <div class="p-3 bg-primary/10 rounded-scale-lg">
            <Icons
              name="i-lucide-palette"
              class="text-primary fs-2xl"
            />
          </div>
          <div>
            <h1 class="fs-2xl font-bold text-foreground">Color System</h1>
            <p class="text-muted-foreground">
              颜色系统变量完整参考 · 点击任意类名或变量即可自动复制到剪贴板
            </p>
          </div>
        </div>
      </div>

      <!-- Single Token Colors -->
      <Card class="border border-border">
        <template #title>
          <div class="flex items-center gap-sm">
            <Icons
              name="i-lucide-circle"
              class="text-primary"
            />
            <span>Single Tokens 单色令牌</span>
            <Tag
              :value="`${singleTokens.length} colors`"
              severity="secondary"
            />
          </div>
        </template>
        <template #content>
          <div class="flex flex-col gap-md">
            <p class="text-muted-foreground fs-sm">基础颜色变量，直接对应单个 CSS 变量</p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-md">
              <div
                v-for="item in singleTokens"
                :key="item.token"
                class="flex flex-col gap-sm p-padding-md bg-muted/20 rounded-scale-md hover:bg-muted/40 transition-colors"
              >
                <div class="flex items-center gap-sm">
                  <div
                    class="w-10 h-10 rounded-scale-sm border border-border shadow-sm"
                    :class="item.bgClass"
                  />
                  <span class="font-semibold text-foreground">{{ item.token }}</span>
                </div>
                <div class="flex flex-wrap gap-xs">
                  <Button
                    :label="item.cssVar"
                    severity="secondary"
                    text
                    size="small"
                    class="font-mono fs-xs"
                    @click="copyToClipboard(`var(${item.cssVar})`, item.cssVar)"
                  />
                  <Button
                    :label="item.bgClass"
                    severity="success"
                    text
                    size="small"
                    class="font-mono fs-xs"
                    @click="copyToClipboard(item.bgClass)"
                  />
                  <Button
                    v-if="item.borderClass"
                    :label="item.borderClass"
                    severity="warn"
                    text
                    size="small"
                    class="font-mono fs-xs"
                    @click="copyToClipboard(item.borderClass!)"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Pair Family Colors -->
      <Card class="border border-border">
        <template #title>
          <div class="flex items-center gap-sm">
            <Icons
              name="i-lucide-layers"
              class="text-primary"
            />
            <span>Pair Families 成对颜色族</span>
            <Tag
              :value="`${pairFamilies.length} families`"
              severity="secondary"
            />
          </div>
        </template>
        <template #content>
          <div class="flex flex-col gap-md">
            <p class="text-muted-foreground fs-sm">包含 DEFAULT 和 foreground 两个变体</p>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-lg">
              <div
                v-for="family in pairFamilies"
                :key="family.family"
                class="flex flex-col gap-md p-padding-lg bg-muted/20 rounded-scale-lg border border-border/50"
              >
                <h3 class="fs-lg font-semibold text-foreground capitalize flex items-center gap-sm">
                  <div
                    class="w-6 h-6 rounded-full border border-border"
                    :class="`bg-${family.family}`"
                  />
                  {{ family.family }}
                </h3>
                <div class="flex flex-col gap-sm">
                  <div
                    v-for="variant in family.variants"
                    :key="variant.name"
                    class="flex flex-col gap-xs"
                  >
                    <div class="flex items-center gap-sm">
                      <Tag
                        :value="variant.name"
                        severity="info"
                        class="fs-xs"
                      />
                    </div>
                    <div class="flex flex-wrap gap-xs">
                      <Button
                        :label="variant.cssVar"
                        severity="secondary"
                        text
                        size="small"
                        class="font-mono fs-xs"
                        @click="copyToClipboard(`var(${variant.cssVar})`, variant.cssVar)"
                      />
                      <Button
                        v-if="variant.bgClass"
                        :label="variant.bgClass"
                        severity="success"
                        text
                        size="small"
                        class="font-mono fs-xs"
                        @click="copyToClipboard(variant.bgClass!)"
                      />
                      <Button
                        v-if="variant.textClass"
                        :label="variant.textClass"
                        severity="warn"
                        text
                        size="small"
                        class="font-mono fs-xs"
                        @click="copyToClipboard(variant.textClass!)"
                      />
                    </div>
                  </div>
                </div>
                <!-- Preview -->
                <div
                  :class="`bg-${family.family} text-${family.family}-foreground p-padding-md rounded-scale-md text-center`"
                >
                  预览文本
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Quad Family Colors -->
      <Card class="border border-border">
        <template #title>
          <div class="flex items-center gap-sm">
            <Icons
              name="i-lucide-layers-3"
              class="text-primary"
            />
            <span>Extended Families 扩展颜色族</span>
            <Tag
              :value="`${quadFamilies.length} families`"
              severity="secondary"
            />
          </div>
        </template>
        <template #content>
          <div class="flex flex-col gap-md">
            <p class="text-muted-foreground fs-sm">
              包含 DEFAULT, foreground, hover, hover-foreground, light, light-foreground 六个变体。
              <span class="text-foreground">*-light</span> 用于 PrimeVue Button text/outlined 变体
              hover 背景，详见
              <code class="bg-muted px-1 rounded fs-xs">docs/PRIMEVUE_THEME.md</code>
            </p>
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-lg">
              <div
                v-for="family in quadFamilies"
                :key="family.family"
                class="flex flex-col gap-md p-padding-lg bg-muted/20 rounded-scale-lg border border-border/50"
              >
                <h3 class="fs-lg font-semibold text-foreground capitalize flex items-center gap-sm">
                  <div
                    class="w-6 h-6 rounded-full border border-border"
                    :class="`bg-${family.family}`"
                  />
                  {{ family.family }}
                </h3>

                <!-- Color Swatch Row -->
                <div class="flex gap-xs">
                  <div
                    :class="`bg-${family.family} flex-1 h-8 rounded-l-[var(--radius-md)] cursor-pointer hover:scale-105 transition-transform`"
                    :title="`bg-${family.family}`"
                    @click="copyToClipboard(`bg-${family.family}`)"
                  />
                  <div
                    :class="`bg-${family.family}-hover flex-1 h-8 cursor-pointer hover:scale-105 transition-transform`"
                    :title="`bg-${family.family}-hover`"
                    @click="copyToClipboard(`bg-${family.family}-hover`)"
                  />
                  <div
                    :class="`bg-${family.family}-light flex-1 h-8 rounded-r-[var(--radius-md)] cursor-pointer hover:scale-105 transition-transform`"
                    :title="`bg-${family.family}-light`"
                    @click="copyToClipboard(`bg-${family.family}-light`)"
                  />
                </div>

                <!-- Variants -->
                <CScrollbar class="max-h-48 min-h-0">
                  <div class="flex flex-col gap-sm">
                    <div
                      v-for="variant in family.variants"
                      :key="variant.name"
                      class="flex flex-wrap items-center gap-xs p-padding-xs rounded-scale-sm hover:bg-muted/30"
                    >
                      <Tag
                        :value="variant.name"
                        severity="info"
                        class="fs-xs shrink-0"
                      />
                      <Button
                        :label="variant.cssVar"
                        severity="secondary"
                        text
                        size="small"
                        class="font-mono fs-xs"
                        @click="copyToClipboard(`var(${variant.cssVar})`, variant.cssVar)"
                      />
                      <Button
                        v-if="variant.bgClass"
                        :label="variant.bgClass"
                        severity="success"
                        text
                        size="small"
                        class="font-mono fs-xs"
                        @click="copyToClipboard(variant.bgClass!)"
                      />
                      <Button
                        v-if="variant.borderClass"
                        :label="variant.borderClass"
                        severity="warn"
                        text
                        size="small"
                        class="font-mono fs-xs"
                        @click="copyToClipboard(variant.borderClass!)"
                      />
                    </div>
                  </div>
                </CScrollbar>

                <!-- Preview Cards -->
                <div class="grid grid-cols-3 gap-sm">
                  <div
                    :class="`bg-${family.family} text-${family.family}-foreground p-padding-sm rounded-scale-sm text-center fs-xs`"
                  >
                    默认
                  </div>
                  <div
                    :class="`bg-${family.family}-hover text-${family.family}-hover-foreground p-padding-sm rounded-scale-sm text-center fs-xs`"
                  >
                    悬停
                  </div>
                  <div
                    :class="`bg-${family.family}-light text-${family.family}-light-foreground p-padding-sm rounded-scale-sm text-center fs-xs`"
                  >
                    浅色
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- PrimeVue Button 配色 -->
      <Card class="border border-border">
        <template #title>
          <div class="flex items-center gap-sm">
            <Icons
              name="i-lucide-mouse-pointer-click"
              class="text-primary"
            />
            <span>PrimeVue Button 配色</span>
            <Tag
              value="text / outlined hover"
              severity="info"
            />
          </div>
        </template>
        <template #content>
          <div class="flex flex-col gap-md">
            <p class="text-muted-foreground fs-sm">
              Button <code class="bg-muted px-1 rounded">variant="text"</code> 与
              <code class="bg-muted px-1 rounded">variant="outlined"</code> 使用
              <code class="bg-muted px-1 rounded">*-light</code> 作为 hover
              背景，避免黑底彩字/红底红字。详见
              <code class="bg-muted px-1 rounded fs-xs">docs/PRIMEVUE_THEME.md</code>
            </p>
            <div class="flex flex-col gap-lg">
              <div>
                <h4 class="fs-sm font-semibold text-foreground mb-gap-sm">variant="text"</h4>
                <div class="flex flex-wrap items-center gap-md">
                  <Button
                    label="Primary"
                    variant="text"
                  />
                  <Button
                    label="Secondary"
                    severity="secondary"
                    variant="text"
                  />
                  <Button
                    label="Success"
                    severity="success"
                    variant="text"
                  />
                  <Button
                    label="Info"
                    severity="info"
                    variant="text"
                  />
                  <Button
                    label="Warn"
                    severity="warn"
                    variant="text"
                  />
                  <Button
                    label="Help"
                    severity="help"
                    variant="text"
                  />
                  <Button
                    label="Danger"
                    severity="danger"
                    variant="text"
                  />
                  <Button
                    label="Contrast"
                    severity="contrast"
                    variant="text"
                  />
                </div>
              </div>
              <div>
                <h4 class="fs-sm font-semibold text-foreground mb-gap-sm">variant="outlined"</h4>
                <div class="flex flex-wrap items-center gap-md">
                  <Button
                    label="Primary"
                    variant="outlined"
                  />
                  <Button
                    label="Secondary"
                    severity="secondary"
                    variant="outlined"
                  />
                  <Button
                    label="Success"
                    severity="success"
                    variant="outlined"
                  />
                  <Button
                    label="Info"
                    severity="info"
                    variant="outlined"
                  />
                  <Button
                    label="Warn"
                    severity="warn"
                    variant="outlined"
                  />
                  <Button
                    label="Help"
                    severity="help"
                    variant="outlined"
                  />
                  <Button
                    label="Danger"
                    severity="danger"
                    variant="outlined"
                  />
                  <Button
                    label="Contrast"
                    severity="contrast"
                    variant="outlined"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Opacity Variants（使用 CSS 变量 + style，不依赖 UnoCSS safelist） -->
      <Card class="border border-border">
        <template #title>
          <div class="flex items-center gap-sm">
            <Icons
              name="i-lucide-blend"
              class="text-primary"
            />
            <span>Opacity Variants 透明度变体</span>
          </div>
        </template>
        <template #content>
          <div class="flex flex-col gap-md">
            <p class="text-muted-foreground fs-sm">
              所有颜色都支持透明度语法，格式:
              <code class="bg-muted px-1 rounded">bg-{color}/{opacity}</code>
              · 色块使用 CSS 变量渲染，无需 UNO_DEMO 即可完整显示
            </p>
            <div class="flex flex-col gap-lg">
              <div
                v-for="family in COLOR_FAMILIES.quadFamilies"
                :key="family"
              >
                <h4 class="font-semibold mb-gap-sm capitalize text-foreground">{{ family }}</h4>
                <div class="flex gap-xs flex-wrap">
                  <div
                    v-for="opacity in opacityVariants"
                    :key="opacity"
                    class="flex flex-col items-center gap-xs cursor-pointer group"
                    @click="copyToClipboard(`bg-${family}/${opacity}`)"
                  >
                    <div
                      class="w-12 h-12 rounded-scale-sm border border-border group-hover:scale-110 transition-transform"
                      :style="{ background: `rgb(var(--${family}) / ${opacity / 100})` }"
                    />
                    <span class="font-mono fs-xs text-muted-foreground group-hover:text-foreground"
                      >{{ opacity }}%</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Sidebar Colors -->
      <Card class="border border-border">
        <template #title>
          <div class="flex items-center gap-sm">
            <Icons
              name="i-lucide-panel-left"
              class="text-primary"
            />
            <span>Sidebar Colors 侧边栏专用色</span>
            <Tag
              :value="`${sidebarColors.length} colors`"
              severity="secondary"
            />
          </div>
        </template>
        <template #content>
          <div class="flex flex-col gap-md">
            <p class="text-muted-foreground fs-sm">
              允许侧边栏拥有独立的背景逻辑（如深色侧边栏+浅色内容）
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
              <div
                v-for="item in sidebarColors"
                :key="item.key"
                class="flex flex-col gap-sm p-padding-md bg-muted/20 rounded-scale-md hover:bg-muted/40 transition-colors"
              >
                <div class="flex items-center gap-sm">
                  <div
                    class="w-8 h-8 rounded-scale-sm shrink-0"
                    :class="
                      item.borderClass ? item.bgClass : ['border border-border', item.bgClass]
                    "
                  />
                  <span class="font-medium text-foreground">{{ item.key }}</span>
                </div>
                <div class="flex flex-wrap gap-xs">
                  <Button
                    :label="item.cssVar"
                    severity="secondary"
                    text
                    size="small"
                    class="font-mono fs-xs"
                    @click="copyToClipboard(`var(${item.cssVar})`, item.cssVar)"
                  />
                  <Button
                    :label="item.copyClass"
                    severity="success"
                    text
                    size="small"
                    class="font-mono fs-xs"
                    @click="copyToClipboard(item.copyClass)"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Quick Reference -->
      <Card class="border border-border bg-gradient-to-br from-primary/5 to-accent/5">
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
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            <div class="flex flex-col gap-sm">
              <h4 class="font-semibold text-foreground">背景 (Background)</h4>
              <code
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('bg-{color}')"
                >bg-{color}</code
              >
              <code
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('bg-{color}/{opacity}')"
                >bg-{color}/{opacity}</code
              >
              <code
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('bg-{color}-hover')"
                >bg-{color}-hover</code
              >
              <code
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                title="Button text/outlined hover"
                @click="copyToClipboard('bg-{color}-light')"
                >bg-{color}-light</code
              >
            </div>
            <div class="flex flex-col gap-sm">
              <h4 class="font-semibold text-foreground">文本 (Text)</h4>
              <code
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('text-{color}')"
                >text-{color}</code
              >
              <code
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('text-{color}-foreground')"
                >text-{color}-foreground</code
              >
              <code
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('text-muted-foreground')"
                >text-muted-foreground</code
              >
            </div>
            <div class="flex flex-col gap-sm">
              <h4 class="font-semibold text-foreground">边框 (Border)</h4>
              <code
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('border-{color}')"
                >border-{color}</code
              >
              <code
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('border-border')"
                >border-border</code
              >
              <code
                class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
                @click="copyToClipboard('border-{color}/50')"
                >border-{color}/50</code
              >
            </div>
          </div>
          <div class="mt-gap-md p-padding-md bg-muted/30 rounded-scale-md">
            <p class="text-muted-foreground fs-sm">
              <span class="font-semibold">可用颜色:</span>
              <span class="font-mono ml-1"
                >primary | accent | destructive | warn | success | info | muted | secondary | card |
                popover</span
              >
            </p>
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
