// @vitest-environment jsdom

import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'

const enMessages = {
  router: {
    error: {
      title: 'Error',
      backToHome: 'Back to Home',
      notFound: 'Page Not Found',
    },
  },
}

vi.mock('@/stores', async () => {
  const pinia = await import('pinia')
  return { default: pinia.createPinia() }
})
vi.mock('@/stores/modules/system/theme', () => ({
  useThemeStore: () => ({ resetState: vi.fn() }),
}))
vi.mock('@/stores/modules/system/size', () => ({
  useSizeStore: () => ({ resetState: vi.fn() }),
}))
vi.mock('@/stores/modules/system/locale', () => ({
  useLocaleStore: () => ({ resetState: vi.fn() }),
}))
vi.mock('@/stores/modules/system/layout', () => ({
  useLayoutStore: () => ({ resetState: vi.fn() }),
}))
vi.mock('@/stores/modules/session/permission', () => ({
  usePermissionStore: () => ({ reset: vi.fn() }),
}))
vi.mock('@/utils/safeStorage', () => ({
  createPiniaEncryptedSerializer: () => ({
    serialize: (v: unknown) => JSON.stringify(v),
    deserialize: (v: string) => JSON.parse(v),
  }),
  removeLocalStorageKeysWhere: vi.fn(),
}))
/* eslint-disable @typescript-eslint/naming-convention */
vi.mock('@/constants/router', () => ({ AUTH_ENABLED: true }))
vi.mock('@/constants/runtime', () => ({
  THEME_PRELOAD_STORAGE_KEYS: ['theme-mode', 'theme-primary'],
  PRO_FORM_STORAGE_PREFIXES: { schemaForm: 'schemaform:', draft: 'pro-form-draft:' },
}))
/* eslint-enable @typescript-eslint/naming-convention */

describe('ConsolePage', () => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  let ConsolePage: typeof import('./ConsolePage.vue').default
  let i18n: ReturnType<typeof createI18n>
  let router: ReturnType<typeof createRouter>

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()

    i18n = createI18n({
      legacy: false,
      locale: 'en-US',
      fallbackLocale: 'en-US',
      messages: { 'en-US': enMessages },
      missingWarn: false,
      fallbackWarn: false,
    })

    router = createRouter({
      history: createWebHashHistory(),
      routes: [
        { path: '/dashboard', name: 'Dashboard', component: { template: '<div>Dashboard</div>' } },
      ],
    })

    const mod = await import('./ConsolePage.vue')
    ConsolePage = mod.default
  })

  it('renders missing-model state for undefined page model', async () => {
    const wrapper = mount(ConsolePage, {
      global: {
        plugins: [i18n, PrimeVue, router],
        components: { Button },
        stubs: {
          Icons: {
            template: '<span class="icon-stub" />',
            props: ['name', 'size'],
          },
        },
      },
    })

    await router.isReady()

    // Since the route name is undefined, the getConsolePage returns undefined
    // The template should render the missing-model state
    expect(wrapper.text()).toContain('Error')
    // Should not expose raw route object
    const html = wrapper.html()
    expect(html).not.toContain('[object Object]')
    expect(html).not.toContain('stack')
    expect(html).not.toContain('StackTrace')
  })

  it('renders missing-model state with sanitized route name', async () => {
    // Push to a route that exists but has no model
    router.replace({ name: 'Dashboard' })
    await router.isReady()

    const wrapper = mount(ConsolePage, {
      global: {
        plugins: [i18n, PrimeVue, router],
        components: { Button },
        stubs: {
          Icons: {
            template: '<span class="icon-stub" />',
            props: ['name', 'size'],
          },
          ArchitecturePageShell: {
            template:
              '<div class="architecture-page-shell-stub"><slot /><slot name="status" /></div>',
          },
          StatusBadgeRow: {
            template: '<div class="status-badge-stub" />',
            props: ['items'],
          },
          CapabilityCard: {
            template: '<div class="capability-card-stub" />',
            props: ['item'],
          },
        },
      },
    })

    await router.isReady()
    // Dashboard is not a ConsolePage-backed route, so model should be undefined
    // Missing-model state shows the route name
    expect(wrapper.text()).toContain('Error')
    expect(wrapper.text()).toContain('Dashboard')
  })
})
