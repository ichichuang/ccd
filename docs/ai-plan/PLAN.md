# CCD Architecture Repair Plan

## Status values

Use only:

- `TODO`
- `IN_PROGRESS`
- `DONE`
- `BLOCKED`
- `NOT_APPLICABLE`
- `DEFERRED`

Do not mark generated tasks as `DONE` initially.

## Global execution rules

- Execute one milestone at a time.
- Do not mix unrelated repair lanes.
- Do not start P2 modernization before P1 boundary stabilization unless the operator explicitly overrides.
- Do not start P3 Login Diorama before P1 is stable.
- Do not implement P4 strategic work without owner approval.
- Stop when validation fails, evidence is missing, or scope expands.

## Current P3 execution overlay

The active 2026-05-30 lane is `ccd-architecture-optimization-plan/plans/03-P3-feature-and-runtime-refactors.md`.

Execute only implementable P3 items that do not require approval. Current P3 evidence shows no actionable `OPEN` P3 task: `DEPS-004` remains `BLOCKED_BY_REVIEW`, `DEPS-005` remains `BLOCKED_BY_HTTP_CONTRACT`, `DOC-003` remains `DEFERRED`, and runtime-ledger Login Diorama tasks remain blocked pending M11 approval/prerequisite stability.

Do not upgrade dependencies, start PrimeVue/alova modernization, edit login UI/auth flow, start Vite 8 work, mutate GitHub remote settings, or execute P4 work unless approval is explicitly recorded.

Current evidence directory:

- `docs/ai-runs/20260530-114939-ccd-p3-feature-and-runtime-refactors/`

Authoritative next-action status is `docs/ai-plan/NEXT_ACTIONS.md`; historical M2/M8/M9/M10/P2 guidance in this plan is archived context, not the current lane selector.

---

## M0 — Baseline, run directory, and plan materialization

Purpose:
Create the planning system and verify current local state before implementation.

Preconditions:

- Operator has provided repository checkout.
- Codex Desktop is running inside CCD repository.

Scope:

- Inspect current branch/status/log.
- Create `docs/ai-plan/**`.
- Create active `docs/ai-runs/**`.
- No source implementation.

Out-of-scope:

- Code changes.
- Dependency changes.
- Commits.
- Pushes.

Files or areas likely affected:

- `docs/ai-plan/**`
- `docs/ai-runs/**`

Dependencies:

- None.

### Tasks

#### M0-T1 — Capture local baseline

- Status: `DONE`
- Objective: Record current branch, status, and recent commits.
- Preconditions: Repository available.
- Implementation approach: Run inspection commands only.
- Expected files or modules: `docs/ai-runs/**/reports/baseline.md`.
- Acceptance criteria: Baseline report contains branch, status, last 10 commits, and active run directory.
- Validation command or method:
  - `git status --short --untracked-files=all`
  - `git log -10 --oneline`
  - `git branch --show-current`
- Evidence to collect: command logs and baseline report.
- Rollback or revert note: N/A.
- Risk level: Low.

#### M0-T2 — Materialize planning files

- Status: `DONE`
- Objective: Create planning package under `docs/ai-plan/**`.
- Preconditions: Baseline captured.
- Implementation approach: Add planning docs only.
- Expected files or modules: `docs/ai-plan/**`.
- Acceptance criteria: All required planning files exist and contain no implementation code.
- Validation command or method:
  - `git diff --check`
  - file presence inspection
- Evidence to collect: file tree report and diff summary.
- Rollback or revert note: Remove planning files only after approval.
- Risk level: Low.

#### M0-T3 — Post-7 validation checkpoint

- Status: `DONE`
- Objective: Confirm current local stack remains valid after the seventh local commit.
- Preconditions: Planning docs materialized or intentionally deferred.
- Implementation approach: Run full checkpoint before implementation.
- Expected files or modules: command logs only.
- Acceptance criteria: Commands pass or failures are recorded as `BLOCKED`.
- Validation command or method:
  - `pnpm install --frozen-lockfile`
  - `pnpm ci:prepare-internal`
  - `pnpm ci:smoke:packages`
  - `pnpm ai:doctor`
  - `pnpm codex:preflight`
  - `pnpm type-check`
  - `pnpm lint:check`
  - `pnpm test:run`
  - `pnpm build:web-demo`
  - `pnpm build:desktop`
  - `pnpm budget:desktop`
  - `pnpm validate:governance`
  - `pnpm build:ci`
  - `git diff --check`
  - `git status --short --untracked-files=all`
- Evidence to collect: full command logs.
- Rollback or revert note: N/A.
- Risk level: Medium.

Acceptance criteria:

- Planning files exist.
- Active evidence directory exists.
- Baseline logs exist.
- `STATUS.md` reflects the current checkpoint state.

Required evidence:

- Baseline report.
- Command logs.
- Diff summary.

Rollback strategy:

- Remove only planning files if operator rejects them.
- Do not use destructive git rollback without approval.

Stop conditions:

- Dirty state contains unexpected files.
- Post-7 checkpoint fails.
- Generated governance outputs change unexpectedly.
- Operator has not approved proceeding after planning materialization.

Risk level: Medium.
Estimated complexity: Medium.
Notes for coding agent:

- Stop after M0 unless operator explicitly asks to continue.

---

## M1 — Residual P1 type validation and Turbo output warning lane

Purpose:
Close residual type-hardening validation and reduce validation noise from Turbo output warnings.

Preconditions:

- M0 complete.
- No unresolved post-7 validation blocker.

Scope:

- Inspect ProForm/CoreTypes changes already made.
- Confirm no `any` or assertion-driven business logic was introduced.
- Add or verify Turbo outputs for `@ccd/vue-charts#build` and `@ccd/vue-ui#build` if needed.
- Validate focused ProForm and build output behavior.

Out-of-scope:

- ProTable functional refactor.
- HTTP contract changes.
- Dependency upgrades.

Files or areas likely affected:

- `apps/web-demo/src/components/ProForm/**`
- `turbo.json`
- package metadata only if inspection proves required.

Dependencies:

- M0.

### Tasks

#### M1-T1 — CoreTypes no-any audit

- Status: `DONE`
- Objective: Verify P1 CoreTypes work did not introduce `any` or unsafe assertion-driven logic.
- Preconditions: M0 complete.
- Implementation approach: Inspect changed ProForm/Core type files and record findings.
- Expected files or modules: `apps/web-demo/src/components/ProForm/**`.
- Acceptance criteria: No new business-code `any`; assertions are boundary-only and justified.
- Validation command or method:
  - targeted grep/AST inspection
  - `pnpm --filter @ccd/web-demo type-check`
- Evidence to collect: audit note and command logs.
- Rollback or revert note: Revert only unsafe type changes if found.
- Risk level: Low.

#### M1-T2 — ProForm focused validation

- Status: `DONE`
- Objective: Validate tightened ProForm types.
- Preconditions: M1-T1 complete or not applicable.
- Implementation approach: Run focused type-check and relevant tests after inspecting exact test names.
- Expected files or modules: ProForm engine and tests.
- Acceptance criteria: Focused validation passes.
- Validation command or method:
  - `pnpm --filter @ccd/web-demo type-check`
  - focused Vitest command after inspection
- Evidence to collect: command logs.
- Rollback or revert note: Revert targeted ProForm type deltas only.
- Risk level: Low.

#### M1-T3 — Turbo outputs verification

- Status: `DONE`
- Objective: Ensure `@ccd/vue-ui` and `@ccd/vue-charts` build outputs are recognized and warnings do not hide failures.
- Preconditions: M0 complete.
- Implementation approach: Inspect current Turbo task outputs and package build scripts before editing.
- Expected files or modules: `turbo.json`, package metadata only if required.
- Acceptance criteria: Turbo build outputs are correct and no unrelated task config changes are made.
- Validation command or method:
  - `pnpm ci:prepare-internal`
  - `pnpm build:shared-config`
  - `pnpm build:ci` if metadata/config changes
- Evidence to collect: command logs and diff summary.
- Rollback or revert note: Revert Turbo/package metadata changes.
- Risk level: Medium.

Stop conditions:

- Need to edit package scripts beyond output declarations.
- Build artifacts or generated governance outputs drift unexpectedly.
- Any unrelated package export change becomes necessary.

Risk level: Medium.
Estimated complexity: Low-Medium.
Notes for coding agent:

- Keep M1 narrow. Do not touch Bridge, ProTable, HTTP, or UI boundary work.

---

## M2 — Capability Bridge generics

Purpose:
Relax bridge generics so explicit capability interfaces work without fake index signatures while preserving strict capability contracts.

Preconditions:

- M0 complete.
- M1 complete or explicitly deferred.

Scope:

- Inspect actual helper path. Current expected location is `packages/shared-utils/src/createCapabilityBridge.ts`; verify locally.
- Adjust generics only if necessary.
- Add/update targeted tests.
- Validate auth/router bridge behavior.

Out-of-scope:

- HTTP refactor.
- Router/store redesign.
- Broad shared-utils changes.
- `packages/contracts/**` or `packages/core/**` changes unless explicitly approved.

Files or areas likely affected:

- `packages/shared-utils/src/createCapabilityBridge.ts`
- `packages/shared-utils/src/createCapabilityBridge.spec.ts`
- `apps/web-demo/src/infra/auth/tokenProvider.ts`
- `apps/web-demo/src/infra/router/routeProvider.ts`

Dependencies:

- M0.
- Prefer M1.

### Tasks

#### M2-T1 — Bridge usage inventory

- Status: `DONE`
- Objective: Find all `createCapabilityBridge` usages and test bridges.
- Preconditions: M0 complete.
- Implementation approach: Repository search and type baseline.
- Expected files or modules: shared-utils bridge file and app infra usages.
- Acceptance criteria: Inventory lists all usages and current type friction.
- Validation command or method: repository search and type-check baseline.
- Evidence to collect: inventory report.
- Rollback or revert note: N/A.
- Risk level: Low.

#### M2-T2 — Generic constraint refinement

- Status: `DONE`
- Objective: Make explicit interfaces accepted without permissive catch-all map.
- Preconditions: M2-T1 complete.
- Implementation approach: Refine generic constraints while preserving runtime behavior.
- Expected files or modules: `packages/shared-utils/src/createCapabilityBridge.ts`.
- Acceptance criteria:
  - No fake index signatures required.
  - No broad `Record<string, unknown>` catch-all requirement.
  - `install`, `get`, `getOrThrow`, and `resetForTest` semantics unchanged.
- Validation command or method: targeted type-check.
- Evidence to collect: diff summary and type-check log.
- Rollback or revert note: Revert helper change.
- Risk level: Medium.

#### M2-T3 — Bridge tests

- Status: `DONE`
- Objective: Cover explicit capability object acceptance and invalid capability rejection.
- Preconditions: M2-T2 complete.
- Implementation approach: Add or update focused tests.
- Expected files or modules: `packages/shared-utils/src/createCapabilityBridge.spec.ts` and/or app tests after inspection.
- Acceptance criteria: Tests prove explicit interfaces work and invalid capabilities fail.
- Validation command or method:
  - focused Vitest
  - `pnpm type-check`
  - `pnpm test:run` if behavior changes broadly
- Evidence to collect: test logs.
- Rollback or revert note: Revert helper/test changes.
- Risk level: Medium.

Stop conditions:

- Change requires modifying `packages/contracts` or `packages/core`.
- Helper becomes permissive catch-all.
- Runtime semantics change.
- Tests require broad app bootstrapping changes.

Risk level: Medium.
Estimated complexity: Low-Medium.
Notes for coding agent:

- This is the recommended first implementation lane after checkpoint.

---

## M3 — ProTable typings and helper boundary

Purpose:
Stabilize ProTable typings, helper availability, and public/local boundary.

Preconditions:

- M0 complete.
- M2 complete or not relevant.

Scope:

- Inspect `apps/web-demo/src/components/ProTable/**`.
- Verify `useProTableInfiniteScroll` and `useProTableUrlSync` existence.
- Decide whether helpers should be exported from local component index or remain internal.
- Reduce improper coupling in props shape where safe.
- Validate table examples/views.

Out-of-scope:

- Full table redesign.
- HTTP contract implementation.
- PrimeVue replacement.

Files or areas likely affected:

- `apps/web-demo/src/components/ProTable/**`
- local ProTable index/types files.
- tests/examples only if needed.

Dependencies:

- M0.
- Prefer M2.

### Tasks

#### M3-T1 — ProTable helper inventory

- Status: `DONE`
- Objective: Determine helper presence, imports, exports, and type usage.
- Preconditions: M0 complete.
- Implementation approach: Search files and inspect public API.
- Expected files or modules: `apps/web-demo/src/components/ProTable/**`.
- Acceptance criteria: Inventory distinguishes internal-only helpers from public helpers.
- Validation command or method: repository search and type-check.
- Evidence to collect: inventory report.
- Rollback or revert note: N/A.
- Risk level: Low.

#### M3-T2 — ProTable exports correction

- Status: `DONE`
- Objective: Export only approved helpers/types from the correct boundary.
- Preconditions: M3-T1 complete.
- Implementation approach: Update local index/types only after inventory.
- Expected files or modules: `apps/web-demo/src/components/ProTable/index.ts`.
- Acceptance criteria: Public API is explicit; internal hooks are not accidentally exposed unless justified.
- Validation command or method:
  - `pnpm --filter @ccd/web-demo type-check`
  - `pnpm api:report` if public API reports are affected
- Evidence to collect: diff summary and validation logs.
- Rollback or revert note: Revert export changes.
- Risk level: Medium.

#### M3-T3 — ProTable props shape stabilization

- Status: `DONE`
- Objective: Resolve remaining typing friction without pulling app HTTP internals deeper into component API.
- Preconditions: M3-T2 complete or not applicable.
- Implementation approach: Prefer structural/local types and preserve `apiExecutor` as injected boundary.
- Expected files or modules: ProTable props/type files.
- Acceptance criteria:
  - ProTable remains decoupled from concrete HTTP client.
  - Runtime behavior is preserved.
  - Type-check passes.
- Validation command or method: targeted type-check and focused smoke tests if present.
- Evidence to collect: validation logs.
- Rollback or revert note: Revert type changes.
- Risk level: Medium.

Stop conditions:

- Work requires HTTP contract migration.
- Work changes table runtime behavior unexpectedly.
- ProTable becomes a concrete alova wrapper.
- PrimeVue DataTable assumptions change without visual evidence.

Risk level: Medium.
Estimated complexity: Medium.
Notes for coding agent:

- Do not fold M5 HTTP boundary into this milestone.

---

## M4 — UI Library Boundary and PrimeVue Adapter

Purpose:
Define and enforce where PrimeVue can appear.

Preconditions:

- M0 complete.
- M3 complete or not blocking.

Scope:

- Audit direct `primevue/*` imports in apps and packages.
- Write policy before enforcement.
- Keep theme, PassThrough, services, and global config inside adapter.
- Keep `@ccd/vue-ui` as CCD primitives, not loose PrimeVue re-export bucket.
- Add guard only after policy approval.

Out-of-scope:

- Replacing PrimeVue.
- Adopting Reka UI.
- Large component rewrites.
- Login Diorama.

Files or areas likely affected:

- `docs/ai-plan/DECISIONS.md`
- `packages/vue-primevue-adapter/**`
- `packages/vue-ui/**`
- `apps/web-demo/src/plugins/**`
- `apps/desktop/**`
- `scripts/ai-architecture-guard.mjs` only after policy approval.

Dependencies:

- M0.
- Prefer M3.

### Tasks

#### M4-T1 — PrimeVue import audit

- Status: `DONE`
- Objective: Classify every direct `primevue/*` import.
- Preconditions: M0 complete.
- Implementation approach: Repository search and classification.
- Expected files or modules: active run audit report.
- Acceptance criteria: Each import is classified as bootstrap, adapter, primitive, app component, example, test, or violation.
- Validation command or method: repository search and manual classification.
- Evidence to collect: import audit table.
- Rollback or revert note: N/A.
- Risk level: Low.

#### M4-T2 — UI boundary policy

- Status: `DONE`
- Objective: Define allowed and forbidden PrimeVue import surfaces.
- Preconditions: M4-T1 complete.
- Implementation approach: Record policy in decisions; do not enforce until approved.
- Expected files or modules: `docs/ai-plan/DECISIONS.md`; optional `.ai/rules/**` only if approved.
- Acceptance criteria: Policy is explicit and does not break valid exceptions.
- Validation command or method: human review.
- Evidence to collect: decision record.
- Rollback or revert note: Revert policy doc.
- Risk level: Medium.

#### M4-T3 — Adapter and primitive alignment

- Status: `DONE`
- Objective: Move only clearly misplaced theme/service/global config to adapter; avoid broad rewrites.
- Preconditions: M4-T2 approved.
- Implementation approach: Targeted moves only.
- Expected files or modules: `packages/vue-primevue-adapter/**`, `packages/vue-ui/**`, app plugin files if needed.
- Acceptance criteria:
  - Adapter owns global PrimeVue integration.
  - `vue-ui` owns CCD primitives.
  - No loose PrimeVue re-export bucket.
- Validation command or method:
  - `pnpm api:report`
  - `pnpm arch:boundaries`
  - `pnpm type-check`
  - focused UI tests
- Evidence to collect: command logs and diff summary.
- Rollback or revert note: Revert targeted moves.
- Risk level: High.

#### M4-T4 — Guard rule after policy approval

- Status: `BLOCKED`
- Objective: Add architecture guard only for agreed forbidden imports.
- Preconditions: policy approved and false-positive surface understood.
- Implementation approach: Add one guard rule with exceptions.
- Expected files or modules: `scripts/ai-architecture-guard.mjs`.
- Acceptance criteria: Guard catches violations and permits documented exceptions.
- Validation command or method:
  - `pnpm ai:guard`
  - `pnpm ai:doctor`
  - `pnpm codex:preflight`
- Evidence to collect: guard logs.
- Rollback or revert note: Revert guard rule.
- Risk level: High.

Stop conditions:

- Policy is not approved.
- Guard creates large failure surface.
- Work requires broad component replacement.
- Visual regressions appear.

Risk level: High.
Estimated complexity: Medium-High.
Notes for coding agent:

- Policy before guard. Do not invert this order.

---

## M5 — HTTP contract and request boundary

Purpose:
Make HTTP boundaries explicit while preserving alova and runtime-neutral core/contracts.

Preconditions:

- M0 complete.
- M2 bridge stable.
- Owner agrees whether `packages/contracts/src/http/**` may be edited.

Scope:

- Audit existing app HTTP code.
- Define contract shapes only where runtime-neutral.
- Keep alova implementation in app adapter/infrastructure.
- Use Zod only at stable API boundaries.
- Prevent router/store/session direct coupling except via approved bridges.

Out-of-scope:

- Replacing alova.
- Introducing Axios/Ky/TanStack Query.
- Full API rewrite.
- Auth flow redesign unless required by boundary fix and approved.

Files or areas likely affected:

- `docs/ai-plan/DECISIONS.md`
- `apps/web-demo/src/utils/http/**`
- `apps/web-demo/src/adapters/http/**`
- `packages/contracts/src/http/**` only after explicit approval.
- `packages/core/src/http/**` only if runtime-neutral orchestration is proven.

Dependencies:

- M0.
- M2.

### Tasks

#### M5-T1 — HTTP boundary inventory

- Status: `DONE`
- Objective: Map request methods, interceptors, auth bridge, errors, Zod, raw fetch exceptions, and storage coupling.
- Preconditions: M0 complete.
- Implementation approach: Audit before implementation.
- Expected files or modules: active run inventory report.
- Acceptance criteria: Inventory separates contracts, core orchestration, app adapter, and UI consumer.
- Validation command or method: repository search and manual review.
- Evidence to collect: HTTP boundary report.
- Rollback or revert note: N/A.
- Risk level: Medium.

#### M5-T2 — Contract proposal

- Status: `BLOCKED`
- Objective: Define request/response/error/retry/timeout/auth policy shapes.
- Preconditions: M5-T1 complete and operator approval for contracts work.
- Implementation approach: Draft decision first; implement only runtime-neutral contracts if approved.
- Expected files or modules: `docs/ai-plan/DECISIONS.md`; `packages/contracts/src/http/**` only after approval.
- Acceptance criteria: Contracts contain no browser APIs, fetch, timers, storage, router, Pinia, or alova.
- Validation command or method:
  - human review
  - `pnpm arch:runtime` if code added
- Evidence to collect: decision record and type-check log if implemented.
- Rollback or revert note: Revert contract files.
- Risk level: High.

#### M5-T3 — Adapter alignment

- Status: `DONE`
- Objective: Keep alova implementation behind app adapter boundary.
- Preconditions: M5-T2 approved or marked not applicable.
- Implementation approach: Targeted adapter alignment only.
- Expected files or modules: `apps/web-demo/src/adapters/http/**` or approved app path.
- Acceptance criteria: Request code does not directly couple router/store/session except approved bridges.
- Validation command or method:
  - `pnpm arch:runtime`
  - `pnpm api:report`
  - targeted request tests
- Evidence to collect: command logs.
- Rollback or revert note: Revert adapter moves.
- Risk level: High.

#### M5-T4 — Zod boundary validation

- Status: `DONE`
- Objective: Apply response schema validation only where stable.
- Preconditions: API boundaries identified.
- Implementation approach: No blanket schema churn.
- Expected files or modules: API modules and schemas if approved.
- Acceptance criteria: Validation added only at stable boundaries and cost is acceptable.
- Validation command or method: request-layer tests.
- Evidence to collect: test logs.
- Rollback or revert note: Revert schema changes.
- Risk level: Medium.

Stop conditions:

- Need to touch auth flow deeply.
- Contracts would import runtime/app code.
- API behavior changes without tests.
- Dependency addition required.
- Request tests are missing and cannot be safely authored narrowly.

Risk level: High.
Estimated complexity: High.
Notes for coding agent:

- Inventory first. Do not start by moving files.

---

## M6 — Architecture guard coverage and owner decisions

Purpose:
Resolve pending governance decisions and add guard rules only after contradictions are closed.

Preconditions:

- M0 complete.
- Owner decisions inspected.
- UI/HTTP policies sufficiently clear for guard scope.

Scope:

- Resolve rule contradictions.
- Select canonical design-token rule file.
- Add guard rules one at a time.
- Update owner decision log if approved.

Out-of-scope:

- Broad rule rewrite.
- Weakening gates.
- Generated governance hand edits.

Files or areas likely affected:

- `.ai/runtime/owner_decisions.md` if local runtime docs are approved for update.
- `.ai/runtime/rule_coverage_matrix.md`
- `docs/ai-plan/DECISIONS.md`
- `scripts/ai-architecture-guard.mjs`

Dependencies:

- M0.
- Prefer M4 policy and M5 inventory.

### Tasks

#### M6-T1 — Rule contradiction inventory

- Status: `DONE`
- Objective: Re-read rule coverage matrix and owner decisions.
- Preconditions: M0 complete.
- Implementation approach: Produce contradiction matrix.
- Expected files or modules: active run report.
- Acceptance criteria: Each contradiction has proposed resolution or `BLOCKED` owner question.
- Validation command or method: human review.
- Evidence to collect: contradiction matrix.
- Rollback or revert note: N/A.
- Risk level: Medium.

#### M6-T2 — Owner signoff records

- Status: `BLOCKED`
- Objective: Record approved decisions.
- Preconditions: owner approval exists.
- Implementation approach: Update decision docs; update runtime owner decisions only if allowed.
- Expected files or modules: `docs/ai-plan/DECISIONS.md`; `.ai/runtime/owner_decisions.md` if approved.
- Acceptance criteria: Decisions are explicit and not fabricated.
- Validation command or method: `pnpm ai:doctor` if runtime docs touched.
- Evidence to collect: decision log.
- Rollback or revert note: Revert decision doc changes.
- Risk level: Medium.

#### M6-T3 — Add guard rules incrementally

- Status: `BLOCKED`
- Objective: Implement accepted checks one at a time.
- Preconditions: rule scope approved.
- Implementation approach: One guard rule per focused change.
- Expected files or modules: `scripts/ai-architecture-guard.mjs`.
- Acceptance criteria: Each rule has exceptions, tests or fixture evidence, and no unrelated failures.
- Validation command or method:
  - `pnpm ai:guard`
  - `pnpm ai:doctor`
  - `pnpm codex:preflight`
  - `pnpm lint:check`
- Evidence to collect: command logs.
- Rollback or revert note: Revert specific guard rule.
- Risk level: High.

Stop conditions:

- Owner signoff missing.
- Guard failure surface is broad.
- Rules contradict existing approved patterns.
- Generated governance drift appears unexpectedly.

Risk level: High.
Estimated complexity: Medium-High.
Notes for coding agent:

- Guard enforcement must follow policy and owner decisions.

---

## M7 — Governance discipline and GitHub repository governance

Purpose:
Document and improve repository governance without changing external GitHub settings unless explicitly approved.

Preconditions:

- M0 complete.
- P1 decisions stable enough to document.

Scope:

- Document generated artifact policy.
- Run governance refresh only when official commands require it.
- Add/refine CODEOWNERS/templates only if approved.
- Document branch protection required checks.

Out-of-scope:

- Directly changing remote branch protection without approval.
- Pushes.
- Release automation rewrites.

Files or areas likely affected:

- `docs/ai-plan/**`
- `.github/**` only if approved.

Dependencies:

- M0.
- Prefer P1 policy work.

### Tasks

#### M7-T1 — Generated artifact discipline

- Status: `DONE`
- Objective: Ensure generated outputs are regenerated, not hand-edited.
- Preconditions: M0 complete.
- Implementation approach: Document policy and verify no manual generated changes.
- Expected files or modules: `docs/ai-plan/EVIDENCE_POLICY.md`, governance docs if needed.
- Acceptance criteria: Policy clear; no manual generated edits.
- Validation command or method:
  - `pnpm governance:gate`
  - `git status --short --untracked-files=all`
- Evidence to collect: logs.
- Rollback or revert note: Revert docs changes.
- Risk level: Low.

#### M7-T2 — GitHub governance documentation

- Status: `DONE`
- Objective: Document branch protection, required checks, CODEOWNERS/templates plan.
- Preconditions: M7-T1 complete.
- Implementation approach: Document first; edit `.github/**` only after approval.
- Expected files or modules: `docs/ai-plan/DECISIONS.md`; optional `.github/**`.
- Acceptance criteria: Required checks include governance, type, lint, build, and UI/E2E where practical.
- Validation command or method:
  - `pnpm governance:github-workflows` if workflows touched
  - `pnpm governance:gate`
- Evidence to collect: command logs.
- Rollback or revert note: Revert governance docs/templates.
- Risk level: Medium.

Stop conditions:

- Need to alter remote GitHub settings.
- Need to push.
- Need to edit release automation beyond docs.

Risk level: Medium.
Estimated complexity: Medium.
Notes for coding agent:

- Do not configure remote branch protection unless the operator explicitly approves.

---

## M8 — CSS, tokens, and responsive engine

Purpose:
Reduce fragility of global px-to-rem and strengthen token-first responsive behavior.

Preconditions:

- P1 UI boundary policy stable.
- M0 complete.

Scope:

- Audit `postcss-pxtorem` usage.
- Identify authored CSS requiring conversion.
- Prefer tokens, CSS variables, viewport/container units, and UnoCSS rules.
- Validate PrimeVue/third-party CSS exclusion.
- Validate mobile/safe-area behavior.

Out-of-scope:

- Full design-system rewrite.
- Login Diorama unless M11 active.
- UnoCSS major upgrade.

Files or areas likely affected:

- `apps/web-demo/vite.config.ts`
- selected CSS/token files only after audit.

Dependencies:

- M0.
- Prefer M4.

### Tasks

#### M8-T1 — Px-to-rem audit

- Status: `DONE`
- Objective: Identify why conversion is needed and where blacklist is fragile.
- Preconditions: M0 complete.
- Implementation approach: Audit current config and affected CSS.
- Expected files or modules: active run report.
- Acceptance criteria: Audit lists conversion consumers and third-party exclusions.
- Validation command or method: build and visual smoke after no-op audit if needed.
- Evidence to collect: audit report.
- Rollback or revert note: N/A.
- Risk level: Medium.

#### M8-T2 — Token-first targeted fixes

- Status: `BLOCKED`
- Objective: Reduce brittle blacklist dependence only where safe.
- Preconditions: M8-T1 complete and target fixes approved.
- Implementation approach: Targeted CSS/token changes only.
- Expected files or modules: selected CSS/token files.
- Acceptance criteria:
  - No accidental PrimeVue rem conversion.
  - Mobile remains stable.
  - No design-token rule violations.
- Validation command or method:
  - `pnpm build:web-demo`
  - screenshots for login/dashboard/table/chart views
- Evidence to collect: screenshots and build logs.
- Rollback or revert note: Revert CSS changes.
- Risk level: High.
- Blocker: table-heavy production screenshot remains blocked by existing ProTable/AppContainer layout debt; `/example/primevue-collection/pro-table/basic` renders `.p-datatable` with height `0` in both patched and original pxtorem exclusion A/B runs.

Stop conditions:

- Visual regressions.
- Broad style rewrite required.
- Need to change PrimeVue theme internals before UI policy.

Risk level: High.
Estimated complexity: Medium-High.
Notes for coding agent:

- This is not a Login Diorama milestone. Keep it systemic and narrow.

---

## M9 — Vite 8 compatibility lane

Purpose:
Test Vite 8 compatibility in isolation.

Preconditions:

- P1 stable.
- M0 final checkpoint clean.
- Operator approves isolated branch/worktree.
- Current official Vite migration docs reviewed.

Scope:

- Create isolated worktree/branch only after approval.
- Inventory Vite/Rollup/esbuild config.
- Migrate deprecated options cautiously.
- Validate custom plugins.
- Compare bundle behavior.

Out-of-scope:

- UI refactor.
- HTTP refactor.
- Dependency modernization except approved Vite lane dependencies.
- Main branch changes without review.

Files or areas likely affected:

- `package.json`
- `pnpm-lock.yaml`
- `apps/web-demo/vite.config.ts`
- `apps/web-demo/build/**`
- package-level Vite configs if present.

Dependencies:

- M0.
- P1 stabilization.
- Explicit approval.

### Tasks

#### M9-T1 — Vite/Rollup/esbuild inventory

- Status: `DONE`
- Objective: Map every Vite 7 config that Vite 8 may change.
- Preconditions: M0 complete; no dependency changes.
- Implementation approach: Inventory only.
- Expected files or modules: active run inventory.
- Acceptance criteria: Inventory covers app config, build plugins, root/package configs.
- Validation command or method: no code validation beyond inventory.
- Evidence to collect: inventory report.
- Rollback or revert note: N/A.
- Risk level: Medium.

#### M9-T2 — Isolated Vite 8 experiment

- Status: `BLOCKED`
- Objective: Try migration in isolated worktree/branch.
- Preconditions: operator approval for dependency and branch/worktree changes.
- Implementation approach: isolated experiment only.
- Expected files or modules: package metadata, lockfile, Vite configs, plugin configs.
- Acceptance criteria: No unrelated changes; build behavior understood.
- Validation command or method:
  - `pnpm build:ci`
  - `pnpm vercel:build`
  - `pnpm e2e:qa`
  - bundle budget checks
- Evidence to collect: logs, bundle reports, source citations.
- Rollback or revert note: discard isolated worktree changes only with approval; no destructive git operations without approval.
- Risk level: High.
- Blocker: operator approval for isolated branch/worktree and dependency/toolchain changes was not provided; no Vite 8 migration or validation was attempted.

Stop conditions:

- Requires broad dependency upgrades.
- Vite plugin incompatibility unclear.
- ManualChunks/Oxc changes break bundle/runtime.
- Operator has not approved dependency change.

Risk level: High.
Estimated complexity: High.
Notes for coding agent:

- Do not start this lane from the planning prompt.

---

## M10 — Dependency modernization lanes

Purpose:
Upgrade dependencies by isolated lane, never by blind global latest.

Preconditions:

- P1 stable.
- Operator approves each dependency lane.
- Current official/changelog sources reviewed for target dependency.

Scope:

- Run outdated inventory.
- Choose one lane at a time.
- Validate targeted and full checks.

Out-of-scope:

- Blind global latest upgrades on main.
- Multiple ecosystem upgrades in one lane.
- Production dependency changes without approval.

Files or areas likely affected:

- `package.json`
- `pnpm-lock.yaml`
- package manifests only for approved lane.

Dependencies:

- M0.
- P1 stabilization.
- Explicit approval.

### Tasks

#### M10-T1 — Outdated inventory

- Status: `DONE`
- Objective: Capture current dependency status.
- Preconditions: M0 complete.
- Implementation approach: Run inventory only.
- Expected files or modules: active run dependency report.
- Acceptance criteria: Report includes current, wanted, latest, lane classification.
- Validation command or method: `pnpm deps:outdated`.
- Evidence to collect: command log and report.
- Rollback or revert note: N/A.
- Risk level: Low.

#### M10-T2 — Single dependency lane execution

- Status: `BLOCKED`
- Objective: Upgrade exactly one approved lane.
- Preconditions: explicit approval for the lane.
- Implementation approach: Use official docs/changelogs and isolated branch/worktree where appropriate.
- Expected files or modules: package manifests and lockfile only for approved lane.
- Acceptance criteria: No unrelated upgrades; compatibility checked.
- Validation command or method: targeted checks, then `pnpm validate` or full baseline.
- Evidence to collect: logs and source citations.
- Rollback or revert note: revert manifest and lockfile changes.
- Risk level: High.
- Blocker: no operator approval was provided for any dependency upgrade lane; no package or lockfile mutation was performed.

Stop conditions:

- Multiple major upgrades become entangled.
- Peer dependency conflict unclear.
- CI/browser install behavior changes unexpectedly.
- Official migration docs contradict local assumptions.

Risk level: High.
Estimated complexity: High.
Notes for coding agent:

- Do not run dependency upgrades from the planning prompt.

---

## M11 — Login Diorama refactor

Purpose:
Refactor login view into the target diorama composition after P1/P2 foundations stabilize.

Preconditions:

- P1 UI boundary stable.
- P1 ProTable/HTTP/guard does not block app build.
- M8 token/responsive policy stable or explicitly deferred.
- Operator approves UI refactor lane.

Scope:

- Re-read relevant rules.
- Build top-K context.
- Preserve ProForm and submit flow.
- Refactor layout/composition.
- Repair password shell.
- Preserve AnimatedCharacters logic.
- Validate responsive, visual, interaction, accessibility.

Out-of-scope:

- Replacing AnimatedCharacters.
- Replacing PrimeVue.
- Native form/input/button introduction.
- Raw hex/rem/em/z-index violations.
- Broad theme rewrite.

Files or areas likely affected:

- `apps/web-demo/src/views/login/**`
- targeted style files if needed.

Dependencies:

- M0.
- M4.
- M8 preferred.
- explicit approval.

### Task groups

#### M11-T1 — Login preflight and context

- Status: `BLOCKED`
- Objective: Re-read rules and collect local context.
- Validation method: manual rule checklist.
- Evidence: preflight report.
- Risk level: Medium.

#### M11-T2 — Diorama layout and composition

- Status: `BLOCKED`
- Objective: Build the target horizontal/stacked login composition.
- Validation method: screenshots.
- Evidence: visual report.
- Risk level: High.

#### M11-T3 — Form and interaction preservation

- Status: `BLOCKED`
- Objective: Preserve ProForm, submit flow, presets, password state, and feedback.
- Validation method: interaction smoke.
- Evidence: interaction report.
- Risk level: High.

#### M11-T4 — Character stage and reduced motion

- Status: `BLOCKED`
- Objective: Reuse AnimatedCharacters and adjust parent stage first.
- Validation method: screenshots and motion review.
- Evidence: visual report.
- Risk level: Medium.

#### M11-T5 — Design-engine compliance

- Status: `BLOCKED`
- Objective: Enforce semantic tokens, allowed sizing, borders, z-index, Rule of 7, and deep selector discipline.
- Validation method: lint, guard, manual class audit.
- Evidence: audit log.
- Risk level: High.

#### M11-T6 — Login validation

- Status: `BLOCKED`
- Objective: Complete focused login validation.
- Validation method:
  - targeted eslint
  - `pnpm --filter @ccd/web-demo type-check`
  - governance checks if imports/boundaries touched
  - browser screenshots
  - interaction smoke
- Evidence: logs and screenshots.
- Risk level: High.
- Blocker: M11 requires operator approval and prerequisite stability; no login UI or auth-flow files were edited in this run.

Stop conditions:

- P1 UI policy unresolved.
- ProForm behavior breaks.
- Login auth flow changes unexpectedly.
- Visual evidence cannot be captured.
- Design guard failures require broad token rewrite.

Risk level: High.
Estimated complexity: High.
Notes for coding agent:

- Do not start M11 until explicitly selected.

---

## M12 — Directive specs, case sensitivity, and secondary test debt

Purpose:
Clean secondary test and import-casing debt after architecture foundations.

Preconditions:

- P1 stable.
- No pending broad UI or dependency lane.

Scope:

- Update directive specs for Vue 3 hook signatures.
- Clean unused imports / expect-error noise.
- Normalize `DateUtils`/`dateUtils` import casing.
- Run focused and broader checks.

Out-of-scope:

- DateUtils behavior changes.
- Test framework reconfiguration.
- Broad example cleanup.

Files or areas likely affected:

- focused directive specs.
- date utility import sites.

Dependencies:

- M0.
- P1 stability.

### Tasks

#### M12-T1 — Directive spec cleanup

- Status: `DONE`
- Objective: Align focused specs with Vue 3 signatures.
- Acceptance criteria: No unused import/expect-error noise.
- Validation command or method:
  - focused Vitest
  - `pnpm lint:check`
- Evidence: logs.
- Rollback note: revert specs.
- Risk level: Medium.

#### M12-T2 — DateUtils casing normalization

- Status: `DONE`
- Objective: Normalize import casing without changing behavior.
- Acceptance criteria: No duplicate casing paths; build passes on case-sensitive FS.
- Validation command or method:
  - `pnpm type-check`
  - `pnpm build:web-demo`
- Evidence: logs.
- Rollback note: revert import changes.
- Risk level: Medium.

#### M12-T3 — Secondary verification

- Status: `DONE`
- Objective: Capture final residual error surface.
- Acceptance criteria: exact repo check command passes or failures documented.
- Validation command or method: inspect package commands before running `pnpm check`.
- Evidence: logs.
- Rollback note: N/A.
- Risk level: Medium.

Stop conditions:

- Changes expand beyond tests/import casing.
- Need to alter tsconfig/module resolution.
- Hidden platform-specific failures emerge.

Risk level: Medium.
Estimated complexity: Medium.
Notes for coding agent:

- This is cleanup; do not combine with Vite/dependency work.

---

## M13 — P4 deferred strategic work

Purpose:
Keep strategic work explicitly deferred until prerequisites are stable.

Preconditions:

- P1/P2/P3 status reviewed.
- Owner explicitly decides whether any P4 item moves forward.

Scope:

- Record deferred decisions.
- Define future prerequisites.
- Do not implement.

Out-of-scope:

- New organization.
- New repository.
- New starter package.
- Standalone design-system split.
- Reka UI implementation.
- TanStack Query introduction.

Files or areas likely affected:

- `docs/ai-plan/DECISIONS.md`
- `docs/ai-plan/NEXT_ACTIONS.md`

Dependencies:

- M0.

### Tasks

#### M13-T1 — Deferred strategy ledger

- Status: `DONE`
- Objective: Record why P4 items remain deferred.
- Acceptance criteria: Each P4 item has rationale and trigger to revisit.
- Validation method: human review.
- Evidence: decision log.
- Rollback note: revert docs.
- Risk level: Low.

Stop conditions:

- Operator asks to implement P4 without prerequisite review.
- Work would create new repo/org or introduce new architecture prematurely.

Risk level: Low.
Estimated complexity: Low.
Notes for coding agent:

- This milestone is documentation-only unless operator approves strategic implementation.

---

## M14 — Final validation, evidence closure, and go/no-go

Purpose:
Complete the execution program with full validation and human-reviewable final artifacts.

Preconditions:

- Active milestones are `DONE`, `DEFERRED`, or `BLOCKED` with evidence.
- No hidden dirty state.

Scope:

- Full validation baseline.
- Final validation matrix.
- Final risk register update.
- Change summary.
- Operator SOP.
- Next actions.
- Go/no-go decision.

Out-of-scope:

- New repairs.
- Pushes unless explicitly approved.

Files or areas likely affected:

- `docs/ai-plan/FINAL_GO_NO_GO.md`
- `docs/ai-plan/FINAL_VALIDATION_MATRIX.md`
- `docs/ai-plan/OPERATOR_SOP.md`
- `docs/ai-plan/NEXT_ACTIONS.md`
- `docs/ai-plan/CHANGE_SUMMARY.md`
- final `RISK_REGISTER.md`
- final `STATUS.md`

Dependencies:

- All selected milestones.

### Tasks

#### M14-T1 — Final validation

- Status: `TODO`
- Objective: Run final validation baseline.
- Validation command or method:
  - `pnpm install --frozen-lockfile`
  - `pnpm ci:prepare-internal`
  - `pnpm ci:smoke:packages`
  - `pnpm ai:doctor`
  - `pnpm codex:preflight`
  - `pnpm type-check`
  - `pnpm lint:check`
  - `pnpm test:run`
  - `pnpm build:web-demo`
  - `pnpm build:desktop`
  - `pnpm budget:desktop`
  - `pnpm validate:governance`
  - `pnpm build:ci`
  - `git diff --check`
  - `git status --short --untracked-files=all`
- Evidence: full logs.
- Risk level: Medium.

#### M14-T2 — Final artifacts

- Status: `TODO`
- Objective: Produce final review artifacts.
- Expected files:
  - `FINAL_GO_NO_GO.md`
  - `FINAL_VALIDATION_MATRIX.md`
  - `OPERATOR_SOP.md`
  - `NEXT_ACTIONS.md`
  - `CHANGE_SUMMARY.md`
  - final `RISK_REGISTER.md`
  - final `STATUS.md`
- Acceptance criteria: Human reviewer can approve or reject.
- Validation method: manual review.
- Evidence: final artifact list.
- Risk level: Low.

Stop conditions:

- Any final validation failure.
- Missing evidence.
- Dirty state unexplained.
- Unapproved risky operation occurred.

Risk level: Medium.
Estimated complexity: Medium.
Notes for coding agent:

- Final go/no-go must be honest. Do not invent passing validation.
