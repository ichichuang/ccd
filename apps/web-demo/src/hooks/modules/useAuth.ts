import { useUserStore, useUserStoreWithOut } from '@/stores/modules/session'
import { AUTH_ENABLED } from '@/constants/router'
import { requestAuthLogin, requestAuthCurrentUser } from '@/api/auth/auth.api'
import type { LoginParams, LoginResult, UserInfo } from '@/types/dto/auth.dto'
import { useSystemPreferencesSync } from '@/hooks/modules/useSystemPreferencesSync'
import {
  ErrorType,
  HttpRequestError,
  isHttpRequestError,
  isRetryableError,
} from '@/utils/http/errors'

const AUTH_RESTORE_ATTEMPT_TIMEOUT_MS = 5_000
const AUTH_RESTORE_RETRY_DELAYS_MS = [1_000, 2_000, 4_000] as const

type AuthRestoreFailureKind = 'terminal-auth' | 'permission' | 'transient' | 'non-retryable'

/**
 * 指令 / 非 setup 上下文可用的权限校验（与 composable `hasAuth` 逻辑一致，读 userStore SSOT）
 */
export function hasAuthCodes(auth: string | string[]): boolean {
  if (!AUTH_ENABLED) return true
  if (auth === '' || (Array.isArray(auth) && auth.length === 0)) return true

  const perms: string[] = useUserStoreWithOut().userInfo.permissions
  if (perms.includes('*:*:*')) return true
  const authList: string[] = Array.isArray(auth) ? auth : [auth]
  return authList.some((a: string) => perms.includes(a))
}

/**
 * 认证 composable
 * - 权限检查：hasRole / hasAuth / hasAllAuths
 * - 登录流程：login（调用 API → 写入 Store）
 * - 恢复登录：restoreLoginFromToken（调用 API → 写入 Store）
 *
 * 数据流：API → useAuth → Store → View（符合 §3.6 数据层规则）
 */
export interface UseAuthReturn {
  hasRole: (roles: string[]) => boolean
  hasAuth: (auth: string | string[]) => boolean
  hasAllAuths: (auths: string[]) => boolean
  login: (payload: LoginParams) => Promise<LoginResult>
  restoreLoginFromToken: () => Promise<UserInfo | null>
}

function classifyAuthRestoreError(error: unknown): AuthRestoreFailureKind {
  if (isHttpRequestError(error)) {
    if (error.status === 403) return 'permission'
    if (error.status === 401) return 'terminal-auth'
    if (isRetryableError(error)) return 'transient'
    return 'non-retryable'
  }

  return 'non-retryable'
}

function resolveAuthRestoreText(key: string, fallback: string): string {
  try {
    if (typeof $t === 'function') {
      const translated = $t(key)
      return translated && translated !== key ? translated : fallback
    }
  } catch {
    return fallback
  }
  return fallback
}

function showAuthRestoreMessage(kind: 'terminal-auth' | 'verification-failed'): void {
  if (typeof window === 'undefined') return

  const title = resolveAuthRestoreText('auth.restore.title', 'Session verification')
  const message =
    kind === 'terminal-auth'
      ? resolveAuthRestoreText(
          'auth.restore.sessionExpired',
          'Your session has expired. Please sign in again.'
        )
      : resolveAuthRestoreText(
          'auth.restore.verificationFailed',
          'Unable to verify your session while the service or network is unavailable. Please sign in again or retry later.'
        )

  if (window.$message?.warn) {
    window.$message.warn(message, title)
    return
  }

  if (window.$toast?.dangerIn) {
    window.$toast.dangerIn('top-center', title, message)
  }
}

function waitForAuthRestoreRetry(delayMs: number): Promise<void> {
  return new Promise(resolve => {
    const { start } = useTimeoutFn(resolve, delayMs, { immediate: false })
    start()
  })
}

function withAuthRestoreAttemptTimeout<T>(operation: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const { stop } = useTimeoutFn(() => {
      reject(
        new HttpRequestError(
          'Restore login timed out',
          ErrorType.TIMEOUT,
          undefined,
          undefined,
          undefined,
          true
        )
      )
    }, AUTH_RESTORE_ATTEMPT_TIMEOUT_MS)

    operation
      .then(value => {
        stop()
        resolve(value)
      })
      .catch(error => {
        stop()
        reject(error)
      })
  })
}

async function requestRestoredUserInfoWithPolicy(token: string): Promise<UserInfo> {
  for (let attempt = 0; attempt <= AUTH_RESTORE_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await withAuthRestoreAttemptTimeout(requestAuthCurrentUser(token))
    } catch (error) {
      const failureKind = classifyAuthRestoreError(error)
      const isLastAttempt = attempt === AUTH_RESTORE_RETRY_DELAYS_MS.length

      if (failureKind === 'permission' || failureKind === 'terminal-auth') {
        throw error
      }

      if (failureKind !== 'transient' || isLastAttempt) {
        throw error
      }

      await waitForAuthRestoreRetry(AUTH_RESTORE_RETRY_DELAYS_MS[attempt])
    }
  }

  throw new HttpRequestError(
    'Unable to verify session',
    ErrorType.UNKNOWN,
    undefined,
    undefined,
    undefined,
    false
  )
}

export function useAuth(): UseAuthReturn {
  const userStore = useUserStore()

  const syncUserPreferencesAfterAuth = (): void => {
    void useSystemPreferencesSync()
      .loadUserPreferences()
      .catch(error => {
        console.warn('[SystemPreferencesSync] Failed to load user preferences:', error)
      })
  }

  /** 检查用户是否拥有指定角色之一 */
  const hasRole = (roles: string[]): boolean => {
    if (!AUTH_ENABLED) return true
    return roles.some(r => userStore.userInfo.roles.includes(r))
  }

  /**
   * 检查用户是否拥有指定操作权限（支持 *:*:* 超级权限）
   * - 传入单个字符串：检查是否拥有该权限
   * - 传入数组：OR 逻辑，拥有其中任意一个即返回 true
   *
   * 使用 composable 内已有的 userStore，避免 hasAuthCodes 二次调用 useUserStoreWithOut()
   */
  const hasAuth = (auth: string | string[]): boolean => {
    if (!AUTH_ENABLED) return true
    if (auth === '' || (Array.isArray(auth) && auth.length === 0)) return true

    const perms: string[] = userStore.userInfo.permissions
    if (perms.includes('*:*:*')) return true
    const authList: string[] = Array.isArray(auth) ? auth : [auth]
    return authList.some((a: string) => perms.includes(a))
  }

  /**
   * 检查用户是否拥有所有指定操作权限（AND 逻辑，支持 *:*:* 超级权限）
   * - 用户必须同时拥有数组中的每一个权限才返回 true
   */
  const hasAllAuths = (auths: string[]): boolean => {
    if (!AUTH_ENABLED) return true
    const perms: string[] = userStore.userInfo.permissions
    if (perms.includes('*:*:*')) return true
    return auths.every((a: string) => perms.includes(a))
  }

  /**
   * 登录：调用 API 获取 token + 用户信息，写入 Store
   */
  const login = async (payload: LoginParams): Promise<LoginResult> => {
    const result: LoginResult = await requestAuthLogin(payload)
    await userStore.applyLoginResult(result)
    syncUserPreferencesAfterAuth()
    return result
  }

  /**
   * 根据已有 token 恢复登录状态（用于应用初始化）
   */
  const restoreLoginFromToken = async (): Promise<UserInfo | null> => {
    if (!AUTH_ENABLED) {
      return null
    }

    if (!userStore.token) {
      if (
        userStore.isLogin ||
        userStore.userInfo.userId ||
        userStore.userInfo.roles.length > 0 ||
        userStore.userInfo.permissions.length > 0
      ) {
        userStore.clearUserInfo()
        showAuthRestoreMessage('terminal-auth')
      }
      return null
    }

    try {
      const userInfo: UserInfo = await requestRestoredUserInfoWithPolicy(userStore.token)
      userStore.applyRestoredUserInfo(userInfo)
      syncUserPreferencesAfterAuth()
      return userInfo
    } catch (error) {
      const failureKind = classifyAuthRestoreError(error)
      if (failureKind === 'permission') {
        throw error
      }

      console.error('根据 token 恢复用户信息失败:', error)
      userStore.clearUserInfo()
      showAuthRestoreMessage(
        failureKind === 'terminal-auth' ? 'terminal-auth' : 'verification-failed'
      )
      return null
    }
  }

  return { hasRole, hasAuth, hasAllAuths, login, restoreLoginFromToken }
}
