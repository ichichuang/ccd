// @vitest-environment jsdom
/* eslint-disable vue/one-component-per-file */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import CScrollbar from './CScrollbar.vue'
import { scrollbarMemoryProviderKey } from './utils/memory'

vi.mock('primevue/config', () => ({
  usePrimeVue: () => ({ config: { locale: { aria: { scrollTop: 'Scroll Top' } } } }),
}))

vi.mock('../AnimateWrapper/AnimateWrapper.vue', () => ({
  default: defineComponent({
    name: 'AnimateWrapperStub',
    render() {
      return h('div', this.$slots.default?.())
    },
  }),
}))

vi.mock('../Icons/Icons.vue', () => ({
  default: defineComponent({
    name: 'IconsStub',
    props: {
      name: {
        type: String,
        required: true,
      },
      size: {
        type: String,
        default: '',
      },
      color: {
        type: String,
        default: '',
      },
    },
    render() {
      return h('span', {
        'data-testid': 'icons-stub',
        'data-name': this.$props.name,
        'data-size': this.$props.size,
        'data-color': this.$props.color,
      })
    },
  }),
}))

vi.mock('overlayscrollbars-vue', () => ({
  OverlayScrollbarsComponent: defineComponent({
    name: 'OverlayScrollbarsComponent',
    props: {
      options: {
        type: Object,
        default: undefined,
      },
      defer: {
        type: Boolean,
        default: undefined,
      },
    },
    emits: ['os-initialized', 'os-updated', 'os-destroyed', 'os-scroll'],
    mounted() {
      const scrollOffsetElement = this.$el as HTMLElement
      const instance = {
        elements: () => ({ scrollOffsetElement }),
        options: vi.fn(),
        update: vi.fn(() => true),
        state: vi.fn(),
      }
      ;(this as unknown as { instance: unknown }).instance = instance
      this.$emit('os-initialized', instance)
    },
    methods: {
      osInstance() {
        return (this as unknown as { instance: unknown }).instance
      },
    },
    render() {
      return h(
        'div',
        {
          'data-testid': 'mock-scrollbar',
          onScroll: (event: Event) => this.$emit('os-scroll', this.osInstance(), event),
        },
        this.$slots.default?.()
      )
    },
  }),
}))

let rafId = 0
const rafCallbacks = new Map<number, FrameRequestCallback>()

describe('CScrollbar memory restoration', () => {
  beforeEach(() => {
    rafCallbacks.clear()
    rafId = 0
  })
  it('animates internal memory restore instead of jumping instantly', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      rafId += 1
      rafCallbacks.set(rafId, callback)
      return rafId
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      rafCallbacks.delete(id)
    })
    vi.spyOn(performance, 'now').mockReturnValue(0)

    const setMemory = vi.fn()
    const provider = defineComponent({
      setup() {
        return () =>
          h(
            CScrollbar,
            {
              memoryKey: 'spec-memory',
              memoryRestoreDelay: 0,
              memoryRestoreDuration: 720,
            },
            () => h('div', { style: 'height: 1200px' })
          )
      },
    })

    const wrapper = mount(provider, {
      global: {
        provide: {
          [scrollbarMemoryProviderKey as symbol]: {
            get: () => ({ scrollTop: 500, scrollLeft: 0 }),
            set: setMemory,
          },
        },
      },
    })

    const scrollEl = wrapper.get('[data-testid="mock-scrollbar"]').element as HTMLElement
    Object.defineProperties(scrollEl, {
      scrollHeight: { configurable: true, value: 1200 },
      clientHeight: { configurable: true, value: 400 },
      scrollWidth: { configurable: true, value: 400 },
      clientWidth: { configurable: true, value: 400 },
    })

    await nextTick()
    await nextTick()
    expect(scrollEl.scrollTop).toBe(0)

    rafCallbacks.get(1)?.(16)
    rafCallbacks.delete(1)
    rafCallbacks.get(2)?.(32)
    rafCallbacks.delete(2)
    vi.runOnlyPendingTimers()
    await nextTick()
    expect(scrollEl.scrollTop).toBe(0)

    rafCallbacks.get(3)?.(120)
    rafCallbacks.delete(3)
    const midScrollTop = scrollEl.scrollTop
    expect(midScrollTop).toBeGreaterThan(0)
    expect(midScrollTop).toBeLessThan(500)

    scrollEl.dispatchEvent(new WheelEvent('wheel'))
    const canceledAt = scrollEl.scrollTop
    rafCallbacks.get(4)?.(900)
    expect(scrollEl.scrollTop).toBe(canceledAt)
    expect(setMemory).not.toHaveBeenCalled()

    wrapper.unmount()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })
})

describe('CScrollbar back-to-top', () => {
  it('renders an accessible static arrow icon', async () => {
    const wrapper = mount(CScrollbar, {
      props: {
        backToTop: true,
      },
    })

    await nextTick()

    const shortcut = wrapper.get('[role="button"]')
    const icon = wrapper.get('[data-testid="icons-stub"]')

    expect(shortcut.attributes('aria-label')).toBe('Scroll Top')
    expect(shortcut.attributes('title')).toBe('Scroll Top')
    expect(icon.attributes('data-name')).toBe('i-lucide-arrow-up')
    expect(icon.attributes('data-size')).toBe('xl')
    expect(icon.attributes('data-color')).toBe('text-primary-foreground')
  })
})
