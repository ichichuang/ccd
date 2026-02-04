import {
  errorPagesNameList,
  errorPagesPathList,
  routeWhiteNameList,
  routeWhitePathList,
} from '@/constants/router'
import router, { routeUtils } from '@/router'
import { usePermissionStore } from '@/stores/modules/permission'
import type { LocationQueryRaw, RouteLocationNormalized } from 'vue-router'

// ================= 窗口管理 =================

/**
 * 运行时窗口引用表
 * ⚠️ 判断窗口是否存在的唯一可信来源
 */
const routeWindowRefMap = new Map<string, Window>()

/**
 * 仅用于通知窗口关闭
 */
let windowChannel: BroadcastChannel | null = null

function initWindowChannel() {
  if (!windowChannel && typeof BroadcastChannel !== 'undefined') {
    windowChannel = new BroadcastChannel('route-window-channel')
    windowChannel.addEventListener('message', e => {
      if (e.data?.type === 'window-closed') {
        const { key } = e.data
        routeWindowRefMap.delete(key)
        const permissionStore = usePermissionStore() as any
        permissionStore.markWindowClosed(key)
      }
    })
  }
}

function generateWindowKey(routeName: string, query?: LocationQueryRaw): string {
  return generateIdFromKey(`${routeName}:${JSON.stringify(query ?? {})}`)
}

/**
 * 获取窗口引用（唯一可信）
 */
function getRouteWindowRef(key: string): Window | null {
  const win = routeWindowRefMap.get(key)
  if (!win) {
    return null
  }

  if (win.closed) {
    routeWindowRefMap.delete(key)
    const permissionStore = usePermissionStore() as any
    permissionStore.markWindowClosed(key)
    windowChannel?.postMessage({ type: 'window-closed', key })
    return null
  }

  return win
}

/**
 * 注册窗口引用
 */
function setRouteWindowRef(key: string, win: Window): void {
  routeWindowRefMap.set(key, win)

  try {
    win.addEventListener('beforeunload', () => {
      routeWindowRefMap.delete(key)
      const permissionStore = usePermissionStore() as any
      permissionStore.markWindowClosed(key)
      windowChannel?.postMessage({ type: 'window-closed', key })
    })
  } catch {
    // 跨域限制，忽略
  }
}

if (typeof window !== 'undefined') {
  initWindowChannel()
}

/**
 * 构建路由 URL（包含窗口标识）
 */
function buildRouteUrl(
  targetRoute: any,
  query: LocationQueryRaw | undefined,
  windowKey: string
): string {
  let url = ''

  if (import.meta.env.VITE_ROUTER_MODE === 'hash') {
    const location = window.location
    const publicPath = import.meta.env.VITE_PUBLIC_PATH
    url = location.origin + publicPath + '#' + targetRoute.path
    if (query && Object.keys(query).length > 0) {
      const queryString = new URLSearchParams(query as Record<string, string>).toString()
      url += (url.includes('?') ? '&' : '?') + queryString
    }
    url += (url.includes('?') ? '&' : '?') + `_windowKey=${encodeURIComponent(windowKey)}`
  } else {
    const publicPath = import.meta.env.VITE_PUBLIC_PATH
    url = publicPath + targetRoute.path.replace(/^\//, '')
    if (query && Object.keys(query).length > 0) {
      const queryString = new URLSearchParams(query as Record<string, string>).toString()
      url += (url.includes('?') ? '&' : '?') + queryString
    }
    url += (url.includes('?') ? '&' : '?') + `_windowKey=${encodeURIComponent(windowKey)}`
  }

  return url
}

// ================= 默认变量 =================
export { errorPagesNameList, errorPagesPathList, routeWhiteNameList, routeWhitePathList }

// ================= 通用方法 =================

/**
 * @返回上一页
 * 智能返回功能，如果有历史记录则返回上一页，否则跳转到首页
 */
export const goBack = (): void => {
  if (history.state?.back) {
    router.back()
  } else {
    router.push('/')
  }
}

/**
 * 获取扁平化的路由列表
 * @param menuList - 菜单列表，默认使用系统路由
 */
export const getFlatRouteList = (menuList?: any[]): any[] => {
  // 当未传入 menuList 时，直接使用 Vue Router 已经拍平的路由结果
  if (!menuList) {
    return router.getRoutes().map(route => ({ ...route }))
  }

  // 对显式传入的 menuList 仍然保持递归展开逻辑
  if (!Array.isArray(menuList)) {
    return []
  }

  const result: any[] = []

  const flattenRoutes = (routeList: any[], parentPath = '') => {
    routeList.forEach(route => {
      const currentRoute = { ...route }

      if (parentPath) {
        currentRoute.path = `${parentPath}/${route.path}`.replace(/\/+/g, '/')
      }

      result.push(currentRoute)

      if (route.children && route.children.length > 0) {
        flattenRoutes(route.children, currentRoute.path)
      }
    })
  }

  flattenRoutes(menuList)
  return result
}

/**
 * 根据路由名称获取路由信息
 */
export const getRouteByName = (name?: string): any[] => {
  const parseNameFromURL = (): string => {
    const urlPath = location.pathname
    const pathSegments = urlPath.split('/').filter(Boolean)
    return pathSegments[pathSegments.length - 1] || ''
  }
  name = name || parseNameFromURL()
  const flatRoutes = getFlatRouteList()
  return flatRoutes.filter(
    route => typeof route.name === 'string' && route.name?.toLowerCase() === name?.toLowerCase()
  )
}

/**
 * 根据路径获取路由信息
 */
export const getRouteByPath = (path: string): any | null => {
  const flatRoutes = getFlatRouteList()
  return flatRoutes.find(route => route.path === path) || null
}

/**
 * 跳转到指定路由
 * @param name - 路由名称
 * @param query - 查询参数
 * @param newWindow - 是否强制新窗口打开（可选，默认根据路由parent属性自动判断）
 * @param checkPermission - 是否检查权限
 */
export const goToRoute = (
  name?: string | null,
  query?: LocationQueryRaw,
  newWindow?: boolean,
  checkPermission = false
): void => {
  if (!name) {
    router.push(import.meta.env.VITE_ROOT_REDIRECT)
    return
  }
  // 当传入的是以 '/' 开头的路径时，直接按路径跳转
  if (typeof name === 'string' && name.startsWith('/')) {
    router.push({ path: name, query })
    return
  }
  if (router.currentRoute.value.name === name) {
    return
  }
  const targetRoutes = getRouteByName(name)
  if (targetRoutes.length === 0) {
    try {
      // 如果按名称未找到，则尝试直接跳转（可能传的是可解析的路径或路由定位对象）
      router.push(name)
      return
    } catch {
      console.warn(`路由 "${name}" 未找到`)
      return
    }
  }
  const targetRoute = targetRoutes[0]
  if (!targetRoute) {
    return
  }

  // 外链处理：优先根据 meta.isLink/linkUrl 处理
  const isLink = targetRoute?.meta?.isLink === true
  const linkUrl = targetRoute?.meta?.linkUrl as string | undefined
  if (isLink) {
    const url = linkUrl || targetRoute.path
    try {
      window.open(url, '_blank')
    } catch {
      console.warn('外链打开失败：', url)
    }
    return
  }

  // 权限检查（如需集成可在此处）
  if (checkPermission) {
    // ...
  }

  // 判断是否需要新窗口打开
  // 1. 如果明确指定了 newWindow 参数，则按指定值执行
  // 2. 如果未指定，则根据路由的 parent 属性自动判断
  let shouldOpenNewWindow = newWindow

  if (!newWindow) {
    // 获取路由的 parent 属性，默认为 'admin'
    const parent = (targetRoute.meta?.parent as LayoutMode) || 'admin'

    // ratio 和 fullscreen 模式需要新窗口打开
    shouldOpenNewWindow = parent === 'fullscreen' || parent === 'ratio'
  }

  if (shouldOpenNewWindow) {
    const permissionStore = usePermissionStore() as any
    const windowKey = generateWindowKey(String(targetRoute.name), query)
    const shouldReuse = targetRoute.meta?.reuseWindow === true

    if (shouldReuse) {
      const existed = getRouteWindowRef(windowKey)
      if (existed) {
        existed.focus()
        return
      }
    }

    // === 新开窗口 ===
    const url = buildRouteUrl(targetRoute, query, windowKey)
    const win = window.open(url, '_blank')

    if (win) {
      try {
        win.name = windowKey
      } catch {
        // 跨域限制，忽略
      }
      setRouteWindowRef(windowKey, win)
      permissionStore.registerWindow(String(targetRoute.name), query, url)
    } else {
      console.warn('新窗口打开失败，可能被浏览器阻止')
    }
  } else {
    router.push({ path: targetRoute.path, query })
  }
}

/**
 * 动态更新路由信息
 */
export const updateRoute = (name: string, keyPath: string, value: unknown): void => {
  const targetRoutes = getRouteByName(name)
  const index = targetRoutes.findIndex(item => item.name === name)
  if (index === -1) {
    console.warn(`路由 "${name}" 未找到，无法更新`)
    return
  }
  const targetRoute = targetRoutes[index]
  const keys = keyPath.split('.')
  let current: any = targetRoute
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!current[key]) {
      current[key] = {}
    }
    current = current[key]
  }
  current[keys[keys.length - 1]] = value
  // 更新路由注册表
  const allRoutes = router.getRoutes()
  allRoutes.forEach(route => {
    if (route.name === name) {
      Object.assign(route, targetRoute)
    }
  })
}

/**
 * 获取菜单树结构
 */
export const getMenuTree = (): MenuItem[] => {
  return routeUtils.menuTree
}

/**
 * 获取扁平化菜单树结构
 */
export const getFlatMenuTree = (): any[] => {
  return getFlatRouteList().filter(route => route.meta?.showLink !== false)
}

/**
 * 根据权限过滤菜单
 */
export const getAuthorizedMenuTree = (userRoles: string[], menuTree?: MenuItem[]): MenuItem[] => {
  const menus = menuTree || getMenuTree()
  return menus.filter(menu => {
    if (menu.roles && menu.roles.length > 0) {
      const hasPermission = menu.roles.some(role => userRoles.includes(role))
      if (!hasPermission) {
        return false
      }
    }
    if (menu.children && menu.children.length > 0) {
      menu.children = getAuthorizedMenuTree(userRoles, menu.children)
    }
    return true
  })
}

/**
 * 检查当前路由权限
 */
export const checkCurrentRoutePermission = (userRoles: string[], routeName?: string): boolean => {
  const targetRouteName = routeName || (router.currentRoute.value.name as string)
  if (!targetRouteName) {
    return true
  }
  const targetRoutes = getRouteByName(targetRouteName)
  if (targetRoutes.length === 0) {
    return true
  }
  const targetRoute = targetRoutes[0]
  const roles = targetRoute.meta?.roles as string[] | undefined
  if (!roles || roles.length === 0) {
    return true
  }
  return roles.some(role => userRoles.includes(role))
}

/**
 * 获取路由的完整信息（包含增强的 meta 信息）
 */
export const getRouteConfig = (name: string): RouteConfig | null => {
  const flatRoutes = routeUtils.flatRoutes
  return flatRoutes.find(route => route.name === name) || null
}

/**
 * 获取当前路由信息
 */
export const getCurrentRoute = (): RouteLocationNormalized => {
  return router.currentRoute.value
}

/**
 * 获取当前路由的 Meta 信息
 */
export const getCurrentRouteMeta = (): Record<string, any> => {
  return router.currentRoute.value.meta || {}
}

/**
 * 判断路由是否为外链
 */
export const isExternalLink = (routeName: string): boolean => {
  const routeConfig = getRouteConfig(routeName)
  return routeConfig?.meta?.isLink === true
}

/**
 * 获取外链地址
 */
export const getExternalLinkUrl = (routeName: string): string | null => {
  const routeConfig = getRouteConfig(routeName)
  return routeConfig?.meta?.linkUrl || null
}

/**
 * 刷新当前路由
 */
export const refreshCurrentRoute = (): void => {
  router.go(0)
}

/**
 * 替换当前路由（不会在历史记录中留下记录）
 */
export const replaceRoute = (path: string, query?: LocationQueryRaw): void => {
  router.replace({ path, query })
}

/**
 * 获取路由历史记录数量
 */
export const getHistoryLength = (): number => {
  return history.length
}

/**
 * 检查当前是否在指定路由
 */
export const isCurrentRoute = (name: string): boolean => {
  const currentRouteName = router.currentRoute.value.name as string
  return currentRouteName === name
}

/**
 * 获取路由的完整路径（包含父级路径）
 * @param route 路由配置
 * @returns 完整的路径字符串
 */
export function getFullRoutePath(route: RouteConfig): string {
  if (!route.meta?.parentPaths || route.meta.parentPaths.length === 0) {
    return route.path
  }

  // 拼接父级路径和当前路径
  // 说明：
  // - parentPaths 中约定存放的是各级父路由的「完整路径片段」（通常以 `/` 开头）
  // - 这里通过显式补 `/` 的方式进行拼接，以兼容后续可能引入的相对 path 写法
  const parentPath = route.meta.parentPaths.join('')
  const normalizedParent = parentPath.replace(/\/+$/u, '')
  const normalizedCurrent = (route.path || '').replace(/^\/+/u, '')

  return `${normalizedParent}/${normalizedCurrent}`.replace(/\/+/gu, '/')
}

/**
 * 检查路由是否为叶子节点（最底层路由）
 * @param route 路由配置
 * @returns 是否为叶子节点
 */
export function isLeafRoute(route: RouteConfig): boolean {
  return !route.children || route.children.length === 0
}

/**
 * 获取所有叶子节点路由
 * @param routes 路由配置数组
 * @returns 所有叶子节点路由数组
 */
export function getLeafRoutes(routes: RouteConfig[]): RouteConfig[] {
  const leafRoutes: RouteConfig[] = []

  function collectLeafRoutes(routeList: RouteConfig[]) {
    routeList.forEach(route => {
      if (isLeafRoute(route)) {
        leafRoutes.push(route)
      } else if (route.children) {
        collectLeafRoutes(route.children)
      }
    })
  }

  collectLeafRoutes(routes)
  return leafRoutes
}

/**
 * 获取用于菜单高亮的有效路径
 * - 如果当前路由设置了 meta.activeMenu，则优先使用该路径
 * - 否则回退到当前路由自身的 path
 */
export function getActiveMenuPath(route: RouteLocationNormalized): string {
  const activeMenu = (route.meta?.activeMenu as string | undefined) || ''
  const path = route.path || '/'
  return activeMenu || path
}
