// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'

const calls = vi.hoisted(() => ({
  order: [] as string[],
}))

vi.mock('@/plugins/modules/errorHandler', () => ({
  setupErrorHandler: () => calls.order.push('errorHandler'),
}))

vi.mock('@/plugins/modules/locales', () => ({
  setupLocales: () => calls.order.push('locales'),
}))

vi.mock('@/plugins/modules/stores', () => ({
  setupStores: () => calls.order.push('stores'),
}))

vi.mock('@/plugins/modules/authBridge', () => ({
  setupAuthBridge: () => calls.order.push('authBridge'),
}))

vi.mock('@/plugins/modules/primevue', () => ({
  setupPrimeVue: () => calls.order.push('primevue'),
}))

vi.mock('@/plugins/modules/scrollbar', () => ({
  setupScrollbar: () => calls.order.push('scrollbar'),
}))

vi.mock('@/plugins/modules/proform', () => ({
  setupProForm: () => calls.order.push('proform'),
}))

vi.mock('@/plugins/modules/router', () => ({
  setupRouter: async () => {
    calls.order.push('router:start')
    await Promise.resolve()
    calls.order.push('router:end')
  },
}))

vi.mock('@/plugins/modules/date', () => ({
  setupDateUtils: async () => {
    calls.order.push('date:start')
    await Promise.resolve()
    calls.order.push('date:end')
  },
}))

vi.mock('@/directives/auth', () => ({ vAuth: { mounted: vi.fn() } }))
vi.mock('@/directives/tap', () => ({ vTap: { mounted: vi.fn() } }))
vi.mock('@/directives/swipe', () => ({ vSwipe: { mounted: vi.fn() } }))
vi.mock('@/directives/longPress', () => ({ vLongPress: { mounted: vi.fn() } }))

describe('setupPlugins bootstrap order', () => {
  beforeEach(() => {
    calls.order = []
  })

  it('initializes infrastructure before router/date handoff and directives', async () => {
    const { setupPlugins } = await import('./index')
    const app = createApp({ render: () => null })
    const directiveSpy = vi.spyOn(app, 'directive')

    await setupPlugins(app)

    expect(calls.order).toEqual([
      'errorHandler',
      'locales',
      'stores',
      'authBridge',
      'primevue',
      'scrollbar',
      'proform',
      'router:start',
      'router:end',
      'date:start',
      'date:end',
    ])
    expect(directiveSpy.mock.calls.map(call => call[0])).toEqual([
      'auth',
      'tap',
      'swipe',
      'long-press',
    ])
  })
})
