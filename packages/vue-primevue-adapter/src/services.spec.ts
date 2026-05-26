// @vitest-environment jsdom

import type { App, Directive, Plugin } from 'vue'
import { createApp } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

interface UseCall {
  plugin: Plugin
}

interface DirectiveCall {
  directive: Directive
  name: string
}

const serviceState = vi.hoisted(() => ({
  directives: [] as DirectiveCall[],
  useCalls: [] as UseCall[],
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

function createInstrumentedApp(): App {
  const app = createApp({ render: () => null })
  const originalUse = app.use.bind(app)
  const originalDirective = app.directive.bind(app)

  vi.spyOn(app, 'use').mockImplementation((plugin: Plugin, ...options: unknown[]) => {
    serviceState.useCalls.push({ plugin })
    return originalUse(plugin, ...options)
  })
  vi.spyOn(app, 'directive').mockImplementation((name, directive) => {
    serviceState.directives.push({
      name,
      directive: directive as Directive,
    })
    return originalDirective(name, directive)
  })

  return app
}

describe('installPrimeVueServices', () => {
  beforeEach(() => {
    serviceState.useCalls = []
    serviceState.directives = []
  })

  it('registers PrimeVue services and tooltip by default', async () => {
    const { installPrimeVueServices } = await import('./services.js')
    const app = createInstrumentedApp()

    installPrimeVueServices(app)

    expect(serviceState.useCalls).toHaveLength(3)
    expect(serviceState.directives).toEqual([
      expect.objectContaining({
        name: 'tooltip',
      }),
    ])
  })

  it('supports disabling individual registrations', async () => {
    const { installPrimeVueServices } = await import('./services.js')
    const app = createInstrumentedApp()

    installPrimeVueServices(app, {
      toast: false,
      confirmation: false,
      dialog: true,
      tooltip: false,
    })

    expect(serviceState.useCalls).toHaveLength(1)
    expect(serviceState.directives).toHaveLength(0)
  })
})
