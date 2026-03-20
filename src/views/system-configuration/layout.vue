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
const showHeaderEffective = computed<boolean>(() =>
  deviceStore.type === 'PC'
    ? layoutStore.showHeader
    : deviceStore.isMobileLayout
      ? false
      : layoutStore.showHeader
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
    class="h-full column overflow-hidden"
    data-archetype="A1-toolbar-content"
  >
    <!-- Toolbar: Header (Transparent Root · Nested Canvas) -->
    <div class="shrink-0 border-b-default border-primary/50 bg-primary/5">
      <div
        class="py-sm md:py-md xl:py-lg 2xl:py-xl mx-auto max-w-[92%] sm:max-w-[94%] md:max-w-[92%] lg:max-w-[90%] xl:max-w-[88%] 2xl:max-w-[86%] 3xl:max-w-[84%] col-stack-sm py-sm"
      >
        <div class="row-y-center gap-md">
          <div class="p-md bg-primary/10 rounded-lg shrink-0">
            <Icons
              name="i-lucide-layout-dashboard"
              class="text-primary text-2xl"
            />
          </div>
          <div class="col-stack-xs">
            <h1 class="text-2xl font-bold text-foreground">Layout & Device System</h1>
            <p class="text-muted-foreground text-sm">
              布局/设备 Store 演示 · useDeviceStore、useLayoutStore、runAdaptive 与有效显隐
            </p>
          </div>
        </div>
        <Tag
          value="核心文档: ADAPTIVE_LAYOUT.md"
          severity="info"
          class="self-start mt-xs"
        />
        <!-- 架构提示 -->
        <div class="surface-item p-md rounded-md row-start gap-md shadow-sm dark:shadow-md mt-sm">
          <Icons
            name="i-lucide-info"
            class="text-primary text-xl shrink-0 mt-xs"
          />
          <div class="col-stack-xs">
            <div class="font-semibold text-primary text-sm">Architectural Guide 架构引导</div>
            <div class="text-muted-foreground text-xs leading-relaxed">
              业务视图组件应当仅读取 Store 状态，禁止通过逻辑手动触发适配函数。所有适配逻辑应由
              Layout 核心驱动。
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scrollable content -->
    <CScrollbar class="flex-1 min-h-0">
      <div
        class="py-sm md:py-md xl:py-lg 2xl:py-xl mx-auto max-w-[92%] sm:max-w-[94%] md:max-w-[92%] lg:max-w-[90%] xl:max-w-[88%] 2xl:max-w-[86%] 3xl:max-w-[84%] col-stack-xl"
      >
        <!-- Device Store (Dashboard KPI Style) -->
        <Card
          class="bg-card rounded-md shadow-sm dark:shadow-md py-md px-lg flex flex-col gap-lg bg-accent/10 dark:bg-accent/5"
        >
          <template #title>
            <div class="row-y-center gap-sm border-b-default pb-sm mb-padding-sm">
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
                class="surface-item rounded-lg p-xl row-y-center gap-lg group shadow-sm dark:shadow-md transition-all duration-xl ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_0_0_1px_rgb(var(--foreground)/0.12),0_8px_30px_rgb(var(--background)/0.85)] behavior-hover-transition min-w-0 shrink-0"
              >
                <div
                  class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-lg surface-item center transition-[transform,opacity] duration-md ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                >
                  <Icons
                    name="i-lucide-smartphone"
                    size="lg"
                    class="text-primary"
                  />
                </div>
                <div class="column">
                  <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    type
                  </span>
                  <span class="text-xl font-bold text-foreground tabular-nums">
                    {{ deviceStore.type }}
                  </span>
                </div>
              </div>
              <div
                class="surface-item rounded-lg p-xl row-y-center gap-lg group shadow-sm dark:shadow-md transition-all duration-xl ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_0_0_1px_rgb(var(--foreground)/0.12),0_8px_30px_rgb(var(--background)/0.85)] behavior-hover-transition min-w-0 shrink-0"
              >
                <div
                  class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-lg surface-item center transition-[transform,opacity] duration-md ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                >
                  <Icons
                    name="i-lucide-layout-grid"
                    size="lg"
                    class="text-success"
                  />
                </div>
                <div class="column">
                  <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    currentBreakpoint
                  </span>
                  <span class="text-xl font-bold text-foreground tabular-nums">
                    {{ deviceStore.currentBreakpoint }}
                  </span>
                </div>
              </div>
              <div
                class="surface-item rounded-lg p-xl row-y-center gap-lg group shadow-sm dark:shadow-md transition-all duration-xl ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_0_0_1px_rgb(var(--foreground)/0.12),0_8px_30px_rgb(var(--background)/0.85)] behavior-hover-transition min-w-0 shrink-0"
              >
                <div
                  class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-lg surface-item center transition-[transform,opacity] duration-md ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                >
                  <Icons
                    name="i-lucide-monitor-smartphone"
                    size="lg"
                    :class="deviceStore.isMobileLayout ? 'text-warn' : 'text-muted-foreground'"
                  />
                </div>
                <div class="column">
                  <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    isMobileLayout
                  </span>
                  <span class="text-xl font-bold text-foreground tabular-nums">
                    {{ deviceStore.isMobileLayout }}
                  </span>
                </div>
              </div>
              <div
                class="surface-item rounded-lg p-xl row-y-center gap-lg group shadow-sm dark:shadow-md transition-all duration-xl ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_0_0_1px_rgb(var(--foreground)/0.12),0_8px_30px_rgb(var(--background)/0.85)] behavior-hover-transition min-w-0 shrink-0"
              >
                <div
                  class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-lg surface-item center transition-[transform,opacity] duration-md ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                >
                  <Icons
                    name="i-lucide-tablet"
                    size="lg"
                    :class="deviceStore.isTabletLayout ? 'text-warn' : 'text-muted-foreground'"
                  />
                </div>
                <div class="column">
                  <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    isTabletLayout
                  </span>
                  <span class="text-xl font-bold text-foreground tabular-nums">
                    {{ deviceStore.isTabletLayout }}
                  </span>
                </div>
              </div>
              <div
                class="surface-item rounded-lg p-xl row-y-center gap-lg group shadow-sm dark:shadow-md transition-all duration-xl ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_0_0_1px_rgb(var(--foreground)/0.12),0_8px_30px_rgb(var(--background)/0.85)] behavior-hover-transition min-w-0 shrink-0"
              >
                <div
                  class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-lg surface-item center transition-[transform,opacity] duration-md ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                >
                  <Icons
                    name="i-lucide-monitor"
                    size="lg"
                    :class="deviceStore.isPCLayout ? 'text-info' : 'text-muted-foreground'"
                  />
                </div>
                <div class="column">
                  <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    isPCLayout
                  </span>
                  <span class="text-xl font-bold text-foreground tabular-nums">
                    {{ deviceStore.isPCLayout }}
                  </span>
                </div>
              </div>
              <div
                class="surface-item rounded-lg p-xl row-y-center gap-lg group shadow-sm dark:shadow-md transition-all duration-xl ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_0_0_1px_rgb(var(--foreground)/0.12),0_8px_30px_rgb(var(--background)/0.85)] behavior-hover-transition min-w-0 shrink-0"
              >
                <div
                  class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-lg surface-item center transition-[transform,opacity] duration-md ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                >
                  <Icons
                    name="i-lucide-rotate-cw"
                    size="lg"
                    class="text-muted-foreground"
                  />
                </div>
                <div class="column">
                  <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    orientation
                  </span>
                  <span class="text-xl font-bold text-foreground tabular-nums">
                    {{ deviceStore.orientation }}
                  </span>
                </div>
              </div>
              <div
                class="surface-item rounded-lg p-xl row-y-center gap-lg group shadow-sm dark:shadow-md transition-all duration-xl ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_0_0_1px_rgb(var(--foreground)/0.12),0_8px_30px_rgb(var(--background)/0.85)] behavior-hover-transition min-w-0 shrink-0"
              >
                <div
                  class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-lg surface-item center transition-[transform,opacity] duration-md ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                >
                  <Icons
                    name="i-lucide-maximize-2"
                    size="lg"
                    class="text-muted-foreground"
                  />
                </div>
                <div class="column">
                  <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    视口
                  </span>
                  <span class="text-xl font-bold text-foreground tabular-nums">
                    {{ deviceStore.width }} × {{ deviceStore.height }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Layout Store (Dashboard KPI Style) -->
        <Card
          class="bg-card rounded-md shadow-sm dark:shadow-md py-md px-lg flex flex-col gap-lg bg-accent/10 dark:bg-accent/5"
        >
          <template #title>
            <div class="row-y-center gap-sm border-b-default pb-sm mb-padding-sm">
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
                class="surface-item rounded-lg p-xl row-y-center gap-lg group shadow-sm dark:shadow-md transition-all duration-xl ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_0_0_1px_rgb(var(--foreground)/0.12),0_8px_30px_rgb(var(--background)/0.85)] behavior-hover-transition min-w-0 shrink-0"
              >
                <div
                  class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-lg surface-item center transition-[transform,opacity] duration-md ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                >
                  <Icons
                    name="i-lucide-layout-dashboard"
                    size="lg"
                    class="text-primary"
                  />
                </div>
                <div class="column">
                  <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    mode
                  </span>
                  <span class="text-xl font-bold text-foreground tabular-nums">
                    {{ layoutStore.mode }}
                  </span>
                </div>
              </div>
              <div
                class="surface-item rounded-lg p-xl row-y-center gap-lg group shadow-sm dark:shadow-md transition-all duration-xl ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_0_0_1px_rgb(var(--foreground)/0.12),0_8px_30px_rgb(var(--background)/0.85)] behavior-hover-transition min-w-0 shrink-0"
              >
                <div
                  class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-lg surface-item center transition-[transform,opacity] duration-md ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                >
                  <Icons
                    name="i-lucide-panel-left-close"
                    size="lg"
                    class="text-muted-foreground"
                  />
                </div>
                <div class="column">
                  <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    sidebarCollapse
                  </span>
                  <span class="text-xl font-bold text-foreground tabular-nums">
                    {{ layoutStore.sidebarCollapse }}
                  </span>
                </div>
              </div>
              <div
                class="surface-item rounded-lg p-xl row-y-center gap-lg group shadow-sm dark:shadow-md transition-all duration-xl ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_0_0_1px_rgb(var(--foreground)/0.12),0_8px_30px_rgb(var(--background)/0.85)] behavior-hover-transition min-w-0 shrink-0"
              >
                <div
                  class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-lg surface-item center transition-[transform,opacity] duration-md ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                >
                  <Icons
                    name="i-lucide-panel-left"
                    size="lg"
                    :class="layoutStore.showSidebar ? 'text-success' : 'text-muted-foreground'"
                  />
                </div>
                <div class="column">
                  <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    showSidebar
                  </span>
                  <span class="text-xl font-bold text-foreground tabular-nums">
                    {{ layoutStore.showSidebar }}
                  </span>
                </div>
              </div>
              <div
                class="surface-item rounded-lg p-xl row-y-center gap-lg group shadow-sm dark:shadow-md transition-all duration-xl ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_0_0_1px_rgb(var(--foreground)/0.12),0_8px_30px_rgb(var(--background)/0.85)] behavior-hover-transition min-w-0 shrink-0"
              >
                <div
                  class="shrink-0 w-[var(--spacing-3xl)] h-[var(--spacing-3xl)] rounded-lg surface-item center transition-[transform,opacity] duration-md ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                >
                  <Icons
                    name="i-lucide-user"
                    size="lg"
                    :class="layoutStore.userAdjusted ? 'text-info' : 'text-muted-foreground'"
                  />
                </div>
                <div class="column">
                  <span class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    userAdjusted
                  </span>
                  <span class="text-xl font-bold text-foreground tabular-nums">
                    {{ layoutStore.userAdjusted }}
                  </span>
                </div>
              </div>
            </div>
            <div class="mt-md p-sm surface-item rounded-md text-sm text-muted-foreground">
              showHeader / showMenu / showSidebar / showBreadcrumb / showTabs / showFooter
              由设置面板与 visibilitySettings[mode] 控制；对应的 headerHeight / sidebarWidth
              等尺寸来源于
              <span class="bg-muted px-xs rounded-xs font-mono">
                Size 预设 LAYOUT_DIMENSION_KEYS
              </span>
              ，禁止在业务中直接硬编码 px。
            </div>
          </template>
        </Card>

        <!-- Live Wireframe Preview (Hero: accent tint + title strip) -->
        <Card
          class="bg-card rounded-md shadow-sm dark:shadow-md py-md px-lg flex flex-col gap-lg bg-accent/10 dark:bg-accent/5"
        >
          <template #title>
            <div class="row-y-center gap-sm border-b-default pb-sm mb-padding-sm">
              <Icons
                name="i-lucide-app-window"
                class="text-primary"
              />
              <span class="font-semibold">Live Wireframe 实时线框图</span>
              <Tag
                :value="layoutStore.mode"
                severity="info"
              />
            </div>
          </template>
          <template #content>
            <div class="col-stack-md">
              <p class="text-muted-foreground text-sm">
                实时反映当前 Store 状态的布局线框图 · 勾选/取消左侧开关可即时观察布局变化
              </p>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                <!-- 左：开关面板 -->
                <div class="col-stack-md">
                  <h4 class="text-sm font-semibold text-foreground row-y-center gap-xs">
                    <Icons
                      name="i-lucide-toggle-left"
                      class="text-primary text-xs"
                    />
                    布局模块开关 (setModuleVisible)
                  </h4>
                  <div class="col-stack-sm">
                    <div
                      v-for="item in [
                        {
                          key: 'showHeader' as const,
                          label: 'Header 顶栏',
                          icon: 'i-lucide-panel-top',
                          effective: showHeaderEffective,
                        },
                        {
                          key: 'showSidebar' as const,
                          label: 'Sidebar 侧边栏',
                          icon: 'i-lucide-panel-left',
                          effective: showSidebarEffective,
                        },
                        {
                          key: 'showTabs' as const,
                          label: 'Tabs 标签页',
                          icon: 'i-lucide-panels-top-left',
                          effective: showTabsEffective,
                        },
                        {
                          key: 'showBreadcrumb' as const,
                          label: 'Breadcrumb 面包屑',
                          icon: 'i-lucide-chevrons-right',
                          effective: showBreadcrumbEffective,
                        },
                        {
                          key: 'showFooter' as const,
                          label: 'Footer 页脚',
                          icon: 'i-lucide-panel-bottom',
                          effective: showFooterEffective,
                        },
                      ]"
                      :key="item.key"
                      class="row-between p-sm surface-item rounded-lg behavior-hover-transition hover:bg-foreground/5"
                    >
                      <div class="row-y-center gap-sm">
                        <Checkbox
                          :model-value="layoutStore[item.key]"
                          :binary="true"
                          :input-id="`wireframe-${item.key}`"
                          @update:model-value="
                            (v: boolean) => layoutStore.setModuleVisible(item.key, v)
                          "
                        />
                        <label
                          :for="`wireframe-${item.key}`"
                          class="cursor-pointer select-none row-y-center gap-xs text-sm"
                        >
                          <Icons
                            :name="item.icon"
                            size="xs"
                            class="text-primary"
                          />
                          {{ item.label }}
                        </label>
                      </div>
                      <Tag
                        :value="item.effective ? '可见' : '隐藏'"
                        :severity="item.effective ? 'success' : 'secondary'"
                        class="text-xs"
                      />
                    </div>
                  </div>
                  <div
                    class="row-y-center gap-sm p-sm surface-item rounded-lg behavior-hover-transition hover:bg-foreground/5"
                  >
                    <Checkbox
                      :model-value="layoutStore.sidebarCollapse"
                      :binary="true"
                      input-id="wireframe-collapse"
                      @update:model-value="() => layoutStore.toggleCollapse()"
                    />
                    <label
                      for="wireframe-collapse"
                      class="cursor-pointer select-none row-y-center gap-xs text-sm"
                    >
                      <Icons
                        name="i-lucide-panel-left-close"
                        size="xs"
                        class="text-primary"
                      />
                      Sidebar Collapse 侧栏收起
                    </label>
                  </div>
                  <p class="text-xs text-muted-foreground">
                    开关调用
                    <span class="bg-muted px-xs rounded-xs font-mono">
                      layoutStore.setModuleVisible(key, bool)
                    </span>
                    ，与设置面板行为一致。
                  </p>
                </div>

                <!-- 右：线框图 -->
                <div class="col-stack-sm">
                  <h4 class="text-sm font-semibold text-foreground row-y-center gap-xs">
                    <Icons
                      name="i-lucide-layout-dashboard"
                      class="text-primary text-xs"
                    />
                    线框预览
                  </h4>
                  <div
                    class="relative rounded-lg shadow-sm dark:shadow-md bg-muted/30 overflow-hidden"
                    style="min-height: 220px"
                  >
                    <!-- Header -->
                    <div
                      class="transition-[transform,opacity] duration-md ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden border-b border-primary/20"
                      :style="{
                        height: showHeaderEffective ? '32px' : '0px',
                        opacity: showHeaderEffective ? 1 : 0,
                      }"
                    >
                      <div class="h-full bg-primary/15 row-y-center px-sm gap-sm">
                        <div
                          class="w-[var(--spacing-sm)] h-[var(--spacing-sm)] rounded-full bg-primary/40"
                        />
                        <div
                          class="w-[var(--spacing-3xl)] h-[var(--spacing-xs)] rounded-full bg-primary/25"
                        />
                        <div class="flex-1" />
                        <div
                          class="w-[var(--spacing-sm)] h-[var(--spacing-sm)] rounded-xs bg-primary/20"
                        />
                        <div
                          class="w-[var(--spacing-sm)] h-[var(--spacing-sm)] rounded-xs bg-primary/20"
                        />
                      </div>
                    </div>

                    <div
                      class="flex flex-1"
                      style="min-height: 160px"
                    >
                      <!-- Sidebar -->
                      <div
                        class="transition-[transform,opacity] duration-md ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden border-r border-primary/20 shrink-0"
                        :style="{
                          width: showSidebarEffective
                            ? layoutStore.sidebarCollapse
                              ? '32px'
                              : '80px'
                            : '0px',
                          opacity: showSidebarEffective ? 1 : 0,
                        }"
                      >
                        <div class="h-full bg-primary/10 col-stack-sm p-xs pt-sm">
                          <div
                            v-for="n in 4"
                            :key="n"
                            class="rounded-xs bg-primary/20 shrink-0"
                            :style="{
                              height: '12px',
                              width: layoutStore.sidebarCollapse ? '16px' : '90%',
                            }"
                          />
                          <div class="flex-1" />
                          <div
                            class="rounded-xs bg-primary/15 shrink-0"
                            :style="{
                              height: '12px',
                              width: layoutStore.sidebarCollapse ? '16px' : '70%',
                            }"
                          />
                        </div>
                      </div>

                      <!-- Main Area -->
                      <div class="flex-1 column min-w-0">
                        <!-- Tabs -->
                        <div
                          class="transition-[transform,opacity] duration-md ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden border-b border-primary/15"
                          :style="{
                            height: showTabsEffective ? '24px' : '0px',
                            opacity: showTabsEffective ? 1 : 0,
                          }"
                        >
                          <div class="h-full bg-primary/8 row-y-center px-xs gap-xs">
                            <div
                              class="px-xs py-xs rounded-t-xs bg-primary/20 text-xs text-primary/60"
                            >
                              Tab 1
                            </div>
                            <div
                              class="px-xs py-xs rounded-t-xs bg-primary/10 text-xs text-primary/40"
                            >
                              Tab 2
                            </div>
                            <div
                              class="px-xs py-xs rounded-t-xs bg-primary/10 text-xs text-primary/40"
                            >
                              Tab 3
                            </div>
                          </div>
                        </div>

                        <!-- Breadcrumb -->
                        <div
                          class="transition-[transform,opacity] duration-md ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden"
                          :style="{
                            height: showBreadcrumbEffective ? '20px' : '0px',
                            opacity: showBreadcrumbEffective ? 1 : 0,
                          }"
                        >
                          <div class="h-full row-y-center px-sm gap-xs">
                            <div class="w-[var(--spacing-lg)] h-[4px] rounded-full bg-primary/15" />
                            <span class="text-xs text-primary/30">/</span>
                            <div class="w-[var(--spacing-xl)] h-[4px] rounded-full bg-primary/20" />
                            <span class="text-xs text-primary/30">/</span>
                            <div class="w-[var(--spacing-md)] h-[4px] rounded-full bg-primary/25" />
                          </div>
                        </div>

                        <!-- Content -->
                        <div class="flex-1 p-sm center">
                          <div class="col-stack-xs items-center opacity-50">
                            <Icons
                              name="i-lucide-layout-dashboard"
                              class="text-primary/40 text-xl"
                            />
                            <span class="text-xs text-primary/40 font-mono">Content</span>
                          </div>
                        </div>

                        <!-- Footer -->
                        <div
                          class="transition-[transform,opacity] duration-md ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden border-t border-primary/15"
                          :style="{
                            height: showFooterEffective ? '20px' : '0px',
                            opacity: showFooterEffective ? 1 : 0,
                          }"
                        >
                          <div class="h-full bg-primary/8 center">
                            <div
                              class="w-[var(--spacing-3xl)] h-[4px] rounded-full bg-primary/15"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="row-y-center gap-sm text-xs text-muted-foreground">
                    <Tag
                      :value="`mode: ${layoutStore.mode}`"
                      severity="info"
                    />
                    <Tag
                      :value="`collapse: ${layoutStore.sidebarCollapse}`"
                      severity="secondary"
                    />
                    <Tag
                      :value="`device: ${deviceStore.type}`"
                      severity="secondary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- runAdaptive 与有效显隐 -->
        <Card
          class="bg-card rounded-md shadow-sm dark:shadow-md py-md px-lg flex flex-col gap-lg bg-primary/10 dark:bg-primary/5"
        >
          <template #title>
            <div class="row-y-center gap-sm border-b-default pb-sm mb-padding-sm">
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
            <div class="col-stack-md">
              <div>
                <h4 class="text-sm font-semibold text-foreground mb-xs">runAdaptive 触发时机</h4>
                <ul class="col-stack-xs list-disc pl-lg text-sm text-muted-foreground">
                  <li
                    v-for="(item, i) in adaptiveTriggerDesc"
                    :key="i"
                  >
                    {{ item }}
                  </li>
                </ul>
              </div>
              <div>
                <h4 class="text-sm font-semibold text-foreground mb-xs">有效显隐规则</h4>
                <p class="text-muted-foreground text-sm mb-sm">
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
                    class="row-between p-sm surface-item rounded-lg shadow-sm dark:shadow-md transition-all duration-xl ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_0_0_1px_rgb(var(--foreground)/0.12),0_8px_30px_rgb(var(--background)/0.85)] behavior-hover-transition hover:bg-foreground/5"
                  >
                    <span class="text-xs text-muted-foreground font-mono">{{ item.label }}</span>
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
        <Card class="bg-card rounded-md shadow-sm dark:shadow-md py-md px-lg flex flex-col gap-lg">
          <template #title>
            <div class="row-y-center gap-sm">
              <Icons
                name="i-lucide-shield-check"
                class="text-primary"
              />
              <span class="font-semibold">Architectural Rules 架构规则</span>
            </div>
          </template>
          <template #content>
            <div class="col-stack-lg">
              <div
                v-for="(item, i) in architecturalConstraints"
                :key="i"
                class="col-stack-sm"
              >
                <h4 class="text-sm font-semibold text-foreground row-y-center gap-xs">
                  <Icons
                    name="i-lucide-check-circle-2"
                    class="text-success text-xs"
                  />
                  {{ item.rule }}
                </h4>
                <p class="text-xs text-muted-foreground leading-relaxed pl-lg">
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
