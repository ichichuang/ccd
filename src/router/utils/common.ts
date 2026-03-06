import type { RouteRecordRaw, Router } from 'vue-router'

/**
 * 按 meta.parent 过滤路由树，仅保留属于指定布局的路由。
 * - layoutParent === 'admin' 时保留 meta.parent 为 undefined 或 'admin' 的节点
 * - 用于侧边栏/顶栏菜单与标签页只展示 admin 布局下的路由
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
 * 仅对「顶层」按 meta.parent 过滤，子路由不做递归过滤。
 *
 * 用途：
 * - AdminSidebar 需要完整的多级菜单树（例如父级在 admin，但子级可能是 fullscreen 打开）
 * - 仅展示层级与入口；实际打开方式由 goToRoute / meta.parent 等决定
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

/**
 * 过滤meta中showLink为false的菜单
 */
export function filterShowLinkMenus(routes: RouteConfig[]): RouteConfig[] {
  return routes
    .filter(route => route.meta?.showLink !== false)
    .map(route => {
      if (route.children && route.children.length > 0) {
        const filteredChildren = filterShowLinkMenus(route.children)
        return {
          ...route,
          children: filteredChildren,
        }
      }
      return { ...route }
    })
}

/**
 * 过滤 children 长度为 0 的目录
 * 当目录下没有菜单时，会过滤此目录。
 *
 * 注意：
 * - 当前实现会在递归过程中同时应用 filterShowLinkMenus，
 *   即除了过滤「空目录」之外，还会过滤 meta.showLink === false 的子路由。
 * - 目前项目内未直接使用该函数，如需启用请确认以上行为是否符合预期。
 */
export function filterEmptyChildren(routes: RouteConfig[]): RouteConfig[] {
  const withFilteredChildren = routes.map(route => {
    if (route.children && route.children.length > 0) {
      const filteredChildren = filterShowLinkMenus(route.children)
      return {
        ...route,
        children: filteredChildren,
      }
    }
    return { ...route }
  })

  return withFilteredChildren.filter(route => {
    const hasChildren = route.children && route.children.length > 0
    if (!hasChildren && !route.component) {
      return false
    }
    return true
  })
}

/**
 * 从localStorage里取出当前登录用户的角色roles，过滤无权限的菜单
 */
export function filterNoPermissionTree(
  routes: RouteConfig[],
  userRoles: string[] = []
): RouteConfig[] {
  return routes
    .filter(route => {
      if (route.meta?.roles && route.meta.roles.length > 0) {
        if (!isOneOfArray(route.meta.roles, userRoles)) {
          return false
        }
      }
      return true
    })
    .map(route => {
      if (route.children && route.children.length > 0) {
        const filteredChildren = filterNoPermissionTree(route.children, userRoles)
        return {
          ...route,
          children: filteredChildren,
        }
      }
      return { ...route }
    })
}

/**
 * 为最底层路由添加 parentPaths 字段
 * 递归遍历路由树，为没有子路由的路由添加其所有父级路径
 */
export function addParentPathsToLeafRoutes(
  routes: RouteConfig[],
  parentPaths: string[] = []
): RouteConfig[] {
  return routes.map(route => {
    const currentRoute = { ...route }

    // 如果有子路由，递归处理
    if (route.children && route.children.length > 0) {
      // 将当前路由的path添加到父级路径中
      const newParentPaths = [...parentPaths, route.path]
      currentRoute.children = addParentPathsToLeafRoutes(route.children, newParentPaths)
    } else {
      // 如果没有子路由（叶子节点），添加parentPaths字段
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
 * 专门处理后端返回的路由数据格式
 */
export function addParentPathsToBackendRoutes(
  routes: BackendRouteConfig[],
  parentPaths: string[] = []
): BackendRouteConfig[] {
  return routes.map(route => {
    const currentRoute = { ...route }

    // 如果有子路由，递归处理
    if (route.children && route.children.length > 0) {
      // 将当前路由的path添加到父级路径中
      const newParentPaths = [...parentPaths, route.path]
      currentRoute.children = addParentPathsToBackendRoutes(route.children, newParentPaths)
    } else {
      // 如果没有子路由（叶子节点），添加parentPaths字段
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
 * 修改后的处理动态路由函数，自动添加parentPaths
 */
export function processAsyncRoutes(backendRoutes: BackendRouteConfig[]): RouteConfig[] {
  if (!Array.isArray(backendRoutes) || backendRoutes.length === 0) {
    return []
  }

  // 先添加parentPaths字段
  const routesWithParentPaths = addParentPathsToBackendRoutes(backendRoutes)

  // 然后使用原有的处理逻辑
  return routesWithParentPaths.map(route => {
    // 确保每个路由都拥有稳定的 name，避免 hasRoute(undefined) 等未定义行为
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
        backstage: true, // 标识为后端路由
        title: route.meta?.title ?? '',
        showLink: route.meta?.showLink ?? true,
      },
    }

    // ratio 默认值：当 parent 为 'ratio' 且未设置 ratio 时，设置为 '16:9'
    if (processedRoute.meta?.parent === 'ratio' && !processedRoute.meta.ratio) {
      processedRoute.meta.ratio = '16:9'
    }

    // 处理组件
    if (route.component) {
      const component = loadView(route.component as string)
      processedRoute.component = component

      // 检查组件是否加载成功（不是 404 页面）
      if (component === modules['/src/views/notfound/not-found-page.vue']) {
        console.warn(
          `🪒-Router: 路由 ${route.path} 的组件 ${route.component} 未找到，已使用 404 页面替代`
        )
        // 可以在这里设置一个标识，表示该路由使用了回退组件
        if (processedRoute.meta) {
          processedRoute.meta.useFallbackComponent = true
        }
      }
    }

    // 处理重定向：如果有子路由且没有设置重定向，默认重定向到第一个子路由
    if (route.children && route.children.length > 0 && !route.redirect) {
      processedRoute.redirect = route.children[0].path
    }

    // 处理路由名称：如果有子路由且没有设置名称，使用第一个子路由的名称加Parent后缀
    if (route.children && route.children.length > 0 && !route.name) {
      processedRoute.name = (route.children[0].name || 'Unknown') + 'Parent'
    }

    // 递归处理子路由
    if (route.children && route.children.length > 0) {
      processedRoute.children = processAsyncRoutes(route.children as BackendRouteConfig[])
    }

    return processedRoute
  })
}

/**
 * 一维数组处理成多级嵌套数组
 * 三级及以上的路由全部拍成二级，keep-alive 只支持到二级缓存
 */
export function formatTwoStageRoutes(routesList: RouteConfig[]): RouteConfig[] {
  if (routesList.length === 0) {
    return routesList
  }

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
  if (routesList.length === 0) {
    return routesList
  }

  const flatRoutes: RouteConfig[] = []

  function flatten(routes: RouteConfig[], parentPath = '') {
    routes.forEach(route => {
      const currentPath = parentPath
        ? `${parentPath}/${route.path}`.replace(/\/+/g, '/')
        : route.path

      flatRoutes.push({
        ...route,
        path: currentPath,
        children: undefined, // 移除children，变成扁平结构
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
 * 通过指定 key 获取父级路径集合
 * 默认 key 为 path
 */
export function getParentPaths(
  value: string,
  routes: RouteConfig[],
  key: keyof RouteConfig = 'path'
): string[] {
  function dfs(routes: RouteConfig[], value: string, parents: string[]): string[] {
    for (let i = 0; i < routes.length; i++) {
      const item = routes[i]
      // 返回父级path
      if (item[key] === value) {
        return parents
      }
      // children不存在或为空则不递归
      if (!item.children || !item.children.length) {
        continue
      }
      // 往下查找时将当前path入栈
      parents.push(item.path)

      if (dfs(item.children, value, parents).length) {
        return parents
      }
      // 深度遍历查找未找到时当前path出栈
      parents.pop()
    }
    // 未找到时返回空数组
    return []
  }

  return dfs(routes, value, [])
}

/**
 * 获取当前页面按钮级别的权限
 */
export function getAuths(route?: RouteConfig): string[] {
  return route?.meta?.auths || []
}

/**
 * 是否有按钮级别的权限
 * 根据路由meta中的auths字段进行判断
 */
export function hasAuth(value: string | string[], userPermissions: string[]): boolean {
  if (!value) {
    return false
  }

  const authList = Array.isArray(value) ? value : [value]

  // 如果用户有 *:*:* 权限，表示超级管理员
  if (userPermissions.includes('*:*:*')) {
    return true
  }

  // 检查是否包含所需权限
  return authList.every(auth => userPermissions.includes(auth))
}

/**
 * 路由排序函数
 * 按照 meta.rank 升序排序，未设置 rank 的路由排在最后
 */
export function sortRoutes(routes: RouteConfig[]): RouteConfig[] {
  return [...routes].sort((a, b) => {
    const rankA = a.meta?.rank ?? 999
    const rankB = b.meta?.rank ?? 999
    return rankA - rankB
  })
}

/**
 * 扁平化路由
 * 将嵌套路由展开为一维数组，便于查找和处理
 */
export function flattenRoutes(routes: RouteConfig[]): RouteConfig[] {
  const result: RouteConfig[] = []

  function traverse(routeList: RouteConfig[], parent?: RouteConfig) {
    routeList.forEach(route => {
      // 创建路由副本，避免修改原对象
      const flatRoute: RouteConfig = {
        ...route,
        meta: route.meta
          ? {
              ...route.meta,
              // 如果是子路由，可以添加父路由信息（但不改变必需的 title）
              ...(parent &&
                route.meta.title && {
                  parentPath: parent.path,
                  parentTitle: parent.meta?.title,
                }),
            }
          : undefined,
      }

      result.push(flatRoute)

      // 递归处理子路由
      if (route.children && route.children.length > 0) {
        traverse(route.children, route)
      }
    })
  }

  traverse(routes)
  return result
}

/**
 * 生成菜单树
 * 从路由配置生成用于渲染菜单的树结构
 */
export function generateMenuTree(routes: RouteConfig[]): MenuItem[] {
  function transformRoute(route: RouteConfig): MenuItem | null {
    const { path, name, meta, children } = route

    // 如果明确设置不显示，则跳过
    if (meta?.showLink === false) {
      return null
    }

    // 如果没有 title 或 titleKey，跳过该路由
    if (!meta?.titleKey && !meta?.title) {
      return null
    }

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

    // 处理子菜单
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
 * 菜单项排序
 */
function sortMenuItems(menuItems: MenuItem[]): MenuItem[] {
  return menuItems.sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
}

/**
 * 生成面包屑映射
 * 为每个路由路径生成对应的面包屑路径
 */
export function generateBreadcrumbMap(routes: RouteConfig[]): Map<string, string[]> {
  const breadcrumbMap = new Map<string, string[]>()

  function traverse(routeList: RouteConfig[], breadcrumb: string[] = []) {
    routeList.forEach(route => {
      const { path, meta, children } = route

      // 如果设置了隐藏面包屑，则不加入面包屑
      if (!meta?.hideBreadcrumb) {
        // 优先使用 titleKey，如果没有则使用 title
        const title = meta?.titleKey ? meta.titleKey : meta?.title
        if (title) {
          const currentBreadcrumb = [...breadcrumb, title]
          breadcrumbMap.set(path, currentBreadcrumb)

          // 递归处理子路由
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

/**
 * 检查路由权限
 * 根据用户角色检查是否有访问路由的权限
 */
export function checkRoutePermission(route: RouteConfig, userRoles: string[]): boolean {
  const { roles } = route.meta || {}

  // 如果路由没有设置权限要求，则允许访问
  if (!roles || roles.length === 0) {
    return true
  }

  // 检查用户角色是否匹配路由要求的角色
  return roles.some(role => userRoles.includes(role))
}

/**
 * 过滤有权限的路由
 * 根据用户角色过滤用户有权限访问的路由
 */
export function filterAuthorizedRoutes(routes: RouteConfig[], userRoles: string[]): RouteConfig[] {
  return routes
    .filter(route => checkRoutePermission(route, userRoles))
    .map(route => {
      if (route.children && route.children.length > 0) {
        const filteredChildren = filterAuthorizedRoutes(route.children, userRoles)
        return {
          ...route,
          children: filteredChildren,
        }
      }
      return { ...route }
    })
}

/**
 * 根据路径查找路由
 */
export function findRouteByPath(routes: RouteConfig[], targetPath: string): RouteConfig | null {
  for (const route of routes) {
    if (route.path === targetPath) {
      return route
    }

    if (route.children && route.children.length > 0) {
      const found = findRouteByPath(route.children, targetPath)
      if (found) {
        return found
      }
    }
  }

  return null
}

/**
 * 转换路由配置为 Vue Router 格式
 */
export function transformToVueRoutes(routes: RouteConfig[]): RouteRecordRaw[] {
  const normalizedRoutes = normalizeRatioMetaOnRoutes(routes)
  return normalizedRoutes.map(route => {
    // 构建基础路由对象
    const vueRoute = {
      path: route.path,
      component: route.component,
      meta: route.meta as Record<string, any>,
    } as RouteRecordRaw

    // 只有当确实存在时才添加这些可选属性
    if (route.name) {
      vueRoute.name = route.name
    }

    if (route.redirect) {
      vueRoute.redirect = route.redirect
    }

    if (route.children && route.children.length > 0) {
      vueRoute.children = transformToVueRoutes(route.children)
    }

    return vueRoute as RouteRecordRaw
  })
}

/**
 * 归一化 routes：当 meta.parent 为 'ratio' 且未设置 meta.ratio 时，设置默认值为 '16:9'
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
 * 根据路由配置自动生成需要缓存的页面 name 列表
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
 * 创建路由工具集
 * 提供完整的路由处理工具
 */
export function createRouteUtils(routes: RouteConfig[]): RouteUtils {
  const normalizedRoutes = normalizeRatioMetaOnRoutes(routes)
  const sortedRoutes = sortRoutes([...normalizedRoutes])
  let currentRouteTree: RouteConfig[] = sortedRoutes

  return {
    flatRoutes: flattenRoutes(sortedRoutes),
    menuTree: generateMenuTree(sortedRoutes),
    breadcrumbMap: generateBreadcrumbMap(sortedRoutes),
    keepAliveNames: getKeepAliveNames(sortedRoutes),
    updateRouteUtils(newRoutes: RouteConfig[]) {
      const normalized = normalizeRatioMetaOnRoutes(newRoutes)
      const newSortedRoutes = sortRoutes([...normalized])
      currentRouteTree = newSortedRoutes
      this.flatRoutes = flattenRoutes(newSortedRoutes)
      this.menuTree = generateMenuTree(newSortedRoutes)
      this.breadcrumbMap = generateBreadcrumbMap(newSortedRoutes)
      this.keepAliveNames = getKeepAliveNames(newSortedRoutes)
    },
    getAdminMenuTree(): MenuItem[] {
      // 侧栏菜单：仅过滤顶层，保留完整子树以支持多级目录
      const filtered = filterTopLevelRoutesByParent(currentRouteTree, 'admin')
      return generateMenuTree(filtered)
    },
  }
}

/**
 * 获取所有路由路径
 * 用于权限校验或路由守卫
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
 * 获取所有后端动态路由（根据 meta.backstage 标记）
 * 仅用于调试或统计，不会修改原始路由结构
 */
export function getBackendRoutes(routes: RouteConfig[]): RouteConfig[] {
  const result: RouteConfig[] = []

  function traverse(routeList: RouteConfig[]) {
    routeList.forEach(route => {
      if (route.meta?.backstage) {
        result.push(route)
      }
      if (route.children && route.children.length > 0) {
        traverse(route.children)
      }
    })
  }

  traverse(routes)
  return result
}

/**
 * 动态路由管理器
 * 提供动态路由的添加、删除、重置等功能
 */
export function createDynamicRouteManager(router: Router) {
  const dynamicRoutes: RouteConfig[] = []

  return {
    /**
     * 添加动态路由
     */
    addRoute(route: RouteConfig) {
      // 动态路由必须具备稳定的 name，避免 hasRoute(undefined) 等未定义行为
      if (!route.name) {
        console.error(
          '🪒-Router: 动态路由缺少 name，已忽略当前路由。请为该路由配置唯一的 name。',
          route
        )
        return
      }

      // 防止重复添加
      const existingIndex = dynamicRoutes.findIndex(r => r.path === route.path)
      if (existingIndex !== -1) {
        dynamicRoutes[existingIndex] = route
      } else {
        dynamicRoutes.push(route)
      }

      // 转换为 Vue Router 格式并添加
      const vueRoute = transformToVueRoutes([route])[0]
      if (vueRoute.name && !router.hasRoute(vueRoute.name)) {
        router.addRoute(vueRoute)
      }
    },

    /**
     * 批量添加动态路由
     */
    addRoutes(routes: RouteConfig[]) {
      routes.forEach(route => this.addRoute(route))
    },

    /**
     * 移除动态路由
     */
    removeRoute(name: string) {
      const index = dynamicRoutes.findIndex(r => r.name === name)
      if (index !== -1) {
        dynamicRoutes.splice(index, 1)
        if (router.hasRoute(name)) {
          router.removeRoute(name)
        }
      }
    },

    /**
     * 清空所有动态路由
     */
    clearRoutes() {
      dynamicRoutes.forEach(route => {
        if (route.name && router.hasRoute(route.name)) {
          router.removeRoute(route.name)
        }
      })
      dynamicRoutes.length = 0
    },

    /**
     * 获取所有动态路由
     */
    getRoutes() {
      return [...dynamicRoutes]
    },

    /**
     * 重置路由
     */
    resetRouter() {
      this.clearRoutes()
      // 这里可以重新添加静态路由
    },
  }
}

const modules = import.meta.glob('@/views/**/*.{vue,tsx}')

/**
 * 根据路由 path 生成稳定的名称
 * 例如：
 * - '/'              -> 'Index'
 * - '/system/user'   -> 'SystemUser'
 * - '/user/:id/edit' -> 'UserIdEdit'
 */
function generateNameByPath(path: string): string {
  if (!path || path === '/') return 'Index'

  // 移除开头的 '/'
  let name = path.replace(/^\//, '')
  // 将 '/:id' 形式的动态段落转为 '-id'
  name = name.replace(/\/:/g, '-')
  // 其余 '/' 统一替换为 '-'
  name = name.replace(/\//g, '-')

  // 将 'system-user' 转为 'SystemUser'
  const pascal = name
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

  return pascal || 'Unknown'
}

/**import { log } from '../../../scripts/utils/logger';

 * 根据后端 component 字符串获取实际组件
 * @param componentName 例如 'login'、'permission-page'
 */
export function loadView(componentName: string) {
  // 支持的文件扩展名
  const supportedExtensions = ['.vue', '.tsx', '.jsx']

  // 解析组件名称，支持多种命名规范
  const componentPath = parseComponentPath(componentName)

  // 查找匹配的组件文件
  const matchedComponent = findComponentFile(componentPath, supportedExtensions)

  if (matchedComponent) {
    return matchedComponent
  }

  // 如果没找到组件，记录错误并返回 404 页面
  console.error(`🪒-Router: ❌ 组件未找到: ${componentName}`)
  console.error(`🪒-Router: 🔍 尝试的路径: ${componentPath.join(', ')}`)
  console.error(`🪒-Router: 📁 可用的模块:`, Object.keys(modules))

  // 返回 404 页面作为回退
  return modules['/src/views/notfound/not-found-page.vue']
}

/**
 * 解析组件路径，支持多种命名规范
 * @param componentName 组件名称
 * @returns 可能的组件路径数组
 */
function parseComponentPath(componentName: string): string[] {
  const paths: string[] = []

  // 规范 1: @permission/ -> src/views/permission/views/permission-*.vue
  if (componentName.startsWith('@')) {
    const [module, ...rest] = componentName.split('/')
    const moduleName = module.substring(1) // 去掉 @ 符号

    if (rest.length > 0) {
      const componentFile = rest.join('/')
      paths.push(`/src/views/${moduleName}/views/${componentFile}`)
    } else {
      // 如果没有子路径，尝试 index.vue
      paths.push(`/src/views/${moduleName}/index`)
    }
  }
  // 规范 2: permission/views/permission-page -> src/views/permission/views/permission-page.vue
  else if (componentName.includes('/')) {
    // 直接使用完整路径
    paths.push(`/src/views/${componentName}`)
  }
  // 规范 3: permission-page -> src/views/permission/views/permission-page.vue
  else if (componentName.includes('-')) {
    const [firstPart] = componentName.split('-')
    const componentFile = componentName
    paths.push(`/src/views/${firstPart}/views/${componentFile}`)
  }
  // 规范 4: permission -> src/views/permission/index.vue
  else {
    paths.push(`/src/views/${componentName}/index`)
  }

  return paths
}

/**
 * 查找组件文件
 * @param possiblePaths 可能的路径数组
 * @param extensions 支持的文件扩展名
 * @returns 找到的组件或 null
 */
function findComponentFile(
  possiblePaths: string[],
  extensions: string[]
): (() => Promise<unknown>) | null {
  // 遍历所有可能的路径
  for (const basePath of possiblePaths) {
    // 遍历所有支持的文件扩展名
    for (const ext of extensions) {
      const fullPath = `${basePath}${ext}`

      // 检查是否存在完全匹配的路径
      if (modules[fullPath]) {
        return modules[fullPath]
      }

      // 使用模糊匹配查找最接近的路径
      const matchedPath = findClosestPath(fullPath)
      if (matchedPath) {
        return modules[matchedPath]
      }
    }
  }

  return null
}

/**
 * 查找最接近的路径
 * @param targetPath 目标路径
 * @returns 最接近的路径或 null
 */
function findClosestPath(targetPath: string): string | null {
  const availablePaths = Object.keys(modules)

  // 精确匹配
  if (availablePaths.includes(targetPath)) {
    return targetPath
  }

  // 模糊匹配：查找包含目标路径关键部分的文件
  const targetParts = targetPath.split('/').filter(Boolean)

  for (const availablePath of availablePaths) {
    const availableParts = availablePath.split('/').filter(Boolean)

    // 检查路径的相似度
    if (isPathSimilar(targetParts, availableParts)) {
      return availablePath
    }
  }

  return null
}

/**
 * 检查两个路径是否相似
 * @param path1 路径1的部分
 * @param path2 路径2的部分
 * @returns 是否相似
 */
function isPathSimilar(path1: string[], path2: string[]): boolean {
  // 如果长度差异太大，认为不相似
  if (Math.abs(path1.length - path2.length) > 2) {
    return false
  }

  // 检查关键部分是否匹配
  const minLength = Math.min(path1.length, path2.length)
  let matchCount = 0

  for (let i = 0; i < minLength; i++) {
    if (path1[i] === path2[i] || path1[i].includes(path2[i]) || path2[i].includes(path1[i])) {
      matchCount++
    }
  }

  // 如果匹配度超过 70%，认为相似
  return matchCount / minLength >= 0.7
}

/**
 * 记录未授权访问
 * @param path 路径
 * @param userRoles 用户角色
 */
export function recordUnauthorizedAccess(path: string, userRoles: string[]) {
  console.warn(`🪒-Router: 未授权访问记录 - 路径: ${path}, 用户角色: ${userRoles.join(', ')}`)
}

/**
 * 验证组件文件是否存在
 * @param componentName 组件名称
 * @returns 验证结果对象
 */
export function validateComponentFile(componentName: string): {
  exists: boolean
  foundPath: string | null
  possiblePaths: string[]
  availableModules: string[]
} {
  const supportedExtensions = ['.vue', '.tsx', '.jsx']
  const componentPath = parseComponentPath(componentName)
  const matchedComponent = findComponentFile(componentPath, supportedExtensions)

  const availableModules = Object.keys(modules)
  const foundPath = matchedComponent
    ? availableModules.find(path => modules[path] === matchedComponent) || null
    : null

  return {
    exists: !!matchedComponent,
    foundPath,
    possiblePaths: componentPath
      .map(path => supportedExtensions.map(ext => `${path}${ext}`))
      .flat(),
    availableModules,
  }
}

/**
 * 获取所有可用的组件路径
 * @returns 所有可用的组件路径数组
 */
export function getAvailableComponentPaths(): string[] {
  return Object.keys(modules)
}

/**
 * 检查组件是否使用了回退组件（404页面）
 * @param component 组件对象
 * @returns 是否使用了回退组件
 */
export function isUsingFallbackComponent(component: unknown): boolean {
  return component === modules['/src/views/notfound/not-found-page.vue']
}

/**
 * 检查数组是否有交集
 * 用于权限检查
 */
function isOneOfArray(a: string[], b: string[]): boolean {
  return Array.isArray(a) && Array.isArray(b) ? a.some(item => b.includes(item)) : false
}
