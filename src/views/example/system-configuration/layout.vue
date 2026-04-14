<script setup lang="ts">
defineOptions({ name: 'LayoutSystemPage' })

import type Popover from 'primevue/popover'
import { goToRoute } from '@/router/utils/helper'

const layoutStore = useLayoutStore()
const deviceStore = useDeviceStore()

const COPY_TOAST_GROUP = 'tr' as const

const { copy: copyToClipboard, isSupported: isClipboardSupported } = useClipboard({
  legacy: true,
})

type VisibilityKey = keyof LayoutVisibilitySetting

interface VisibilityRowConfig {
  key: VisibilityKey
  label: string
  hint: string
  parentKey?: VisibilityKey
  modeLocked: boolean
}

const fabPopoverRef = ref<InstanceType<typeof Popover> | null>(null)

const modeOptions = computed<Array<{ label: string; value: AdminLayoutMode }>>(() => [
  { label: 'Vertical（侧栏 + 内容区）', value: 'vertical' },
  { label: 'Horizontal（顶栏菜单 + 内容区）', value: 'horizontal' },
  { label: 'Mix（侧栏 + 顶栏菜单）', value: 'mix' },
])

const transitionOptions: Array<{ label: string; value: string }> = [
  { label: 'Cinematic（影视级模糊阻尼）', value: 'cinematic-fade' },
  { label: 'Fade slide（横向位移）', value: 'fade-slide' },
  { label: 'Fade（透明度）', value: 'fade' },
]

const visibilityRows = computed<VisibilityRowConfig[]>(() => {
  const mode: AdminLayoutMode = layoutStore.effectiveMode
  return [
    { key: 'showHeader', label: 'Header', hint: 'Header 壳是否渲染（父模块）', modeLocked: false },
    {
      key: 'showLogo',
      label: 'Logo',
      hint: 'Header 内 Logo（依赖 Header）',
      parentKey: 'showHeader',
      modeLocked: false,
    },
    {
      key: 'showMenu',
      label: 'Top Menu',
      hint: 'Header 菜单通道（Vertical 模式锁定）',
      parentKey: 'showHeader',
      modeLocked: mode === 'vertical',
    },
    {
      key: 'showSidebar',
      label: 'Sidebar',
      hint: '侧栏壳（Horizontal 模式锁定）',
      modeLocked: mode === 'horizontal',
    },
    { key: 'showBreadcrumb', label: 'Breadcrumb', hint: '面包屑行（独立模块）', modeLocked: false },
    {
      key: 'showBreadcrumbIcon',
      label: 'Breadcrumb Icon',
      hint: '面包屑图标（依赖 Breadcrumb）',
      parentKey: 'showBreadcrumb',
      modeLocked: false,
    },
    { key: 'showTabs', label: 'Tabs', hint: 'Tabs 标签栏（独立模块）', modeLocked: false },
    { key: 'showFooter', label: 'Footer', hint: '页脚（独立模块）', modeLocked: false },
  ]
})

const isNavigationLost = computed<boolean>(() => {
  const v: LayoutVisibilitySetting = layoutStore.activeVisibility
  const mode: AdminLayoutMode = layoutStore.effectiveMode
  if (mode === 'horizontal' && !v.showHeader) return true
  if (mode === 'vertical' && !v.showSidebar) return true
  if (mode === 'mix' && !v.showSidebar && (!v.showHeader || !v.showMenu)) return true
  return false
})

function isRowDisabled(row: VisibilityRowConfig): boolean {
  if (row.modeLocked) return true
  if (!row.parentKey) return false
  if (!layoutStore.activeVisibility[row.parentKey]) return true
  // Transitive: check if parent is itself disabled
  const parentRow = visibilityRows.value.find(r => r.key === row.parentKey)
  return parentRow ? isRowDisabled(parentRow) : false
}

function handleVisibilityToggle(key: VisibilityKey, value: boolean): void {
  layoutStore.setModuleVisible(key, value)
}

function handlePreferredModeChange(mode: AdminLayoutMode): void {
  layoutStore.setPreferredMode(mode)
}

function toggleFabMenu(event: MouseEvent): void {
  fabPopoverRef.value?.toggle(event)
}

function restoreNavigation(): void {
  fabPopoverRef.value?.hide()
  const mode: AdminLayoutMode = layoutStore.effectiveMode
  if (mode === 'vertical') {
    layoutStore.setModuleVisible('showSidebar', true)
    layoutStore.setModuleVisible('showHeader', true)
  } else if (mode === 'horizontal') {
    layoutStore.setModuleVisible('showHeader', true)
    layoutStore.setModuleVisible('showMenu', true)
  } else {
    layoutStore.setModuleVisible('showHeader', true)
    layoutStore.setModuleVisible('showSidebar', true)
    layoutStore.setModuleVisible('showMenu', true)
  }
}

function fullReset(): void {
  fabPopoverRef.value?.hide()
  layoutStore.resetSetting()
}

function clearUserAdjusted(): void {
  fabPopoverRef.value?.hide()
  layoutStore.resetUserAdjusted()
}

async function copyText(text: string, label: string): Promise<void> {
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
    await copyToClipboard(text)
    window.$toast?.add({
      severity: 'success',
      summary: '已复制',
      detail: `${label}: ${text}`,
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
          <!-- Page header — glass-panel -->
          <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
            <div class="row-between gap-md min-w-0">
              <div class="col-between min-w-0 flex-1 gap-xs">
                <div class="flex flex-row flex-wrap items-center justify-start gap-sm min-w-0">
                  <div class="glass-icon-box shrink-0">
                    <Icons
                      name="i-lucide-layout-dashboard"
                      size="xl"
                      class="text-primary"
                    />
                  </div>
                  <div class="flex flex-row flex-wrap items-center justify-start gap-xs min-w-0">
                    <span class="text-lg font-bold text-foreground text-no-wrap">
                      Layout Control Center
                    </span>
                    <span
                      class="surface-danger rounded-md px-sm py-xs text-xs font-semibold uppercase"
                    >
                      LIVE
                    </span>
                  </div>
                </div>
                <p class="col-start-2 m-0 text-sm text-muted-foreground">
                  直接操作全局布局 Store — 所有变更即时生效于整个 Admin Shell
                </p>
              </div>
              <div class="row-end gap-xs shrink-0 flex-wrap">
                <Button
                  text
                  size="small"
                  label="→ Breakpoints"
                  class="p-0 h-auto text-xs"
                  @click="goToRoute('ExampleSystemConfigurationBreakpoints')"
                />
                <Button
                  text
                  size="small"
                  label="→ Scrollbar"
                  class="p-0 h-auto text-xs"
                  @click="goToRoute('ExampleComponentsCScrollbar')"
                />
              </div>
            </div>
          </header>

          <!-- ═══════════ DANGER BANNER ═══════════ -->
          <Transition name="layout-fade">
            <div
              v-if="isNavigationLost"
              class="rounded-lg bg-danger/10 border border-danger/30 p-md col-stretch gap-sm"
            >
              <div class="flex flex-row items-start justify-start gap-sm min-w-0">
                <Icons
                  name="i-lucide-triangle-alert"
                  class="shrink-0 text-danger"
                />
                <div class="col-stretch min-w-0 flex-1 gap-xs">
                  <span class="text-sm font-semibold text-danger">导航已全部隐藏！</span>
                  <span class="text-xs text-muted-foreground">
                    当前
                    <span class="font-mono text-foreground">{{ layoutStore.effectiveMode }}</span>
                    模式下所有导航路径均已关闭，用户将无法访问其他页面。
                  </span>
                </div>
              </div>
              <div class="row-start gap-xs">
                <Button
                  label="恢复导航"
                  severity="danger"
                  size="small"
                  outlined
                  @click="restoreNavigation"
                />
                <Button
                  label="完全重置"
                  severity="danger"
                  size="small"
                  @click="fullReset"
                />
              </div>
            </div>
          </Transition>

          <!-- ═══════════ EFFECTIVE STATE BAR ═══════════ -->
          <div
            class="rounded-lg surface-info border border-border/40 p-sm row-between gap-md flex-wrap"
          >
            <div class="flex flex-row flex-wrap items-center justify-start gap-xs min-w-0">
              <Icons
                name="i-lucide-activity"
                class="shrink-0 text-primary"
              />
              <span class="text-xs font-semibold text-foreground">实时状态</span>
              <span class="text-xs text-muted-foreground">effectiveMode:</span>
              <Tag
                :value="layoutStore.effectiveMode"
                severity="info"
              />
              <span class="text-xs text-muted-foreground">preferredMode:</span>
              <Tag
                :value="layoutStore.preferredMode"
                severity="secondary"
              />
            </div>
            <div class="row-end gap-xs flex-wrap">
              <span class="text-xs text-muted-foreground">Device:</span>
              <Tag
                :value="deviceStore.type"
                severity="secondary"
              />
              <span class="text-xs text-muted-foreground">BP:</span>
              <Tag
                :value="deviceStore.currentBreakpoint"
                severity="secondary"
              />
              <Tag
                v-if="layoutStore.userAdjusted"
                value="User Adjusted"
                severity="warn"
              />
            </div>
          </div>

          <!-- ═══════════ 2-COLUMN CONTROL CENTER ═══════════ -->
          <section class="col-stretch gap-md">
            <div class="row-between gap-sm min-w-0 shrink-0">
              <div class="col-between min-w-0 flex-1 gap-xs">
                <div class="flex flex-row items-center justify-start gap-xs min-w-0">
                  <Icons
                    name="i-lucide-sliders-horizontal"
                    class="shrink-0 text-muted-foreground"
                  />
                  <h2 class="m-0 min-w-0 text-lg font-semibold text-ellipsis-1">布局控制</h2>
                </div>
                <p class="m-0 min-w-0 text-xs text-muted-foreground">
                  模式、固定行为与导航显隐 — 双列对照操作
                </p>
              </div>
              <span class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase">
                Controls
              </span>
            </div>
            <div class="glass-card rounded-xl p-md col-stretch gap-md">
              <div
                class="rounded-xl bg-muted/25 dark:bg-muted/40 border border-border/40 p-md md:p-lg col-stretch gap-lg"
              >
                <div class="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <!-- ─── LEFT COLUMN ─── -->
                  <div class="col-stretch gap-md">
                    <!-- § Layout Mode -->
                    <div
                      class="bg-muted/30 dark:bg-muted/20 border border-border/40 rounded-lg p-md col-stretch gap-md"
                    >
                      <div class="row-between gap-sm min-w-0 items-center">
                        <div class="flex flex-row items-center justify-start gap-xs min-w-0 flex-1">
                          <Icons
                            name="i-lucide-layout-template"
                            class="shrink-0 text-muted-foreground"
                          />
                          <span class="text-sm font-semibold text-foreground">Layout Mode</span>
                        </div>
                        <Button
                          text
                          size="small"
                          icon="i-lucide-clipboard-copy"
                          class="shrink-0 p-0 h-auto text-muted-foreground/40 hover:text-primary transition-colors duration-md"
                          @click="copyText(layoutStore.preferredMode, 'preferredMode')"
                        />
                      </div>
                      <div class="rounded-md bg-background/40 p-sm col-stretch gap-xs">
                        <span class="text-xs text-muted-foreground">
                          preferredMode（宽屏 ≥ 1280px 时生效）
                        </span>
                        <Select
                          :model-value="layoutStore.preferredMode"
                          :options="modeOptions"
                          option-label="label"
                          option-value="value"
                          class="w-full"
                          @update:model-value="handlePreferredModeChange"
                        />
                      </div>
                    </div>

                    <!-- § Fixed Behavior -->
                    <div
                      class="bg-muted/30 dark:bg-muted/20 border border-border/40 rounded-lg p-md col-stretch gap-md"
                    >
                      <div class="row-between gap-sm min-w-0 items-center">
                        <div class="flex flex-row items-center justify-start gap-xs min-w-0 flex-1">
                          <Icons
                            name="i-lucide-pin"
                            class="shrink-0 text-muted-foreground"
                          />
                          <span class="text-sm font-semibold text-foreground">Fixed Behavior</span>
                        </div>
                        <span class="max-w-[45%] shrink-0 text-right text-xs text-muted-foreground">
                          控制滚动时是否保持固定
                        </span>
                      </div>
                      <div class="col-stretch gap-sm">
                        <div class="rounded-md bg-background/40 p-sm row-between gap-md">
                          <div class="col-stretch gap-xs">
                            <span class="text-sm font-semibold text-foreground">headerFixed</span>
                            <span class="text-xs text-muted-foreground">
                              Header 在页面滚动时保持固定
                            </span>
                          </div>
                          <div class="row-end gap-xs shrink-0">
                            <Button
                              text
                              size="small"
                              icon="i-lucide-clipboard-copy"
                              class="p-0 h-auto text-muted-foreground/40 hover:text-primary transition-colors duration-md"
                              @click="copyText('headerFixed', 'LayoutSetting')"
                            />
                            <ToggleSwitch
                              :model-value="layoutStore.headerFixed"
                              @update:model-value="
                                (v: boolean) => layoutStore.updateSetting('headerFixed', v)
                              "
                            />
                          </div>
                        </div>
                        <div class="rounded-md bg-background/40 p-sm row-between gap-md">
                          <div class="col-stretch gap-xs">
                            <span class="text-sm font-semibold text-foreground">sidebarFixed</span>
                            <span class="text-xs text-muted-foreground">
                              Sidebar 在页面滚动时保持固定
                            </span>
                          </div>
                          <div class="row-end gap-xs shrink-0">
                            <Button
                              text
                              size="small"
                              icon="i-lucide-clipboard-copy"
                              class="p-0 h-auto text-muted-foreground/40 hover:text-primary transition-colors duration-md"
                              @click="copyText('sidebarFixed', 'LayoutSetting')"
                            />
                            <ToggleSwitch
                              :model-value="layoutStore.sidebarFixed"
                              @update:model-value="
                                (v: boolean) => layoutStore.updateSetting('sidebarFixed', v)
                              "
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- § Sidebar Behavior -->
                    <div
                      class="bg-muted/30 dark:bg-muted/20 border border-border/40 rounded-lg p-md col-stretch gap-md"
                    >
                      <div class="row-between gap-sm min-w-0 items-center">
                        <div class="flex flex-row items-center justify-start gap-xs min-w-0 flex-1">
                          <Icons
                            name="i-lucide-panel-left"
                            class="shrink-0 text-muted-foreground"
                          />
                          <span class="text-sm font-semibold text-foreground">
                            Sidebar Behavior
                          </span>
                        </div>
                        <span class="max-w-[45%] shrink-0 text-right text-xs text-muted-foreground">
                          折叠与展开策略
                        </span>
                      </div>
                      <div class="col-stretch gap-sm">
                        <div class="rounded-md bg-background/40 p-sm row-between gap-md">
                          <div class="col-stretch gap-xs">
                            <span class="text-sm font-semibold text-foreground">
                              sidebarCollapse
                            </span>
                            <span class="text-xs text-muted-foreground">侧栏是否处于收起状态</span>
                          </div>
                          <div class="row-end gap-xs shrink-0">
                            <Button
                              text
                              size="small"
                              icon="i-lucide-clipboard-copy"
                              class="p-0 h-auto text-muted-foreground/40 hover:text-primary transition-colors duration-md"
                              @click="copyText('sidebarCollapse', 'LayoutSetting')"
                            />
                            <ToggleSwitch
                              :model-value="layoutStore.sidebarCollapse"
                              @update:model-value="
                                (v: boolean) => {
                                  layoutStore.updateSetting('sidebarCollapse', v)
                                  layoutStore.markUserAdjusted()
                                }
                              "
                            />
                          </div>
                        </div>
                        <div class="rounded-md bg-background/40 p-sm row-between gap-md">
                          <div class="col-stretch gap-xs">
                            <span class="text-sm font-semibold text-foreground">
                              sidebarUniqueOpened
                            </span>
                            <span class="text-xs text-muted-foreground">
                              手风琴模式：同时只展开一个菜单组
                            </span>
                          </div>
                          <div class="row-end gap-xs shrink-0">
                            <Button
                              text
                              size="small"
                              icon="i-lucide-clipboard-copy"
                              class="p-0 h-auto text-muted-foreground/40 hover:text-primary transition-colors duration-md"
                              @click="copyText('sidebarUniqueOpened', 'LayoutSetting')"
                            />
                            <ToggleSwitch
                              :model-value="layoutStore.sidebarUniqueOpened"
                              @update:model-value="
                                (v: boolean) => layoutStore.updateSetting('sidebarUniqueOpened', v)
                              "
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- § Animation & Cache -->
                    <div
                      class="bg-muted/30 dark:bg-muted/20 border border-border/40 rounded-lg p-md col-stretch gap-md"
                    >
                      <div class="row-between gap-sm min-w-0 items-center">
                        <div class="flex flex-row items-center justify-start gap-xs min-w-0 flex-1">
                          <Icons
                            name="i-lucide-zap"
                            class="shrink-0 text-muted-foreground"
                          />
                          <span class="text-sm font-semibold text-foreground">
                            Animation & Cache
                          </span>
                        </div>
                        <span class="max-w-[45%] shrink-0 text-right text-xs text-muted-foreground">
                          路由过渡与 KeepAlive
                        </span>
                      </div>
                      <div class="col-stretch gap-sm">
                        <div class="rounded-md bg-background/40 p-sm row-between gap-md">
                          <div class="col-stretch gap-xs">
                            <span class="text-sm font-semibold text-foreground">
                              enableTransition
                            </span>
                            <span class="text-xs text-muted-foreground">
                              路由切换时的过渡动画开关
                            </span>
                          </div>
                          <div class="row-end gap-xs shrink-0">
                            <Button
                              text
                              size="small"
                              icon="i-lucide-clipboard-copy"
                              class="p-0 h-auto text-muted-foreground/40 hover:text-primary transition-colors duration-md"
                              @click="copyText('enableTransition', 'LayoutSetting')"
                            />
                            <ToggleSwitch
                              :model-value="layoutStore.enableTransition"
                              @update:model-value="
                                (v: boolean) => layoutStore.updateSetting('enableTransition', v)
                              "
                            />
                          </div>
                        </div>
                        <div class="rounded-md bg-background/40 p-sm col-stretch gap-sm">
                          <div class="row-between gap-md">
                            <div class="col-stretch gap-xs">
                              <span class="text-sm font-semibold text-foreground">
                                transitionName
                              </span>
                              <span class="text-xs text-muted-foreground">过渡动画效果名称</span>
                            </div>
                            <Button
                              text
                              size="small"
                              icon="i-lucide-clipboard-copy"
                              class="p-0 h-auto text-muted-foreground/40 hover:text-primary transition-colors duration-md"
                              @click="copyText(layoutStore.transitionName, 'transitionName')"
                            />
                          </div>
                          <Select
                            :model-value="layoutStore.transitionName"
                            :options="transitionOptions"
                            option-label="label"
                            option-value="value"
                            class="w-full"
                            :disabled="!layoutStore.enableTransition"
                            @update:model-value="
                              (v: string) => layoutStore.updateSetting('transitionName', v)
                            "
                          />
                        </div>
                        <div class="rounded-md bg-background/40 p-sm row-between gap-md">
                          <div class="col-stretch gap-xs">
                            <span class="text-sm font-semibold text-foreground">
                              enableKeepAlive
                            </span>
                            <span class="text-xs text-muted-foreground">
                              页面组件缓存（KeepAlive）
                            </span>
                          </div>
                          <div class="row-end gap-xs shrink-0">
                            <Button
                              text
                              size="small"
                              icon="i-lucide-clipboard-copy"
                              class="p-0 h-auto text-muted-foreground/40 hover:text-primary transition-colors duration-md"
                              @click="copyText('enableKeepAlive', 'LayoutSetting')"
                            />
                            <ToggleSwitch
                              :model-value="layoutStore.enableKeepAlive"
                              @update:model-value="
                                (v: boolean) => layoutStore.updateSetting('enableKeepAlive', v)
                              "
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- ─── RIGHT COLUMN: Module Visibility ─── -->
                  <div
                    class="bg-muted/30 dark:bg-muted/20 border border-border/40 rounded-lg p-md col-stretch gap-md"
                  >
                    <div class="col-between min-w-0 gap-xs">
                      <div class="row-between gap-sm min-w-0 items-center">
                        <div class="flex flex-row items-center justify-start gap-xs min-w-0 flex-1">
                          <Icons
                            name="i-lucide-eye"
                            class="shrink-0 text-muted-foreground"
                          />
                          <span class="text-sm font-semibold text-foreground">
                            Module Visibility
                          </span>
                        </div>
                        <Tag
                          value="Live Mutations"
                          severity="info"
                          class="shrink-0"
                        />
                      </div>
                      <p class="m-0 text-xs text-muted-foreground">
                        直接写入当前 effectiveMode 的 visibilitySettings。受 mode
                        约束的项会锁定，依赖关系由父子禁用状态体现。
                      </p>
                    </div>

                    <div class="col-stretch gap-sm">
                      <div
                        v-for="row in visibilityRows"
                        :key="row.key"
                        class="rounded-md bg-background/40 p-sm row-between gap-md transition-opacity duration-md"
                        :class="{ 'opacity-50 pointer-events-none': isRowDisabled(row) }"
                      >
                        <div class="col-stretch gap-xs min-w-0">
                          <div
                            class="flex flex-row flex-wrap items-center justify-start gap-xs min-w-0"
                          >
                            <span class="text-sm font-semibold text-foreground">
                              {{ row.label }}
                            </span>
                            <Tag
                              v-if="row.modeLocked"
                              value="Mode Locked"
                              severity="warn"
                            />
                            <Tag
                              v-if="row.parentKey && !layoutStore.activeVisibility[row.parentKey]"
                              value="Parent Off"
                              severity="secondary"
                            />
                          </div>
                          <span class="text-xs text-muted-foreground">{{ row.hint }}</span>
                        </div>
                        <div class="row-end gap-xs shrink-0">
                          <Button
                            text
                            size="small"
                            icon="i-lucide-clipboard-copy"
                            class="p-0 h-auto text-muted-foreground/40 hover:text-primary transition-colors duration-md"
                            @click="copyText(row.key, 'LayoutVisibilitySetting')"
                          />
                          <ToggleSwitch
                            :model-value="layoutStore.activeVisibility[row.key]"
                            :disabled="isRowDisabled(row)"
                            @update:model-value="(v: boolean) => handleVisibilityToggle(row.key, v)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AnimateWrapper>

    <!-- ═══════════ FAB: Always-visible rescue button ═══════════ -->
    <Teleport to="body">
      <div
        class="fixed z-toast"
        style="bottom: calc(var(--footer-height) + var(--spacing-md)); right: var(--spacing-xl)"
      >
        <Button
          rounded
          severity="primary"
          icon="i-lucide-rotate-ccw"
          class="shadow-md hover:shadow-lg hover:scale-105 transition-all duration-md"
          aria-label="布局救援"
          @click="toggleFabMenu"
        />
        <Popover
          ref="fabPopoverRef"
          append-to="body"
        >
          <div class="col-stretch gap-xs p-xs">
            <span
              class="text-xs font-semibold text-muted-foreground px-sm pb-xs border-b border-border/30"
            >
              布局救援
            </span>
            <Button
              text
              size="small"
              severity="secondary"
              label="恢复导航路径"
              icon="i-lucide-navigation"
              class="w-full justify-start"
              @click="restoreNavigation"
            />
            <Button
              text
              size="small"
              severity="danger"
              label="完全重置所有设置"
              icon="i-lucide-rotate-ccw"
              class="w-full justify-start"
              @click="fullReset"
            />
            <Button
              text
              size="small"
              severity="secondary"
              label="清除 User Adjusted 标记"
              icon="i-lucide-undo-2"
              class="w-full justify-start"
              @click="clearUserAdjusted"
            />
          </div>
        </Popover>
      </div>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.layout-fade-enter-active,
.layout-fade-leave-active {
  transition:
    opacity var(--transition-md) ease,
    transform var(--transition-md) ease;
}

.layout-fade-enter-from,
.layout-fade-leave-to {
  opacity: 0;
  transform: translateY(calc(var(--spacing-xs) * -1));
}
</style>
