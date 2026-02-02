import router from '@/router'
import store from '@/stores'
import { createPiniaEncryptedSerializer } from '@/utils/safeStorage/piniaSerializer'
import { encryptAndCompressSync } from '@/utils/safeStorage/safeStorage'
import { defineStore } from 'pinia'
import type { UserInfo } from '@/api/user/types'

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
    async setToken(token: string) {
      this.token = token
      this.safeStorageToken = encryptAndCompressSync(token, import.meta.env.VITE_APP_SECRET)
      try {
        // 响应拦截器已经返回了 data 字段，所以 res 就是 UserInfo
        // const userInfo = await getUserInfo()
        const userInfo: UserInfo = {
          userId: '123',
          username: 'admin',
          roles: ['admin'],
          permissions: ['admin'],
        }
        this.setUserInfo(userInfo)
      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 如果获取用户信息失败，清除 token
        this.clearUserInfo()
        throw error
      }
    },
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
      this.isLogin = true
      router.push(
        (router.currentRoute.value.query.redirect as string) || import.meta.env.VITE_ROOT_REDIRECT
      )
    },
    clearUserInfo() {
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
      const { loadingStart } = useLoading()
      loadingStart()
      this.clearUserInfo()
      const basePrefix = `${import.meta.env.VITE_PINIA_PERSIST_KEY_PREFIX}-`
      const prefixes: string[] = [basePrefix]
      const keysToRemove = new Set<string>()

      for (let i = localStorage.length - 1; i >= 0; i -= 1) {
        const key = localStorage.key(i)
        if (!key) {
          continue
        }
        if (prefixes.some(prefix => key.startsWith(prefix))) {
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
