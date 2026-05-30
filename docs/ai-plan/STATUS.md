# CCD Architecture Repair Status

## Current execution state

- Current milestone: P2 — Governance, CSS, build, HTTP, storage, and PrimeVue boundary modernization
- Current task: execute all implementable OPEN P2 items from `ccd-architecture-optimization-plan/plans/02-P2-governance-css-build-modernization.md`
- Last completed task: final P2 validation sweep
- Validation status: ACTIVE_P2_FINAL_PASS
- Evidence directory: `docs/ai-runs/20260530-104228-ccd-p2-governance-css-build-modernization/`
- Final completion state: DONE_WITH_APPROVAL_GATED_BLOCKERS

Implemented in the active P2 run:

- APP-003: `SafeStoragePolicy`, `StorageCodec`, pure storage codec helpers, and web-demo browser storage adapter policy.
- BUILD-003: build plugin compatibility notes and removal of active `vite-plugin-progress` usage.
- GOV-005: current P2 next-action docs and architecture-contract guidance refreshed.
- HTTP-005: example API Method builders and calling model documentation.
- HTTP-006: raw transport allowlist documented and enforced for HTTP infra, timezone probe, and Lottie asset loader.
- UI-004: PrimeVue toast/message/locale helpers moved into `@ccd/vue-primevue-adapter`.
- BUILD-004: Vite Sass preprocessor config no longer uses `as any`.
- BUILD-005: Vite server/preview auto-open is disabled for CI/e2e through explicit env handling.
- UI-005: PrimeVue showcase examples are scoped by `primevue-collection` path exception; non-showcase app files remain exact allowlist.

P2 items intentionally left blocked or deferred:

- APP-004 (`BLOCKED_BY_OWNER`) — desktop drift CI enforcement scope remains owner/operator gated.
- BUILD-002 (`BLOCKED_BY_APPROVAL`) — Vite 8 migration requires isolated approval.
- COMP-005 (`BLOCKED_BY_OWNER`) — `packages/vue-pro-components` is a broad package split and was not approved.
- DEPS-001, DEPS-002, DEPS-003 (`BLOCKED_BY_APPROVAL`) — no dependency or lockfile changes in this run.
- GitHub remote governance and `.github/**` refinements remain approval-gated.

Focused validation already captured in the active P2 run:

- `pnpm exec vitest run packages/shared-utils/src/storageCodec.spec.ts` — PASS
- `pnpm exec vitest run packages/vue-primevue-adapter/src/services.spec.ts` — PASS
- `pnpm exec vitest run apps/web-demo/src/api/example/users.spec.ts` — PASS
- `pnpm --filter @ccd/contracts build` — PASS
- `pnpm --filter @ccd/shared-utils build` — PASS
- `pnpm --filter @ccd/vue-primevue-adapter build` — PASS after locale generic fix
- `pnpm --filter @ccd/web-demo type-check` — PASS after alova Method config and Vite Sass type fixes

Final validation for this P2 run:

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
- `git diff --check` — PASS
- `git status --short --untracked-files=all` — PASS, dirty worktree contains only this run's implementation, docs/evidence, official generated API report outputs, and untracked run logs/new source test files

## Current baseline

- Branch: `main`
- Baseline commit: `3d8a22df1fc978352d68297c7e9eda76586f8334`
- Local ahead/behind: NOT_CAPTURED by the required command set
- Dirty files: active P2 implementation, planning/evidence docs, run logs, and any official generated outputs created by validation commands; final status must be read from the active P2 run.
- Last 10 commits captured: YES in `docs/ai-runs/20260530-104228-ccd-p2-governance-css-build-modernization/command-logs/M0-20260530-104405-git-log-10.log`
- P2 baseline doctor open scan: PASS in `docs/ai-runs/20260530-104228-ccd-p2-governance-css-build-modernization/command-logs/M0-20260530-104432-baseline-ai-doctor-open.log`
- Latest known assumption: no dependency, Vite 8, auth-flow, `.github/**`, remote GitHub, commit, stage, push, reset, clean, branch switch, or force operation was performed.

## Blockers

| ID    | Description                                                                                                                                         | Blocking milestone/task | Required action                                                                                                  | Status  |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------- | ------- |
| B-001 | Current local status not captured in active run evidence                                                                                            | M0-T1                   | Run baseline inspection                                                                                          | DONE    |
| B-002 | Post-7 checkpoint initially failed at `pnpm validate:governance`; the planning doc command reference was rephrased and governance was rerun cleanly | M0-T3                   | No action required                                                                                               | DONE    |
| B-003 | UI boundary guard would create broad false positives without approved D-003 policy and exception list                                               | M4-T4                   | Operator review/approval before guard implementation                                                             | BLOCKED |
| B-004 | HTTP contract package/core path creation requires owner approval                                                                                    | M5-T2                   | Resolve `.ai/runtime/owner_decisions.md` Decision 6                                                              | BLOCKED |
| B-005 | Guard enforcement scope, rule contradictions, and design-token canonical file require owner/architect decisions                                     | M6-T2/M6-T3             | Resolve `.ai/runtime/owner_decisions.md` Decisions 2, 3, 4, and 5                                                | BLOCKED |
| B-006 | `.github/**` CODEOWNERS/template edits and remote branch-protection changes require operator approval                                               | M7-T2                   | Operator approval before local `.github/**` mutation or remote configuration                                     | BLOCKED |
| B-007 | M8 table-heavy production screenshot and two e2e checks fail independently of the pxtorem patch                                                     | M8-T2                   | Separate ProTable/AppContainer layout validation lane for `.p-datatable` height `0` and scroll-memory regression | BLOCKED |
| B-008 | Vite 8 migration requires isolated branch/worktree and dependency/toolchain approval                                                                | M9-T2                   | Operator approval before branch/worktree creation, dependency changes, or Vite 8 validation                      | BLOCKED |
| B-009 | Dependency modernization requires explicit per-lane approval before package or lockfile mutation                                                    | M10-T2                  | Operator approval for exactly one dependency lane, then isolated validation                                      | BLOCKED |
| B-010 | Login Diorama requires operator approval and stable P1/P2 prerequisites before UI/auth-flow work                                                    | M11                     | Operator approval plus prerequisite resolution before editing login files                                        | BLOCKED |
| B-011 | Final go/no-go cannot be `GO` while B-003 through B-010 remain unresolved                                                                           | M14                     | Operator either resolves/approves blockers or accepts `NO_GO` status                                             | BLOCKED |

## Decisions made

| Decision ID | Summary                                                                                                                                                                 | Source              | Date       | Status   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---------- | -------- |
| D-000       | Planning system will not directly edit root `AGENTS.md`; use `docs/ai-plan/AGENTS_DRAFT.md` unless operator approves `.ai/protocol/AI.entry.md` update and regeneration | Plan                | 2026-05-29 | ACTIVE   |
| D-001       | First implementation lane should be M2 Capability Bridge generics after baseline checkpoint                                                                             | Plan                | 2026-05-29 | PROPOSED |
| D-002       | `docs/ai-runs/.gitignore` keeps command logs and reports visible despite root ignore patterns for `*.log` and `reports/`                                                | Materialization run | 2026-05-29 | ACTIVE   |
| D-003       | PrimeVue boundary policy proposed; guard enforcement waits for operator approval                                                                                        | M4                  | 2026-05-29 | PROPOSED |
| D-004       | HTTP boundary proposal keeps alova and current app infrastructure path; contracts/core HTTP paths require owner approval                                                | M5                  | 2026-05-29 | PROPOSED |
| D-006       | Dependency modernization policy remains lane-based; no blind latest upgrades on main                                                                                    | M7                  | 2026-05-29 | PROPOSED |
| D-008       | GitHub repository governance posture documented; remote/.github changes approval-gated                                                                                  | M7                  | 2026-05-29 | PROPOSED |

## Files changed summary

Planning system materialized under:

- `docs/ai-plan/**`
- `docs/ai-runs/README.md`
- `docs/ai-runs/.gitignore`
- `docs/ai-runs/_template-YYYYMMDD-HHMMSS-ccd-architecture-repair/**`
- `docs/ai-runs/20260529-070550-ccd-architecture-repair/**`

M3 ProTable boundary update:

- `apps/web-demo/src/components/ProTable/index.ts`
- `apps/web-demo/src/components/ProTable/engine/types/props.ts`
- `apps/web-demo/src/components/ProTable/engine/config/apiAdapter.ts`
- `apps/web-demo/src/components/ProTable/README.md`
- `apps/web-demo/src/views/example/components/primevue-collection/pro-table/shared/apiExecutor.ts`
- `docs/generated/api-surface-report.json` generated by `pnpm api:report`

M4 UI boundary evidence update:

- `docs/ai-plan/DECISIONS.md`
- `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M4-T1-primevue-import-audit.md`
- `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M4-complete.md`

M5 HTTP boundary evidence update:

- `.ai/runtime/owner_decisions.md`
- `docs/ai-plan/DECISIONS.md`
- `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M5-T1-http-boundary-inventory.md`
- `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M5-complete.md`

M6 guard/owner evidence update:

- `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M6-T1-guard-owner-inventory.md`
- `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M6-complete.md`

M7 governance/GitHub evidence update:

- `docs/ai-plan/DECISIONS.md`
- `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M7-governance-github.md`

M8 CSS/pxtorem evidence update:

- `apps/web-demo/vite.config.ts`
- `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M8-css-pxtorem.md`
- `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M8-production-screenshot-metrics.json`
- `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M8-table-production-hidden-diagnostic.json`
- `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M8-ab-baseline-table-diagnostic.json`
- `docs/ai-runs/20260529-070550-ccd-architecture-repair/screenshots/M8-*.png`

M9 Vite 8 approval-gate evidence update:

- `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M9-vite8-approval-gate.md`

M10 dependency approval-gate evidence update:

- `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M10-dependency-approval-gate.md`

M11 Login Diorama approval-gate evidence update:

- `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M11-login-diorama-approval-gate.md`

M12 secondary test/casing update:

- `apps/web-demo/src/utils/date/index.ts`
- `apps/web-demo/src/views/example/utils/http-advanced.vue`
- `apps/web-demo/src/views/example/architecture/router-meta/keep-alive.vue`
- `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M12-secondary-test-casing.md`

M13 P4 deferred evidence update:

- `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M13-p4-deferred.md`

## Validation summary

| Command or check                             |                 Last run | Result                                                                                    | Evidence                                                                                                                                        |
| -------------------------------------------- | -----------------------: | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short --untracked-files=all`   |     2026-05-29 07:07 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/git-status-short-untracked.log`                                              |
| `git log -10 --oneline`                      |     2026-05-29 07:07 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/git-log-10-oneline.log`                                                      |
| `git branch --show-current`                  |     2026-05-29 07:07 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/git-branch-show-current.log`                                                 |
| `git diff --check`                           |     2026-05-29 07:07 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/git-diff-check.log`                                                          |
| `pnpm install --frozen-lockfile`             |     2026-05-29 07:25 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M0-T3-20260529-072550-pnpm-install-frozen-lockfile.log`                      |
| `pnpm ci:prepare-internal`                   |     2026-05-29 07:26 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M0-T3-20260529-072610-pnpm-ci-prepare-internal.log`                          |
| `pnpm ci:smoke:packages`                     |     2026-05-29 07:26 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M0-T3-20260529-072631-pnpm-ci-smoke-packages.log`                            |
| `pnpm ai:doctor`                             |     2026-05-29 07:26 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M0-T3-20260529-072642-pnpm-ai-doctor.log`                                    |
| `pnpm codex:preflight`                       |     2026-05-29 07:26 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M0-T3-20260529-072658-pnpm-codex-preflight.log`                              |
| `pnpm type-check`                            |     2026-05-29 07:27 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M0-T3-20260529-072713-pnpm-type-check.log`                                   |
| `pnpm lint:check`                            |     2026-05-29 07:27 CST | PASS with 2 warnings                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M0-T3-20260529-072723-pnpm-lint-check.log`                                   |
| `pnpm test:run`                              |     2026-05-29 07:27 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M0-T3-20260529-072743-pnpm-test-run.log`                                     |
| `pnpm build:web-demo`                        |     2026-05-29 07:28 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M0-T3-20260529-072802-pnpm-build-web-demo.log`                               |
| `pnpm build:desktop`                         |     2026-05-29 07:28 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M0-T3-20260529-072842-pnpm-build-desktop.log`                                |
| `pnpm budget:desktop`                        |     2026-05-29 07:29 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M0-T3-20260529-072907-pnpm-budget-desktop.log`                               |
| `pnpm docs:commands`                         |     2026-05-29 07:32 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M0-T3-20260529-073212-pnpm-docs-commands.log`                                |
| `pnpm validate:governance`                   |     2026-05-29 07:32 CST | PASS after generated sync rerun                                                           | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M0-T3-20260529-073245-pnpm-validate-governance-generated-sync-rerun.log`     |
| `pnpm build:ci`                              |     2026-05-29 07:33 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M0-T3-20260529-073307-pnpm-build-ci.log`                                     |
| `git diff --check`                           |     2026-05-29 07:33 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M0-T3-20260529-073340-final-git-diff-check.log`                              |
| `git status --short --untracked-files=all`   |     2026-05-29 07:33 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M0-T3-20260529-073345-final-git-status.log`                                  |
| M1 CoreTypes no-any audit                    |     2026-05-29 07:35 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M1-T1-20260529-073523-coretypes-no-any-audit.log`                            |
| `pnpm --filter @ccd/web-demo type-check`     |     2026-05-29 07:35 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M1-T2-20260529-073532-web-demo-type-check.log`                               |
| ProForm focused Vitest                       |     2026-05-29 07:35 CST | PASS, 4 files / 8 tests                                                                   | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M1-T2-20260529-073549-proform-focused-vitest.log`                            |
| `pnpm ci:prepare-internal`                   |     2026-05-29 07:36 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M1-T3-20260529-073608-pnpm-ci-prepare-internal.log`                          |
| `pnpm build:shared-config`                   |     2026-05-29 07:36 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M1-T3-20260529-073622-pnpm-build-shared-config.log`                          |
| M1 Turbo output warning scan                 |     2026-05-29 07:36 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M1-T3-20260529-073648-turbo-output-warning-scan.log`                         |
| `pnpm ai:ledger:json`                        |     2026-05-29 07:37 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M1-20260529-073736-pnpm-ai-ledger-json.log`                                  |
| `pnpm ai:doctor --open`                      |     2026-05-29 07:37 CST | PASS, 117 open tasks                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M1-20260529-073744-pnpm-ai-doctor-open.log`                                  |
| M2 bridge usage inventory                    |     2026-05-29 07:39 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M2-T1-20260529-073913-bridge-usage-inventory.log`                            |
| `pnpm --filter @ccd/shared-utils type-check` |     2026-05-29 07:39 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M2-T2-20260529-073924-shared-utils-type-check.log`                           |
| `pnpm --filter @ccd/web-demo type-check`     |     2026-05-29 07:39 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M2-T2-20260529-073930-web-demo-type-check.log`                               |
| Bridge focused Vitest                        |     2026-05-29 07:39 CST | PASS, 3 files / 19 tests                                                                  | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M2-T3-20260529-073950-bridge-focused-vitest.log`                             |
| M3 ProTable helper inventory                 |     2026-05-29 07:43 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M3-T1-20260529-074338-protable-helper-inventory.log`                         |
| `pnpm --filter @ccd/web-demo type-check`     |     2026-05-29 07:44 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M3-T2-20260529-074407-web-demo-type-check.log`                               |
| ProTable focused Vitest                      |     2026-05-29 07:44 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M3-T3-20260529-074417-protable-focused-vitest.log`                           |
| `pnpm api:report`                            |     2026-05-29 07:44 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M3-T2-20260529-074425-pnpm-api-report.log`                                   |
| `pnpm ai:ledger:json`                        |     2026-05-29 07:45 CST | PASS, 145 tasks                                                                           | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M3-20260529-074528-pnpm-ai-ledger-json.log`                                  |
| `pnpm ai:doctor --open`                      |     2026-05-29 07:45 CST | PASS, 111 open tasks                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M3-20260529-074535-pnpm-ai-doctor-open.log`                                  |
| `pnpm docs:commands`                         |     2026-05-29 07:45 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M3-20260529-074549-post-update-pnpm-docs-commands.log`                       |
| `git diff --check`                           |     2026-05-29 07:45 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M3-20260529-074552-post-update-git-diff-check.log`                           |
| M4 PrimeVue import audit                     |     2026-05-29 07:47 CST | PASS, 37 direct source files classified                                                   | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M4-T1-20260529-074704-primevue-import-audit.log`                             |
| `pnpm arch:boundaries`                       |     2026-05-29 07:48 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M4-20260529-074814-pnpm-arch-boundaries.log`                                 |
| Targeted UI boundary type-checks             |     2026-05-29 07:48 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M4-20260529-074821-ui-adapter-type-check.log`                                |
| `pnpm api:report`                            |     2026-05-29 07:48 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M4-20260529-074829-pnpm-api-report.log`                                      |
| Focused UI tests                             |     2026-05-29 07:48 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M4-20260529-074835-focused-ui-tests.log`                                     |
| M5 HTTP boundary inventory                   |     2026-05-29 07:51 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M5-T1-20260529-075115-http-boundary-inventory.log`                           |
| `pnpm arch:runtime`                          |     2026-05-29 07:52 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M5-20260529-075212-pnpm-arch-runtime.log`                                    |
| `pnpm api:report`                            |     2026-05-29 07:52 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M5-20260529-075216-pnpm-api-report.log`                                      |
| `pnpm type-check`                            |     2026-05-29 07:52 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M5-20260529-075219-pnpm-type-check.log`                                      |
| Request-layer focused Vitest                 |     2026-05-29 07:52 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M5-20260529-075232-request-layer-focused-vitest.log`                         |
| M6 guard/owner inventory                     |     2026-05-29 07:54 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M6-T1-20260529-075435-guard-owner-inventory.log`                             |
| `pnpm ai:ledger:json`                        |     2026-05-29 07:55 CST | PASS, 145 tasks                                                                           | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M6-20260529-075536-pnpm-ai-ledger-json.log`                                  |
| `pnpm ai:guard`                              |     2026-05-29 07:55 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M6-20260529-075540-pnpm-ai-guard.log`                                        |
| `pnpm ai:doctor --open`                      |     2026-05-29 07:55 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M6-20260529-075544-pnpm-ai-doctor-open.log`                                  |
| `pnpm docs:commands`                         |     2026-05-29 07:55 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M6-20260529-075550-post-update-pnpm-docs-commands.log`                       |
| `git diff --check`                           |     2026-05-29 07:55 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M6-20260529-075554-post-update-git-diff-check.log`                           |
| M7 governance/GitHub inventory               |     2026-05-29 07:57 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M7-T1-20260529-075728-governance-github-inventory.log`                       |
| `pnpm governance:refresh`                    |     2026-05-29 07:57 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M7-20260529-075736-pnpm-governance-refresh.log`                              |
| `pnpm governance:gate`                       |     2026-05-29 07:57 CST | FAIL, generated sync required                                                             | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M7-20260529-075746-pnpm-governance-gate.log`                                 |
| `pnpm governance:gate` generated-sync rerun  |     2026-05-29 07:58 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M7-20260529-075806-pnpm-governance-gate-generated-sync-rerun.log`            |
| M8 px-to-rem audit                           |     2026-05-29 08:01 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M8-T1-20260529-080113-css-pxtorem-audit.log`                                 |
| `pnpm --filter @ccd/web-demo type-check`     |     2026-05-29 08:15 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M8-20260529-081500-final-web-demo-type-check.log`                            |
| `pnpm build:web-demo`                        |     2026-05-29 08:15 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M8-20260529-081515-final-pnpm-build-web-demo.log`                            |
| `pnpm lint:check`                            |     2026-05-29 08:15 CST | PASS with 2 existing warnings                                                             | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M8-20260529-081540-pnpm-lint-check.log`                                      |
| `pnpm e2e:qa`                                |     2026-05-29 08:03 CST | FAIL, 34 passed / 2 failed                                                                | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M8-20260529-080320-pnpm-e2e-qa.log`                                          |
| M8 focused e2e failure rerun                 |     2026-05-29 08:06 CST | FAIL, same 2 failures reproduced                                                          | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M8-20260529-080600-e2e-failure-rerun.log`                                    |
| M8 production screenshot matrix              |     2026-05-29 08:09 CST | PARTIAL: login/dashboard/chart captured; table-heavy blocked by `.p-datatable` height `0` | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M8-20260529-080930-production-screenshot-check-rerun.log`                    |
| M8 table-heavy A/B diagnostic                |     2026-05-29 08:13 CST | BLOCKED: same table zero-height failure with original pxtorem exclude                     | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M8-20260529-081355-ab-baseline-table-diagnostic.log`                         |
| M9 Vite/Rollup/esbuild inventory             |     2026-05-29 08:18 CST | PASS, migration blocked pending approval                                                  | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M9-T1-20260529-081820-vite-inventory.log`                                    |
| `pnpm deps:outdated`                         |     2026-05-29 08:19 CST | INVENTORY, exit 1 because outdated packages exist                                         | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M10-T1-20260529-081950-pnpm-deps-outdated.log`                               |
| `pnpm outdated --format json`                |     2026-05-29 08:20 CST | INVENTORY, exit 1 because outdated packages exist                                         | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M10-T1-20260529-082010-pnpm-outdated-json.log`                               |
| M11 Login Diorama approval gate              |     2026-05-29 08:22 CST | BLOCKED pending approval and prerequisite stability                                       | `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M11-login-diorama-approval-gate.md`                                               |
| M12 directive/date noise scan                |     2026-05-29 08:24 CST | PASS, no focused `expect-error` or direct dateUtils imports remain                        | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M12-T1-20260529-082430-directive-dateutils-noise-scan.log`                   |
| M12 focused directive Vitest                 |     2026-05-29 10:09 CST | PASS, 8 files / 25 tests                                                                  | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M12-T1-20260529-082500-focused-directive-vitest.log`                         |
| `pnpm --filter @ccd/web-demo type-check`     |     2026-05-29 10:10 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M12-T2-20260529-082520-web-demo-type-check.log`                              |
| `pnpm build:web-demo`                        |     2026-05-29 10:10 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M12-T2-20260529-082535-pnpm-build-web-demo.log`                              |
| `pnpm lint:check`                            |     2026-05-29 10:10 CST | PASS with 2 existing warnings                                                             | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M12-T1-20260529-082555-pnpm-lint-check.log`                                  |
| `pnpm check`                                 |     2026-05-29 10:10 CST | PASS with 2 existing warnings                                                             | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M12-T3-20260529-082620-pnpm-check.log`                                       |
| M13 P4 deferred classification               |     2026-05-29 10:12 CST | PASS, documentation-only                                                                  | `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M13-p4-deferred.md`                                                               |
| `pnpm install --frozen-lockfile`             |     2026-05-29 10:12 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101210-pnpm-install-frozen-lockfile.log`                  |
| `pnpm ci:prepare-internal`                   |     2026-05-29 10:12 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101220-pnpm-ci-prepare-internal.log`                      |
| `pnpm ci:smoke:packages`                     |     2026-05-29 10:12 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101230-pnpm-ci-smoke-packages.log`                        |
| `pnpm ai:doctor`                             |     2026-05-29 10:12 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101240-pnpm-ai-doctor.log`                                |
| `pnpm codex:preflight`                       |     2026-05-29 10:12 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101250-pnpm-codex-preflight.log`                          |
| `pnpm type-check`                            |     2026-05-29 10:13 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101300-pnpm-type-check.log`                               |
| `pnpm lint:check`                            |     2026-05-29 10:13 CST | PASS with 2 existing warnings                                                             | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101310-pnpm-lint-check.log`                               |
| `pnpm test:run`                              |     2026-05-29 10:20 CST | PASS, 67 files / 386 tests                                                                | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101320-pnpm-test-run.log`                                 |
| `pnpm build:web-demo`                        |     2026-05-29 10:20 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101330-pnpm-build-web-demo.log`                           |
| `pnpm build:desktop`                         |     2026-05-29 10:21 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101340-pnpm-build-desktop.log`                            |
| `pnpm budget:desktop`                        |     2026-05-29 10:21 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101350-pnpm-budget-desktop.log`                           |
| `pnpm validate:governance`                   |     2026-05-29 10:24 CST | PASS after generated-sync rerun                                                           | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101409-pnpm-validate-governance-generated-sync-rerun.log` |
| `pnpm build:ci`                              |     2026-05-29 10:26 CST | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101410-pnpm-build-ci.log`                                 |
| M14 final report                             |     2026-05-29 10:26 CST | NO_GO because blockers remain                                                             | `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M14-final-validation.md`                                                          |
| `pnpm docs:commands`                         | 2026-05-29 final refresh | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101451-pnpm-docs-commands.log`                            |
| `pnpm ai:doctor --open`                      | 2026-05-29 final refresh | PASS, 82 open tasks all BLOCKED/DEFERRED                                                  | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101440-pnpm-ai-doctor-open.log`                           |
| Open actionable scan                         | 2026-05-29 final refresh | PASS, no unchecked task lacks BLOCKED/DEFERRED                                            | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101442-open-actionable-unblocked-scan.log`                |
| `git diff --check`                           | 2026-05-29 final refresh | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101420-git-diff-check.log`                                |
| `git branch --show-current`                  | 2026-05-29 final refresh | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101455-git-branch-show-current.log`                       |
| `git log -10 --oneline`                      | 2026-05-29 final refresh | PASS                                                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101456-git-log-10-oneline.log`                            |
| `git status --short --untracked-files=all`   | 2026-05-29 final refresh | PASS, dirty state reported                                                                | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101430-git-status-short-untracked.log`                    |
| AI runtime ignored status                    | 2026-05-29 final refresh | PASS, ignored repair ledger reported                                                      | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101457-git-status-ai-runtime-ignored.log`                 |

## Remaining risks

- M8 `P2-CSS-Validation` remains blocked by ProTable/AppContainer layout debt unrelated to the pxtorem patch.
- P1 guard decisions remain blocked pending owner signoff.
- Vite 8 migration remains blocked pending isolated branch/worktree approval.
- Dependency lanes remain blocked pending explicit per-lane operator approval.
- Login Diorama remains blocked pending operator approval and P1/P2 prerequisite stability.
- Final go/no-go remains `NO_GO` until blockers are resolved or explicitly accepted.
- Generated adapter drift may occur if root `AGENTS.md` is edited directly.
- `packages/vue-hooks/src/createAutoMittHook.spec.ts` still has two existing `vue/one-component-per-file` warnings.
- P4 strategic work remains deferred or blocked pending owner approval.

## Next action

Choose one blocked lane to approve or resolve. Recommended first lane is B-007 ProTable/AppContainer layout validation debt because it blocks M8 table-heavy/e2e confidence without requiring dependency, Vite, auth, or remote governance mutation.

## Update requirements

Update this file after:

- every completed milestone;
- every `BLOCKED` task;
- every failed validation;
- every owner decision;
- final go/no-go.
