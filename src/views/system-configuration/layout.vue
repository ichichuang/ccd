<script setup lang="ts">
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import { useDeviceStore } from '@/stores/modules/device'
import { useLayoutStore } from '@/stores/modules/layout'

const deviceStore = useDeviceStore()
const layoutStore = useLayoutStore()

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

/** runAdaptive 触发时机简要说明 */
const adaptiveTriggerDesc = [
  'onMounted 执行一次',
  'watch(deviceStore.isMobileLayout, isTabletLayout, isPCLayout, currentBreakpoint, type, orientation) 变化时执行',
]
</script>

<template>
  <CScrollbar class="h-full p-padding-lg bg-background">
    <div class="w-full max-w-[90vw] mx-auto flex flex-col gap-xl">
      <!-- Header -->
      <div class="flex flex-col gap-xs">
        <div class="flex items-center gap-md">
          <div class="p-padding-md bg-primary/10 rounded-scale-lg">
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
          class="self-start"
        />
      </div>

      <!-- Device Store -->
      <Card class="component-border">
        <template #title>
          <div class="flex items-center gap-sm">
            <Icons
              name="i-lucide-smartphone"
              class="text-primary"
            />
            <span>Device Store (useDeviceStore)</span>
            <Tag
              value="type / isMobileLayout / currentBreakpoint"
              severity="secondary"
            />
          </div>
        </template>
        <template #content>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
            <div class="flex flex-col gap-xs p-padding-md bg-muted/30 rounded-scale-md">
              <span class="text-muted-foreground fs-xs">type</span>
              <span class="font-mono fs-md font-semibold">{{ deviceStore.type }}</span>
              <span class="text-muted-foreground fs-xs">基于 UA 的物理设备类型</span>
            </div>
            <div class="flex flex-col gap-xs p-padding-md bg-muted/30 rounded-scale-md">
              <span class="text-muted-foreground fs-xs">isMobileLayout</span>
              <span class="font-mono fs-md font-semibold">{{ deviceStore.isMobileLayout }}</span>
              <span class="text-muted-foreground fs-xs">width &lt; lg (1024px)</span>
            </div>
            <div class="flex flex-col gap-xs p-padding-md bg-muted/30 rounded-scale-md">
              <span class="text-muted-foreground fs-xs">isTabletLayout</span>
              <span class="font-mono fs-md font-semibold">{{ deviceStore.isTabletLayout }}</span>
              <span class="text-muted-foreground fs-xs">md ≤ width &lt; lg</span>
            </div>
            <div class="flex flex-col gap-xs p-padding-md bg-muted/30 rounded-scale-md">
              <span class="text-muted-foreground fs-xs">isPCLayout</span>
              <span class="font-mono fs-md font-semibold">{{ deviceStore.isPCLayout }}</span>
              <span class="text-muted-foreground fs-xs">width ≥ lg</span>
            </div>
            <div class="flex flex-col gap-xs p-padding-md bg-muted/30 rounded-scale-md">
              <span class="text-muted-foreground fs-xs">currentBreakpoint</span>
              <span class="font-mono fs-md font-semibold">{{ deviceStore.currentBreakpoint }}</span>
              <span class="text-muted-foreground fs-xs">xs/sm/md/lg/xl/2xl/3xl/4xl/5xl</span>
            </div>
            <div class="flex flex-col gap-xs p-padding-md bg-muted/30 rounded-scale-md">
              <span class="text-muted-foreground fs-xs">orientation</span>
              <span class="font-mono fs-md font-semibold">{{ deviceStore.orientation }}</span>
              <span class="text-muted-foreground fs-xs">horizontal / vertical</span>
            </div>
            <div class="flex flex-col gap-xs p-padding-md bg-muted/30 rounded-scale-md">
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
            <span>Layout Store (useLayoutStore)</span>
            <Tag
              value="mode / sidebarCollapse / showXxx"
              severity="secondary"
            />
          </div>
        </template>
        <template #content>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
            <div class="flex flex-col gap-xs p-padding-md bg-muted/30 rounded-scale-md">
              <span class="text-muted-foreground fs-xs">mode</span>
              <span class="font-mono fs-md font-semibold">{{ layoutStore.mode }}</span>
              <span class="text-muted-foreground fs-xs">vertical / horizontal / mix</span>
            </div>
            <div class="flex flex-col gap-xs p-padding-md bg-muted/30 rounded-scale-md">
              <span class="text-muted-foreground fs-xs">sidebarCollapse</span>
              <span class="font-mono fs-md font-semibold">{{ layoutStore.sidebarCollapse }}</span>
              <span class="text-muted-foreground fs-xs">侧栏是否收起</span>
            </div>
            <div class="flex flex-col gap-xs p-padding-md bg-muted/30 rounded-scale-md">
              <span class="text-muted-foreground fs-xs">showSidebar</span>
              <span class="font-mono fs-md font-semibold">{{ layoutStore.showSidebar }}</span>
              <span class="text-muted-foreground fs-xs">配置面板控制</span>
            </div>
            <div class="flex flex-col gap-xs p-padding-md bg-muted/30 rounded-scale-md">
              <span class="text-muted-foreground fs-xs">userAdjusted</span>
              <span class="font-mono fs-md font-semibold">{{ layoutStore.userAdjusted }}</span>
              <span class="text-muted-foreground fs-xs">用户手动收展后 true</span>
            </div>
          </div>
          <div
            class="mt-margin-md p-padding-sm bg-muted/20 rounded-scale-sm fs-sm text-muted-foreground"
          >
            showHeader / showMenu / showSidebar / showBreadcrumb / showTabs / showFooter
            由设置面板与 visibilitySettings[mode] 控制。
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
            <span>runAdaptive & 有效显隐</span>
            <Tag
              value="LayoutAdmin 驱动"
              severity="info"
            />
          </div>
        </template>
        <template #content>
          <div class="flex flex-col gap-md">
            <div>
              <h4 class="fs-sm font-semibold text-foreground mb-margin-xs">runAdaptive 触发时机</h4>
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
                  class="flex items-center justify-between p-padding-sm bg-muted/30 rounded-scale-sm"
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
    </div>
  </CScrollbar>
</template>
