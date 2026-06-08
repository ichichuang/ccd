<script setup lang="ts">
import { semanticShortcuts } from '@ccd/unocss-preset'
import { goToRoute } from '@/router/utils/helper'
import {
  COPY_TOAST_GROUP,
  LAYOUT_MACRO_KEYS,
  UNOCSS_PAGE_SECTION_COUNT,
  easingDemos,
  flexMacroItems,
  interactionShowcaseItems,
  layoutMacroDemoCount,
  layoutMacroItems,
  mailItems,
  materialShowcaseItems,
  productCards,
  topicTags,
  zLayerCards,
  type LayoutMacroKey,
} from './unocss.demoData'

defineOptions({ name: 'UnoCssSystemPage' })

const layoutMacroExpandedTokens = computed<Record<LayoutMacroKey, string[]>>(() => {
  return Object.fromEntries(
    LAYOUT_MACRO_KEYS.map(key => {
      const raw = semanticShortcuts[key]
      const normalized = typeof raw === 'string' ? raw.replace(/\s+/g, ' ').trim() : ''
      const tokens = normalized ? normalized.split(' ').filter(Boolean) : []
      return [key, tokens]
    })
  ) as Record<LayoutMacroKey, string[]>
})

const section3ShortcutTokens = computed<Record<string, string[]>>(() => {
  const classNames: string[] = [
    ...materialShowcaseItems.map(item => item.className),
    ...interactionShowcaseItems.map(item => item.className),
  ]

  const uniqueClassNames = Array.from(new Set(classNames))
  return Object.fromEntries(
    uniqueClassNames.map(className => {
      const raw = semanticShortcuts[className as keyof typeof semanticShortcuts]
      const normalized = typeof raw === 'string' ? raw.replace(/\s+/g, ' ').trim() : className
      const tokens = normalized ? normalized.split(' ').filter(Boolean) : [className]
      return [className, tokens]
    })
  )
})

interface EngineOverviewStatCard {
  label: string
  value: string
  unit: string
  icon: string
  surface: 'surface-primary' | 'surface-info' | 'surface-warn' | 'surface-success'
  iconColor: string
}

const engineOverviewStats = computed<EngineOverviewStatCard[]>(() => [
  {
    label: '布局演示项',
    value: String(layoutMacroDemoCount),
    unit: '项',
    icon: 'i-lucide-layout-grid',
    surface: 'surface-primary',
    iconColor: 'text-primary',
  },
  {
    label: 'Z 轴语义层',
    value: String(zLayerCards.length),
    unit: '级',
    icon: 'i-lucide-layers',
    surface: 'surface-info',
    iconColor: 'text-info',
  },
  {
    label: '材质 / 交互',
    value: String(materialShowcaseItems.length + interactionShowcaseItems.length),
    unit: '类',
    icon: 'i-lucide-palette',
    surface: 'surface-warn',
    iconColor: 'text-warn',
  },
  {
    label: '内容分区',
    value: String(UNOCSS_PAGE_SECTION_COUNT),
    unit: '节',
    icon: 'i-lucide-book-open',
    surface: 'surface-success',
    iconColor: 'text-success',
  },
])

const { copy: copyToClipboard, isSupported: isClipboardSupported } = useClipboard({
  legacy: true,
})

async function copyClassName(className: string, label: string): Promise<void> {
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
    await copyToClipboard(className)
    window.$toast?.add({
      severity: 'success',
      summary: '已复制',
      detail: `${className}（${label}）`,
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
  <div
    class="col-stretch"
    data-archetype="A1-toolbar-content"
  >
    <AnimateWrapper enter="fadeInUp">
      <div class="col-stretch gap-md min-h-0 min-w-0">
        <div class="layout-narrow col-stretch gap-md min-w-0">
          <!-- Header -->
          <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
            <div class="row-between gap-md min-w-0">
              <div class="row-start gap-sm min-w-0 flex-wrap">
                <div class="glass-icon-box shrink-0">
                  <Icons
                    name="i-lucide-sparkles"
                    size="xl"
                    class="text-primary"
                  />
                </div>
                <div class="col-stretch gap-xs min-w-0">
                  <div class="row-start gap-xs min-w-0 flex-wrap">
                    <span class="text-lg font-bold text-no-wrap">UnoCSS 引擎快捷类全景</span>
                    <span
                      class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase"
                    >
                      UnoCSS Engine
                    </span>
                  </div>
                  <p class="text-sm text-muted-foreground m-0">
                    布局宏 · Z-Axis 层级 · 材质系统 · 文本溢出 · 动效缓动——Theme / Size
                    之外的底层能力
                  </p>
                  <div class="text-xs text-muted-foreground m-0 row-start gap-xs flex-wrap">
                    <span>布局演示项：</span>
                    <span class="font-mono text-primary">{{ layoutMacroDemoCount }} 项</span>
                    <span class="text-muted-foreground/40">
                      （Flex 9-Grid + Layout 四宏 + absolute-center）
                    </span>
                    <span class="text-muted-foreground/40">·</span>
                    <span>相关页面：</span>
                    <Button
                      label="主题系统"
                      link
                      size="small"
                      class="p-0 h-auto"
                      @click="goToRoute('ExampleSystemConfigurationTheme')"
                    />
                    <span>·</span>
                    <Button
                      label="尺寸系统"
                      link
                      size="small"
                      class="p-0 h-auto"
                      @click="goToRoute('ExampleSystemConfigurationSize')"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Engine overview — interactive-card + surface-* + glass-icon-box（对齐 Dashboard KPI 节奏） -->
            <div class="grid grid-cols-12 gap-md min-w-0">
              <div
                v-for="(stat, idx) in engineOverviewStats"
                :key="idx"
                class="col-span-12 md:col-span-6 xl:col-span-3 min-w-0 interactive-card motion-lift"
                :class="stat.surface"
              >
                <div class="row-start gap-sm min-w-0">
                  <div class="glass-icon-box shrink-0">
                    <Icons
                      :name="stat.icon"
                      size="xl"
                      :class="stat.iconColor"
                    />
                  </div>
                  <div class="col-stretch gap-xs min-w-0 flex-1">
                    <span class="text-xs text-muted-foreground text-no-wrap">{{ stat.label }}</span>
                    <div class="row-start gap-xs min-w-0">
                      <span class="text-2xl font-bold leading-none">
                        {{ stat.value }}
                      </span>
                      <span class="text-xs text-muted-foreground">{{ stat.unit }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <!-- Section 1: 布局引擎宏 -->
          <section class="col-stretch gap-md">
            <div class="row-between gap-sm min-w-0 shrink-0">
              <div class="col-between min-w-0 flex-1 gap-xs">
                <div class="flex flex-row items-center justify-start gap-xs min-w-0">
                  <Icons
                    name="i-lucide-layout-grid"
                    class="shrink-0 text-muted-foreground"
                  />
                  <h2 class="m-0 min-w-0 text-lg font-semibold text-ellipsis-1">
                    Section 1 · 布局引擎宏
                  </h2>
                </div>
                <p class="m-0 min-w-0 text-xs text-muted-foreground">
                  Flex 9-Grid 语义宏、absolute-center 定位、Layout 容器宏——点击类名可复制
                </p>
              </div>
              <span
                class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase shrink-0"
              >
                Layout
              </span>
            </div>
            <div class="glass-card col-stretch gap-md">
              <div
                class="rounded-xl bg-muted/25 dark:bg-muted/40 border border-border/40 p-md md:p-lg col-stretch gap-lg"
              >
                <!-- Flex 9-Grid -->
                <div class="col-stretch gap-sm">
                  <p class="text-sm font-medium m-0">Flex 9-Grid 语义宏</p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg xl:gap-xl">
                    <div
                      v-for="item in flexMacroItems"
                      :key="item.className"
                      class="col-stretch gap-sm p-sm border border-solid border-primary rounded-lg overflow-hidden"
                    >
                      <div
                        role="button"
                        tabindex="0"
                        class="interactive-item border border-dotted border-primary ring-focus-focus row-start font-mono text-primary"
                        @click="copyClassName(item.className, '布局宏')"
                        @keydown.enter.prevent="copyClassName(item.className, '布局宏')"
                        @keydown.space.prevent="copyClassName(item.className, '布局宏')"
                      >
                        .{{ item.className }}
                      </div>
                      <p class="text-xs text-muted-foreground mt-sm">{{ item.note }}</p>
                      <div class="border border-dotted border-primary rounded-md overflow-hidden">
                        <div class="demo-stage h-15vh">
                          <div
                            v-if="item.className === 'col-fill'"
                            class="col-stretch layout-full"
                          >
                            <div class="h-[var(--spacing-md)] rounded-md bg-primary/15" />
                            <div class="col-fill px-xs py-xs">
                              <div class="h-full col-between">
                                <div
                                  class="w-[var(--spacing-md)] h-[var(--spacing-md)] rounded-md bg-primary/25"
                                />
                                <div
                                  class="w-[var(--spacing-md)] h-[var(--spacing-md)] rounded-md bg-primary/35"
                                />
                                <div
                                  class="w-[var(--spacing-md)] h-[var(--spacing-md)] rounded-md bg-primary/45"
                                />
                              </div>
                            </div>
                          </div>
                          <div
                            v-else-if="item.className === 'col-stretch'"
                            :class="item.className"
                            class="layout-full"
                          >
                            <div class="h-[var(--spacing-md)] rounded-md bg-primary/25" />
                            <div class="h-[var(--spacing-md)] rounded-md bg-primary/35" />
                            <div class="h-[var(--spacing-md)] rounded-md bg-primary/45" />
                          </div>
                          <div
                            v-else-if="item.className === 'center'"
                            :class="item.className"
                            class="layout-full"
                          >
                            <div class="row-center gap-xs">
                              <div
                                class="w-[var(--spacing-md)] h-[var(--spacing-md)] rounded-md bg-primary/25"
                              />
                              <div
                                class="w-[var(--spacing-md)] h-[var(--spacing-md)] rounded-md bg-primary/35"
                              />
                              <div
                                class="w-[var(--spacing-md)] h-[var(--spacing-md)] rounded-md bg-primary/45"
                              />
                            </div>
                          </div>
                          <div
                            v-else
                            :class="item.className"
                            class="layout-full"
                          >
                            <div
                              class="w-[var(--spacing-md)] h-[var(--spacing-md)] rounded-md bg-primary/25"
                            />
                            <div
                              class="w-[var(--spacing-md)] h-[var(--spacing-md)] rounded-md bg-primary/35"
                            />
                            <div
                              class="w-[var(--spacing-md)] h-[var(--spacing-md)] rounded-md bg-primary/45"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- absolute-center -->
                <div class="col-stretch gap-sm">
                  <p class="text-sm font-medium m-0">absolute-center · 绝对居中定位</p>
                  <p class="text-xs text-muted-foreground m-0">
                    父容器需设置
                    <code class="code-inline">position: relative</code>
                    ，子元素使用此快捷类自动居中
                  </p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-sm items-center">
                    <div
                      role="button"
                      tabindex="0"
                      class="interactive-item ring-focus-focus row-start font-mono text-primary self-start"
                      @click="copyClassName('absolute-center', '绝对居中')"
                      @keydown.enter.prevent="copyClassName('absolute-center', '绝对居中')"
                      @keydown.space.prevent="copyClassName('absolute-center', '绝对居中')"
                    >
                      .absolute-center
                    </div>
                    <div
                      class="border border-dotted border-primary rounded-lg p-md overflow-hidden relative h-[var(--spacing-5xl)]"
                    >
                      <div class="absolute-center col-center gap-xs">
                        <ProgressSpinner
                          class="w-[var(--spacing-xl)] h-[var(--spacing-xl)]"
                          stroke-width="3"
                        />
                        <span class="text-xs text-muted-foreground text-no-wrap">
                          absolute-center
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Layout 容器宏 -->
                <div class="col-stretch gap-sm">
                  <p class="text-sm font-medium m-0">Layout 容器宏</p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                    <div
                      v-for="item in layoutMacroItems"
                      :key="item.className"
                      role="button"
                      tabindex="0"
                      class="interactive-card ring-focus-focus rounded-lg p-sm col-stretch gap-xs w-full"
                      @click="copyClassName(item.className, '容器宏')"
                      @keydown.enter.prevent="copyClassName(item.className, '容器宏')"
                      @keydown.space.prevent="copyClassName(item.className, '容器宏')"
                    >
                      <div class="row-between gap-xs">
                        <Tag
                          :value="item.className"
                          severity="secondary"
                          class="shrink-0"
                        />
                        <Tag
                          :value="item.note"
                          class="shrink-0"
                        />
                      </div>
                      <div class="demo-well col-stretch gap-xs w-full">
                        <div class="row-start gap-xs flex-wrap">
                          <Tag
                            v-for="cls in layoutMacroExpandedTokens[item.className]"
                            :key="`${item.className}-${cls}`"
                            :value="cls"
                            severity="secondary"
                            class="shrink-0 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Section 2: 材质与交互系统 -->
          <section class="col-stretch gap-md">
            <div class="row-between gap-sm min-w-0 shrink-0">
              <div class="col-between min-w-0 flex-1 gap-xs">
                <div class="flex flex-row items-center justify-start gap-xs min-w-0">
                  <Icons
                    name="i-lucide-layers"
                    class="shrink-0 text-muted-foreground"
                  />
                  <h2 class="m-0 min-w-0 text-lg font-semibold text-ellipsis-1">
                    Section 2 · 材质与交互系统
                  </h2>
                </div>
                <p class="m-0 min-w-0 text-xs text-muted-foreground">
                  语义材质层 + 交互原子能力：可复制、可展开、可对比，保持与布局宏一致的学习路径
                </p>
              </div>
              <span
                class="surface-warn rounded-md px-sm py-xs text-xs font-semibold uppercase shrink-0"
              >
                Material
              </span>
            </div>
            <div class="glass-card col-stretch gap-md">
              <div
                class="rounded-xl bg-muted/25 dark:bg-muted/40 border border-border/40 p-md md:p-lg col-stretch gap-lg"
              >
                <div class="col-stretch gap-md">
                  <p class="text-sm font-medium m-0">材质系统示例（语义面 + 浮层面）</p>
                  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
                    <div
                      v-for="item in materialShowcaseItems"
                      :key="item.className"
                      class="col-stretch gap-sm"
                    >
                      <div
                        role="button"
                        tabindex="0"
                        class="interactive-item ring-focus-focus row-start font-mono text-primary"
                        @click="copyClassName(item.className, '材质系统')"
                        @keydown.enter.prevent="copyClassName(item.className, '材质系统')"
                        @keydown.space.prevent="copyClassName(item.className, '材质系统')"
                      >
                        .{{ item.className }}
                      </div>
                      <p class="text-xs text-muted-foreground m-0">{{ item.note }}</p>
                      <div class="demo-well col-stretch gap-sm">
                        <div class="row-start gap-xs flex-wrap">
                          <Tag
                            v-for="token in section3ShortcutTokens[item.className]"
                            :key="`${item.className}-${token}`"
                            :value="token"
                            severity="secondary"
                            class="shrink-0 font-mono text-xs"
                          />
                        </div>
                        <div class="demo-stage h-15vh p-sm center">
                          <div
                            v-if="item.scene === 'card'"
                            :class="[
                              item.className,
                              'w-full rounded-lg p-sm col-stretch gap-xs border border-border/30',
                            ]"
                          >
                            <div class="h-[var(--spacing-sm)] rounded-sm bg-muted/50 w-3/4" />
                            <div class="h-[var(--spacing-sm)] rounded-sm bg-muted/30 w-1/2" />
                            <div class="h-[var(--spacing-sm)] rounded-sm bg-muted/20 w-2/3" />
                          </div>
                          <div
                            v-else-if="item.scene === 'panel'"
                            class="w-full h-full center rounded-lg border border-border/30 bg-muted/20 p-sm"
                          >
                            <div :class="[item.className, 'w-84% col-stretch gap-xs']">
                              <div class="row-between">
                                <span class="text-xs font-medium">Panel Header</span>
                                <Icons
                                  name="i-lucide-x"
                                  size="sm"
                                  class="text-muted-foreground"
                                />
                              </div>
                              <div class="h-[var(--spacing-sm)] rounded-sm bg-muted/40 w-full" />
                              <div class="h-[var(--spacing-sm)] rounded-sm bg-muted/30 w-2/3" />
                            </div>
                          </div>
                          <div
                            v-else-if="item.scene === 'solid'"
                            :class="item.className"
                            class="w-full rounded-lg p-sm col-stretch gap-xs"
                          >
                            <div class="row-between text-xs text-muted-foreground">
                              <span>A</span>
                              <span>B</span>
                            </div>
                            <div class="h-[var(--spacing-xs)] rounded-sm bg-muted/50 w-full" />
                          </div>
                          <div
                            v-else-if="item.scene === 'shell'"
                            :class="item.className"
                            class="w-full min-h-[var(--spacing-3xl)] p-md col-center"
                          >
                            <span class="text-xs text-muted-foreground text-center px-sm">
                              layout shell
                            </span>
                          </div>
                          <div
                            v-else-if="item.scene === 'iconbox'"
                            class="center w-full h-full"
                          >
                            <div :class="item.className">
                              <Icons
                                name="i-lucide-box"
                                size="md"
                                class="text-primary"
                              />
                            </div>
                          </div>
                          <div
                            v-else
                            class="w-full h-full center rounded-lg border border-border/30 bg-muted/20"
                          >
                            <div :class="[item.className, 'col-center gap-xs']">
                              <span class="text-xs font-mono font-semibold">
                                {{ item.className }}
                              </span>
                              <Tag
                                value="capsule"
                                severity="secondary"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-stretch gap-md">
                  <p class="text-sm font-medium m-0">交互系统示例（卡片态 / 列表态）</p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div
                      v-for="item in interactionShowcaseItems"
                      :key="item.className"
                      class="col-stretch gap-sm"
                    >
                      <div
                        role="button"
                        tabindex="0"
                        class="interactive-item ring-focus-focus row-start font-mono text-primary"
                        @click="copyClassName(item.className, '交互系统')"
                        @keydown.enter.prevent="copyClassName(item.className, '交互系统')"
                        @keydown.space.prevent="copyClassName(item.className, '交互系统')"
                      >
                        .{{ item.className }}
                      </div>
                      <p class="text-xs text-muted-foreground m-0">{{ item.note }}</p>
                      <!-- 与 demo-well 同视觉，但不使用 overflow-hidden，避免 hover 阴影被裁切 -->
                      <div class="bg-muted border border-border rounded-xl p-md col-stretch gap-sm">
                        <div class="row-start gap-xs flex-wrap">
                          <Tag
                            v-for="token in section3ShortcutTokens[item.className]"
                            :key="`${item.className}-${token}`"
                            :value="token"
                            severity="secondary"
                            class="shrink-0 font-mono text-xs"
                          />
                        </div>
                        <div
                          v-if="item.scene === 'card-grid'"
                          class="demo-stage p-md grid grid-cols-3 gap-sm"
                        >
                          <template v-if="item.className === 'motion-lift'">
                            <!-- 勿挂 Button：.p-button overflow:hidden 会裁切阴影；用 div 还原 motion-lift -->
                            <div
                              v-for="i in 3"
                              :key="`motion-lift-card-${i}`"
                              class="motion-lift w-full rounded-lg p-sm col-center gap-xs bg-card border border-border/30"
                            >
                              <Icons
                                name="i-lucide-layers"
                                size="md"
                                class="text-primary"
                              />
                              <span class="text-xs">卡片 {{ i }}</span>
                            </div>
                          </template>
                          <template v-else>
                            <div
                              v-for="i in 3"
                              :key="`${item.className}-card-${i}`"
                              role="button"
                              :tabindex="item.className === 'ring-focus-focus' ? 0 : -1"
                              class="w-full rounded-lg p-sm col-center gap-xs"
                              :class="item.className"
                              @keydown.enter.prevent
                              @keydown.space.prevent
                            >
                              <Icons
                                name="i-lucide-layers"
                                size="md"
                                class="text-primary"
                              />
                              <span class="text-xs">卡片 {{ i }}</span>
                            </div>
                          </template>
                        </div>
                        <div
                          v-else
                          class="demo-stage p-sm col-stretch gap-xs"
                        >
                          <div
                            v-for="i in 3"
                            :key="`${item.className}-row-${i}`"
                            role="button"
                            :tabindex="item.className === 'ring-focus-focus' ? 0 : -1"
                            class="w-full rounded-md px-sm py-xs row-between"
                            :class="item.className"
                            @keydown.enter.prevent
                            @keydown.space.prevent
                          >
                            <span class="text-xs">列表行 {{ i }}</span>
                            <Icons
                              name="i-lucide-chevron-right"
                              size="sm"
                              class="text-muted-foreground"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-stretch gap-md">
                  <p class="text-sm font-medium m-0">surface-* 语义软面</p>
                  <p class="text-xs text-muted-foreground m-0">
                    与 Tag 对照：状态带 / KPI 弱色块（点击复制类名）
                  </p>
                  <div class="row-start gap-xs flex-wrap">
                    <div
                      role="button"
                      tabindex="0"
                      class="interactive-item ring-focus-focus rounded-md px-sm py-xs"
                      @click="copyClassName('surface-primary', 'surface')"
                      @keydown.enter.prevent="copyClassName('surface-primary', 'surface')"
                      @keydown.space.prevent="copyClassName('surface-primary', 'surface')"
                    >
                      <span class="surface-primary rounded-md px-sm py-xs text-xs font-semibold">
                        primary
                      </span>
                    </div>
                    <div
                      role="button"
                      tabindex="0"
                      class="interactive-item ring-focus-focus rounded-md px-sm py-xs"
                      @click="copyClassName('surface-success', 'surface')"
                      @keydown.enter.prevent="copyClassName('surface-success', 'surface')"
                      @keydown.space.prevent="copyClassName('surface-success', 'surface')"
                    >
                      <span class="surface-success rounded-md px-sm py-xs text-xs font-semibold">
                        success
                      </span>
                    </div>
                    <div
                      role="button"
                      tabindex="0"
                      class="interactive-item ring-focus-focus rounded-md px-sm py-xs"
                      @click="copyClassName('surface-warn', 'surface')"
                      @keydown.enter.prevent="copyClassName('surface-warn', 'surface')"
                      @keydown.space.prevent="copyClassName('surface-warn', 'surface')"
                    >
                      <span class="surface-warn rounded-md px-sm py-xs text-xs font-semibold">
                        warn
                      </span>
                    </div>
                    <div
                      role="button"
                      tabindex="0"
                      class="interactive-item ring-focus-focus rounded-md px-sm py-xs"
                      @click="copyClassName('surface-danger', 'surface')"
                      @keydown.enter.prevent="copyClassName('surface-danger', 'surface')"
                      @keydown.space.prevent="copyClassName('surface-danger', 'surface')"
                    >
                      <span class="surface-danger rounded-md px-sm py-xs text-xs font-semibold">
                        danger
                      </span>
                    </div>
                    <div
                      role="button"
                      tabindex="0"
                      class="interactive-item ring-focus-focus rounded-md px-sm py-xs"
                      @click="copyClassName('surface-info', 'surface')"
                      @keydown.enter.prevent="copyClassName('surface-info', 'surface')"
                      @keydown.space.prevent="copyClassName('surface-info', 'surface')"
                    >
                      <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold">
                        info
                      </span>
                    </div>
                  </div>
                </div>

                <div class="col-stretch gap-md">
                  <p class="text-sm font-medium m-0">代码展示三件套</p>
                  <div class="col-stretch gap-sm">
                    <div
                      role="button"
                      tabindex="0"
                      class="interactive-item ring-focus-focus row-start font-mono text-primary"
                      @click="copyClassName('code-block', '代码展示')"
                      @keydown.enter.prevent="copyClassName('code-block', '代码展示')"
                      @keydown.space.prevent="copyClassName('code-block', '代码展示')"
                    >
                      .code-block
                    </div>
                    <pre class="code-block text-left">
pnpm exec eslint &quot;src/views/**/*.vue&quot;</pre
                    >
                    <div
                      role="button"
                      tabindex="0"
                      class="interactive-item ring-focus-focus row-start font-mono text-primary"
                      @click="copyClassName('code-preview', '代码展示')"
                      @keydown.enter.prevent="copyClassName('code-preview', '代码展示')"
                      @keydown.space.prevent="copyClassName('code-preview', '代码展示')"
                    >
                      .code-preview
                    </div>
                    <pre class="code-preview text-left text-muted-foreground">
semanticShortcuts.center = 'flex justify-center items-center'
              </pre
                    >
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Section 3: 文本控制与溢出 -->
          <section class="col-stretch gap-md">
            <div class="row-between gap-sm min-w-0 shrink-0">
              <div class="col-between min-w-0 flex-1 gap-xs">
                <div class="flex flex-row items-center justify-start gap-xs min-w-0">
                  <Icons
                    name="i-lucide-type"
                    class="shrink-0 text-muted-foreground"
                  />
                  <h2 class="m-0 min-w-0 text-lg font-semibold text-ellipsis-1">
                    Section 3 · 文本控制与溢出
                  </h2>
                </div>
                <p class="m-0 min-w-0 text-xs text-muted-foreground">
                  text-ellipsis-1/2 · scrollbar-none · text-no-wrap——在真实业务 UI
                  语境中理解截断行为
                </p>
              </div>
              <span
                class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase shrink-0"
              >
                Type
              </span>
            </div>
            <div class="glass-card col-stretch gap-md">
              <div
                class="rounded-xl bg-muted/25 dark:bg-muted/40 border border-border/40 p-md md:p-lg col-stretch gap-lg"
              >
                <div class="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div class="col-stretch gap-lg">
                    <!-- text-ellipsis-1 -->
                    <div class="col-stretch gap-sm">
                      <div class="row-between gap-sm">
                        <div
                          role="button"
                          tabindex="0"
                          class="interactive-item ring-focus-focus row-start font-mono text-primary shrink"
                          @click="copyClassName('text-ellipsis-1', '单行截断')"
                          @keydown.enter.prevent="copyClassName('text-ellipsis-1', '单行截断')"
                          @keydown.space.prevent="copyClassName('text-ellipsis-1', '单行截断')"
                        >
                          .text-ellipsis-1
                        </div>
                        <span class="text-xs text-muted-foreground shrink-0">邮件收件箱行</span>
                      </div>
                      <div
                        class="border border-dotted border-primary rounded-lg p-md overflow-hidden col-stretch gap-xs"
                      >
                        <div
                          v-for="mail in mailItems"
                          :key="mail.sender"
                          role="button"
                          tabindex="0"
                          class="w-full interactive-item ring-focus-focus rounded-md px-sm py-xs row-start gap-sm"
                          @keydown.enter.prevent
                          @keydown.space.prevent
                        >
                          <div
                            class="w-[var(--spacing-xl)] h-[var(--spacing-xl)] rounded-full bg-primary/20 center shrink-0"
                          >
                            <span class="text-xs font-bold text-primary">{{ mail.avatar }}</span>
                          </div>
                          <div class="col-stretch flex-1 min-w-0 gap-xs text-left">
                            <span class="text-xs font-semibold text-no-wrap">
                              {{ mail.sender }}
                            </span>
                            <span class="text-xs text-muted-foreground text-ellipsis-1">
                              {{ mail.subject }}
                            </span>
                          </div>
                          <span class="text-xs text-muted-foreground shrink-0">
                            {{ mail.time }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- text-ellipsis-2 -->
                    <div class="col-stretch gap-sm">
                      <div class="row-between gap-sm">
                        <div
                          role="button"
                          tabindex="0"
                          class="interactive-item ring-focus-focus row-start font-mono text-primary shrink"
                          @click="copyClassName('text-ellipsis-2', '双行截断')"
                          @keydown.enter.prevent="copyClassName('text-ellipsis-2', '双行截断')"
                          @keydown.space.prevent="copyClassName('text-ellipsis-2', '双行截断')"
                        >
                          .text-ellipsis-2
                        </div>
                        <span class="text-xs text-muted-foreground shrink-0">产品卡片描述</span>
                      </div>
                      <div
                        class="grid grid-cols-2 gap-sm border border-dotted border-primary rounded-lg p-md overflow-hidden"
                      >
                        <div
                          v-for="product in productCards"
                          :key="product.name"
                          role="button"
                          tabindex="0"
                          class="interactive-item ring-focus-focus rounded-lg p-sm col-stretch gap-xs w-full"
                          @click="copyClassName('text-ellipsis-2', '双行截断')"
                          @keydown.enter.prevent="copyClassName('text-ellipsis-2', '双行截断')"
                          @keydown.space.prevent="copyClassName('text-ellipsis-2', '双行截断')"
                        >
                          <div
                            class="aspect-[4/3] center rounded-lg border border-border/30 bg-card"
                          >
                            <Icons
                              :name="product.icon"
                              size="sm"
                              class="text-muted-foreground/40"
                            />
                          </div>
                          <span class="text-xs font-semibold text-no-wrap">
                            {{ product.name }}
                          </span>
                          <span
                            class="text-xs leading-sm max-h-[var(--spacing-xl)] text-muted-foreground text-ellipsis-2"
                          >
                            {{ product.description }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="col-stretch gap-lg">
                    <!-- scrollbar-none -->
                    <div class="col-stretch gap-sm">
                      <div class="row-between gap-sm">
                        <div
                          role="button"
                          tabindex="0"
                          class="interactive-item ring-focus-focus row-start font-mono text-primary shrink"
                          @click="copyClassName('scrollbar-none', '隐藏滚动条')"
                          @keydown.enter.prevent="copyClassName('scrollbar-none', '隐藏滚动条')"
                          @keydown.space.prevent="copyClassName('scrollbar-none', '隐藏滚动条')"
                        >
                          .scrollbar-none
                        </div>
                        <span class="text-xs text-muted-foreground shrink-0">
                          Topic Tag 横向滚动
                        </span>
                      </div>
                      <CScrollbar
                        class="w-full min-w-0 !h-auto max-h-[var(--spacing-5xl)] rounded-full bg-muted/30 border border-border/30 px-xs py-xs"
                      >
                        <div class="row-start gap-xs min-w-max">
                          <Tag
                            v-for="tag in topicTags"
                            :key="tag"
                            :value="tag"
                            severity="secondary"
                            class="text-no-wrap shrink-0"
                          />
                        </div>
                      </CScrollbar>
                      <p class="text-xs text-muted-foreground/60 m-0">
                        ← 横向滑动（滚动条已隐藏，内容仍可滚动）
                      </p>
                    </div>

                    <!-- text-no-wrap -->
                    <div class="col-stretch gap-sm">
                      <div class="row-between gap-sm">
                        <div
                          role="button"
                          tabindex="0"
                          class="interactive-item ring-focus-focus row-start font-mono text-primary shrink"
                          @click="copyClassName('text-no-wrap', '不换行')"
                          @keydown.enter.prevent="copyClassName('text-no-wrap', '不换行')"
                          @keydown.space.prevent="copyClassName('text-no-wrap', '不换行')"
                        >
                          .text-no-wrap
                        </div>
                        <span class="text-xs text-muted-foreground shrink-0">面包屑防折行</span>
                      </div>
                      <div
                        class="border border-dotted border-primary rounded-lg p-md overflow-hidden"
                      >
                        <div class="row-start gap-xs overflow-hidden">
                          <Icons
                            name="i-lucide-home"
                            size="sm"
                            class="text-muted-foreground shrink-0"
                          />
                          <span class="text-xs text-muted-foreground">/</span>
                          <span class="text-xs text-muted-foreground text-no-wrap shrink-0">
                            系统配置
                          </span>
                          <span class="text-xs text-muted-foreground">/</span>
                          <span class="text-xs font-medium text-no-wrap text-ellipsis-1">
                            UnoCSS 引擎快捷类全景与布局演示系统
                          </span>
                        </div>
                      </div>
                      <p class="text-xs text-muted-foreground/60 m-0">
                        路径文字强制单行，配合 text-ellipsis-1 截断末段
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Section 4: 动效缓动系统 -->
          <section class="col-stretch gap-md">
            <div class="row-between gap-sm min-w-0 shrink-0">
              <div class="col-between min-w-0 flex-1 gap-xs">
                <div class="flex flex-row items-center justify-start gap-xs min-w-0">
                  <Icons
                    name="i-lucide-activity"
                    class="shrink-0 text-muted-foreground"
                  />
                  <h2 class="m-0 min-w-0 text-lg font-semibold text-ellipsis-1">
                    Section 4 · 动效缓动系统
                  </h2>
                </div>
                <p class="m-0 min-w-0 text-xs text-muted-foreground">
                  5 条缓动曲线对比（group-hover 滑轨）· Orb 关键帧动画舞台
                </p>
              </div>
              <span
                class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase shrink-0"
              >
                Motion
              </span>
            </div>
            <div class="glass-card col-stretch gap-md">
              <div
                class="rounded-xl bg-muted/25 dark:bg-muted/40 border border-border/40 p-md md:p-lg col-stretch gap-lg"
              >
                <div class="col-stretch gap-sm">
                  <p class="text-sm font-medium m-0">缓动曲线对比（悬停区域触发滑轨）</p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
                    <div
                      v-for="demo in easingDemos"
                      :key="demo.className"
                      class="motion-lift bg-muted/20 border border-border/40 rounded-lg p-md overflow-hidden col-stretch gap-sm"
                    >
                      <div class="row-start flex-wrap gap-xs">
                        <div
                          role="button"
                          tabindex="0"
                          class="ring-focus-focus row-start font-mono text-primary bg-primary/10 rounded-sm px-xs py-xs flex-1 min-w-0"
                          @click="copyClassName(demo.className, '缓动曲线')"
                          @keydown.enter.prevent="copyClassName(demo.className, '缓动曲线')"
                          @keydown.space.prevent="copyClassName(demo.className, '缓动曲线')"
                        >
                          .{{ demo.className }}
                        </div>
                        <Tag
                          :value="demo.description"
                          severity="secondary"
                          class="shrink-0 max-w-full"
                        />
                      </div>
                      <p class="text-xs font-mono text-muted-foreground/50 m-0 text-ellipsis-1">
                        {{ demo.curveHint }}
                      </p>
                      <div class="demo-stage relative h-[var(--spacing-2xl)] bg-background/40">
                        <div class="group relative h-full w-full overflow-hidden px-sm">
                          <div
                            class="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[var(--spacing-xs)] rounded-full bg-foreground/[0.12]"
                          />
                          <div
                            class="absolute right-0 top-1/2 -translate-y-1/2 w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-full bg-foreground/[0.25]"
                          />
                          <div
                            class="absolute top-1/2 -translate-y-1/2 left-0 rounded-sm bg-primary/70 transition-[left] duration-sm group-hover:left-[calc(100%-var(--spacing-xl))]"
                            :class="[demo.className, 'w-[var(--spacing-xl)] h-[var(--spacing-md)]']"
                          />
                        </div>
                      </div>
                      <p class="text-xs text-muted-foreground/60 m-0">
                        悬停卡片观察滑块位移与减速手感差异
                      </p>
                    </div>
                  </div>
                </div>

                <div class="col-stretch gap-sm">
                  <p class="text-sm font-medium m-0">Orb 关键帧动画</p>
                  <div
                    class="demo-stage relative w-full min-h-[var(--spacing-5xl)] aspect-video overflow-hidden bg-muted/20 p-md"
                    style="
                      background-image: radial-gradient(
                        circle,
                        rgb(var(--foreground) / 4.5%) 1px,
                        transparent 1px
                      );
                      background-size: var(--spacing-lg) var(--spacing-lg);
                    "
                  >
                    <div
                      class="absolute inset-0 z-base bg-foreground/[0.03] animate-pulse pointer-events-none"
                    />
                    <div class="absolute-center col-center gap-xs pointer-events-none">
                      <span class="text-xs text-muted-foreground/40 font-mono">
                        subtle pulse · restrained stage light
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Section 5: Z-Axis 物理剧场 -->
          <section class="col-stretch gap-md">
            <div class="row-between gap-sm min-w-0 shrink-0">
              <div class="col-between min-w-0 flex-1 gap-xs">
                <div class="flex flex-row items-center justify-start gap-xs min-w-0">
                  <Icons
                    name="i-lucide-layers"
                    class="shrink-0 text-muted-foreground"
                  />
                  <h2 class="m-0 min-w-0 text-lg font-semibold text-ellipsis-1">
                    Section 5 · Z-Axis 物理剧场
                  </h2>
                </div>
                <p class="m-0 min-w-0 text-xs text-muted-foreground">
                  进阶附录：z-base（0）→
                  z-toast（100）的覆盖层次，帮助理解布局层、遮罩层与通知层的稳定关系
                </p>
              </div>
              <span
                class="surface-danger rounded-md px-sm py-xs text-xs font-semibold uppercase shrink-0"
              >
                Z-Axis
              </span>
            </div>
            <div class="glass-card col-stretch gap-md">
              <div
                class="rounded-xl bg-muted/25 dark:bg-muted/40 border border-border/40 p-md md:p-lg col-stretch gap-lg"
              >
                <div
                  class="relative w-full aspect-video min-h-[var(--spacing-5xl)] rounded-lg overflow-hidden border border-dotted border-primary p-md"
                >
                  <div
                    class="absolute inset-0 z-base bg-foreground/5 animate-pulse pointer-events-none"
                  />
                  <div
                    v-for="card in zLayerCards"
                    :key="card.zClass"
                    class="absolute rounded-lg border row-between px-sm py-xs transition-all duration-md"
                    :class="[card.zClass, card.colorClass, card.blurClass, card.borderColorClass]"
                    :style="card.positionStyle"
                  >
                    <div class="col-stretch gap-xs min-w-0 overflow-hidden">
                      <div
                        role="button"
                        tabindex="0"
                        class="interactive-item ring-focus-focus row-start font-mono"
                        @click="copyClassName(card.zClass, 'Z 语义层')"
                        @keydown.enter.prevent="copyClassName(card.zClass, 'Z 语义层')"
                        @keydown.space.prevent="copyClassName(card.zClass, 'Z 语义层')"
                      >
                        .{{ card.zClass }}
                      </div>
                      <span class="text-xs text-muted-foreground text-no-wrap">
                        {{ card.uiRole }}
                      </span>
                    </div>
                    <div class="glass-capsule shrink-0 ml-xs">
                      <Badge
                        :value="`z=${card.numericValue}`"
                        :severity="card.badgeSeverity"
                      />
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-sm">
                  <div
                    v-for="card in zLayerCards"
                    :key="`legend-${card.zClass}`"
                    role="button"
                    tabindex="0"
                    class="interactive-item ring-focus-focus rounded-md p-sm row-between w-full"
                    @click="copyClassName(card.zClass, 'Z 层级')"
                    @keydown.enter.prevent="copyClassName(card.zClass, 'Z 层级')"
                    @keydown.space.prevent="copyClassName(card.zClass, 'Z 层级')"
                  >
                    <span class="text-xs font-mono text-primary">.{{ card.zClass }}</span>
                    <span class="text-xs text-muted-foreground">
                      z={{ card.numericValue }} · {{ card.uiRole }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <p class="text-xs text-muted-foreground m-0 text-center">
            边框解析、主题 scale 与尺寸引擎见
            <Button
              label="尺寸系统"
              link
              size="small"
              class="p-0 h-auto text-xs"
              @click="goToRoute('ExampleSystemConfigurationSize')"
            />
            与
            <code class="code-inline">packages/unocss-preset</code>
          </p>
        </div>
      </div>
    </AnimateWrapper>
  </div>
</template>

<style lang="scss" scoped></style>
