<script setup lang="ts">
import { LAYOUT_DIMENSION_KEYS, SIZE_PRESETS } from '@ccd/design-tokens'
import { SIZE_SCALE_KEYS, type SizeScaleKey } from '@ccd/design-tokens'
import { goToRoute } from '@/router/utils/helper'
import { radiusPx, spacingPx } from '@ccd/vue-charts'

defineOptions({ name: 'SizeSystemPage' })

const COPY_TOAST_GROUP = 'tr' as const
const sizeStore = useSizeStore()

const { copy: copyToClipboard, isSupported: isClipboardSupported } = useClipboard({
  legacy: true,
})

type SpacingDemoKey = 'none' | SizeScaleKey
type RadiusDemoKey = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

interface RadiusDemoRow {
  token: RadiusDemoKey
  roundedClass: string
}

interface TypographyScaleRow {
  token: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
  textClass: string
  cssVarName: keyof Pick<
    SizeCssVars,
    | '--font-size-xs'
    | '--font-size-sm'
    | '--font-size-md'
    | '--font-size-lg'
    | '--font-size-xl'
    | '--font-size-2xl'
    | '--font-size-3xl'
    | '--font-size-4xl'
    | '--font-size-5xl'
  >
}

interface LayoutDemoItem {
  key: (typeof LAYOUT_DIMENSION_KEYS)[number]
  className: string
  axis: 'width' | 'height'
}

interface TypographyRenderMetric {
  fontSize: string
  lineHeight: string
}

const TYPO_SAMPLE = '全局空间系统要求可读性、节奏与呼吸感同时成立。'

const SPACING_DEMO_KEYS: SpacingDemoKey[] = ['none', ...SIZE_SCALE_KEYS]

const RADIUS_DEMO_ROWS: RadiusDemoRow[] = [
  { token: 'none', roundedClass: 'rounded-none' },
  { token: 'sm', roundedClass: 'rounded-sm' },
  { token: 'md', roundedClass: 'rounded-md' },
  { token: 'lg', roundedClass: 'rounded-lg' },
  { token: 'xl', roundedClass: 'rounded-xl' },
  { token: '2xl', roundedClass: 'rounded-2xl' },
  { token: 'full', roundedClass: 'rounded-full' },
]

const TYPOGRAPHY_SCALE: readonly TypographyScaleRow[] = [
  { token: 'xs', textClass: 'text-xs', cssVarName: '--font-size-xs' },
  { token: 'sm', textClass: 'text-sm', cssVarName: '--font-size-sm' },
  { token: 'base', textClass: 'text-base', cssVarName: '--font-size-md' },
  { token: 'lg', textClass: 'text-lg', cssVarName: '--font-size-lg' },
  { token: 'xl', textClass: 'text-xl', cssVarName: '--font-size-xl' },
  { token: '2xl', textClass: 'text-2xl', cssVarName: '--font-size-2xl' },
  { token: '3xl', textClass: 'text-3xl', cssVarName: '--font-size-3xl' },
  { token: '4xl', textClass: 'text-4xl', cssVarName: '--font-size-4xl' },
  { token: '5xl', textClass: 'text-5xl', cssVarName: '--font-size-5xl' },
] as const

const LAYOUT_DEMO_ITEMS: LayoutDemoItem[] = [
  { key: 'sidebarWidth', className: 'w-sidebarWidth', axis: 'width' },
  { key: 'sidebarCollapsedWidth', className: 'w-sidebarCollapsedWidth', axis: 'width' },
  { key: 'headerHeight', className: 'h-headerHeight', axis: 'height' },
  { key: 'breadcrumbHeight', className: 'h-breadcrumbHeight', axis: 'height' },
  { key: 'footerHeight', className: 'h-footerHeight', axis: 'height' },
  { key: 'tabsHeight', className: 'h-tabsHeight', axis: 'height' },
]

const currentPreset = computed(() => sizeStore.currentPreset)
const sizeCssSnapshotKey = computed(() => sizeStore.sizeName)

const typographyResolvedValues = computed<Record<string, TypographyRenderMetric>>(() => {
  void sizeCssSnapshotKey.value
  const out: Record<string, TypographyRenderMetric> = {}
  if (typeof document === 'undefined') return out
  const host = document.createElement('span')
  host.style.position = 'fixed'
  host.style.visibility = 'hidden'
  host.style.pointerEvents = 'none'
  host.textContent = 'Ag'
  document.body.appendChild(host)
  for (const row of TYPOGRAPHY_SCALE) {
    host.className = row.textClass
    const style = getComputedStyle(host)
    out[row.textClass] = {
      fontSize: style.fontSize || '—',
      lineHeight: style.lineHeight || '—',
    }
  }
  host.remove()
  return out
})

const layoutResolvedValues = computed<Record<string, string>>(() => {
  void sizeCssSnapshotKey.value
  const out: Record<string, string> = {}
  if (typeof document === 'undefined') return out
  const root = document.documentElement
  for (const key of LAYOUT_DIMENSION_KEYS) {
    const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
    const value = getComputedStyle(root).getPropertyValue(cssVar).trim()
    out[key] = value.length > 0 ? value : '—'
  }
  return out
})

function isActive(name: SizeMode): boolean {
  return sizeStore.sizeName === name
}

function setDensityPreset(name: SizeMode): void {
  sizeStore.setSize(name)
}

function paddingClass(key: SpacingDemoKey): string {
  return key === 'none' ? 'p-0' : `p-${key}`
}

function marginClass(key: SpacingDemoKey): string {
  return key === 'none' ? 'm-0' : `m-${key}`
}

function getSpacingLabel(key: SpacingDemoKey): string {
  if (key === 'none') return '0 px'
  return `${spacingPx(currentPreset.value, key)} px`
}

function getRadiusLabel(token: RadiusDemoKey): string {
  if (token === 'none') return '0 px'
  if (token === 'full') return '∞'
  return `${radiusPx(currentPreset.value, token)} px`
}

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
</script>

<template>
  <div data-archetype="A1-toolbar-content">
    <AnimateWrapper enter="fadeInUp">
      <div class="col-stretch gap-md min-h-0 min-w-0">
        <div class="layout-narrow col-stretch gap-md min-w-0">
          <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
            <div class="row-between gap-md min-w-0">
              <div class="col-between min-w-0 flex-1 gap-xs">
                <div class="flex flex-row flex-wrap items-center justify-start gap-sm min-w-0">
                  <div class="glass-icon-box shrink-0">
                    <Icons
                      name="i-lucide-ruler"
                      size="xl"
                      class="text-primary"
                    />
                  </div>
                  <div class="col-stretch gap-xs min-w-0">
                    <div class="flex flex-row flex-wrap items-center justify-start gap-xs min-w-0">
                      <span class="text-lg font-bold text-foreground text-no-wrap">
                        Space Engine V2 · 全景物理尺寸矩阵
                      </span>
                      <span
                        class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase"
                      >
                        Size Engine
                      </span>
                    </div>
                    <span class="text-sm text-muted-foreground text-ellipsis-1">
                      Box Model / Shape / Typography / Layout Dimensions 全链路可视化，实时联动全局
                      Size Engine
                    </span>
                    <p class="text-xs text-muted-foreground m-0 row-start gap-xs flex-wrap">
                      <span>当前密度：</span>
                      <span class="font-mono text-primary">{{ sizeStore.sizeName }}</span>
                      <span class="text-muted-foreground/40">·</span>
                      <span>色彩系统见</span>
                      <Button
                        label="主题系统"
                        link
                        size="small"
                        class="p-0 h-auto underline decoration-primary/40 underline-offset-2"
                        @click="goToRoute('ExampleSystemConfigurationTheme')"
                      />
                    </p>
                  </div>
                </div>
              </div>
              <span
                class="surface-primary rounded-md px-sm py-xs text-xs font-semibold font-mono shrink-0"
              >
                {{ sizeStore.sizeName }}
              </span>
            </div>
          </header>

          <section class="col-stretch gap-md">
            <div class="row-between gap-sm min-w-0 shrink-0">
              <div class="col-between min-w-0 flex-1 gap-xs">
                <div class="flex flex-row items-center justify-start gap-xs min-w-0">
                  <Icons
                    name="i-lucide-sliders-horizontal"
                    class="shrink-0 text-primary"
                  />
                  <h2 class="m-0 min-w-0 text-lg font-semibold text-ellipsis-1">密度引擎控制器</h2>
                </div>
                <p class="m-0 min-w-0 text-xs text-muted-foreground">
                  点击切换预设，所有尺寸变量原子级更新，下面所有矩阵同步变化
                </p>
              </div>
              <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
                Density
              </span>
            </div>

            <!-- 与主题预设区同构：glass-card + demo well，选中态 primary 浅底 + ring（Size & Density SSOT） -->
            <div
              class="glass-card rounded-xl p-md md:p-xl lg:p-2xl col-stretch gap-md md:gap-lg xl:gap-xl"
            >
              <div
                class="rounded-xl bg-muted/25 dark:bg-muted/40 border border-border/40 dark:border-border/30 p-md md:p-lg"
              >
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-sm md:gap-md">
                  <Button
                    v-for="preset in SIZE_PRESETS"
                    :key="preset.name"
                    text
                    :class="[
                      'w-full min-h-0 rounded-lg col-stretch gap-md p-md transition-all duration-md ease-spring',
                      isActive(preset.name)
                        ? 'bg-primary/12 dark:bg-primary/15 border border-primary/35 shadow-sm ring-2 ring-primary ring-offset-2 ring-offset-background'
                        : 'interactive-card motion-lift border border-border/30 bg-card',
                    ]"
                    :pt="{
                      root: { class: 'justify-start' },
                    }"
                    @click="setDensityPreset(preset.name)"
                  >
                    <div class="row-between gap-sm min-w-0">
                      <span
                        class="text-base font-semibold text-foreground text-left text-ellipsis-1"
                      >
                        {{ preset.label }}
                      </span>
                      <span
                        v-if="isActive(preset.name)"
                        class="w-[var(--spacing-sm)] h-[var(--spacing-sm)] rounded-full bg-primary shrink-0"
                        aria-hidden="true"
                      />
                    </div>
                    <div
                      class="col-stretch gap-xs pt-xs shadow-[inset_0_1px_0_0_rgb(var(--border)/0.2)]"
                    >
                      <div class="row-between gap-sm min-w-0">
                        <span class="text-xs text-muted-foreground shrink-0">字号基准</span>
                        <span class="text-xs font-mono text-foreground tabular-nums">
                          {{ preset.fontSizeBase }}px
                        </span>
                      </div>
                      <div class="row-between gap-sm min-w-0">
                        <span class="text-xs text-muted-foreground shrink-0">间距基数</span>
                        <span class="text-xs font-mono text-foreground tabular-nums">
                          {{ preset.spacingBase }}px
                        </span>
                      </div>
                      <div class="row-between gap-sm min-w-0">
                        <span class="text-xs text-muted-foreground shrink-0">圆角基数</span>
                        <span class="text-xs font-mono text-foreground tabular-nums">
                          {{ preset.radius }}px
                        </span>
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section class="col-stretch gap-md">
            <div class="row-between gap-sm min-w-0 shrink-0">
              <div class="col-between min-w-0 flex-1 gap-xs">
                <div class="flex flex-row items-center justify-start gap-xs min-w-0">
                  <Icons
                    name="i-lucide-layers"
                    class="shrink-0 text-primary"
                  />
                  <h2 class="m-0 min-w-0 text-lg font-semibold text-ellipsis-1">
                    模块 1 · Box Model 完整组（Padding & Margin）
                  </h2>
                </div>
                <p class="m-0 min-w-0 text-xs text-muted-foreground">
                  采用物理真实撑开模型：Token 越大，盒体越大；不再固定高度裁切
                </p>
              </div>
              <span class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase">
                Box
              </span>
            </div>

            <div class="material-elevated rounded-xl p-md md:p-xl lg:p-2xl col-stretch gap-lg">
              <div class="col-stretch gap-sm">
                <p class="text-sm font-medium text-foreground m-0">
                  Padding 清单（类名 + 实际尺寸）
                </p>
                <div class="col-stretch gap-xs">
                  <Button
                    v-for="key in SPACING_DEMO_KEYS"
                    :key="`padding-${key}`"
                    text
                    class="interactive-item rounded-md row-between gap-md p-sm md:p-md w-full bg-primary/8"
                    @click="copyClassName(paddingClass(key), '内边距')"
                  >
                    <span class="text-xs font-mono text-primary shrink-0">
                      {{ paddingClass(key) }}
                    </span>
                    <span class="text-xs text-muted-foreground">padding</span>
                    <span class="text-xs font-mono text-foreground shrink-0">
                      {{ getSpacingLabel(key) }}
                    </span>
                  </Button>
                </div>
              </div>

              <div class="col-stretch gap-sm">
                <p class="text-sm font-medium text-foreground m-0">
                  Margin 清单（类名 + 实际尺寸）
                </p>
                <div class="col-stretch gap-xs">
                  <Button
                    v-for="key in SPACING_DEMO_KEYS"
                    :key="`margin-${key}`"
                    text
                    class="interactive-item rounded-md row-between gap-md p-sm md:p-md w-full bg-info/8"
                    @click="copyClassName(marginClass(key), '外边距')"
                  >
                    <span class="text-xs font-mono text-primary shrink-0">
                      {{ marginClass(key) }}
                    </span>
                    <span class="text-xs text-muted-foreground">margin</span>
                    <span class="text-xs font-mono text-foreground shrink-0">
                      {{ getSpacingLabel(key) }}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section class="col-stretch gap-md">
            <div class="row-between gap-sm min-w-0 shrink-0">
              <div class="col-between min-w-0 flex-1 gap-xs">
                <div class="flex flex-row items-center justify-start gap-xs min-w-0">
                  <Icons
                    name="i-lucide-circle-dashed"
                    class="shrink-0 text-accent"
                  />
                  <h2 class="m-0 min-w-0 text-lg font-semibold text-ellipsis-1">
                    模块 2 · Shape & Icon（Radius 工业曲线 & Icon 尺寸）
                  </h2>
                </div>
                <p class="m-0 min-w-0 text-xs text-muted-foreground">
                  高对比度底板 + ring 边界，确保圆角曲线清晰可辨
                </p>
              </div>
              <span class="surface-warn rounded-md px-sm py-xs text-xs font-semibold uppercase">
                Shape
              </span>
            </div>

            <div class="material-elevated rounded-xl p-md md:p-xl lg:p-2xl col-stretch gap-lg">
              <div class="col-stretch gap-sm">
                <p class="text-sm font-medium text-foreground m-0">Radius 曲线</p>
                <div class="row-start flex-wrap gap-md">
                  <Button
                    v-for="row in RADIUS_DEMO_ROWS"
                    :key="row.token"
                    text
                    class="interactive-card p-md col-center gap-sm"
                    @click="copyClassName(row.roundedClass, '圆角')"
                  >
                    <div
                      class="w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] bg-primary/20 ring-1 ring-border"
                      :class="row.roundedClass"
                    />
                    <span class="text-xs font-mono text-foreground">{{ row.roundedClass }}</span>
                    <span class="text-xs text-muted-foreground">
                      {{ getRadiusLabel(row.token) }}
                    </span>
                  </Button>
                </div>
              </div>

              <div class="col-stretch gap-sm">
                <p class="text-sm font-medium text-foreground m-0">Icon 尺寸阶梯</p>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-sm md:gap-md">
                  <Button
                    v-for="key in SIZE_SCALE_KEYS"
                    :key="`icon-${key}`"
                    text
                    class="interactive-card p-md col-center gap-sm"
                    @click="copyClassName(key, '图标尺寸')"
                  >
                    <div
                      class="center rounded-md bg-muted/30 ring-1 ring-border w-[var(--spacing-3xl)] h-[var(--spacing-3xl)]"
                    >
                      <Icons
                        name="i-lucide-box"
                        :size="key"
                        class="text-primary"
                      />
                    </div>
                    <span class="text-xs font-mono text-foreground">{{ key }}</span>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section class="col-stretch gap-md">
            <div class="row-between gap-sm min-w-0 shrink-0">
              <div class="col-between min-w-0 flex-1 gap-xs">
                <div class="flex flex-row items-center justify-start gap-xs min-w-0">
                  <Icons
                    name="i-lucide-type"
                    class="shrink-0 text-info"
                  />
                  <h2 class="m-0 min-w-0 text-lg font-semibold text-ellipsis-1">
                    模块 3 · Typography 呼吸感（Font Size & Line Height）
                  </h2>
                </div>
                <p class="m-0 min-w-0 text-xs text-muted-foreground">
                  展示字号、真实 px、行高与多行文本呼吸感；点击行可复制 text token
                </p>
              </div>
              <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
                Type
              </span>
            </div>

            <div class="material-elevated rounded-xl p-md md:p-xl lg:p-2xl col-stretch gap-lg">
              <div class="col-stretch gap-xs">
                <Button
                  v-for="row in TYPOGRAPHY_SCALE"
                  :key="row.textClass"
                  text
                  class="interactive-item rounded-md row-between gap-md p-sm md:p-md w-full bg-muted/20"
                  @click="copyClassName(row.textClass, '字号')"
                >
                  <span class="text-xs font-mono text-primary shrink-0 w-[var(--spacing-4xl)]">
                    {{ row.textClass }}
                  </span>
                  <div class="col-stretch flex-1 min-w-0 gap-xs">
                    <span
                      :class="row.textClass"
                      class="text-foreground"
                    >
                      {{ TYPO_SAMPLE }}
                    </span>
                    <span
                      :class="row.textClass"
                      class="text-muted-foreground"
                    >
                      建议保持统一节奏，避免行高挤压导致信息密度失衡。
                    </span>
                  </div>
                  <div class="col-end shrink-0 gap-xs">
                    <span class="text-xs font-mono text-muted-foreground">
                      font: {{ typographyResolvedValues[row.textClass]?.fontSize ?? '—' }}
                    </span>
                    <span class="text-xs font-mono text-muted-foreground">
                      line: {{ typographyResolvedValues[row.textClass]?.lineHeight ?? '—' }}
                    </span>
                  </div>
                </Button>
              </div>
            </div>
          </section>

          <section class="col-stretch gap-md">
            <div class="row-between gap-sm min-w-0 shrink-0">
              <div class="col-between min-w-0 flex-1 gap-xs">
                <div class="flex flex-row items-center justify-start gap-xs min-w-0">
                  <Icons
                    name="i-lucide-layout-template"
                    class="shrink-0 text-success"
                  />
                  <h2 class="m-0 min-w-0 text-lg font-semibold text-ellipsis-1">
                    模块 4 · Layout Dimensions（布局动态常量）
                  </h2>
                </div>
                <p class="m-0 min-w-0 text-xs text-muted-foreground">
                  绑定 `LAYOUT_DIMENSION_KEYS`，直接读取运行时 CSS 变量结果
                </p>
              </div>
              <span class="surface-success rounded-md px-sm py-xs text-xs font-semibold uppercase">
                Layout
              </span>
            </div>

            <div class="material-elevated rounded-xl p-md md:p-xl lg:p-2xl col-stretch gap-lg">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
                <Button
                  v-for="item in LAYOUT_DEMO_ITEMS"
                  :key="item.key"
                  text
                  class="interactive-card rounded-lg p-md col-stretch gap-sm w-full"
                  @click="copyClassName(item.className, '布局尺寸')"
                >
                  <div class="row-between gap-sm">
                    <span class="text-xs font-mono text-primary">{{ item.className }}</span>
                    <span class="text-xs text-muted-foreground">
                      {{ layoutResolvedValues[item.key] ?? '—' }}
                    </span>
                  </div>
                  <div
                    v-if="item.axis === 'width'"
                    class="h-[var(--spacing-2xl)] max-w-full bg-info/30 ring-1 ring-border rounded-sm"
                    :class="item.className"
                  />
                  <div
                    v-else
                    class="w-full bg-success/30 ring-1 ring-border rounded-sm center"
                    :class="item.className"
                  >
                    <span class="text-xs text-foreground">height demo</span>
                  </div>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AnimateWrapper>
  </div>
</template>
