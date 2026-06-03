# M2 Helper Migration Report

## Status

Local validation: `PASS`

Full validation ladder: pending.

## Migrated Helpers

Moved implementation ownership to `@ccd/vue-app-platform`:

- `checkRouteRoles`
- `checkRouteAuths`
- `checkRouteAccess`
- `isWhiteListed`
- `parseSafeRedirect`
- `filterMenuByAccess`

The app-local `apps/web-demo/src/router/utils/accessControl.ts` remains as a compatibility facade so existing app imports do not change.

## Contract Usage

`@ccd/contracts` remains type-only. The package helper does not import `@ccd/contracts` because `@ccd/vue-app-platform` does not currently have an approved dependency on `@ccd/contracts` and manifest/policy changes are out of scope.

The app facade imports M1 route/menu/access contracts as types:

- `RouteAccessMeta`
- `SafeRedirectResult`
- `MenuAccessItem`

## App-Owned Boundaries Preserved

No router singleton, route table, dynamic route manager, resolver, app logger, store integration, i18n integration, window opening, BroadcastChannel behavior, `import.meta.glob` behavior, or app route modules were moved.

`filterNoPermissionTree` remains app-owned because it operates on app `RouteConfig` and route meta structure.

## Guard Update

`scripts/ai-architecture-guard.mjs` now checks that app `accessControl.ts` imports `@ccd/vue-app-platform` and does not reintroduce local implementation tokens for normalized path, menu auth, or redirect decoding.

## Local Validation

| Command | Result | Evidence |
| --- | --- | --- |
| `pnpm exec vitest --root . run packages/vue-app-platform/src/routeAccess.spec.ts` | PASS | `command-logs/m2-focused-route-access-vitest.log` |
| `pnpm --filter @ccd/vue-app-platform type-check` | PASS | `command-logs/m2-vue-app-platform-type-check-initial.log` |
| `pnpm --filter @ccd/vue-app-platform build` | PASS | `command-logs/m2-vue-app-platform-build-initial.log` |
| `pnpm --filter @ccd/vue-app-platform test` | PASS | `command-logs/m2-vue-app-platform-test-existing-script.log` |
| `pnpm --filter @ccd/web-demo type-check` | PASS | `command-logs/m2-web-demo-type-check-initial.log` |
| Focused `pnpm ai:guard` check | PASS | `command-logs/m2-ai-guard-focused-after-guard-change.log` |
