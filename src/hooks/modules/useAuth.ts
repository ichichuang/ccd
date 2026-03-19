import { useUserStore } from '@/stores/modules/user'
import { AUTH_ENABLED } from '@/constants/router'
import { requestAuthLogin, requestAuthCurrentUser } from '@/api/auth/auth.api'
import type { LoginParams, LoginResult, UserInfo } from '@/types/dto/auth.dto'

/**
 * 认证 composable
 * - 权限检查：hasRole / hasAuth
 * - 登录流程：login（调用 API → 写入 Store）
 * - 恢复登录：restoreLoginFromToken（调用 API → 写入 Store）
 *
 * 数据流：API → useAuth → Store → View（符合 §3.6 数据层规则）
 */
export interface UseAuthReturn {
  hasRole: (roles: string[]) => boolean
  hasAuth: (auth: string) => boolean
  login: (payload: LoginParams) => Promise<LoginResult>
  restoreLoginFromToken: () => Promise<UserInfo | null>
}

export function useAuth(): UseAuthReturn {
  const userStore = useUserStore()

  /** 检查用户是否拥有指定角色之一 */
  const hasRole = (roles: string[]): boolean => {
    if (!AUTH_ENABLED) return true
    return roles.some(r => userStore.userInfo.roles.includes(r))
  }

  /** 检查用户是否拥有指定操作权限（支持 *:*:* 超级权限） */
  const hasAuth = (auth: string): boolean => {
    if (!AUTH_ENABLED) return true
    const perms: string[] = userStore.userInfo.permissions
    return perms.includes('*:*:*') || perms.includes(auth)
  }

  /**
   * 登录：调用 API 获取 token + 用户信息，写入 Store
   */
  const login = async (payload: LoginParams): Promise<LoginResult> => {
    const result: LoginResult = await requestAuthLogin(payload)
    await userStore.applyLoginResult(result)
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
      return userInfo
    } catch (error) {
      console.error('根据 token 恢复用户信息失败:', error)
      userStore.clearUserInfo()
      return null
    }
  }

  return { hasRole, hasAuth, login, restoreLoginFromToken }
}
