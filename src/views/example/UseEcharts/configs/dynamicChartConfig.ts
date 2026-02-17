import type { EChartsOption } from 'echarts'
import type { Ref } from 'vue'

export function useDynamicChartOption(): {
  option: Ref<EChartsOption>
  loading: Ref<boolean>
  refreshData: () => void
} {
  const option = ref<EChartsOption>({
    xAxis: { type: 'category', data: ['A', 'B', 'C', 'D', 'E'] },
    yAxis: { type: 'value' },
    series: [{ name: '数值', type: 'bar', data: [10, 22, 18, 9, 30] }],
  } as EChartsOption)
  const loading = ref(false)

  function refreshData() {
    loading.value = true
    const next = () => {
      option.value = {
        xAxis: { type: 'category', data: ['A', 'B', 'C', 'D', 'E'] },
        yAxis: { type: 'value' },
        series: [
          {
            name: '数值',
            type: 'bar',
            data: Array.from({ length: 5 }, () => Math.round(Math.random() * 30)),
          },
        ],
      } as EChartsOption
      loading.value = false
    }
    setTimeout(next, 500)
  }

  return { option: option as Ref<EChartsOption>, loading, refreshData }
}

/**
 * usePollingChartOption - 模拟轮询更新图表数据（每 5 秒）
 *
 * 设计要点：
 * - 仅更新 xAxis.data 与 series[0].data，保持 option 结构稳定，减少不必要的 diff。
 * - 不使用 loading 遮罩，避免「闪一下」的视觉干扰。
 * - 提供 start/stop 控制，组件卸载时自动 stop。
 */
export function usePollingChartOption(): {
  option: Ref<EChartsOption>
  isRunning: Ref<boolean>
  start: () => void
  stop: () => void
} {
  const option = ref<EChartsOption>({
    xAxis: { type: 'category', data: ['T-4', 'T-3', 'T-2', 'T-1', 'T'] },
    yAxis: { type: 'value' },
    series: [
      {
        name: '数值',
        type: 'line',
        data: [10, 12, 8, 15, 9],
        smooth: true,
      },
    ],
  } as EChartsOption)

  const isRunning = ref(false)
  const timerId = ref<number | null>(null)

  const tick = () => {
    const cur = option.value as EChartsOption
    // 使用类型守卫确保类型安全
    const xAxis = Array.isArray(cur.xAxis) ? cur.xAxis[0] : cur.xAxis
    if (!xAxis || xAxis.type !== 'category') {
      return
    }
    const xData = (xAxis.data as string[]) || []
    const seriesArr = (cur.series as any[]) || []
    const firstSeries = seriesArr[0]
    if (!firstSeries || !Array.isArray(firstSeries.data)) {
      return
    }
    const dataArr = firstSeries.data as number[]

    if (!xData.length || !dataArr.length) {
      return
    }

    const nowLabel = new Date().toLocaleTimeString().slice(3, 8)
    const nextX = [...xData.slice(1), nowLabel]
    const nextData = [...dataArr.slice(1), Math.round(Math.random() * 30)]

    option.value = {
      ...cur,
      xAxis: {
        ...xAxis,
        data: nextX,
      },
      series: [
        {
          ...firstSeries,
          data: nextData,
        },
      ],
    } as EChartsOption
  }

  const start = () => {
    if (isRunning.value) return
    isRunning.value = true
    timerId.value = window.setInterval(tick, 5000)
  }

  const stop = () => {
    if (!isRunning.value) return
    isRunning.value = false
    if (timerId.value != null) {
      clearInterval(timerId.value)
      timerId.value = null
    }
  }

  onUnmounted(stop)

  return {
    option: option as Ref<EChartsOption>,
    isRunning,
    start,
    stop,
  }
}

/**
 * useAutoHighlightChartOption - 自动切换悬停高亮（每 5 秒）
 *
 * 设计要点：
 * - 返回柱状图配置
 * - 提供 start/stop 控制，组件卸载时自动 stop
 * - start 函数接受图表实例获取函数，通过 dispatchAction 触发 highlight、updateAxisPointer、showTip
 */
export function useAutoHighlightChartOption(): {
  option: Ref<EChartsOption>
  isRunning: Ref<boolean>
  start: (getInstance: () => unknown) => void
  stop: () => void
} {
  const option = ref<EChartsOption>({
    xAxis: { type: 'category', data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'] },
    yAxis: { type: 'value' },
    series: [{ name: '数值', type: 'bar', data: [10, 22, 18, 9, 30] }],
  } as EChartsOption)

  const isRunning = ref(false)
  let timerId: number | null = null
  const currentIndex = ref(0)
  let getInstanceFn: (() => unknown) | null = null

  const highlightNext = () => {
    if (!getInstanceFn) return
    const instance = getInstanceFn()
    if (!instance || typeof instance !== 'object') return

    // 类型断言为 ECharts 实例（包含 dispatchAction 方法）
    const echartsInst = instance as {
      dispatchAction?: (action: { type: string; seriesIndex?: number; dataIndex?: number }) => void
    }

    if (!echartsInst.dispatchAction) return

    const xAxis = Array.isArray(option.value.xAxis) ? option.value.xAxis[0] : option.value.xAxis
    if (!xAxis || xAxis.type !== 'category' || !Array.isArray(xAxis.data)) return

    const dataLength = xAxis.data.length
    if (dataLength === 0) return

    // 先清除所有高亮
    echartsInst.dispatchAction({ type: 'downplay', seriesIndex: 0 })
    echartsInst.dispatchAction({ type: 'hideTip' })

    // 高亮当前索引的数据项
    echartsInst.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: currentIndex.value })
    echartsInst.dispatchAction({
      type: 'updateAxisPointer',
      seriesIndex: 0,
      dataIndex: currentIndex.value,
    })
    echartsInst.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: currentIndex.value })

    // 切换到下一个索引（循环）
    currentIndex.value = (currentIndex.value + 1) % dataLength
  }

  const start = (getInstance: () => unknown) => {
    if (isRunning.value) return
    getInstanceFn = getInstance
    isRunning.value = true
    currentIndex.value = 0
    // 立即执行一次，然后每 5 秒执行一次
    nextTick(() => {
      highlightNext()
      timerId = window.setInterval(highlightNext, 5000)
    })
  }

  const stop = () => {
    if (!isRunning.value) return
    isRunning.value = false
    if (timerId != null) {
      clearInterval(timerId)
      timerId = null
    }
    // 清除高亮
    if (getInstanceFn) {
      const instance = getInstanceFn()
      if (instance && typeof instance === 'object') {
        const echartsInst = instance as {
          dispatchAction?: (action: { type: string; seriesIndex?: number }) => void
        }
        if (echartsInst.dispatchAction) {
          echartsInst.dispatchAction({ type: 'downplay', seriesIndex: 0 })
          echartsInst.dispatchAction({ type: 'hideTip' })
        }
      }
    }
    currentIndex.value = 0
    getInstanceFn = null
  }

  onUnmounted(stop)

  return {
    option: option as Ref<EChartsOption>,
    isRunning,
    start,
    stop,
  }
}
