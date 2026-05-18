/**
 * 菜单与面包屑：按 parent/showLink/权限过滤、菜单树生成、面包屑映射
 * 职责：仅处理菜单树与面包屑结构，不负责路由扁平化或组件解析。
 */

/** 检查数组是否有交集（用于权限） */
function isOneOfArray(a: string[], b: string[]): boolean {
  return Array.isArray(a) && Array.isArray(b) ? a.some(item => b.includes(item)) : false
}

/**
 * 按 meta.parent 过滤路由树，仅保留属于指定布局的路由
 */
export function filterRoutesByParent(
  routes: RouteConfig[],
  layoutParent: LayoutMode
): RouteConfig[] {
  return routes
    .filter(route => {
      const parent = route.meta?.parent as LayoutMode | undefined
      if (layoutParent === 'admin') {
        if (parent === 'fullscreen' || parent === 'ratio') return false
        return true
      }
      return parent === layoutParent
    })
    .map(route => ({
      ...route,
      children:
        route.children && route.children.length > 0
          ? filterRoutesByParent(route.children, layoutParent)
          : undefined,
    }))
}

/**
 * 仅对「顶层」按 meta.parent 过滤，子路由不做递归过滤
 */
export function filterTopLevelRoutesByParent(
  routes: RouteConfig[],
  layoutParent: LayoutMode
): RouteConfig[] {
  return routes
    .filter(route => {
      const parent = route.meta?.parent as LayoutMode | undefined
      if (layoutParent === 'admin') {
        return parent !== 'fullscreen' && parent !== 'ratio'
      }
      return parent === layoutParent
    })
    .map(route => ({ ...route }))
}

/** 过滤 meta.showLink 为 false 的菜单 */
export function filterShowLinkMenus(routes: RouteConfig[]): RouteConfig[] {
  return routes
    .filter(route => route.meta?.showLink !== false)
    .map(route => {
      if (route.children && route.children.length > 0) {
        const filteredChildren = filterShowLinkMenus(route.children)
        return { ...route, children: filteredChildren }
      }
      return { ...route }
    })
}

/**
 * 过滤 children 长度为 0 的目录
 */
export function filterEmptyChildren(routes: RouteConfig[]): RouteConfig[] {
  const withFilteredChildren = routes.map(route => {
    if (route.children && route.children.length > 0) {
      return {
        ...route,
        children: filterShowLinkMenus(route.children),
      }
    }
    return { ...route }
  })

  return withFilteredChildren.filter(route => {
    const hasChildren = route.children && route.children.length > 0
    if (!hasChildren && !route.component) return false
    return true
  })
}

/**
 * 根据用户角色和权限标识过滤无权限的菜单
 * - roles: ANY 匹配（用户拥有任一角色即可）
 * - auths: OR 匹配（用户拥有任一权限即可，'*:*:*' 为通配符）
 */
export function filterNoPermissionTree(
  routes: RouteConfig[],
  userRoles: string[] = [],
  userPermissions: string[] = []
): RouteConfig[] {
  return routes
    .filter(route => {
      if (route.meta?.roles && route.meta.roles.length > 0) {
        if (!isOneOfArray(route.meta.roles, userRoles)) return false
      }
      if (route.meta?.auths && route.meta.auths.length > 0) {
        if (
          !userPermissions.includes('*:*:*') &&
          !route.meta.auths.some(auth => userPermissions.includes(auth))
        )
          return false
      }
      return true
    })
    .map(route => {
      if (route.children && route.children.length > 0) {
        const filteredChildren = filterNoPermissionTree(route.children, userRoles, userPermissions)
        return { ...route, children: filteredChildren }
      }
      return { ...route }
    })
}

/** 菜单项排序 */
function sortMenuItems(menuItems: MenuItem[]): MenuItem[] {
  return [...menuItems].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
}

/**
 * 生成菜单树
 */
export function generateMenuTree(routes: RouteConfig[]): MenuItem[] {
  function transformRoute(route: RouteConfig): MenuItem | null {
    const { path, name, meta, children } = route
    if (meta?.showLink === false) return null
    if (!meta?.titleKey && !meta?.title) return null

    const menuItem: MenuItem = {
      path,
      name: name as string,
      titleKey: meta.titleKey,
      title: meta.title || (name as string),
      icon: meta.icon,
      showLink: meta.showLink ?? true,
      rank: typeof meta.rank === 'number' ? meta.rank : 999,
      roles: meta.roles,
      auths: meta.auths,
      children: [],
      meta,
    }

    if (children && children.length > 0) {
      const childMenus = children.map(transformRoute).filter(Boolean) as MenuItem[]
      if (childMenus.length > 0) {
        menuItem.children = sortMenuItems(childMenus)
      }
    }

    return menuItem
  }

  const menuItems = routes.map(transformRoute).filter(Boolean) as MenuItem[]
  return sortMenuItems(menuItems)
}

/**
 * 生成面包屑映射
 */
export function generateBreadcrumbMap(routes: RouteConfig[]): Map<string, string[]> {
  const breadcrumbMap = new Map<string, string[]>()

  function traverse(routeList: RouteConfig[], breadcrumb: string[] = []) {
    routeList.forEach(route => {
      const { path, meta, children } = route
      if (!meta?.hideBreadcrumb) {
        const title = meta?.titleKey ? meta.titleKey : meta?.title
        if (title) {
          const currentBreadcrumb = [...breadcrumb, title]
          breadcrumbMap.set(path, currentBreadcrumb)
          if (children && children.length > 0) {
            traverse(children, currentBreadcrumb)
          }
        }
      }
    })
  }

  traverse(routes)
  return breadcrumbMap
}
