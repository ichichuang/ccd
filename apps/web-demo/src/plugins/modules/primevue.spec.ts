// @vitest-environment jsdom

import type { App, Plugin } from 'vue'
import { createApp } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

interface UseCall {
  plugin: Plugin
  options?: unknown
}

const primevueState = vi.hoisted(() => ({
  useCalls: [] as UseCall[],
  directives: [] as string[],
}))

vi.mock('primevue/config', () => ({
  default: { install: vi.fn() },
}))

vi.mock('primevue/toastservice', () => ({
  default: { install: vi.fn() },
}))

vi.mock('primevue/confirmationservice', () => ({
  default: { install: vi.fn() },
}))

vi.mock('primevue/dialogservice', () => ({
  default: { install: vi.fn() },
}))

vi.mock('primevue/tooltip', () => ({
  default: { mounted: vi.fn() },
}))

vi.mock('@/stores', () => ({
  default: {},
}))

vi.mock('@/stores/modules/system', () => ({
  useLocaleStore: () => ({ locale: 'zh-CN' }),
  useSizeStore: () => ({ mode: 'comfortable' }),
}))

vi.mock('@/utils/theme/primevuePreset', () => ({
  createCustomPreset: () => ({ semantic: { primary: { 500: '{primary.500}' } } }),
}))

vi.mock('@/utils/theme/ptPresets/formControlsPt', () => ({
  ...Object.fromEntries([
    ['OVERLAY_GLASS_CLASS', 'glass-panel'],
    ['OVERLAY_GLASS_COMPACT_CLASS', 'glass-card'],
  ]),
  formControlsPt: { inputtext: { root: { class: 'text-foreground' } } },
}))

vi.mock('@/utils/theme/ptPresets/menuPt', () => ({
  menuPt: { menu: { root: { class: 'text-foreground' } } },
}))

function createInstrumentedApp(): App {
  const app = createApp({ render: () => null })
  const originalUse = app.use.bind(app)
  const originalDirective = app.directive.bind(app)

  vi.spyOn(app, 'use').mockImplementation((plugin: Plugin, ...options: unknown[]) => {
    primevueState.useCalls.push({ plugin, options: options[0] })
    return originalUse(plugin, ...options)
  })
  vi.spyOn(app, 'directive').mockImplementation((name, directive) => {
    primevueState.directives.push(name)
    return originalDirective(name, directive)
  })

  return app
}

describe('setupPrimeVue', () => {
  beforeEach(() => {
    primevueState.useCalls = []
    primevueState.directives = []
  })

  it('installs PrimeVue v4 with design-system pt and services', async () => {
    const { setupPrimeVue } = await import('./primevue')
    const app = createInstrumentedApp()

    setupPrimeVue(app)

    expect(primevueState.useCalls).toHaveLength(4)
    expect(primevueState.directives).toEqual(['tooltip'])

    const [primevueCall] = primevueState.useCalls
    expect(primevueCall.options).toMatchObject({
      theme: {
        options: {
          prefix: 'p',
          darkModeSelector: '.dark',
        },
      },
      ptOptions: {
        mergeSections: true,
        mergeProps: true,
      },
      ripple: true,
    })
    expect(primevueCall.options).toHaveProperty('pt.drawer.root.class', 'glass-panel')
    expect(primevueCall.options).toHaveProperty('locale')
  })
})
