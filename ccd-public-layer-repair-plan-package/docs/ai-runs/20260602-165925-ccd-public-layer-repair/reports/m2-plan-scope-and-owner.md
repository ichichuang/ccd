# M2 Plan Scope and Owner

## Approval

- New approval ID: `M2-ROUTE-MENU-ACCESS-HELPER-MIGRATION-APPROVED`
- Superseded approval for this milestone: `M2-API-DTO-CONTRACT-NARROW-APPROVED`

API/DTO/System Preferences contract normalization is deferred to its actual later milestone. It is not part of M2.

## Exact PLAN.md M2 Title

`Milestone M2 — Route/menu/access pure helper migration`

## Exact PLAN.md M2 Scope

Migrate `checkRouteRoles`, `checkRouteAuths`, `checkRouteAccess`, `isWhiteListed`, `parseSafeRedirect`, and possibly menu access filtering to the correct governed runtime package if dependency direction is clean.

## Out of Scope

Router singleton helpers, window management, dynamic route resolver, route table loaders, route views, i18n, logger, permission store, BroadcastChannel code, API/DTO contracts, and System Preferences contracts.

## Owner Decision

Accepted runtime owner: `@ccd/vue-app-platform`.

`@ccd/contracts` remains type-only. Because `@ccd/vue-app-platform` currently has no approved dependency on `@ccd/contracts`, package runtime helpers must not import `@ccd/contracts` in this milestone. The app compatibility facade can import M1 route/menu/access contracts as types and delegate to the package helpers.

## Evidence

- `command-logs/m2-restart-required-initial-checks.log`
- `command-logs/m2-restart-m1-done-and-validation-check.log`
- `command-logs/m2-restart-read-plan-m2.log`
- `command-logs/m2-read-governance-topology-runtime.log`
- `command-logs/m2-read-route-helper-source.log`
- `command-logs/m2-search-helper-consumers-and-tests.log`
