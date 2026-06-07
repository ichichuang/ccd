import type { EChartsOption } from 'echarts'
import type { Ref } from 'vue'
import { nextTick, onUnmounted, ref, shallowRef } from 'vue'
import { useIntervalFn, useTimeoutFn } from '@vueuse/core'

export interface DynamicChartOptionRuntimeOptions {
  initialOption: EChartsOption
  createNextOption: () => EChartsOption
  delayMs?: number
}

export interface DynamicChartOptionRuntime {
  option: Ref<EChartsOption>
  loading: Ref<boolean>
  refreshData: () => void
}

export function useDynamicChartOptionRuntime(
  options: DynamicChartOptionRuntimeOptions
): DynamicChartOptionRuntime {
  const option = shallowRef<EChartsOption>(options.initialOption)
  const loading = ref(false)

  function refreshData(): void {
    loading.value = true
    const { start, stop } = useTimeoutFn(
      () => {
        option.value = options.createNextOption()
        loading.value = false
        stop()
      },
      options.delayMs ?? 500,
      { immediate: false }
    )
    start()
  }

  return { option: option as Ref<EChartsOption>, loading, refreshData }
}

export interface PollingChartOptionRuntimeOptions {
  initialData: readonly number[]
  windowSize: number
  createLabel: (offset: number, index: number, step: number) => string
  createNextValue: (previousValue: number, step: number, currentData: readonly number[]) => number
  createOption: (labels: readonly string[], data: readonly number[]) => EChartsOption
  intervalMs?: number
}

export interface PollingChartOptionRuntime {
  option: Ref<EChartsOption>
  isRunning: Ref<boolean>
  start: () => void
  stop: () => void
}

function createPollingLabels(options: PollingChartOptionRuntimeOptions, step: number): string[] {
  return Array.from({ length: options.windowSize }, (_, index) => {
    const offset = step - (options.windowSize - 1) + index
    return options.createLabel(offset, index, step)
  })
}

export function usePollingChartOptionRuntime(
  options: PollingChartOptionRuntimeOptions
): PollingChartOptionRuntime {
  const option = shallowRef<EChartsOption>(
    options.createOption(createPollingLabels(options, 0), options.initialData)
  )

  const isRunning = ref(false)
  const pollingStep = ref(0)

  function tick(): void {
    const currentData = Array.isArray(options.initialData) ? [...options.initialData] : []
    const seriesSource = option.value.series
    const seriesArr = Array.isArray(seriesSource)
      ? seriesSource
      : seriesSource
        ? [seriesSource]
        : []
    const firstSeries = seriesArr[0] as { data?: unknown } | undefined
    const activeData = Array.isArray(firstSeries?.data)
      ? firstSeries.data.filter((item): item is number => typeof item === 'number')
      : currentData

    const previousValue = activeData.at(-1) ?? options.initialData.at(-1) ?? 0
    const nextStep = pollingStep.value + 1
    const nextData = [
      ...activeData.slice(-(options.windowSize - 1)),
      options.createNextValue(previousValue, nextStep, activeData),
    ]

    pollingStep.value = nextStep
    option.value = options.createOption(createPollingLabels(options, nextStep), nextData)
  }

  const { pause, resume } = useIntervalFn(tick, options.intervalMs ?? 5000, { immediate: false })

  const start = (): void => {
    if (isRunning.value) return
    isRunning.value = true
    tick()
    resume()
  }

  const stop = (): void => {
    if (!isRunning.value) return
    isRunning.value = false
    pause()
  }

  onUnmounted(stop)

  return {
    option: option as Ref<EChartsOption>,
    isRunning,
    start,
    stop,
  }
}

export interface ChartDispatchTarget {
  dispatchAction?: (action: Record<string, unknown>) => void
}

export interface AutoHighlightChartOptionRuntimeOptions {
  option: EChartsOption
  intervalMs?: number
  seriesIndex?: number
  warn?: (message: string) => void
}

export interface AutoHighlightChartOptionRuntime {
  option: Ref<EChartsOption>
  isRunning: Ref<boolean>
  start: (getInstance: () => unknown) => void
  stop: () => void
}

export function unwrapChartRef<TChart>(value: TChart | TChart[] | null | undefined): TChart | null {
  if (!value) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

export function isChartDispatchTarget(value: unknown): value is ChartDispatchTarget {
  return typeof value === 'object' && value !== null && 'dispatchAction' in value
}

export function resolveCategoryAxisDataLength(option: EChartsOption): number {
  const xAxis = Array.isArray(option.xAxis) ? option.xAxis[0] : option.xAxis
  if (!xAxis || typeof xAxis !== 'object') return 0

  const axis = xAxis as { type?: unknown; data?: unknown }
  if (axis.type !== 'category' || !Array.isArray(axis.data)) return 0
  return axis.data.length
}

export function dispatchAutoHighlightStep(
  instance: ChartDispatchTarget,
  option: EChartsOption,
  dataIndex: number,
  seriesIndex = 0
): boolean {
  const dataLength = resolveCategoryAxisDataLength(option)
  if (dataLength <= 0 || dataIndex < 0 || dataIndex >= dataLength) return false
  if (typeof instance.dispatchAction !== 'function') return false

  instance.dispatchAction({ type: 'downplay', seriesIndex })
  instance.dispatchAction({ type: 'hideTip' })
  instance.dispatchAction({ type: 'highlight', seriesIndex, dataIndex })
  instance.dispatchAction({ type: 'updateAxisPointer', seriesIndex, dataIndex })
  instance.dispatchAction({ type: 'showTip', seriesIndex, dataIndex })
  return true
}

export function clearAutoHighlight(instance: ChartDispatchTarget, seriesIndex = 0): void {
  if (typeof instance.dispatchAction !== 'function') return
  instance.dispatchAction({ type: 'downplay', seriesIndex })
  instance.dispatchAction({ type: 'hideTip' })
}

export function useAutoHighlightChartOptionRuntime(
  options: AutoHighlightChartOptionRuntimeOptions
): AutoHighlightChartOptionRuntime {
  const option = shallowRef<EChartsOption>(options.option)
  const isRunning = ref(false)
  const currentIndex = ref(0)
  const seriesIndex = options.seriesIndex ?? 0
  let getInstanceFn: (() => unknown) | null = null

  function highlightNext(): void {
    if (!getInstanceFn) return
    const instance = getInstanceFn()
    if (!isChartDispatchTarget(instance)) return

    const dataLength = resolveCategoryAxisDataLength(option.value)
    if (dataLength <= 0) return
    if (dispatchAutoHighlightStep(instance, option.value, currentIndex.value, seriesIndex)) {
      currentIndex.value = (currentIndex.value + 1) % dataLength
    }
  }

  const { pause, resume } = useIntervalFn(highlightNext, options.intervalMs ?? 5000, {
    immediate: false,
  })

  const start = (getInstance: () => unknown): void => {
    if (isRunning.value) return
    const instance = getInstance()
    if (!isChartDispatchTarget(instance) || typeof instance.dispatchAction !== 'function') {
      options.warn?.(
        '[useAutoHighlightChartOptionRuntime] start aborted: chart instance is unavailable'
      )
      return
    }

    getInstanceFn = getInstance
    isRunning.value = true
    currentIndex.value = 0
    void nextTick(() => {
      if (!isRunning.value) return
      highlightNext()
      resume()
    })
  }

  const stop = (): void => {
    if (!isRunning.value) return
    isRunning.value = false
    pause()
    const instance = getInstanceFn?.()
    if (isChartDispatchTarget(instance)) {
      clearAutoHighlight(instance, seriesIndex)
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
