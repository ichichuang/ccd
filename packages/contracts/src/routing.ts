export interface RouteAccessMeta {
  readonly roles?: readonly string[]
  readonly auths?: readonly string[]
}

export interface SafeRedirectResult {
  readonly path: string
  readonly query: Record<string, string>
}

export interface MenuAccessItem {
  readonly roles?: readonly string[]
  readonly auths?: readonly string[]
  readonly children?: readonly MenuAccessItem[]
}

export interface RouteMenuNode<
  TMeta extends RouteAccessMeta & Record<string, unknown> = RouteAccessMeta &
    Record<string, unknown>,
> extends RouteAccessMeta {
  readonly path: string
  readonly name?: string
  readonly titleKey?: string
  readonly title: string
  readonly icon?: string
  readonly showLink: boolean
  readonly rank: number
  readonly children?: readonly RouteMenuNode<TMeta>[]
  readonly meta?: TMeta
}

export interface BackendRouteContract<
  TMeta extends RouteAccessMeta & Record<string, unknown> = RouteAccessMeta &
    Record<string, unknown>,
> {
  readonly path: string
  readonly name?: string
  readonly component?: string
  readonly redirect?: string
  readonly meta: TMeta
  readonly children?: readonly BackendRouteContract<TMeta>[]
}
