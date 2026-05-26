<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  onActivated,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  toRaw,
  useTemplateRef,
  watch,
} from 'vue'
import { getChartSystemVariables } from '../chartUtils'
import { withAlpha } from '../useChartTheme/utils'
import { useChartTheme } from '../useChartTheme/index'
import { useI18n } from 'vue-i18n'
import { useIntersectionObserver } from '@vueuse/core'
import type { EChartsType, SetOptionOpts } from 'echarts'
import { createDefaultUseEchartsProps } from './utils/constants'
import { createEChartsRenderCore } from './echarts-render-core'
import { useChartElementSize } from './useChartElementSize'
import {
  getConnectGroupMemberCount,
  registerConnectGroup,
  unregisterConnectGroup,
} from './connectGroupRegistry'
import {
  ensureEChartsModulesForOption,
  getEChartsSeriesTypes,
  getMissingEChartsLazySeriesTypes,
} from './echarts-registry'
import type { EChartsOption } from 'echarts'
import type { ChartAdvancedConfig, ChartThemeRuntimeState } from '../useChartTheme/types'
import type {
  ChartConnectState,
  ChartEventParams,
  ChartSetOptionOptions,
  UseEchartsProps,
} from './utils/types'

const VEChartsAsync = defineAsyncComponent(async () => {
  await import('./echarts-setup')
  const module = await import('vue-echarts')
  return module.default
})

const props = withDefaults(defineProps<UseEchartsProps & { group?: string }>(), {
  ...createDefaultUseEchartsProps(),
  group: undefined,
})

const emit = defineEmits<{
  finished: []
  chartReady: [instance: unknown, id?: string]
}>()

type VEChartsExpose = {
  chart?: EChartsType | null
  getEchartsInstance?: () => EChartsType | null
}

const chartContainerRef = useTemplateRef<HTMLElement>('chartContainerRef')
const chartRef = shallowRef<VEChartsExpose | null>(null)
const chartReadyTimer = ref<ReturnType<typeof globalThis.setTimeout> | null>(null)
const isUnmounting = ref(false)
let stopVisibilityObserver: (() => void) | null = null
const connectToken = Symbol('use-echarts-connect-token')
let registeredConnectGroupId: string | null = null

// 联动相关状态：传 group 或 connectConfig.enabled 即视为开启
const connectState = shallowRef<ChartConnectState>({
  enabled: false,
  connected: false,
})
const isConnectEnabled = computed(() => props.connectConfig?.enabled === true || !!props.group)
const connectGroupId = computed(() => {
  const groupId = props.group || props.connectConfig?.groupId || 'default'
  return groupId
})

function syncConnectState(partial?: Partial<ChartConnectState>) {
  connectState.value = {
    ...connectState.value,
    enabled: isConnectEnabled.value,
    groupId: isConnectEnabled.value ? connectGroupId.value : undefined,
    connected: !!registeredConnectGroupId,
    registered: !!registeredConnectGroupId,
    ...partial,
  }
}

function unregisterCurrentConnectGroup() {
  if (!registeredConnectGroupId) {
    syncConnectState()
    return
  }
  unregisterConnectGroup(registeredConnectGroupId, connectToken)
  registeredConnectGroupId = null
  syncConnectState()
}

function registerCurrentConnectGroup() {
  const instance = getEchartsInstance()
  if (!instance || instance.isDisposed()) {
    unregisterCurrentConnectGroup()
    return
  }

  if (!isConnectEnabled.value) {
    unregisterCurrentConnectGroup()
    return
  }

  const groupId = connectGroupId.value
  if (!groupId) {
    unregisterCurrentConnectGroup()
    return
  }

  if (registeredConnectGroupId === groupId) {
    syncConnectState()
    return
  }

  unregisterCurrentConnectGroup()
  registerConnectGroup(groupId, connectToken)
  registeredConnectGroupId = groupId
  syncConnectState({
    groupMembers: getConnectGroupMemberCount(groupId),
  })
}

// 监听容器尺寸变化，自动 resize 图表（根据 autoResize prop）
const { width, height } = useChartElementSize(chartContainerRef, () => scheduleChartResize())

// 容器尺寸就绪（避免 0×0 初始化导致“首次不出图/无报错”）
const isContainerReady = computed<boolean>(() => width.value > 0 && height.value > 0)

function scheduleChartResize(): void {
  renderCore.schedule('resize')
}

// 一旦初始化成功后，后续 resize 即使容器短暂 0×0，也不卸载图表（避免“闪屏/图表消失”）
const hasChartMounted = ref(false)
watch(
  () => isContainerReady.value,
  ready => {
    if (ready) hasChartMounted.value = true
  },
  { immediate: true }
)

// 使用主题合并后的配置
const optionRef = computed(() => props.option)
const chartModulesReady = ref(false)
const optionModuleSignature = computed(() =>
  [...getEChartsSeriesTypes(optionRef.value)].sort().join('|')
)
let chartModuleRequestId = 0

watch(
  () => optionModuleSignature.value,
  async () => {
    const requestId = ++chartModuleRequestId
    const hasMissingLazyModules = getMissingEChartsLazySeriesTypes(optionRef.value).length > 0

    if (!chartModulesReady.value || hasMissingLazyModules) {
      chartModulesReady.value = false
    }

    await ensureEChartsModulesForOption(optionRef.value)
    if (requestId === chartModuleRequestId) {
      chartModulesReady.value = true
    }
  },
  { immediate: true }
)
const opacityConfigRef = computed(() => props.themeConfig?.opacity)
const advancedConfigRef = computed<ChartAdvancedConfig>(() => ({
  animationConfig: props.animationConfig,
  toolboxConfig: props.toolboxConfig,
  markPointConfig: props.markPointConfig,
  markLineConfig: props.markLineConfig,
  visualMapConfig: props.visualMapConfig,
  brushConfig: props.brushConfig,
  axisPointerConfig: props.axisPointerConfig,
  legendHoverLink: props.legendHoverLink,
  backgroundColor: props.backgroundColor,
}))

// ECharts 渲染器仅在 init 时生效，通过 init-options + key 实现切换
const initOptions = computed(() => ({ renderer: props.renderer }))

const { t, locale } = useI18n()

const themeRuntimeState = computed<ChartThemeRuntimeState>(() => ({
  themeName: props.themeRuntime?.themeName,
  mode: props.themeRuntime?.mode,
  isDark: props.themeRuntime?.isDark,
  sizeName: props.themeRuntime?.sizeName,
  localeKey: props.themeRuntime?.localeKey ?? String(locale.value),
  translate: props.themeRuntime?.translate ?? t,
}))

// Loading 使用主题色：图标 / 文字 / 遮罩颜色与架构配色系统融合
const buildMaskColor = (background: string | undefined): string | undefined => {
  // 基于背景色生成半透明遮罩；若解析失败则回退原色
  const alphaColor = withAlpha(background, 0.78)
  return alphaColor ?? background
}

const effectiveLoadingOptions = computed((): Record<string, unknown> => {
  const runtime = themeRuntimeState.value

  const raw = props.loadingOptions
  const base: Record<string, unknown> =
    typeof raw === 'function' ? (raw as () => Record<string, unknown>)() : (raw ?? {})
  const textStyle = base.textStyle as Record<string, unknown> | undefined
  const explicitTextColor =
    typeof base.textColor === 'string' && base.textColor.trim().length > 0
      ? base.textColor
      : undefined
  try {
    const vars = getChartSystemVariables(runtime.sizeName)

    // 1) 图标颜色：优先使用用户配置，其次主题 primary/accent/foreground
    const iconColor =
      (base.color as string | undefined) ?? (vars.primary || vars.accent || vars.foreground)

    // 2) 遮罩背景：优先使用用户配置，其次基于 background/card 生成半透明蒙层
    const maskColor =
      (base.maskColor as string | undefined) ?? buildMaskColor(vars.background || vars.card)

    // 3) 文字颜色：优先 textColor；否则使用 mutedForeground / foreground，保证深浅主题可读性
    const defaultTextColor = vars.mutedForeground || vars.foreground || vars.primaryForeground
    const finalTextColor = explicitTextColor ?? defaultTextColor
    const finalTextStyle =
      textStyle && typeof textStyle === 'object' && textStyle.color
        ? textStyle
        : {
            ...(textStyle && typeof textStyle === 'object' ? textStyle : {}),
            ...(finalTextColor ? { color: finalTextColor } : {}),
          }

    return {
      ...base,
      ...(iconColor ? { color: iconColor } : {}),
      ...(maskColor ? { maskColor } : {}),
      ...(finalTextColor ? { textColor: finalTextColor } : {}),
      ...(finalTextStyle ? { textStyle: finalTextStyle } : {}),
    }
  } catch {
    // 非浏览器或 store 未就绪时忽略
  }
  return base
})

// 使用响应式 Hook
const { themedOption } = useChartTheme(
  optionRef,
  opacityConfigRef,
  advancedConfigRef,
  themeRuntimeState
)

// 如果未启用主题，直接返回原始配置
const mergedOption = computed((): EChartsOption => {
  if (!props.option || Object.keys(props.option).length === 0) {
    return {} as EChartsOption
  }

  if (props.themeConfig?.enableTheme === false) {
    return props.option as EChartsOption
  }

  return themedOption.value as EChartsOption
})

// 监听配置变化,手动更新图表
// Note: { deep: true } removed — themedOption always returns a new object reference (deepCloneWithFunctions),
// so shallow reference comparison is sufficient and avoids redundant deep traversal of the entire EChartsOption tree.
watch(
  () => mergedOption.value,
  newOption => {
    if (isUnmounting.value) return
    if (props.manualUpdate && chartRef.value) {
      renderCore.setOption(newOption, true)
      renderCore.schedule('option')
    }
  }
)

/**
 * 将驼峰命名的事件处理器 prop 名转换为 ECharts 事件名
 * 例如: onClick -> click, onDblClick -> dblclick, onLegendSelectChanged -> legendselectchanged
 */
const convertPropNameToEventName = (propName: string): string => {
  // 移除 'on' 前缀
  const nameWithoutOn = propName.substring(2)
  // ECharts 事件名都是小写，直接转换为小写即可
  return nameWithoutOn.toLowerCase()
}

/**
 * 创建事件处理器包装函数（ECharts 各 on* 的 payload 均为 ChartEventParams 子类型，此处统一按 ChartEventParams 调用）
 */
const createEventHandler = (originalHandler: ((params: ChartEventParams) => void) | undefined) => {
  return (params: ChartEventParams) => {
    if (originalHandler && typeof originalHandler === 'function') {
      originalHandler(params)
    }
  }
}

/**
 * 事件处理器映射 - 使用循环自动识别所有 on... 开头的 props
 */
const eventHandlers = computed(() => {
  const handlers: Record<string, (params: ChartEventParams) => void> = {}

  // 遍历所有 props，自动识别 on... 开头的 prop
  for (const key in props) {
    // 跳过非事件处理器 prop
    if (!key.startsWith('on') || key === 'onEvents') {
      continue
    }

    const handler = props[key as keyof typeof props]
    if (typeof handler === 'function') {
      const eventName = convertPropNameToEventName(key)
      handlers[eventName] = createEventHandler(handler as (params: ChartEventParams) => void)
    }
  }

  // 特殊处理 onFinished: 即使没有传入，也要触发 emit
  if (props.onFinished) {
    handlers.finished = () => {
      props.onFinished?.()
      emit('finished')
    }
  } else {
    handlers.finished = () => {
      emit('finished')
    }
  }

  // 处理 onRendered: 直接使用，不需要包装
  if (props.onRendered) {
    handlers.rendered = props.onRendered
  }

  // 处理 onEvents prop: 合并自定义事件映射
  if (props.onEvents) {
    const onEvents =
      typeof props.onEvents === 'function'
        ? (props.onEvents as () => Record<string, (params: ChartEventParams) => void>)()
        : props.onEvents
    if (onEvents && typeof onEvents === 'object') {
      Object.entries(onEvents).forEach(([eventName, handler]) => {
        if (typeof handler === 'function') {
          handlers[eventName] = createEventHandler(handler)
        }
      })
    }
  }

  return handlers
})

/**
 * 获取 ECharts 实例
 * 使用 vue-echarts 官方推荐的方式获取实例。
 * toRaw() 作为防御层：确保返回的始终是原始 ECharts 实例，
 * 而非 Vue 响应式 Proxy，防止 dispatchAction / on / off 静默失败。
 */
const getEchartsInstance = () => {
  if (!chartRef.value) {
    return null
  }

  // 优先使用 chart 属性（vue-echarts 8.x 推荐方式）
  if (chartRef.value.chart) {
    return toRaw(chartRef.value.chart)
  }

  // 回退到 getEchartsInstance 方法（兼容旧版本）
  if (typeof chartRef.value.getEchartsInstance === 'function') {
    return toRaw(chartRef.value.getEchartsInstance())
  }

  return null
}

const renderCore = createEChartsRenderCore({
  getElement: () => chartContainerRef.value?.querySelector('.echarts') ?? chartContainerRef.value,
  getInstance: () => {
    const instance = getEchartsInstance()
    if (!instance) return null
    return {
      resize: opts => instance.resize(opts),
      setOption: (option, opts) => {
        if (typeof opts === 'boolean' || opts === undefined) {
          instance.setOption(option, opts)
        } else {
          instance.setOption(option, opts)
        }
      },
      isDisposed: () => instance.isDisposed(),
    }
  },
  canRender: () => !isUnmounting.value && isContainerReady.value,
  autoResize: () => props.autoResize !== false,
})

// 图表初始化标志
const isChartInitialized = ref(false)

function clearChartReadyTimer(): void {
  if (chartReadyTimer.value !== null) {
    globalThis.clearTimeout(chartReadyTimer.value)
    chartReadyTimer.value = null
  }
}

function scheduleChartReadyEmit(): void {
  if (!hasChartMounted.value || isUnmounting.value || isChartInitialized.value) {
    return
  }

  clearChartReadyTimer()
  chartReadyTimer.value = globalThis.setTimeout(() => {
    chartReadyTimer.value = null
    const chartInstance = getEchartsInstance()
    if (chartInstance && !chartInstance.isDisposed()) {
      isChartInitialized.value = true
      registerCurrentConnectGroup()
      emit('chartReady', chartInstance, props.group || props.connectConfig?.groupId)
    }
  }, 0)
}

watch(
  () => [hasChartMounted.value, chartRef.value, props.renderer] as const,
  ([mounted, chartInstance], [, previousChartInstance, previousRenderer]) => {
    if (!mounted || !chartInstance) return
    if (chartInstance !== previousChartInstance || props.renderer !== previousRenderer) {
      isChartInitialized.value = false
      unregisterCurrentConnectGroup()
    }
    scheduleChartReadyEmit()
    scheduleChartResize()
  },
  { flush: 'post' }
)

watch(
  () => [isConnectEnabled.value, connectGroupId.value] as const,
  () => {
    if (!hasChartMounted.value || isUnmounting.value) {
      syncConnectState()
      return
    }
    registerCurrentConnectGroup()
  },
  { immediate: true }
)

watch(
  chartContainerRef,
  el => {
    stopVisibilityObserver?.()
    stopVisibilityObserver = null

    if (!el) return

    const { stop } = useIntersectionObserver(el, entries => {
      const entry = entries[0]
      if (entry?.isIntersecting) scheduleChartResize()
    })
    stopVisibilityObserver = stop
  },
  { immediate: true, flush: 'post' }
)

onMounted(() => {
  scheduleChartResize()
})

onActivated(() => {
  renderCore.schedule('visible')
  registerCurrentConnectGroup()
})

// 组件卸载时清理
onBeforeUnmount(() => {
  isUnmounting.value = true
  unregisterCurrentConnectGroup()
  renderCore.dispose()
  clearChartReadyTimer()
  stopVisibilityObserver?.()
  stopVisibilityObserver = null
  // 不再手动 dispose — vue-echarts 子组件会在自身 onBeforeUnmount 中调用 dispose()
  // 父组件重复调用会触发 "[ECharts] Instance has been disposed" 警告
  isChartInitialized.value = false
})

// 暴露图表实例方法
const getChartInstance = () => chartRef.value

// 联动相关方法
const getConnectState = () => connectState.value
const setConnectState = (state: Partial<ChartConnectState>) => {
  syncConnectState(state)
}
const normalizeSetOptionOptions = (
  opts?: boolean | ChartSetOptionOptions
): boolean | SetOptionOpts | undefined => {
  if (typeof opts === 'boolean' || opts === undefined) {
    return opts
  }

  return {
    notMerge: opts.notMerge ?? false,
    lazyUpdate: opts.lazyUpdate ?? true,
    ...(opts.replaceMerge !== undefined ? { replaceMerge: opts.replaceMerge } : {}),
    ...(opts.silent !== undefined ? { silent: opts.silent } : {}),
  }
}
const triggerConnect = (eventType: string, params: Record<string, unknown>) => {
  if (isConnectEnabled.value) {
    const chartInstance = getEchartsInstance()
    if (chartInstance && !chartInstance.isDisposed()) {
      chartInstance.dispatchAction({
        type: eventType,
        ...params,
      })
    }
  }
}

defineExpose({
  getChartInstance,
  getEchartsInstance,
  setOption: (option: EChartsOption, opts?: boolean | ChartSetOptionOptions) => {
    renderCore.setOption(option, normalizeSetOptionOptions(opts))
  },
  resize: () => {
    renderCore.schedule('resize')
  },
  clear: () => {
    const instance = getEchartsInstance()
    if (instance && !instance.isDisposed()) {
      instance.clear()
    }
  },
  dispose: () => {
    const instance = getEchartsInstance()
    if (instance && !instance.isDisposed()) {
      instance.dispose()
    }
  },
  getConnectState,
  setConnectState,
  triggerConnect,
})
</script>

<template>
  <div
    ref="chartContainerRef"
    class="layout-full relative overflow-visible min-h-1"
  >
    <VEChartsAsync
      v-if="hasChartMounted && chartModulesReady"
      :key="props.renderer"
      ref="chartRef"
      :option="mergedOption"
      :init-options="initOptions"
      :autoresize="autoResize"
      :style="{
        width: '100%',
        height: '100%',
        ...(typeof props.style === 'function' ? props.style() : props.style),
      }"
      :theme="theme"
      :loading="loading"
      :loading-options="effectiveLoadingOptions"
      :manual-update="manualUpdate"
      :group="connectGroupId"
      v-on="eventHandlers"
    />
  </div>
</template>
