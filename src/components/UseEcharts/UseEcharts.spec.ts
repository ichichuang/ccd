// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import type { EChartsOption } from 'echarts'
import UseEcharts from './UseEcharts.vue'
import { ensureEChartsModulesForOption } from './echarts-registry'

const controls = vi.hoisted(() => ({
  initialWidth: 640,
  initialHeight: 320,
  widthRef: undefined as undefined | { value: number },
  heightRef: undefined as undefined | { value: number },
  resizeHandler: undefined as undefined | (() => void),
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

    controls.resizeHandler?.()

    expect(controls.chart.resize).toHaveBeenCalledTimes(1)
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
