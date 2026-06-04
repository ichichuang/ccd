export interface RouteAccessRequirement {
  readonly roles?: readonly string[]
  readonly auths?: readonly string[]
}

export interface SafeRedirectParseResult {
  readonly path: string
  readonly query: Record<string, string>
}

export interface MenuAccessNode {
  readonly roles?: readonly string[]
  readonly auths?: readonly string[]
  readonly children?: readonly MenuAccessNode[]
}

/** Checks route roles with ANY semantics. */
export function checkRouteRoles(
  requiredRoles: readonly string[] | undefined,
  userRoles: readonly string[]
): boolean {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true
  }
  return requiredRoles.some(role => userRoles.includes(role))
}

/** Checks route permissions with ALL semantics. */
export function checkRouteAuths(
  requiredAuths: readonly string[] | undefined,
  userPermissions: readonly string[]
): boolean {
  if (!requiredAuths || requiredAuths.length === 0) {
    return true
  }
  if (userPermissions.includes('*:*:*')) {
    return true
  }
  return requiredAuths.every(auth => userPermissions.includes(auth))
}

/** Checks route roles (ANY) and permissions (ALL). */
export function checkRouteAccess(
  meta: RouteAccessRequirement | undefined,
  userRoles: readonly string[],
  userPermissions: readonly string[]
): boolean {
  if (!meta) {
    return true
  }
  return checkRouteRoles(meta.roles, userRoles) && checkRouteAuths(meta.auths, userPermissions)
}

function normalizePath(path: string): string {
  const trimmed = path.trim()
  if (trimmed.length === 0) {
    return '/'
  }
  if (!trimmed.startsWith('/')) {
    return `/${trimmed}`
  }
  return trimmed
}

export function isWhiteListed(path: string, whiteList: readonly string[]): boolean {
  const normalized = normalizePath(path)

  for (const entry of whiteList) {
    if (entry.endsWith('/**')) {
      const prefix = entry.slice(0, -3)
      if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
        return true
      }
      continue
    }

    if (normalized === entry) {
      return true
    }
  }

  return false
}

export function parseSafeRedirect(rawRedirect: string | undefined): SafeRedirectParseResult | null {
  if (!rawRedirect || rawRedirect.trim().length === 0) {
    return null
  }

  let decoded: string
  try {
    decoded = decodeURIComponent(rawRedirect)
  } catch {
    return null
  }

  if (
    decoded.startsWith('http://') ||
    decoded.startsWith('https://') ||
    decoded.startsWith('//') ||
    decoded.includes('://')
  ) {
    return null
  }

  if (!decoded.startsWith('/')) {
    return null
  }

  if (decoded.includes('/../') || decoded.endsWith('/..') || decoded.includes('\\')) {
    return null
  }

  const questionIndex = decoded.indexOf('?')
  let rawPath = questionIndex === -1 ? decoded : decoded.slice(0, questionIndex)
  const rawQuery = questionIndex === -1 ? '' : decoded.slice(questionIndex + 1)

  rawPath = rawPath.replace(/\/+/g, '/')
  if (rawPath.length > 1 && rawPath.endsWith('/')) {
    rawPath = rawPath.slice(0, -1)
  }

  const query: Record<string, string> = {}
  if (rawQuery.length > 0) {
    for (const pair of rawQuery.split('&')) {
      const eqIndex = pair.indexOf('=')
      if (eqIndex === -1) {
        const key = pair.trim()
        if (key.length > 0) {
          query[key] = ''
        }
        continue
      }

      const key = pair.slice(0, eqIndex).trim()
      const value = pair.slice(eqIndex + 1)
      if (key.length > 0) {
        query[key] = value
      }
    }
  }

  if (!rawPath.startsWith('/') || rawPath.includes('..')) {
    return null
  }

  return { path: rawPath, query }
}

function checkMenuAuths(
  requiredAuths: readonly string[] | undefined,
  userPermissions: readonly string[]
): boolean {
  if (!requiredAuths || requiredAuths.length === 0) {
    return true
  }
  if (userPermissions.includes('*:*:*')) {
    return true
  }
  return requiredAuths.some(auth => userPermissions.includes(auth))
}

export function filterMenuByAccess<TMenu extends MenuAccessNode>(
  menus: readonly TMenu[],
  userRoles: readonly string[],
  userPermissions: readonly string[]
): TMenu[] {
  const result: TMenu[] = []

  for (const menu of menus) {
    if (!checkRouteRoles(menu.roles, userRoles)) {
      continue
    }

    if (!checkMenuAuths(menu.auths, userPermissions)) {
      continue
    }

    if (menu.children && menu.children.length > 0) {
      const filteredChildren = filterMenuByAccess(menu.children, userRoles, userPermissions)
      result.push({ ...menu, children: filteredChildren } as TMenu)
      continue
    }

    result.push({ ...menu })
  }

  return result
}
