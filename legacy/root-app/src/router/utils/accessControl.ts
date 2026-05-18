/**
 * 路由访问控制：纯函数模块
 * 职责：所有权限判断逻辑的 SSOT，零 UI 依赖，零 store 导入。
 */

/** 检查用户角色是否满足路由要求 (ANY — 至少匹配一个) */
export function checkRouteRoles(requiredRoles: string[] | undefined, userRoles: string[]): boolean {
  // Empty/undefined roles = unrestricted
  if (!requiredRoles || requiredRoles.length === 0) {
    return true
  }
  // User needs at least one matching role (ANY logic)
  return requiredRoles.some((role: string) => userRoles.includes(role))
}

/** 检查用户权限是否满足路由要求 (ALL — 必须拥有全部) */
export function checkRouteAuths(
  requiredAuths: string[] | undefined,
  userPermissions: string[]
): boolean {
  // Empty/undefined auths = unrestricted
  if (!requiredAuths || requiredAuths.length === 0) {
    return true
  }
  // Wildcard → always pass
  if (userPermissions.includes('*:*:*')) {
    return true
  }
  // User needs ALL listed auths (AND logic)
  return requiredAuths.every((auth: string) => userPermissions.includes(auth))
}

/** 统一路由访问检查：roles (ANY) + auths (ALL) */
export function checkRouteAccess(
  meta: { roles?: string[]; auths?: string[] } | undefined,
  userRoles: string[],
  userPermissions: string[]
): boolean {
  if (!meta) {
    return true
  }
  const rolesPass: boolean = checkRouteRoles(meta.roles, userRoles)
  const authsPass: boolean = checkRouteAuths(meta.auths, userPermissions)
  return rolesPass && authsPass
}

/**
 * 标准化路径：确保以 / 开头
 */
function normalizePath(path: string): string {
  const trimmed: string = path.trim()
  if (trimmed.length === 0) {
    return '/'
  }
  if (!trimmed.startsWith('/')) {
    return `/${trimmed}`
  }
  return trimmed
}

/** 通配白名单路径匹配 */
export function isWhiteListed(path: string, whiteList: readonly string[]): boolean {
  const normalized: string = normalizePath(path)

  for (const entry of whiteList) {
    if (entry.endsWith('/**')) {
      // Prefix match with boundary protection
      const prefix: string = entry.slice(0, -3)
      if (normalized === prefix) {
        return true
      }
      if (normalized.startsWith(`${prefix}/`)) {
        return true
      }
    } else {
      // Exact match
      if (normalized === entry) {
        return true
      }
    }
  }

  return false
}

/** 安全重定向解析 */
export function parseSafeRedirect(
  rawRedirect: string | undefined
): { path: string; query: Record<string, string> } | null {
  // 1. Empty → null
  if (!rawRedirect || rawRedirect.trim().length === 0) {
    return null
  }

  // 2. decodeURIComponent
  let decoded: string
  try {
    decoded = decodeURIComponent(rawRedirect)
  } catch {
    return null
  }

  // 3. Reject absolute URLs (http://, https://, //, ://)
  if (
    decoded.startsWith('http://') ||
    decoded.startsWith('https://') ||
    decoded.startsWith('//') ||
    decoded.includes('://')
  ) {
    return null
  }

  // 4. Must start with /
  if (!decoded.startsWith('/')) {
    return null
  }

  // 5. Reject path traversal (/../ or ending /.. or \)
  if (decoded.includes('/../') || decoded.endsWith('/..') || decoded.includes('\\')) {
    return null
  }

  // 6. Split path and query at first ?
  const questionIndex: number = decoded.indexOf('?')
  let rawPath: string = questionIndex === -1 ? decoded : decoded.slice(0, questionIndex)
  const rawQuery: string = questionIndex === -1 ? '' : decoded.slice(questionIndex + 1)

  // 7. Normalize path: collapse //, strip trailing / (except root)
  rawPath = rawPath.replace(/\/+/g, '/')
  if (rawPath.length > 1 && rawPath.endsWith('/')) {
    rawPath = rawPath.slice(0, -1)
  }

  // 8. Parse query string → Record<string, string>
  const query: Record<string, string> = {}
  if (rawQuery.length > 0) {
    const pairs: string[] = rawQuery.split('&')
    for (const pair of pairs) {
      const eqIndex: number = pair.indexOf('=')
      if (eqIndex === -1) {
        const key: string = pair.trim()
        if (key.length > 0) {
          query[key] = ''
        }
      } else {
        const key: string = pair.slice(0, eqIndex).trim()
        const value: string = pair.slice(eqIndex + 1)
        if (key.length > 0) {
          query[key] = value
        }
      }
    }
  }

  // 9. Re-validate normalized path starts with / and no ..
  if (!rawPath.startsWith('/') || rawPath.includes('..')) {
    return null
  }

  // 10. Return { path, query }
  return { path: rawPath, query }
}

/**
 * 菜单权限检查 (OR 逻辑 — 用于菜单可见性)
 * 与路由权限 (ALL) 不同，菜单只需匹配任一权限即可显示
 */
function checkMenuAuths(requiredAuths: string[] | undefined, userPermissions: string[]): boolean {
  if (!requiredAuths || requiredAuths.length === 0) {
    return true
  }
  if (userPermissions.includes('*:*:*')) {
    return true
  }
  // OR logic for menu visibility
  return requiredAuths.some((auth: string) => userPermissions.includes(auth))
}

/** 菜单访问过滤：roles (ANY) + auths (OR) */
export function filterMenuByAccess(
  menus: MenuItem[],
  userRoles: string[],
  userPermissions: string[]
): MenuItem[] {
  const result: MenuItem[] = []

  for (const menu of menus) {
    // 1. Check roles (ANY match)
    const rolesPass: boolean = checkRouteRoles(menu.roles, userRoles)
    if (!rolesPass) {
      continue
    }

    // 2. Check auths (OR match for menu visibility)
    const authsPass: boolean = checkMenuAuths(menu.auths, userPermissions)
    if (!authsPass) {
      continue
    }

    // 3. Recursively filter children (immutable — new object)
    if (menu.children && menu.children.length > 0) {
      const filteredChildren: MenuItem[] = filterMenuByAccess(
        menu.children,
        userRoles,
        userPermissions
      )
      const cloned: MenuItem = { ...menu, children: filteredChildren }
      result.push(cloned)
    } else {
      const cloned: MenuItem = { ...menu }
      result.push(cloned)
    }
  }

  return result
}
