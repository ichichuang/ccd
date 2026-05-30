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

describe('PrimeVue global shell helpers', () => {
  it('maps toast positions and danger severity through the adapter API', async () => {
    const { createPrimeVueToastApi } = await import('./services.js')
    const calls: unknown[] = []
    const toast = {
      add: vi.fn(options => calls.push(options)),
      remove: vi.fn(),
      removeGroup: vi.fn(),
      removeAllGroups: vi.fn(),
    }

    const api = createPrimeVueToastApi(toast)
    api.add({ severity: 'danger', summary: 'Danger' })
    api.successIn('top-right', 'Saved')
    api.clear()

    expect(calls).toEqual([
      { severity: 'error', summary: 'Danger' },
      {
        severity: 'success',
        summary: 'Saved',
        detail: '',
        life: 3000,
        group: 'tr',
      },
    ])
    expect(toast.removeAllGroups).toHaveBeenCalledOnce()
  })

  it('creates Element-style message helpers on the top-center toast group', async () => {
    const { createPrimeVueMessageApi } = await import('./services.js')
    const toast = {
      add: vi.fn(),
      remove: vi.fn(),
      removeGroup: vi.fn(),
    }

    createPrimeVueMessageApi(toast).danger('Failed', 'Upload')

    expect(toast.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Upload',
      detail: 'Failed',
      life: 3000,
      group: 'tc',
      closable: false,
    })
  })

  it('applies locale with a fallback', async () => {
    const { applyPrimeVueLocale } = await import('./services.js')
    const primevue: { config: { locale?: { ok: boolean } } } = { config: {} }

    applyPrimeVueLocale(primevue, 'en-US', { 'zh-CN': { ok: true } }, 'zh-CN')

    expect(primevue.config.locale).toEqual({ ok: true })
  })
})
