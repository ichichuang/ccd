<script setup lang="ts">
import { COLOR_FAMILIES } from '@/utils/theme/metadata'
import { useThemeStore } from '@/stores/modules/theme'
import { useThemeSwitch } from '@/hooks/modules/useThemeSwitch'
import { useDeviceStore } from '@/stores/modules/device'
import {
  THEME_PRESETS,
  getPresetPrimaryColor,
  TRANSITION_DURATION_OPTIONS,
} from '@/constants/theme'

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

// Single token colors
const singleTokens = computed<
  Array<{
    token: string
    cssVar: string
    bgClass: string
    textClass: string
    borderClass: string | null
  }>
>(() =>
  COLOR_FAMILIES.singleTokens.map(token => ({
    token,
    cssVar: `--${token}`,
    bgClass: `bg-${token}`,
    textClass: `text-${token}`,
    borderClass: ['border', 'input', 'ring'].includes(token) ? `border-${token}` : null,
  }))
)

// Pair family colors
const pairFamilies = computed<
  Array<{
    family: string
    variants: Array<{
      name: string
      cssVar: string
      bgClass: string | null
      textClass: string | null
    }>
  }>
>(() =>
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
        borderClass: null,
      },
    ],
  }))
)

// Quad family colors (extended families)
const quadFamilies = computed<
  Array<{
    family: string
    variants: Array<{
      name: string
      cssVar: string
      bgClass: string | null
      textClass: string | null
      borderClass: string | null
    }>
  }>
>(() =>
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
        borderClass: null,
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
        borderClass: null,
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
        borderClass: null,
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
const sidebarColors = computed<
  Array<{
    key: keyof typeof COLOR_FAMILIES.sidebar
    varName: string
    cssVar: string
    bgClass: string
    textClass: string
    borderClass: string | null
    copyClass: string
  }>
>(() =>
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

// Theme Store & Switch
const themeStore: ReturnType<typeof useThemeStore> = useThemeStore()
const deviceStore = useDeviceStore()
const { mode, isAnimating, setThemeWithAnimation }: ReturnType<typeof useThemeSwitch> =
  useThemeSwitch()
const themeModeOptions: Array<{ value: ThemeMode; label: string }> = [
  { value: 'light', label: '亮色' },
  { value: 'dark', label: '暗色' },
  { value: 'auto', label: '跟随系统' },
]
const transitionOptions = TRANSITION_DURATION_OPTIONS.map(o => ({
  value: o.value,
  label: `${o.value}ms`,
}))

// Preset primary color for swatch (light mode)
const presetSwatchColors = computed<Array<{ name: string; color: string }>>(() =>
  THEME_PRESETS.map(p => ({
    name: p.name,
    color: getPresetPrimaryColor(p, false),
  }))
)

// Semantic colors (Brand/Interactive)
const semanticColors = [
  { name: 'bg-brand', classes: 'bg-primary', desc: '品牌大背景 (SSOT: Primary)' },
  { name: 'bg-interactive', classes: 'bg-primary-hover', desc: '交互背景 (Primary Hover)' },
  { name: 'text-interactive', classes: 'text-primary-hover', desc: '交互文字颜色' },
]

// Menu shortcuts：与 uno.config.ts 菜单交互语义保持一致
const menuShortcuts = [
  {
    name: 'menu-item-base',
    classes: 'menu-item-base border border-dashed border-border',
    desc: '菜单项基础样式（gap-sm + cursor-pointer + transition-all）',
  },
  {
    name: 'menu-item-hover',
    classes: 'menu-item-hover',
    desc: '菜单项悬停态（bg-primary/12 + text-primary，暗色模式自动 text-white）',
  },
  {
    name: 'menu-item-active-leaf',
    classes: 'menu-item-active-leaf',
    desc: '菜单项选中态（primary 背景 + primary-foreground 统一样式）',
  },
]
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <!-- Toolbar: Header (non-scroll) -->
    <div class="shrink-0 px-padding-lg py-padding-md border-b-default">
      <div class="layout-content-wide flex flex-col gap-xs">
        <div class="flex items-center gap-md">
          <div class="p-padding-md bg-primary/10 rounded-scale-lg shrink-0">
            <Icons
              name="i-lucide-palette"
              class="text-primary fs-2xl"
            />
          </div>
          <div>
            <h1 class="fs-2xl font-bold text-foreground">Theme System 主题系统</h1>
            <p class="text-muted-foreground fs-sm">
              包含：颜色 token + Store 模式/预设 · 亮/暗/自动 + THEME_PRESETS ·
              点击任意类名或变量即可复制
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
              配色方案由
              <span class="bg-muted px-padding-xs rounded font-mono">src/constants/theme/</span>
              与
              <span class="bg-muted px-padding-xs rounded font-mono">
                src/utils/theme/metadata.ts
              </span>
              定义。如需修改全局色盘，请编辑相应常量。
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scrollable content -->
    <CScrollbar class="flex-1 min-h-0">
      <div class="p-padding-lg">
        <div class="layout-content-wide flex flex-col gap-xl">
          <!-- Theme Store 主题 Store -->
          <Card class="component-border hover:shadow-md transition-all duration-scale-lg">
            <template #title>
              <div class="flex items-center gap-sm">
                <Icons
                  name="i-lucide-settings-2"
                  class="text-primary"
                />
                <span class="font-semibold">Theme Store 主题 Store</span>
                <Tag
                  value="useThemeStore / useThemeSwitch"
                  severity="info"
                />
              </div>
            </template>
            <template #content>
              <div class="flex flex-col gap-lg">
                <div class="flex flex-col gap-sm">
                  <span class="text-muted-foreground fs-sm">模式 (Theme Mode)</span>
                  <SelectButton
                    :model-value="mode"
                    :options="themeModeOptions"
                    option-value="value"
                    option-label="label"
                    :disabled="!!isAnimating"
                    @update:model-value="(v: ThemeMode) => setThemeWithAnimation(v)"
                  />
                  <p class="text-muted-foreground fs-xs">
                    useThemeSwitch：setThemeWithAnimation(mode) · 切换时带动画
                  </p>
                </div>
                <div class="flex flex-col gap-sm">
                  <span class="text-muted-foreground fs-sm">
                    切换动画时长 (Transition Duration)
                  </span>
                  <div class="flex flex-wrap gap-sm">
                    <div
                      v-for="opt in transitionOptions"
                      :key="opt.value"
                      class="p-padding-sm py-1 rounded-scale-md cursor-pointer select-none transition-all duration-scale-lg ease-in-out fs-sm active:scale-95"
                      :class="[
                        themeStore.transitionDuration === opt.value
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'surface-item text-muted-foreground hover:bg-muted/60 dark:hover:bg-muted/40',
                      ]"
                      @click="themeStore.setTransitionDuration(opt.value)"
                    >
                      {{ opt.label }}
                    </div>
                  </div>
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

          <!-- THEME_PRESETS 预设展示 -->
          <Card class="component-border">
            <template #title>
              <div class="flex items-center gap-sm">
                <Icons
                  name="i-lucide-palette"
                  class="text-primary"
                />
                <span class="font-semibold">THEME_PRESETS 预设展示</span>
                <Tag
                  :value="`${THEME_PRESETS.length} presets`"
                  severity="secondary"
                />
              </div>
            </template>
            <template #content>
              <div class="flex flex-col gap-md">
                <p class="text-muted-foreground fs-sm">
                  来自
                  <span class="bg-muted px-padding-xs rounded">src/constants/theme.ts</span>
                  · 点击色块切换 preset，themeStore.setTheme 实时生效
                </p>
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-md">
                  <div
                    v-for="item in presetSwatchColors"
                    :key="item.name"
                    class="relative flex flex-col items-center gap-xs p-padding-md rounded-scale-md transition-all duration-scale-lg cursor-pointer group active:scale-95"
                    :class="
                      themeStore.themeName === item.name
                        ? 'bg-primary/10 component-border border-primary/50 ring-2 ring-primary/30 ring-offset-2 ring-offset-background'
                        : 'surface-item hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-1'
                    "
                    @click="themeStore.setTheme(item.name)"
                  >
                    <!-- Selected Indicator -->
                    <div
                      v-if="themeStore.themeName === item.name"
                      class="absolute top-[var(--spacing-xs)] right-[var(--spacing-xs)] w-[var(--spacing-md)] h-[var(--spacing-md)] rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm"
                    >
                      <Icons
                        name="i-lucide-check"
                        size="xs"
                        :scale="0.85"
                      />
                    </div>

                    <div
                      class="w-12 h-12 rounded-full ring-2 ring-border/30 shrink-0 transition-transform group-hover:scale-110 duration-scale-lg shadow-sm"
                      :style="{ background: item.color }"
                    />
                    <span
                      class="font-mono fs-xs transition-colors"
                      :class="
                        themeStore.themeName === item.name
                          ? 'text-primary font-bold'
                          : 'text-foreground'
                      "
                    >
                      {{ item.name }}
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- Single Token Colors -->
          <Card class="component-border hover:shadow-md transition-all duration-scale-lg">
            <template #title>
              <div class="flex items-center gap-sm">
                <Icons
                  name="i-lucide-circle"
                  class="text-primary"
                />
                <span class="font-semibold">Single Tokens 单色令牌</span>
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
                    class="flex flex-col gap-sm p-padding-md surface-item rounded-scale-md component-border hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-all duration-scale-lg"
                  >
                    <div class="flex items-center gap-sm">
                      <div
                        class="w-[var(--spacing-xl)] h-[var(--spacing-xl)] rounded-scale-sm component-border"
                        :class="item.bgClass"
                      />
                      <span class="font-semibold text-foreground">
                        {{ item.token }}
                      </span>
                    </div>
                    <div class="flex flex-wrap gap-xs">
                      <div
                        class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-primary/20 hover:text-primary active:scale-95 text-muted-foreground"
                        @click="copyToClipboard(`var(${item.cssVar})`, item.cssVar)"
                      >
                        {{ item.cssVar }}
                      </div>
                      <div
                        class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-success/20 hover:text-success active:scale-95 text-muted-foreground"
                        @click="copyToClipboard(item.bgClass)"
                      >
                        {{ item.bgClass }}
                      </div>
                      <div
                        v-if="item.borderClass"
                        class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-warn/20 hover:text-warn active:scale-95 text-muted-foreground"
                        @click="copyToClipboard(item.borderClass!)"
                      >
                        {{ item.borderClass }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- Pair Family Colors -->
          <Card class="component-border hover:shadow-md transition-all duration-scale-lg">
            <template #title>
              <div class="flex items-center gap-sm">
                <Icons
                  name="i-lucide-layers"
                  class="text-primary"
                />
                <span class="font-semibold">Pair Families 成对颜色族</span>
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
                    class="flex flex-col gap-md p-padding-lg surface-item rounded-scale-lg ring-1 ring-border/20"
                  >
                    <h4
                      class="fs-sm font-semibold text-foreground capitalize flex items-center gap-sm mb-margin-xs"
                    >
                      <div
                        class="w-4 h-4 rounded-full component-border"
                        :class="`bg-${family.family}`"
                      />
                      {{ family.family }}
                    </h4>
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
                          <div
                            class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-primary/20 hover:text-primary active:scale-95 text-muted-foreground"
                            @click="copyToClipboard(`var(${variant.cssVar})`, variant.cssVar)"
                          >
                            {{ variant.cssVar }}
                          </div>
                          <div
                            v-if="variant.bgClass"
                            class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-success/20 hover:text-success active:scale-95 text-muted-foreground"
                            @click="copyToClipboard(variant.bgClass!)"
                          >
                            {{ variant.bgClass }}
                          </div>
                          <div
                            v-if="variant.textClass"
                            class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-warn/20 hover:text-warn active:scale-95 text-muted-foreground"
                            @click="copyToClipboard(variant.textClass!)"
                          >
                            {{ variant.textClass }}
                          </div>
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
          <Card class="component-border hover:shadow-md transition-all duration-scale-lg">
            <template #title>
              <div class="flex items-center gap-sm">
                <Icons
                  name="i-lucide-layers-3"
                  class="text-primary"
                />
                <span class="font-semibold">Extended Families 扩展颜色族</span>
                <Tag
                  :value="`${quadFamilies.length} families`"
                  severity="secondary"
                />
              </div>
            </template>
            <template #content>
              <div class="flex flex-col gap-md">
                <p class="text-muted-foreground fs-sm">
                  包含 DEFAULT, foreground, hover, hover-foreground, light, light-foreground
                  六个变体。
                  <span class="text-foreground">*-light</span>
                  用于 PrimeVue Button text/outlined 变体 hover 背景，详见
                  <span class="bg-muted px-padding-xs rounded fs-xs">docs/PRIMEVUE_THEME.md</span>
                </p>
                <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-lg">
                  <div
                    v-for="family in quadFamilies"
                    :key="family.family"
                    class="flex flex-col gap-md p-padding-lg surface-item rounded-scale-lg ring-1 ring-border/20"
                  >
                    <h4
                      class="fs-sm font-semibold text-foreground capitalize flex items-center gap-sm mb-margin-xs"
                    >
                      <div
                        class="w-4 h-4 rounded-full component-border"
                        :class="`bg-${family.family}`"
                      />
                      {{ family.family }}
                    </h4>

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
                          class="flex flex-wrap items-center gap-xs p-padding-xs rounded-scale-sm hover:bg-muted/30 transition-colors duration-scale-lg"
                        >
                          <Tag
                            :value="variant.name"
                            severity="info"
                            class="fs-xs shrink-0"
                          />
                          <div
                            class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-primary/20 hover:text-primary active:scale-95 text-muted-foreground"
                            @click="copyToClipboard(`var(${variant.cssVar})`, variant.cssVar)"
                          >
                            {{ variant.cssVar }}
                          </div>
                          <div
                            v-if="variant.bgClass"
                            class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-success/20 hover:text-success active:scale-95 text-muted-foreground"
                            @click="copyToClipboard(variant.bgClass!)"
                          >
                            {{ variant.bgClass }}
                          </div>
                          <div
                            v-if="variant.borderClass"
                            class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-warn/20 hover:text-warn active:scale-95 text-muted-foreground"
                            @click="copyToClipboard(variant.borderClass!)"
                          >
                            {{ variant.borderClass }}
                          </div>
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

          <!-- Color Usage Contract 颜色使用约定 -->
          <Card class="component-border hover:shadow-md transition-all duration-scale-lg">
            <template #title>
              <div class="flex items-center gap-sm">
                <Icons
                  name="i-lucide-traffic-lights"
                  class="text-primary"
                />
                <span class="font-semibold">Color Usage Contract 颜色语义约定</span>
                <Tag
                  value="SSOT: colorUsage.ts"
                  severity="info"
                />
              </div>
            </template>
            <template #content>
              <div class="flex flex-col gap-md">
                <p class="text-muted-foreground fs-sm">
                  所有 hover / focus / 选中 / 强调色使用必须遵守
                  <span class="bg-muted px-padding-xs rounded font-mono">
                    src/constants/theme/colorUsage.ts
                  </span>
                  约定，禁止在业务中自行选择 primary / accent / ring 语义。
                </p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-md fs-xs text-muted-foreground">
                  <div class="flex flex-col gap-xs">
                    <div class="font-semibold text-foreground">交互反馈 (Hover / Active)</div>
                    <div class="flex items-center gap-xs">
                      <span class="bg-muted px-padding-xs rounded font-mono">bg-primary-hover</span>
                      <span>：hover 背景（按钮/菜单等统一用 primary-hover）</span>
                    </div>
                    <div class="flex items-center gap-xs">
                      <span class="bg-muted px-padding-xs rounded font-mono">
                        text-primary-hover
                      </span>
                      <span>：交互文字颜色（text-interactive）</span>
                    </div>
                  </div>
                  <div class="flex flex-col gap-xs">
                    <div class="font-semibold text-foreground">焦点与选中 (Focus / Selection)</div>
                    <div class="flex items-center gap-xs">
                      <span class="bg-muted px-padding-xs rounded font-mono">
                        focus-visible:ring-ring
                      </span>
                      <span>：焦点环统一使用 ring，禁止 ring-primary</span>
                    </div>
                    <div class="flex items-center gap-xs">
                      <span class="bg-muted px-padding-xs rounded font-mono">bg-primary</span>
                      <span>：选中态 / Tab 激活指示线（PRIMARY_USAGE）</span>
                    </div>
                  </div>
                  <div class="flex flex-col gap-xs">
                    <div class="font-semibold text-foreground">聚焦预选 (Focus Highlight)</div>
                    <div class="flex items-center gap-xs">
                      <span class="bg-muted px-padding-xs rounded font-mono">bg-primary-light</span>
                      <span>：列表项键盘聚焦、高亮预选背景</span>
                    </div>
                  </div>
                  <div class="flex flex-col gap-xs">
                    <div class="font-semibold text-foreground">强调色 (Accent)</div>
                    <div class="flex items-center gap-xs">
                      <span class="bg-muted px-padding-xs rounded font-mono">bg-accent</span>
                      <span>：特殊标记 / badge / feature callout，高亮但非 hover</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- Semantic Colors & Shortcuts -->

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-xl">
            <!-- Semantic Colors -->
            <Card class="component-border h-full hover:shadow-md transition-all duration-scale-lg">
              <template #title>
                <div class="flex items-center gap-sm">
                  <Icons
                    name="i-lucide-tags"
                    class="text-primary"
                  />
                  <span class="font-semibold">Semantic Colors 语义颜色</span>
                  <Tag
                    value="推荐使用"
                    severity="success"
                  />
                </div>
              </template>
              <template #content>
                <div class="flex flex-col gap-md">
                  <p class="text-muted-foreground fs-sm">映射业务意图到主题颜色 (uno.config.ts)</p>
                  <div class="flex flex-col gap-md">
                    <div
                      v-for="item in semanticColors"
                      :key="item.name"
                      class="flex items-center gap-md p-padding-md surface-item rounded-scale-md component-border hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-all duration-scale-lg cursor-pointer"
                      @click="copyToClipboard(item.name)"
                    >
                      <div
                        class="w-8 h-8 rounded-full shrink-0 ring-1 ring-primary/20"
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

            <!-- Menu Shortcuts -->
            <Card class="component-border h-full hover:shadow-md transition-all duration-scale-lg">
              <template #title>
                <div class="flex items-center gap-sm">
                  <Icons
                    name="i-lucide-menu"
                    class="text-primary"
                  />
                  <span>Menu Shortcuts 菜单快捷键</span>
                </div>
              </template>
              <template #content>
                <div class="flex flex-col gap-md">
                  <p class="text-muted-foreground fs-sm">
                    组合类名：
                    <span class="text-foreground">bg-primary/20! text-primary!</span>
                  </p>
                  <div class="flex flex-col gap-md">
                    <div
                      v-for="item in menuShortcuts"
                      :key="item.name"
                      class="flex flex-col gap-sm p-padding-md surface-item rounded-scale-md component-border hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-all duration-scale-lg cursor-pointer"
                      @click="copyToClipboard(item.name)"
                    >
                      <div class="flex items-center justify-between">
                        <span class="font-semibold text-foreground text-primary">
                          {{ item.name }}
                        </span>
                        <span class="fs-xs text-muted-foreground">{{ item.desc }}</span>
                      </div>
                      <div
                        class="p-padding-sm rounded-scale-sm text-center fs-sm"
                        :class="item.classes"
                      >
                        Menu Item Preview
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </div>

          <!-- PrimeVue Button 配色 -->
          <Card class="component-border hover:shadow-md transition-all duration-scale-lg">
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
                  Button
                  <span class="bg-muted px-padding-xs rounded">variant="text"</span>
                  与
                  <span class="bg-muted px-padding-xs rounded">variant="outlined"</span>
                  使用
                  <span class="bg-muted px-padding-xs rounded">*-light</span>
                  作为 hover 背景，避免黑底彩字/红底红字。详见
                  <span class="bg-muted px-padding-xs rounded fs-xs">docs/PRIMEVUE_THEME.md</span>
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
                    <h4 class="fs-sm font-semibold text-foreground mb-gap-sm">
                      variant="outlined"
                    </h4>
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
          <Card class="component-border hover:shadow-md transition-all duration-scale-lg">
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
                  <span class="bg-muted px-padding-xs rounded">bg-{color}/{opacity}</span>
                  · 色块使用 CSS 变量渲染，无需 UNO_DEMO 即可完整显示
                </p>
                <div class="flex flex-col gap-lg">
                  <div
                    v-for="family in COLOR_FAMILIES.quadFamilies"
                    :key="family"
                  >
                    <h4 class="font-semibold mb-gap-sm capitalize text-foreground">
                      {{ family }}
                    </h4>
                    <div class="flex gap-xs flex-wrap">
                      <div
                        v-for="opacity in opacityVariants"
                        :key="opacity"
                        class="flex flex-col items-center gap-xs cursor-pointer group"
                        @click="copyToClipboard(`bg-${family}/${opacity}`)"
                      >
                        <div
                          class="w-[var(--spacing-2xl)] h-[var(--spacing-2xl)] rounded-scale-sm component-border group-hover:scale-110 transition-transform"
                          :style="{ background: `rgb(var(--${family}) / ${opacity / 100})` }"
                        />
                        <span
                          class="font-mono fs-xs text-muted-foreground group-hover:text-foreground"
                        >
                          {{ opacity }}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- Sidebar Colors -->
          <Card class="component-border hover:shadow-md transition-all duration-scale-lg">
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
                    class="flex flex-col gap-sm p-padding-md surface-item rounded-scale-md hover:bg-muted/60 dark:hover:bg-muted/40 transition-colors"
                  >
                    <div class="flex items-center gap-sm">
                      <div
                        class="w-8 h-8 rounded-scale-sm shrink-0"
                        :class="
                          item.borderClass ? item.bgClass : ['component-border', item.bgClass]
                        "
                      />
                      <span class="font-medium text-foreground">
                        {{ item.key }}
                      </span>
                    </div>
                    <div class="flex flex-wrap gap-xs">
                      <div
                        class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-primary/20 hover:text-primary active:scale-95 text-muted-foreground"
                        @click="copyToClipboard(`var(${item.cssVar})`, item.cssVar)"
                      >
                        {{ item.cssVar }}
                      </div>
                      <div
                        class="fs-xs font-mono bg-muted/30 px-padding-xs py-0.5 rounded cursor-pointer select-none transition-all duration-scale-lg ease-in-out hover:bg-success/20 hover:text-success active:scale-95 text-muted-foreground"
                        @click="copyToClipboard(item.copyClass)"
                      >
                        {{ item.copyClass }}
                      </div>
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
              <div class="flex flex-col gap-md">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                  <div class="flex flex-col gap-sm">
                    <h4 class="font-semibold text-foreground">背景 (Background)</h4>
                    <div
                      class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                      @click="copyToClipboard('bg-{color}')"
                    >
                      bg-{color}
                    </div>
                    <div
                      class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                      @click="copyToClipboard('bg-{color}/{opacity}')"
                    >
                      bg-{color}/{opacity}
                    </div>
                    <div
                      class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                      @click="copyToClipboard('bg-{color}-hover')"
                    >
                      bg-{color}-hover
                    </div>
                    <div
                      class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                      title="Button text/outlined hover"
                      @click="copyToClipboard('bg-{color}-light')"
                    >
                      bg-{color}-light
                    </div>
                  </div>
                  <div class="flex flex-col gap-sm">
                    <h4 class="font-semibold text-foreground">文本 (Text)</h4>
                    <div
                      class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                      @click="copyToClipboard('text-{color}')"
                    >
                      text-{color}
                    </div>
                    <div
                      class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                      @click="copyToClipboard('text-{color}-foreground')"
                    >
                      text-{color}-foreground
                    </div>
                    <div
                      class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                      @click="copyToClipboard('text-muted-foreground')"
                    >
                      text-muted-foreground
                    </div>
                  </div>
                  <div class="flex flex-col gap-sm">
                    <h4 class="font-semibold text-foreground">边框 (Border)</h4>
                    <div
                      class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                      @click="copyToClipboard('border-{color}')"
                    >
                      border-{color}
                    </div>
                    <div
                      class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                      @click="copyToClipboard('border-border')"
                    >
                      border-border
                    </div>
                    <div
                      class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80 active:scale-95 transition-all duration-scale-lg"
                      @click="copyToClipboard('border-{color}/50')"
                    >
                      border-{color}/50
                    </div>
                  </div>
                </div>
                <p class="text-muted-foreground fs-sm">
                  <span class="font-semibold">可用颜色:</span>
                  <span class="font-mono ml-1 text-primary">
                    primary | accent | danger | warn | success | info | muted | secondary | card |
                    popover
                  </span>
                </p>
                <p class="text-muted-foreground fs-sm mt-1">
                  <span class="font-semibold">语义别名:</span>
                  <span class="font-mono ml-1 text-primary">
                    bg-brand | bg-interactive | text-interactive
                  </span>
                </p>
                <p class="text-muted-foreground fs-sm mt-1">
                  <span class="font-semibold">菜单快捷键:</span>
                  <span class="font-mono ml-1 text-primary">menu-item-base | menu-item-hover</span>
                </p>
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
