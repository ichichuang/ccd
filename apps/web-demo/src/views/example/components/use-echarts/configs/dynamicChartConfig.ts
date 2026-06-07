import type { EChartsOption } from 'echarts'
import type { Ref } from 'vue'
import {
  useAutoHighlightChartOptionRuntime,
  useDynamicChartOptionRuntime,
  usePollingChartOptionRuntime,
} from '@ccd/vue-charts'

const POLLING_WINDOW_SIZE = 12
const POLLING_SERIES_ID = 'polling-smooth-line'
const INITIAL_POLLING_DATA = [18, 19, 21, 22, 24, 23, 25, 27, 28, 30, 29, 31]

function createPollingLabel(offset: number): string {
  if (offset < 0) return `T${offset}`
  if (offset === 0) return 'T'
  return `T+${offset}`
}

function createPollingOption(labels: readonly string[], data: readonly number[]): EChartsOption {
  return {
    animation: true,
    animationDurationUpdate: 900,
    animationEasingUpdate: 'linear',
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', boundaryGap: false, data: [...labels] },
    yAxis: { type: 'value', min: 0, max: 50 },
    series: [
      {
        id: POLLING_SERIES_ID,
        name: '实时数值',
        type: 'line',
        data: [...data],
        smooth: true,
        showSymbol: false,
        areaStyle: {},
        animationDurationUpdate: 900,
        animationEasingUpdate: 'linear',
      },
    ],
  }
}

function clampPollingValue(value: number): number {
  return Math.min(48, Math.max(8, value))
}

function createNextPollingValue(previousValue: number, step: number): number {
  const waveDelta = Math.sin(step / 2) * 2.4
  const trendDelta = step % 4 === 0 ? 1.2 : -0.35
  return Math.round(clampPollingValue(previousValue + waveDelta + trendDelta))
}

function createDynamicBarOption(data: readonly number[]): EChartsOption {
  return {
    xAxis: { type: 'category', data: ['A', 'B', 'C', 'D', 'E'] },
    yAxis: { type: 'value' },
    series: [{ name: '数值', type: 'bar', data: [...data] }],
  }
}

function createAutoHighlightOption(): EChartsOption {
  return {
    xAxis: { type: 'category', data: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'] },
    yAxis: { type: 'value' },
    series: [{ name: '数值', type: 'bar', data: [10, 22, 18, 9, 30] }],
  }
}

export function useDynamicChartOption(): {
  option: Ref<EChartsOption>
  loading: Ref<boolean>
  refreshData: () => void
} {
  return useDynamicChartOptionRuntime({
    initialOption: createDynamicBarOption([10, 22, 18, 9, 30]),
    createNextOption: () =>
      createDynamicBarOption(Array.from({ length: 5 }, () => Math.round(Math.random() * 30))),
    delayMs: 500,
  })
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
  return usePollingChartOptionRuntime({
    initialData: INITIAL_POLLING_DATA,
    windowSize: POLLING_WINDOW_SIZE,
    createLabel: createPollingLabel,
    createNextValue: createNextPollingValue,
    createOption: createPollingOption,
    intervalMs: 5000,
  })
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
  return useAutoHighlightChartOptionRuntime({
    option: createAutoHighlightOption(),
    intervalMs: 5000,
    warn: message => console.warn(message),
  })
}
