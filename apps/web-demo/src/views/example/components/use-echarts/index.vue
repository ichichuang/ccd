<script setup lang="ts">
/**
 * UseEcharts 示例 - 目录 + Tabs 多模式
 * 基础、动态、高级、多图表联动、自定义配色、事件与 Ref
 */
import type { EChartsOption } from 'echarts'
import type { ChartInstance } from '@ccd/vue-charts'
import type { WritableComputedRef } from 'vue'
import { nextTick } from 'vue'
import { onUpdated } from 'vue'
import { castValue } from '@ccd/shared-utils'
import {
  getDefaultToolboxConfig,
  getDefaultMarkPointConfig,
  getDefaultMarkLineConfig,
  getDefaultVisualMapConfig,
  getDefaultBrushConfig,
} from '@ccd/vue-charts'
import {
  lineOption as basicLineOption,
  lineWithAreaOption as basicLineWithAreaOption,
  barOption as basicBarOption,
  pieOption as basicPieOption,
} from './configs/basicChartConfig'
import {
  useDynamicChartOption,
  usePollingChartOption,
  useAutoHighlightChartOption,
} from './configs/dynamicChartConfig'
import {
  heatmapOption as advancedHeatmapOption,
  multiSeriesLineOption as advancedMultiSeriesLineOption,
  barWithMarkOption as advancedBarWithMarkOption,
} from './configs/advancedChartConfig'
import {
  CONNECT_CARTESIAN_GROUP_ID,
  CONNECT_MIXED_GROUP_ID,
  connectLineOption,
  connectBarOption,
  connectAreaOption,
  connectPieOption,
} from './configs/connectChartConfig'
import { customThemeOption } from './configs/customThemeConfig'
import { eventsRefOption } from './configs/eventsRefConfig'
import GlobalControls from './components/GlobalControls.vue'
import ChartDemoCard from './components/ChartDemoCard.vue'

/** Vue 3：模板 ref 处于 v-for 祖先内时，.value 可能为组件实例数组 */
function unwrapChartRef(
  refVal: ChartInstance | ChartInstance[] | null | undefined
): ChartInstance | null {
  if (!refVal) return null
  return Array.isArray(refVal) ? (refVal[0] ?? null) : refVal
}

type TabKey = 'basic' | 'dynamic' | 'advanced' | 'connect' | 'customTheme' | 'eventsRef'
const TAB_KEYS = ['basic', 'dynamic', 'advanced', 'connect', 'customTheme', 'eventsRef'] as const
const TAB_KEY_SET: ReadonlySet<string> = new Set(TAB_KEYS)

function isTabKey(value: string | number): value is TabKey {
  return typeof value === 'string' && TAB_KEY_SET.has(value)
}

const activeTab = ref<TabKey>('basic')
const activeTabModel: WritableComputedRef<string | number> = computed({
  get: () => activeTab.value,
  set: (v: string | number) => {
    if (isTabKey(v)) activeTab.value = v
  },
})

// ---------- 全局控制（basic / customTheme / dynamic 用） ----------
const themeEnabled = ref(true)
const lineAreaOpacity = ref(0.3)
/** 与 DEFAULT_OPACITY_VALUES.bar 默认一致，驱动柱状图 itemStyle.opacity */
const barOpacity = ref(1)
const renderer = ref<'canvas' | 'svg'>('canvas')
const chartLoading = ref(false)
const themeConfig = computed(() => ({
  enableTheme: themeEnabled.value,
  opacity: {
    lineArea: lineAreaOpacity.value,
    bar: barOpacity.value,
  },
}))

// ---------- 基础：ref 包装 config 的 option ----------
const lineOptionRef = ref<EChartsOption>(basicLineOption)
const barOptionRef = ref<EChartsOption>(basicBarOption)
const pieOptionRef = ref<EChartsOption>(basicPieOption)

// 创建 computed 包装，确保类型正确传递给 UseEcharts
const lineOptionComputed = computed(() => castValue<EChartsOption>(lineOptionRef.value))
const barOptionComputed = computed(() => castValue<EChartsOption>(barOptionRef.value))
const pieOptionComputed = computed(() => castValue<EChartsOption>(pieOptionRef.value))

// ---------- 动态 ----------
const { option: dynamicOption, loading: dynamicLoading, refreshData } = useDynamicChartOption()
const {
  option: pollingOption,
  isRunning: pollingRunning,
  start: startPolling,
  stop: stopPolling,
} = usePollingChartOption()
const {
  option: autoHighlightOption,
  isRunning: autoHighlightRunning,
  start: startAutoHighlight,
  stop: stopAutoHighlight,
} = useAutoHighlightChartOption()
const autoHighlightChartRef = ref<ChartInstance | ChartInstance[] | null>(null)

const handleToggleAutoHighlight = () => {
  if (autoHighlightRunning.value) {
    stopAutoHighlight()
    return
  }

  startAutoHighlight(
    () => unwrapChartRef(autoHighlightChartRef.value)?.getEchartsInstance?.() ?? null
  )
}

// ---------- 高级：config 合并 show:true ----------
const toolboxConfig = computed(() => ({ ...getDefaultToolboxConfig(), show: true }))
const markPointConfig = computed(() => ({
  ...getDefaultMarkPointConfig(),
  show: true,
  data: [
    { type: 'max', name: '最大值' },
    { type: 'min', name: '最小值' },
  ],
}))
const markLineConfig = computed(() => ({
  ...getDefaultMarkLineConfig(),
  show: true,
  data: [{ type: 'average', name: '平均值' }],
}))
const visualMapConfig = computed(() => ({ ...getDefaultVisualMapConfig(), show: true }))
const brushConfig = computed(() => ({ ...getDefaultBrushConfig(), show: true }))

// ---------- 联动 ----------
const chartRef = ref<ChartInstance | ChartInstance[] | null>(null)
const chartRef2 = ref<ChartInstance | ChartInstance[] | null>(null)
const chartRef3 = ref<ChartInstance | ChartInstance[] | null>(null)
const pieLineRef = ref<ChartInstance | ChartInstance[] | null>(null)
const pieBarRef = ref<ChartInstance | ChartInstance[] | null>(null)
const pieRef = ref<ChartInstance | ChartInstance[] | null>(null)
const connectLog = ref<string[]>([])
let cleanupPieConnectHandlers: (() => void) | null = null
let mixedPointerInside = false
let mixedClearTimer: ReturnType<typeof globalThis.setTimeout> | null = null

// 联动 tab 图表就绪计数 — 每当图表实例触发 @chart-ready，计数 +1；达到目标数时运行联动绑定
let pieGroupReadyCount = 0

function onConnectChartReady() {
  // 共享 UseEcharts 已负责 group + echarts.connect 生命周期，此处仅记录可观测日志。
  const state = unwrapChartRef(chartRef.value)?.getConnectState?.()
  appendConnectLog(`chartReady(connect): ${JSON.stringify(state ?? {}).slice(0, 80)}...`)
}

function onPieChartReady() {
  pieGroupReadyCount++
  if (pieGroupReadyCount < 3) return
  void nextTick(() => {
    ensureLineBarPieSyncReady()
  })
}

function appendConnectLog(line: string) {
  connectLog.value = [line, ...connectLog.value].slice(0, 20)
}

function markMixedPointerInside() {
  mixedPointerInside = true
}

function markMixedPointerLeave() {
  mixedPointerInside = false
}

function handleMixedPointerActivity() {
  markMixedPointerInside()
  ensureLineBarPieSyncReady()
}

function resolveMixedChartInstance(testId: string): unknown | null {
  const selector = `[data-testid="${testId}"] .echarts`
  const host = document.querySelector(selector) as
    | (HTMLElement & {
        __vueParentComponent?: {
          exposed?: {
            chart?: {
              value?: unknown
            }
          }
        }
      })
    | null
  return host?.__vueParentComponent?.exposed?.chart?.value ?? null
}

function ensureLineBarPieSyncReady() {
  mixedPointerInside = true
  if (activeTab.value !== 'connect') return
  if (cleanupPieConnectHandlers) return
  const instLine = resolveMixedChartInstance('connect-mixed-chart-line')
  const instBar = resolveMixedChartInstance('connect-mixed-chart-bar')
  const instPie = resolveMixedChartInstance('connect-mixed-chart-pie')
  if (!instLine || !instBar || !instPie) return
  setupLineBarPieSync()
}

function setupLineBarPieSync() {
  type EChartsLike = {
    dispatchAction: (payload: Record<string, unknown>) => void
    on: (event: string, handler: (params: unknown) => void) => void
    off: (event: string, handler: (params: unknown) => void) => void
  }

  const instLine = resolveMixedChartInstance('connect-mixed-chart-line') as EChartsLike | null
  const instBar = resolveMixedChartInstance('connect-mixed-chart-bar') as EChartsLike | null
  const instPie = resolveMixedChartInstance('connect-mixed-chart-pie') as EChartsLike | null

  if (!instLine || !instBar || !instPie) return
  if (cleanupPieConnectHandlers) {
    cleanupPieConnectHandlers()
    cleanupPieConnectHandlers = null
  }

  const handlers: Array<{ inst: EChartsLike; event: string; handler: (params: unknown) => void }> =
    []
  const lineXAxis = Array.isArray(connectLineOption.xAxis)
    ? connectLineOption.xAxis[0]
    : connectLineOption.xAxis
  const mixedCategoryNames = (lineXAxis as { data?: string[] } | undefined)?.data
  const pieSeries = Array.isArray(connectPieOption.series)
    ? connectPieOption.series[0]
    : connectPieOption.series
  const pieData = (pieSeries as { data?: Array<{ name?: string }> } | undefined)?.data
  const pieDataSize = pieData?.length ?? 0

  let dispatchDepth = 0
  let activeDataIndex: number | null = null
  let activeFromPie = false

  const cancelQueuedClear = () => {
    if (mixedClearTimer === null) return
    globalThis.clearTimeout(mixedClearTimer)
    mixedClearTimer = null
  }

  const withBridgeGuard = (task: () => void) => {
    dispatchDepth += 1
    try {
      task()
    } finally {
      dispatchDepth -= 1
    }
  }

  const isDispatching = () => dispatchDepth > 0

  const normalizeDataIndex = (raw: unknown): number | undefined => {
    if (typeof raw !== 'number' || !Number.isInteger(raw) || raw < 0) {
      return undefined
    }
    if (pieDataSize > 0 && raw >= pieDataSize) {
      return undefined
    }
    return raw
  }

  const resolveNameToDataIndex = (name: unknown): number | undefined => {
    if (typeof name !== 'string') return undefined
    if (pieData?.length) {
      const fromPie = pieData.findIndex(item => item?.name === name)
      if (fromPie >= 0) return fromPie
    }
    if (mixedCategoryNames?.length) {
      const fromAxis = mixedCategoryNames.findIndex(item => item === name)
      if (fromAxis >= 0) return fromAxis
    }
    return undefined
  }

  const extractAxisInfoIndex = (params: unknown): number | undefined => {
    const p = params as {
      axesInfo?: Array<{
        value?: number | string
        dataIndex?: number
      }>
      dataIndex?: number
      batch?: Array<{ dataIndex?: number }>
      name?: string
    }
    const axisInfo = p.axesInfo?.[0]
    const axisDataIndex = normalizeDataIndex(axisInfo?.dataIndex)
    if (axisDataIndex !== undefined) return axisDataIndex

    const axisValue = axisInfo?.value
    if (typeof axisValue === 'number') {
      const normalized = normalizeDataIndex(axisValue)
      if (normalized !== undefined) return normalized
    }
    if (typeof axisValue === 'string') {
      const byName = resolveNameToDataIndex(axisValue)
      if (byName !== undefined) return byName
    }

    const byDataIndex = normalizeDataIndex(p.dataIndex)
    if (byDataIndex !== undefined) return byDataIndex

    const byBatch = normalizeDataIndex(p.batch?.[0]?.dataIndex)
    if (byBatch !== undefined) return byBatch

    return resolveNameToDataIndex(p.name)
  }

  const extractItemIndex = (params: unknown): number | undefined => {
    const p = params as {
      dataIndex?: number
      batch?: Array<{ dataIndex?: number }>
      name?: string
    }
    const byDataIndex = normalizeDataIndex(p.dataIndex)
    if (byDataIndex !== undefined) return byDataIndex

    const byBatch = normalizeDataIndex(p.batch?.[0]?.dataIndex)
    if (byBatch !== undefined) return byBatch

    return resolveNameToDataIndex(p.name)
  }

  const clearMixedState = (hideTip: boolean) => {
    cancelQueuedClear()
    withBridgeGuard(() => {
      instLine.dispatchAction({ type: 'downplay', seriesIndex: 0 })
      instBar.dispatchAction({ type: 'downplay', seriesIndex: 0 })
      instPie.dispatchAction({ type: 'downplay', seriesIndex: 0 })

      if (hideTip) {
        instLine.dispatchAction({ type: 'hideTip' })
        instBar.dispatchAction({ type: 'hideTip' })
        instPie.dispatchAction({ type: 'hideTip' })
      }
    })
    activeDataIndex = null
    activeFromPie = false
  }

  const queueClearMixedState = () => {
    cancelQueuedClear()
    mixedClearTimer = globalThis.setTimeout(() => {
      mixedClearTimer = null
      if (mixedPointerInside) return
      clearMixedState(true)
    }, 0)
  }

  const syncFromCartesian = (dataIndex: number) => {
    cancelQueuedClear()
    if (activeDataIndex === dataIndex && !activeFromPie) return

    withBridgeGuard(() => {
      instPie.dispatchAction({ type: 'downplay', seriesIndex: 0 })
      instPie.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex })
      instPie.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex })
      instLine.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex })
      instBar.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex })
    })

    activeDataIndex = dataIndex
    activeFromPie = false
  }

  const syncFromPie = (dataIndex: number) => {
    cancelQueuedClear()
    if (activeDataIndex === dataIndex && activeFromPie) return

    withBridgeGuard(() => {
      instPie.dispatchAction({ type: 'downplay', seriesIndex: 0 })
      instPie.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex })
      instPie.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex })

      instLine.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex })
      instLine.dispatchAction({ type: 'updateAxisPointer', seriesIndex: 0, dataIndex })
      instLine.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex })

      instBar.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex })
      instBar.dispatchAction({ type: 'updateAxisPointer', seriesIndex: 0, dataIndex })
      instBar.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex })
    })

    activeDataIndex = dataIndex
    activeFromPie = true
  }

  const bindCartesianBridge = (self: EChartsLike) => {
    const pointerHandler = (params: unknown) => {
      if (isDispatching()) return
      const dataIndex = extractAxisInfoIndex(params)
      if (dataIndex === undefined) return
      syncFromCartesian(dataIndex)
    }

    const hoverHandler = (params: unknown) => {
      if (isDispatching()) return
      const dataIndex = extractItemIndex(params)
      if (dataIndex === undefined) return
      syncFromCartesian(dataIndex)
    }

    const globaloutHandler = () => {
      if (isDispatching()) return
      queueClearMixedState()
    }

    self.on('updateAxisPointer', pointerHandler)
    handlers.push({ inst: self, event: 'updateAxisPointer', handler: pointerHandler })

    self.on('mouseover', hoverHandler)
    handlers.push({ inst: self, event: 'mouseover', handler: hoverHandler })

    self.on('globalout', globaloutHandler)
    handlers.push({ inst: self, event: 'globalout', handler: globaloutHandler })
  }

  bindCartesianBridge(instLine)
  bindCartesianBridge(instBar)

  const pieHoverHandler = (params: unknown) => {
    if (isDispatching()) return
    const dataIndex = extractItemIndex(params)
    if (dataIndex === undefined) return
    syncFromPie(dataIndex)
  }

  const pieGlobaloutHandler = () => {
    if (isDispatching()) return
    queueClearMixedState()
  }

  instPie.on('mouseover', pieHoverHandler)
  handlers.push({ inst: instPie, event: 'mouseover', handler: pieHoverHandler })

  instPie.on('highlight', pieHoverHandler)
  handlers.push({ inst: instPie, event: 'highlight', handler: pieHoverHandler })

  instPie.on('globalout', pieGlobaloutHandler)
  handlers.push({ inst: instPie, event: 'globalout', handler: pieGlobaloutHandler })

  cleanupPieConnectHandlers = () => {
    handlers.forEach(({ inst, event, handler }) => {
      inst.off(event, handler)
    })
    clearMixedState(true)
  }
}

// ---------- 事件与 Ref ----------
const chartRefMethods = ref<ChartInstance | ChartInstance[] | null>(null)
const chartReadyFired = ref(false)
const finishedFired = ref(false)
const eventLog = ref<string[]>([])
const refMethodsLog = ref<string[]>([])

function logEvent(name: string, payload?: unknown) {
  const line = payload !== undefined ? `${name}: ${JSON.stringify(payload).slice(0, 80)}...` : name
  eventLog.value = [line, ...eventLog.value].slice(0, 20)
}

function onChartReady(instance: unknown) {
  chartReadyFired.value = true
  logEvent('chartReady', { hasInstance: !!instance })
}

function onFinished() {
  finishedFired.value = true
  logEvent('finished')
}

function onChartClick(params: { name?: string; seriesName?: string }) {
  logEvent('click', params)
}

function onLegendSelectChanged(params: { selected?: Record<string, boolean> }) {
  logEvent('legendSelectChanged', params)
}

function onDataZoom(params: { start?: number; end?: number }) {
  logEvent('dataZoom', params)
}

function handleGetChartInstance() {
  const chart = unwrapChartRef(chartRefMethods.value)
  const inst = chart?.getChartInstance()
  refMethodsLog.value = [`getChartInstance: ${inst ? 'ok' : 'null'}`, ...refMethodsLog.value]
}

function handleGetEchartsInstance() {
  const chart = unwrapChartRef(chartRefMethods.value)
  const inst = chart?.getEchartsInstance()
  refMethodsLog.value = [`getEchartsInstance: ${inst ? 'ok' : 'null'}`, ...refMethodsLog.value]
}

function handleSetOption() {
  const chart = unwrapChartRef(chartRefMethods.value)
  if (!chart) return
  chart.setOption(
    {
      xAxis: { type: 'category', data: ['新A', '新B', '新C'] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [5, 15, 25] }],
    },
    true
  )
  refMethodsLog.value = ['setOption(option, true) 已执行', ...refMethodsLog.value]
}

function handleResize() {
  unwrapChartRef(chartRefMethods.value)?.resize()
  refMethodsLog.value = ['resize() 已执行', ...refMethodsLog.value]
}

function handleClear() {
  unwrapChartRef(chartRefMethods.value)?.clear()
  refMethodsLog.value = ['clear() 已执行', ...refMethodsLog.value]
}

function handleTriggerConnect() {
  type EChartsLike = {
    dispatchAction?: (payload: Record<string, unknown>) => void
  }
  const inst1 = unwrapChartRef(chartRef.value)?.getEchartsInstance?.() as EChartsLike | undefined
  const inst2 = unwrapChartRef(chartRef2.value)?.getEchartsInstance?.() as EChartsLike | undefined
  const inst3 = unwrapChartRef(chartRef3.value)?.getEchartsInstance?.() as EChartsLike | undefined

  const instances = [inst1, inst2, inst3].filter(Boolean) as EChartsLike[]
  if (instances.length === 0) return

  // 先清除所有高亮
  instances.forEach(inst => {
    inst.dispatchAction?.({ type: 'downplay', seriesIndex: 0 })
  })

  // 再高亮目标数据点
  instances.forEach(inst => {
    inst.dispatchAction?.({ type: 'highlight', seriesIndex: 0, dataIndex: 2 })
    inst.dispatchAction?.({ type: 'updateAxisPointer', seriesIndex: 0, dataIndex: 2 })
  })

  appendConnectLog('triggerConnect(highlight, seriesIndex=0, dataIndex=2)')
}

function handleGetConnectState() {
  const state = unwrapChartRef(chartRef.value)?.getConnectState()
  appendConnectLog(`getConnectState: ${JSON.stringify(state ?? {}).slice(0, 80)}...`)
}

function handleTriggerConnectPieGroup() {
  type EChartsLike = {
    dispatchAction?: (payload: Record<string, unknown>) => void
  }
  const instLine = resolveMixedChartInstance('connect-mixed-chart-line') as EChartsLike | null
  const instBar = resolveMixedChartInstance('connect-mixed-chart-bar') as EChartsLike | null
  const instPie = resolveMixedChartInstance('connect-mixed-chart-pie') as EChartsLike | null

  if (!instLine || !instBar || !instPie) return

  // 先清除所有高亮
  instLine.dispatchAction?.({ type: 'downplay', seriesIndex: 0 })
  instBar.dispatchAction?.({ type: 'downplay', seriesIndex: 0 })
  instPie.dispatchAction?.({ type: 'downplay', seriesIndex: 0 })

  // 再高亮目标数据点
  instLine.dispatchAction?.({ type: 'highlight', seriesIndex: 0, dataIndex: 2 })
  instLine.dispatchAction?.({ type: 'updateAxisPointer', seriesIndex: 0, dataIndex: 2 })
  instBar.dispatchAction?.({ type: 'highlight', seriesIndex: 0, dataIndex: 2 })
  instBar.dispatchAction?.({ type: 'updateAxisPointer', seriesIndex: 0, dataIndex: 2 })
  instPie.dispatchAction?.({ type: 'highlight', seriesIndex: 0, dataIndex: 2 })

  appendConnectLog('pie-group: highlight dataIndex=2')
}

watch(activeTab, tab => {
  if (cleanupPieConnectHandlers) {
    cleanupPieConnectHandlers()
    cleanupPieConnectHandlers = null
  }
  if (tab === 'connect') {
    // Reset readiness counters — setup is triggered by @chart-ready events
    pieGroupReadyCount = 0
    mixedPointerInside = false
    void nextTick(() => {
      ensureLineBarPieSyncReady()
    })
  }
})

watch([pieLineRef, pieBarRef, pieRef], () => {
  void nextTick(() => {
    ensureLineBarPieSyncReady()
  })
})

onMounted(() => {
  if (activeTab.value !== 'connect') return
  void nextTick(() => {
    ensureLineBarPieSyncReady()
  })
})

onUpdated(() => {
  ensureLineBarPieSyncReady()
})

onBeforeUnmount(() => {
  if (mixedClearTimer !== null) {
    globalThis.clearTimeout(mixedClearTimer)
    mixedClearTimer = null
  }
  if (cleanupPieConnectHandlers) cleanupPieConnectHandlers()
})
</script>

<template>
  <div
    class="col-stretch"
    data-archetype="A1-toolbar-content"
  >
    <div class="col-stretch gap-md min-h-0 min-w-0">
      <div class="layout-full p-md col-stretch gap-md min-w-0">
        <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
          <div class="row-between gap-md min-w-0">
            <div class="row-start gap-sm min-w-0 flex-wrap">
              <div class="glass-icon-box shrink-0">
                <Icons
                  name="i-lucide-chart-area"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">UseEcharts</span>
                  <span
                    class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase"
                  >
                    COMPONENT
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  ECharts 集成示例：基础、动态、高级、多图表联动、自定义配色、事件与 Ref。
                </span>
              </div>
            </div>
          </div>
        </header>

        <Tabs
          v-model:value="activeTabModel"
          class="col-fill"
        >
          <div class="shrink-0 row-between border-b border-border pr-md">
            <TabList class="border-0!">
              <Tab value="basic">基础</Tab>
              <Tab value="dynamic">动态</Tab>
              <Tab value="advanced">高级</Tab>
              <Tab value="connect">多图表联动</Tab>
              <Tab value="customTheme">自定义配色</Tab>
              <Tab value="eventsRef">事件与 Ref</Tab>
            </TabList>
          </div>

          <TabPanels class="col-fill overflow-hidden p-0">
            <TabPanel
              v-for="tab in TAB_KEYS"
              :key="tab"
              :value="tab"
              class="col-fill"
            >
              <div class="flex-1 min-h-0 row-start gap-md items-stretch overflow-hidden min-w-0">
                <!-- 局部滚动：图表示例区内容长度远超单屏，保持本区独立滚动避免影响右侧面板定位 -->
                <!-- activeTab === tab：仅挂载当前激活分舵，避免隐藏 Tab 内 ECharts 在 0×0 容器初始化 -->
                <CScrollbar>
                  <div class="col-stretch gap-md p-md min-w-0">
                    <!-- 基础 -->
                    <template v-if="tab === 'basic' && activeTab === tab">
                      <ChartDemoCard
                        title="基础用法"
                        description="单图折线，width/height 默认，主题由 useChartTheme 自动合并。无 series.areaStyle 的折线不受右侧 lineArea 透明度滑块影响。"
                        chart-height="26vh"
                      >
                        <UseEcharts
                          :option="lineOptionComputed"
                          :theme-config="themeConfig"
                          :renderer="renderer"
                          :loading="chartLoading"
                        />
                      </ChartDemoCard>
                      <ChartDemoCard
                        title="多类型与尺寸"
                        description="折线、柱状、饼图。无面积折线请用 lineArea 滑块（见下方卡片）；中间柱图用「柱状图透明度」；饼图不适用柱图透明度滑块。"
                        chart-height="28vh"
                      >
                        <div class="layout-full grid grid-cols-1 md:grid-cols-3 gap-md">
                          <div class="layout-full">
                            <UseEcharts
                              :option="lineOptionComputed"
                              :theme-config="themeConfig"
                              :renderer="renderer"
                              :loading="chartLoading"
                            />
                          </div>
                          <div class="layout-full">
                            <UseEcharts
                              :option="barOptionComputed"
                              :theme-config="themeConfig"
                              :renderer="renderer"
                              :loading="chartLoading"
                            />
                          </div>
                          <div class="layout-full">
                            <UseEcharts
                              :option="pieOptionComputed"
                              :theme-config="themeConfig"
                              :renderer="renderer"
                              :loading="chartLoading"
                            />
                          </div>
                        </div>
                      </ChartDemoCard>
                      <ChartDemoCard
                        title="lineArea 透明度（带面积填充的折线）"
                        description="右侧「lineArea 透明度」滑块控制本图面积填充透明度。"
                        chart-height="40vh"
                      >
                        <UseEcharts
                          :option="basicLineWithAreaOption"
                          :theme-config="themeConfig"
                          :renderer="renderer"
                          :loading="chartLoading"
                        />
                      </ChartDemoCard>
                    </template>

                    <!-- 动态 -->
                    <template v-if="tab === 'dynamic' && activeTab === tab">
                      <ChartDemoCard
                        title="动态数据"
                        description="点击刷新随机数据；Loading 由全局控制或本 Tab 控制。柱状图受右侧「柱状图透明度」滑块调节（opacity.bar）。"
                        chart-height="30vh"
                      >
                        <UseEcharts
                          :option="dynamicOption"
                          :theme-config="themeConfig"
                          :loading="dynamicLoading || chartLoading"
                          :renderer="renderer"
                        />
                        <template #actions>
                          <Button
                            label="刷新数据"
                            size="small"
                            @click="refreshData"
                          />
                        </template>
                      </ChartDemoCard>
                      <ChartDemoCard
                        title="轮询更新（每 5 秒）"
                        description="模拟后台轮询：每 5 秒平滑追加一条数据，不打断主题与尺寸系统。折线带面积填充，可配合右侧 lineArea 透明度观察效果。"
                        chart-height="30vh"
                      >
                        <UseEcharts
                          :option="pollingOption"
                          :theme-config="themeConfig"
                          :renderer="renderer"
                          :loading="chartLoading"
                        />
                        <template #actions>
                          <Button
                            :label="pollingRunning ? '停止轮询' : '开始轮询'"
                            size="small"
                            @click="pollingRunning ? stopPolling() : startPolling()"
                          />
                        </template>
                      </ChartDemoCard>
                      <ChartDemoCard
                        title="自动切换悬停高亮（每 5 秒）"
                        description="柱状图自动循环高亮每个数据项，展示程序化控制图表交互的能力。柱条透明度由右侧「柱状图透明度」控制。"
                        chart-height="30vh"
                      >
                        <UseEcharts
                          ref="autoHighlightChartRef"
                          :option="autoHighlightOption"
                          :theme-config="themeConfig"
                          :renderer="renderer"
                          :loading="chartLoading"
                        />
                        <template #actions>
                          <Button
                            :label="autoHighlightRunning ? '停止高亮' : '开始高亮'"
                            size="small"
                            @click="handleToggleAutoHighlight"
                          />
                        </template>
                      </ChartDemoCard>
                    </template>

                    <!-- 高级 -->
                    <template v-if="tab === 'advanced' && activeTab === tab">
                      <ChartDemoCard
                        title="工具箱与标记点/线"
                        description="toolboxConfig、markPointConfig、markLineConfig。柱状图可配合右侧「柱状图透明度」滑块。"
                        chart-height="32vh"
                      >
                        <UseEcharts
                          :option="advancedBarWithMarkOption"
                          :theme-config="themeConfig"
                          :renderer="renderer"
                          :loading="chartLoading"
                          :toolbox-config="toolboxConfig"
                          :mark-point-config="markPointConfig"
                          :mark-line-config="markLineConfig"
                        />
                      </ChartDemoCard>
                      <ChartDemoCard
                        title="热力图（VisualMap）"
                        description="visualMapConfig。"
                        chart-height="28vh"
                      >
                        <UseEcharts
                          :option="advancedHeatmapOption"
                          :theme-config="themeConfig"
                          :renderer="renderer"
                          :loading="chartLoading"
                          :visual-map-config="visualMapConfig"
                        />
                      </ChartDemoCard>
                      <ChartDemoCard
                        title="多系列折线（Brush）"
                        description="toolboxConfig、brushConfig。"
                        chart-height="34vh"
                      >
                        <UseEcharts
                          :option="advancedMultiSeriesLineOption"
                          :theme-config="themeConfig"
                          :renderer="renderer"
                          :loading="chartLoading"
                          :toolbox-config="toolboxConfig"
                          :brush-config="brushConfig"
                        />
                      </ChartDemoCard>
                    </template>

                    <!-- 多图联动 -->
                    <template v-if="tab === 'connect' && activeTab === tab">
                      <ChartDemoCard
                        title="多图表联动"
                        description="同一组数据：左折线、中柱状、右面积折线；鼠标悬停同步，按钮可程序化高亮与查看状态。"
                        chart-height="26vh"
                      >
                        <template #actions>
                          <Button
                            label="同步高亮第 3 点"
                            size="small"
                            @click="handleTriggerConnect"
                          />
                          <Button
                            label="getConnectState"
                            size="small"
                            severity="secondary"
                            @click="handleGetConnectState"
                          />
                        </template>
                        <div
                          class="layout-full grid grid-cols-1 md:grid-cols-3 gap-md"
                          data-testid="connect-cartesian-group"
                        >
                          <div
                            class="layout-full"
                            data-testid="connect-cartesian-chart-0"
                          >
                            <UseEcharts
                              ref="chartRef"
                              :option="connectLineOption"
                              :theme-config="themeConfig"
                              :renderer="renderer"
                              :loading="chartLoading"
                              :group="CONNECT_CARTESIAN_GROUP_ID"
                              @chart-ready="onConnectChartReady"
                            />
                          </div>
                          <div
                            class="layout-full"
                            data-testid="connect-cartesian-chart-1"
                          >
                            <UseEcharts
                              ref="chartRef2"
                              :option="connectBarOption"
                              :theme-config="themeConfig"
                              :renderer="renderer"
                              :loading="chartLoading"
                              :group="CONNECT_CARTESIAN_GROUP_ID"
                              @chart-ready="onConnectChartReady"
                            />
                          </div>
                          <div
                            class="layout-full"
                            data-testid="connect-cartesian-chart-2"
                          >
                            <UseEcharts
                              ref="chartRef3"
                              :option="connectAreaOption"
                              :theme-config="themeConfig"
                              :renderer="renderer"
                              :loading="chartLoading"
                              :group="CONNECT_CARTESIAN_GROUP_ID"
                              @chart-ready="onConnectChartReady"
                            />
                          </div>
                        </div>
                      </ChartDemoCard>

                      <ChartDemoCard
                        title="多图表联动（折线 + 柱状 + 饼图）"
                        description="同一组数据：折线、柱状、饼图三个视角；悬停与高亮相互联动。"
                        chart-height="28vh"
                      >
                        <template #actions>
                          <Button
                            label="同步高亮第 3 点（线/柱/饼）"
                            size="small"
                            @click="handleTriggerConnectPieGroup"
                          />
                        </template>
                        <div
                          class="layout-full grid grid-cols-1 md:grid-cols-3 gap-md"
                          data-testid="connect-mixed-group"
                        >
                          <div
                            class="layout-full"
                            data-testid="connect-mixed-chart-line"
                            @mouseenter.capture="handleMixedPointerActivity"
                            @mousemove.capture="handleMixedPointerActivity"
                            @mouseleave.capture="markMixedPointerLeave"
                          >
                            <UseEcharts
                              ref="pieLineRef"
                              :option="connectLineOption"
                              :theme-config="themeConfig"
                              :renderer="renderer"
                              :loading="chartLoading"
                              :group="CONNECT_MIXED_GROUP_ID"
                              @chart-ready="onPieChartReady"
                              @finished="onPieChartReady"
                            />
                          </div>
                          <div
                            class="layout-full"
                            data-testid="connect-mixed-chart-bar"
                            @mouseenter.capture="handleMixedPointerActivity"
                            @mousemove.capture="handleMixedPointerActivity"
                            @mouseleave.capture="markMixedPointerLeave"
                          >
                            <UseEcharts
                              ref="pieBarRef"
                              :option="connectBarOption"
                              :theme-config="themeConfig"
                              :renderer="renderer"
                              :loading="chartLoading"
                              :group="CONNECT_MIXED_GROUP_ID"
                              @chart-ready="onPieChartReady"
                              @finished="onPieChartReady"
                            />
                          </div>
                          <div
                            class="layout-full"
                            data-testid="connect-mixed-chart-pie"
                            @mouseenter.capture="handleMixedPointerActivity"
                            @mousemove.capture="handleMixedPointerActivity"
                            @mouseleave.capture="markMixedPointerLeave"
                          >
                            <UseEcharts
                              ref="pieRef"
                              :option="connectPieOption"
                              :theme-config="themeConfig"
                              :renderer="renderer"
                              :loading="chartLoading"
                              :group="CONNECT_MIXED_GROUP_ID"
                              @chart-ready="onPieChartReady"
                              @finished="onPieChartReady"
                            />
                          </div>
                        </div>
                      </ChartDemoCard>
                    </template>

                    <!-- 自定义配色：option.color 覆盖调色盘；右侧全局控制仍作用于主题合并（lineArea、渲染器、Loading 等） -->
                    <template v-if="tab === 'customTheme' && activeTab === tab">
                      <ChartDemoCard
                        title="自定义配色"
                        description="通过 option.color 传入自定义调色盘（红、橙、黄、绿）。该配置会优先覆盖默认主题色，但依然能响应右侧全局控制面板的透明度 (lineArea) 调节。"
                        chart-height="36vh"
                      >
                        <UseEcharts
                          :option="customThemeOption"
                          :theme-config="themeConfig"
                          :renderer="renderer"
                          :loading="chartLoading"
                        />
                      </ChartDemoCard>
                    </template>

                    <!-- 事件与 Ref -->
                    <template v-if="tab === 'eventsRef' && activeTab === tab">
                      <ChartDemoCard
                        title="事件"
                        description="chartReady、finished、onClick、onLegendSelectChanged、onDataZoom。"
                        chart-height="40vh"
                      >
                        <div class="row-start flex-wrap gap-xs text-muted-foreground text-sm mb-xs">
                          <span>chartReady: {{ chartReadyFired ? '已触发' : '未触发' }}</span>
                          <span>finished: {{ finishedFired ? '已触发' : '未触发' }}</span>
                        </div>
                        <UseEcharts
                          :option="eventsRefOption"
                          :theme-config="themeConfig"
                          :renderer="renderer"
                          :loading="chartLoading"
                          :on-click="onChartClick"
                          :on-legend-select-changed="onLegendSelectChanged"
                          :on-data-zoom="onDataZoom"
                          @chart-ready="onChartReady"
                          @finished="onFinished"
                        />
                      </ChartDemoCard>
                      <ChartDemoCard
                        title="Ref 方法"
                        description="通过下方按钮调用组件暴露的方法。"
                        chart-height="40vh"
                      >
                        <div class="layout-full col-stretch gap-md">
                          <div class="row-start flex-wrap gap-sm">
                            <Button
                              label="getChartInstance"
                              size="small"
                              @click="handleGetChartInstance"
                            />
                            <Button
                              label="getEchartsInstance"
                              size="small"
                              @click="handleGetEchartsInstance"
                            />
                            <Button
                              label="setOption(新数据)"
                              size="small"
                              severity="secondary"
                              @click="handleSetOption"
                            />
                            <Button
                              label="resize"
                              size="small"
                              severity="secondary"
                              @click="handleResize"
                            />
                            <Button
                              label="clear"
                              size="small"
                              severity="danger"
                              @click="handleClear"
                            />
                          </div>
                          <UseEcharts
                            ref="chartRefMethods"
                            :option="eventsRefOption"
                            :theme-config="themeConfig"
                            :renderer="renderer"
                            :loading="chartLoading"
                            :manual-update="true"
                          />
                        </div>
                      </ChartDemoCard>
                    </template>
                  </div>
                </CScrollbar>

                <!-- 右侧：全局控制（basic/dynamic/customTheme/connect/advanced/eventsRef） -->
                <div
                  v-if="
                    activeTab === tab &&
                    (tab === 'basic' ||
                      tab === 'customTheme' ||
                      tab === 'dynamic' ||
                      tab === 'connect' ||
                      tab === 'advanced' ||
                      tab === 'eventsRef')
                  "
                  class="w-72 shrink-0 min-h-0 col-stretch hidden xl:flex min-w-0"
                >
                  <!-- 局部滚动：右侧全局控制区需独立滚动，避免与左侧主内容滚动耦合 -->
                  <CScrollbar class="col-fill layout-full">
                    <div class="material-elevated col-stretch">
                      <GlobalControls
                        :theme-enabled="themeEnabled"
                        :line-area-opacity="lineAreaOpacity"
                        :bar-opacity="barOpacity"
                        :renderer="renderer"
                        :chart-loading="chartLoading"
                        @update:theme-enabled="themeEnabled = $event"
                        @update:line-area-opacity="lineAreaOpacity = $event"
                        @update:bar-opacity="barOpacity = $event"
                        @update:renderer="renderer = $event"
                        @update:chart-loading="chartLoading = $event"
                      />
                    </div>
                  </CScrollbar>
                </div>

                <!-- 右侧：联动操作日志（仅 connect 显示） -->
                <div
                  v-if="tab === 'connect' && activeTab === tab"
                  class="w-72 shrink-0 min-h-0 col-stretch hidden xl:flex min-w-0"
                >
                  <!-- 局部滚动：联动日志为独立面板，保留独立滚动便于长日志查看 -->
                  <CScrollbar class="col-fill layout-full">
                    <div class="material-elevated col-stretch">
                      <div class="col-stretch gap-md">
                        <div class="text-foreground text-md font-semibold">联动操作日志</div>
                        <div class="code-block">
                          <div
                            v-for="(line, i) in connectLog"
                            :key="i"
                            class="text-foreground mb-xs last:mb-0"
                          >
                            {{ line }}
                          </div>
                          <div
                            v-if="connectLog.length === 0"
                            class="text-muted-foreground"
                          >
                            暂无操作
                          </div>
                        </div>
                      </div>
                    </div>
                  </CScrollbar>
                </div>

                <!-- 右侧：事件与 Ref 日志（仅 eventsRef 显示） -->
                <div
                  v-if="tab === 'eventsRef' && activeTab === tab"
                  class="w-72 shrink-0 min-h-0 col-stretch hidden xl:flex min-w-0"
                >
                  <!-- 局部滚动：事件与 Ref 日志独立滚动，确保操作区持续可见 -->
                  <CScrollbar class="col-fill layout-full">
                    <div class="material-elevated col-stretch">
                      <div class="col-stretch gap-md">
                        <div class="text-foreground text-md font-semibold">事件日志</div>
                        <div class="code-block">
                          <div
                            v-for="(line, i) in eventLog"
                            :key="i"
                            class="text-foreground mb-xs last:mb-0"
                          >
                            {{ line }}
                          </div>
                          <div
                            v-if="eventLog.length === 0"
                            class="text-muted-foreground"
                          >
                            暂无
                          </div>
                        </div>
                        <div class="text-foreground text-md font-semibold mt-md">Ref 操作日志</div>
                        <div class="code-block">
                          <div
                            v-for="(line, i) in refMethodsLog"
                            :key="i"
                            class="text-foreground mb-xs last:mb-0"
                          >
                            {{ line }}
                          </div>
                          <div
                            v-if="refMethodsLog.length === 0"
                            class="text-muted-foreground"
                          >
                            暂无
                          </div>
                        </div>
                      </div>
                    </div>
                  </CScrollbar>
                </div>
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  </div>
</template>
