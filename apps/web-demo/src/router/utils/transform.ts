/**
 * 路由转换与格式化：排序、扁平化、后端转前端、转 Vue Router、权限校验
 * 职责：路由树形/扁平互转、processAsyncRoutes、transformToVueRoutes、createRouteUtils、权限相关纯函数。
 */

import type { RouteRecordRaw } from 'vue-router'
import { appLogger } from '@/adapters/logger.adapter'
import { loadView, generateNameByPath, isUsingFallbackComponent } from './resolver'
import { filterTopLevelRoutesByParent, generateMenuTree, generateBreadcrumbMap } from './menu'
import { checkRouteAccess } from './accessControl'

/**
 * 为最底层路由添加 parentPaths 字段
 */
export function addParentPathsToLeafRoutes(
  routes: RouteConfig[],
  parentPaths: string[] = []
): RouteConfig[] {
  return routes.map(route => {
    const currentRoute = { ...route }
    if (route.children && route.children.length > 0) {
      const newParentPaths = [...parentPaths, route.path]
      currentRoute.children = addParentPathsToLeafRoutes(route.children, newParentPaths)
    } else {
      if (parentPaths.length > 0) {
        currentRoute.meta = {
          ...currentRoute.meta,
          parentPaths: [...parentPaths],
        }
      }
    }
    return currentRoute
  })
}

/**
 * 为后端路由添加 parentPaths 字段
 */
export function addParentPathsToBackendRoutes(
  routes: BackendRouteConfig[],
  parentPaths: string[] = []
): BackendRouteConfig[] {
  return routes.map(route => {
    const currentRoute = { ...route }
    if (route.children && route.children.length > 0) {
      const newParentPaths = [...parentPaths, route.path]
      currentRoute.children = addParentPathsToBackendRoutes(route.children, newParentPaths)
    } else {
      if (parentPaths.length > 0) {
        currentRoute.meta = {
          ...currentRoute.meta,
          parentPaths: [...parentPaths],
        }
      }
    }
    return currentRoute
  })
}

/**
 * 处理动态路由，自动添加 parentPaths，并解析组件
 */
export function processAsyncRoutes(backendRoutes: BackendRouteConfig[]): RouteConfig[] {
  if (!Array.isArray(backendRoutes) || backendRoutes.length === 0) {
    return []
  }

  const routesWithParentPaths = addParentPathsToBackendRoutes(backendRoutes)

  return routesWithParentPaths.map(route => {
    let routeName = route.name
    if (!routeName) {
      routeName = generateNameByPath(route.path)
    }

    const processedRoute: RouteConfig = {
      path: route.path,
      name: routeName,
      redirect: route.redirect,
      meta: {
        ...route.meta,
        backstage: true,
        title: route.meta?.title ?? '',
        showLink: route.meta?.showLink ?? true,
      },
    }

    if (processedRoute.meta?.parent === 'ratio' && !processedRoute.meta.ratio) {
      processedRoute.meta.ratio = '16:9'
    }

    if (route.component) {
      const component = loadView(route.component as string)
      processedRoute.component = component
      if (isUsingFallbackComponent(component)) {
        appLogger.warn(
          `🪒-Router: 路由 ${route.path} 的组件 ${route.component} 未找到，已使用 404 页面替代`
        )
        if (processedRoute.meta) {
          processedRoute.meta.useFallbackComponent = true
        }
      }
    }

    if (route.children && route.children.length > 0 && !route.redirect) {
      processedRoute.redirect = route.children[0].path
    }
    if (route.children && route.children.length > 0 && !route.name) {
      processedRoute.name = (route.children[0].name || 'Unknown') + 'Parent'
    }

    if (route.children && route.children.length > 0) {
      processedRoute.children = processAsyncRoutes(route.children as BackendRouteConfig[])
    }

    return processedRoute
  })
}

/**
 * 一维数组处理成多级嵌套数组（三级及以上拍成二级）
 */
export function formatTwoStageRoutes(routesList: RouteConfig[]): RouteConfig[] {
  if (routesList.length === 0) return routesList

  const newRoutesList: RouteConfig[] = []
  routesList.forEach(route => {
    if (route.path === '/') {
      newRoutesList.push({
        component: route.component,
        name: route.name,
        path: route.path,
        redirect: route.redirect,
        meta: route.meta,
        children: [],
      })
    } else {
      newRoutesList[0]?.children?.push({ ...route })
    }
  })
  return newRoutesList
}

/**
 * 将多级嵌套路由处理成一维数组
 */
export function formatFlatteningRoutes(routesList: RouteConfig[]): RouteConfig[] {
  if (routesList.length === 0) return routesList

  const flatRoutes: RouteConfig[] = []

  function flatten(routes: RouteConfig[], parentPath = '') {
    routes.forEach(route => {
      const currentPath = parentPath
        ? `${parentPath}/${route.path}`.replace(/\/+/g, '/')
        : route.path
      flatRoutes.push({
        ...route,
        path: currentPath,
        children: undefined,
      })
      if (route.children && route.children.length > 0) {
        flatten(route.children, currentPath)
      }
    })
  }

  flatten(routesList)
  return flatRoutes
}

/**
 * 路由排序（按 meta.rank 升序，未设置 rank 的排最后）
 */
export function sortRoutes(routes: RouteConfig[]): RouteConfig[] {
  return [...routes].sort((a, b) => {
    const rankA = a.meta?.rank ?? 999
    const rankB = b.meta?.rank ?? 999
    return rankA - rankB
  })
}

/**
 * 扁平化路由（保留树信息于 meta）
 */
export function flattenRoutes(routes: RouteConfig[]): RouteConfig[] {
  const result: RouteConfig[] = []

  function traverse(routeList: RouteConfig[], parent?: RouteConfig) {
    routeList.forEach(route => {
      const flatRoute: RouteConfig = {
        ...route,
        meta: route.meta
          ? {
              ...route.meta,
              ...(parent &&
                route.meta.title && {
                  parentPath: parent.path,
                  parentTitle: parent.meta?.title,
                }),
            }
          : undefined,
      }
      result.push(flatRoute)
      if (route.children && route.children.length > 0) {
        traverse(route.children, route)
      }
    })
  }

  traverse(routes)
  return result
}

/**
 * 通过指定 key 获取父级路径集合
 */
export function getParentPaths(
  value: string,
  routes: RouteConfig[],
  key: keyof RouteConfig = 'path'
): string[] {
  function dfs(routes: RouteConfig[], value: string, parents: string[]): string[] {
    for (let i = 0; i < routes.length; i++) {
      const item = routes[i]
      if (item[key] === value) return parents
      if (!item.children || !item.children.length) continue
      parents.push(item.path)
      if (dfs(item.children, value, parents).length) return parents
      parents.pop()
    }
    return []
  }
  return dfs(routes, value, [])
}

/** 获取当前页面按钮级权限 */
export function getAuths(route?: RouteConfig): string[] {
  return route?.meta?.auths || []
}

/** 是否有按钮级权限 */
export function hasAuth(value: string | string[], userPermissions: string[]): boolean {
  if (!value) return false
  const authList = Array.isArray(value) ? value : [value]
  if (userPermissions.includes('*:*:*')) return true
  return authList.every(auth => userPermissions.includes(auth))
}

/**
 * 归一化 routes：meta.parent === 'ratio' 且未设置 ratio 时设为 '16:9'
 */
export function normalizeRatioMetaOnRoutes(routes: RouteConfig[]): RouteConfig[] {
  return routes.map(route => {
    const normalized: RouteConfig = {
      ...route,
      meta: route.meta ? { ...route.meta } : undefined,
    }
    if (normalized.meta?.parent === 'ratio' && !normalized.meta.ratio) {
      normalized.meta.ratio = '16:9'
    }
    if (route.children && route.children.length > 0) {
      normalized.children = normalizeRatioMetaOnRoutes(route.children)
    }
    return normalized
  })
}

/**
 * 转换路由配置为 Vue Router 格式
 */
export function transformToVueRoutes(routes: RouteConfig[]): RouteRecordRaw[] {
  const normalizedRoutes = normalizeRatioMetaOnRoutes(routes)
  return normalizedRoutes.map(route => {
    const vueRoute = {
      path: route.path,
      component: route.component,
      meta: route.meta as Record<string, unknown>,
    } as RouteRecordRaw
    if (route.name) vueRoute.name = route.name
    if (route.redirect) vueRoute.redirect = route.redirect
    if (route.children && route.children.length > 0) {
      vueRoute.children = transformToVueRoutes(route.children)
    }
    return vueRoute as RouteRecordRaw
  })
}

/**
 * 根据 meta.keepAlive 收集需要缓存的页面 name
 */
export function getKeepAliveNames(routes: RouteConfig[]): string[] {
  const keepAliveNames: string[] = []

  function traverse(routeList: RouteConfig[]) {
    routeList.forEach(route => {
      if (route.meta?.keepAlive && route.name) {
        keepAliveNames.push(route.name as string)
      }
      if (route.children && route.children.length > 0) {
        traverse(route.children)
      }
    })
  }

  traverse(routes)
  return keepAliveNames
}

/**
 * 根据路径查找路由
 */
export function findRouteByPath(routes: RouteConfig[], targetPath: string): RouteConfig | null {
  for (const route of routes) {
    if (route.path === targetPath) return route
    if (route.children && route.children.length > 0) {
      const found = findRouteByPath(route.children, targetPath)
      if (found) return found
    }
  }
  return null
}

/**
 * 检查路由权限（角色）
 */
export function checkRoutePermission(
  route: RouteConfig,
  userRoles: string[],
  userPermissions: string[] = []
): boolean {
  return checkRouteAccess(route.meta, userRoles, userPermissions)
}

/**
 * 过滤有权限的路由
 */
export function filterAuthorizedRoutes(
  routes: RouteConfig[],
  userRoles: string[],
  userPermissions: string[] = []
): RouteConfig[] {
  return routes
    .filter(route => checkRoutePermission(route, userRoles, userPermissions))
    .map(route => {
      if (route.children && route.children.length > 0) {
        return {
          ...route,
          children: filterAuthorizedRoutes(route.children, userRoles, userPermissions),
        }
      }
      return { ...route }
    })
}

/**
 * 创建路由工具集
 */
export function createRouteUtils(routes: RouteConfig[]): RouteUtils {
  const normalizedRoutes = normalizeRatioMetaOnRoutes(routes)
  const sortedRoutes = sortRoutes([...normalizedRoutes])
  let currentRouteTree: RouteConfig[] = sortedRoutes
  let keepAliveVersion = 0

  return {
    flatRoutes: flattenRoutes(sortedRoutes),
    menuTree: generateMenuTree(sortedRoutes),
    breadcrumbMap: generateBreadcrumbMap(sortedRoutes),
    keepAliveNames: getKeepAliveNames(sortedRoutes),
    keepAliveVersion,
    updateRouteUtils(newRoutes: RouteConfig[]) {
      const normalized = normalizeRatioMetaOnRoutes(newRoutes)
      const newSortedRoutes = sortRoutes([...normalized])
      const nextKeepAliveNames = getKeepAliveNames(newSortedRoutes)
      const currentKeepAliveSet = new Set(this.keepAliveNames)
      const keepAliveChanged =
        nextKeepAliveNames.length !== this.keepAliveNames.length ||
        nextKeepAliveNames.some(name => !currentKeepAliveSet.has(name))

      currentRouteTree = newSortedRoutes
      this.flatRoutes = flattenRoutes(newSortedRoutes)
      this.menuTree = generateMenuTree(newSortedRoutes)
      this.breadcrumbMap = generateBreadcrumbMap(newSortedRoutes)
      this.keepAliveNames = nextKeepAliveNames
      if (keepAliveChanged) {
        keepAliveVersion += 1
        this.keepAliveVersion = keepAliveVersion
      }
    },
    getAdminMenuTree(): MenuItem[] {
      const filtered = filterTopLevelRoutesByParent(currentRouteTree, 'admin')
      return generateMenuTree(filtered)
    },
  }
}

/**
 * 获取所有路由路径
 */
export function getAllRoutePaths(routes: RouteConfig[]): string[] {
  const paths: string[] = []

  function traverse(routeList: RouteConfig[]) {
    routeList.forEach(route => {
      paths.push(route.path)
      if (route.children && route.children.length > 0) {
        traverse(route.children)
      }
    })
  }

  traverse(routes)
  return paths
}

/**
 * 获取所有后端动态路由（meta.backstage）
 */
export function getBackendRoutes(routes: RouteConfig[]): RouteConfig[] {
  const result: RouteConfig[] = []

  function traverse(routeList: RouteConfig[]) {
    routeList.forEach(route => {
      if (route.meta?.backstage) result.push(route)
      if (route.children && route.children.length > 0) {
        traverse(route.children)
      }
    })
  }

  traverse(routes)
  return result
}

/**
 * 记录未授权访问
 */
export function recordUnauthorizedAccess(path: string, userRoles: string[]) {
  appLogger.warn(`🪒-Router: 未授权访问记录 - 路径: ${path}, 用户角色: ${userRoles.join(', ')}`)
}
