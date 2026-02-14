import router from '@/router'
import store from '@/stores'
import { AUTH_ENABLED } from '@/constants/router'
import { createPiniaEncryptedSerializer } from '@/utils/safeStorage/piniaSerializer'
import { encryptAndCompressSync } from '@/utils/safeStorage/safeStorage'
import { defineStore } from 'pinia'
import { requestCurrentUserMock, requestUserLoginMock } from '@/api/user/login'
import type { UserInfo, UserLoginReq } from '@/api/user/types'

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
     * 测试用假的登录流程：
     * - 调用前端模拟接口 requestUserLoginMock
     * - 写入 token
     * - 写入用户信息并跳转到重定向路由
     */
    async login(payload: UserLoginReq) {
      if (!AUTH_ENABLED) {
        return
      }
      const res = await requestUserLoginMock(payload)
      await this.setToken(res.token)
      this.setUserInfo(res.userInfo)
    },

    /**
     * 可选：根据已有 token 恢复登录状态（用于应用初始化）
     */
    async restoreLoginFromToken() {
      if (!AUTH_ENABLED) {
        return
      }
      if (!this.token) {
        return
      }
      try {
        const userInfo = await requestCurrentUserMock(this.token)
        this.setUserInfo(userInfo)
      } catch (error) {
        console.error('根据 token 恢复用户信息失败:', error)
        this.clearUserInfo()
      }
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
      this.userInfo = userInfo
      this.isLogin = true
      router.push(
        (router.currentRoute.value.query.redirect as string) || import.meta.env.VITE_ROOT_REDIRECT
      )
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
    async logout() {
      if (!AUTH_ENABLED) {
        return
      }
      const { loadingStart } = useLoading()
      loadingStart()
      this.clearUserInfo()
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

      // 统一清理后仅触发一次 reload，避免潜在的多次刷新风险
      for (const key of keysToRemove) {
        localStorage.removeItem(key)
      }
      await new Promise(resolve => setTimeout(resolve, 300)) // 等待路由跳转完成
      window.location.reload()
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
