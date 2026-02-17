<script setup lang="ts">
import { getChartSystemVariables } from '@/utils/theme/chartUtils'
import { withAlpha } from '@/hooks/modules/useChartTheme/utils'
import { useChartTheme } from '@/hooks/modules/useChartTheme/index'
import { useAppElementSize } from '@/hooks/modules/useAppElementSize'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/modules/theme'
import { useSizeStore } from '@/stores/modules/size'
import VECharts from 'vue-echarts'
import { createDefaultUseEchartsProps } from './utils/constants'
import type { EChartsOption } from 'echarts'
import type { ChartAdvancedConfig } from '@/hooks/modules/useChartTheme/types'
import type { ChartConnectState, ChartEventParams, UseEchartsProps } from './utils/types'

const props = withDefaults(defineProps<UseEchartsProps & { group?: string }>(), {
  ...createDefaultUseEchartsProps(),
  group: undefined,
})

const emit = defineEmits<{
  finished: []
  chartReady: [instance: unknown, id?: string]
}>()

const chartContainerRef = ref<HTMLElement | HTMLDivElement | null>(null)
const chartRef = ref()

// 联动相关状态：传 group 或 connectConfig.enabled 即视为开启
const connectState = ref<ChartConnectState>({})
const isConnectEnabled = computed(() => props.connectConfig?.enabled === true || !!props.group)
const connectGroupId = computed(() => {
  const groupId = props.group || props.connectConfig?.groupId || 'default'
  return groupId
})

// 监听容器尺寸变化，自动 resize 图表（根据 autoResize prop）
useAppElementSize(
  chartContainerRef,
  () => {
    // 仅在 autoResize 不为 false 时执行 resize
    if (props.autoResize !== false && chartRef.value) {
      chartRef.value.resize()
    }
  },
  { mode: 'throttle', delay: 300 }
)

// 使用主题合并后的配置
const optionRef = computed(() => props.option)
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

// 显式依赖主题/尺寸 Store，使切换主题/模式/尺寸时 loadingOptions 自动重新计算
const themeStore = useThemeStore()
const sizeStore = useSizeStore()
const { themeName, mode } = storeToRefs(themeStore)
const { sizeName } = storeToRefs(sizeStore)

// Loading 使用主题色：图标 / 文字 / 遮罩颜色与架构配色系统融合
const buildMaskColor = (background: string | undefined): string | undefined => {
  // 基于背景色生成半透明遮罩；若解析失败则回退原色
  const alphaColor = withAlpha(background, 0.78)
  return alphaColor ?? background
}

const effectiveLoadingOptions = computed((): Record<string, unknown> => {
  // 显式读取依赖：主题预设、深浅模式、尺寸模式变化时触发重算
  void themeName.value
  void mode.value
  void sizeName.value

  const raw = props.loadingOptions
  const base: Record<string, unknown> =
    typeof raw === 'function' ? (raw as () => Record<string, unknown>)() : (raw ?? {})
  const textStyle = base.textStyle as Record<string, unknown> | undefined
  try {
    const vars = getChartSystemVariables()

    // 1) 图标颜色：优先使用用户配置，其次主题 primary/accent/foreground
    const iconColor =
      (base.color as string | undefined) ?? (vars.primary || vars.accent || vars.foreground)

    // 2) 遮罩背景：优先使用用户配置，其次基于 background/card 生成半透明蒙层
    const maskColor =
      (base.maskColor as string | undefined) ?? buildMaskColor(vars.background || vars.card)

    // 3) 文字颜色：若用户已显式设置则尊重，否则使用 primaryForeground → foreground
    const finalTextStyle =
      textStyle && typeof textStyle === 'object' && textStyle.color
        ? textStyle
        : {
            ...(textStyle && typeof textStyle === 'object' ? textStyle : {}),
            color: vars.primaryForeground || vars.primary || vars.foreground,
          }

    return {
      ...base,
      ...(iconColor ? { color: iconColor } : {}),
      ...(maskColor ? { maskColor } : {}),
      ...(finalTextStyle ? { textStyle: finalTextStyle } : {}),
    }
  } catch {
    // 非浏览器或 store 未就绪时忽略
  }
  return base
})

// 使用响应式 Hook
const { themedOption } = useChartTheme(optionRef, opacityConfigRef, advancedConfigRef)

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
watch(
  () => mergedOption.value,
  newOption => {
    if (props.manualUpdate && chartRef.value) {
      chartRef.value.setOption(newOption, true)
    }
  },
  { deep: true }
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
 * 使用 vue-echarts 官方推荐的方式获取实例
 */
const getEchartsInstance = () => {
  if (!chartRef.value) {
    return null
  }

  // 优先使用 chart 属性（vue-echarts 8.x 推荐方式）
  if (chartRef.value.chart) {
    return chartRef.value.chart
  }

  // 回退到 getEchartsInstance 方法（兼容旧版本）
  if (typeof chartRef.value.getEchartsInstance === 'function') {
    return chartRef.value.getEchartsInstance()
  }

  return null
}

// 图表初始化标志
const isChartInitialized = ref(false)

// 组件挂载后通知图表已就绪（renderer 通过 init-options + key 在挂载时已生效）
onMounted(() => {
  setTimeout(() => {
    const chartInstance = getEchartsInstance()
    if (chartInstance) {
      isChartInitialized.value = true
      emit('chartReady', chartInstance)
    }
  }, 100)
})

// 组件卸载时清理
onUnmounted(() => {
  isChartInitialized.value = false
})

// 暴露图表实例方法
const getChartInstance = () => chartRef.value

// 联动相关方法
const getConnectState = () => connectState.value
const setConnectState = (state: Partial<ChartConnectState>) => {
  connectState.value = { ...connectState.value, ...state }
}
const triggerConnect = (eventType: string, params: Record<string, unknown>) => {
  if (isConnectEnabled.value) {
    const chartInstance = getEchartsInstance()
    if (chartInstance) {
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
  setOption: (option: EChartsOption, notMerge = false) => {
    if (chartRef.value) {
      chartRef.value.setOption(option, notMerge)
    }
  },
  resize: () => {
    if (chartRef.value) {
      chartRef.value.resize()
    }
  },
  clear: () => {
    if (chartRef.value) {
      chartRef.value.clear()
    }
  },
  dispose: () => {
    if (chartRef.value) {
      chartRef.value.dispose()
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
    class="layout-full"
  >
    <VECharts
      :key="props.renderer"
      ref="chartRef"
      :option="mergedOption"
      :init-options="initOptions"
      :style="{
        ...(typeof style === 'function' ? style() : style),
        width,
        height,
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
