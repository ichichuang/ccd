// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import type { UserInfo } from '@/types/dto/auth.dto'

const baseUserInfo = (overrides: Partial<UserInfo> = {}): UserInfo => ({
  userId: '1',
  username: 'test',
  roles: [],
  permissions: [],
  avatar: undefined,
  email: undefined,
  phone: undefined,
  ...overrides,
})

vi.mock('@/constants/router', () => Object.fromEntries([['AUTH_ENABLED', true]]))
vi.mock('@/constants/runtime', () =>
  Object.fromEntries([
    ['THEME_PRELOAD_STORAGE_KEYS', ['theme-mode', 'theme-primary']],
    ['PRO_FORM_STORAGE_PREFIXES', { schemaForm: 'schemaform:', draft: 'pro-form-draft:' }],
  ])
)
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
vi.mock('@/utils/safeStorage/piniaSerializer', () => ({
  createPiniaEncryptedSerializer: () => ({
    serialize: (v: unknown) => JSON.stringify(v),
    deserialize: (v: string) => JSON.parse(v),
  }),
}))

describe('useUserStore', () => {
  let useUserStore: typeof import('./user').useUserStore

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()
    setActivePinia(createPinia())
    const mod = await import('./user')
    useUserStore = mod.useUserStore
  })

  describe('setUserInfo — avatar sanitization', () => {
    it('strips avatar starting with /src/', () => {
      const store = useUserStore()
      store.setUserInfo(baseUserInfo({ avatar: '/src/assets/avatar.png' }))

      expect(store.userInfo.avatar).toBeUndefined()
    })

    it('preserves valid API avatar path', () => {
      const store = useUserStore()
      store.setUserInfo(baseUserInfo({ avatar: 'https://cdn.example.com/avatar.jpg' }))

      expect(store.userInfo.avatar).toBe('https://cdn.example.com/avatar.jpg')
    })

    it('preserves undefined avatar', () => {
      const store = useUserStore()
      store.setUserInfo(baseUserInfo({ avatar: undefined }))

      expect(store.userInfo.avatar).toBeUndefined()
    })
  })

  describe('clearUserInfo', () => {
    it('resets token, userInfo, and isLogin', () => {
      const store = useUserStore()
      store.token = 'test-token'
      store.isLogin = true

      store.clearUserInfo()

      expect(store.token).toBe('')
      expect(store.isLogin).toBe(false)
      expect(store.userInfo.userId).toBe('')
    })
  })

  describe('state transitions', () => {
    it('setUserInfo sets isLogin to true', () => {
      const store = useUserStore()
      expect(store.isLogin).toBe(false)

      store.setUserInfo(baseUserInfo({ roles: ['admin'], permissions: ['read'] }))

      expect(store.isLogin).toBe(true)
      expect(store.userInfo.username).toBe('test')
    })

    it('setToken updates token', () => {
      const store = useUserStore()
      store.setToken('new-token')
      expect(store.token).toBe('new-token')
    })
  })

  describe('logout cascade', () => {
    it('clears user state and calls removeLocalStorageKeysWhere', async () => {
      const { removeLocalStorageKeysWhere } = await import('@/utils/safeStorage')
      const store = useUserStore()
      store.token = 'test-token'
      store.isLogin = true

      await store.logout()

      expect(store.token).toBe('')
      expect(store.isLogin).toBe(false)
      expect(removeLocalStorageKeysWhere).toHaveBeenCalled()
    })
  })
})
