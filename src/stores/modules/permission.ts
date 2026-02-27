// 占位：对接后端时恢复 import，并创建 src/api/auth 实现 getAuthRoutes
// import { getAuthRoutes } from '@/api/auth'
import { deepClone } from '@/utils/lodashes'
import { getAdminMenuTree, getFlatRouteList } from '@/router/utils/helper'
import store from '@/stores'

function flattenMenuPaths(items: MenuItem[]): string[] {
  return items.flatMap(item => [
    item.path,
    ...(item.children && item.children.length > 0 ? flattenMenuPaths(item.children) : []),
  ])
}
import { createPiniaEncryptedSerializer } from '@/utils/safeStorage/piniaSerializer'
import { defineStore } from 'pinia'
import type { LocationQueryRaw } from 'vue-router'

/**
 * 窗口元数据接口
 * ⚠️ 说明
 * - 仅记录"曾经打开过"的窗口信息
 * - 不参与窗口是否存在的判断
 * - 实际状态以 router.ts 中的 Window 引用为准
 */
interface WindowMetadata {
  key: string
  routeName: string
  query?: LocationQueryRaw
  url: string
  openedAt: number
  isOpen?: boolean // 仅表示"最后一次已知状态"
}

interface PermissionState {
  // 静态路由
  staticRoutes: RouteConfig[]
  // 动态路由
  dynamicRoutes: BackendRouteConfig[]
  // 动态路由是否已加载完成
  isDynamicRoutesLoaded: boolean
  // 标签页
  tabs: TabItem[]
  // 窗口元数据列表
  windows: WindowMetadata[]
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    staticRoutes: [],
    dynamicRoutes: [],
    isDynamicRoutesLoaded: false,
    tabs: [],
    windows: [],
  }),

  getters: {
    getStaticRoutes: (state: PermissionState) => state.staticRoutes,
    getDynamicRoutes: (state: PermissionState) => state.dynamicRoutes,
    // 获取动态路由加载状态
    getIsDynamicRoutesLoaded: (state: PermissionState) => state.isDynamicRoutesLoaded,
    // 获取标签页 - 动态计算label
    getTabs: (state: PermissionState) => {
      return state.tabs
    },
    /**
     * 根据窗口 key 获取窗口元数据
     * ⚠️ 仅用于查询，不参与窗口是否存在的判断
     */
    getWindowByKey: (state: PermissionState) => (key: string) => {
      return state.windows.find(w => w.key === key)
    },
  },

  actions: {
    // 设置静态路由
    setStaticRoutes(routes: RouteConfig[]) {
      this.staticRoutes = routes
    },
    // 设置动态路由
    setDynamicRoutes(routes: BackendRouteConfig[]) {
      this.dynamicRoutes = routes
    },
    // 设置动态路由加载状态
    setDynamicRoutesLoaded(loaded: boolean) {
      this.isDynamicRoutesLoaded = loaded
    },
    /**
     * 拉取动态路由：调用 API 获取、归一化后写入 state，并返回原始后端路由数组。
     * 失败时若有缓存则使用缓存并返回，否则抛出错误。
     */
    async fetchDynamicRoutes(): Promise<BackendRouteConfig[]> {
      try {
        // 占位：对接后端时恢复 getAuthRoutes 调用
        // const routeResponse = await getAuthRoutes()
        const routeResponse: BackendRouteConfig[] = []
        const routes = Array.isArray(routeResponse)
          ? routeResponse
          : Array.isArray((routeResponse as any)?.routes)
            ? (routeResponse as any).routes
            : []

        if (!Array.isArray(routes)) {
          throw new Error('动态路由数据格式不正确，预期为数组或包含 routes 字段的对象')
        }

        this.dynamicRoutes = routes
        this.isDynamicRoutesLoaded = true
        return routes
      } catch (error) {
        console.error('🪒 Router: 获取动态路由失败，使用本地缓存:', error)
        if (this.dynamicRoutes.length === 0) {
          throw error
        }
        const cached = deepClone(this.dynamicRoutes) as BackendRouteConfig[]
        this.isDynamicRoutesLoaded = true
        return cached
      }
    },
    // 添加标签页（仅 admin 布局下的路由，且需在 admin 菜单树中）
    addTab(name: RouteConfig['name'] | RouteConfig['path']) {
      const route = getFlatRouteList().find(route => route.name === name || route.path === name)
      if (!route) return
      // 仅 admin 布局：fullscreen/ratio 不加入 tabs
      const parent = route.meta?.parent as LayoutMode | undefined
      if (parent === 'fullscreen' || parent === 'ratio') return
      // hiddenTag: 隐藏标签，不加入 tabs
      if (route.meta?.hiddenTag) return
      if (this.tabs.some(tab => tab.name === name || tab.path === name)) return
      // 只有 admin 菜单树中存在的路由才添加到标签页
      const adminMenuTree = getAdminMenuTree()
      const adminPaths = flattenMenuPaths(adminMenuTree)
      if (!adminPaths.includes(route.path)) return
      const tabItem: TabItem = {
        name: route.name || '',
        path: route.path || '',
        titleKey: route.meta?.titleKey,
        title: route.meta?.title,
        label: '',
        active: false,
        icon: route.meta?.icon,
        fixed: route.meta?.fixedTag || false,
        deletable: route.meta?.deletable !== false,
      }
      this.tabs.push(tabItem)
    },
    // 移除标签页
    removeTab(name: RouteConfig['name'] | RouteConfig['path']) {
      // 如果标签页不存在，则不移除
      if (!this.tabs.some(tab => tab.name === name || tab.path === name)) {
        return
      }
      this.tabs = this.tabs.filter(tab => tab.name !== name && tab.path !== name)
    },
    // 批量移除标签页（保留指定的标签页）
    removeTabsExcept(names: (RouteConfig['name'] | RouteConfig['path'])[]) {
      this.tabs = this.tabs.filter(tab =>
        names.some(name => tab.name === name || tab.path === name)
      )
    },
    // 移除指定索引范围的标签页
    removeTabsByIndexRange(startIndex: number, endIndex: number) {
      this.tabs = this.tabs.filter((_, index) => index < startIndex || index > endIndex)
    },
    // 修改标签页某一项的属性 传入 name|path 和 {property: value}
    updateTabProperty(
      name: RouteConfig['name'] | RouteConfig['path'],
      property: { property: any; value: any }
    ) {
      const tab = this.tabs.find(tab => tab.name === name || tab.path === name)
      if (tab) {
        tab[property.property as keyof TabItem] = property.value as never
      }
    },
    // 清空标签页
    clearTabs() {
      this.tabs = []
    },
    // 更新标签页的属性
    updateTabMeta(name: RouteConfig['name'] | RouteConfig['path'], meta: Partial<TabItem>) {
      const tab = this.tabs.find(tab => tab.name === name || tab.path === name)
      if (tab) {
        Object.assign(tab, meta)
      }
    },
    // 更新标签页的激活状态
    updateTabActive(name: RouteConfig['name'] | RouteConfig['path']) {
      // 先将所有标签页设置为非激活状态
      this.tabs.forEach(tab => {
        tab.active = false
      })
      // 将指定的标签页设置为激活状态
      const targetTab = this.tabs.find(tab => tab.name === name || tab.path === name)
      if (targetTab) {
        targetTab.active = true
      }
    },
    // 重新排序标签页
    reorderTabs(fromIndex: number, toIndex: number) {
      const newTabs = [...this.tabs]
      const [movedTab] = newTabs.splice(fromIndex, 1)
      newTabs.splice(toIndex, 0, movedTab)
      this.tabs = newTabs
    },
    // 重置
    reset() {
      this.staticRoutes = []
      this.dynamicRoutes = []
      this.isDynamicRoutesLoaded = false
      this.tabs = []
      this.windows = []
    },
    /**
     * 注册新窗口元数据
     */
    registerWindow(routeName: string, query: LocationQueryRaw | undefined, url: string): string {
      const key = generateWindowKey(routeName, query)
      const existing = this.windows.find(w => w.key === key)

      if (existing) {
        existing.url = url
        existing.openedAt = Date.now()
        existing.isOpen = true
        return key
      }

      this.windows.push({
        key,
        routeName,
        query,
        url,
        openedAt: Date.now(),
        isOpen: true,
      })

      // 清理过期窗口记录
      const now = Date.now()
      const maxAge = 7 * 24 * 60 * 60 * 1000
      this.windows = this.windows.filter(w => w.isOpen || now - w.openedAt < maxAge)

      return key
    },

    /**
     * 标记窗口为已关闭
     */
    markWindowClosed(key: string): void {
      const w = this.windows.find(w => w.key === key)
      if (w) {
        w.isOpen = false
      }
    },

    /**
     * 清理过期窗口记录
     */
    cleanupOldWindows(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
      const now = Date.now()
      this.windows = this.windows.filter(w => w.isOpen || now - w.openedAt < maxAge)
    },

    /**
     * 清空所有窗口记录
     */
    clearAllWindows(): void {
      this.windows = []
    },
  },

  persist: {
    key: `${import.meta.env.VITE_PINIA_PERSIST_KEY_PREFIX}-permission`,
    storage: localStorage,
    pick: ['staticRoutes', 'dynamicRoutes', 'tabs', 'windows'],
    serializer: {
      serialize: (value: any) => {
        try {
          // 使用 deepClone 替代低效的 JSON.parse(JSON.stringify())
          const stateToStore = deepClone(value)

          // 优化数据清洗：使用解构赋值剔除 isOpen 字段
          if (stateToStore?.state?.windows) {
            stateToStore.state.windows = stateToStore.state.windows.map((w: WindowMetadata) => {
              const { isOpen: _isOpen, ...rest } = w
              return rest
            })
          }

          // 使用加密序列化器进行加密
          const encryptedSerializer = createPiniaEncryptedSerializer()
          return encryptedSerializer.serialize(stateToStore)
        } catch {
          // 降级处理：如果序列化失败，使用加密序列化器处理原始值
          const encryptedSerializer = createPiniaEncryptedSerializer()
          return encryptedSerializer.serialize(value)
        }
      },
      deserialize: (value: string) => {
        try {
          // 使用加密序列化器进行解密
          const encryptedSerializer = createPiniaEncryptedSerializer()
          const data = encryptedSerializer.deserialize(value)

          // 恢复时，所有窗口标记为未打开（需要运行时检测）
          if (data?.state?.windows) {
            data.state.windows.forEach((w: WindowMetadata) => {
              w.isOpen = false
            })
          }
          return data
        } catch {
          return {
            state: {
              staticRoutes: [],
              dynamicRoutes: [],
              isDynamicRoutesLoaded: false,
              tabs: [],
              windows: [],
            },
          }
        }
      },
    },
  },
})

/**
 * 生成窗口唯一标识
 */
function generateWindowKey(routeName: string, query?: LocationQueryRaw): string {
  const queryString = query ? JSON.stringify(query) : ''
  const keySource = `${routeName}:${queryString}`
  return generateIdFromKey(keySource)
}

export const usePermissionStoreWithOut = () => {
  return usePermissionStore(store)
}
