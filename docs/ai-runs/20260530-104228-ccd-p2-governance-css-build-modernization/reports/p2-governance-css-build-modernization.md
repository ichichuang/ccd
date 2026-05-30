# P2 Governance CSS Build Modernization Report

## Scope

Active plan:

- `ccd-architecture-optimization-plan/plans/02-P2-governance-css-build-modernization.md`

Baseline:

- Branch: `main`
- Commit: `3d8a22df1fc978352d68297c7e9eda76586f8334`
- CI Guardian reference: `26671927771` PASS, provided by operator

## Implemented

| ID | Result | Evidence |
| --- | --- | --- |
| APP-003 | Added storage contracts, pure storage codec helpers, and app-owned browser storage adapter policy. | `packages/contracts/src/storage.ts`, `packages/shared-utils/src/storageCodec.ts`, `apps/web-demo/src/utils/safeStorage/**` |
| BUILD-003 | Added plugin compatibility notes and removed active `vite-plugin-progress` usage. | `apps/web-demo/build/plugins.ts` |
| GOV-005 | Updated current P2 next actions, status, decision, risk, plan, and architecture contract docs. | `docs/ai-plan/**`, `docs/en/architecture-contract.md` |
| HTTP-005 | Added example alova Method builders and documented imperative-wrapper exceptions. | `apps/web-demo/src/api/**` |
| HTTP-006 | Documented and enforced raw transport exceptions. | `.ai/rules/integrations/01-http-alova.mdc`, `scripts/ai-architecture-guard.mjs` |
| UI-004 | Moved PrimeVue toast/message/locale helpers into adapter package. | `packages/vue-primevue-adapter/src/services.ts`, `apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue` |
| BUILD-004 | Replaced Vite Sass `as any` config with typed helper shape. | `apps/web-demo/vite.config.ts` |
| BUILD-005 | Disabled dev/preview auto-open for CI/e2e and Playwright web server. | `apps/web-demo/vite.config.ts`, `playwright.config.ts` |
| UI-005 | Scoped PrimeVue direct-import showcase exception to `primevue-collection/**`. | `scripts/ai-architecture-guard.mjs`, `docs/ai-plan/DECISIONS.md` |

## Blocked or Deferred

| ID | Status | Reason |
| --- | --- | --- |
| APP-004 | `BLOCKED_BY_OWNER` | Desktop drift CI enforcement scope is still owner/operator gated. |
| BUILD-002 | `BLOCKED_BY_APPROVAL` | Vite 8 migration requires isolated approval and dependency/toolchain lane. |
| COMP-005 | `BLOCKED_BY_OWNER` | New `packages/vue-pro-components` is a broad package split. |
| DEPS-001 | `BLOCKED_BY_APPROVAL` | Vite dependency lane not approved. |
| DEPS-002 | `BLOCKED_BY_APPROVAL` | Vue tooling dependency lane not approved. |
| DEPS-003 | `BLOCKED_BY_APPROVAL` | Playwright dependency lane not approved. |
| GitHub remote governance | `BLOCKED_BY_OPERATOR` | Remote settings and `.github/**` changes require explicit approval. |

## Narrow Validation

- `pnpm exec vitest run packages/shared-utils/src/storageCodec.spec.ts` — PASS
- `pnpm exec vitest run packages/vue-primevue-adapter/src/services.spec.ts` — PASS
- `pnpm exec vitest run apps/web-demo/src/api/example/users.spec.ts` — PASS
- `pnpm --filter @ccd/contracts build` — PASS
- `pnpm --filter @ccd/shared-utils build` — PASS
- `pnpm --filter @ccd/vue-primevue-adapter build` — PASS after locale generic fix
- `pnpm --filter @ccd/web-demo type-check` — PASS after alova Method config and Vite Sass type fixes

## Final Validation

- `pnpm install --frozen-lockfile` — PASS
- `pnpm ci:prepare-internal` — PASS
- `pnpm ai:doctor` — PASS
- `pnpm codex:preflight` — PASS
- `pnpm validate:governance` — PASS; rerun after final docs/repair updates also PASS
- `pnpm type-check` — PASS
- `pnpm test:run` — PASS
- `pnpm lint:check` — PASS with two existing warnings in `packages/vue-hooks/src/createAutoMittHook.spec.ts`
- `pnpm build:web-demo` — PASS
- `pnpm budget:bundles` — PASS after correcting entry asset classification to use `index.html`
- `pnpm build:desktop` — PASS
- `pnpm budget:desktop` — PASS
- `pnpm e2e:smoke` — PASS
- `pnpm e2e:layout` — PASS
- `pnpm e2e:perf` — PASS
- `pnpm e2e:visual` — PASS
- `pnpm e2e:qa:prepared` — PASS
- `pnpm build:ci` — PASS
- `node --check scripts/check-bundle-budgets.mjs` — PASS
- `git diff --check` — PASS
- `git status --short --untracked-files=all` — PASS, final dirty status captured in command logs

## Doctor Open Items

`pnpm ai:doctor --open` no longer lists `P2-CSS-Validation`. Remaining open P2 items are approval-gated dependency, Vite 8, and GitHub governance tasks. P3/P4 open items remain out of scope for this run.
