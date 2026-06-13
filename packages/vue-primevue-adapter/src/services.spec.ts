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
  primevueConfig: { config: {} as { locale?: unknown } },
  confirmService: {
    close: vi.fn(),
    require: vi.fn(),
  },
  toastService: {
    add: vi.fn(),
    remove: vi.fn(),
    removeGroup: vi.fn(),
    removeAllGroups: vi.fn(),
  },
  useCalls: [] as UseCall[],
}))

vi.mock('primevue/toastservice', () => ({
  default: { install: vi.fn() },
}))

vi.mock('primevue/config', () => ({
  default: { install: vi.fn() },
  usePrimeVue: vi.fn(() => serviceState.primevueConfig),
}))

vi.mock('primevue/toast', () => ({
  default: { name: 'PrimeVueToastMock' },
}))

vi.mock('primevue/confirmpopup', () => ({
  default: { name: 'PrimeVueConfirmPopupMock' },
}))

vi.mock('primevue/dynamicdialog', () => ({
  default: { name: 'PrimeVueDynamicDialogMock' },
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

vi.mock('primevue/usetoast', () => ({
  useToast: vi.fn(() => serviceState.toastService),
}))

vi.mock('primevue/useconfirm', () => ({
  useConfirm: vi.fn(() => serviceState.confirmService),
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

describe('installPrimeVueRuntime', () => {
  beforeEach(() => {
    serviceState.useCalls = []
    serviceState.directives = []
  })

  it('creates the PrimeVue theme, PassThrough, and runtime config inside the adapter', async () => {
    const { createPrimeVueAdapterConfig } = await import('./index.js')
    const locale = {
      accept: 'OK',
      dayNames: ['Sunday'],
      dayNamesShort: ['Sun'],
      dayNamesMin: ['S'],
      fileSizeTypes: ['B'],
      monthNames: ['January'],
      monthNamesShort: ['Jan'],
    }

    const config = createPrimeVueAdapterConfig({
      sizeSource: {
        sizeName: 'comfortable',
      },
      locale,
    })

    expect(config).toMatchObject({
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
      locale,
    })
    expect(config.pt).toHaveProperty('button')
    expect(config.pt).toHaveProperty('drawer')
    expect(config.pt).toHaveProperty('inputtext')
    expect(config.pt).toHaveProperty('menu')

    const passThroughClasses = JSON.stringify(config.pt)
    expect(passThroughClasses).toContain('[will-change:auto]')
    expect(passThroughClasses).not.toContain('glass-shell')
    expect(passThroughClasses).not.toContain('backdrop-blur')
    expect(passThroughClasses).not.toContain('will-change-transform')
  })

  it('installs PrimeVue config before services', async () => {
    const { installPrimeVueRuntime } = await import('./index.js')
    const app = createInstrumentedApp()

    installPrimeVueRuntime(app, {
      sizeSource: {
        sizeName: 'comfortable',
      },
    })

    expect(serviceState.useCalls).toHaveLength(4)
    expect(serviceState.directives).toEqual([
      expect.objectContaining({
        name: 'tooltip',
      }),
    ])
  })

  it('can install PrimeVue config without services', async () => {
    const { installPrimeVueRuntime } = await import('./index.js')
    const app = createInstrumentedApp()

    installPrimeVueRuntime(app, {
      sizeSource: {
        sizeName: 'comfortable',
      },
      services: false,
    })

    expect(serviceState.useCalls).toHaveLength(1)
    expect(serviceState.directives).toHaveLength(0)
  })
})

describe('PrimeVue global shell helpers', () => {
  beforeEach(() => {
    serviceState.primevueConfig = { config: {} }
    serviceState.confirmService.close.mockClear()
    serviceState.confirmService.require.mockClear()
    serviceState.toastService.add.mockClear()
    serviceState.toastService.remove.mockClear()
    serviceState.toastService.removeGroup.mockClear()
    serviceState.toastService.removeAllGroups.mockClear()
  })

  it('exposes PrimeVue global shell components behind adapter facades', async () => {
    const services = await import('./services.js')

    expect(services.PrimeVueGlobalToast).toEqual({ name: 'PrimeVueToastMock' })
    expect(services.PrimeVueGlobalConfirmPopup).toEqual({ name: 'PrimeVueConfirmPopupMock' })
    expect(services.PrimeVueGlobalDynamicDialog).toEqual({ name: 'PrimeVueDynamicDialogMock' })
  })

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

  it('mounts and clears global toast/message APIs on the host target', async () => {
    const { clearPrimeVueGlobalMessageApis, mountPrimeVueGlobalMessageApis } =
      await import('./services.js')
    const target: { $toast?: unknown; $message?: unknown } = {}
    const toast = {
      add: vi.fn(),
      remove: vi.fn(),
      removeGroup: vi.fn(),
      removeAllGroups: vi.fn(),
    }

    mountPrimeVueGlobalMessageApis(target, toast)

    expect(target.$toast).toEqual(
      expect.objectContaining({
        dangerIn: expect.any(Function),
        successIn: expect.any(Function),
        clear: expect.any(Function),
      })
    )
    expect(target.$message).toEqual(
      expect.objectContaining({
        success: expect.any(Function),
        danger: expect.any(Function),
      })
    )

    clearPrimeVueGlobalMessageApis(target)

    expect(target.$toast).toBeUndefined()
    expect(target.$message).toBeUndefined()
  })

  it('wraps runtime composables and toast cleanup behind adapter APIs', async () => {
    const {
      applyPrimeVueLocale,
      clearPrimeVueToastGroups,
      usePrimeVueConfirmService,
      usePrimeVueRuntimeConfig,
      usePrimeVueToastService,
    } = await import('./services.js')

    const confirm = usePrimeVueConfirmService()
    const runtimeConfig = usePrimeVueRuntimeConfig<{ ok: boolean }>()
    const toast = usePrimeVueToastService()

    confirm.close()
    applyPrimeVueLocale(runtimeConfig, 'en-US', { 'zh-CN': { ok: true } }, 'zh-CN')
    clearPrimeVueToastGroups(toast)

    expect(serviceState.confirmService.close).toHaveBeenCalledOnce()
    expect(runtimeConfig.config.locale).toEqual({ ok: true })
    expect(serviceState.toastService.removeAllGroups).toHaveBeenCalledOnce()
  })

  it('applies locale with a fallback', async () => {
    const { applyPrimeVueLocale } = await import('./services.js')
    const primevue: { config: { locale?: { ok: boolean } } } = { config: {} }

    applyPrimeVueLocale(primevue, 'en-US', { 'zh-CN': { ok: true } }, 'zh-CN')

    expect(primevue.config.locale).toEqual({ ok: true })
  })
})
