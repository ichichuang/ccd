import { getUserInfo } from '@/api'
import { goToRoute } from '@/common'
import { FORM_MEMORY_LOCAL_STORAGE_PREFIX } from '@/components/modules/schema-form/hooks/useFormMemory'
import { INTERVAL } from '@/constants'
import { useLoading } from '@/hooks'
import router from '@/router'
import store from '@/stores'
import { env } from '@/utils'
import { defineStore } from 'pinia'

const { loadingStart, loadingDone } = useLoading()

interface UserState {
  token: string
  userInfo: UserInfo
  isLogin: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: '',
    userInfo: {
      userId: '', // 用户ID
      username: '', // 用户名
      roles: [], // 用户角色
      permissions: [], // 用户权限
    },
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
    setToken(token: string) {
      this.token = token
      getUserInfo().then(res => {
        this.setUserInfo(res.data)
      })
    },
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
      this.isLogin = true
      router.push((router.currentRoute.value.query.redirect as string) || env.rootRedirect)
    },
    clearUserInfo() {
      this.token = ''
      this.userInfo = {
        userId: '',
        username: '',
        roles: [],
        permissions: [],
      }
      this.isLogin = false
    },
    async logout() {
      loadingStart()
      this.clearUserInfo()
      const basePrefix = `${env.piniaKeyPrefix}-`
      const schemaFormLegacyPrefix = '__form_cache__:'
      const schemaFormPlainPrefix = 'schemaform:'
      const schemaFormPrefixed = `${env.piniaKeyPrefix}-__form_cache__:`

      const prefixes: string[] = [
        basePrefix,
        schemaFormPrefixed,
        FORM_MEMORY_LOCAL_STORAGE_PREFIX,
        schemaFormLegacyPrefix,
        schemaFormPlainPrefix,
      ]

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

      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
      })
      await new Promise(resolve => setTimeout(resolve, INTERVAL)) // 等待路由跳转完成
      loadingDone()
      goToRoute('/login')
      // window.location.reload()
    },
  },

  persist: {
    key: `${env.piniaKeyPrefix}-user`,
    storage: localStorage,
  },
})

export const useUserStoreWithOut = () => {
  return useUserStore(store)
}
