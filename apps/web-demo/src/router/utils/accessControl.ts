/**
 * 路由访问控制兼容 facade。
 * 纯 helper 实现由 @ccd/vue-app-platform 持有；app 层保留原导入路径与 M1 contracts 类型。
 */
import {
  checkRouteAccess as checkRouteAccessInPlatform,
  checkRouteAuths as checkRouteAuthsInPlatform,
  checkRouteRoles as checkRouteRolesInPlatform,
  filterMenuByAccess as filterMenuByAccessInPlatform,
  isWhiteListed as isWhiteListedInPlatform,
  parseSafeRedirect as parseSafeRedirectInPlatform,
} from '@ccd/vue-app-platform'
import type { MenuAccessItem, RouteAccessMeta, SafeRedirectResult } from '@ccd/contracts'

/** 检查用户角色是否满足路由要求 (ANY — 至少匹配一个) */
export function checkRouteRoles(
  requiredRoles: RouteAccessMeta['roles'] | undefined,
  userRoles: readonly string[]
): boolean {
  return checkRouteRolesInPlatform(requiredRoles, userRoles)
}

/** 检查用户权限是否满足路由要求 (ALL — 必须拥有全部) */
export function checkRouteAuths(
  requiredAuths: RouteAccessMeta['auths'] | undefined,
  userPermissions: readonly string[]
): boolean {
  return checkRouteAuthsInPlatform(requiredAuths, userPermissions)
}

/** 统一路由访问检查：roles (ANY) + auths (ALL) */
export function checkRouteAccess(
  meta: RouteAccessMeta | undefined,
  userRoles: readonly string[],
  userPermissions: readonly string[]
): boolean {
  return checkRouteAccessInPlatform(meta, userRoles, userPermissions)
}

/** 通配白名单路径匹配 */
export function isWhiteListed(path: string, whiteList: readonly string[]): boolean {
  return isWhiteListedInPlatform(path, whiteList)
}

/** 安全重定向解析 */
export function parseSafeRedirect(rawRedirect: string | undefined): SafeRedirectResult | null {
  return parseSafeRedirectInPlatform(rawRedirect)
}

/** 菜单访问过滤：roles (ANY) + auths (OR) */
export function filterMenuByAccess(
  menus: (MenuItem & MenuAccessItem)[],
  userRoles: readonly string[],
  userPermissions: readonly string[]
): MenuItem[] {
  return filterMenuByAccessInPlatform(menus, userRoles, userPermissions)
}
