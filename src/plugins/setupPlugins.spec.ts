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
  setupRouter: () => {
    calls.order.push('router:start')
    void Promise.resolve().then(() => calls.order.push('router:end'))
  },
}))

vi.mock('@/plugins/modules/date', () => ({
  setupDateUtils: () => {
    calls.order.push('date:start')
    return Promise.resolve().then(() => calls.order.push('date:end'))
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

  it('initializes infrastructure before non-blocking router/date handoff and directives', async () => {
    const { setupPlugins } = await import('./index')
    const app = createApp({ render: () => null })
    const directiveSpy = vi.spyOn(app, 'directive')

    setupPlugins(app)

    expect(calls.order).toEqual([
      'errorHandler',
      'locales',
      'stores',
      'authBridge',
      'primevue',
      'scrollbar',
      'proform',
      'router:start',
      'date:start',
    ])
    expect(directiveSpy.mock.calls.map(call => call[0])).toEqual([
      'auth',
      'tap',
      'swipe',
      'long-press',
    ])

    await Promise.resolve()
    expect(calls.order).toEqual([
      'errorHandler',
      'locales',
      'stores',
      'authBridge',
      'primevue',
      'scrollbar',
      'proform',
      'router:start',
      'date:start',
      'router:end',
      'date:end',
    ])
  })
})
