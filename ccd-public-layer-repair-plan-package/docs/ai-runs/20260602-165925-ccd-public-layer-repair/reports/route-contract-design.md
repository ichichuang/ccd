# M1-T02 Route Contract Design

## Status

Task status: `DONE`

This is a design-only artifact. No source implementation files were changed.

## Owner Decision

Accepted owner for safe type-only route/menu/access contracts:

- `@ccd/contracts`

Non-owners:

- `@ccd/contracts` must not own Vue Router runtime types, module augmentation, route tables, route views, app stores, Zod schemas, or runtime helpers.
- Runtime helpers remain app-owned until M2 selects an approved runtime owner.

Decision evidence:

- `docs/ai-plan/DECISIONS.md` decision `D-PL-001`
- `reports/route-type-consumer-map.md`
- `reports/package-owner-map.md`

## Proposed Contract Surface

Recommended file lane for M1-T03:

- `packages/contracts/src/routing.ts`
- export type-only contracts through `packages/contracts/src/index.ts`

Recommended contracts:

```ts
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

export interface RouteMenuNode<TMeta = RouteAccessMeta & Record<string, unknown>>
  extends RouteAccessMeta {
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
  TMeta extends RouteAccessMeta & Record<string, unknown> =
    RouteAccessMeta & Record<string, unknown>,
> {
  readonly path: string
  readonly name?: string
  readonly component?: string
  readonly redirect?: string
  readonly meta: TMeta
  readonly children?: readonly BackendRouteContract<TMeta>[]
}
```

## App Composition Strategy

Keep app-specific Vue Router declarations in `apps/web-demo/src/types/modules/router.d.ts`.

Expected app-local composition after source approval:

- `BackendRouteConfig` can compose `BackendRouteContract<import('vue-router').RouteMeta>`.
- `MenuItem` can compose or extend `RouteMenuNode<import('vue-router').RouteMeta>` while preserving mutable app usage if needed.
- `RouteConfig` remains app-local because it extends `RouteRecordRaw` and carries route component/view runtime fields.
- `RouteMeta` module augmentation remains app-local.
- `RouteUtils` and `DynamicRouteManager` remain app-local because they expose runtime-managed route utilities.

## Rejected Designs

| Design | Reason rejected |
| --- | --- |
| Move `RouteConfig` directly to `@ccd/contracts` | It depends on Vue Router route record types and app component/runtime route semantics. |
| Move Vue Router `RouteMeta` augmentation to `@ccd/contracts` | It would make contracts package framework-aware and leak app-specific meta fields. |
| Move access helper functions to `@ccd/contracts` | Runtime functions do not belong in type-only contracts. M2 handles runtime owner selection. |
| Define exact `LayoutMode`, transition, and tab behavior in contracts | These are app UI/runtime policy, not portable public contracts. |
| Use `zod` schemas in contracts | Would require dependency/manifest approval and violates current runtime-neutral contract policy. |

## Validation Requirements For M1-T03

Required before marking implementation `DONE`:

- `pnpm --filter @ccd/contracts type-check`
- `pnpm --filter @ccd/contracts test`
- `pnpm --filter @ccd/web-demo type-check`
- `pnpm type-check`
- `pnpm lint:check`
- Evidence that `@ccd/contracts` has no Vue Router, Zod, DOM, store, or app imports.

## Current Blocker

M1-T03 source implementation is blocked until the operator approves continuing source changes in the dirty `main` working tree or provides an isolated worktree.
