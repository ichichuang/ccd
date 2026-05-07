import store from '@/stores'
import { AUTH_ENABLED } from '@/constants/router'
import { THEME_PRELOAD_STORAGE_KEYS } from '@/constants/runtime'
import { useLayoutStore } from '@/stores/modules/system/layout'
import { useThemeStore } from '@/stores/modules/system/theme'
import { useSizeStore } from '@/stores/modules/system/size'
import { useLocaleStore } from '@/stores/modules/system/locale'
import { usePermissionStore } from '@/stores/modules/session/permission'
import { createPiniaEncryptedSerializer, removeLocalStorageKeysWhere } from '@/utils/safeStorage'
import { defineStore } from 'pinia'
import type { LoginResult, UserInfo } from '@/types/dto/auth.dto'

interface UserState {
  token: string
  userInfo: UserInfo
  isLogin: boolean
}

const createEmptyUserInfo = (): UserInfo => ({
  userId: '',
  username: '',
  roles: [],
  permissions: [],
  avatar: undefined,
  email: undefined,
  phone: undefined,
})

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: '',
    userInfo: createEmptyUserInfo(),
    isLogin: false, // 是否登录
  }),

  getters: {
    getToken: (state: UserState) => state.token,
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
      this.setToken(result.token)
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

    setToken(token: string) {
      // 未启用登录/鉴权模式时，跳过一切登录相关逻辑
      if (!AUTH_ENABLED) {
        return
      }
      this.token = token
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
      this.userInfo = createEmptyUserInfo()
      this.isLogin = false
    },
    /**
     * 仅做状态清理，不包含 UI 副作用或导航。
     * 刷新/跳转由调用方负责（如 User 组件的退出按钮、路由守卫）。
     */
    async logout() {
      if (!AUTH_ENABLED) {
        return
      }
      this.clearUserInfo()
      const basePrefix = `${import.meta.env.VITE_PINIA_PERSIST_KEY_PREFIX}-`
      const prefixKeys: string[] = [basePrefix, 'schemaform:', 'pro-form-draft:']
      const exactKeys: readonly string[] = THEME_PRELOAD_STORAGE_KEYS

      const shouldRemove = (key: string): boolean => {
        if (exactKeys.includes(key)) return true
        return prefixKeys.some(prefix => key.startsWith(prefix))
      }

      removeLocalStorageKeysWhere(shouldRemove)

      const themeStore = useThemeStore(store)
      const sizeStore = useSizeStore(store)
      const localeStore = useLocaleStore(store)
      const layoutStore = useLayoutStore(store)
      const permissionStore = usePermissionStore(store)

      themeStore.resetState()
      sizeStore.resetState()
      localeStore.resetState()
      layoutStore.resetState()
      permissionStore.reset()
    },
  },

  persist: {
    key: `${import.meta.env.VITE_PINIA_PERSIST_KEY_PREFIX}-user`,
    storage: localStorage,
    pick: ['token', 'userInfo', 'isLogin'],
    serializer: createPiniaEncryptedSerializer(), // 用户信息需要加密存储
  },
})

export const useUserStoreWithOut = () => {
  return useUserStore(store)
}
