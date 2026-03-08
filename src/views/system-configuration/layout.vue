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
  <div class="h-full flex flex-col overflow-hidden">
    <!-- Toolbar: Header (non-scroll) -->
    <div class="shrink-0 px-padding-lg py-padding-md border-b-default">
      <div class="layout-content-wide flex flex-col gap-xs">
        <div class="flex items-center gap-md">
          <div class="p-padding-md bg-primary/10 rounded-scale-lg shrink-0">
            <Icons
              name="i-lucide-layout-dashboard"
              class="text-primary fs-2xl"
            />
          </div>
          <div>
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
            class="text-primary fs-xl shrink-0 mt-0.5"
          />
          <div class="flex flex-col gap-0.5">
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
      <div class="p-padding-lg">
        <div class="layout-content-wide flex flex-col gap-xl">
          <!-- Device Store -->
          <Card class="component-border">
            <template #title>
              <div class="flex items-center gap-sm">
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
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
                <div
                  class="flex flex-col gap-xs p-padding-md surface-item rounded-scale-md component-border hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-all duration-scale-lg"
                >
                  <span class="text-muted-foreground fs-xs">type</span>
                  <span class="font-mono fs-md font-semibold">{{ deviceStore.type }}</span>
                  <span class="text-muted-foreground fs-xs">基于 UA 的物理设备类型</span>
                </div>
                <div
                  class="flex flex-col gap-xs p-padding-md surface-item rounded-scale-md component-border hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-all duration-scale-lg"
                >
                  <span class="text-muted-foreground fs-xs">isMobileLayout</span>
                  <span class="font-mono fs-md font-semibold">
                    {{ deviceStore.isMobileLayout }}
                  </span>
                  <span class="text-muted-foreground fs-xs">width &lt; lg (1024px)</span>
                </div>
                <div
                  class="flex flex-col gap-xs p-padding-md surface-item rounded-scale-md component-border hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-all duration-scale-lg"
                >
                  <span class="text-muted-foreground fs-xs">isTabletLayout</span>
                  <span class="font-mono fs-md font-semibold">
                    {{ deviceStore.isTabletLayout }}
                  </span>
                  <span class="text-muted-foreground fs-xs">md ≤ width &lt; lg</span>
                </div>
                <div
                  class="flex flex-col gap-xs p-padding-md surface-item rounded-scale-md component-border hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-all duration-scale-lg"
                >
                  <span class="text-muted-foreground fs-xs">isPCLayout</span>
                  <span class="font-mono fs-md font-semibold">{{ deviceStore.isPCLayout }}</span>
                  <span class="text-muted-foreground fs-xs">width ≥ lg</span>
                </div>
                <div
                  class="flex flex-col gap-xs p-padding-md bg-muted/30 rounded-scale-md hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-all duration-scale-lg"
                >
                  <span class="text-muted-foreground fs-xs">currentBreakpoint</span>
                  <span class="font-mono fs-md font-semibold">
                    {{ deviceStore.currentBreakpoint }}
                  </span>
                  <span class="text-muted-foreground fs-xs">xs/sm/md/lg/xl/2xl/3xl/4xl/5xl</span>
                </div>
                <div
                  class="flex flex-col gap-xs p-padding-md bg-muted/30 rounded-scale-md hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-all duration-scale-lg"
                >
                  <span class="text-muted-foreground fs-xs">orientation</span>
                  <span class="font-mono fs-md font-semibold">{{ deviceStore.orientation }}</span>
                  <span class="text-muted-foreground fs-xs">horizontal / vertical</span>
                </div>
                <div
                  class="flex flex-col gap-xs p-padding-md bg-muted/30 rounded-scale-md hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-all duration-scale-lg"
                >
                  <span class="text-muted-foreground fs-xs">width × height</span>
                  <span class="font-mono fs-md font-semibold">
                    {{ deviceStore.width }} × {{ deviceStore.height }}
                  </span>
                  <span class="text-muted-foreground fs-xs">视口尺寸</span>
                </div>
              </div>
            </template>
          </Card>

          <!-- Layout Store -->
          <Card class="component-border">
            <template #title>
              <div class="flex items-center gap-sm">
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
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
                <div
                  class="flex flex-col gap-xs p-padding-md bg-muted/30 rounded-scale-md hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-all duration-scale-lg"
                >
                  <span class="text-muted-foreground fs-xs">mode</span>
                  <span class="font-mono fs-md font-semibold">{{ layoutStore.mode }}</span>
                  <span class="text-muted-foreground fs-xs">vertical / horizontal / mix</span>
                </div>
                <div
                  class="flex flex-col gap-xs p-padding-md bg-muted/30 rounded-scale-md hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-all duration-scale-lg"
                >
                  <span class="text-muted-foreground fs-xs">sidebarCollapse</span>
                  <span class="font-mono fs-md font-semibold">
                    {{ layoutStore.sidebarCollapse }}
                  </span>
                  <span class="text-muted-foreground fs-xs">侧栏是否收起</span>
                </div>
                <div
                  class="flex flex-col gap-xs p-padding-md bg-muted/30 rounded-scale-md hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-all duration-scale-lg"
                >
                  <span class="text-muted-foreground fs-xs">showSidebar</span>
                  <span class="font-mono fs-md font-semibold">{{ layoutStore.showSidebar }}</span>
                  <span class="text-muted-foreground fs-xs">配置面板控制</span>
                </div>
                <div
                  class="flex flex-col gap-xs p-padding-md bg-muted/30 rounded-scale-md hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-all duration-scale-lg"
                >
                  <span class="text-muted-foreground fs-xs">userAdjusted</span>
                  <span class="font-mono fs-md font-semibold">{{ layoutStore.userAdjusted }}</span>
                  <span class="text-muted-foreground fs-xs">用户手动收展后 true</span>
                </div>
              </div>
              <div
                class="mt-margin-md p-padding-sm surface-item rounded-scale-sm fs-sm text-muted-foreground"
              >
                showHeader / showMenu / showSidebar / showBreadcrumb / showTabs / showFooter
                由设置面板与 visibilitySettings[mode] 控制；对应的 headerHeight / sidebarWidth
                等尺寸来源于
                <span class="bg-muted px-padding-xs rounded font-mono">
                  Size 预设 LAYOUT_DIMENSION_KEYS
                </span>
                ，禁止在业务中直接硬编码 px。
              </div>
            </template>
          </Card>

          <!-- runAdaptive 与有效显隐 -->
          <Card class="component-border">
            <template #title>
              <div class="flex items-center gap-sm">
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
                  <ul class="list-disc pl-padding-lg fs-sm text-muted-foreground space-y-xs">
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
                      class="flex items-center justify-between p-padding-sm surface-item rounded-scale-sm component-border hover:shadow-md hover:bg-muted/60 dark:hover:bg-muted/40 hover:-translate-y-0.5 transition-all duration-scale-lg"
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
          <Card class="component-border bg-muted/5">
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
      </div>
    </CScrollbar>
  </div>
</template>
