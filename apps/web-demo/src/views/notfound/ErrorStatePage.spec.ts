// @vitest-environment jsdom

import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'

const enMessages = {
  login: {
    submit: 'Sign in',
    passwordShow: 'Show password',
    passwordHide: 'Hide password',
  },
  router: {
    error: {
      title: 'Error',
      notFound: 'Page Not Found',
      forbidden: 'Forbidden',
      serverError: 'Server Error',
      backToHome: 'Back to Home',
      goBack: 'Go Back',
      signIn: 'Sign In',
      reload: 'Reload',
      forbiddenDesc: 'You do not have permission to access this resource.',
      notFoundDesc: 'The page you are looking for does not exist or has been moved.',
      serverErrorDesc: 'Something went wrong on our end. Please try again later.',
    },
  },
  common: {
    reload: 'Reload',
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

type UserState = { token: string; isLogin: boolean }

const userStoreState: UserState = { token: '', isLogin: false }

vi.mock('@/stores/modules/session/user', () => ({
  useUserStore: () => ({
    getIsLogin: userStoreState.isLogin,
    token: userStoreState.token,
    isLogin: userStoreState.isLogin,
  }),
  useUserStoreWithOut: () => ({
    userInfo: { permissions: [], roles: [], userId: '', username: '' },
  }),
}))
/* eslint-disable @typescript-eslint/naming-convention */
vi.mock('@/constants/router', () => ({ AUTH_ENABLED: true }))
vi.mock('@/constants/runtime', () => ({
  THEME_PRELOAD_STORAGE_KEYS: ['theme-mode', 'theme-primary'],
  PRO_FORM_STORAGE_PREFIXES: { schemaForm: 'schemaform:', draft: 'pro-form-draft:' },
}))
/* eslint-enable @typescript-eslint/naming-convention */

describe('ErrorStatePage', () => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  let ErrorStatePage: typeof import('./ErrorStatePage.vue').default
  let router: Router
  let i18n: ReturnType<typeof createI18n>

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()
    setActivePinia(createPinia())

    userStoreState.token = ''
    userStoreState.isLogin = false

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/dashboard', name: 'Dashboard', component: { template: '<div />' } },
        { path: '/login', name: 'Login', component: { template: '<div />' } },
      ],
    })

    // Reset window.location.reload mock
    Object.defineProperty(window, 'location', {
      value: { reload: vi.fn() },
      writable: true,
    })

    i18n = createI18n({
      legacy: false,
      locale: 'en-US',
      fallbackLocale: 'en-US',
      messages: { 'en-US': enMessages },
      missingWarn: false,
      fallbackWarn: false,
    })

    const mod = await import('./ErrorStatePage.vue')
    ErrorStatePage = mod.default
  })

  function mountErrorPage(code: 403 | 404 | 500) {
    return mount(ErrorStatePage, {
      global: {
        plugins: [i18n, PrimeVue, router],
        components: { Button },
        stubs: {
          Icons: {
            template: '<span class="icon-stub" :data-name="name" />',
            props: ['name', 'size'],
          },
        },
      },
      props: { code },
    })
  }

  describe('404 page', () => {
    it('shows correct title and description', () => {
      const wrapper = mountErrorPage(404)
      expect(wrapper.text()).toContain('404')
      expect(wrapper.text()).toContain('Page Not Found')
      expect(wrapper.text()).toContain(
        'The page you are looking for does not exist or has been moved.'
      )
    })

    it('shows correct icon', () => {
      const wrapper = mountErrorPage(404)
      expect(wrapper.find('[data-name="i-lucide-file-question"]').exists()).toBe(true)
    })

    it('Dashboard action is present', () => {
      const wrapper = mountErrorPage(404)
      expect(wrapper.text()).toContain('Back to Home')
    })

    it('has one h1 heading', () => {
      const wrapper = mountErrorPage(404)
      expect(wrapper.findAll('h1')).toHaveLength(1)
    })

    it('has accessible heading text', () => {
      const wrapper = mountErrorPage(404)
      const h1 = wrapper.find('h1')
      expect(h1.text()).toBeTruthy()
    })
  })

  describe('403 page', () => {
    it('shows correct title and description when unauthenticated', () => {
      userStoreState.isLogin = false
      const wrapper = mountErrorPage(403)
      expect(wrapper.text()).toContain('403')
      expect(wrapper.text()).toContain('Forbidden')
    })

    it('renders Dashboard action always', () => {
      const wrapper = mountErrorPage(403)
      expect(wrapper.text()).toContain('Back to Home')
    })

    it('shows correct icon', () => {
      const wrapper = mountErrorPage(403)
      expect(wrapper.find('[data-name="i-lucide-shield-x"]').exists()).toBe(true)
    })
  })

  describe('500 page', () => {
    it('shows correct title and description', () => {
      const wrapper = mountErrorPage(500)
      expect(wrapper.text()).toContain('500')
      expect(wrapper.text()).toContain('Server Error')
    })

    it('renders Dashboard action always', () => {
      const wrapper = mountErrorPage(500)
      expect(wrapper.text()).toContain('Back to Home')
    })

    it('renders Reload action', () => {
      const wrapper = mountErrorPage(500)
      expect(wrapper.text()).toContain('Reload')
    })

    it('shows correct icon', () => {
      const wrapper = mountErrorPage(500)
      expect(wrapper.find('[data-name="i-lucide-server-crash"]').exists()).toBe(true)
    })
  })
})
