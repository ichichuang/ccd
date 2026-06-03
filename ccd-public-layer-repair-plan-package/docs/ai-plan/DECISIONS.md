# DECISIONS — Architecture Decision Log

## Decision template

### Decision ID: `D-YYYYMMDD-NNN`

- Date: 2026-06-02
- Status: `PROPOSED | ACCEPTED | REJECTED | DEFERRED | SUPERSEDED | BLOCKED`
- Context:
- Options considered:
- Decision:
- Rationale:
- Trade-offs:
- Rejected alternatives:
- Risks:
- Follow-up validation:
- Evidence:

---

## Execution approvals

### Approval ID: `M4-AI-ADAPTER-MATERIALIZATION-APPROVED`

- Date: 2026-06-02
- Status: `ACCEPTED`
- Context: M4 execution was blocked because `pnpm codex:preflight` failed on missing generated AI adapter paths: `.ai/protocol/adapters/claude.md`, `AGENTS.md`, and `CLAUDE.md`.
- Approval scope: Run repository-owned AI adapter materialization and preflight commands inside `/Users/cc/MyPorject/ccd-public-layer-repair-m1` only: `test ! -e .cursor`, `pnpm ai:sync`, `pnpm ai:doctor`, and `pnpm codex:preflight`.
- Decision: Use `pnpm ai:sync` as the owning adapter materialization path, then rerun `pnpm ai:doctor` and `pnpm codex:preflight` before any M4 source edits.
- Boundaries: This approval is not cleanup approval, not dependency approval, not manifest or lockfile approval, not manual generated edit approval, not `pnpm ai:sync:codex` approval, not commit/push approval, and not M5 approval.
- Outcome: `.cursor` was absent before execution; `pnpm ai:sync` passed with process-local `MISE_TRUSTED_CONFIG_PATHS=$PWD/mise.toml` after a literal run hit the local `mise.toml` trust shim. `package.json` and `pnpm-lock.yaml` remained unchanged. `pnpm ai:doctor` and `pnpm codex:preflight` passed.
- Evidence:
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/031-adapter-materialization-initial-checks.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/032-cursor-existence-check.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/035-pnpm-ai-sync-approved-trusted-env.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/036-post-ai-sync-required-checks.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/039-pnpm-ai-doctor-after-ai-sync.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/040-pnpm-codex-preflight-after-ai-sync.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m4-adapter-materialization-and-scope.md`

### Approval ID: `M2-ROUTE-MENU-ACCESS-HELPER-MIGRATION-APPROVED`

- Date: 2026-06-02
- Status: `ACCEPTED`
- Context: The previous M2 approval `M2-API-DTO-CONTRACT-NARROW-APPROVED` was correctly blocked because it did not match PLAN.md M2.
- Approval scope: Execute PLAN.md M2 only: route/menu/access pure helper migration.
- Decision: Supersede the mismatched API/DTO M2 approval for this milestone. Defer API/DTO/System Preferences contract normalization to their actual later milestones.
- Boundaries: No package manifests, dependency manifests, generated registries, secrets, deployment config, production config, commits, pushes, resets, cleans, rebases, branch recreation, worktree creation, or M3 work.
- Evidence:
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m2-restart-required-initial-checks.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m2-restart-read-plan-m2.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m2-plan-scope-and-owner.md`

### Approval ID: `M1-T03-ARTIFACT-PREP-APPROVED`

- Date: 2026-06-02
- Status: `ACCEPTED`
- Context: M1-T03 validation was blocked at `pnpm ci:smoke:packages` because the isolated worktree lacked shared package `dist` artifacts required by package resolution smoke.
- Approval scope: Run `pnpm build:shared-config` only inside `/Users/cc/MyPorject/ccd-public-layer-repair-m1`.
- Decision: Use `pnpm build:shared-config` as artifact preparation, then rerun `pnpm ci:smoke:packages` and the remaining M1-T03 validation ladder.
- Boundaries: This approval is not dependency change approval, not manifest or lockfile approval, not generated manual edit approval, not cleanup approval, not commit/push approval, and not M2 approval.
- Outcome: Artifact preparation passed with local Node `v24.15.0` and pnpm `10.28.2`; package smoke and the required validation ladder passed. API surface generated reports were synchronized by the owning governance generator during `pnpm validate:governance`.
- Evidence:
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m1-t03-build-shared-config-approved-local-node.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m1-t03-ci-smoke-packages-after-artifact-prep.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m1-t03-validate-governance-rerun-after-api-surface-sync.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m1-t03-validation-summary.md`

## Pending decisions before or during implementation

### Decision ID: `D-PL-001`

- Date: 2026-06-02
- Status: `ACCEPTED`
- Context: Route/menu/access contracts are currently app-local and partially ambient-global. Pure helpers cannot be safely moved until type ownership is explicit.
- Options considered:
  - Keep all route/menu contracts app-local.
  - Move type-only contracts to `@ccd/contracts`.
  - Move Vue Router-specific types to a Vue package.
- Decision: Move only stable type-only access/menu contracts to `@ccd/contracts`; keep Vue Router module augmentation and app route/view declarations app-local.
- Rationale: `@ccd/contracts` is the correct location for runtime-neutral type contracts, but should not receive Vue Router runtime or app singleton coupling.
- Trade-offs: Some app globals may remain; this avoids unsafe broad rewrites.
- Rejected alternatives: Moving route tables or app route views; moving runtime helpers into `@ccd/contracts`.
- Risks: Over-generalizing contracts or breaking route meta typing.
- Follow-up validation: Contracts type-check, web-demo type-check, route type consumer map.
- Evidence:
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/route-type-consumer-map.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/route-contract-design.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/package-owner-map.md`

### Decision ID: `D-PL-002`

- Date: 2026-06-02
- Status: `ACCEPTED`
- Context: Access helpers are pure runtime logic but not type-only contracts.
- Options considered:
  - Keep app-local.
  - Move pure runtime helpers to `@ccd/vue-app-platform`.
  - Move to `@ccd/shared-utils`.
  - Move to `@ccd/contracts`.
- Decision: Use `@ccd/vue-app-platform` for approved pure route/access runtime helpers after M1 contracts exist; keep app facade if needed.
- Rationale: Runtime helpers do not belong in type-only contracts; `shared-utils` should not become a dumping ground for app platform policy.
- Trade-offs: `vue-app-platform` gains a route/access utility surface.
- Rejected alternatives: `@ccd/contracts` for runtime functions; `@ccd/shared-utils` for app-platform semantics.
- Risks: Helper semantics may be too app-specific.
- Follow-up validation: Route/access tests, boundary validation.
- Evidence:
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/access-helper-owner-decision.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m2-vue-app-platform-owner-evidence.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m2-access-helper-coupling.log`

### Decision ID: `D-PL-002A`

- Date: 2026-06-02
- Status: `ACCEPTED`
- Context: PLAN.md M2 implementation is now approved. `@ccd/vue-app-platform` is the accepted runtime owner for pure route/menu/access helpers, but its governed dependency policy currently allows only `@ccd/design-tokens`; adding `@ccd/contracts` as a package dependency would require manifest/policy changes that are not approved.
- Options considered:
  - Move runtime helpers to `@ccd/vue-app-platform` with no `@ccd/contracts` package import, and keep app facade typed with `@ccd/contracts`.
  - Move runtime helpers to `@ccd/contracts`.
  - Modify manifests/policies to allow `@ccd/vue-app-platform` to import `@ccd/contracts`.
  - Keep all helpers app-local.
- Decision: Move pure runtime helper implementations to `@ccd/vue-app-platform`; keep `@ccd/contracts` type-only; keep app-local `accessControl.ts` as a compatibility facade that imports M1 route/menu/access contracts as types.
- Rationale: This preserves the approved owner while avoiding unapproved dependency/manifest changes. The package helper signatures remain structurally compatible with M1 contracts, and app consumers keep existing import paths.
- Guard source change: The `scripts/ai-architecture-guard.mjs` update is deterministic hardening, not guard weakening. It adds a scoped `route-access-helper-owner` check that requires app `accessControl.ts` to delegate to `@ccd/vue-app-platform` and rejects reintroduced local implementation tokens.
- Trade-offs: The package cannot directly import M1 contract types until a future dependency-policy lane approves it.
- Rejected alternatives: Runtime functions in `@ccd/contracts`; hidden package dependency changes; moving router singleton, route table, stores, logger, i18n, window, BroadcastChannel, or import.meta.glob behavior.
- Risks: Package type signatures and contract types must remain structurally aligned.
- Follow-up validation: Focused helper tests, `@ccd/vue-app-platform` type-check/build, full type-check, tests, architecture boundaries/runtime guard.
- Evidence:
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m2-plan-scope-and-owner.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m2-read-governance-topology-runtime.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m2-read-route-helper-source.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m2-required-14-ai-guard-json.log`

### Decision ID: `D-PL-003`

- Date: 2026-06-02
- Status: `ACCEPTED`
- Context: App-local API response types use ambiguous duplicate names with different field semantics.
- Options considered:
  - Keep duplicate `ApiResponse` names.
  - Rename app-local types for clarity.
  - Move a stable type-only backend envelope to contracts.
- Decision: Rename ambiguous app-local types and move stable type-only envelope contracts to `@ccd/contracts` where safe. Use `BackendApiResponseEnvelope<TData>` for backend `{ code, message, data }`, `HttpClientResponseEnvelope<TData>` for the app HTTP client response shape, and keep existing `HttpResponseEnvelope<TData, TMetadata>` for transport metadata.
- Outcome: M3 added `BackendApiResponseEnvelope<TData>` as a type-only `@ccd/contracts` export, kept `HttpClientResponseEnvelope<TData>` app-owned in the HTTP runtime surface, and did not move Zod schemas, HTTP runtime, Alova, interceptors, auth refresh, upload/download runtime, notification policy, or browser behavior.
- Guard source change: The `scripts/ai-architecture-guard.mjs` update is deterministic hardening, not guard weakening. It adds a scoped `api-response-contract-name` check that rejects ambiguous `ApiResponse` definitions in known app response type surfaces.
- Rationale: Same-name different-shape contracts create drift and misuse risk.
- Trade-offs: Requires import churn and compatibility aliases if needed.
- Rejected alternatives: Moving HTTP runtime or Zod schemas as part of this lane.
- Risks: Consumer updates may be broad.
- Follow-up validation: Type-check and API consumer tests.
- Evidence:
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/api-dto-consumer-map.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m3-api-dto-consumer-map-current.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/api-dto-naming-decision.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m3-api-response-definitions.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m3-rg-api-response-consumers.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m3-focused-ai-guard-api-response-name.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m3-validation-summary.md`

### Decision ID: `D-PL-004`

- Date: 2026-06-02
- Status: `ACCEPTED`
- Context: System preference contracts are useful beyond app runtime, but schemas depend on Zod.
- Options considered:
  - Keep all preference types app-local.
  - Move type-only contracts to `@ccd/contracts` and keep Zod schema app-local.
  - Move Zod schema to `@ccd/contracts`.
- Decision: Move type-only preference contracts only; keep Zod schema, sanitizers, sync runtime, app stores, local persistence, and normalization app-owned unless dependency/schema owner decision is separately approved.
- Outcome: M4 added type-only `SystemPreferences`, `SystemPreferenceSyncType`, `SystemPreferencePayload`, `SystemPreferenceEnvelope`, and related nested state contracts to `@ccd/contracts`; app Zod schema and sync runtime stayed local.
- Rationale: Preserves runtime-neutral contracts.
- Trade-offs: Schema and type definitions may require careful alignment.
- Rejected alternatives: Adding Zod to contracts without approval.
- Risks: Schema/type drift if not tested.
- Follow-up validation: Type-check, sanitizer tests.
- Evidence:
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/system-preferences-consumer-map.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/system-preferences-contract-decision.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m4-system-preferences-coupling-rg.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m4-validation-summary.md`

### Decision ID: `D-PL-005`

- Date: 2026-06-02
- Status: `DEFERRED`
- Context: Sync runtime has reusable potential but includes Browser APIs, WebSocket, BroadcastChannel, VueUse timers, env access, and app integration.
- Options considered:
  - Keep app-owned.
  - Move transport-agnostic core to `@ccd/vue-app-platform/sync`.
  - Create future `@ccd/vue-sync` package.
- Decision: Keep app-owned in this plan unless owner approves a separate sync package/extraction lane.
- Current M5 outcome: Approval `M5-PLAN-SCOPE-EXECUTION-APPROVED` was used to rerun the M5 owner decision against the accepted M4 state. The decision remains `DEFERRED`; no source implementation files were changed, no sync runtime was moved, and no package/dependency/manifest change is approved.
- Current validation rerun: The M5 validation ladder was rerun under approval `M5-PLAN-SCOPE-EXECUTION-APPROVED`; all required commands passed, generated diff was unchanged by governance, protected manifest diff remained empty, and execution stopped at M5.
- Rationale: Package owner and dependency direction are not approved.
- Trade-offs: Reuse is delayed.
- Rejected alternatives: Moving sync into `@ccd/shared-utils`, `@ccd/contracts`, or `@ccd/core`.
- Risks: Future duplication if another app needs sync.
- Follow-up validation: Coupling map and deferred owner trigger.
- Evidence:
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/sync-runtime-coupling-map.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/sync-owner-decision.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m5-plan-scope.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m5-evidence-report.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m5-validation-summary-rerun.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m5-026-sync-file-inventory.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m5-027-sync-coupling-rg.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m5-030-read-package-owner-evidence.log`

### Decision ID: `D-PL-006`

- Date: 2026-06-02
- Status: `DEFERRED`
- Context: Build/Vite utilities have reusable potential but no governed build package owner is approved.
- Options considered:
  - Keep app/build-owned.
  - Create future `@ccd/build-config` or `@ccd/vite-config`.
  - Move selected helpers into existing packages.
- Decision: Keep app-owned unless a separate build package owner lane is approved.
- Rationale: Build config touches dependencies, Vite plugin APIs, generated ownership, and manifest policy.
- Trade-offs: Some duplication may remain.
- Rejected alternatives: Hidden manifest/lockfile changes or broad build rewrites.
- Risks: Build major-version migration debt remains.
- Follow-up validation: Build coupling map and drift guard.
- Current M6 outcome: Approval `M6-PLAN-SCOPE-EXECUTION-APPROVED` was used to rerun the M6 owner decision from completed M5 state. The decision remains `DEFERRED`; no build source, package manifest, lockfile, production config, or generated file was manually edited.
- Current validation rerun: `pnpm build:web-demo`, `pnpm drift-check`, `pnpm ai:guard -- --format=json`, `pnpm type-check`, and four `pnpm validate:governance` runs passed, including a final rerun after M6 docs updates. Generated diff set remained limited to existing command-owned outputs, and protected manifest diff remained empty.
- Evidence:
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/build-config-coupling-map.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/build-owner-decision.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m6-build-file-inventory.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m6-evidence-report.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m6-001-pre-run-checks.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m6-010-build-coupling-rg-current-rerun.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m6-required-01-build-web-demo.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m6-required-06-validate-governance-rerun.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m6-required-07-validate-governance-after-docs.log`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m6-required-08-validate-governance-final-after-evidence-links.log`

### Decision ID: `D-PL-007`

- Date: 2026-06-02
- Status: `REJECTED`
- Context: Theme/size pure derivation is package-owned, but size DOM writing still has app-local facade logic.
- Options considered:
  - Keep all size DOM writer logic app-local.
  - Extract a capability-injected writer to `@ccd/vue-app-platform`.
- Decision: Do not extract a size DOM writer in this plan; keep size DOM/preload/storage/device behavior app-owned.
- Rationale: The current size writer is coupled to first-paint preload, persisted app state, safeStorage decoding, device/breakpoint helpers, browser pixel ratio, `data-font-scale`, and desktop/web divergence. Optional extraction is not low-risk under the current approval gate.
- Current M7 outcome: Approval `M7-PLAN-SCOPE-EXECUTION-APPROVED` was used to re-run the exact M7 scope from completed M6 state. The decision remains `REJECTED`; no theme/size source, package manifest, lockfile, desktop theme setup, or generated file was manually edited.
- Current validation rerun: `pnpm codex:preflight`, `pnpm ci:smoke:packages`, `pnpm type-check`, `pnpm lint:check`, `pnpm test:run`, `pnpm arch:boundaries`, `pnpm arch:runtime`, `pnpm ai:guard -- --format=json`, `pnpm drift-check`, two `pnpm validate:governance` runs, `git diff --check`, and protected manifest diff checks passed. Visual smoke remained not applicable because no theme/size source changed.
- Trade-offs: A small amount of DOM writer duplication may remain.
- Rejected alternatives: Theme/token rewrite, immediate `@ccd/vue-app-platform` size writer extraction, desktop/web writer unification in this milestone.
- Risks: Future duplication if another app needs the same size DOM writer; first-paint regression if extraction is reopened without visual smoke.
- Follow-up validation: Reopen only with approved source lane and visual/responsive smoke for web-demo and desktop.
- Evidence:
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/theme-size-boundary-review.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/size-writer-decision.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/theme-size-validation.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m7-evidence-report.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m7-validation-summary.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m7-theme-size-definitions.log`

### Decision ID: `D-PL-008`

- Date: 2026-06-02
- Status: `ACCEPTED`
- Context: M8 reviewed stores, plugin shells, route views, SafeStorage, DateUtils, HTTP runtime, sync runtime, build config, generated registries, and theme/size facades.
- Options considered:
  - Treat all remaining app-local candidates as public package debt.
  - Classify each remaining candidate by owner and defer unsafe movements.
  - Move app runtime adapters into public packages during this plan.
- Decision: Keep remaining runtime adapters, app stores, route views, plugin shells, SafeStorage, DateUtils, HTTP runtime, sync runtime, build config, generated registries, and app facades app-owned or generated-owned unless a future owner lane explicitly approves movement.
- Rationale: These surfaces are coupled to app state, browser APIs, route/view runtime, storage/security behavior, generated ownership, or build/governance policy.
- Trade-offs: Some reusable-looking code remains app-local.
- Rejected alternatives: Broad extraction, hidden package-owner creation, generated manual edits, or moving app singletons into package surfaces.
- Risks: Future agents may reopen these lanes without owner approval; guard hardening remains blocked.
- Follow-up validation: App-owned register, guard/governance logs, final validation matrix.
- Evidence:
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/app-owned-justification-register.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/guard-governance-refresh.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m8-app-owned-classification-scan.log`

### Decision ID: `D-PL-009`

- Date: 2026-06-03
- Status: `ACCEPTED`
- Context: M8 was re-opened only for final validation, certification, and closeout from the already accepted M7 state. The approval does not allow new dependency work, package creation, broad rewrites, deferred sync/build/size-writer extraction, commit/push/merge, or new runtime behavior changes outside certification scope.
- Options considered:
  - Hold the branch in a blocked state until a future implementation lane reopens deferred areas.
  - Certify the current branch as review-ready if the full required validation matrix passes and residual deferred risks remain documented.
  - Reopen guard/source work inside M8 despite the narrow approval.
- Decision: Classify the current branch state as `GO_READY_FOR_HUMAN_REVIEW`, not merged, after M8 final validation passes and all residual deferred lanes remain explicitly documented.
- Rationale: The approved M1-M4 source work is already present in the branch diff, M5-M7 owner decisions were validated without new runtime changes, the full current-run M8 validation matrix passed, protected manifests remained unchanged, and command-owned generated outputs stayed reproducible.
- Trade-offs: Review-ready does not mean merged or fully future-proof; deferred sync/build/size-writer extraction lanes remain intentionally out of scope.
- Rejected alternatives: Reopening implementation under certification approval, weakening existing guards, manually editing generated outputs, or claiming merge-ready status without human review.
- Risks: Human review is still required before staging/commit/merge; future deferred lanes must use separate approval and rerun appropriate validation.
- Follow-up validation: `reports/m8-validation-summary.md`, `reports/final-validation-summary.md`, `docs/ai-plan/FINAL_VALIDATION_MATRIX.md`, and protected manifest diff checks.
- Evidence:
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m8-evidence-report.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m8-validation-summary.md`
  - `docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/final-validation-summary.md`
  - `docs/ai-plan/FINAL_GO_NO_GO.md`
  - `docs/ai-plan/FINAL_VALIDATION_MATRIX.md`
