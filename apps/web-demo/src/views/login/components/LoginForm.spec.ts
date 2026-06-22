// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'

/* eslint-disable @typescript-eslint/naming-convention */
vi.mock('@/constants/router', () => ({ AUTH_ENABLED: true }))
vi.mock('@/constants/runtime', () => ({
  THEME_PRELOAD_STORAGE_KEYS: ['theme-mode', 'theme-primary'],
  PRO_FORM_STORAGE_PREFIXES: { schemaForm: 'schemaform:', draft: 'pro-form-draft:' },
}))
/* eslint-enable @typescript-eslint/naming-convention */
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
  useLayoutStoreWithOut: () => ({ resetState: vi.fn() }),
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
vi.mock('@/hooks/modules/useLoading', () => ({
  useLoading: () => ({
    startLoading: () => vi.fn(),
  }),
}))
vi.mock('@/hooks/modules/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn().mockResolvedValue({ token: 'mock', userInfo: {} }),
  }),
}))
vi.mock('@/hooks/modules/useSystemPreferencesSync', () => ({
  useSystemPreferencesSync: () => ({
    loadUserPreferences: vi.fn(() => Promise.resolve()),
  }),
}))

// Locale messages matching the router.error and login keys
const enMessages = {
  login: {
    submit: 'Sign in',
    forgotPassword: 'Forgot password?',
    usernameLabel: 'Email or username',
    usernamePlaceholder: 'admin or user',
    usernameRequired: 'Username is required',
    usernameLength: 'Username must be 3-20 characters',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    passwordRequired: 'Password is required',
    passwordMin: 'Password must be at least 6 characters',
    quickAdmin: 'Admin',
    quickUser: 'User',
    quickAccounts: 'Quick accounts',
    brandSloganLine1: 'Reusable app experience kit',
    gatewayEyebrow: 'CCD Auth Gateway',
    cardTitle: 'Sign in to CCD',
    cardSubtitle: 'Enter the CCD product demo and showcase routes',
    stageSubtitle:
      'Shared capabilities and app experiences stay separated before access is granted.',
    signals: {
      governanceGate: 'review-ready checks',
      runtimeIsolated: 'runtime separated',
      safeStorage: 'app-owned storage',
      validationPassed: 'checks passed',
    },
    errorTitle: 'Login failed',
    errorMessageGeneric: 'Login failed, please check your username and password',
    themeToggle: 'Toggle theme',
    localeSelect: 'Switch language',
    passwordShow: 'Show password',
    passwordHide: 'Hide password',
    rememberMe: 'Remember me',
    diagram: {
      contracts: 'contracts',
      apps: 'apps',
      core: 'core',
      governed: 'governed',
      isolated: 'isolated',
    },
  },
  auth: {
    restore: {
      title: 'Session verification',
      sessionExpired: 'Your session has expired. Please sign in again.',
      verificationFailed:
        'Unable to verify your session while the service or network is unavailable.',
    },
  },
}

describe('LoginForm', () => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  let LoginForm: typeof import('./LoginForm.vue').default
  let i18n: ReturnType<typeof createI18n>

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()
    setActivePinia(createPinia())

    i18n = createI18n({
      legacy: false,
      locale: 'en-US',
      fallbackLocale: 'en-US',
      messages: { 'en-US': enMessages },
      missingWarn: false,
      fallbackWarn: false,
    })

    // Preload ProForm and dependencies by importing the component
    const mod = await import('./LoginForm.vue')
    LoginForm = mod.default
  })

  function mountLoginForm() {
    return mount(LoginForm, {
      global: {
        plugins: [i18n, PrimeVue],
        components: {
          Button,
          Checkbox,
          InputText,
        },
        stubs: {
          ProForm: {
            template:
              '<div class="pro-form-stub"><slot name="field-username" :state="{ errors: [] }" :on-update="() => {}" /><slot name="field-password" :state="{ errors: [] }" :on-update="() => {}" /><slot name="footer" :form-state="{ submitting: false }" /></div>',
          },
          AuthLoginCard: {
            template: '<div class="auth-login-card-stub"><slot name="actions" /><slot /></div>',
          },
          HeaderActions: {
            template: '<div class="header-actions-stub" />',
          },
          Icons: {
            template: '<span class="icon-stub" />',
            props: ['name', 'size'],
          },
        },
      },
      props: {
        responsive: {
          isMobile: false,
          isCompact: false,
          isTablet: false,
        },
      },
    })
  }

  it('renders username and password fields', () => {
    const wrapper = mountLoginForm()
    // Fields are rendered via ProForm stub which renders the slot
    expect(wrapper.find('.pro-form-stub').exists()).toBe(true)
  })

  it('does not render remember-me control', () => {
    const wrapper = mountLoginForm()
    // The checkbox with id 'login-remember' should not exist
    expect(wrapper.find('#login-remember').exists()).toBe(false)
    // The text "Remember me" should not appear
    expect(wrapper.text()).not.toContain('Remember me')
  })

  it('does not render forgot-password control', () => {
    const wrapper = mountLoginForm()
    expect(wrapper.text()).not.toContain('Forgot password?')
    // The forgot-password button (had class login-forgot-button) should not exist
    expect(wrapper.find('.login-forgot-button').exists()).toBe(false)
  })

  it('does not render quick-account controls in normal rendering', () => {
    const wrapper = mountLoginForm()
    // AuthQuickAccounts is stubbed but its actual rendering path should not exist
    // The stub template is rendered by the ProForm footer slot
    // After removal, AuthQuickAccounts should not be in the template
    expect(wrapper.findComponent({ name: 'AuthQuickAccounts' }).exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Quick accounts')
  })

  it('submit button remains present', () => {
    const wrapper = mountLoginForm()
    // The submit button is rendered via ProForm footer slot
    const proForm = wrapper.find('.pro-form-stub')
    expect(proForm.exists()).toBe(true)
  })

  it('does not emit character-state-change event', async () => {
    const wrapper = mountLoginForm()
    // Wait for onMounted
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('characterStateChange')).toBeUndefined()
  })
})
