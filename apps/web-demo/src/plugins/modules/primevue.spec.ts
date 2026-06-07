// @vitest-environment jsdom

import type { App } from 'vue'
import { createApp } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PRIME_DIALOG_RUNTIME_CONFIG_KEY } from '@ccd/vue-ui'

const primevueState = vi.hoisted(() => ({
  installPrimeVueRuntime: vi.fn(),
}))

vi.mock('@/stores', () => ({
  default: {},
}))

vi.mock('@/stores/modules/system', () => ({
  useLocaleStore: () => ({ locale: 'zh-CN' }),
  useDeviceStore: () => ({ isPCLayout: true, isTabletLayout: false }),
  useSizeStore: () => ({ mode: 'comfortable' }),
}))

vi.mock('@ccd/vue-primevue-adapter', () => ({
  installPrimeVueRuntime: primevueState.installPrimeVueRuntime,
}))

interface ProvideCall {
  key: unknown
  value: unknown
}

function createInstrumentedApp(): App {
  const app = createApp({ render: () => null })
  const provideCalls: ProvideCall[] = []
  const originalProvide = app.provide.bind(app)

  vi.spyOn(app, 'provide').mockImplementation((key, value) => {
    provideCalls.push({ key, value })
    return originalProvide(key, value)
  })
  Reflect.set(app, '__ccdProvideCalls', provideCalls)

  return app
}

describe('setupPrimeVue', () => {
  beforeEach(() => {
    primevueState.installPrimeVueRuntime.mockClear()
  })

  it('routes PrimeVue runtime setup through the adapter boundary', async () => {
    const { setupPrimeVue } = await import('./primevue')
    const app = createInstrumentedApp()

    setupPrimeVue(app)

    expect(primevueState.installPrimeVueRuntime).toHaveBeenCalledOnce()
    const [targetApp, options] = primevueState.installPrimeVueRuntime.mock.calls[0]
    expect(targetApp).toBe(app)
    expect(options).toMatchObject({
      sizeSource: { mode: 'comfortable' },
    })
    expect(options.locale).toBeDefined()

    const provideCalls = Reflect.get(app, '__ccdProvideCalls') as ProvideCall[]
    expect(provideCalls).toHaveLength(1)
    expect(provideCalls[0].key).toBe(PRIME_DIALOG_RUNTIME_CONFIG_KEY)
    expect(provideCalls[0].value).toMatchObject({
      translate: expect.any(Function),
      isDialogDraggable: expect.any(Function),
    })
  })
})
