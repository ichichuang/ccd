<script setup lang="ts">
import { throttleFn } from '@/utils/lodashes'
import { useChartTheme } from '@/hooks/components/useChartTheme/index'
import VECharts from 'vue-echarts'
import { createDefaultUseEchartsProps } from './utils/constants'
import type { ChartConnectState, UseEchartsProps } from './utils/types'

const props = withDefaults(defineProps<UseEchartsProps & { group?: string }>(), {
  ...createDefaultUseEchartsProps(),
  group: undefined,
})

const emit = defineEmits<{
  finished: []
  chartReady: [instance: any, id?: string]
}>()

const chartContainerRef = ref<HTMLElement | HTMLDivElement | null>(null)
const chartRef = ref()

// 联动相关状态
const connectState = ref<ChartConnectState>({})
const isConnectEnabled = computed(() => props.connectConfig?.enabled === true)
const connectGroupId = computed(() => {
  const groupId = props.group || props.connectConfig?.groupId || 'default'
  return groupId
})

// 根据全局策略创建 resize 处理器
const baseResize = () => {
  if (chartRef.value) {
    chartRef.value.resize()
  }
}

const resizeHandler = throttleFn(baseResize, 300)

// 使用主题合并后的配置
const optionRef = computed(() => props.option)
const opacityConfigRef = computed(() => props.themeConfig?.opacity)
const advancedConfigRef = computed(() => ({
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

// 使用响应式 Hook
const { themedOption } = useChartTheme(optionRef, opacityConfigRef as any, advancedConfigRef as any)

// 如果未启用主题，直接返回原始配置
const mergedOption = computed(() => {
  if (!props.option || Object.keys(props.option).length === 0) {
    return {}
  }

  if (props.themeConfig?.enableTheme === false) {
    return props.option
  }

  return themedOption.value
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
 * 创建事件处理器包装函数
 */
const createEventHandler = (originalHandler: any) => {
  return (params: any) => {
    if (originalHandler && typeof originalHandler === 'function') {
      originalHandler(params)
    }
  }
}

/**
 * 事件处理器映射 - 使用循环自动识别所有 on... 开头的 props
 */
const eventHandlers = computed(() => {
  const handlers: Record<string, any> = {}

  // 遍历所有 props，自动识别 on... 开头的 prop
  for (const key in props) {
    // 跳过非事件处理器 prop
    if (!key.startsWith('on') || key === 'onEvents') {
      continue
    }

    const handler = props[key as keyof typeof props]
    if (typeof handler === 'function') {
      const eventName = convertPropNameToEventName(key)
      handlers[eventName] = createEventHandler(handler)
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
      typeof props.onEvents === 'function' ? (props.onEvents as any)() : props.onEvents
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

// 组件挂载后初始化图表
onMounted(() => {
  // 等待图表完全初始化
  setTimeout(() => {
    const chartInstance = getEchartsInstance()
    if (chartInstance) {
      isChartInitialized.value = true

      // 设置渲染器
      if (props.renderer && chartInstance.setOption) {
        // 通过重新设置配置来应用渲染器
        const currentOption = chartInstance.getOption()
        chartInstance.setOption(currentOption, true)
      }

      // 通知父组件图表已就绪
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
const triggerConnect = (eventType: string, params: any) => {
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
  setOption: (option: any, notMerge = false) => {
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
    class="full"
  >
    <VECharts
      ref="chartRef"
      :option="mergedOption"
      :style="{
        ...(typeof style === 'function' ? style() : style),
        width,
        height,
      }"
      :theme="theme"
      :loading="loading"
      :loading-options="loadingOptions"
      :manual-update="manualUpdate"
      :group="connectGroupId"
      v-on="eventHandlers"
    />
  </div>
</template>
