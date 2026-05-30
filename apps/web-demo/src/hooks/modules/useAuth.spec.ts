// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ErrorType, HttpRequestError } from '@/utils/http/errors'
import type { UserInfo } from '@/types/dto/auth.dto'

const { authApiMock } = vi.hoisted(() => {
  const authErrorCodes = {
    invalidCredentials: 'AUTH_INVALID_CREDENTIALS',
    unknownUser: 'AUTH_UNKNOWN_USER',
    tokenMissing: 'AUTH_TOKEN_MISSING',
    tokenInvalid: 'AUTH_TOKEN_INVALID',
  } as const

  class AuthApiError extends Error {
    constructor(
      public readonly code: (typeof authErrorCodes)[keyof typeof authErrorCodes],
      message: string
    ) {
      super(message)
      this.name = 'AuthApiError'
    }
  }

  return {
    authApiMock: {
      authErrorCodes,
      AuthApiError,
      requestAuthLogin: vi.fn(),
      requestAuthCurrentUser: vi.fn(),
    },
  }
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
    serialize: (value: unknown) => JSON.stringify(value),
    deserialize: (value: string) => JSON.parse(value),
  }),
  removeLocalStorageKeysWhere: vi.fn(),
}))
vi.mock('@/hooks/modules/useSystemPreferencesSync', () => ({
  useSystemPreferencesSync: () => ({
    loadUserPreferences: vi.fn(() => Promise.resolve()),
  }),
}))
vi.mock('@/api/auth/auth.api', () =>
  Object.fromEntries([
    ['AUTH_ERROR_CODES', authApiMock.authErrorCodes],
    ['AuthApiError', authApiMock.AuthApiError],
    ['requestAuthLogin', authApiMock.requestAuthLogin],
    ['requestAuthCurrentUser', authApiMock.requestAuthCurrentUser],
  ])
)

const baseUserInfo = (overrides: Partial<UserInfo> = {}): UserInfo => ({
  userId: '1',
  username: 'admin',
  roles: ['admin'],
  permissions: ['*:*:*'],
  avatar: undefined,
  email: undefined,
  phone: undefined,
  ...overrides,
})

const serverError = () =>
  new HttpRequestError('service unavailable', ErrorType.SERVER, 503, 'Service Unavailable')

const networkError = () =>
  new HttpRequestError(
    'network unavailable',
    ErrorType.NETWORK,
    undefined,
    undefined,
    undefined,
    true
  )

async function loadAuthModules() {
  const authModule = await import('./useAuth')
  const userModule = await import('@/stores/modules/session/user')
  return {
    useAuth: authModule.useAuth,
    useUserStore: userModule.useUserStore,
  }
}

function installNotificationSpy() {
  const warn = vi.fn()
  window.$message = {
    success: vi.fn(),
    danger: vi.fn(),
    info: vi.fn(),
    warn,
  }
  return warn
}

describe('useAuth restoreLoginFromToken HTTP-007 policy', () => {
  beforeEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    authApiMock.requestAuthLogin.mockReset()
    authApiMock.requestAuthCurrentUser.mockReset()
    setActivePinia(createPinia())
    delete window.$message
    delete window.$toast
  })

  it('clears stale login state without API calls when the token is missing', async () => {
    const warn = installNotificationSpy()
    const { useAuth, useUserStore } = await loadAuthModules()
    const userStore = useUserStore()
    userStore.isLogin = true
    userStore.userInfo = baseUserInfo()

    await expect(useAuth().restoreLoginFromToken()).resolves.toBeNull()

    expect(authApiMock.requestAuthCurrentUser).not.toHaveBeenCalled()
    expect(userStore.isLogin).toBe(false)
    expect(userStore.token).toBe('')
    expect(userStore.userInfo.permissions).toEqual([])
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('does not retry invalid token failures and clears the session immediately', async () => {
    const warn = installNotificationSpy()
    const { useAuth, useUserStore } = await loadAuthModules()
    const userStore = useUserStore()
    userStore.token = 'invalid-token'
    userStore.isLogin = true
    userStore.userInfo = baseUserInfo()
    authApiMock.requestAuthCurrentUser.mockRejectedValue(
      new authApiMock.AuthApiError(authApiMock.authErrorCodes.tokenInvalid, 'invalid token')
    )

    await expect(useAuth().restoreLoginFromToken()).resolves.toBeNull()

    expect(authApiMock.requestAuthCurrentUser).toHaveBeenCalledTimes(1)
    expect(userStore.isLogin).toBe(false)
    expect(userStore.token).toBe('')
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0].join(' ')).not.toContain('invalid-token')
  })

  it('does not retry 403 permission failures or treat them as token-expired logout', async () => {
    const warn = installNotificationSpy()
    const { useAuth, useUserStore } = await loadAuthModules()
    const userStore = useUserStore()
    userStore.token = 'mock-token-1'
    userStore.isLogin = true
    userStore.userInfo = baseUserInfo()
    const forbidden = new HttpRequestError('forbidden', ErrorType.AUTH, 403, 'Forbidden')
    authApiMock.requestAuthCurrentUser.mockRejectedValue(forbidden)

    await expect(useAuth().restoreLoginFromToken()).rejects.toBe(forbidden)

    expect(authApiMock.requestAuthCurrentUser).toHaveBeenCalledTimes(1)
    expect(userStore.isLogin).toBe(true)
    expect(userStore.token).toBe('mock-token-1')
    expect(warn).not.toHaveBeenCalled()
  })

  it('retries transient 5xx restore failures and stops after a successful retry', async () => {
    vi.useFakeTimers()
    const warn = installNotificationSpy()
    const restored = baseUserInfo({ username: 'restored-admin' })
    const { useAuth, useUserStore } = await loadAuthModules()
    const userStore = useUserStore()
    userStore.token = 'mock-token-1'
    userStore.isLogin = true
    userStore.userInfo = baseUserInfo()
    authApiMock.requestAuthCurrentUser
      .mockRejectedValueOnce(serverError())
      .mockRejectedValueOnce(serverError())
      .mockResolvedValueOnce(restored)

    const restorePromise = useAuth().restoreLoginFromToken()
    await vi.advanceTimersByTimeAsync(3_000)

    await expect(restorePromise).resolves.toEqual(restored)
    expect(authApiMock.requestAuthCurrentUser).toHaveBeenCalledTimes(3)
    expect(userStore.userInfo.username).toBe('restored-admin')
    expect(userStore.isLogin).toBe(true)
    expect(warn).not.toHaveBeenCalled()
  })

  it('stops a transient retry sequence when a later failure becomes 401 terminal auth', async () => {
    vi.useFakeTimers()
    const warn = installNotificationSpy()
    const { useAuth, useUserStore } = await loadAuthModules()
    const userStore = useUserStore()
    userStore.token = 'mock-token-1'
    userStore.isLogin = true
    userStore.userInfo = baseUserInfo()
    authApiMock.requestAuthCurrentUser
      .mockRejectedValueOnce(networkError())
      .mockRejectedValueOnce(
        new HttpRequestError('unauthorized', ErrorType.AUTH, 401, 'Unauthorized')
      )

    const restorePromise = useAuth().restoreLoginFromToken()
    await vi.advanceTimersByTimeAsync(1_000)

    await expect(restorePromise).resolves.toBeNull()
    expect(authApiMock.requestAuthCurrentUser).toHaveBeenCalledTimes(2)
    expect(userStore.isLogin).toBe(false)
    expect(userStore.token).toBe('')
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('fails closed after network retry exhaustion and emits one non-sensitive message', async () => {
    vi.useFakeTimers()
    const warn = installNotificationSpy()
    const { useAuth, useUserStore } = await loadAuthModules()
    const userStore = useUserStore()
    userStore.token = 'mock-token-1'
    userStore.isLogin = true
    userStore.userInfo = baseUserInfo()
    authApiMock.requestAuthCurrentUser.mockRejectedValue(networkError())

    const restorePromise = useAuth().restoreLoginFromToken()
    await vi.advanceTimersByTimeAsync(7_000)

    await expect(restorePromise).resolves.toBeNull()
    expect(authApiMock.requestAuthCurrentUser).toHaveBeenCalledTimes(4)
    expect(userStore.isLogin).toBe(false)
    expect(userStore.token).toBe('')
    expect(userStore.userInfo.permissions).toEqual([])
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0].join(' ')).not.toContain('mock-token-1')
  })

  it('uses a 5000ms per-attempt timeout and fails closed when all attempts time out', async () => {
    vi.useFakeTimers()
    const warn = installNotificationSpy()
    const { useAuth, useUserStore } = await loadAuthModules()
    const userStore = useUserStore()
    userStore.token = 'mock-token-1'
    userStore.isLogin = true
    userStore.userInfo = baseUserInfo()
    authApiMock.requestAuthCurrentUser.mockImplementation(() => new Promise(() => undefined))

    const restorePromise = useAuth().restoreLoginFromToken()
    let resolved: UserInfo | null | 'pending' = 'pending'
    void restorePromise.then(value => {
      resolved = value
    })

    await vi.advanceTimersByTimeAsync(27_000)

    expect(resolved).toBeNull()
    expect(authApiMock.requestAuthCurrentUser).toHaveBeenCalledTimes(4)
    expect(userStore.isLogin).toBe(false)
    expect(userStore.token).toBe('')
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('keeps offline read-only startup blocked by clearing unverified protected state', async () => {
    vi.useFakeTimers()
    const { useAuth, useUserStore } = await loadAuthModules()
    const userStore = useUserStore()
    userStore.token = 'mock-token-1'
    userStore.isLogin = true
    userStore.userInfo = baseUserInfo()
    authApiMock.requestAuthCurrentUser.mockRejectedValue(networkError())

    const restorePromise = useAuth().restoreLoginFromToken()
    await vi.advanceTimersByTimeAsync(7_000)

    await expect(restorePromise).resolves.toBeNull()
    expect(userStore.isLogin).toBe(false)
    expect(userStore.userInfo.roles).toEqual([])
    expect(userStore.userInfo.permissions).toEqual([])
  })
})
