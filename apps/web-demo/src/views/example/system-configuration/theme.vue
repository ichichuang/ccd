<script setup lang="ts">
import { DEFAULT_THEME_NAME, THEME_PRESETS, getPresetPrimaryColor } from '@/constants/theme'
import { ACCENT_USAGE, COLOR_USAGE, PRIMARY_USAGE } from '@/constants/theme/colorUsage'
import { COLOR_FAMILIES, THEME_ENGINE } from '@/utils/theme/metadata'
import { goToRoute } from '@/router/utils/helper'

defineOptions({ name: 'ThemeSystemPage' })

const themeStore = useThemeStore()
const { isDark } = useThemeSwitch()

const activePreset = computed(
  () => THEME_PRESETS.find(p => p.name === themeStore.themeName) ?? THEME_PRESETS[0]
)

function formatPresetName(name: string): string {
  return name
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function switchPreset(name: string): void {
  themeStore.setTheme(name)
}

function cssVar(token: string): string {
  return `rgb(var(--${token}))`
}

// Sidebar token CSS var names
const sidebarVarNames = Object.values(COLOR_FAMILIES.sidebar) as string[]

// Build the 5-variant token list for a quad family
function quadTokens(family: string): { token: string; label: string }[] {
  return [
    { token: family, label: 'default' },
    { token: `${family}-foreground`, label: 'fg' },
    { token: `${family}-hover`, label: 'hover' },
    { token: `${family}-light`, label: 'light' },
    { token: `${family}-light-foreground`, label: 'light-fg' },
  ]
}

/** Quad 色块：foreground 类 token 用「底 + 字色 Aa」内嵌展示，避免浅色字当背景块时隐形 */
function quadSwatchCellStyle(family: string, item: { token: string }): Record<string, string> {
  const { token } = item
  if (token === `${family}-foreground`) {
    return {
      background: cssVar(family),
      color: cssVar(`${family}-foreground`),
    }
  }
  if (token === `${family}-light-foreground`) {
    return {
      background: cssVar(`${family}-light`),
      color: cssVar(`${family}-light-foreground`),
    }
  }
  return {
    background: cssVar(token),
  }
}

function quadSwatchShowAa(family: string, item: { token: string }): boolean {
  return item.token === `${family}-foreground` || item.token === `${family}-light-foreground`
}

/** Z1 材质三格：default / hover / light（可抄 Uno `bg-*`） */
function isQuadBgMaterialToken(family: string, item: { token: string }): boolean {
  return (
    item.token === family || item.token === `${family}-hover` || item.token === `${family}-light`
  )
}

/** Sidebar CSS 变量名 → 演示用背景类名（与 `buildSemanticThemeColors` 一致） */
function sidebarVarNameToUnoBgClass(varName: string): string {
  if (varName === 'sidebar-background') return 'bg-sidebar'
  return `bg-${varName}`
}

type QuadFamily = (typeof COLOR_FAMILIES.quadFamilies)[number]

/** 与 AppPrimeVueGlobals 中 Toast `group="tr"` 对齐，否则多实例下无 group 不会展示 */
const COPY_TOAST_GROUP = 'tr' as const

const { copy: copyToClipboard, isSupported: isClipboardSupported } = useClipboard({
  legacy: true,
})

async function copyClassName(cls: string, label: string): Promise<void> {
  if (!isClipboardSupported.value) {
    window.$toast?.add({
      severity: 'error',
      summary: '复制失败',
      detail: '当前环境不支持剪贴板 API',
      life: 2000,
      group: COPY_TOAST_GROUP,
    })
    return
  }
  try {
    await copyToClipboard(cls)
    window.$toast?.add({
      severity: 'success',
      summary: '已复制',
      detail: `类名: ${cls} (${label})`,
      life: 2000,
      group: COPY_TOAST_GROUP,
    })
  } catch {
    window.$toast?.add({
      severity: 'error',
      summary: '复制失败',
      detail: '请检查剪贴板权限',
      life: 2000,
      group: COPY_TOAST_GROUP,
    })
  }
}

function onQuadSwatchBgClick(family: string, item: { token: string }): void {
  if (!isQuadBgMaterialToken(family, item)) return
  void copyClassName(`bg-${item.token}`, '卡片材质')
}

// PrimeVue demo state
const demoInput = ref<string>('')
const demoSelectValue = ref<string>('a')
const demoToggle = ref<boolean>(false)
const demoSelectOptions = [
  { label: '选项一', value: 'a' },
  { label: '选项二', value: 'b' },
  { label: '选项三', value: 'c' },
]

// Build safe inline-style objects for the light/dark preview panel
// (ThemeModeConfig fields are all optional — guard here, not in template)
interface PreviewStyleMap {
  root: { background: string; color: string }
  card: { background: string }
  muted: { background: string }
  fg: { color: string }
  mutedFg: { color: string }
  icon: { color: string }
}

function buildPreviewStyles(
  cfg: ThemeModeConfig | undefined,
  mode: 'light' | 'dark'
): PreviewStyleMap {
  const isLight = mode === 'light'
  const bg = cfg?.background ?? (isLight ? THEME_ENGINE.bgLight : THEME_ENGINE.bgDark)
  const fg = cfg?.foreground ?? (isLight ? THEME_ENGINE.fgLight : THEME_ENGINE.fgDark)
  const cardBg = cfg?.neutral?.bg ?? (isLight ? THEME_ENGINE.cardLight : THEME_ENGINE.cardDark)
  const mutedBg =
    cfg?.neutral?.base ?? (isLight ? THEME_ENGINE.neutralLight : THEME_ENGINE.neutralDark)
  const mutedFg =
    cfg?.neutral?.foreground ?? (isLight ? THEME_ENGINE.mutedFgLight : THEME_ENGINE.mutedFgDark)
  const primBg = cfg?.primary?.default ?? THEME_ENGINE.infoDefault
  return {
    root: { background: bg, color: fg },
    card: { background: cardBg },
    muted: { background: mutedBg },
    fg: { color: fg },
    mutedFg: { color: mutedFg },
    icon: { color: primBg },
  }
}

function buildQuadChipStyles(
  cfg: ThemeModeConfig | undefined,
  mode: 'light' | 'dark'
): Record<QuadFamily, { background: string; color: string }> {
  const isLight = mode === 'light'
  const fgFallback = isLight ? THEME_ENGINE.fgLight : THEME_ENGINE.fgDark
  const fgOn = THEME_ENGINE.dangerDefaultFg
  function pick(
    tok: { default?: string; foreground?: string } | undefined,
    defBg: string,
    defFg: string
  ): { background: string; color: string } {
    return {
      background: tok?.default ?? defBg,
      color: tok?.foreground ?? defFg,
    }
  }
  return {
    primary: pick(cfg?.primary, THEME_ENGINE.infoDefault, fgOn),
    accent: pick(cfg?.accent, THEME_ENGINE.helpDefault, fgFallback),
    danger: pick(cfg?.danger, THEME_ENGINE.dangerDefault, fgOn),
    warn: pick(cfg?.warn, THEME_ENGINE.warnDefault, fgOn),
    success: pick(cfg?.success, THEME_ENGINE.successDefault, fgOn),
    info: pick(cfg?.info, THEME_ENGINE.infoDefault, fgOn),
    help: pick(cfg?.help, THEME_ENGINE.helpDefault, fgOn),
  }
}

const lightStyles = computed(() => buildPreviewStyles(activePreset.value.colors?.light, 'light'))
const darkStyles = computed(() => buildPreviewStyles(activePreset.value.colors?.dark, 'dark'))

const lightQuadChips = computed(() =>
  buildQuadChipStyles(activePreset.value.colors?.light, 'light')
)
const darkQuadChips = computed(() => buildQuadChipStyles(activePreset.value.colors?.dark, 'dark'))

/** 随主题刷新，供 Single Token 展示 rgb 通道值 */
const cssVarSnapshotKey = computed(
  () => `${themeStore.themeName}-${themeStore.mode}-${isDark.value}`
)

const singleTokenChannelValues = computed<Record<string, string>>(() => {
  void cssVarSnapshotKey.value
  const out: Record<string, string> = {}
  if (typeof document === 'undefined') return out
  const root: Element = document.documentElement
  for (const token of COLOR_FAMILIES.singleTokens) {
    const raw: string = getComputedStyle(root).getPropertyValue(`--${token}`).trim()
    out[token] = raw.length > 0 ? raw : '—'
  }
  return out
})

/** 随主题刷新，供 Pair Family 展示 rgb 通道值 */
const pairTokenChannelValues = computed<Record<string, string>>(() => {
  void cssVarSnapshotKey.value
  const out: Record<string, string> = {}
  if (typeof document === 'undefined') return out
  const root: Element = document.documentElement
  const styles: CSSStyleDeclaration = getComputedStyle(root)
  for (const family of COLOR_FAMILIES.pairFamilies) {
    for (const suffix of ['', '-foreground']) {
      const token: string = `${family}${suffix}`
      const raw: string = styles.getPropertyValue(`--${token}`).trim()
      out[token] = raw.length > 0 ? raw : '—'
    }
  }
  return out
})

/** Quad 区共用列标题（与 quadTokens 第一组 family 一致） */
const quadLegendColumns = quadTokens('primary')

/** 背景 Alpha 阶梯（百分比步进，内联 `rgb(var(--*) / step/100)`） */
const SEMANTIC_ALPHA_STEPS = [5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90] as const

const TEXT_ALPHA_STEPS = [40, 50, 60, 70, 80, 90, 100] as const
const BORDER_ALPHA_STEPS = [20, 40, 60, 80, 100] as const

interface AlphaBgLayerGroup {
  title: string
  families: readonly string[]
}

/** Uno `bg-sidebar` 对应 `--sidebar-background`，其余与 token 名一致 */
function semanticColorVarBase(name: string): string {
  if (name === 'sidebar') return 'sidebar-background'
  return name
}

/** 背景透明度展示分组：仅 Quad 语义色（功能色透明阶梯有指导意义） */
const ALPHA_BG_LAYER_GROUPS: AlphaBgLayerGroup[] = [
  { title: 'Quad 语义色', families: COLOR_FAMILIES.quadFamilies },
]

function quadUsageFor(family: QuadFamily): readonly string[] {
  if (family === 'primary') return PRIMARY_USAGE
  if (family === 'accent') return ACCENT_USAGE
  return [`severity="${family}"`, 'semantic-tag', 'status-chip']
}
</script>

<template>
  <!-- Toast：AppPrimeVueGlobals 挂载多组 Toast；复制反馈须带 group（见 copyClassName） -->
  <div
    id="theme-system-page"
    data-archetype="A1-toolbar-content"
  >
    <AnimateWrapper enter="fadeInUp">
      <div class="col-stretch gap-md min-h-0 min-w-0">
        <div class="layout-narrow col-stretch gap-md min-w-0">
          <!-- Page header — glass-panel + glass-icon-box（与 Dashboard 同节奏） -->
          <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
            <div class="row-between gap-md min-w-0">
              <div class="col-between min-w-0 flex-1 gap-xs">
                <div class="flex flex-row flex-wrap items-center justify-start gap-sm min-w-0">
                  <div class="glass-icon-box shrink-0">
                    <Icons
                      name="i-lucide-palette"
                      size="xl"
                      class="text-primary"
                    />
                  </div>
                  <div class="col-stretch gap-xs min-w-0">
                    <div class="flex flex-row flex-wrap items-center justify-start gap-xs min-w-0">
                      <span class="text-lg font-bold text-foreground text-no-wrap">主题系统</span>
                      <span
                        class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase"
                      >
                        Theme Engine
                      </span>
                    </div>
                    <span class="text-sm text-muted-foreground text-ellipsis-1">
                      配色架构：预设、语义 Token、亮/暗对比与 PrimeVue 主题链
                    </span>
                    <p class="text-xs text-muted-foreground m-0">
                      默认预设：
                      <span class="font-mono text-primary">{{ DEFAULT_THEME_NAME }}</span>
                    </p>
                    <p class="text-xs text-muted-foreground m-0 row-start gap-xs flex-wrap">
                      <span>尺寸与间距见</span>
                      <Button
                        label="尺寸系统"
                        link
                        size="small"
                        class="p-0 h-auto underline decoration-primary/40 underline-offset-2"
                        @click="goToRoute('ExampleSystemConfigurationSize')"
                      />
                      <span>；UnoCSS 快捷方式见</span>
                      <Button
                        label="UnoCSS"
                        link
                        size="small"
                        class="p-0 h-auto underline decoration-primary/40 underline-offset-2"
                        @click="goToRoute('ExampleSystemConfigurationUnocss')"
                      />
                    </p>
                  </div>
                </div>
              </div>
              <div class="row-center gap-sm shrink-0">
                <span class="text-xs text-muted-foreground text-no-wrap">
                  {{ isDark ? '暗色模式' : '亮色模式' }}
                </span>
                <ToggleSwitch
                  :model-value="isDark"
                  @update:model-value="(v: boolean) => themeStore.setMode(v ? 'dark' : 'light')"
                />
              </div>
            </div>
          </header>

          <!-- ═══ §1 Theme Preset Selector ═══ -->
          <section class="col-stretch gap-md">
            <div class="row-between gap-sm min-w-0 shrink-0">
              <div class="col-between min-w-0 flex-1 gap-xs">
                <div class="flex flex-row items-center justify-start gap-xs min-w-0">
                  <Icons
                    name="i-lucide-paintbrush"
                    class="shrink-0 text-primary"
                  />
                  <h2 class="m-0 min-w-0 text-lg font-semibold text-ellipsis-1">主题预设</h2>
                </div>
                <p class="m-0 min-w-0 text-xs text-muted-foreground">
                  7 套独立调配的预设方案，亮 / 暗模式色值完全分离
                </p>
              </div>
              <span class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase">
                Presets
              </span>
            </div>

            <div
              class="glass-card rounded-xl p-md md:p-xl lg:p-2xl col-stretch gap-md md:gap-lg xl:gap-xl"
            >
              <div
                class="rounded-xl bg-muted/25 dark:bg-muted/40 border border-border/40 dark:border-border/30"
              >
                <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-sm md:gap-md">
                  <div
                    v-for="preset in THEME_PRESETS"
                    :key="preset.name"
                    class="rounded-lg p-md col-center gap-sm group interactive-card"
                    :class="
                      themeStore.themeName === preset.name
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                        : ''
                    "
                    @click="switchPreset(preset.name)"
                  >
                    <!-- Dual-color pill: left=light primary, right=dark primary -->
                    <div
                      class="relative w-[var(--spacing-2xl)] h-[var(--spacing-2xl)] rounded-full overflow-hidden shadow-sm shrink-0 transition-[transform,opacity] duration-sm ease-spring group-hover:scale-105"
                    >
                      <div
                        class="absolute inset-y-0 left-0 w-1/2"
                        :style="{ background: getPresetPrimaryColor(preset, false) }"
                      />
                      <div
                        class="absolute inset-y-0 right-0 w-1/2"
                        :style="{ background: getPresetPrimaryColor(preset, true) }"
                      />
                    </div>
                    <span class="text-xs text-foreground font-medium text-center leading-tight">
                      {{ formatPresetName(preset.name) }}
                    </span>
                    <span
                      v-if="themeStore.themeName === preset.name"
                      class="w-[var(--spacing-sm)] h-[var(--spacing-sm)] rounded-full bg-primary shrink-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ═══ §2 Color Token Families ═══ -->
          <section class="col-stretch gap-lg">
            <div class="row-between gap-sm min-w-0 shrink-0">
              <div class="col-between min-w-0 flex-1 gap-xs">
                <div class="flex flex-row items-center justify-start gap-xs min-w-0">
                  <Icons
                    name="i-lucide-swatch-book"
                    class="shrink-0 text-accent"
                  />
                  <h2 class="m-0 min-w-0 text-lg font-semibold text-ellipsis-1">
                    语义色彩 Token 家族
                  </h2>
                </div>
                <p class="m-0 min-w-0 text-xs text-muted-foreground">
                  60+ 个 CSS 变量，按 Single / Pair / Quad / Sidebar 四层级管理
                </p>
              </div>
              <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
                Tokens
              </span>
            </div>

            <!-- 2a Single Tokens（5）+ 运行时通道值 -->
            <div
              class="glass-card rounded-xl p-md md:p-xl lg:p-2xl col-stretch gap-md md:gap-lg xl:gap-xl"
            >
              <div class="col-stretch gap-xs">
                <h3 class="text-lg font-semibold text-foreground m-0">Single Tokens（5）</h3>
                <p class="text-xs text-muted-foreground m-0">
                  语义映射 SSOT 见
                  <span class="font-mono text-foreground">colorUsage.ts</span>
                  （如
                  <span class="font-mono">{{ COLOR_USAGE.focus }}</span>
                  → focus 环）
                </p>
              </div>
              <div
                class="rounded-xl bg-muted/25 dark:bg-muted/40 p-md md:p-lg border border-border/40 dark:border-border/30"
              >
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-sm md:gap-md">
                  <div
                    v-for="token in COLOR_FAMILIES.singleTokens"
                    :key="token"
                    class="rounded-md p-sm col-stretch gap-xs interactive-item"
                    @click="copyClassName(`--${token}`, 'CSS 变量')"
                  >
                    <div
                      class="w-full h-[var(--spacing-xl)] rounded-sm shadow-[inset_0_0_0_1px_rgb(var(--border)/0.5)]"
                      :style="{ background: cssVar(token) }"
                    />
                    <span class="text-xs font-mono text-foreground">--{{ token }}</span>
                    <span
                      class="text-xs font-mono text-muted-foreground text-ellipsis-1"
                      :title="singleTokenChannelValues[token]"
                    >
                      {{ singleTokenChannelValues[token] ?? '—' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2b Pair Families (4 × 2) -->
            <div
              class="glass-card rounded-xl p-md md:p-xl lg:p-2xl col-stretch gap-md md:gap-lg xl:gap-xl"
            >
              <h3 class="text-lg font-semibold text-foreground m-0">Pair Families</h3>
              <p class="text-xs text-muted-foreground m-0">
                card / popover / secondary / muted（背景 + 前景各一组）
              </p>
              <div
                class="rounded-xl bg-muted/25 dark:bg-muted/40 p-md md:p-lg border border-border/40 dark:border-border/30"
              >
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-sm md:gap-md">
                  <div
                    v-for="family in COLOR_FAMILIES.pairFamilies"
                    :key="family"
                    class="rounded-md p-sm col-stretch gap-sm bg-background ring-1 ring-border/20 cursor-pointer transition-all duration-md"
                  >
                    <span class="text-xs font-semibold text-foreground capitalize">
                      {{ family }}
                    </span>
                    <div class="row-start gap-xs">
                      <!-- Background swatch -->
                      <div
                        class="flex-1 h-[var(--spacing-2xl)] rounded-sm center shadow-[inset_0_0_0_1px_rgb(var(--border)/0.4)]"
                        :style="{ background: cssVar(family) }"
                      >
                        <span
                          class="text-xs font-mono"
                          :style="{ color: cssVar(`${family}-foreground`) }"
                        >
                          Aa
                        </span>
                      </div>
                      <!-- Foreground on card -->
                      <div
                        class="flex-1 h-[var(--spacing-2xl)] rounded-sm center bg-muted/50 dark:bg-muted/60"
                      >
                        <span
                          class="text-sm font-bold"
                          :style="{ color: cssVar(family) }"
                        >
                          Aa
                        </span>
                      </div>
                    </div>
                    <div class="row-between">
                      <span class="text-xs font-mono text-muted-foreground">--{{ family }}</span>
                      <span class="text-xs font-mono text-muted-foreground">foreground</span>
                    </div>
                    <div class="row-between text-xs font-mono text-muted-foreground/70">
                      <span>{{ pairTokenChannelValues[family] }}</span>
                      <span>{{ pairTokenChannelValues[`${family}-foreground`] }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2c Quad Families（统一列标题 + 双列栅格） -->
            <div
              class="glass-card rounded-xl p-md md:p-xl lg:p-2xl col-stretch gap-md md:gap-lg xl:gap-xl"
            >
              <div class="col-stretch gap-xs">
                <h3 class="text-lg font-semibold text-foreground m-0">Quad Families</h3>
                <p class="text-xs text-muted-foreground m-0">
                  primary / accent / danger / warn / success / info / help — 下列每行 5
                  枚色块与表头一一对应
                </p>
              </div>
              <div
                class="rounded-xl bg-muted/25 dark:bg-muted/40 p-md md:p-lg border border-border/40 dark:border-border/30 col-stretch gap-md"
              >
                <CScrollbar
                  class="w-full min-w-0 !h-auto max-h-[var(--spacing-4xl)] -mx-xs sm:mx-0"
                >
                  <div
                    class="grid w-full min-w-[var(--spacing-5xl)] grid-cols-5 gap-xs px-xs sm:px-0"
                  >
                    <span
                      v-for="col in quadLegendColumns"
                      :key="col.label"
                      class="text-xs text-muted-foreground text-center font-medium"
                    >
                      {{ col.label }}
                    </span>
                  </div>
                </CScrollbar>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-md">
                  <div
                    v-for="family in COLOR_FAMILIES.quadFamilies"
                    :key="family"
                    class="rounded-md p-sm col-stretch gap-sm interactive-card"
                  >
                    <div class="row-between">
                      <span class="text-sm font-semibold text-foreground capitalize">
                        {{ family }}
                      </span>
                      <div
                        class="px-sm py-xs rounded-sm text-xs font-medium shrink-0"
                        :style="{
                          background: cssVar(family),
                          color: cssVar(`${family}-foreground`),
                        }"
                      >
                        Button
                      </div>
                    </div>
                    <div class="grid grid-cols-5 gap-xs">
                      <div
                        v-for="item in quadTokens(family)"
                        :key="item.token"
                        class="h-[var(--spacing-xl)] w-full rounded-sm center overflow-hidden shadow-[inset_0_0_0_1px_rgb(var(--border)/0.3)]"
                        :class="isQuadBgMaterialToken(family, item) ? 'interactive-item' : ''"
                        :style="quadSwatchCellStyle(family, item)"
                        @click="onQuadSwatchBgClick(family, item)"
                      >
                        <span
                          v-if="quadSwatchShowAa(family, item)"
                          class="text-sm font-bold leading-none interactive-item"
                          @click.stop="copyClassName(`text-${item.token}`, '卡片字色')"
                        >
                          Aa
                        </span>
                      </div>
                    </div>
                    <div
                      class="row-start flex-wrap gap-xs pt-xs shadow-[inset_0_1px_0_0_rgb(var(--border)/0.2)]"
                    >
                      <span
                        v-for="u in quadUsageFor(family)"
                        :key="u"
                        class="text-xs px-xs py-xs rounded-full leading-none"
                        :class="`bg-${family}/10 text-${family}`"
                      >
                        {{ u }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2c-b 配色 Alpha 全览（背景：内联 rgb(var(--*) / α)；字色/描边：Quad） -->
            <div
              class="glass-card rounded-xl p-md md:p-xl lg:p-2xl col-stretch gap-md md:gap-lg xl:gap-xl w-full"
            >
              <div class="col-stretch gap-xs">
                <h3 class="text-lg font-semibold text-foreground m-0">配色 Alpha 全览</h3>
                <p class="text-xs text-muted-foreground m-0">
                  背景阶梯使用
                  <code class="code-inline">rgb(var(--token) / α)</code>
                  内联渲染（5–90），覆盖 Quad 七族功能色背景阶梯。
                  <code class="code-inline">text-* / 40–100</code>
                  与
                  <code class="code-inline">border-* / 10–50</code>
                  仅针对 Quad 七族。
                </p>
              </div>

              <div
                v-for="(group, gi) in ALPHA_BG_LAYER_GROUPS"
                :key="group.title"
                class="col-stretch gap-md"
                :class="gi > 0 ? 'pt-md shadow-[inset_0_1px_0_0_rgb(var(--border)/0.15)]' : ''"
              >
                <h4 class="text-xs font-semibold text-muted-foreground m-0 tracking-wide">
                  {{ group.title }}
                </h4>
                <div class="col-stretch gap-lg">
                  <div
                    v-for="name in group.families"
                    :key="`${group.title}-${name}`"
                    class="col-stretch gap-sm"
                  >
                    <span class="text-xs font-mono text-foreground font-semibold">{{ name }}</span>
                    <div
                      class="rounded-xl bg-muted/25 dark:bg-muted/40 border border-border/40 dark:border-border/30 p-md md:p-lg"
                    >
                      <CScrollbar class="w-full min-w-0 !h-auto max-h-[var(--spacing-5xl)] pb-xs">
                        <div class="row-start gap-xs min-w-max">
                          <div
                            v-for="step in SEMANTIC_ALPHA_STEPS"
                            :key="`${name}-${step}`"
                            class="col-stretch gap-xs items-center min-w-[var(--spacing-3xl)] shrink-0"
                          >
                            <div
                              class="h-[var(--spacing-2xl)] w-full rounded-sm shadow-[inset_0_0_0_1px_rgb(var(--border)/0.12)] interactive-item"
                              :style="{
                                backgroundColor: `rgb(var(--${semanticColorVarBase(name)}) / ${step / 100})`,
                              }"
                              :title="`--${semanticColorVarBase(name)} / ${step}%`"
                              @click="copyClassName(`bg-${name}/${step}`, '背景透明度')"
                            />
                            <span class="text-xs font-mono text-muted-foreground text-center">
                              {{ step }}
                            </span>
                          </div>
                        </div>
                      </CScrollbar>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-stretch gap-md shadow-[inset_0_1px_0_0_rgb(var(--border)/0.2)] pt-md">
                <h4 class="text-xs font-semibold text-muted-foreground m-0">
                  Quad 字色 text-* / n（40–100）
                </h4>
                <p class="text-xs text-muted-foreground m-0">
                  置于
                  <code class="code-inline">bg-card</code>
                  上；七族全覆盖。
                </p>
                <div class="col-stretch gap-md">
                  <div
                    v-for="family in COLOR_FAMILIES.quadFamilies"
                    :key="`text-alpha-${family}`"
                    class="col-stretch gap-xs"
                  >
                    <span class="text-xs font-mono text-foreground font-semibold capitalize">
                      {{ family }}
                    </span>
                    <div
                      class="rounded-xl p-md md:p-lg row-start flex-wrap gap-sm border border-border/40 dark:border-border/30 bg-muted/15 dark:bg-muted/25"
                    >
                      <span
                        v-for="t in TEXT_ALPHA_STEPS"
                        :key="`${family}-text-${t}`"
                        class="text-sm font-semibold font-mono interactive-item rounded-sm px-xs py-xs"
                        :style="{ color: `rgb(var(--${family}) / ${t / 100})` }"
                        :title="`--${family} / ${t}%`"
                        @click="copyClassName(`text-${family}/${t}`, '字色透明度')"
                      >
                        {{ t }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-stretch gap-md">
                <h4 class="text-xs font-semibold text-muted-foreground m-0">
                  Quad 描边 border-* / n（10–50）
                </h4>
                <p class="text-xs text-muted-foreground m-0">
                  <code class="code-inline">border-2</code>
                  + 语义色透明度；七族全覆盖。
                </p>
                <div class="col-stretch gap-md">
                  <div
                    v-for="family in COLOR_FAMILIES.quadFamilies"
                    :key="`border-alpha-${family}`"
                    class="col-stretch gap-xs"
                  >
                    <span class="text-xs font-mono text-foreground font-semibold capitalize">
                      {{ family }}
                    </span>
                    <div class="row-start flex-wrap gap-sm">
                      <div
                        v-for="b in BORDER_ALPHA_STEPS"
                        :key="`${family}-border-${b}`"
                        class="h-[var(--spacing-3xl)] min-w-[var(--spacing-2xl)] flex-1 rounded-md bg-background center border-2 border-solid px-sm interactive-item"
                        :style="{ borderColor: `rgb(var(--${family}) / ${b / 100})` }"
                        :title="`--${family} / ${b}%`"
                        @click="copyClassName(`border-${family}/${b}`, '描边透明度')"
                      >
                        <span class="text-xs font-mono text-muted-foreground text-center">
                          {{ b }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2d Sidebar Tokens (8) -->
            <div
              class="glass-card rounded-xl p-md md:p-xl lg:p-2xl col-stretch gap-md md:gap-lg xl:gap-xl"
            >
              <h3 class="text-lg font-semibold text-foreground m-0">Sidebar Tokens（8）</h3>
              <div class="col-stretch gap-md md:row-start md:items-start md:gap-lg">
                <!-- Mini sidebar preview -->
                <div
                  class="w-[var(--spacing-5xl)] rounded-xl overflow-hidden shadow-md col-stretch shrink-0 shadow-[inset_0_0_0_1px_rgb(var(--sidebar-border))]"
                  :style="{ background: cssVar('sidebar-background') }"
                >
                  <div
                    class="px-sm py-xs text-xs font-semibold shadow-[0_1px_0_0_rgb(var(--sidebar-border))]"
                    :style="{ color: cssVar('sidebar-foreground') }"
                  >
                    Sidebar Preview
                  </div>
                  <div class="col-stretch gap-xs p-xs">
                    <div
                      class="px-sm py-xs rounded-sm text-xs font-medium"
                      :style="{
                        background: cssVar('sidebar-primary'),
                        color: cssVar('sidebar-primary-foreground'),
                      }"
                    >
                      Active Menu
                    </div>
                    <div
                      class="px-sm py-xs rounded-sm text-xs"
                      :style="{
                        background: cssVar('sidebar-accent'),
                        color: cssVar('sidebar-accent-foreground'),
                      }"
                    >
                      Hovered Item
                    </div>
                    <div
                      class="px-sm py-xs text-xs"
                      :style="{ color: cssVar('sidebar-foreground') }"
                    >
                      Normal Item
                    </div>
                  </div>
                </div>
                <!-- Token swatches -->
                <div
                  class="grid grid-cols-2 sm:grid-cols-4 gap-sm flex-1 min-w-0 rounded-xl bg-muted/25 dark:bg-muted/40 p-md md:p-lg border border-border/40 dark:border-border/30"
                >
                  <div
                    v-for="varName in sidebarVarNames"
                    :key="varName"
                    class="col-stretch gap-xs rounded-md p-xs interactive-item"
                    @click="copyClassName(sidebarVarNameToUnoBgClass(varName), 'Sidebar Token')"
                  >
                    <div
                      class="h-[var(--spacing-lg)] rounded-sm shadow-[inset_0_0_0_1px_rgb(var(--border)/0.3)]"
                      :style="{ background: cssVar(varName) }"
                    />
                    <span
                      class="text-xs font-mono text-muted-foreground leading-tight text-ellipsis-1"
                      :title="`--${varName}`"
                    >
                      --{{ varName }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ═══ §3 Light / Dark Mode Comparison ═══ -->
          <section class="col-stretch gap-md">
            <div class="row-between gap-sm min-w-0 shrink-0">
              <div class="col-between min-w-0 flex-1 gap-xs">
                <div class="flex flex-row items-center justify-start gap-xs min-w-0">
                  <Icons
                    name="i-lucide-contrast"
                    class="shrink-0 text-warn"
                  />
                  <h2 class="m-0 min-w-0 text-lg font-semibold text-ellipsis-1">
                    亮色 / 暗色模式对比
                  </h2>
                </div>
                <p class="m-0 min-w-0 text-xs text-muted-foreground">
                  当前预设「{{ formatPresetName(themeStore.themeName) }}」双模式色值静态预览
                </p>
              </div>
              <span class="surface-warn rounded-md px-sm py-xs text-xs font-semibold uppercase">
                Preview
              </span>
            </div>

            <div
              class="glass-card rounded-xl p-md md:p-xl lg:p-2xl col-stretch gap-md md:gap-lg xl:gap-xl"
            >
              <div
                class="rounded-xl bg-muted/25 dark:bg-muted/40 p-md md:p-lg border border-border/40 dark:border-border/30"
              >
                <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <!-- Light preview -->
                  <div
                    class="rounded-xl p-lg col-stretch gap-md shadow-sm"
                    :style="lightStyles.root"
                  >
                    <div class="row-between gap-sm min-w-0 items-center">
                      <span class="text-sm font-semibold">亮色模式</span>
                      <Icons
                        name="i-lucide-sun"
                        size="md"
                        class="shrink-0"
                        :style="lightStyles.icon"
                      />
                    </div>
                    <div
                      class="rounded-lg p-md col-stretch gap-sm"
                      :style="lightStyles.card"
                    >
                      <span
                        class="text-xs font-medium"
                        :style="lightStyles.fg"
                      >
                        Card Surface
                      </span>
                      <div
                        class="rounded-md p-sm"
                        :style="lightStyles.muted"
                      >
                        <span
                          class="text-xs"
                          :style="lightStyles.mutedFg"
                        >
                          Muted Region
                        </span>
                      </div>
                    </div>
                    <div class="row-start gap-sm flex-wrap">
                      <div
                        v-for="family in COLOR_FAMILIES.quadFamilies"
                        :key="`light-${family}`"
                        class="px-md py-xs rounded-md text-xs font-medium capitalize"
                        :style="lightQuadChips[family]"
                      >
                        {{ family }}
                      </div>
                    </div>
                    <div class="col-stretch gap-xs">
                      <span
                        class="text-sm font-medium"
                        :style="lightStyles.fg"
                      >
                        Foreground Text
                      </span>
                      <span
                        class="text-xs"
                        :style="lightStyles.mutedFg"
                      >
                        Muted / Secondary Text
                      </span>
                    </div>
                  </div>

                  <!-- Dark preview -->
                  <div
                    class="rounded-xl p-lg col-stretch gap-md shadow-sm"
                    :style="darkStyles.root"
                  >
                    <div class="row-between gap-sm min-w-0 items-center">
                      <span class="text-sm font-semibold">暗色模式</span>
                      <Icons
                        name="i-lucide-moon"
                        size="md"
                        class="shrink-0"
                        :style="darkStyles.icon"
                      />
                    </div>
                    <div
                      class="rounded-lg p-md col-stretch gap-sm"
                      :style="darkStyles.card"
                    >
                      <span
                        class="text-xs font-medium"
                        :style="darkStyles.fg"
                      >
                        Card Surface
                      </span>
                      <div
                        class="rounded-md p-sm"
                        :style="darkStyles.muted"
                      >
                        <span
                          class="text-xs"
                          :style="darkStyles.mutedFg"
                        >
                          Muted Region
                        </span>
                      </div>
                    </div>
                    <div class="row-start gap-sm flex-wrap">
                      <div
                        v-for="family in COLOR_FAMILIES.quadFamilies"
                        :key="`dark-${family}`"
                        class="px-md py-xs rounded-md text-xs font-medium capitalize"
                        :style="darkQuadChips[family]"
                      >
                        {{ family }}
                      </div>
                    </div>
                    <div class="col-stretch gap-xs">
                      <span
                        class="text-sm font-medium"
                        :style="darkStyles.fg"
                      >
                        Foreground Text
                      </span>
                      <span
                        class="text-xs"
                        :style="darkStyles.mutedFg"
                      >
                        Muted / Secondary Text
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ═══ §4 PrimeVue Component Demos ═══ -->
          <section class="col-stretch gap-md">
            <div class="row-between gap-sm min-w-0 shrink-0">
              <div class="col-between min-w-0 flex-1 gap-xs">
                <div class="flex flex-row items-center justify-start gap-xs min-w-0">
                  <Icons
                    name="i-lucide-component"
                    class="shrink-0 text-success"
                  />
                  <h2 class="m-0 min-w-0 text-lg font-semibold text-ellipsis-1">
                    PrimeVue 组件主题化演示
                  </h2>
                </div>
                <p class="m-0 min-w-0 text-xs text-muted-foreground">
                  PT Global 预设（PREMIUM_INPUT_ROOT）— 无边框输入框，背景 bg-muted/30
                </p>
              </div>
              <span class="surface-success rounded-md px-sm py-xs text-xs font-semibold uppercase">
                PrimeVue
              </span>
            </div>

            <div
              class="glass-card rounded-xl p-md md:p-xl lg:p-2xl col-stretch gap-md md:gap-lg xl:gap-xl"
            >
              <h3 class="text-lg font-semibold text-foreground m-0">输入控件</h3>
              <div
                class="rounded-xl bg-muted/25 dark:bg-muted/40 p-md md:p-lg border border-border/40 dark:border-border/30"
              >
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
                  <div class="col-stretch gap-xs">
                    <label class="text-xs text-muted-foreground">InputText</label>
                    <InputText
                      :model-value="demoInput"
                      placeholder="输入内容…"
                      class="w-full"
                      @update:model-value="
                        (v: string | undefined) => {
                          demoInput = v ?? ''
                        }
                      "
                    />
                  </div>
                  <div class="col-stretch gap-xs">
                    <label class="text-xs text-muted-foreground">Select</label>
                    <Select
                      v-model="demoSelectValue"
                      :options="demoSelectOptions"
                      option-label="label"
                      option-value="value"
                      class="w-full"
                    />
                  </div>
                  <div class="col-stretch gap-xs">
                    <label class="text-xs text-muted-foreground">DatePicker</label>
                    <DatePicker
                      class="w-full"
                      placeholder="选择日期"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              class="glass-card rounded-xl p-md md:p-xl lg:p-2xl col-stretch gap-md md:gap-lg xl:gap-xl"
            >
              <h3 class="text-lg font-semibold text-foreground m-0">按钮 Severity（8）与变体</h3>
              <div class="row-start gap-sm flex-wrap">
                <Button label="Primary" />
                <Button
                  label="Secondary"
                  severity="secondary"
                />
                <Button
                  label="Success"
                  severity="success"
                />
                <Button
                  label="Info"
                  severity="info"
                />
                <Button
                  label="Warn"
                  severity="warn"
                />
                <Button
                  label="Help"
                  severity="help"
                />
                <Button
                  label="Danger"
                  severity="danger"
                />
                <Button
                  label="Contrast"
                  severity="contrast"
                />
              </div>
              <div class="col-stretch gap-xs">
                <span class="text-xs text-muted-foreground">变体</span>
                <div class="row-start gap-sm flex-wrap">
                  <Button
                    label="Outlined"
                    outlined
                  />
                  <Button
                    label="Text"
                    text
                  />
                </div>
              </div>
            </div>

            <div
              class="glass-card rounded-xl p-md md:p-xl lg:p-2xl col-stretch gap-md md:gap-lg xl:gap-xl"
            >
              <h3 class="text-lg font-semibold text-foreground m-0">开关、Chip 与语义色块</h3>
              <div class="col-stretch gap-md">
                <div class="row-center gap-sm">
                  <ToggleSwitch v-model="demoToggle" />
                  <span class="text-sm text-foreground">
                    {{ demoToggle ? '已启用' : '已禁用' }}
                  </span>
                </div>
                <div class="row-start gap-sm flex-wrap">
                  <Chip label="Primary" />
                  <Chip label="Accent" />
                </div>
                <div class="row-start gap-xs flex-wrap">
                  <span
                    class="px-sm py-xs rounded-full text-xs font-medium bg-success/15 text-success"
                  >
                    成功
                  </span>
                  <span class="px-sm py-xs rounded-full text-xs font-medium bg-warn/15 text-warn">
                    警告
                  </span>
                  <span
                    class="px-sm py-xs rounded-full text-xs font-medium bg-danger/15 text-danger"
                  >
                    危险
                  </span>
                  <span class="px-sm py-xs rounded-full text-xs font-medium bg-info/15 text-info">
                    信息
                  </span>
                  <span class="px-sm py-xs rounded-full text-xs font-medium bg-help/15 text-help">
                    帮助
                  </span>
                  <span
                    class="px-sm py-xs rounded-full text-xs font-medium bg-primary/15 text-primary"
                  >
                    品牌
                  </span>
                  <span
                    class="px-sm py-xs rounded-full text-xs font-medium bg-accent/15 text-accent"
                  >
                    强调
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AnimateWrapper>
  </div>
</template>

<style lang="scss" scoped></style>
