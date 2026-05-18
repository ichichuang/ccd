import { useUserStore, useUserStoreWithOut } from '@/stores/modules/session'
import { AUTH_ENABLED } from '@/constants/router'
import { requestAuthLogin, requestAuthCurrentUser } from '@/api/auth/auth.api'
import type { LoginParams, LoginResult, UserInfo } from '@/types/dto/auth.dto'
import { useSystemPreferencesSync } from '@/hooks/modules/useSystemPreferencesSync'

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
    if (!AUTH_ENABLED || !userStore.token) {
      return null
    }
    try {
      const userInfo: UserInfo = await requestAuthCurrentUser(userStore.token)
      userStore.applyRestoredUserInfo(userInfo)
      syncUserPreferencesAfterAuth()
      return userInfo
    } catch (error) {
      console.error('根据 token 恢复用户信息失败:', error)
      userStore.clearUserInfo()
      return null
    }
  }

  return { hasRole, hasAuth, hasAllAuths, login, restoreLoginFromToken }
}
