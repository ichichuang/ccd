import {
  errorPagesNameList,
  errorPagesPathList,
  routeWhiteNameList,
  routeWhitePathList,
} from '@/constants/router'
import router, { routeUtils } from '@/router'
import { windowAdapter, type WindowMode } from '@/utils/windowAdapter'
import { usePermissionStore } from '@/stores/modules/session'
import type { LocationQueryRaw, RouteLocationNormalized, RouteMeta } from 'vue-router'
import type { MenuItem as PrimeMenuItem } from 'primevue/menuitem'
import { filterMenuByAccess } from './accessControl'

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
/** 扁平化路由项（来自 RouteConfig 或 RouteRecordNormalized） */
type FlatRouteItem = Pick<RouteConfig, 'path' | 'name' | 'meta'> & {
  children?: RouteConfig[] | MenuItem[]
}

export const getFlatRouteList = (menuList?: RouteConfig[] | MenuItem[]): FlatRouteItem[] => {
  // 当未传入 menuList 时，直接使用 Vue Router 已经拍平的路由结果
  if (!menuList) {
    return router.getRoutes().map(route => ({ ...route })) as FlatRouteItem[]
  }

  // 对显式传入的 menuList 仍然保持递归展开逻辑
  if (!Array.isArray(menuList)) {
    return []
  }

  const result: FlatRouteItem[] = []

  const flattenRoutes = (routeList: RouteConfig[] | MenuItem[], parentPath = '') => {
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
export const getRouteByName = (name?: string): FlatRouteItem[] => {
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
export const getRouteByPath = (path: string): FlatRouteItem | null => {
  const flatRoutes = getFlatRouteList()
  return flatRoutes.find(route => route.path === path) || null
}

function createFallbackRouteTarget(path: string): FlatRouteItem {
  return {
    path,
    name: undefined,
    meta: {
      windowMode: 'current',
    },
  }
}

function resolveRouteTarget(name?: string | null): FlatRouteItem | null {
  if (!name) {
    return createFallbackRouteTarget(import.meta.env.VITE_ROOT_REDIRECT)
  }

  if (typeof name === 'string' && name.startsWith('/')) {
    return getRouteByPath(name) || createFallbackRouteTarget(name)
  }

  const namedRoute = getRouteByName(name)[0]
  if (namedRoute) {
    return namedRoute
  }

  return null
}

function isSameRouteRequest(
  targetRoute: FlatRouteItem,
  query: LocationQueryRaw | undefined,
  mode: WindowMode
): boolean {
  if (mode !== 'current') {
    return false
  }

  const currentRoute = router.currentRoute.value
  const sameName =
    typeof targetRoute.name === 'string' &&
    typeof currentRoute.name === 'string' &&
    currentRoute.name === targetRoute.name
  const samePath = currentRoute.path === targetRoute.path
  const sameQuery = JSON.stringify(currentRoute.query ?? {}) === JSON.stringify(query ?? {})

  return sameQuery && (sameName || samePath)
}

/**
 * 跳转到指定路由
 * @param name - 路由名称
 * @param query - 查询参数
 * @param newWindow - 是否强制新窗口打开（可选，默认根据路由 windowMode 自动判断）
 * @param checkPermission - 是否检查权限
 */
export const goToRoute = (
  name?: string | null,
  query?: LocationQueryRaw,
  newWindow?: boolean,
  checkPermission = false
): void => {
  const targetRoute = resolveRouteTarget(name)
  if (!targetRoute) {
    console.warn(`[goToRoute] 路由名 "${name}" 未命中合法路由记录，请使用正确的 name 或显式 path。`)
    return
  }

  const isLink = targetRoute?.meta?.isLink === true
  const linkUrl = targetRoute?.meta?.linkUrl as string | undefined

  // 权限检查（如需集成可在此处）
  if (checkPermission) {
    // ...
  }

  const requestedMode: WindowMode = isLink
    ? 'external'
    : newWindow === true
      ? 'new-window'
      : newWindow === false
        ? 'current'
        : (targetRoute.meta?.windowMode ?? 'current')

  if (isSameRouteRequest(targetRoute, query, requestedMode)) {
    return
  }

  const permissionStore = requestedMode === 'new-window' ? usePermissionStore() : null
  void windowAdapter
    .openRoute({
      route: {
        name: typeof targetRoute.name === 'string' ? targetRoute.name : undefined,
        path: targetRoute.path,
        meta: {
          title: targetRoute.meta?.title,
          windowMode: requestedMode,
          reuseWindow: targetRoute.meta?.reuseWindow,
        },
      },
      query,
      mode: requestedMode,
      reuse: targetRoute.meta?.reuseWindow === true,
      externalUrl: isLink ? linkUrl || targetRoute.path : undefined,
      onOpened: ({ url }) => {
        permissionStore?.registerWindow(String(targetRoute.name || targetRoute.path), query, url)
      },
      onClosed: key => {
        permissionStore?.markWindowClosed(key)
      },
    })
    .catch(error => {
      console.warn('路由窗口打开失败：', error)
    })
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
  let current: Record<string, unknown> = targetRoute as Record<string, unknown>
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!current[key]) {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
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
 * 仅 admin 布局下的菜单树（供侧边栏/顶栏使用，已过滤非 admin 布局节点）
 */
export const getAdminMenuTree = (): MenuItem[] => {
  return routeUtils.getAdminMenuTree()
}

/** PrimeVue Menu/PanelMenu 单条 model 项（与项目 MenuItem 适配） */
export interface PrimeMenuModelItem extends PrimeMenuItem {
  route?: { path: string; name?: string; meta?: RouteMeta }
  /** 层级（顶层为 0） */
  level?: number
}

/**
 * 将项目 MenuItem 转为 PrimeVue Menu/PanelMenu 的 model 项
 * 叶子节点携带 path + name，供 goToRoute 统一处理（含 windowMode 等窗口策略）
 */
export function menuItemToPrimeModel(
  item: MenuItem,
  t: (key: string) => string,
  level = 0
): PrimeMenuModelItem {
  const label = item.titleKey ? t(item.titleKey) : item.title
  const hasChildren = !!(item.children && item.children.length > 0)

  if (!hasChildren && !item.name && item.path && import.meta.env.DEV) {
    console.warn(
      `[Router] 菜单叶子项缺失 name，可能导致高级路由功能失效: path=${item.path}, title=${
        item.titleKey || item.title
      }`
    )
  }

  const primeItem: PrimeMenuModelItem = {
    key: item.path || item.name || label,
    label,
    icon: item.icon,
    level,
    // 目录节点不绑定 route；叶子节点携带 path + name + meta 供 goToRoute / RouterLink 使用
    route:
      !hasChildren && item.path ? { path: item.path, name: item.name, meta: item.meta } : undefined,
    command: () => {
      if (!hasChildren && item.name) {
        goToRoute(item.name, undefined, undefined, false)
      }
    },
  }
  if (item.children && item.children.length > 0) {
    primeItem.items = item.children.map(child => menuItemToPrimeModel(child, t, level + 1))
  }
  return primeItem
}

/**
 * 获取扁平化菜单树结构
 */
export const getFlatMenuTree = (): FlatRouteItem[] => {
  return getFlatRouteList().filter(route => route.meta?.showLink !== false)
}

/**
 * 根据权限过滤菜单
 * 纯函数：返回新对象，不修改原菜单树
 */
export const getAuthorizedMenuTree = (
  userRoles: string[],
  userPermissions: string[] = [],
  menuTree?: MenuItem[]
): MenuItem[] => {
  const menus = menuTree || getMenuTree()
  return filterMenuByAccess(menus, userRoles, userPermissions)
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
export const getCurrentRouteMeta = (): Record<string, unknown> => {
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

/**
 * 计算菜单项到激活叶子节点的距离：0=激活项, 1=直接父级, 2=祖父级... -1=未激活
 */
export function getActiveDistance(
  route: RouteLocationNormalized,
  item: PrimeMenuModelItem
): number {
  const activePath = getActiveMenuPath(route)
  if (item.route?.path === activePath) return 0

  const parentPaths = Array.isArray(route.meta?.parentPaths)
    ? (route.meta?.parentPaths as string[])
    : []
  const idx = parentPaths.indexOf(item.key ?? '')
  if (idx !== -1) {
    return parentPaths.length - idx
  }
  return -1
}
