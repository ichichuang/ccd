# M2 Validation Summary

## Status

`DONE`

## Scope

PLAN.md M2 executed: `Route/menu/access pure helper migration`.

The previous mismatched API/DTO approval was superseded for this milestone. API/DTO/System Preferences contract normalization was not performed.

## Changes

| Area | Files | Summary |
| --- | --- | --- |
| Runtime helper owner | `packages/vue-app-platform/src/routeAccess.ts`, `packages/vue-app-platform/src/index.ts` | Added pure route/menu/access helper implementations and root exports. |
| Focused tests | `packages/vue-app-platform/src/routeAccess.spec.ts` | Added role/auth, whitelist, redirect security, redirect parsing, and menu filtering tests. |
| App facade | `apps/web-demo/src/router/utils/accessControl.ts` | Preserved existing app import path and delegated to `@ccd/vue-app-platform`; used M1 `@ccd/contracts` route/menu/access types. |
| Guard | `scripts/ai-architecture-guard.mjs` | Added duplicate helper ownership guard for app `accessControl.ts`. |
| Evidence | `ccd-public-layer-repair-plan-package/docs/ai-plan/**`, `ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/**` | Recorded approval supersession, owner decision, migration report, command logs, and validation summary. |
| Generated API surface | `docs/generated/api-surface-report.json`, `docs/generated/api-surface-report.md` | Owning governance generator synchronized new `@ccd/vue-app-platform` route helper exports and existing M1 contract exports. |

## Validation Matrix

| Command | Result | Evidence |
| --- | --- | --- |
| `pnpm exec vitest --root . run packages/vue-app-platform/src/routeAccess.spec.ts` | PASS | `command-logs/m2-focused-route-access-vitest.log` |
| `pnpm --filter @ccd/contracts type-check` | PASS | `command-logs/m2-required-01-contracts-type-check.log` |
| `pnpm --filter @ccd/contracts test` | PASS | `command-logs/m2-required-02-contracts-test.log` |
| `pnpm --filter @ccd/contracts build` | PASS | `command-logs/m2-required-03-contracts-build.log` |
| `pnpm --filter @ccd/vue-app-platform type-check` | PASS | `command-logs/m2-required-04-vue-app-platform-type-check.log` |
| `pnpm --filter @ccd/vue-app-platform build` | PASS | `command-logs/m2-required-05-vue-app-platform-build.log` |
| `pnpm --filter @ccd/vue-app-platform test` | PASS | `command-logs/m2-vue-app-platform-test-existing-script.log` |
| `pnpm build:shared-config` | PASS | `command-logs/m2-required-06-build-shared-config.log` |
| `pnpm build:core` | PASS | `command-logs/m2-required-07-build-core.log` |
| `pnpm ci:smoke:packages` | PASS | `command-logs/m2-required-08-ci-smoke-packages.log` |
| `pnpm type-check` | PASS | `command-logs/m2-required-09-type-check.log` |
| `pnpm lint:check` | PASS | `command-logs/m2-required-10-lint-check.log` |
| `pnpm test:run` | PASS | `command-logs/m2-required-11-test-run.log` |
| `pnpm arch:boundaries` | PASS | `command-logs/m2-required-12-arch-boundaries.log` |
| `pnpm arch:runtime` | PASS | `command-logs/m2-required-13-arch-runtime.log` |
| `pnpm ai:guard -- --format=json` | PASS | `command-logs/m2-required-14-ai-guard-json.log` |
| `pnpm drift-check` | PASS | `command-logs/m2-required-15-drift-check.log` |
| `pnpm validate:governance` | FAIL_THEN_PASS | `command-logs/m2-required-16-validate-governance.log`, `command-logs/m2-required-17-validate-governance-rerun-after-api-surface-sync.log` |

## Generated Evidence

`pnpm validate:governance` runs `pnpm governance:gate`, whose API snapshot compatibility step runs `pnpm api:report` (`node scripts/architecture/check-api-surface.mjs`). That owning command synchronized:

- `docs/generated/api-surface-report.json`
- `docs/generated/api-surface-report.md`

Evidence:

- `command-logs/m2-generated-api-surface-diff-after-validate-governance.log`
- `command-logs/m2-generated-status-after-validate-governance.log`

No generated diffs appeared outside expected API surface reports.

## Manifest and Boundary Guards

No `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `turbo.json`, app package manifest, or package manifest diffs were present in the final status check.

Evidence: `command-logs/m2-final-status-before-summary.log`.

## Stop Condition

M2 is `DONE`. Stop here; do not advance to M3 without new approval.
