# PLAN — CCD Apps Public-Layer Repair and Hardening

## Execution rules

- Execute milestones in order.
- Do not mark a task `DONE` without validation evidence.
- Use `BLOCKED` when an owner decision, approval, dependency, environment, or safety precondition is missing.
- Use `NOT_APPLICABLE` only with evidence proving the candidate does not apply.
- Use `DEFERRED` only with a recorded decision and follow-up owner.
- Preserve behavior by default.
- Do not perform dependency, manifest, lockfile, destructive Git, production, credentialed, or broad rewrite operations without approval.

## Status values

- `TODO`
- `IN_PROGRESS`
- `DONE`
- `BLOCKED`
- `NOT_APPLICABLE`
- `DEFERRED`

---

## Milestone M0 — Baseline discovery and evidence setup

### Purpose

Establish a reliable repository baseline, active evidence directory, command inventory, package owner map, and current candidate inventory before implementation.

### Preconditions

Clean local workspace is strongly recommended. If workspace is not clean, record the status and stop before touching unrelated files unless the owner approves continuing.

### Scope

Inspect repository scripts, package manifests, existing public package exports, app-local candidate files, generated-file ownership, existing architecture guards, and current working tree.

### Out-of-scope

No source implementation, no migrations, no dependency changes, no generated manual edits.

### Implementation tasks

### Task M0-T01 — Inspect repository and runtime configuration

- Status: `TODO`
- Objective: Confirm actual package manager, Node/pnpm requirements, workspace layout, scripts, test commands, and package exports.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Read `package.json`, `pnpm-workspace.yaml`, app/package manifests, tsconfigs, governance scripts, and any existing AGENTS or contributor docs. Do not edit source.
- Expected files or modules: `package.json`, `pnpm-workspace.yaml`, `apps/**/package.json`, `packages/**/package.json`, `tsconfig*`, `.dependency-cruiser*`, governance scripts.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Record discovered commands; do not run long validation until M0-T04.
- Evidence to collect: `reports/repo-baseline.md`, `command-logs/script-inventory.log`, `reports/package-owner-map.md`.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Low

### Task M0-T02 — Create active evidence directory

- Status: `TODO`
- Objective: Create the execution evidence location and initialize evidence metadata.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Create `docs/ai-runs/YYYYMMDD-HHMMSS-ccd-public-layer-repair/` with `reports/`, `command-logs/`, `diffs/`, and `screenshots/` subdirectories.
- Expected files or modules: `docs/ai-runs/**`.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Directory listing and metadata file.
- Evidence to collect: `reports/run-metadata.md`, `command-logs/evidence-dir-tree.log`.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Low

### Task M0-T03 — Rebuild candidate inventory

- Status: `TODO`
- Objective: Convert the prior analysis into a current candidate matrix verified against the latest working tree.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Search all `apps/**` exports, route/menu/access types, API/DTO types, sync runtime, build utilities, theme/size facades, stores, UI plugin shells, SafeStorage, DateUtils, HTTP runtime, generated registries.
- Expected files or modules: `apps/**`, `packages/**`, `docs/generated/**`, governance scripts.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Manual inspection plus search logs; no code changes.
- Evidence to collect: `reports/current-candidate-matrix.md`, `command-logs/apps-public-scan.log`, `command-logs/candidate-search.log`.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M0-T04 — Run baseline validation

- Status: `TODO`
- Objective: Capture the pre-change validation state.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Run the repository-approved baseline commands discovered in M0-T01. If a command is unavailable or environment-blocked, record exact evidence and classify as `BLOCKED_BY_ENVIRONMENT`, not pass.
- Expected files or modules: No source files expected.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Use `pnpm ci:smoke:packages`, `pnpm type-check`, `pnpm lint:check`, `pnpm test:run`, `pnpm arch:boundaries`, `pnpm arch:runtime`, `pnpm ai:guard -- --format=json`, `pnpm drift-check`, or repository equivalents after inspection.
- Evidence to collect: Command logs with exit codes, `reports/baseline-validation.md`.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Low

### Files or areas likely affected

- Repository root scripts and manifests.
- `apps/**` and `packages/**`.
- Existing governance reports and generated artifacts.

### Dependencies

None beyond local repository access and installed dependencies. If dependencies are missing, request approval before installing or changing lockfiles.

### Acceptance criteria

Baseline evidence is complete; no implementation changes were made; candidate matrix reflects current files; validation status is known.

### Validation commands

Use discovered commands. Expected candidates include `pnpm ci:smoke:packages`, `pnpm type-check`, `pnpm lint:check`, `pnpm test:run`, `pnpm arch:boundaries`, `pnpm arch:runtime`, `pnpm ai:guard -- --format=json`, `pnpm drift-check`.

### Required evidence

Run metadata, command logs, candidate matrix, package owner map, baseline validation report, and initial `STATUS.md` update.

### Rollback strategy

Revert only planning/evidence file changes if needed. Do not reset or clean Git.

### Stop conditions

Workspace contains unrelated changes, command inventory conflicts with plan, dependencies are missing and install would affect lockfile, baseline validation reveals severe unrelated failures, or package owner map is unclear.

### Risk level

Low to medium.

### Estimated complexity

Medium.

### Notes for the coding agent

Baseline failures do not automatically block planning, but they must be recorded before implementation so later regressions are distinguishable.

---

## Milestone M1 — Route/menu/access type contract extraction

### Purpose

Make route/menu/access contracts explicit and portable before any runtime helper movement.

### Preconditions

M0 completed with candidate matrix and package owner map. `@ccd/contracts` dependency policy is confirmed to be type-only/runtime-neutral.

### Scope

Extract or define type-only contracts for route access meta, menu access item, route menu item shape, safe redirect result, and related public DTOs. Reduce reliance on app-local ambient global types where safe.

### Out-of-scope

No runtime helper migration yet. No Vue Router runtime dependency in `@ccd/contracts`. No route table or view movement.

### Implementation tasks

### Task M1-T01 — Audit ambient route globals

- Status: `TODO`
- Objective: Identify every consumer of `RouteConfig`, `BackendRouteConfig`, `MenuItem`, `TabItem`, `RouteUtils`, and related app global route types.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Use search and type references to distinguish public reusable contracts from app-only route/view/runtime contracts.
- Expected files or modules: `apps/web-demo/src/types/modules/router.d.ts`, `apps/web-demo/src/router/**`, layouts and stores consuming route globals.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Search logs plus consumer map.
- Evidence to collect: `reports/route-type-consumer-map.md`, `command-logs/route-type-rg.log`.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M1-T02 — Design type-only contract shapes

- Status: `TODO`
- Objective: Create a minimal contract proposal that avoids Vue Router runtime imports and app singleton coupling.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Define minimal public shapes such as `RouteAccessMeta`, `MenuAccessItem`, `SafeRedirectResult`, and optional `RouteMenuNode` using type-only imports only.
- Expected files or modules: `packages/contracts/src/**`, `docs/ai-plan/DECISIONS.md`.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Reviewer can confirm contracts are not over-fitted to app route tables and do not require new dependencies.
- Evidence to collect: `reports/route-contract-design.md`, decision entry update.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M1-T03 — Implement approved type contracts

- Status: `TODO`
- Objective: Add type-only exports to `@ccd/contracts` if M1-T02 is approved and no manifest change is needed.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Create narrow files under contracts and export them through the package index. Keep implementation type-only.
- Expected files or modules: `packages/contracts/src/**`, package export index.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: `pnpm --filter @ccd/contracts type-check` and full type-check.
- Evidence to collect: Diff summary, type-check logs.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M1-T04 — Update app route types to consume contracts

- Status: `TODO`
- Objective: Refactor app-local route declarations to extend or compose package-owned contracts without changing route behavior.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Replace duplicated public shapes with imported type-only contracts while leaving app-specific globals and Vue Router module augmentation app-owned.
- Expected files or modules: `apps/web-demo/src/types/modules/router.d.ts`, route/menu utility type imports.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Type-check and targeted router tests.
- Evidence to collect: `reports/route-type-contract-update.md`, command logs.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M1-T05 — Add route contract type tests

- Status: `TODO`
- Objective: Add compile-time or unit tests that prevent regression to duplicate ambient-only contract definitions.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Use existing test framework; prefer type-level tests if repository has a pattern, otherwise unit tests around contract consumers.
- Expected files or modules: Contract tests under existing test locations.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: `pnpm --filter @ccd/contracts test`, `pnpm type-check`.
- Evidence to collect: Test logs and diff summary.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Files or areas likely affected

- `packages/contracts/src/**`
- `apps/web-demo/src/types/modules/router.d.ts`
- Route/menu utility consumers.

### Dependencies

Existing `@ccd/contracts` owner and export system. No new dependency is allowed by default.

### Acceptance criteria

Route/menu/access public type contracts are explicit, app globals are reduced but not erased unsafely, no runtime dependency enters contracts, and app route behavior is unchanged.

### Validation commands

`pnpm --filter @ccd/contracts type-check`; `pnpm --filter @ccd/contracts test`; `pnpm type-check`; `pnpm lint:check`; targeted route/menu tests if present.

### Required evidence

Route contract design report, decision entry, diffs, command logs, and updated `STATUS.md`.

### Rollback strategy

Revert contracts and app type imports together. Ensure app route declarations return to previous state and type-check status is known.

### Stop conditions

New dependency needed, Vue Router runtime import would enter contracts, app global type consumers are too broad to safely update, or route behavior changes are required.

### Risk level

Medium.

### Estimated complexity

High.

### Notes for the coding agent

The goal is not to eliminate all app route globals in one pass. Keep app-only route/view/runtime declarations local.

---

## Milestone M2 — Route/menu/access pure helper migration

### Purpose

Move only dependency-clean pure helpers after M1 makes contracts explicit.

### Preconditions

M1 completed or explicitly approved contract shape exists. Tests cover current access, whitelist, redirect, and menu filtering behavior.

### Scope

Migrate `checkRouteRoles`, `checkRouteAuths`, `checkRouteAccess`, `isWhiteListed`, `parseSafeRedirect`, and possibly menu access filtering to the correct governed runtime package if dependency direction is clean.

### Out-of-scope

Do not move router singleton helpers, window management, dynamic route resolver, route table loaders, route views, i18n, logger, permission store, or BroadcastChannel code.

### Implementation tasks

### Task M2-T01 — Select runtime owner for pure helpers

- Status: `TODO`
- Objective: Decide whether pure route/access helpers belong in `@ccd/vue-app-platform` or another existing governed package.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Record a decision with options. Default proposal: `@ccd/vue-app-platform` for runtime pure platform helpers; `@ccd/contracts` remains type-only.
- Expected files or modules: `docs/ai-plan/DECISIONS.md`, package owner map.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Decision is explicit before code moves.
- Evidence to collect: Decision entry and owner rationale.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M2-T02 — Migrate access helpers behind stable package exports

- Status: `TODO`
- Objective: Move approved pure helpers to package source and re-export them. Keep app-local wrapper/facade if import compatibility requires it.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Copy behavior with tests first or in same commit-level change; update app imports to package exports or compatibility facade.
- Expected files or modules: `packages/vue-app-platform/src/**`, `apps/web-demo/src/router/utils/accessControl.ts`, import consumers.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Targeted unit tests, package type-check, app type-check.
- Evidence to collect: Diff summary, test logs, parity notes.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M2-T03 — Migrate safe redirect tests

- Status: `TODO`
- Objective: Test accepted/rejected redirect cases to preserve security behavior.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Add tests for empty, malformed percent encoding, absolute URLs, protocol-relative URLs, traversal, backslash, normalized path, and query parsing.
- Expected files or modules: Test files near package or app router tests.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Unit tests pass and cover edge cases.
- Evidence to collect: Test log and coverage notes.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: High

### Task M2-T04 — Evaluate menu access filtering migration

- Status: `TODO`
- Objective: Move `filterMenuByAccess` only if menu item contract is generic enough and no app-only fields are required.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: If not safe, leave app-owned and record `NOT_APPLICABLE` with evidence.
- Expected files or modules: `packages/vue-app-platform/src/**`, `apps/web-demo/src/router/utils/menu.ts`, `apps/web-demo/src/router/utils/accessControl.ts`.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Tests prove role/auth menu filtering parity.
- Evidence to collect: Migration report or NOT_APPLICABLE evidence.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M2-T05 — Update guards against app-local duplicate helpers

- Status: `TODO`
- Objective: Strengthen architecture guard or documentation to prevent reintroducing app-local public helper duplicates.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Prefer deterministic text/static checks already used by the repo. Avoid brittle broad regex that blocks legitimate app route glue.
- Expected files or modules: `scripts/**` guard files, docs/generated if owning commands update them.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: `pnpm ai:guard -- --format=json`, governance validation.
- Evidence to collect: Guard diff, command logs, rationale.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Files or areas likely affected

- `packages/vue-app-platform/src/**`
- `apps/web-demo/src/router/utils/accessControl.ts`
- `apps/web-demo/src/router/utils/menu.ts`
- Guard scripts if needed.

### Dependencies

M1 contract output and existing test framework.

### Acceptance criteria

Pure helpers live in a governed runtime package or are precisely documented as app-owned; app compatibility is preserved; security behavior is tested.

### Validation commands

`pnpm --filter @ccd/vue-app-platform type-check`; `pnpm --filter @ccd/vue-app-platform test`; `pnpm --filter @ccd/web-demo type-check`; `pnpm type-check`; `pnpm test:run`; `pnpm ai:guard -- --format=json`.

### Required evidence

Owner decision, helper parity tests, command logs, migration report, guard report.

### Rollback strategy

Revert package helper additions and app import changes together. Keep tests if they document current behavior unless they depend on reverted package exports.

### Stop conditions

Owner decision is not approved, helper migration requires app singleton/runtime dependency, tests reveal behavior ambiguity, or security behavior would change.

### Risk level

Medium to high.

### Estimated complexity

High.

### Notes for the coding agent

Route helper movement must be minimal. Do not touch route view loading or route table shape unless directly required by the contract update.

---

## Milestone M3 — API/DTO response contract normalization

### Purpose

Eliminate ambiguous duplicate API response contracts and move stable type-only DTO envelopes to the correct contract owner.

### Preconditions

M0 candidate matrix completed. Existing API and HTTP runtime consumers are mapped.

### Scope

Normalize duplicate `ApiResponse` names, introduce precise type names, and export safe type-only contracts from `@ccd/contracts` where no runtime dependency is needed.

### Out-of-scope

Do not move app HTTP runtime, Alova instance, interceptors, auth refresh, notification policy, upload manager, Zod response schemas, or browser download/upload runtime into packages.

### Implementation tasks

### Task M3-T01 — Map API response contract consumers

- Status: `TODO`
- Objective: Identify all `ApiResponse`, request config, response envelope, DTO schema, and HTTP type consumers.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Use search plus TypeScript references. Distinguish backend envelope types from HTTP client runtime types.
- Expected files or modules: `apps/web-demo/src/types/api.ts`, `apps/web-demo/src/utils/http/types.ts`, `apps/web-demo/src/api/**`, `packages/contracts/src/http/**`.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Consumer map complete.
- Evidence to collect: `reports/api-dto-consumer-map.md`, search logs.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M3-T02 — Decide contract naming

- Status: `TODO`
- Objective: Choose explicit names such as `BackendResponseEnvelope`, `HttpClientResponseEnvelope`, or project-approved equivalents.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Record decision. Do not invent names if existing conventions exist; inspect first.
- Expected files or modules: `docs/ai-plan/DECISIONS.md`.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Decision accepted or marked blocked.
- Evidence to collect: Decision log update.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M3-T03 — Implement type-only API/DTO contracts

- Status: `TODO`
- Objective: Add safe envelope/request/response types to `@ccd/contracts` only if they do not need Zod or browser runtime types.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Use existing contracts/http structure where appropriate.
- Expected files or modules: `packages/contracts/src/http/**`, `packages/contracts/src/index.ts`.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Contracts type-check.
- Evidence to collect: Diff summary, type-check logs.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M3-T04 — Rename app-local ambiguous types

- Status: `TODO`
- Objective: Update app-local types/imports to remove duplicate `ApiResponse` ambiguity while preserving runtime behavior.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Use compatibility aliases only if needed and mark deprecated.
- Expected files or modules: `apps/web-demo/src/types/api.ts`, `apps/web-demo/src/utils/http/types.ts`, `apps/web-demo/src/api/**`.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Full type-check and API tests pass.
- Evidence to collect: Diff summary, type-check logs, consumer update report.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: High

### Task M3-T05 — Guard against response contract drift

- Status: `TODO`
- Objective: Add a deterministic guard or test to prevent reintroducing duplicate incompatible `ApiResponse` definitions.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Prefer static check scoped to known locations; avoid blocking legitimate local response DTOs with explicit names.
- Expected files or modules: Guard script or test files.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Guard/test passes.
- Evidence to collect: Guard logs and rationale.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Files or areas likely affected

- `apps/web-demo/src/types/api.ts`
- `apps/web-demo/src/utils/http/types.ts`
- `apps/web-demo/src/api/**`
- `packages/contracts/src/http/**`

### Dependencies

Existing contract package and HTTP contract structure.

### Acceptance criteria

No duplicate ambiguous API response names remain; stable type-only contracts are package-owned; app HTTP runtime remains app-owned; no Zod dependency enters contracts.

### Validation commands

`pnpm --filter @ccd/contracts type-check`; `pnpm --filter @ccd/web-demo type-check`; `pnpm type-check`; `pnpm test:run`; `pnpm lint:check`.

### Required evidence

Consumer map, decision entry, diffs, command logs, drift guard evidence.

### Rollback strategy

Revert type renames and contract additions together. Verify app API imports are restored and type-check status is known.

### Stop conditions

Runtime schema movement becomes necessary, Zod dependency would enter contracts, HTTP runtime behavior changes, or consumer naming is ambiguous.

### Risk level

High.

### Estimated complexity

High.

### Notes for the coding agent

This milestone should be conservative. Type names are architecture, so document the naming rationale carefully.

---

## Milestone M4 — System preference contract split

### Purpose

Make system preference sync payload contracts reusable while keeping app schema and runtime ownership local unless separately approved.

### Preconditions

M3 contract naming is settled. System preference runtime and store consumers are mapped.

### Scope

Extract type-only preference contracts and update app guards/runtime to consume them. Leave Zod schemas app-local unless an approved schema owner decision exists.

### Out-of-scope

No sync runtime package creation. No Zod schema movement by default. No persisted-state behavior changes unless tested and documented.

### Implementation tasks

### Task M4-T01 — Map system preference consumers

- Status: `TODO`
- Objective: Identify every consumer of `SystemPreferences`, `SystemPreferencePayload`, sync type strings, envelopes, guards, local persistence, stores, and API methods.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Search and record runtime/schema/type boundaries.
- Expected files or modules: `apps/web-demo/src/types/systems/preferences.ts`, `apps/web-demo/src/sync/systemPreferences/**`, system stores, API methods.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Consumer map complete.
- Evidence to collect: `reports/system-preferences-consumer-map.md`, search logs.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M4-T02 — Add type-only preference contracts

- Status: `TODO`
- Objective: Add `SystemPreferenceSyncType`, `SystemPreferencePayload`, `SystemPreferenceEnvelope`, and related stable types to `@ccd/contracts` if no runtime dependency is needed.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Keep Zod schema app-local and adapt it to satisfy package types where possible.
- Expected files or modules: `packages/contracts/src/**`, `apps/web-demo/src/types/systems/preferences.ts`.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Contracts and app type-check.
- Evidence to collect: Diff summary, type-check logs.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M4-T03 — Update guards and runtime imports

- Status: `TODO`
- Objective: Update app guards/runtime to import type contracts explicitly while preserving sanitizer behavior.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Do not move sanitizer functions unless a runtime owner is decided.
- Expected files or modules: `apps/web-demo/src/sync/systemPreferences/guards.ts`, `runtime.ts`, `middleware.ts`, `register.ts`, `model.ts`.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Unit tests or targeted behavior tests pass.
- Evidence to collect: Sanitizer parity report, command logs.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M4-T04 — Add preference payload tests

- Status: `TODO`
- Objective: Test sanitizer acceptance/rejection, timestamp requirements, partial payloads, and unknown type rejection.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Use existing test framework and reset helpers.
- Expected files or modules: Test files under sync/systemPreferences or package tests.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Tests pass.
- Evidence to collect: Test logs and edge-case matrix.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Files or areas likely affected

- `packages/contracts/src/**`
- `apps/web-demo/src/types/systems/preferences.ts`
- `apps/web-demo/src/sync/systemPreferences/**`

### Dependencies

M3 contract naming and M0 consumer map.

### Acceptance criteria

System preference type contracts are explicit; app schema remains local; sanitizer/runtime behavior is unchanged and tested.

### Validation commands

`pnpm --filter @ccd/contracts type-check`; `pnpm --filter @ccd/web-demo type-check`; `pnpm test:run`; targeted sync tests.

### Required evidence

Consumer map, contract diff, sanitizer tests, command logs, decision notes.

### Rollback strategy

Revert contracts/imports/tests together. Verify persisted-state behavior is unchanged.

### Stop conditions

Zod schema movement appears required, persisted data migration is needed, sync payload semantics are ambiguous, or tests reveal existing behavior conflict.

### Risk level

Medium.

### Estimated complexity

Medium to high.

### Notes for the coding agent

Treat app-local Zod schema as runtime validation, not as a public package contract unless explicitly approved.

---

## Milestone M5 — Sync runtime owner decision and optional extraction plan

### Purpose

Decide whether sync runtime should remain app-owned or move to a new/public runtime owner in a future approved lane.

### Preconditions

M4 completed. Existing sync middleware, registry, socket, BroadcastChannel, WebSocket, system preference integration, and tests are mapped.

### Scope

Produce an owner decision and, only if approved without manifest risk, implement a minimal extraction of transport-agnostic pure sync types/helpers. Otherwise classify as deferred.

### Out-of-scope

No new package creation, manifest edits, lockfile edits, external WebSocket access, or broad sync runtime rewrite without approval.

### Implementation tasks

### Task M5-T01 — Map sync runtime coupling

- Status: `TODO`
- Objective: Document which sync modules are transport-agnostic and which bind to browser APIs, VueUse, env vars, app stores, or system preferences.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Classify middleware, registry, socket, runtime, systemPreferences integration separately.
- Expected files or modules: `apps/web-demo/src/sync/**`.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Coupling map complete.
- Evidence to collect: `reports/sync-runtime-coupling-map.md`, search logs.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M5-T02 — Record sync owner decision

- Status: `TODO`
- Objective: Decide whether to keep app-owned, move later to `@ccd/vue-app-platform/sync`, or create a future package such as `@ccd/vue-sync`.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Record options, required approval, dependency implications, and why current lane does or does not implement.
- Expected files or modules: `docs/ai-plan/DECISIONS.md`, `RISK_REGISTER.md`.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Decision has clear status: approved, blocked, or deferred.
- Evidence to collect: Decision entry and risk update.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M5-T03 — Implement only approved low-risk sync extraction

- Status: `TODO`
- Objective: If approved and no manifest/package-owner issue exists, extract transport-agnostic sync contracts/helpers. Otherwise mark `DEFERRED` with evidence.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Use capability injection. Do not move WebSocket/BroadcastChannel/env access unless owner is approved.
- Expected files or modules: Potential `packages/vue-app-platform/src/sync/**` or none if deferred.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Package and app type-check; sync tests.
- Evidence to collect: Diff or DEFERRED evidence.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: High

### Task M5-T04 — Add sync regression guard or documentation

- Status: `TODO`
- Objective: Ensure future agents do not move browser transport code into neutral packages accidentally.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Guard or architecture docs should identify allowed/blocked sync owners.
- Expected files or modules: Guard scripts or architecture docs.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: `pnpm ai:guard -- --format=json` and governance validation if guard changes.
- Evidence to collect: Guard/doc evidence.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Files or areas likely affected

- `apps/web-demo/src/sync/**`
- Possible `packages/vue-app-platform/src/**` only with approval
- Decision and risk docs.

### Dependencies

Owner approval for any package creation or manifest changes.

### Acceptance criteria

Sync runtime owner status is explicit; no unauthorized package or dependency changes occur; any implemented extraction is transport-agnostic and tested.

### Validation commands

If implementation occurs: `pnpm --filter @ccd/vue-app-platform type-check`; `pnpm --filter @ccd/web-demo type-check`; `pnpm test:run`; `pnpm ai:guard -- --format=json`. If deferred: evidence report and no source change required.

### Required evidence

Coupling map, owner decision, risk update, optional diff/test logs, or DEFERRED evidence.

### Rollback strategy

Revert optional extraction and restore app sync imports. If deferred, no code rollback expected.

### Stop conditions

New package needed, manifest/lockfile change required, browser APIs would enter neutral package, sync semantics are unclear, or external network access would be needed.

### Risk level

High.

### Estimated complexity

Medium if deferred; high if extraction approved.

### Notes for the coding agent

Deferral is an acceptable outcome. Do not force sync into `shared-utils`, `contracts`, or `core`.

---

## Milestone M6 — Build config owner decision and optional extraction plan

### Purpose

Decide whether app-local Vite/build helpers require a public build package owner or should remain app-owned.

### Preconditions

M0 build candidate inventory completed. Build scripts and generated ownership are understood.

### Scope

Classify build utilities, Vite config, PrimeVue resolver, generated registries, env parsing, alias generation, and plugin composition. Implement only approved low-risk refactors that require no new dependencies or manifest changes.

### Out-of-scope

No new build package, manifest changes, lockfile changes, Vite major migration, generated manual edits, or broad build rewrite without approval.

### Implementation tasks

### Task M6-T01 — Map build utility coupling

- Status: `TODO`
- Objective: Document Node/Vite/app-specific coupling for build utils, plugins, resolver, HTML injection, icon generation, and generated registries.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Separate generic helpers from app/demo-specific behavior.
- Expected files or modules: `apps/web-demo/build/**`, `apps/web-demo/vite.config.ts`, generated type registries.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Coupling map complete.
- Evidence to collect: `reports/build-config-coupling-map.md`, command logs.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M6-T02 — Record build owner decision

- Status: `TODO`
- Objective: Decide whether to keep app-owned or propose a future `@ccd/build-config` / `@ccd/vite-config` package.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Include dependency implications, Vite compatibility, manifest approval requirements, and generated owner policy.
- Expected files or modules: `docs/ai-plan/DECISIONS.md`, `RISK_REGISTER.md`.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Decision has clear status.
- Evidence to collect: Decision entry and risk update.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M6-T03 — Implement only approved low-risk build cleanup

- Status: `TODO`
- Objective: If approved, extract tiny pure helpers inside existing app build area or existing package without manifest changes. Otherwise mark `DEFERRED` or `NOT_APPLICABLE`.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Do not create package or edit lockfile without approval. Do not manually edit generated files.
- Expected files or modules: Build utility files or none.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: `pnpm build:web-demo`; `pnpm drift-check`; governance checks.
- Evidence to collect: Diff or deferred report, build logs.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: High

### Task M6-T04 — Strengthen generated/build boundary guard

- Status: `TODO`
- Objective: Ensure generated registries and build-only PrimeVue resolver remain correctly classified.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Use existing guard/drift tooling where possible.
- Expected files or modules: Guard scripts, docs, generated reports if owning commands update them.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: `pnpm drift-check`; `pnpm ai:guard -- --format=json`; `pnpm validate:governance`.
- Evidence to collect: Guard logs and generated diff report.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Files or areas likely affected

- `apps/web-demo/build/**`
- `apps/web-demo/vite.config.ts`
- generated registries
- guard/governance docs.

### Dependencies

Owner approval for any package creation, manifest, lockfile, or dependency change.

### Acceptance criteria

Build config owner status is explicit; generated/build boundaries are guarded; web-demo build still passes.

### Validation commands

`pnpm build:web-demo`; `pnpm drift-check`; `pnpm ai:guard -- --format=json`; `pnpm validate:governance`; `pnpm type-check`.

### Required evidence

Coupling map, owner decision, build logs, drift logs, guard evidence.

### Rollback strategy

Revert build utility changes and rerun build/drift. Preserve logs before rollback.

### Stop conditions

Package creation needed, Vite/plugin behavior changes, generated drift appears, build output changes without explanation, or dependency change is required.

### Risk level

Medium to high.

### Estimated complexity

Medium if decision-only; high if extraction approved.

### Notes for the coding agent

Decision-only completion is acceptable. Build config movement should wait for a governed package owner.

---

## Milestone M7 — Theme/size facade hardening

### Purpose

Confirm theme/size app facades are correctly app-owned and optionally extract only the remaining generic DOM writer if it fits existing package ownership.

### Preconditions

M0 candidate matrix and prior theme/size package ownership are verified. M3/M4 changes do not alter storage keys.

### Scope

Review `utils/theme/engine.ts`, `utils/theme/sizeEngine.ts`, desktop theme setup, design-tokens APIs, and vue-app-platform theme runtime APIs. Implement a small size DOM writer only if low-risk and no manifest change is required.

### Out-of-scope

No visual redesign, token rewrite, persisted key change, PrimeVue theme rewrite, or desktop/web behavioral divergence.

### Implementation tasks

### Task M7-T01 — Review theme/size facade boundaries

- Status: `TODO`
- Objective: Confirm pure token derivation lives in design tokens and browser application is app facade or vue-app-platform capability injection.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Document remaining app-owned DOM/storage/preload behavior.
- Expected files or modules: `apps/web-demo/src/utils/theme/**`, `apps/desktop/src/theme/index.ts`, `packages/design-tokens/**`, `packages/vue-app-platform/**`.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Boundary report complete.
- Evidence to collect: `reports/theme-size-boundary-review.md`.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Low

### Task M7-T02 — Decide optional size DOM writer extraction

- Status: `TODO`
- Objective: Decide whether `applySizeVars`-style capability-injected writer should be added to `@ccd/vue-app-platform`.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Proceed only if it reduces duplication without changing first-paint/preload behavior.
- Expected files or modules: `docs/ai-plan/DECISIONS.md`.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Decision recorded.
- Evidence to collect: Decision entry.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M7-T03 — Implement optional low-risk size writer

- Status: `TODO`
- Objective: If approved, add a capability-injected size DOM writer and update app facade to call it. Otherwise mark `NOT_APPLICABLE`.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Keep app storage/preload/device-specific logic local.
- Expected files or modules: `packages/vue-app-platform/src/**`, `apps/web-demo/src/utils/theme/sizeEngine.ts`, possible tests.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Type-check, tests, web-demo build, visual smoke if behavior could change.
- Evidence to collect: Diff or NOT_APPLICABLE evidence, screenshots if UI changes.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M7-T04 — Run visual/responsive smoke for theme/size surfaces

- Status: `TODO`
- Objective: Verify no theme, size, layout, or desktop/web first-paint regression if any source changed.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Use Playwright or manual screenshot evidence depending on environment.
- Expected files or modules: Affected app screens only.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Screenshots or explicit environment-blocked evidence.
- Evidence to collect: `screenshots/`, `reports/visual-smoke.md`, command logs.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Files or areas likely affected

- `apps/web-demo/src/utils/theme/**`
- `apps/desktop/src/theme/**`
- `packages/vue-app-platform/src/**`
- `packages/design-tokens/**`

### Dependencies

Existing design-token and vue-app-platform owner boundaries.

### Acceptance criteria

Theme/size ownership is documented; optional helper either implemented with tests/visual evidence or marked not applicable.

### Validation commands

`pnpm --filter @ccd/vue-app-platform type-check`; `pnpm --filter @ccd/web-demo type-check`; `pnpm build:web-demo`; `pnpm build:desktop`; visual smoke if UI output changes.

### Required evidence

Boundary review, decision entry, command logs, screenshots if applicable.

### Rollback strategy

Revert helper and app facade changes together; rerun build and visual smoke.

### Stop conditions

First-paint behavior changes, storage key changes, visual regression, desktop/web divergence, or helper would duplicate design-token logic.

### Risk level

Medium.

### Estimated complexity

Medium.

### Notes for the coding agent

Theme/size facades are mostly correct today. This milestone should not become a design-token rewrite.

---

## Milestone M8 — Blocked surfaces classification and guard hardening

### Purpose

Ensure stores, UI plugin shells, SafeStorage, DateUtils, HTTP runtime, generated registries, and route views remain intentionally classified and guarded.

### Preconditions

M1-M7 completed or explicitly deferred. Current candidate matrix is updated.

### Scope

Update app-owned justification register, guard checks, and documentation so future agents do not misclassify app-owned runtime adapters as public package debt.

### Out-of-scope

No code migration for blocked areas unless a prior milestone explicitly approved it.

### Implementation tasks

### Task M8-T01 — Update app-owned justification register

- Status: `TODO`
- Objective: Document why stores, plugin shells, route views, SafeStorage, DateUtils, HTTP runtime, generated registries, and app integration facades remain app-owned.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Use precise classification labels and path ranges.
- Expected files or modules: `docs/ai-plan/DECISIONS.md`, new or existing architecture docs, `STATUS.md`.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Register covers all remaining candidates.
- Evidence to collect: `reports/app-owned-justification-register.md`.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Low

### Task M8-T02 — Strengthen public-layer regression guards

- Status: `TODO`
- Objective: Add or update deterministic guards for the high-value rules discovered in this plan.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Guard should detect duplicate API response contracts, unsafe app-local route access helpers, manual generated edits, and forbidden package movement where practical.
- Expected files or modules: Guard scripts, tests, generated reports.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Guard passes and does not generate false positives on current valid app-owned surfaces.
- Evidence to collect: Guard logs, rationale report.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M8-T03 — Run guard/governance refresh

- Status: `TODO`
- Objective: Run owning commands that refresh generated architecture/governance outputs, then prove generated diff is intentional or empty.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Never manually edit generated files.
- Expected files or modules: `docs/generated/**`, `.ai/generated/**`, `.ai/governance/**`, guard outputs.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Governance and guard commands pass or block with evidence.
- Evidence to collect: Command logs, generated diff report.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M8-T04 — Record deferred owner decisions

- Status: `TODO`
- Objective: For sync/build/date/schema/package-owner issues not implemented, record precise deferred status and escalation trigger.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Avoid vague TODOs. Each deferred item needs owner, trigger, and reason.
- Expected files or modules: `DECISIONS.md`, `RISK_REGISTER.md`, `NEXT_ACTIONS.md`.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Deferred status is clear and reviewable.
- Evidence to collect: Decision/risk diff and summary.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Low

### Files or areas likely affected

- Guard scripts
- Architecture docs
- `docs/ai-plan/**`
- Generated governance reports if owning commands update them.

### Dependencies

Milestone outputs from M1-M7.

### Acceptance criteria

Every remaining app-local candidate has a documented reason; guards prevent likely regressions; generated/governance state is clean or explained.

### Validation commands

`pnpm ai:guard -- --format=json`; `pnpm validate:governance`; `pnpm arch:boundaries`; `pnpm drift-check`; `pnpm type-check`.

### Required evidence

App-owned register, guard logs, governance logs, generated diff report, updated risks/decisions.

### Rollback strategy

Revert guard/doc changes if they produce false positives or weaken existing coverage. Rerun guard commands.

### Stop conditions

Guard would require brittle broad exclusions, generated outputs drift unexpectedly, or classifications conflict with package owner policy.

### Risk level

Medium.

### Estimated complexity

Medium.

### Notes for the coding agent

Guards should be practical and deterministic, not a generic lint replacement.

---

## Milestone M9 — Full validation matrix and regression review

### Purpose

Run the final validation matrix and collect complete evidence before final go/no-go.

### Preconditions

M1-M8 are done, blocked, deferred, or not applicable with evidence. Workspace contains only planned changes.

### Scope

Type-check, lint, unit tests, package tests, builds, governance, runtime, boundary, guard, drift, e2e/smoke, visual/accessibility checks where applicable.

### Out-of-scope

No implementation changes except small fixes required to resolve validation failures. No broad rewrites.

### Implementation tasks

### Task M9-T01 — Run package-level validation

- Status: `TODO`
- Objective: Run affected package type-check/test/build commands first to localize failures.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Use exact repository scripts. Capture logs and exit codes.
- Expected files or modules: Affected packages and apps.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Commands pass or failure is fixed/blocked with evidence.
- Evidence to collect: `command-logs/package-validation-*.log`, `reports/package-validation-summary.md`.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M9-T02 — Run repository validation

- Status: `TODO`
- Objective: Run full repository validation commands.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Use `pnpm type-check`, `pnpm lint:check`, `pnpm test:run`, `pnpm build`, and governance/runtime commands as discovered.
- Expected files or modules: Whole repository.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Commands pass or failures are documented as unrelated baseline with evidence.
- Evidence to collect: Full command logs and final validation summary.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M9-T03 — Run UI/browser smoke if relevant

- Status: `TODO`
- Objective: If theme/size/router/menu behavior changed, run browser smoke and visual checks.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Use Playwright/e2e scripts if environment supports them; otherwise record environment block and manual validation instructions.
- Expected files or modules: web-demo and desktop if affected.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Smoke checks pass or are blocked by environment with clear evidence.
- Evidence to collect: Screenshots, e2e logs, manual notes.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Medium

### Task M9-T04 — Produce final validation matrix

- Status: `TODO`
- Objective: Fill `FINAL_VALIDATION_MATRIX.md` with command, purpose, status, evidence path, and notes.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Do not mark PASS without command evidence.
- Expected files or modules: `docs/ai-plan/FINAL_VALIDATION_MATRIX.md`.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Matrix is complete and internally consistent.
- Evidence to collect: Final matrix diff.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Low

### Files or areas likely affected

- Whole repository.
- `docs/ai-plan/FINAL_VALIDATION_MATRIX.md`
- Active evidence directory.

### Dependencies

All earlier milestone changes ready for validation.

### Acceptance criteria

Final validation matrix is complete and every pass/fail/block status has evidence.

### Validation commands

See `VALIDATION.md` and `FINAL_VALIDATION_MATRIX.md`.

### Required evidence

All command logs, screenshots where applicable, diff summaries, validation reports.

### Rollback strategy

Revert the smallest failing change and rerun affected validation. Preserve failed logs before rollback.

### Stop conditions

Validation fails and safe fix is not clear, evidence missing, generated drift unexplained, or environment cannot run critical checks without owner decision.

### Risk level

Medium.

### Estimated complexity

High due to runtime and governance breadth.

### Notes for the coding agent

Validation failures must not be hidden by deleting tests or weakening guards.

---

## Milestone M10 — Final certification, operator handoff, and next actions

### Purpose

Produce final review artifacts and a go/no-go decision based on evidence.

### Preconditions

M9 validation matrix complete.

### Scope

Finalize `FINAL_GO_NO_GO.md`, `CHANGE_SUMMARY.md`, `OPERATOR_SOP.md`, `NEXT_ACTIONS.md`, `STATUS.md`, and final risk updates.

### Out-of-scope

No implementation work unless final review finds a small documentation inconsistency.

### Implementation tasks

### Task M10-T01 — Update final go/no-go

- Status: `TODO`
- Objective: Record final state: `GO`, `NO_GO`, `BLOCKED_BY_OWNER_DECISION`, `BLOCKED_BY_VALIDATION`, or `NO_ACTION_NEEDED`.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Base decision only on completed evidence.
- Expected files or modules: `docs/ai-plan/FINAL_GO_NO_GO.md`.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Decision matches evidence.
- Evidence to collect: Final decision doc.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Low

### Task M10-T02 — Write change summary

- Status: `TODO`
- Objective: Summarize changed areas, migrated contracts/helpers, deferred decisions, validations, and risks.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Include file-level summary and behavior compatibility notes.
- Expected files or modules: `docs/ai-plan/CHANGE_SUMMARY.md`.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Summary is specific and matches diff.
- Evidence to collect: Change summary doc.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Low

### Task M10-T03 — Write operator SOP and next actions

- Status: `TODO`
- Objective: Provide repeatable commands, review path, rollback notes, and future owner-decision lanes.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Make this usable by a human maintainer after the AI agent stops.
- Expected files or modules: `docs/ai-plan/OPERATOR_SOP.md`, `NEXT_ACTIONS.md`.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Operator can reproduce validation and understand remaining risks.
- Evidence to collect: SOP and next actions docs.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Low

### Task M10-T04 — Final status and risk update

- Status: `TODO`
- Objective: Update `STATUS.md` and `RISK_REGISTER.md` with final state and residual risks.
- Preconditions: Active evidence directory exists; repository configuration has been inspected; no unapproved dependency or manifest change is required.
- Implementation approach: Ensure every blocker/deferred item has owner/trigger.
- Expected files or modules: `STATUS.md`, `RISK_REGISTER.md`.
- Acceptance criteria: Behavior is preserved; package boundaries are clean; imports are explicit; tests or equivalent proof cover the change.
- Validation command or method: Final status is internally consistent.
- Evidence to collect: Final docs and evidence directory tree.
- Rollback or revert note: Revert only the files touched by this task and rerun the same validation commands; preserve evidence before rollback.
- Risk level: Low

### Files or areas likely affected

- `docs/ai-plan/**`
- Active evidence directory.

### Dependencies

Final validation matrix.

### Acceptance criteria

Final artifacts are complete, evidence-backed, and ready for human review.

### Validation commands

Document consistency review; optional `pnpm lint:check` if docs are linted by repo.

### Required evidence

Final docs, final evidence tree, final status.

### Rollback strategy

Revert only documentation if inconsistent; do not alter validated source state without re-running validation.

### Stop conditions

Final decision unsupported by evidence, unresolved validation failures, or missing risk/blocker documentation.

### Risk level

Low.

### Estimated complexity

Medium.

### Notes for the coding agent

End with explicit stop condition. Do not commit or push unless the user asks.
