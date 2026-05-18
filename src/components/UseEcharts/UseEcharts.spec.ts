// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import type { EChartsOption } from 'echarts'
import UseEcharts from './UseEcharts.vue'
import { ensureEChartsModulesForOption } from './echarts-registry'
import type { ChartInstance } from './utils/types'

const controls = vi.hoisted(() => ({
  initialWidth: 640,
  initialHeight: 320,
  widthRef: undefined as undefined | { value: number },
  heightRef: undefined as undefined | { value: number },
  resizeHandler: undefined as undefined | (() => void),
  intersectionCallback: undefined as
    | undefined
    | ((entries: Array<{ isIntersecting: boolean }>) => void),
  intersectionObserve: vi.fn(),
  intersectionUnobserve: vi.fn(),
  themedVersionRef: undefined as undefined | { value: number },
  chart: {
    resize: vi.fn(),
    setOption: vi.fn(),
    isDisposed: vi.fn(() => false),
    clear: vi.fn(),
    dispose: vi.fn(),
    dispatchAction: vi.fn(),
  },
}))

vi.mock('./echarts-setup', () => ({}))

vi.mock('./echarts-registry', () => ({
  ensureEChartsModulesForOption: vi.fn(() => Promise.resolve()),
  getEChartsSeriesTypes: vi.fn((option: EChartsOption | undefined) => {
    const series = option?.series
    const seriesList = Array.isArray(series) ? series : series ? [series] : []
    return new Set(
      seriesList.flatMap(item => {
        const type = typeof item === 'object' && item && 'type' in item ? item.type : undefined
        return typeof type === 'string' ? [type] : []
      })
    )
  }),
  getMissingEChartsLazySeriesTypes: vi.fn(() => []),
}))

vi.mock('@/hooks/modules/useAppElementSize', async () => {
  const vue = await vi.importActual<typeof import('vue')>('vue')
  return {
    useAppElementSize: (_target: unknown, onResize: () => void) => {
      controls.resizeHandler = onResize
      controls.widthRef = vue.ref(controls.initialWidth)
      controls.heightRef = vue.ref(controls.initialHeight)
      return {
        width: controls.widthRef,
        height: controls.heightRef,
      }
    },
  }
})

vi.mock('@/hooks/modules/useChartTheme/index', async () => {
  const vue = await vi.importActual<typeof import('vue')>('vue')
  return {
    useChartTheme: (optionRef: {
      value: Record<string, unknown> | undefined
    }): { themedOption: { value: Record<string, unknown> | undefined } } => {
      controls.themedVersionRef ??= vue.ref(0)
      return {
        themedOption: vue.computed(() => {
          const option = optionRef.value
          if (!option) return undefined
          return {
            ...option,
            themedVersion: controls.themedVersionRef?.value ?? 0,
          }
        }),
      }
    },
  }
})

vi.mock('vue-echarts', async () => {
  const vue = await vi.importActual<typeof import('vue')>('vue')
  return {
    default: vue.defineComponent({
      name: 'MockVECharts',
      props: {
        option: { type: Object, default: () => ({}) },
      },
      emits: ['finished'],
      setup(_props, { emit, expose }) {
        expose({
          chart: controls.chart,
          getEchartsInstance: () => controls.chart,
        })
        vue.onMounted(() => {
          emit('finished')
        })
        return () => vue.h('div', { class: 'mock-vecharts' })
      },
    }),
  }
})

function option(): EChartsOption {
  return {
    series: [{ type: 'line', data: [1, 2, 3] }],
  }
}

async function mountChart() {
  const wrapper = mount(UseEcharts, {
    props: {
      option: option(),
      style: { height: '320px' },
    },
    global: {
      plugins: [createPinia()],
    },
  })

  await flushPromises()
  await nextTick()
  const container = wrapper.find('.layout-full').element
  vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
    width: controls.initialWidth,
    height: controls.initialHeight,
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: controls.initialWidth,
    bottom: controls.initialHeight,
    toJSON: () => ({}),
  } as DOMRect)
  return wrapper
}

describe('UseEcharts runtime contract', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    controls.initialWidth = 640
    controls.initialHeight = 320
    controls.widthRef = undefined
    controls.heightRef = undefined
    controls.resizeHandler = undefined
    controls.intersectionCallback = undefined
    controls.intersectionObserve.mockClear()
    controls.intersectionUnobserve.mockClear()
    controls.themedVersionRef = undefined
    controls.chart.resize.mockClear()
    controls.chart.setOption.mockClear()
    controls.chart.isDisposed.mockClear()
    controls.chart.isDisposed.mockReturnValue(false)
    controls.chart.clear.mockClear()
    controls.chart.dispose.mockClear()
    controls.chart.dispatchAction.mockClear()
    vi.mocked(ensureEChartsModulesForOption).mockClear()

    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        callback(1)
        return 1
      })
    )
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    class MockIntersectionObserver {
      constructor(callback: (entries: Array<{ isIntersecting: boolean }>) => void) {
        controls.intersectionCallback = callback
      }

      observe = controls.intersectionObserve
      unobserve = controls.intersectionUnobserve
      disconnect = vi.fn()
    }
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  })

  it('emits finished and chartReady after modules and container size are ready', async () => {
    const wrapper = await mountChart()

    await vi.waitFor(() => {
      expect(wrapper.emitted('finished')).toHaveLength(1)
      expect(wrapper.emitted('chartReady')).toHaveLength(1)
    })

    expect(ensureEChartsModulesForOption).toHaveBeenCalledWith(option())
    expect(wrapper.emitted('chartReady')?.[0]?.[0]).toBe(controls.chart)
  })

  it('recomputes themed options when the theme layer changes', async () => {
    const wrapper = await mountChart()

    controls.themedVersionRef!.value = 1
    await nextTick()

    const chart = wrapper.findComponent({ name: 'MockVECharts' })
    expect(chart.props('option')).toMatchObject({
      themedVersion: 1,
    })
  })

  it('resizes the chart from the shared element-size callback', async () => {
    await mountChart()
    controls.chart.resize.mockClear()

    controls.resizeHandler?.()

    expect(controls.chart.resize).toHaveBeenCalledTimes(1)
  })

  it('resizes the chart when its container becomes visible', async () => {
    await mountChart()
    controls.chart.resize.mockClear()

    controls.intersectionCallback?.([{ isIntersecting: true }])

    expect(controls.intersectionObserve).toHaveBeenCalledTimes(1)
    expect(controls.chart.resize).toHaveBeenCalledTimes(1)
  })

  it('exposes setOption with ECharts update options', async () => {
    const wrapper = await mountChart()
    const exposed = wrapper.vm as unknown as ChartInstance
    const nextOption = {
      series: [{ type: 'bar', data: [3, 2, 1] }],
    } satisfies EChartsOption

    exposed.setOption(nextOption, {
      replaceMerge: ['series'],
      lazyUpdate: true,
    })

    expect(controls.chart.setOption).toHaveBeenCalledWith(nextOption, {
      notMerge: false,
      replaceMerge: ['series'],
      lazyUpdate: true,
    })
  })

  it('keeps vue-echarts mounted when only option data changes within the same series type', async () => {
    const wrapper = await mountChart()

    await vi.waitFor(() => {
      expect(wrapper.find('.mock-vecharts').exists()).toBe(true)
    })

    await wrapper.setProps({
      option: {
        series: [{ type: 'line', data: [3, 4, 5] }],
      } satisfies EChartsOption,
    })
    await nextTick()
    await flushPromises()

    expect(wrapper.find('.mock-vecharts').exists()).toBe(true)
    expect(ensureEChartsModulesForOption).toHaveBeenCalledTimes(1)
  })

  it('does not mount vue-echarts until the container has non-zero dimensions', async () => {
    controls.initialWidth = 0
    controls.initialHeight = 0
    const wrapper = await mountChart()

    expect(wrapper.find('.mock-vecharts').exists()).toBe(false)

    controls.widthRef!.value = 640
    controls.heightRef!.value = 320
    await nextTick()
    await flushPromises()

    expect(wrapper.find('.mock-vecharts').exists()).toBe(true)
  })
})
