import store from '@/stores'
import { AUTH_ENABLED } from '@/constants/router'
import { useLayoutStore } from '@/stores/modules/layout'
import { usePermissionStore } from '@/stores/modules/permission'
import { createPiniaEncryptedSerializer } from '@/utils/safeStorage/piniaSerializer'
import { encryptAndCompressSync } from '@/utils/safeStorage/safeStorage'
import { defineStore } from 'pinia'
import type { LoginResult, UserInfo } from '@/types/dto/auth.dto'

interface UserState {
  token: string
  safeStorageToken: string
  userInfo: UserInfo
  isLogin: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: '',
    safeStorageToken: '',
    userInfo: {
      userId: '', // 用户ID
      username: '', // 用户名
      roles: [], // 用户角色
      permissions: [], // 用户权限
      avatar: undefined, // 用户头像
      email: undefined, // 用户邮箱
      phone: undefined, // 用户手机号
    },
    isLogin: false, // 是否登录
  }),

  getters: {
    getToken: (state: UserState) => state.token,
    getSafeStorageToken: (state: UserState) => state.safeStorageToken,
    getUserInfo: (state: UserState) => state.userInfo,
    // 获取页面权限
    getUserRoles: (state: UserState) => state.userInfo.roles,
    // 获取按钮权限
    getUserPermissions: (state: UserState) => state.userInfo.permissions,
    getIsLogin: (state: UserState) => state.isLogin,
  },

  actions: {
    /**
     * 写入登录结果（token + 用户信息）
     * API 调用由 useAuth composable 负责，Store 仅做状态写入
     */
    async applyLoginResult(result: LoginResult) {
      if (!AUTH_ENABLED) {
        return
      }
      await this.setToken(result.token)
      this.setUserInfo(result.userInfo)
    },

    /**
     * 根据已获取的用户信息恢复登录状态
     * API 调用由 useAuth composable 负责，Store 仅做状态写入
     */
    applyRestoredUserInfo(userInfo: UserInfo) {
      if (!AUTH_ENABLED) {
        return
      }
      this.setUserInfo(userInfo)
    },

    async setToken(token: string) {
      // 未启用登录/鉴权模式时，跳过一切登录相关逻辑
      if (!AUTH_ENABLED) {
        return
      }
      this.token = token
      this.safeStorageToken = encryptAndCompressSync(token, import.meta.env.VITE_APP_SECRET)
    },
    setUserInfo(userInfo: UserInfo) {
      if (!AUTH_ENABLED) {
        return
      }
      // 过滤 /src/ 开头的无效 avatar 路径，生产构建后该路径不存在，避免 404
      const sanitized: UserInfo = { ...userInfo }
      if (typeof sanitized.avatar === 'string' && sanitized.avatar.startsWith('/src/')) {
        sanitized.avatar = undefined
      }
      this.userInfo = sanitized
      this.isLogin = true
    },
    clearUserInfo() {
      if (!AUTH_ENABLED) {
        return
      }
      this.token = ''
      this.safeStorageToken = ''
      this.userInfo = {
        userId: '',
        username: '',
        roles: [],
        permissions: [],
        avatar: undefined,
        email: undefined,
        phone: undefined,
      }
      this.isLogin = false
    },
    /**
     * 仅做状态清理，不包含 UI 副作用或导航。
     * 刷新/跳转由调用方负责（如 main.ts 的 setOnUnauthorized、User 组件的退出按钮、路由守卫）。
     */
    async logout() {
      if (!AUTH_ENABLED) {
        return
      }
      this.clearUserInfo()
      useLayoutStore(store).resetSetting()
      usePermissionStore(store).reset()
      const basePrefix = `${import.meta.env.VITE_PINIA_PERSIST_KEY_PREFIX}-`
      const prefixKeys: string[] = [basePrefix, 'schemaform:']
      const exactKeys: string[] = ['theme-mode']

      const shouldRemove = (key: string): boolean => {
        if (exactKeys.includes(key)) return true
        return prefixKeys.some(prefix => key.startsWith(prefix))
      }

      const keysToRemove = new Set<string>()

      for (let i = localStorage.length - 1; i >= 0; i -= 1) {
        const key = localStorage.key(i)
        if (!key) {
          continue
        }
        if (shouldRemove(key)) {
          keysToRemove.add(key)
        }
      }

      for (const key of keysToRemove) {
        localStorage.removeItem(key)
      }
    },
  },

  persist: {
    key: `${import.meta.env.VITE_PINIA_PERSIST_KEY_PREFIX}-user`,
    storage: localStorage,
    serializer: createPiniaEncryptedSerializer(), // 用户信息需要加密存储
  },
})

export const useUserStoreWithOut = () => {
  return useUserStore(store)
}
