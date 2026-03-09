<script setup lang="ts">
import { useDeviceStore } from '@/stores/modules/device'
import { useLayoutStore } from '@/stores/modules/layout'

const deviceStore: ReturnType<typeof useDeviceStore> = useDeviceStore()
const layoutStore: ReturnType<typeof useLayoutStore> = useLayoutStore()

/** 有效显隐（与 LayoutAdmin 逻辑一致）：PC 用 store；非 PC 且小视口强制 false */
const showSidebarEffective = computed<boolean>(() =>
  deviceStore.type === 'PC'
    ? layoutStore.showSidebar
    : deviceStore.isMobileLayout
      ? false
      : layoutStore.showSidebar
)
const showTabsEffective = computed<boolean>(() =>
  deviceStore.type === 'PC'
    ? layoutStore.showTabs
    : deviceStore.isMobileLayout
      ? false
      : layoutStore.showTabs
)
const showBreadcrumbEffective = computed<boolean>(() =>
  deviceStore.type === 'PC'
    ? layoutStore.showBreadcrumb
    : deviceStore.isMobileLayout
      ? false
      : layoutStore.showBreadcrumb
)
const showFooterEffective = computed<boolean>(() =>
  deviceStore.type === 'PC'
    ? layoutStore.showFooter
    : deviceStore.isMobileLayout
      ? false
      : layoutStore.showFooter
)

/** 架构约束：禁止在业务视图中直接调用适配函数 */
const architecturalConstraints = [
  {
    rule: '禁止在 View 视图层直接调用 adaptToMobile / adaptToTablet 等函数',
    reason: '这些函数属于 LayoutAdmin 的生命周期驱动，手动调用会破坏 SSOT 状态一致性。',
  },
  {
    rule: 'userAdjusted 逻辑',
    reason:
      '当用户手动点击收展侧边栏后，userAdjusted 记录为 true，此时断点变化将不再自动强制同步侧边栏状态，以尊重用户意图。',
  },
]

/** runAdaptive 触发时机简要说明 */
const adaptiveTriggerDesc = [
  'onMounted 执行一次',
  'watch(deviceStore.isMobileLayout, isTabletLayout, isPCLayout, currentBreakpoint, type, orientation) 变化时执行',
]
</script>

<template>
  <div
    class="h-full flex flex-col overflow-hidden"
    data-archetype="A1-toolbar-content"
  >
    <!-- Toolbar: Header (Transparent Root · Nested Canvas) -->
    <div class="shrink-0 border-b-default border-primary/50 bg-primary/5">
      <div class="layout-content-wide flex flex-col gap-sm py-padding-sm">
        <div class="flex items-center gap-md">
          <div class="p-padding-md bg-primary/10 rounded-scale-lg shrink-0">
            <Icons
              name="i-lucide-layout-dashboard"
              class="text-primary fs-2xl"
            />
          </div>
          <div class="flex flex-col gap-xs">
            <h1 class="fs-2xl font-bold text-foreground">Layout & Device System</h1>
            <p class="text-muted-foreground fs-sm">
              布局/设备 Store 演示 · useDeviceStore、useLayoutStore、runAdaptive 与有效显隐
            </p>
          </div>
        </div>
        <Tag
          value="核心文档: ADAPTIVE_LAYOUT.md"
          severity="info"
          class="self-start mt-margin-xs"
        />
        <!-- 架构提示 -->
        <div
          class="border-l-4 border-primary bg-primary/5 p-padding-md rounded-r-scale-md flex gap-md items-start mt-margin-sm"
        >
          <Icons
            name="i-lucide-info"
            class="text-primary fs-xl shrink-0 mt-margin-xs"
          />
          <div class="flex flex-col gap-xs">
            <div class="font-semibold text-primary fs-sm">Architectural Guide 架构引导</div>
            <div class="text-muted-foreground fs-xs leading-relaxed">
              业务视图组件应当仅读取 Store 状态，禁止通过逻辑手动触发适配函数。所有适配逻辑应由
              Layout 核心驱动。
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scrollable content -->
    <CScrollbar class="flex-1 min-h-0">
      <div class="layout-content-wide flex flex-col gap-xl">
        <!-- Device Store (Dashboard KPI Style) -->
        <Card
          class="bg-accent/10 dark:bg-accent/5 rounded-scale-xl shadow-soft p-padding-xl flex flex-col gap-lg"
        >
          <template #title>
            <div class="flex items-center gap-sm border-b-default pb-padding-sm mb-padding-sm">
              <Icons
                name="i-lucide-smartphone"
                class="text-primary"
              />
              <span class="font-semibold">Device Store (useDeviceStore)</span>
              <Tag
                value="type / isMobileLayout / currentBreakpoint"
                severity="secondary"
              />
            </div>
          </template>
          <template #content>
            <div class="layout-wrap gap-lg">
              <div
                class="surface-item rounded-scale-lg p-padding-xl flex items-center gap-lg group interactive-hover-tile behavior-hover-transition min-w-0 shrink-0"
              >
                <div
                  class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-scale-lg surface-item flex items-center justify-center transition-fluid group-hover:scale-105"
                >
                  <Icons
                    name="i-lucide-smartphone"
                    size="lg"
                    class="text-primary"
                  />
                </div>
                <div class="flex flex-col">
                  <span class="fs-xs font-medium text-muted-foreground uppercase tracking-wider">
                    type
                  </span>
                  <span class="fs-xl font-bold text-foreground tabular-nums">
                    {{ deviceStore.type }}
                  </span>
                </div>
              </div>
              <div
                class="surface-item rounded-scale-lg p-padding-xl flex items-center gap-lg group interactive-hover-tile behavior-hover-transition min-w-0 shrink-0"
              >
                <div
                  class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-scale-lg surface-item flex items-center justify-center transition-fluid group-hover:scale-105"
                >
                  <Icons
                    name="i-lucide-layout-grid"
                    size="lg"
                    class="text-success"
                  />
                </div>
                <div class="flex flex-col">
                  <span class="fs-xs font-medium text-muted-foreground uppercase tracking-wider">
                    currentBreakpoint
                  </span>
                  <span class="fs-xl font-bold text-foreground tabular-nums">
                    {{ deviceStore.currentBreakpoint }}
                  </span>
                </div>
              </div>
              <div
                class="surface-item rounded-scale-lg p-padding-xl flex items-center gap-lg group interactive-hover-tile behavior-hover-transition min-w-0 shrink-0"
              >
                <div
                  class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-scale-lg surface-item flex items-center justify-center transition-fluid group-hover:scale-105"
                >
                  <Icons
                    name="i-lucide-monitor-smartphone"
                    size="lg"
                    :class="deviceStore.isMobileLayout ? 'text-warn' : 'text-muted-foreground'"
                  />
                </div>
                <div class="flex flex-col">
                  <span class="fs-xs font-medium text-muted-foreground uppercase tracking-wider">
                    isMobileLayout
                  </span>
                  <span class="fs-xl font-bold text-foreground tabular-nums">
                    {{ deviceStore.isMobileLayout }}
                  </span>
                </div>
              </div>
              <div
                class="surface-item rounded-scale-lg p-padding-xl flex items-center gap-lg group interactive-hover-tile behavior-hover-transition min-w-0 shrink-0"
              >
                <div
                  class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-scale-lg surface-item flex items-center justify-center transition-fluid group-hover:scale-105"
                >
                  <Icons
                    name="i-lucide-tablet"
                    size="lg"
                    :class="deviceStore.isTabletLayout ? 'text-warn' : 'text-muted-foreground'"
                  />
                </div>
                <div class="flex flex-col">
                  <span class="fs-xs font-medium text-muted-foreground uppercase tracking-wider">
                    isTabletLayout
                  </span>
                  <span class="fs-xl font-bold text-foreground tabular-nums">
                    {{ deviceStore.isTabletLayout }}
                  </span>
                </div>
              </div>
              <div
                class="surface-item rounded-scale-lg p-padding-xl flex items-center gap-lg group interactive-hover-tile behavior-hover-transition min-w-0 shrink-0"
              >
                <div
                  class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-scale-lg surface-item flex items-center justify-center transition-fluid group-hover:scale-105"
                >
                  <Icons
                    name="i-lucide-monitor"
                    size="lg"
                    :class="deviceStore.isPCLayout ? 'text-info' : 'text-muted-foreground'"
                  />
                </div>
                <div class="flex flex-col">
                  <span class="fs-xs font-medium text-muted-foreground uppercase tracking-wider">
                    isPCLayout
                  </span>
                  <span class="fs-xl font-bold text-foreground tabular-nums">
                    {{ deviceStore.isPCLayout }}
                  </span>
                </div>
              </div>
              <div
                class="surface-item rounded-scale-lg p-padding-xl flex items-center gap-lg group interactive-hover-tile behavior-hover-transition min-w-0 shrink-0"
              >
                <div
                  class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-scale-lg surface-item flex items-center justify-center transition-fluid group-hover:scale-105"
                >
                  <Icons
                    name="i-lucide-rotate-cw"
                    size="lg"
                    class="text-muted-foreground"
                  />
                </div>
                <div class="flex flex-col">
                  <span class="fs-xs font-medium text-muted-foreground uppercase tracking-wider">
                    orientation
                  </span>
                  <span class="fs-xl font-bold text-foreground tabular-nums">
                    {{ deviceStore.orientation }}
                  </span>
                </div>
              </div>
              <div
                class="surface-item rounded-scale-lg p-padding-xl flex items-center gap-lg group interactive-hover-tile behavior-hover-transition min-w-0 shrink-0"
              >
                <div
                  class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-scale-lg surface-item flex items-center justify-center transition-fluid group-hover:scale-105"
                >
                  <Icons
                    name="i-lucide-maximize-2"
                    size="lg"
                    class="text-muted-foreground"
                  />
                </div>
                <div class="flex flex-col">
                  <span class="fs-xs font-medium text-muted-foreground uppercase tracking-wider">
                    视口
                  </span>
                  <span class="fs-xl font-bold text-foreground tabular-nums">
                    {{ deviceStore.width }} × {{ deviceStore.height }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Layout Store (Dashboard KPI Style) -->
        <Card
          class="bg-accent/10 dark:bg-accent/5 rounded-scale-xl shadow-soft p-padding-xl flex flex-col gap-lg"
        >
          <template #title>
            <div class="flex items-center gap-sm border-b-default pb-padding-sm mb-padding-sm">
              <Icons
                name="i-lucide-panel-left"
                class="text-primary"
              />
              <span class="font-semibold">Layout Store (useLayoutStore)</span>
              <Tag
                value="mode / sidebarCollapse / showXxx"
                severity="secondary"
              />
            </div>
          </template>
          <template #content>
            <div class="layout-wrap gap-lg">
              <div
                class="surface-item rounded-scale-lg p-padding-xl flex items-center gap-lg group interactive-hover-tile behavior-hover-transition min-w-0 shrink-0"
              >
                <div
                  class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-scale-lg surface-item flex items-center justify-center transition-fluid group-hover:scale-105"
                >
                  <Icons
                    name="i-lucide-layout-dashboard"
                    size="lg"
                    class="text-primary"
                  />
                </div>
                <div class="flex flex-col">
                  <span class="fs-xs font-medium text-muted-foreground uppercase tracking-wider">
                    mode
                  </span>
                  <span class="fs-xl font-bold text-foreground tabular-nums">
                    {{ layoutStore.mode }}
                  </span>
                </div>
              </div>
              <div
                class="surface-item rounded-scale-lg p-padding-xl flex items-center gap-lg group interactive-hover-tile behavior-hover-transition min-w-0 shrink-0"
              >
                <div
                  class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-scale-lg surface-item flex items-center justify-center transition-fluid group-hover:scale-105"
                >
                  <Icons
                    name="i-lucide-panel-left-close"
                    size="lg"
                    class="text-muted-foreground"
                  />
                </div>
                <div class="flex flex-col">
                  <span class="fs-xs font-medium text-muted-foreground uppercase tracking-wider">
                    sidebarCollapse
                  </span>
                  <span class="fs-xl font-bold text-foreground tabular-nums">
                    {{ layoutStore.sidebarCollapse }}
                  </span>
                </div>
              </div>
              <div
                class="surface-item rounded-scale-lg p-padding-xl flex items-center gap-lg group interactive-hover-tile behavior-hover-transition min-w-0 shrink-0"
              >
                <div
                  class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-scale-lg surface-item flex items-center justify-center transition-fluid group-hover:scale-105"
                >
                  <Icons
                    name="i-lucide-panel-left"
                    size="lg"
                    :class="layoutStore.showSidebar ? 'text-success' : 'text-muted-foreground'"
                  />
                </div>
                <div class="flex flex-col">
                  <span class="fs-xs font-medium text-muted-foreground uppercase tracking-wider">
                    showSidebar
                  </span>
                  <span class="fs-xl font-bold text-foreground tabular-nums">
                    {{ layoutStore.showSidebar }}
                  </span>
                </div>
              </div>
              <div
                class="surface-item rounded-scale-lg p-padding-xl flex items-center gap-lg group interactive-hover-tile behavior-hover-transition min-w-0 shrink-0"
              >
                <div
                  class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-scale-lg surface-item flex items-center justify-center transition-fluid group-hover:scale-105"
                >
                  <Icons
                    name="i-lucide-user"
                    size="lg"
                    :class="layoutStore.userAdjusted ? 'text-info' : 'text-muted-foreground'"
                  />
                </div>
                <div class="flex flex-col">
                  <span class="fs-xs font-medium text-muted-foreground uppercase tracking-wider">
                    userAdjusted
                  </span>
                  <span class="fs-xl font-bold text-foreground tabular-nums">
                    {{ layoutStore.userAdjusted }}
                  </span>
                </div>
              </div>
            </div>
            <div
              class="mt-margin-md p-padding-sm surface-item rounded-scale-md fs-sm text-muted-foreground"
            >
              showHeader / showMenu / showSidebar / showBreadcrumb / showTabs / showFooter
              由设置面板与 visibilitySettings[mode] 控制；对应的 headerHeight / sidebarWidth
              等尺寸来源于
              <span class="bg-muted px-padding-xs rounded-scale-xs font-mono">
                Size 预设 LAYOUT_DIMENSION_KEYS
              </span>
              ，禁止在业务中直接硬编码 px。
            </div>
          </template>
        </Card>

        <!-- runAdaptive 与有效显隐 -->
        <Card
          class="bg-primary/10 dark:bg-primary/5 rounded-scale-xl shadow-soft p-padding-xl flex flex-col gap-lg"
        >
          <template #title>
            <div class="flex items-center gap-sm border-b-default pb-padding-sm mb-padding-sm">
              <Icons
                name="i-lucide-rotate-ccw"
                class="text-primary"
              />
              <span class="font-semibold">runAdaptive & 有效显隐</span>
              <Tag
                value="LayoutAdmin 驱动"
                severity="info"
              />
            </div>
          </template>
          <template #content>
            <div class="flex flex-col gap-md">
              <div>
                <h4 class="fs-sm font-semibold text-foreground mb-margin-xs">
                  runAdaptive 触发时机
                </h4>
                <ul class="flex flex-col gap-xs list-disc pl-padding-lg fs-sm text-muted">
                  <li
                    v-for="(item, i) in adaptiveTriggerDesc"
                    :key="i"
                  >
                    {{ item }}
                  </li>
                </ul>
              </div>
              <div>
                <h4 class="fs-sm font-semibold text-foreground mb-margin-xs">有效显隐规则</h4>
                <p class="text-muted-foreground fs-sm mb-margin-sm">
                  PC：直接使用 layoutStore.showXxx；非 PC 且 isMobileLayout 时强制 false；非 PC 且
                  !isMobileLayout 时使用 layoutStore.showXxx。
                </p>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-md">
                  <div
                    v-for="item in [
                      { label: 'showSidebarEffective', val: showSidebarEffective },
                      { label: 'showTabsEffective', val: showTabsEffective },
                      { label: 'showBreadcrumbEffective', val: showBreadcrumbEffective },
                      { label: 'showFooterEffective', val: showFooterEffective },
                    ]"
                    :key="item.label"
                    class="flex items-center justify-between p-padding-sm surface-item rounded-scale-lg interactive-hover-tile behavior-hover-transition hover:bg-foreground/5"
                  >
                    <span class="fs-xs text-muted-foreground font-mono">{{ item.label }}</span>
                    <Tag
                      :value="String(item.val)"
                      :severity="item.val ? 'success' : 'secondary'"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- 架构规则与详细逻辑 -->
        <Card class="bg-card rounded-scale-xl shadow-soft p-padding-xl flex flex-col gap-lg">
          <template #title>
            <div class="flex items-center gap-sm">
              <Icons
                name="i-lucide-shield-check"
                class="text-primary"
              />
              <span class="font-semibold">Architectural Rules 架构规则</span>
            </div>
          </template>
          <template #content>
            <div class="flex flex-col gap-lg">
              <div
                v-for="(item, i) in architecturalConstraints"
                :key="i"
                class="flex flex-col gap-sm"
              >
                <h4 class="fs-sm font-semibold text-foreground flex items-center gap-xs">
                  <Icons
                    name="i-lucide-check-circle-2"
                    class="text-success fs-xs"
                  />
                  {{ item.rule }}
                </h4>
                <p class="fs-xs text-muted-foreground leading-relaxed pl-padding-lg">
                  {{ item.reason }}
                </p>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </CScrollbar>
  </div>
</template>
