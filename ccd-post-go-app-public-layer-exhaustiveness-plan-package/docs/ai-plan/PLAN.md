# PLAN — Post-GO Apps Public-Layer Exhaustiveness

## Status values

`TODO`, `IN_PROGRESS`, `DONE`, `BLOCKED`, `NOT_APPLICABLE`, `DEFERRED`.

## M0 — Baseline and plan activation

Purpose: confirm repository health and current Full GO baseline.

Tasks:

- M0-T1: read `AGENTS.md`, all `docs/ai-plan/*`, and current status docs.
- M0-T2: run baseline commands.
- M0-T3: create active evidence directory.

Validation:

- `git fetch origin main`
- `git branch --show-current`
- `git rev-parse --short HEAD`
- `git rev-parse --short origin/main`
- `git status --short --untracked-files=all`
- `git diff --check`
- `pnpm docs:commands`
- `pnpm ai:doctor`
- `pnpm ai:doctor --open`
- `pnpm ai:guard -- --format=json`
- `pnpm validate:governance`

Acceptance:

- branch is `main`
- working tree is clean
- `ai:doctor --open` reports 0 open tasks
- governance passes

Stop conditions:

- dirty tree
- validation failure
- remote divergence
- `.cursor` at repo root

## M1 — Full apps public-capability inventory

Purpose: enumerate every potential common/public capability under `apps/**`.

Tasks:

- M1-T1: scan app components, composables, stores, utils, plugins, adapters, generated files, build utilities, layouts, directives, tests, and demos.
- M1-T2: build a classification table.
- M1-T3: identify prior migration evidence and existing governed packages.
- M1-T4: produce a candidate dependency map.

Required reports:

- `reports/apps-public-capability-inventory.md`
- `reports/candidate-dependency-map.md`
- `reports/app-owned-justification-register.md`

Classification values:

- `MIGRATE_TO_CONTRACTS`
- `MIGRATE_TO_CORE`
- `MIGRATE_TO_SHARED_UTILS`
- `MIGRATE_TO_DESIGN_TOKENS`
- `MIGRATE_TO_VUE_HOOKS`
- `MIGRATE_TO_VUE_APP_PLATFORM`
- `MIGRATE_TO_VUE_UI`
- `MIGRATE_TO_VUE_PRIMEVUE_ADAPTER`
- `MIGRATE_TO_VUE_CHARTS`
- `APP_OWNED_RUNTIME_ADAPTER`
- `APP_OWNED_PLUGIN_SHELL`
- `APP_OWNED_ROUTE_OR_FEATURE`
- `APP_OWNED_STORE`
- `APP_COMPATIBILITY_FACADE`
- `GENERATED_OWNED`
- `DEMO_OR_SHOWCASE`
- `NOT_SAFE_TO_MOVE`
- `NEEDS_OWNER_DECISION`

Acceptance:

- no relevant `apps/**` area is omitted
- every candidate has a classification and reason
- no code changes yet

## M2 — Migration batch planning

Purpose: choose safe migration batches and avoid broad rewrites.

Batches:

- Batch A: pure utilities and deterministic helpers.
- Batch B: Vue composables not coupled to app router/store/i18n.
- Batch C: design-token/theme/size/device leftovers.
- Batch D: UI primitives and thin PrimeVue wrappers.
- Batch E: platform lifecycle/bootstrap/global-shell helpers.
- Batch F: build/generator boundary utilities.
- Batch G: docs/status/guard hardening.

For each candidate:

- target package
- public API shape
- source file changes
- tests
- governance changes
- rollback plan
- behavior risk

Acceptance:

- all migration batches are independently reviewable
- no package manifest or lockfile change is planned unless separately approved

## M3 — Pure utility and token migration

Purpose: move pure common TS logic from apps to `@ccd/shared-utils` or `@ccd/design-tokens`.

Allowed:

- pure functions
- stateless formatters
- deterministic resolver logic
- no Vue/browser/runtime coupling

Forbidden:

- app stores
- router/i18n coupling
- browser side effects
- safeStorage crypto changes

Validation:

- package tests
- app tests
- type-check
- build web/desktop
- governance

Status: `TODO`.

## M4 — Vue hooks and app-platform migration

Purpose: move reusable hooks/platform lifecycle helpers to `@ccd/vue-hooks` or `@ccd/vue-app-platform`.

Allowed:

- composables with explicit inputs
- app-platform lifecycle helpers
- injected capability wrappers

Forbidden:

- app-router-coupled hooks
- app i18n message composition
- concrete Pinia store ownership
- route-view logic

Validation:

- focused hook tests
- `@ccd/vue-hooks` tests
- `@ccd/vue-app-platform` tests
- web-demo tests

Status: `TODO`.

## M5 — UI and PrimeVue wrapper migration

Purpose: move remaining shared UI wrappers from apps to `@ccd/vue-ui` or `@ccd/vue-primevue-adapter`.

Allowed:

- governed CCD UI wrappers
- typed PrimeVue adapter facades
- global-shell adapter surfaces

Forbidden:

- raw PrimeVue bucket exports
- broad showcase rewrites
- weakened guard rules

Validation:

- `pnpm ai:guard -- --format=json`
- `pnpm --filter @ccd/vue-ui test`
- `pnpm --filter @ccd/vue-primevue-adapter build`
- web-demo tests/build

Status: `TODO`.

## M6 — Build/generator/runtime boundary hardening

Purpose: move shared build/generator utilities out of apps if they are genuinely common, or classify them as app-owned/generated-owned.

Allowed:

- build-only package utilities
- generated registry owners
- resolver boundaries

Forbidden:

- manual generated edits
- unowned Vite resolver drift
- package manifest changes without approval

Status: `TODO`.

## M7 — App-owned justification and guard enforcement

Purpose: for modules that remain in apps, add precise documented reasons and guardrails.

Tasks:

- update app-owned register
- update architecture docs
- add guard checks if practical
- ensure no unclassified candidates remain

Status: `TODO`.

## M8 — Final validation and GO preservation

Purpose: certify exhaustive migration/classification.

Final validation:

- `git diff --check`
- `pnpm docs:commands`
- `pnpm project:doctor`
- `pnpm ai:doctor`
- `pnpm ai:doctor --open`
- `pnpm codex:preflight`
- `pnpm ci:prepare-internal`
- `pnpm ci:smoke:packages`
- `pnpm arch:runtime`
- `pnpm arch:boundaries`
- `pnpm api:report`
- `pnpm ai:guard -- --format=json`
- `pnpm validate:governance`
- `pnpm type-check`
- `pnpm test:run`
- `pnpm --filter @ccd/web-demo test`
- `pnpm build:web-demo`
- `pnpm exec prettier --write apps/web-demo/src/types/auto-imports.d.ts`
- verify no auto-imports diff
- `pnpm build:desktop`
- `pnpm drift-check`

Final status:

- `APP_PUBLIC_LAYER_EXHAUSTIVENESS_CERTIFIED`
- or exact blocked status with evidence
