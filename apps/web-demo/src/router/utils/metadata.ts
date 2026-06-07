import type { LocaleMessages } from '@/locales'
import type { RouteIconClassName, RouteTitleKey } from '@/types/modules/router'
import type { RouteRecordName } from 'vue-router'

export type RouteMetadataField =
  | 'titleKey'
  | 'icon'
  | 'rank'
  | 'roles'
  | 'auths'
  | 'redirect'
  | 'name'

export interface RouteMetadataIssue {
  field: RouteMetadataField
  route: string
  message: string
}

export interface RouteMetadataValidationContext {
  registeredPaths: ReadonlySet<string>
  registeredNames: ReadonlySet<RouteRecordName>
  localeMessages?: Readonly<Record<string, LocaleMessages>>
}

export interface RegisteredRouteMetadataValidationOptions {
  localeMessages?: Readonly<Record<string, LocaleMessages>>
}

type LocaleMessageNode = string | LocaleMessages

const ROUTE_ICON_CLASS_PATTERN = /^i-[a-z0-9]+(?:-[a-z0-9]+)*$/

function isLocaleRecord(value: LocaleMessageNode | undefined): value is LocaleMessages {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function isRouteTitleKey(value: string): value is RouteTitleKey {
  return value.startsWith('router.') && value.length > 'router.'.length
}

export function isRouteIconClassName(value: string): value is RouteIconClassName {
  return ROUTE_ICON_CLASS_PATTERN.test(value)
}

export function hasLocaleMessageKey(messages: LocaleMessages, titleKey: RouteTitleKey): boolean {
  let cursor: LocaleMessageNode | undefined = messages

  for (const segment of titleKey.split('.')) {
    if (!isLocaleRecord(cursor)) return false
    cursor = cursor[segment]
  }

  return typeof cursor === 'string'
}

function getRouteLabel(route: RouteConfig): string {
  return route.name ? `${String(route.name)} (${route.path})` : route.path
}

function isRouteName(value: unknown): value is RouteRecordName {
  return (
    (typeof value === 'string' && value.trim() === value && value.length > 0) ||
    typeof value === 'symbol'
  )
}

function createIssue(
  route: RouteConfig,
  field: RouteMetadataField,
  message: string
): RouteMetadataIssue {
  return {
    field,
    route: getRouteLabel(route),
    message,
  }
}

function validateStringArray(
  route: RouteConfig,
  field: 'roles' | 'auths',
  value: unknown
): RouteMetadataIssue[] {
  if (!Array.isArray(value)) {
    return [createIssue(route, field, 'must be an array of strings')]
  }

  return value.flatMap((item, index) => {
    if (isNonEmptyString(item)) return []
    return [createIssue(route, field, `item ${index} must be a non-empty string`)]
  })
}

function validateStringRedirect(
  route: RouteConfig,
  redirect: string,
  registeredPaths: ReadonlySet<string>
): RouteMetadataIssue[] {
  if (!isNonEmptyString(redirect)) {
    return [createIssue(route, 'redirect', 'string redirect must be non-empty')]
  }

  const redirectPath = redirect.split(/[?#]/)[0]
  if (!redirectPath || !redirectPath.startsWith('/')) {
    return [createIssue(route, 'redirect', 'string redirect must start with /')]
  }

  if (!registeredPaths.has(redirectPath)) {
    return [
      createIssue(route, 'redirect', `string redirect target ${redirectPath} is not registered`),
    ]
  }

  return []
}

function validateObjectRedirect(
  route: RouteConfig,
  redirect: object,
  context: RouteMetadataValidationContext
): RouteMetadataIssue[] {
  const issues: RouteMetadataIssue[] = []
  const path = Reflect.get(redirect, 'path')
  const name = Reflect.get(redirect, 'name')

  if (path === undefined && name === undefined) {
    issues.push(createIssue(route, 'redirect', 'object redirect must define path or name'))
  }

  if (path !== undefined) {
    if (!isNonEmptyString(path)) {
      issues.push(createIssue(route, 'redirect', 'object redirect path must be a non-empty string'))
    } else if (!context.registeredPaths.has(path)) {
      issues.push(createIssue(route, 'redirect', `object redirect path ${path} is not registered`))
    }
  }

  if (name !== undefined) {
    if (!isRouteName(name)) {
      issues.push(createIssue(route, 'redirect', 'object redirect name must be a valid route name'))
    } else if (!context.registeredNames.has(name)) {
      issues.push(
        createIssue(route, 'redirect', `object redirect name ${String(name)} is not registered`)
      )
    }
  }

  return issues
}

function validateRedirect(
  route: RouteConfig,
  context: RouteMetadataValidationContext
): RouteMetadataIssue[] {
  const redirect = route.redirect
  if (redirect === undefined) return []
  if (typeof redirect === 'string')
    return validateStringRedirect(route, redirect, context.registeredPaths)
  if (typeof redirect === 'function') return []
  if (typeof redirect === 'object' && redirect !== null && !Array.isArray(redirect)) {
    return validateObjectRedirect(route, redirect, context)
  }
  return [createIssue(route, 'redirect', 'must be a string, function, or route-location object')]
}

function validateTitleKey(
  route: RouteConfig,
  context: RouteMetadataValidationContext
): RouteMetadataIssue[] {
  const titleKey = route.meta?.titleKey

  if (!isNonEmptyString(titleKey)) {
    return [createIssue(route, 'titleKey', 'must be a non-empty string')]
  }

  if (!isRouteTitleKey(titleKey)) {
    return [createIssue(route, 'titleKey', 'must start with router.')]
  }

  if (!context.localeMessages) return []

  return Object.entries(context.localeMessages).flatMap(([locale, localeMessages]) => {
    if (hasLocaleMessageKey(localeMessages, titleKey)) return []
    return [createIssue(route, 'titleKey', `missing locale key ${titleKey} in ${locale}`)]
  })
}

export function validateRouteMetadata(
  route: RouteConfig,
  context: RouteMetadataValidationContext
): RouteMetadataIssue[] {
  const issues: RouteMetadataIssue[] = []
  const meta = route.meta

  if (!isRouteName(route.name)) {
    issues.push(createIssue(route, 'name', 'must be a non-empty route name'))
  }

  issues.push(...validateTitleKey(route, context))

  if (meta?.icon !== undefined) {
    if (!isNonEmptyString(meta.icon)) {
      issues.push(createIssue(route, 'icon', 'must be a non-empty string'))
    } else if (!isRouteIconClassName(meta.icon)) {
      issues.push(createIssue(route, 'icon', 'must follow the i-collection-icon class convention'))
    }
  }

  if (meta?.rank !== undefined && (typeof meta.rank !== 'number' || !Number.isFinite(meta.rank))) {
    issues.push(createIssue(route, 'rank', 'must be a finite number'))
  }

  if (meta?.roles !== undefined) {
    issues.push(...validateStringArray(route, 'roles', meta.roles))
  }

  if (meta?.auths !== undefined) {
    issues.push(...validateStringArray(route, 'auths', meta.auths))
  }

  issues.push(...validateRedirect(route, context))

  return issues
}

export function validateRegisteredRouteMetadata(
  routes: readonly RouteConfig[],
  options: RegisteredRouteMetadataValidationOptions = {}
): RouteMetadataIssue[] {
  const registeredPaths = new Set(routes.map(route => route.path))
  const routeNamePaths = new Map<RouteRecordName, string[]>()

  for (const route of routes) {
    if (!isRouteName(route.name)) continue
    routeNamePaths.set(route.name, [...(routeNamePaths.get(route.name) ?? []), route.path])
  }

  const registeredNames = new Set(routeNamePaths.keys())
  const context: RouteMetadataValidationContext = {
    registeredPaths,
    registeredNames,
    localeMessages: options.localeMessages,
  }

  const issues = routes.flatMap(route => validateRouteMetadata(route, context))

  for (const [name, paths] of routeNamePaths.entries()) {
    if (paths.length <= 1) continue
    issues.push({
      field: 'name',
      route: String(name),
      message: `route name must be unique; found on ${paths.join(', ')}`,
    })
  }

  return issues
}
