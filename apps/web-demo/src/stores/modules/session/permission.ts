import { deepClone, generateIdFromKey } from '@ccd/shared-utils'
import { getRouterCapabilities, isRouterCapabilitiesInstalled } from '@/infra/router/routeProvider'
import { checkRouteAccess } from '@/router/utils/accessControl'
import { useUserStoreWithOut } from '@/stores/modules/session/user'
import store from '@/stores'
import { createPiniaEncryptedSerializer } from '@/utils/safeStorage/piniaSerializer'
import { defineStore } from 'pinia'
import type { LocationQueryRaw } from 'vue-router'

function flattenMenuPaths(items: MenuItem[]): string[] {
  return items.flatMap(item => [
    item.path,
    ...(item.children && item.children.length > 0 ? flattenMenuPaths(item.children) : []),
  ])
}

function hasUsableRouteIdentity(route: RouteConfig): boolean {
  return typeof route.path === 'string' && route.path.length > 0 && Boolean(route.name)
}

function isRouteExcludedFromAdminTabs(route: RouteConfig): boolean {
  const parent: LayoutMode | undefined = route.meta?.parent
  if (parent === 'fullscreen' || parent === 'ratio' || route.meta?.hiddenTag === true) return true
  if (route.meta?.useFallbackComponent === true) return true
  if (route.redirect && !route.component && (!route.children || route.children.length === 0))
    return true
  if (!route.component && (!route.children || route.children.length === 0)) return true
  return false
}

function canAccessRoute(route: RouteConfig): boolean {
  const userStore = useUserStoreWithOut()
  return checkRouteAccess(route.meta, userStore.userInfo.roles, userStore.userInfo.permissions)
}

function isProtectedTab(tab: TabItem): boolean {
  return tab.fixed || tab.deletable === false
}

function matchesTab(tab: TabItem, name: RouteConfig['name'] | RouteConfig['path']): boolean {
  return tab.name === String(name || '') || tab.path === name
}

function getRouteByNameOrPath(
  name: RouteConfig['name'] | RouteConfig['path']
): RouteConfig | undefined {
  const { getFlatRouteList } = getRouterCapabilities()
  return getFlatRouteList().find(
    route => String(route.name || '') === String(name || '') || route.path === name
  )
}

function getRouteByTabIdentity(tab: Pick<TabItem, 'name' | 'path'>): RouteConfig | undefined {
  if (!isRouterCapabilitiesInstalled()) return undefined
  const { getFlatRouteList } = getRouterCapabilities()
  return getFlatRouteList().find(
    route => route.path === tab.path || String(route.name || '') === tab.name
  )
}

function normalizeTabProtection(tab: TabItem): TabItem {
  const route = getRouteByTabIdentity(tab)
  const fixed = route?.meta?.fixedTag === true
  return {
    ...tab,
    name: route?.name ? String(route.name) : tab.name,
    titleKey: route?.meta?.titleKey ?? tab.titleKey,
    title: route?.meta?.title ?? tab.title,
    icon: route?.meta?.icon ?? tab.icon,
    fixed,
    deletable: fixed ? false : route?.meta?.deletable !== false,
  }
}

function isTabValidForCurrentRouteRegistry(tab: TabItem): boolean {
  const route = getRouteByTabIdentity(tab)
  if (!route) return false
  if (!canCreateAdminTab(route, flattenMenuPaths(getRouterCapabilities().getAdminMenuTree())))
    return false
  return canAccessRoute(route)
}

function dedupeTabsByRouteIdentity(tabs: TabItem[]): TabItem[] {
  const seen = new Set<string>()
  return tabs.filter(tab => {
    const key = `${tab.path}::${tab.name}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function routeConfigToTabItem(route: RouteConfig): TabItem | null {
  if (!hasUsableRouteIdentity(route)) return null

  const fixed = route.meta?.fixedTag === true
  return {
    name: String(route.name),
    path: route.path,
    titleKey: route.meta?.titleKey,
    title: route.meta?.title,
    label: '',
    active: false,
    icon: route.meta?.icon,
    fixed,
    deletable: fixed ? false : route.meta?.deletable !== false,
  }
}

function canCreateAdminTab(route: RouteConfig, adminPaths: string[]): boolean {
  if (!hasUsableRouteIdentity(route) || isRouteExcludedFromAdminTabs(route)) return false
  if (!canAccessRoute(route)) return false
  if (route.meta?.fixedTag === true) return true
  return adminPaths.includes(route.path)
}

// 单例序列化器：避免每次持久化时重复实例化加密上下文（成本较高）
const _permissionSerializer = createPiniaEncryptedSerializer()

/**
 * 窗口元数据接口
 * ⚠️ 说明
 * - 仅记录"曾经打开过"的窗口信息
 * - 不参与窗口是否存在的判断
 * - 实际状态以路由模块（@/router）中的 Window 引用为准
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
      this.staticRoutes = markRaw([...routes])
      this.ensureFixedTabsIfAvailable()
    },
    // 设置动态路由
    setDynamicRoutes(routes: BackendRouteConfig[]) {
      this.dynamicRoutes = markRaw([...routes])
      this.ensureFixedTabsIfAvailable()
    },
    // 设置动态路由加载状态
    setDynamicRoutesLoaded(loaded: boolean) {
      this.isDynamicRoutesLoaded = loaded
      this.ensureFixedTabsIfAvailable()
    },
    sanitizeTabs() {
      if (!isRouterCapabilitiesInstalled()) return
      this.tabs = dedupeTabsByRouteIdentity(
        this.tabs.filter(isTabValidForCurrentRouteRegistry).map(normalizeTabProtection)
      )
    },
    // 同步固定标签页（固定标签由 route.meta.fixedTag 声明，不依赖访问历史）
    ensureFixedTabs() {
      if (!isRouterCapabilitiesInstalled()) return
      const { getFlatRouteList } = getRouterCapabilities()
      const fixedTabs = getFlatRouteList()
        .filter(route => route.meta?.fixedTag === true)
        .filter(route => canCreateAdminTab(route, []))
        .map(routeConfigToTabItem)
        .filter((tab): tab is TabItem => tab !== null)

      if (fixedTabs.length === 0) return

      const fixedIdentity = (tab: TabItem): boolean =>
        fixedTabs.some(fixedTab => fixedTab.path === tab.path || fixedTab.name === tab.name)

      const normalizedFixedTabs = fixedTabs.map(fixedTab => {
        const existing = this.tabs.find(
          tab => tab.path === fixedTab.path || tab.name === fixedTab.name
        )
        return {
          ...fixedTab,
          label: existing?.label ?? fixedTab.label,
          active: existing?.active ?? fixedTab.active,
        }
      })
      const regularTabs = this.tabs
        .filter(tab => !fixedIdentity(tab))
        .filter(isTabValidForCurrentRouteRegistry)
        .map(normalizeTabProtection)

      this.tabs = dedupeTabsByRouteIdentity([...normalizedFixedTabs, ...regularTabs])
    },
    ensureFixedTabsIfAvailable() {
      if (!isRouterCapabilitiesInstalled()) return
      this.ensureFixedTabs()
    },
    // 添加标签页（仅 admin 布局下的路由；fixedTag 为固定标签唯一来源）
    addTab(name: RouteConfig['name'] | RouteConfig['path']) {
      this.ensureFixedTabsIfAvailable()
      if (this.tabs.some(tab => matchesTab(tab, name))) return
      if (!isRouterCapabilitiesInstalled()) return

      const { getAdminMenuTree } = getRouterCapabilities()
      const route = getRouteByNameOrPath(name)
      if (!route) return

      const adminPaths = flattenMenuPaths(getAdminMenuTree())
      if (!canCreateAdminTab(route, adminPaths)) return

      const tabItem = routeConfigToTabItem(route)
      if (!tabItem) return
      this.tabs.push(tabItem)
    },
    // 移除标签页
    removeTab(name: RouteConfig['name'] | RouteConfig['path']) {
      const target = this.tabs.find(tab => matchesTab(tab, name))
      if (!target || isProtectedTab(target)) return
      this.tabs = this.tabs.filter(tab => !matchesTab(tab, name))
    },
    // 批量移除标签页（保留指定的标签页 + 固定/不可删除标签页）
    removeTabsExcept(names: (RouteConfig['name'] | RouteConfig['path'])[]) {
      this.ensureFixedTabsIfAvailable()
      this.tabs = this.tabs.filter(
        tab => isProtectedTab(tab) || names.some(name => matchesTab(tab, name))
      )
      this.ensureFixedTabsIfAvailable()
    },
    // 移除指定索引范围的标签页
    removeTabsByIndexRange(startIndex: number, endIndex: number) {
      this.ensureFixedTabsIfAvailable()
      this.tabs = this.tabs.filter(
        (tab, index) => isProtectedTab(tab) || index < startIndex || index > endIndex
      )
      this.ensureFixedTabsIfAvailable()
    },
    // 修改标签页某一项的属性 传入 name|path 和 {property: value}
    updateTabProperty(
      name: RouteConfig['name'] | RouteConfig['path'],
      property: { property: keyof TabItem; value: TabItem[keyof TabItem] }
    ) {
      const tabIndex = this.tabs.findIndex(tab => matchesTab(tab, name))
      if (tabIndex < 0) return

      this.tabs[tabIndex] = normalizeTabProtection({
        ...this.tabs[tabIndex],
        [property.property]: property.value,
      })
      this.ensureFixedTabsIfAvailable()
    },
    // 清空标签页（固定/不可删除标签页保留）
    clearTabs() {
      this.ensureFixedTabsIfAvailable()
      this.tabs = this.tabs.filter(isProtectedTab)
      this.ensureFixedTabsIfAvailable()
    },
    // 更新标签页的属性
    updateTabMeta(name: RouteConfig['name'] | RouteConfig['path'], meta: Partial<TabItem>) {
      const tabIndex = this.tabs.findIndex(tab => matchesTab(tab, name))
      if (tabIndex < 0) return

      this.tabs[tabIndex] = normalizeTabProtection({
        ...this.tabs[tabIndex],
        ...meta,
      })
      this.ensureFixedTabsIfAvailable()
    },
    // 更新标签页的激活状态
    updateTabActive(name: RouteConfig['name'] | RouteConfig['path']) {
      this.tabs.forEach(tab => {
        tab.active = false
      })
      const targetTab = this.tabs.find(tab => matchesTab(tab, name))
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
      this.ensureFixedTabsIfAvailable()
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

      this.cleanupOldWindows()

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
    pick: ['tabs', 'windows'],
    serializer: {
      serialize: (value: unknown) => {
        try {
          // 使用 deepClone 替代低效的 JSON.parse(JSON.stringify())
          const stateToStore = deepClone(value) as { state?: { windows?: WindowMetadata[] } }

          // 优化数据清洗：使用解构赋值剔除 isOpen 字段
          if (stateToStore?.state?.windows) {
            stateToStore.state.windows = stateToStore.state.windows.map((w: WindowMetadata) => {
              const { isOpen: _isOpen, ...rest } = w
              return rest
            })
          }

          // 使用单例加密序列化器（避免每次持久化重复初始化加密上下文）
          return _permissionSerializer.serialize(stateToStore)
        } catch {
          // 降级处理：序列化失败时直接加密原始值
          return _permissionSerializer.serialize(value)
        }
      },
      deserialize: (value: string) => {
        try {
          // 使用单例加密序列化器进行解密
          const data = _permissionSerializer.deserialize(value)

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
