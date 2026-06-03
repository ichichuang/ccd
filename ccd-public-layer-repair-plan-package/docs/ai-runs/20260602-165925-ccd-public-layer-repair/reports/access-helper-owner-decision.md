# M2-T01 Access Helper Runtime Owner Decision

## Status

Task status: `DONE`

This is a decision-only artifact. No source implementation files were changed.

## Decision

Accepted existing runtime owner for approved pure route/access helpers:

- `@ccd/vue-app-platform`

Scope of this owner decision:

- `checkRouteRoles`
- `checkRouteAuths`
- `checkRouteAccess`
- `isWhiteListed`
- `parseSafeRedirect`
- possible generic menu access filtering only after M2-T04 proves the menu contract is generic enough

## Evidence

- `command-logs/m2-vue-app-platform-owner-evidence.log`
- `command-logs/m2-access-helper-coupling.log`
- `command-logs/m2-existing-helper-tests-rg.log`
- `command-logs/m2-package-runtime-owner-rg.log`
- `reports/route-contract-design.md`
- `reports/package-owner-map.md`

## Rationale

`@ccd/vue-app-platform` is an existing governed package for app-platform runtime helpers. It already exports capability-oriented browser/platform helpers such as layout runtime, theme var application, preloader handling, and preload error recovery.

The current `apps/web-demo/src/router/utils/accessControl.ts` file is pure and does not import router singletons, Pinia stores, DOM APIs, storage APIs, i18n, logger, generated registries, or app adapters. That makes its access/redirect helpers plausible package runtime candidates after M1 contracts exist.

## Rejected Owners

| Owner | Decision | Reason |
| --- | --- | --- |
| `@ccd/contracts` | Rejected | Runtime functions do not belong in a type-only contract package. |
| `@ccd/core` | Rejected | Route/menu access helpers are Vue app-platform policy, not runtime-neutral core capability orchestration. |
| `@ccd/shared-utils` | Rejected | It would turn shared-utils into an app policy bucket; route auth semantics are platform policy, not generic utility. |
| New package | Rejected for this plan | New package owner or manifest work requires explicit approval. |

## Test Coverage Gap

Existing test search found indirect permission/tab coverage, but no focused tests for `parseSafeRedirect`, whitelist matching, role/auth helper semantics, or `filterMenuByAccess`.

M2-T02/M2-T03 must add focused helper parity/security tests before any helper migration is marked `DONE`.

## Blocker Before M2-T02

M2-T02 is source implementation and remains blocked until the operator approves continuing in the dirty `main` working tree or provides an isolated worktree.
