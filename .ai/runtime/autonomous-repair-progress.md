# Autonomous Repair Progress

Objective: Run autonomous ledger-driven CCD repair to completion using `.ai/runtime/repair_list.md` in ledger order.

Started: 2026-06-07

## Pre-existing Dirty Paths

Captured before repair edits with `git status --short --untracked-files=all`.

```text
 M .ai/generated/governance-report.json
 M .ai/governance/policies/runtime.json
 M .ai/governance/policies/topology.json
 M .ai/manifests/rule-index.json
 M .ai/runtime/repair_list.md
 M .ai/runtime/repair_list.template.md
 M .env
 M .env.analyze
 M .env.development
 M .env.production
 M README.en.md
 M README.md
 M apps/desktop/package.json
 M apps/web-demo/package.json
 M apps/web-demo/src/constants/mock.ts
 M apps/web-demo/src/constants/router.ts
 M apps/web-demo/src/router/index.ts
 M apps/web-demo/src/router/modules/core.ts
 M apps/web-demo/src/router/modules/dashboard.ts
 M apps/web-demo/src/router/modules/example.spec.ts
 M apps/web-demo/src/router/modules/example.ts
 M apps/web-demo/src/types/auto-imports.d.ts
 M apps/web-demo/src/types/env.d.ts
 M apps/web-demo/src/types/modules/router.d.ts
 D apps/web-demo/src/views/example/components/primevue-collection/overview/composables/usePrimeVueScrollSpy.ts
 D ccd-public-layer-repair-plan-package/README.md
 D ccd-public-layer-repair-plan-package/docs/ai-plan/CHANGE_SUMMARY.md
 D ccd-public-layer-repair-plan-package/docs/ai-plan/CODEX_GOAL_PROMPT.md
 D ccd-public-layer-repair-plan-package/docs/ai-plan/DECISIONS.md
 D ccd-public-layer-repair-plan-package/docs/ai-plan/EVIDENCE_POLICY.md
 D ccd-public-layer-repair-plan-package/docs/ai-plan/FINAL_GO_NO_GO.md
 D ccd-public-layer-repair-plan-package/docs/ai-plan/FINAL_VALIDATION_MATRIX.md
 D ccd-public-layer-repair-plan-package/docs/ai-plan/NEXT_ACTIONS.md
 D ccd-public-layer-repair-plan-package/docs/ai-plan/OPERATOR_SOP.md
 D ccd-public-layer-repair-plan-package/docs/ai-plan/OUTPUT_QUALITY_REQUIREMENTS.md
 D ccd-public-layer-repair-plan-package/docs/ai-plan/PACKAGE_MANIFEST.md
 D ccd-public-layer-repair-plan-package/docs/ai-plan/PLAN.md
 D ccd-public-layer-repair-plan-package/docs/ai-plan/REVIEW_CHECKLIST.md
 D ccd-public-layer-repair-plan-package/docs/ai-plan/RISK_REGISTER.md
 D ccd-public-layer-repair-plan-package/docs/ai-plan/ROLLBACK.md
 D ccd-public-layer-repair-plan-package/docs/ai-plan/SECURITY_AND_APPROVALS.md
 D ccd-public-layer-repair-plan-package/docs/ai-plan/SPEC.md
 D ccd-public-layer-repair-plan-package/docs/ai-plan/STATUS.md
 D ccd-public-layer-repair-plan-package/docs/ai-plan/VALIDATION.md
 D ccd-public-layer-repair-plan-package/docs/ai-plan/WORKFLOW_RECOMMENDATIONS.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/artifacts/m5-generated-diff-after.patch
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/artifacts/m5-generated-diff-before.patch
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/diffs/final-generated-validation-diff.patch
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/diffs/final-tracked-diff-summary.patch
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/diffs/m1-t03-contracts-diff.patch
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/diffs/post-m0-diff-stat.patch
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/diffs/post-m0-sbom-generated-diff.patch
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/access-helper-owner-decision.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/api-dto-consumer-map.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/api-dto-naming-decision.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/app-owned-justification-register.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/baseline-validation.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/build-config-coupling-map.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/build-owner-decision.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/commit-readiness-preflight.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/current-candidate-matrix.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/final-human-review-packet.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/final-validation-summary.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/guard-governance-refresh.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m0-milestone-summary.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m1-t03-implementation-blocked.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m1-t03-validation-summary.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m2-helper-migration-report.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m2-plan-scope-and-owner.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m2-scope-blocker-summary.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m2-validation-summary.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m3-api-dto-consumer-map-current.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m3-implementation-report.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m3-plan-scope.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m3-validation-summary.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m4-adapter-materialization-and-scope.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m4-validation-summary.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m5-evidence-report.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m5-plan-scope.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m5-validation-summary-rerun.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m5-validation-summary.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m6-evidence-report.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m7-evidence-report.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m7-validation-summary.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m8-evidence-report.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m8-milestone-summary.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m8-validation-summary.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/main-residue-quarantine-audit.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/package-owner-map.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/quarantine-audit.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/repo-baseline.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/route-contract-design.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/route-type-consumer-map.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/run-metadata.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/size-writer-decision.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/sync-owner-decision.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/sync-runtime-coupling-map.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/system-preferences-consumer-map.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/system-preferences-contract-decision.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/theme-size-boundary-review.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/theme-size-validation.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/worktree-reanchor-audit.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/YYYYMMDD-HHMMSS-ccd-public-layer-repair/README.md
 D ccd-public-layer-repair-plan-package/docs/ai-runs/YYYYMMDD-HHMMSS-ccd-public-layer-repair/artifacts/.gitkeep
 D ccd-public-layer-repair-plan-package/docs/ai-runs/YYYYMMDD-HHMMSS-ccd-public-layer-repair/command-logs/.gitkeep
 D ccd-public-layer-repair-plan-package/docs/ai-runs/YYYYMMDD-HHMMSS-ccd-public-layer-repair/diffs/.gitkeep
 D ccd-public-layer-repair-plan-package/docs/ai-runs/YYYYMMDD-HHMMSS-ccd-public-layer-repair/screenshots/.gitkeep
 M docs/adr/ADR-001-monorepo-runtime-boundary.md
 M docs/adr/ADR-002-legacy-freeze-policy.md
 M docs/architecture/legacy-equivalence-checklist.md
 M docs/architecture/legacy-web-demo-cleanup.md
 M docs/architecture/ownership-boundaries.md
 M docs/branch-model.md
 M docs/en/architecture-contract.md
 M docs/en/ci-deploy-contract.md
 M docs/en/project-metadata-contract.md
 M docs/generated/diagrams/runtime-topology.mmd
 M docs/generated/governance-report.md
 M docs/generated/graphs/README.md
 M docs/generated/graphs/dependency-graph.json
 M docs/generated/graphs/package-dependency-graph.mmd
 M docs/generated/graphs/runtime-boundary-graph.mmd
 M docs/generated/sbom.json
 M docs/governance/product-lines.md
 M docs/release/release-policy.md
 M docs/release/runtime-promotion-checklist.md
 M docs/runtime/desktop-runtime.md
 M docs/runtime/web-runtime.md
 M docs/zh/00-overview.md
 M docs/zh/01-quickstart.md
 M docs/zh/02-architecture.md
 M docs/zh/04-project-control-center.md
 M package.json
 M packages/vue-ui/src/ProForm/engine/constants.ts
 M packages/vue-ui/src/ProForm/engine/core/FormController.ts
 M packages/vue-ui/src/ProForm/engine/hooks/useField.ts
 M packages/vue-ui/src/ProForm/engine/hooks/useForm.ts
 M packages/vue-ui/src/ProForm/engine/hooks/useFormContext.ts
 M packages/vue-ui/src/ProForm/engine/logic/ComputedEngine.ts
 M packages/vue-ui/src/ProForm/engine/logic/DisableEngine.ts
 M packages/vue-ui/src/ProForm/engine/logic/ReactionEngine.ts
 M packages/vue-ui/src/ProForm/engine/logic/RequiredEngine.ts
 M packages/vue-ui/src/ProForm/engine/logic/VisibilityEngine.ts
 M packages/vue-ui/src/ProForm/engine/registry/FieldRegistry.ts
 M packages/vue-ui/src/ProForm/engine/schema/SchemaNormalizer.ts
 M packages/vue-ui/src/ProForm/engine/types/index.ts
 M packages/vue-ui/src/ProForm/engine/types/props.ts
 M packages/vue-ui/src/ProForm/engine/validation/ValidationEngine.ts
 M packages/vue-ui/src/ProForm/index.vue
 M packages/vue-ui/src/ProForm/renderers/PrimeVueRenderer.vue
 M packages/vue-ui/src/ProForm/renderers/ProFormNode.vue
 M scripts/ai-sync.mjs
 M scripts/architecture/check-runtime-leaks.mjs
 M scripts/architecture/generate-dependency-graphs.mjs
 M scripts/ci/package-resolution-smoke.mjs
 M scripts/env-doctor.mjs
 M scripts/governance/visualize.mjs
 M scripts/migrate-ledger.mjs
?? apps/web-demo/src/router/modules/example/architecture-adapters.ts
?? apps/web-demo/src/router/modules/example/architecture-directives.ts
?? apps/web-demo/src/router/modules/example/architecture-infra.ts
?? apps/web-demo/src/router/modules/example/architecture-permission.ts
?? apps/web-demo/src/router/modules/example/architecture-router-meta.ts
?? apps/web-demo/src/router/modules/example/architecture-stores.ts
?? apps/web-demo/src/router/modules/example/architecture-system-states.ts
?? apps/web-demo/src/router/modules/example/architecture.ts
?? apps/web-demo/src/router/modules/example/charts.ts
?? apps/web-demo/src/router/modules/example/common.ts
?? apps/web-demo/src/router/modules/example/components.ts
?? apps/web-demo/src/router/modules/example/hooks.ts
?? apps/web-demo/src/router/modules/example/primevue-collection.ts
?? apps/web-demo/src/router/modules/example/pro-form.ts
?? apps/web-demo/src/router/modules/example/pro-table.ts
?? apps/web-demo/src/router/modules/example/system-configuration.ts
?? apps/web-demo/src/router/modules/example/utils.ts
?? apps/web-demo/src/router/utils/metadata.ts
?? apps/web-demo/src/router/utils/routeModules.ts
?? scripts/migrate-ledger.spec.ts
```

## Running Log

### P1-CoreTypes-NoAny

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Validation:

- `node -e "...git diff --unified=0 -- packages/vue-ui/src/ProForm..."`: passed; no added `any`, `as unknown as`, or TS suppression in the ProForm type-repair diff.
- `node -e "...rg ... packages/vue-ui/src/ProForm..."`: passed; no current source `any`, `as unknown as`, or TS suppression outside docs/specs.

Completion decision: marked `[P1-CoreTypes-NoAny]` complete.

Residuals: existing type-narrowing assertions such as `as const`, Vue injection keys, and framework boundary narrowing remain; no business-code `any` or double assertion was found.

### P1-CoreTypes-Validation

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Validation:

- `pnpm --filter @ccd/vue-ui type-check`: passed.
- `pnpm --filter @ccd/vue-ui exec vitest run src/ProForm/engine/core/FormController.spec.ts src/ProForm/engine/validation/schemaResolver.spec.ts src/ProForm/engine/persistence/DraftStorage.spec.ts src/ProForm/renderers/PrimeVueRenderer.spec.ts --passWithNoTests`: passed, 4 files and 8 tests.
- `pnpm --filter @ccd/vue-ui build`: passed.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-CoreTypes-Validation]` complete.

Residuals: `pnpm build:web-demo` emitted existing Vite chunk warnings for `apps/web-demo/src/router/modules/core.ts` and `apps/web-demo/src/views/login/components/BrandPanel.vue`; build still passed.

### P1-Bridge

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Validation:

- `pnpm --filter @ccd/shared-utils type-check`: passed.
- `pnpm --filter @ccd/web-demo exec vitest run src/infra/auth/tokenProvider.spec.ts src/infra/router/routeProvider.spec.ts`: passed, 2 files and 8 tests.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm exec vitest run packages/shared-utils/src/createCapabilityBridge.spec.ts`: passed, 1 file and 11 tests.

Completion decision: marked `[P1-Bridge]` complete.

Residuals:

- Ledger path is stale; the helper now lives at `packages/shared-utils/src/createCapabilityBridge.ts`.
- Initial command `pnpm --filter @ccd/shared-utils exec vitest run src/createCapabilityBridge.spec.ts` failed because Vitest was using workspace-relative include patterns and found no files. Re-run from repo root passed.

### P1-Bridge-Contracts

Start status: open.

Changed files:

- `packages/shared-utils/src/createCapabilityBridge.ts`
- `packages/shared-utils/src/createCapabilityBridge.spec.ts`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added `ExplicitCapabilityShape<T>` to reject broad string, number, or symbol index-signature capability maps.
- Added a rest-parameter type guard on `createCapabilityBridge()` so explicit interfaces still compile while catch-all maps are rejected at the call boundary.
- Added type-level spec coverage for accepting named capability keys and rejecting `Record<string, unknown>`.

Validation:

- `pnpm --filter @ccd/shared-utils type-check`: passed.
- `pnpm exec vitest run packages/shared-utils/src/createCapabilityBridge.spec.ts`: passed, 1 file and 12 tests.
- `pnpm --filter @ccd/web-demo exec vitest run src/infra/auth/tokenProvider.spec.ts src/infra/router/routeProvider.spec.ts`: passed, 2 files and 8 tests.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm --filter @ccd/shared-utils build`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-Bridge-Contracts]` complete.

Residuals: `pnpm build:web-demo` emitted the existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; build still passed.

### P1-Bridge-Validation

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Validation:

- `pnpm exec vitest run packages/shared-utils/src/createCapabilityBridge.spec.ts`: passed, 1 file and 12 tests.
- `pnpm --filter @ccd/web-demo exec vitest run src/infra/auth/tokenProvider.spec.ts src/infra/router/routeProvider.spec.ts`: passed, 2 files and 8 tests.
- `pnpm --filter @ccd/shared-utils type-check`: passed.
- `pnpm --filter @ccd/web-demo type-check`: passed.

Completion decision: marked `[P1-Bridge-Validation]` complete.

Residuals: none.

### P1-ProTable

Start status: open.

Changed files:

- `packages/vue-ui/src/ProTable/index.ts`
- `packages/vue-ui/src/index.ts`
- generated governance outputs from `pnpm governance:gate`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Exported package-owned `useProTableInfiniteScroll` from `packages/vue-ui/src/ProTable/index.ts`.
- Exported `UseProTableInfiniteScrollOptions` and `UseProTableInfiniteScrollReturn`.
- Re-exported the helper and types from the `@ccd/vue-ui` root entry.
- Kept app router URL sync runtime app-owned; package continues to expose only adapter key/types for that boundary.

Validation:

- `pnpm --filter @ccd/vue-ui exec vitest run src/ProTable/engine/core/TableController.spec.ts src/ProTable/engine/config/apiAdapter.spec.ts`: passed, 2 files and 7 tests.
- `pnpm --filter @ccd/vue-ui build`: passed.
- `pnpm --filter @ccd/web-demo type-check`: initial parallel run failed because `@ccd/vue-ui build` removed `dist` while app type-check resolved the package; sequential rerun passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm governance:gate`: first run regenerated governance artifacts and failed sync check; second run passed.

Completion decision: marked `[P1-ProTable]` complete.

Residuals: `pnpm build:web-demo` emitted existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; build still passed.

### P1-Guard-Expansion-Deferred

Start status: open/deferred for:

- `[P1-Guard-SFCMacroOrder]`
- `[P1-Guard-TypeAssertions]`
- `[P1-Guard-AutoMitt]`
- `[P1-Guard-ComposableReturnTypes]`
- `[P1-Guard-DynamicUnoCSS]`
- `[P1-Guard-DateUtils]`
- `[P1-Guard-RouteModuleSize]`
- `[P1-Guard-OwnerSignoff]`

Changed files:

- `.ai/runtime/autonomous-repair-progress.md`

Validation:

- `sed -n '210,240p' .ai/runtime/repair_list.md`: confirmed each item already has a deferred/open note.
- `sed -n '1,260p' .ai/runtime/owner_decisions.md`: confirmed `Guard enforcement scope` is `FULL_GO_DEFERRED`.
- `sed -n '1,260p' .ai/runtime/rule_coverage_matrix.md`: confirmed these remain guard expansion backlog items.

Completion decision: left these tasks open/deferred. Their objectives are strict guard expansion or owner signoff, not documentation-only completion tasks; implementing them would contradict the binding owner decision.

Residuals: future owner/team acceptance is required before these guard expansion tasks can be implemented or closed.

### P2-Turbo-Tasks

Start status: open.

Changed files:

- `package.json`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`
- generated governance outputs from `pnpm governance:gate`

Implementation:

- Replaced root `build:core`, `build:shared-config`, `ci:prepare-internal`, and `test:run` package build ordering with Turbo-backed filters.
- Kept app prebuild scripts unchanged because `[P2-Turbo-RemoveDuplicatePrebuild]` owns duplicate app prebuild removal.

Validation:

- Root script scan: passed; no manual `pnpm --filter ... build && pnpm --filter ... build` chains remain in the changed root helpers.
- `pnpm exec turbo run build --filter='./packages/*' --dry=json`: passed; selected 10 package build tasks.
- `pnpm exec turbo run build --filter='@ccd/core' --dry=json`: passed; selected `@ccd/contracts#build` and `@ccd/core#build`.
- `pnpm ci:prepare-internal`: passed.
- `pnpm ci:smoke:packages`: passed.
- `pnpm build:web-demo`: passed.
- `pnpm build:desktop`: passed.
- `pnpm build:core`: passed.
- `pnpm build:shared-config`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:ci`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P2-Turbo-Tasks]` complete.

Residuals:

- App `prebuild` scripts still invoke dependency Turbo builds and cause nested Turbo output during root `turbo run build`; this is intentionally left for `[P2-Turbo-RemoveDuplicatePrebuild]`.
- `pnpm build:web-demo` and `pnpm build:ci` emitted existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; builds still passed.

### P2-Turbo-InputsOutputs

Start status: open.

Changed files:

- `turbo.json`
- `eslint.config.ts`
- `apps/web-demo/src/api/system/preferences.api.spec.ts`
- `apps/web-demo/src/router/modules/example.spec.ts`
- `packages/contracts/src/runtime.ts`
- `packages/core/src/index.ts`
- generated governance outputs from `pnpm governance:gate`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added root-level Turbo `globalDependencies` for env, workspace, TypeScript, Vite, UnoCSS, Playwright, Vitest, ESLint, project config, and governance policy inputs.
- Added explicit package task inputs, outputs, and cache behavior for `build`, `type-check`, `typecheck`, and `test`.
- Added root-scoped `//#lint` and non-cached `//#e2e`; `//#e2e` depends on `@ccd/web-demo#build`.
- Fixed lint validation blockers without weakening lint: generated Tauri `target/**` is ignored, repository scripts get Node globals, test mocks avoid invalid uppercase/string object method names, and empty extension interfaces became type aliases.

Validation:

- `pnpm exec turbo run build --dry=json`: passed; `build` resolves explicit inputs, `dist/**` outputs, and `^build`.
- `pnpm exec turbo run type-check --dry=json`: passed; `type-check` resolves explicit inputs, no outputs, and `^build`.
- `pnpm exec turbo run test --dry=json`: passed.
- `pnpm exec turbo run lint --dry=json`: passed; selected only `//#lint`.
- `pnpm exec turbo run e2e --dry=json`: passed; selected only `//#e2e` plus `@ccd/web-demo#build` dependency chain.
- `pnpm ci:prepare-internal`: passed.
- `pnpm ci:smoke:packages`: passed.
- `pnpm exec turbo run test --filter='./packages/*'`: passed; rerun after correcting test outputs produced no output warnings.
- `pnpm exec turbo run lint`: first failed on generated Tauri target files and source lint violations, then passed after targeted fixes.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:ci`: first failed because governance regenerated generated artifacts; `pnpm governance:gate` then passed and the `pnpm build:ci` rerun passed.

Completion decision: marked `[P2-Turbo-InputsOutputs]` complete.

Residuals:

- App `prebuild` scripts still produce nested Turbo output during app builds; `[P2-Turbo-RemoveDuplicatePrebuild]` remains responsible for removing them.
- `pnpm build:ci` still emits the existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; build passes.

### P1-Desktop-CSP

Start status: open.

Changed files:

- `apps/desktop/src-tauri/tauri.conf.json`
- generated API/governance outputs from validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Replaced `app.security.csp: null` with a restrictive production CSP object.
- Allowed local app execution and Tauri IPC only through `'self'`, `ipc:`, and `http://ipc.localhost`.
- Kept external HTTP, asset protocol, shell, filesystem, plugin, `unsafe-inline`, and `unsafe-eval` allowances out of this task.
- Reviewed `apps/desktop/src-tauri/capabilities/default.json`; no capability change was needed because this task enabled no new Tauri API or plugin.

Validation:

- `node -e` JSON/CSP presence check: passed.
- `git diff --check -- apps/desktop/src-tauri/tauri.conf.json`: passed.
- `pnpm sync:desktop-config`: passed.
- `pnpm check:drift`: passed.
- `pnpm build:desktop`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-Desktop-CSP]` complete.

Residuals: Tauri's default CSP asset modification remains enabled; existing inline desktop preloader script/style are expected to be handled by Tauri's build-time CSP hash/nonce injection rather than by `unsafe-inline`.

### P1-Desktop-CSP-Allowlist

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`
- generated API/governance outputs from validation

Implementation:

- Verified the CSP allowlist added for `[P1-Desktop-CSP]` is local/Tauri-only: `'self'`, `'none'`, `ipc:`, `http://ipc.localhost`, `data:`, and `blob:`.
- Confirmed no external API endpoints are required by current desktop source and no `unsafe-inline` or `unsafe-eval` CSP source is present.
- Made no additional source edit because the CSP object already satisfies this task.

Validation:

- Custom Node CSP allowlist check: passed.
- `pnpm sync:desktop-config`: passed.
- `pnpm check:drift`: passed.
- `pnpm build:desktop`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-Desktop-CSP-Allowlist]` complete.

Residuals: no external desktop API endpoint is currently declared; future endpoints must be added through a later scoped task and revalidated.

### P1-Desktop-Capabilities

Start status: open.

Changed files:

- `apps/desktop/src-tauri/capabilities/default.json`
- generated API/governance outputs from validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Hardened the default Tauri v2 capability to be explicitly local-only for the `main` window.
- Removed broad `core:default` permissions; current desktop source imports only `@tauri-apps/api/core` for app-owned `invoke` adapters and no Tauri plugin or Rust command is currently registered.
- Kept plugin-specific filesystem, shell, dialog, clipboard, updater, opener, notification, HTTP, and external-navigation permissions out of this task.

Validation:

- Custom Node capability check: passed.
- `git diff --check -- apps/desktop/src-tauri/capabilities/default.json`: passed.
- `pnpm sync:desktop-config`: passed.
- `pnpm check:drift`: passed.
- `pnpm build:desktop`: passed.
- `pnpm --filter @ccd/desktop tauri build --no-bundle --ci`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-Desktop-Capabilities]` complete.

Residuals: existing desktop adapters reference app-owned invoke command names (`storage_get`, `storage_set`, `storage_remove`, `fs_read_text`, `fs_write_text`, `http_request`) but the current Rust entrypoint registers no commands. This task did not implement runtime commands or plugin permissions.

### P1-Desktop-Scopes

Start status: open.

Changed files:

- `apps/desktop/src-tauri/security-scopes.json`
- generated API/governance outputs from validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a machine-readable desktop security scope policy covering filesystem, shell, dialog, clipboard, updater, opener, notification, HTTP, and external navigation.
- Set every listed surface to `enabled: false`, `allow: []`, and `deny: ["*"]` until a future concrete use case adds scoped permissions.
- Kept the policy outside `capabilities/**` so it does not enable or alter Tauri capability loading.

Validation:

- Custom Node desktop scope policy check: passed.
- `git diff --check -- apps/desktop/src-tauri/security-scopes.json apps/desktop/src-tauri/capabilities/default.json`: passed.
- `pnpm sync:desktop-config`: passed.
- `pnpm check:drift`: passed.
- `pnpm build:desktop`: passed.
- `pnpm --filter @ccd/desktop tauri build --no-bundle --ci`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-Desktop-Scopes]` complete.

Residuals: the policy is currently validated by the task-local Node check; `[P1-Desktop-SecurityChecks]` remains responsible for wiring this into automated architecture checks.

### P1-Desktop-NoPrematurePlugins

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`
- generated API/governance outputs from validation

Implementation:

- Verified no `@tauri-apps/plugin-*` package dependency is present in `apps/desktop/package.json`.
- Verified no `tauri-plugin-*` Rust dependency is present in `apps/desktop/src-tauri/Cargo.toml`.
- Verified `apps/desktop/src-tauri/capabilities/default.json` contains no filesystem, shell, or other Tauri plugin permission.
- Made no additional source edit because the repository already avoids premature shell/filesystem plugin enablement and `[P1-Desktop-Scopes]` now records deny-all scope policy.

Validation:

- Custom Node no-plugin check: passed.
- `rg` plugin surface scan: found only generated schema examples and CSP URL text, no enabled plugin dependency or permission.
- `pnpm sync:desktop-config`: passed.
- `pnpm check:drift`: passed.
- `pnpm build:desktop`: passed.
- `pnpm --filter @ccd/desktop tauri build --no-bundle --ci`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-Desktop-NoPrematurePlugins]` complete.

Residuals: none for this task.

### P1 Boundary Validation

Start status: run after completing the P1 desktop security section and before entering P2 tasks.

Validation:

- `pnpm ai:doctor`: passed; emitted known decorative token contrast advisories only.
- `pnpm codex:preflight`: passed; emitted known decorative token contrast advisories only.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:ci`: passed; emitted existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`.
- `pnpm governance:gate`: passed and included `desktop security baseline`.

Completion decision: P1 boundary validation passed.

Residuals: existing Vite dynamic/static import chunk warnings remain non-blocking.

### P1-Desktop-SecurityChecks

Start status: open.

Changed files:

- `scripts/architecture/desktop-security-rules.mjs`
- `scripts/architecture/check-desktop-security.mjs`
- `scripts/architecture/desktop-security-rules.spec.ts`
- `scripts/governance/gate.mjs`
- `package.json` (`desktop:security` script added; pre-existing build-script edits were preserved)
- generated API/governance outputs from validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added reusable desktop security validation rules covering CSP, required scope surfaces, Tauri capability manifests, plugin package dependencies, Rust plugin crates, and plugin permissions.
- Added `pnpm desktop:security` as the CLI entrypoint.
- Wired `desktop:security` into `governance:gate` as the `desktop security baseline` check.
- Added focused Vitest coverage for the accepted restricted baseline, unsafe CSP rejection, broad `core:default` and plugin permission rejection, and plugin package rejection before scoped policy enablement.

Validation:

- `pnpm exec vitest run scripts/architecture/desktop-security-rules.spec.ts`: passed, 1 file and 4 tests.
- `pnpm desktop:security`: passed.
- `git diff --check -- scripts/architecture/desktop-security-rules.mjs scripts/architecture/check-desktop-security.mjs scripts/architecture/desktop-security-rules.spec.ts package.json scripts/governance/gate.mjs`: passed.
- `pnpm sync:desktop-config`: passed.
- `pnpm check:drift`: passed.
- `pnpm build:desktop`: passed.
- `pnpm --filter @ccd/desktop tauri build --no-bundle --ci`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm governance:gate`: passed and included `desktop security baseline`.

Completion decision: marked `[P1-Desktop-SecurityChecks]` complete.

Residuals: none for this task.

### P1-Guard-VueUseContradiction

Start status: open.

Changed files:

- `.ai/rules/core/00-root-gatekeeper.mdc`
- `.ai/runtime/rule_coverage_matrix.md`
- generated governance/API outputs from validation
- package `dist/**` outputs regenerated by doctor/preflight validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added explicit VueUse priority exclusions to the root gatekeeper for business HTTP and storage surfaces.
- Documented that business HTTP must use Alova API modules and `useHttpRequest`, not VueUse `useFetch`.
- Documented that business persistence must use the app-owned safeStorage/approved persistence boundary, not VueUse storage composables.
- Marked the VueUse contradiction item in the coverage matrix resolved.

Validation:

- `pnpm docs:commands`: passed.
- `pnpm ai:guard`: passed.
- `git diff --check`: passed.
- `pnpm ai:doctor`: passed.
- `pnpm codex:preflight`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-Guard-VueUseContradiction]` complete.

Residuals: `ai:doctor` and `codex:preflight` reported the existing decorative token contrast advisories only. No strict VueUse guard expansion was added because enforcement expansion remains governed by owner-decision constraints.

### P1-Guard-TypeAssertionContradiction

Start status: open.

Changed files:

- `.ai/rules/core/08-vue-template-strictness.mdc`
- `.ai/runtime/rule_coverage_matrix.md`
- generated governance/API outputs from validation
- package `dist/**` outputs regenerated by doctor/preflight validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Replaced the direct `props.item as UserInfo` computed example with `castValue<UserInfo>(props.item)`.
- Replaced the adjacent direct string assertion with `castValue<string>(value.value)`.
- Updated the template expression quick-reference to route `as Type` replacement through `castValue<T>()`.
- Marked the type-assertion contradiction in the coverage matrix resolved.

Validation:

- `pnpm docs:commands`: passed.
- `pnpm ai:guard`: passed.
- `rg` stale assertion check: passed for the rule file; remaining stale assertion text appears only in the resolved matrix note.
- `git diff --check`: passed.
- `pnpm ai:doctor`: passed.
- `pnpm codex:preflight`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-Guard-TypeAssertionContradiction]` complete.

Residuals: `ai:doctor` and `codex:preflight` reported the existing decorative token contrast advisories only. No strict assertion guard expansion was added because `[P1-Guard-TypeAssertions]` is a separate open backlog task and strict guard expansion remains owner-decision constrained.

### P1-Guard-ScaffoldArchetype

Start status: open.

Changed files:

- `.ai/rules/components/02-pro-components.mdc`
- `.ai/runtime/rule_coverage_matrix.md`
- generated governance/API outputs from validation
- package `dist/**` outputs regenerated by doctor/preflight validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Narrowed the Pro Components A1 archetype mandate to table, form, settings, and CRUD business views.
- Documented scaffolded `--kind detail` pages as an approved A2-sidebar-inspector variant for readonly detail, inspection, profile, and document review pages.
- Marked the scaffold archetype contradiction in the coverage matrix resolved.

Validation:

- `pnpm docs:commands`: passed.
- `pnpm ai:guard`: passed.
- `pnpm ai:scaffold:view-route -- --segment p1/scaffold-archetype-check --title-key router.p1.scaffoldArchetypeCheck --kind detail --dry-run`: passed and wrote no files.
- `git diff --check`: passed.
- `pnpm ai:doctor`: passed.
- `pnpm codex:preflight`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-Guard-ScaffoldArchetype]` complete.

Residuals: `ai:doctor` and `codex:preflight` reported the existing decorative token contrast advisories only. The scaffold script itself was not changed because its table/form/detail archetypes already matched the design-state contract.

### P1-Guard-DesignTokenCanonical

Start status: open.

Changed files:

- `.ai/rules/design-system/00-unocss-guardrails.mdc`
- `.ai/rules/design-system/01-design-tokens.mdc`
- `.ai/rules/design-system/02-size-density-system.mdc`
- `.ai/rules/design-system/03-material-system.mdc`
- `.ai/rules/design-system/05-semantic-color-usage-contract.mdc`
- `.ai/runtime/rule_coverage_matrix.md`
- generated governance/API outputs from validation
- package `dist/**` outputs regenerated by doctor/preflight validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Chose `.ai/rules/design-system/01-design-tokens.mdc` as the canonical human-readable rule file for token family names, semantic color tiers, border composition, and source-authored sizing fallback.
- Added deferral notes in companion design-system rules so repeated operational checklists point back to the canonical token rule.
- Marked the design-token duplication contradiction in the coverage matrix resolved.

Validation:

- `pnpm docs:commands`: passed.
- `pnpm ai:guard`: passed.
- `pnpm validate:tokens`: passed with existing decorative token advisories.
- `git diff --check`: passed.
- `pnpm ai:doctor`: passed.
- `pnpm codex:preflight`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-Guard-DesignTokenCanonical]` complete.

Residuals: decorative token contrast advisories remain existing non-blocking warnings. Broad table consolidation was intentionally not performed because the owner decision keeps broad design-token consolidation deferred; this task only establishes canonical rule precedence and cross-references.

### P1-Guard-SFCMacroOrder

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- generated governance/API outputs from validation
- package `dist/**` outputs regenerated by doctor/preflight validation
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Did not add SFC macro-order guard coverage.
- Added a deferred/open ledger note because the task itself is conditional on team acceptance of strict enforcement, and `.ai/runtime/owner_decisions.md` sets `Guard enforcement scope` to `FULL_GO_DEFERRED`.
- Confirmed the current SFC macro-order rule lives in `.ai/rules/core/03-vue3-ts-architecture.mdc`; the older filename referenced in historical matrix text is stale.

Validation:

- `pnpm docs:commands`: passed.
- `git diff --check`: passed.
- `pnpm ai:sync`: passed and regenerated `.ai/runtime/repair-ledger.json`.
- `pnpm ai:doctor`: passed.
- `pnpm codex:preflight`: passed.
- `pnpm governance:gate`: passed.

Completion decision: left `[P1-Guard-SFCMacroOrder]` open as deferred/blocked by owner decision.

Residuals: strict SFC macro-order enforcement requires future owner/team acceptance. `ai:doctor` and `codex:preflight` reported the existing decorative token contrast advisories only.

### P1-Guard-TypeAssertions

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- generated governance/API outputs from validation
- package `dist/**` outputs regenerated by doctor/preflight validation
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Did not add stricter `as Type` guard coverage.
- Added a deferred/open ledger note because `.ai/runtime/owner_decisions.md` sets `Guard enforcement scope` to `FULL_GO_DEFERRED`.
- Kept the already-completed contradiction fix separate: `[P1-Guard-TypeAssertionContradiction]` changed the rule example, but this task would expand enforcement and remains owner-deferred.

Validation:

- `pnpm docs:commands`: passed.
- `git diff --check`: passed.
- `pnpm ai:sync`: passed and regenerated `.ai/runtime/repair-ledger.json`.
- `pnpm ai:doctor`: passed.
- `pnpm codex:preflight`: passed.
- `pnpm governance:gate`: passed.

Completion decision: left `[P1-Guard-TypeAssertions]` open as deferred/blocked by owner decision.

Residuals: stricter business-code assertion scanning requires future owner/team acceptance and explicit exception-scope approval. `ai:doctor` and `codex:preflight` reported the existing decorative token contrast advisories only.

### P1-Guard-AutoMitt

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- generated governance/API outputs from validation
- package `dist/**` outputs regenerated by doctor/preflight validation
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Did not add `useAutoMitt` guard coverage.
- Added a deferred/open ledger note because `.ai/runtime/owner_decisions.md` sets `Guard enforcement scope` to `FULL_GO_DEFERRED`.
- Preserved the existing manual rule in `.ai/rules/core/06-utils-hooks.mdc` without expanding `scripts/ai-architecture-guard.mjs`.

Validation:

- `pnpm docs:commands`: passed.
- `git diff --check`: passed.
- `pnpm ai:sync`: passed and regenerated `.ai/runtime/repair-ledger.json`.
- `pnpm ai:doctor`: passed.
- `pnpm codex:preflight`: passed.
- `pnpm governance:gate`: passed.

Completion decision: left `[P1-Guard-AutoMitt]` open as deferred/blocked by owner decision.

Residuals: event-bus/useAutoMitt enforcement expansion requires future owner/team acceptance. `ai:doctor` and `codex:preflight` reported the existing decorative token contrast advisories only.

### P1-Guard-ComposableReturnTypes

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- generated governance/API outputs from validation
- package `dist/**` outputs regenerated by doctor/preflight validation
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Did not add composable return-type annotation guard coverage.
- Added a deferred/open ledger note because `.ai/runtime/owner_decisions.md` sets `Guard enforcement scope` to `FULL_GO_DEFERRED`.
- Preserved the existing manual composable return-type law in `.ai/rules/core/06-utils-hooks.mdc` without expanding `scripts/ai-architecture-guard.mjs`.

Validation:

- `pnpm docs:commands`: passed.
- `git diff --check`: passed.
- `pnpm ai:sync`: passed and regenerated `.ai/runtime/repair-ledger.json`.
- `pnpm ai:doctor`: passed.
- `pnpm codex:preflight`: passed.
- `pnpm governance:gate`: passed.

Completion decision: left `[P1-Guard-ComposableReturnTypes]` open as deferred/blocked by owner decision.

Residuals: composable return-type enforcement expansion requires future owner/team acceptance. `ai:doctor` and `codex:preflight` reported the existing decorative token contrast advisories only. `pnpm governance:gate` emitted a non-blocking GitHub registry warning because `gh` is not authenticated, then passed.

### P1-Guard-DynamicUnoCSS

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- generated governance/API outputs from validation
- package `dist/**` outputs regenerated by doctor/preflight validation
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Did not add dynamic UnoCSS class or safelist guard coverage.
- Added a deferred/open ledger note because `.ai/runtime/owner_decisions.md` sets `Guard enforcement scope` to `FULL_GO_DEFERRED`.
- Preserved current UnoCSS guardrails and existing `ai:guard` behavior without expanding strict scanning.

Validation:

- `pnpm docs:commands`: passed.
- `git diff --check`: passed.
- `pnpm ai:sync`: passed and regenerated `.ai/runtime/repair-ledger.json`.
- `pnpm ai:doctor`: passed.
- `pnpm codex:preflight`: passed.
- `pnpm governance:gate`: passed.

Completion decision: left `[P1-Guard-DynamicUnoCSS]` open as deferred/blocked by owner decision.

Residuals: dynamic UnoCSS class/safelist enforcement expansion requires future owner/team acceptance. `ai:doctor` and `codex:preflight` reported the existing decorative token contrast advisories only.

### P1-Guard-DateUtils

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- generated governance/API outputs from validation
- package `dist/**` outputs regenerated by doctor/preflight validation
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Did not decide or expand DateUtils guard enforcement beyond the current raw-date-constructor rule.
- Added a deferred/open ledger note because `.ai/runtime/owner_decisions.md` sets `Guard enforcement scope` to `FULL_GO_DEFERRED`.
- Preserved current `ai:guard` behavior.

Validation:

- `pnpm docs:commands`: passed.
- `git diff --check`: passed.
- `pnpm ai:sync`: passed and regenerated `.ai/runtime/repair-ledger.json`.
- `pnpm ai:doctor`: passed.
- `pnpm codex:preflight`: passed.
- `pnpm governance:gate`: passed.

Completion decision: left `[P1-Guard-DateUtils]` open as deferred/blocked by owner decision.

Residuals: broader DateUtils enforcement requires future owner/team decision. `ai:doctor` and `codex:preflight` reported the existing decorative token contrast advisories only.

### P1-Guard-RouteModuleSize

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- generated governance/API outputs from validation
- package `dist/**` outputs regenerated by doctor/preflight validation
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Did not add max-file-length or max-route-module-size governance checks.
- Added a deferred/open ledger note because `.ai/runtime/owner_decisions.md` sets `Guard enforcement scope` to `FULL_GO_DEFERRED`.
- Avoided changing `eslint.config.ts` or `scripts/architecture/**` until a future owner/team enforcement lane approves the gate.

Validation:

- `pnpm docs:commands`: passed.
- `git diff --check`: passed.
- `pnpm ai:sync`: passed and regenerated `.ai/runtime/repair-ledger.json`.
- `pnpm ai:doctor`: passed.
- `pnpm codex:preflight`: passed.
- `pnpm governance:gate`: passed.

Completion decision: left `[P1-Guard-RouteModuleSize]` open as deferred/blocked by owner decision.

Residuals: new max-file-length and route-module-size gates require future owner/team acceptance. `ai:doctor` and `codex:preflight` reported the existing decorative token contrast advisories only.

### P1-Guard-OwnerSignoff

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- generated governance/API outputs from validation
- package `dist/**` outputs regenerated by doctor/preflight validation
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Did not update `.ai/runtime/owner_decisions.md` because no new owner decisions were made in the repository.
- Added a deferred/open ledger note recording that guard enforcement and related strict expansion remain `FULL_GO_DEFERRED`.

Validation:

- `pnpm docs:commands`: passed.
- `git diff --check`: passed.
- `pnpm ai:sync`: passed and regenerated `.ai/runtime/repair-ledger.json`.
- `pnpm ai:doctor`: passed.
- `pnpm codex:preflight`: passed.
- `pnpm governance:gate`: passed.

Completion decision: left `[P1-Guard-OwnerSignoff]` open pending actual owner sign-off.

Residuals: owner-decision updates require future owner/operator decision changes. `ai:doctor` and `codex:preflight` reported the existing decorative token contrast advisories only.

### P1-SafeStorage-AppOwned

Start status: open.

Changed files:

- `scripts/architecture/shared-placement-rules.mjs`
- `scripts/architecture/shared-placement-rules.spec.ts`
- generated API/governance outputs from validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a workspace runtime boundary rule that keeps `crypto-es` and `lz-string` imports owned by `apps/web-demo/src/utils/safeStorage/**`.
- Added focused classifier coverage proving safeStorage internals may import those runtime dependencies while `@ccd/shared-utils` and `@ccd/core` may not.
- Left crypto/HMAC/Web Crypto, compression, Pinia serializer, storage maintenance, migration behavior, and facade exports in the existing app-owned safeStorage runtime.

Validation:

- `pnpm exec vitest run scripts/architecture/shared-placement-rules.spec.ts`: passed, 1 file and 6 tests.
- `pnpm arch:boundaries`: passed.
- `pnpm exec vitest run apps/web-demo/src/utils/safeStorage/piniaSerializer.spec.ts apps/web-demo/src/stores/modules/session/user.spec.ts apps/web-demo/src/stores/modules/session/permission.spec.ts apps/web-demo/src/stores/modules/system/layout.spec.ts apps/web-demo/src/stores/modules/system/size.spec.ts apps/web-demo/src/sync/systemPreferences/model.spec.ts apps/web-demo/src/sync/systemPreferences/guards.spec.ts`: passed, 7 files and 67 tests.
- `pnpm arch:runtime`: passed.
- `pnpm ai:guard`: passed.
- `pnpm api:report`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm governance:gate`: passed.
- `git diff --check`: passed.

Completion decision: marked `[P1-SafeStorage-AppOwned]` complete.

Residuals: focused safeStorage tests emitted the existing non-production fallback-key warning; `pnpm build:web-demo` emitted existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; all commands passed.

### P1-SafeStorage-NoSharedMove

Start status: open.

Changed files:

- generated API/governance outputs from validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Prohibition-task closeout. No safeStorage runtime, `crypto-es`, or `lz-string` implementation was moved into `@ccd/shared-utils`, `@ccd/core`, or shared runtime packages.
- Verified package manifests/lockfile were not changed for this task. `package.json` and `apps/web-demo/package.json` remain pre-existing dirty paths, not current-task edits.

Validation:

- SafeStorage runtime dependency scan: `crypto-es` and `lz-string` remain in root/web-demo manifests and app-owned `apps/web-demo/src/utils/safeStorage/**`; shared packages have no runtime imports.
- `git diff --name-only -- package.json pnpm-lock.yaml packages/shared-utils/package.json packages/core/package.json packages/contracts/package.json apps/web-demo/package.json`: showed only pre-existing dirty `package.json` and `apps/web-demo/package.json`.
- `pnpm arch:boundaries`: passed.
- `pnpm supply:check`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm governance:gate`: first run regenerated governance artifacts and failed sync check; second run passed after generated outputs stabilized.
- `git diff --check`: passed.

Completion decision: marked `[P1-SafeStorage-NoSharedMove]` complete.

Residuals: root `package.json` and `apps/web-demo/package.json` are pre-existing dirty paths; no package manifest or lockfile edits were made for this task.

### P1-Guard-StorageContradiction

Start status: open.

Changed files:

- `.ai/rules/integrations/04-safe-storage.mdc`
- `.ai/runtime/rule_coverage_matrix.md`
- generated package `dist/**` outputs from AI doctor/preflight package preparation
- generated governance outputs from validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Clarified that native `localStorage`/`sessionStorage` access is allowed only in approved infrastructure boundaries and documented preload/runtime exceptions.
- Replaced the safeStorage usage example so it routes through safeStorage facade helpers instead of direct native storage calls.
- Marked the specific storage-rule contradiction as resolved in the coverage matrix.
- Did not add stricter guard expansion, consistent with the `FULL_GO_DEFERRED` owner decision for broad rule-contradiction enforcement.

Validation:

- `pnpm docs:commands`: passed.
- `pnpm ai:doctor`: passed, with existing decorative token contrast advisories.
- `pnpm codex:preflight`: passed, with existing decorative token contrast advisories.
- `pnpm governance:gate`: passed.
- `git diff --check`: passed.

Completion decision: marked `[P1-Guard-StorageContradiction]` complete.

Residuals: decorative token contrast advisories remain existing warnings; no guard expansion was added because strict contradiction enforcement is owner-deferred.

### P1-SafeStorage-Contracts

Start status: open.

Changed files:

- `packages/contracts/src/storage.ts`
- `packages/contracts/src/index.ts`
- `apps/web-demo/src/utils/safeStorage/core.ts`
- `apps/web-demo/src/utils/safeStorage/storageMaintenance.ts`
- `apps/web-demo/src/utils/safeStorage/contracts.spec.ts`
- generated package `dist/**` outputs from package builds
- generated API/governance outputs from validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added type-only safeStorage capability contracts for codec suites, compression/integrity policy values, key predicates, and maintenance adapters in `@ccd/contracts`.
- Wired the app-owned safeStorage codec exports and local-storage maintenance adapter to satisfy those contracts.
- Kept crypto/HMAC/Web Crypto, `lz-string`, browser storage access, serializer behavior, and migration/runtime code under `apps/web-demo/src/utils/safeStorage/**`.

Validation:

- `pnpm exec vitest run apps/web-demo/src/utils/safeStorage/contracts.spec.ts apps/web-demo/src/utils/safeStorage/piniaSerializer.spec.ts apps/web-demo/src/stores/modules/session/user.spec.ts apps/web-demo/src/stores/modules/session/permission.spec.ts apps/web-demo/src/stores/modules/system/layout.spec.ts apps/web-demo/src/stores/modules/system/size.spec.ts apps/web-demo/src/sync/systemPreferences/model.spec.ts apps/web-demo/src/sync/systemPreferences/guards.spec.ts`: passed, 8 files and 69 tests.
- `pnpm --filter @ccd/contracts type-check`: passed.
- `pnpm --filter @ccd/contracts build`: passed.
- `pnpm api:report`: passed.
- `pnpm arch:runtime`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm ai:guard`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm governance:gate`: passed.
- `git diff --check`: passed.

Completion decision: marked `[P1-SafeStorage-Contracts]` complete.

Residuals: focused safeStorage tests emitted the existing non-production fallback-key warning; `pnpm build:web-demo` emitted existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; all commands passed.

### P1-HttpContract-Validation

Start status: open.

Changed files:

- generated API/governance outputs from validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Validation-only closeout for the HTTP contract/request boundary section after the contracts, app-owned runtime boundary, Zod boundary, and no-coupling tasks were completed.

Validation:

- `pnpm exec vitest run apps/web-demo/src/utils/http/requestLayer.spec.ts apps/web-demo/src/utils/http/policies/httpPolicies.spec.ts apps/web-demo/src/utils/http/interceptors.spec.ts apps/web-demo/src/utils/http/validation.spec.ts apps/web-demo/src/hooks/modules/useHttpRequest.spec.ts apps/web-demo/src/adapters/http.adapter.spec.ts apps/web-demo/src/api/example/users.spec.ts apps/web-demo/src/api/system/preferences.api.spec.ts apps/web-demo/src/infra/auth/tokenProvider.spec.ts`: passed, 9 files and 65 tests.
- `pnpm arch:runtime`: passed.
- `pnpm api:report`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm ai:guard`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm governance:gate`: passed.
- `git diff --check`: passed.

Completion decision: marked `[P1-HttpContract-Validation]` complete.

Residuals: `pnpm build:web-demo` emitted existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; build still passed.

### P1-HttpContract-NoCoupling

Start status: open.

Changed files:

- `scripts/ai-architecture-guard.mjs`
- generated API/governance outputs from validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added an architecture guard rule that scans HTTP/API source files, `useHttpRequest`, and the HTTP adapter for forbidden router runtime imports, navigation calls, Pinia/store imports, and direct `localStorage`/`sessionStorage` usage.
- Preserved the existing approved auth bridge path through `apps/web-demo/src/infra/auth/tokenProvider.ts`.

Validation:

- `pnpm ai:guard`: passed.
- `pnpm exec vitest run apps/web-demo/src/utils/http/requestLayer.spec.ts apps/web-demo/src/infra/auth/tokenProvider.spec.ts apps/web-demo/src/utils/http/interceptors.spec.ts apps/web-demo/src/utils/http/policies/httpPolicies.spec.ts`: passed, 4 files and 36 tests.
- `pnpm arch:runtime`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm api:report`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm governance:gate`: passed.
- `git diff --check`: passed.

Completion decision: marked `[P1-HttpContract-NoCoupling]` complete.

Residuals: `pnpm build:web-demo` emitted existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; build still passed.

### P1-HttpContract-Zod

Start status: open.

Changed files:

- `apps/web-demo/src/api/example/users.ts`
- `apps/web-demo/src/api/example/users.spec.ts`
- `apps/web-demo/src/api/system/preferences.api.ts`
- `apps/web-demo/src/api/system/preferences.api.spec.ts`
- `apps/web-demo/src/hooks/modules/useSystemPreferencesSync.ts`
- generated API/governance outputs from validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Attached stable Zod response schemas to example user Alova Method builders while preserving caller config and existing imperative wrapper behavior.
- Attached stable system-preferences response schemas to API Method builders and removed duplicate hook-level schema options for that path.
- Kept validation at stable API/HTTP boundaries; did not broaden validation to unrelated dynamic or high-cost surfaces.

Validation:

- `pnpm --filter @ccd/web-demo exec vitest run src/api/example/users.spec.ts src/api/system/preferences.api.spec.ts`: passed, 2 files and 8 tests.
- `pnpm exec vitest run apps/web-demo/src/utils/http/requestLayer.spec.ts apps/web-demo/src/utils/http/policies/httpPolicies.spec.ts apps/web-demo/src/utils/http/interceptors.spec.ts apps/web-demo/src/utils/http/validation.spec.ts apps/web-demo/src/hooks/modules/useHttpRequest.spec.ts apps/web-demo/src/adapters/http.adapter.spec.ts`: passed, 6 files and 52 tests.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm ai:guard`: passed.
- `pnpm arch:runtime`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm api:report`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm governance:gate`: passed.
- `git diff --check`: passed.

Completion decision: marked `[P1-HttpContract-Zod]` complete.

Residuals: `pnpm build:web-demo` emitted existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; build still passed.

### P1-HttpContract-AppOwned

Start status: open.

Implementation in progress:

- Tighten request-runtime architecture classification so direct `alova/*` imports remain limited to `apps/web-demo/src/utils/http/**`, the approved `useHttpRequest` wrapper, and generated/build ownership paths.

Changed files:

- `scripts/architecture/shared-placement-rules.mjs`
- `scripts/architecture/shared-placement-rules.spec.ts`
- generated API/governance outputs from validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Restricted direct `alova/*` import classification to `apps/web-demo/src/utils/http/**`, `apps/web-demo/src/hooks/modules/useHttpRequest.ts`, its focused spec, and build ownership paths.
- Added guard coverage that permits the app-owned HTTP runtime and approved hook while blocking direct Alova imports from unrelated app views/hooks and shared packages.
- Left Alova instance, methods, interceptors, token refresh wiring, error mapping, UI notification, and schema validation runtime under `apps/web-demo/src/utils/http/**`.

Validation:

- `pnpm exec vitest run scripts/architecture/shared-placement-rules.spec.ts`: passed, 1 file and 5 tests.
- `pnpm exec vitest run apps/web-demo/src/utils/http/requestLayer.spec.ts apps/web-demo/src/utils/http/policies/httpPolicies.spec.ts apps/web-demo/src/utils/http/interceptors.spec.ts apps/web-demo/src/utils/http/validation.spec.ts`: passed, 4 files and 34 tests.
- `pnpm ai:guard`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm arch:runtime`: passed.
- `pnpm api:report`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm governance:gate`: passed.
- `git diff --check`: passed.

Completion decision: marked `[P1-HttpContract-AppOwned]` complete.

Residuals: `pnpm build:web-demo` emitted existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; build still passed.

### P1-HttpContract-Contracts

Start status: open.

Changed files:

- `packages/contracts/src/http/error.ts`
- `packages/contracts/src/http/response.ts`
- generated API/governance outputs from validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Refined the type-only HTTP error contract with the app-owned `security` category while keeping runtime behavior in `apps/web-demo/src/utils/http/**`.
- Refined `BackendApiResponseEnvelope<TData>` with optional `success`, `total`, `page`, and `pageSize` metadata used by existing app response shapes.
- Did not add runtime code, app imports, browser APIs, alova/Zod coupling, or `packages/core/src/http/**`.

Validation:

- `pnpm --filter @ccd/contracts build`: passed.
- `pnpm build:core`: passed.
- `pnpm exec vitest run apps/web-demo/src/utils/http/requestLayer.spec.ts apps/web-demo/src/utils/http/policies/httpPolicies.spec.ts apps/web-demo/src/utils/http/interceptors.spec.ts apps/web-demo/src/utils/http/validation.spec.ts`: passed, 4 files and 34 tests.
- `pnpm api:report`: passed.
- `pnpm arch:runtime`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm ai:doctor`: passed; existing decorative token contrast advisories only.
- `pnpm codex:preflight`: passed; existing decorative token contrast advisories only.
- `pnpm governance:gate`: passed.
- `git diff --check`: passed.

Completion decision: marked `[P1-HttpContract-Contracts]` complete.

Residuals: `pnpm ai:doctor` and `pnpm codex:preflight` reported existing decorative token contrast advisories; both commands passed.

### P1-HttpContract-ContractFacets

Start status: open.

Changed files:

- `packages/contracts/src/http/baseUrl.ts`
- `packages/contracts/src/http/cancellation.ts`
- `packages/contracts/src/http/errorMapping.ts`
- `packages/contracts/src/http/interceptor.ts`
- `packages/contracts/src/http/index.ts`
- `packages/contracts/src/index.ts`
- `apps/web-demo/src/constants/http.ts`
- `apps/web-demo/src/utils/http/instance.ts`
- `apps/web-demo/src/utils/http/types.ts`
- `apps/web-demo/src/utils/http/interceptors.ts`
- `apps/web-demo/src/utils/http/policies/errorMappingPolicy.ts`
- `apps/web-demo/src/utils/http/policies/httpPolicies.spec.ts`
- generated API/governance outputs from validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added type-only HTTP contracts for base URL policy, cancellation policy, interceptor lifecycle, and normalized error mapping.
- Aligned app-owned HTTP config and policies with the new contracts via type-only imports and additive metadata.
- Kept Alova, AbortController, interceptors, timeout/retry/cancel behavior, auth wiring, and UI notifications in `apps/web-demo/src/utils/http/**`.

Validation:

- `pnpm --filter @ccd/contracts build`: passed.
- `pnpm exec vitest run apps/web-demo/src/utils/http/requestLayer.spec.ts apps/web-demo/src/utils/http/policies/httpPolicies.spec.ts apps/web-demo/src/utils/http/interceptors.spec.ts apps/web-demo/src/utils/http/validation.spec.ts`: passed, 4 files and 34 tests.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm build:core`: passed.
- `pnpm api:report`: passed.
- `pnpm arch:runtime`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm governance:gate`: passed.
- `git diff --check`: passed.

Completion decision: marked `[P1-HttpContract-ContractFacets]` complete.

Residuals: `pnpm build:web-demo` emitted existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; build still passed.

### P1-UIBoundary-Validation

Start status: open.

Changed files:

- generated API/governance outputs from validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Ran section-level UI boundary validation after completing audit, policy, adapter, primitive, migration, and guard tasks.

Validation:

- `pnpm --filter @ccd/vue-ui test`: passed, 9 files and 21 tests.
- `pnpm --filter @ccd/vue-primevue-adapter test`: passed, 1 file and 11 tests.
- `pnpm --filter @ccd/web-demo exec vitest run src/plugins/modules/primevue.spec.ts`: passed, 1 file and 1 test.
- `pnpm api:report`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-UIBoundary-Validation]` complete.

Residuals: `pnpm build:web-demo` emitted existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; build still passed.

### P1-UIBoundary-Guard

Start status: open.

Changed files:

- `scripts/architecture/primevue-boundary-policy.mjs`
- `scripts/architecture/primevue-boundary-policy.spec.ts`
- `scripts/ai-architecture-guard.mjs`
- generated architecture guard/API/governance outputs from validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Moved PrimeVue reference extraction and allowlist classification into the policy module so the rule is directly testable.
- Extended extraction to catch side-effect imports such as `import 'primevue/...'`.
- Wired `scripts/ai-architecture-guard.mjs` through the shared classifier while preserving generated registry classification from raw file content.
- Added focused coverage for side-effect/static/re-export/dynamic PrimeVue references, forbidden direct app imports, allowed adapter imports, allowed `vue-ui` internal composition, and blocked raw `vue-ui` public re-exports.

Validation:

- `pnpm exec vitest run scripts/architecture/primevue-boundary-policy.spec.ts`: passed, 1 file and 7 tests.
- `pnpm ai:guard`: passed.
- `pnpm api:report`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-UIBoundary-Guard]` complete.

Residuals: `pnpm build:web-demo` emitted existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; build still passed.

### P1-UIBoundary-Migrate

Start status: open.

Changed files:

- generated architecture guard/API/governance outputs from validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Verified the approved PrimeVue integration migration is already present: web and desktop bootstrap install through adapter-owned `installPrimeVueRuntime()`, app bootstrap files have no raw PrimeVue imports, and `PRIME_DIALOG_RUNTIME_CONFIG_KEY` remains app-owned per D-020.
- No source migration was applied because moving the dialog runtime provide into `@ccd/vue-primevue-adapter` would create an inappropriate adapter dependency on `@ccd/vue-ui` and conflict with the owner-decision evidence.

Validation:

- Raw PrimeVue bootstrap import scan for `apps/web-demo/src/plugins/modules/primevue.ts` and `apps/desktop/src/plugins/index.ts`: passed, no matches.
- `pnpm --filter @ccd/vue-primevue-adapter test`: passed, 1 file and 11 tests.
- `pnpm --filter @ccd/web-demo exec vitest run src/plugins/modules/primevue.spec.ts`: passed, 1 file and 1 test.
- `pnpm --filter @ccd/vue-primevue-adapter build`: passed.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm ai:guard`: passed.
- `pnpm api:report`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-UIBoundary-Migrate]` complete.

Residuals: `pnpm build:web-demo` emitted existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; build still passed.

### P1-UIBoundary-Primitives

Start status: open.

Changed files:

- `packages/vue-ui/src/CcdPrimeControls/index.ts`
- `packages/vue-ui/src/index.ts`
- generated API/governance outputs from validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Changed CCD PrimeVue wrapper exports to a CCD-owned public `CcdPrimeControl` component type instead of inheriting raw PrimeVue declaration types.
- Added CCD-owned overlay expose contracts for `toggle`, `show`, `hide`, and anchored overlay instance fields used by forwarded overlay primitives.
- Re-exported the CCD-owned primitive and overlay contract types from `@ccd/vue-ui`.

Validation:

- `pnpm --filter @ccd/vue-ui exec vitest run src/CcdPrimeControls/CcdTag.spec.ts`: passed, 1 file and 2 tests.
- `pnpm --filter @ccd/vue-ui type-check`: passed.
- `pnpm --filter @ccd/vue-ui build`: passed.
- `rg -n "primevue/|@primevue/core" packages/vue-ui/dist/CcdPrimeControls/index.d.ts packages/vue-ui/dist/index.d.ts; test $? -eq 1`: passed, no raw PrimeVue declaration leaks.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm api:report`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-UIBoundary-Primitives]` complete.

Residuals: `pnpm build:web-demo` emitted existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; build still passed.

### P1-ProTable-Exports

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Validation:

- `rg -n "useProTableInfiniteScroll|UseProTableInfiniteScroll|PRO_TABLE_URL_SYNC_ADAPTER_KEY|UseProTableUrlSync" packages/vue-ui/src/ProTable/index.ts packages/vue-ui/src/index.ts packages/vue-ui/dist/ProTable/index.d.ts packages/vue-ui/dist/index.d.ts`: passed; source and generated declarations expose the package-owned helper and URL sync adapter types/key.
- `rg -n "export function useProTableUrlSync|PRO_TABLE_URL_SYNC_ADAPTER_KEY|app.provide\\(PRO_TABLE_URL_SYNC_ADAPTER_KEY" apps/web-demo/src/hooks/modules/useProTableUrlSync.ts apps/web-demo/src/plugins/modules/protable.ts packages/vue-ui/src/ProTable/engine/hooks/useProTableUrlSync.ts`: passed; app URL sync runtime remains app-owned and injected through the package adapter key.
- `pnpm --filter @ccd/vue-ui build`: passed.
- `pnpm --filter @ccd/web-demo type-check`: initial parallel run failed due the same `@ccd/vue-ui dist` race; sequential rerun passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-ProTable-Exports]` complete.

Residuals: avoid running app type-check in parallel with package builds that remove `dist`.

### P1-ProTable-Validation

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Validation:

- `pnpm --filter @ccd/vue-ui build`: passed.
- `pnpm --filter @ccd/vue-ui exec vitest run src/ProTable/engine/core/TableController.spec.ts src/ProTable/engine/config/apiAdapter.spec.ts`: passed, 2 files and 7 tests.
- `pnpm --filter @ccd/web-demo exec vitest run src/hooks/modules/useProTableUrlSync.spec.ts`: passed, 1 file and 4 tests.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm e2e:smoke`: passed, 10 Playwright tests.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-ProTable-Validation]` complete.

Residuals:

- `pnpm build:web-demo` emitted existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; build still passed.
- `pnpm e2e:smoke` emitted `NO_COLOR`/`FORCE_COLOR` warnings from the web server/test workers; all tests passed.

### P1-Capability-Model

Start status: open.

Changed files:

- `packages/contracts/src/runtime.ts`
- `packages/contracts/src/index.ts`
- `packages/core/src/index.ts`
- `apps/desktop/src/adapters/index.ts`
- `apps/web-demo/src/adapters/runtime.adapter.ts`
- generated governance outputs from `pnpm api:report`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added `RuntimeCapabilities` and related runtime adapter contracts for browser, desktop, storage, network, filesystem, shell, notifications, clipboard, and external navigation under `@ccd/contracts`.
- Updated `@ccd/core` to extend the runtime capability contract while remaining runtime-neutral.
- Added app-owned browser runtime capability assembly in `apps/web-demo/src/adapters/runtime.adapter.ts`.
- Added the desktop runtime descriptor in `apps/desktop/src/adapters/index.ts` while keeping Tauri imports inside the desktop adapter boundary.

Validation:

- `pnpm --filter @ccd/contracts build`: passed.
- `pnpm --filter @ccd/core build`: passed.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm --filter @ccd/desktop type-check`: passed.
- `pnpm sync:desktop-config`: passed.
- `pnpm check:drift`: passed.
- `pnpm arch:runtime`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm api:report`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:desktop`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-Capability-Model]` complete.

Residuals: none.

### P1-Boundary-Tests

Start status: open.

Changed files:

- `.dependency-cruiser.cjs`
- `scripts/architecture/shared-placement-rules.mjs`
- `scripts/architecture/shared-placement-rules.spec.ts`
- `scripts/architecture/validate-boundaries.mjs`
- generated governance outputs from `pnpm api:report` and `pnpm governance:gate`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a shared-placement boundary classifier for app-local theme/tokens, hooks, utils, i18n, request, and services imports.
- Added direct runtime import ownership checks for UnoCSS and Alova request runtime imports.
- Wired the classifier into `scripts/architecture/validate-boundaries.mjs` for apps, packages, and root tooling.
- Added dependency-cruiser enforcement that shared packages must not import app internals.
- Added focused Vitest coverage for alias normalization, allowed app-owned imports, blocked package/tooling imports, UnoCSS ownership, and request-runtime ownership.

Validation:

- `pnpm exec vitest run scripts/architecture/shared-placement-rules.spec.ts`: passed, 1 file and 5 tests.
- `pnpm arch:boundaries`: passed.
- `pnpm arch:runtime`: passed.
- `pnpm api:report`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-Boundary-Tests]` complete.

Residuals: none.

### P1-Package-Surfaces

Start status: open.

Changed files:

- `scripts/architecture/package-surface-rules.mjs`
- `scripts/architecture/package-surface-rules.spec.ts`
- `scripts/architecture/validate-boundaries.mjs`
- generated package `dist/**` outputs from `pnpm ci:prepare-internal`
- generated governance outputs from `pnpm governance:gate`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added package public-surface validation for explicit `src/index.ts` ownership and `./dist/**` package export targets.
- Added cross-workspace package-internal import classification for relative or path-based `packages/*/src/**` imports.
- Wired package-surface checks into `scripts/architecture/validate-boundaries.mjs`.
- Added focused Vitest coverage for export target traversal, dist-backed manifests, invalid src-backed manifests, and cross-workspace source import blocking.

Validation:

- `pnpm exec vitest run scripts/architecture/package-surface-rules.spec.ts`: passed, 1 file and 4 tests.
- `pnpm arch:boundaries`: passed.
- `pnpm ci:prepare-internal`: passed.
- `pnpm ci:smoke:packages`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-Package-Surfaces]` complete.

Residuals: `pnpm build:web-demo` emitted existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; build still passed.

### P1-UIBoundary-Audit

Start status: open.

Changed files:

- `.ai/runtime/primevue-direct-import-audit.md`
- generated architecture guard/API/governance outputs from validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Audited direct `primevue/*`, `primevue`, and `@primevue/*` imports in `apps/web-demo/**`, `apps/desktop/**`, and `packages/vue-ui/**`.
- Recorded the audit in `.ai/runtime/primevue-direct-import-audit.md` for the following UI boundary tasks.

Audit result:

- `apps/desktop/**`: 0 direct PrimeVue source imports.
- `apps/web-demo/**`: 1 governed build resolver import in `apps/web-demo/build/resolvers/primevue.ts`; generated component registry imports in `apps/web-demo/src/types/components.d.ts`.
- `packages/vue-ui/**`: 25 source files with 62 direct PrimeVue import lines, all inside package internals; `pnpm ai:guard` found no raw PrimeVue public re-export.

Validation:

- Direct import inventory via `rg`: passed.
- `pnpm ai:guard`: passed.
- `pnpm api:report`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-UIBoundary-Audit]` complete.

Residuals: no focused UI smoke test was run because this task changed no UI implementation.

### P1-UIBoundary-Policy

Start status: open.

Changed files:

- `scripts/architecture/primevue-boundary-policy.mjs`
- `scripts/architecture/primevue-boundary-policy.spec.ts`
- `scripts/ai-architecture-guard.mjs`
- `.ai/runtime/primevue-boundary-policy.md`
- generated API/governance outputs from validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Defined the PrimeVue boundary policy in `scripts/architecture/primevue-boundary-policy.mjs`.
- Documented that app bootstrap/plugin files route through `@ccd/vue-primevue-adapter` and `@ccd/vue-ui`, with raw app PrimeVue imports forbidden except governed build/generated boundaries.
- Refactored `scripts/ai-architecture-guard.mjs` to consume the shared policy module without changing current guard behavior.
- Added focused policy tests for raw module detection, empty app allowlist, governed build/generated exceptions, and package ownership paths.

Validation:

- `pnpm exec vitest run scripts/architecture/primevue-boundary-policy.spec.ts`: passed, 1 file and 4 tests.
- `pnpm ai:guard`: passed.
- `pnpm api:report`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-UIBoundary-Policy]` complete.

Residuals: no focused UI smoke test was run because this task changed no UI implementation.

### P1-UIBoundary-Adapter

Start status: open.

Changed files:

- `apps/web-demo/src/plugins/modules/primevue.spec.ts`
- `packages/vue-primevue-adapter/src/services.spec.ts`
- generated API/governance outputs from validation
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Narrowed the web-demo PrimeVue plugin test so app code verifies adapter invocation and dialog runtime provide wiring instead of duplicating adapter-owned PrimeVue theme/PT/service config.
- Added adapter-side coverage proving `createPrimeVueAdapterConfig()` owns theme, PassThrough, runtime options, ripple, and locale config.

Validation:

- `pnpm --filter @ccd/vue-primevue-adapter test`: passed, 1 file and 11 tests.
- `pnpm --filter @ccd/web-demo exec vitest run src/plugins/modules/primevue.spec.ts`: passed, 1 file and 1 test.
- `pnpm --filter @ccd/vue-primevue-adapter type-check`: passed.
- `pnpm --filter @ccd/vue-primevue-adapter build`: passed.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm api:report`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P1-UIBoundary-Adapter]` complete.

Residuals: `pnpm build:web-demo` emitted existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; build still passed.

### P2-Turbo-RemoveDuplicatePrebuild

Start status: open.

Changed files:

- `apps/web-demo/package.json`
- `apps/desktop/package.json`
- `package.json`
- generated governance outputs from `pnpm governance:gate`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Removed duplicated app-local `prebuild` lifecycle scripts from `@ccd/web-demo` and `@ccd/desktop`.
- Updated root `build:web-demo` and `build:desktop` wrappers to call Turbo dependency-inclusive filters so app builds still include their internal workspace package dependencies.

Validation:

- Package script scan: passed; root, web-demo, and desktop package scripts no longer define `prebuild`.
- `pnpm exec turbo run build --filter='@ccd/web-demo...' --dry=json`: passed; selected `@ccd/web-demo#build` plus internal package dependency builds.
- `pnpm exec turbo run build --filter='@ccd/desktop...' --dry=json`: passed; selected `@ccd/desktop#build` plus internal package dependency builds.
- `pnpm ci:clean-artifacts`: passed before each clean app wrapper build.
- `pnpm build:web-demo`: passed from a clean artifact state.
- `pnpm build:desktop`: passed from a clean artifact state.
- `pnpm ci:prepare-internal`: passed.
- `pnpm ci:smoke:packages`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:ci`: first run failed only because governance generated command-owned outputs; `pnpm governance:gate` stabilized them and passed; rerun `pnpm build:ci` passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P2-Turbo-RemoveDuplicatePrebuild]` complete.

Residuals:

- Root wrappers now own clean app dependency builds; direct package-local `pnpm --filter @ccd/web-demo build` and `pnpm --filter @ccd/desktop build` are no longer the self-sufficient clean checkout entrypoints after prebuild removal.
- `pnpm build:web-demo` and `pnpm build:ci` still emit existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; builds pass.

### P2-Turbo-BuildFailureOutput

Start status: open.

Changed files:

- `scripts/exec.sh`
- `package.json`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Updated `scripts/exec.sh` to preserve the wrapped command exit code while printing a labeled failing phase, command label, exit code, and optional next-step hint.
- Added phase labels and hints to root package scripts that build internal packages before app builds: `ci:prepare-internal`, `build:web-demo`, `build:desktop`, and the first package-prepare phase in `build:ci`.

Validation:

- `bash -n scripts/exec.sh`: passed.
- Package script scan: passed; relevant build scripts include `CCD_EXEC_PHASE` and `bash scripts/exec.sh`.
- Intentional wrapper failure probe `CCD_EXEC_PHASE='validation failure phase' CCD_EXEC_HINT='validation hint' bash scripts/exec.sh node -e 'process.exit(7)'`: produced `[FAIL] validation failure phase`, exit code `7`, and `[NEXT] validation hint`; nonzero exit was expected.
- `pnpm env:doctor`: passed with one existing mise shim PATH precedence warning.
- `pnpm ci:clean-artifacts`: passed before each clean app wrapper build.
- `pnpm build:web-demo`: passed from a clean artifact state through the labeled wrapper.
- `pnpm build:desktop`: passed from a clean artifact state through the labeled wrapper.
- `pnpm ci:prepare-internal`: passed through the labeled package-build wrapper.
- `pnpm ci:smoke:packages`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:ci`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P2-Turbo-BuildFailureOutput]` complete.

Residuals:

- Failure-output behavior was validated with a synthetic failing command rather than by intentionally breaking a workspace package build.
- `pnpm build:web-demo` and `pnpm build:ci` still emit existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; builds pass.

### P2-Turbo-WorkspaceWrappers

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- No additional code edit was required for this task. Root `build:web-demo` and `build:desktop` wrappers already call dependency-inclusive Turbo filters from the preceding `P2-Turbo-RemoveDuplicatePrebuild`/`P2-Turbo-BuildFailureOutput` work.
- Verified the wrappers are rooted in `package.json`, use `bash scripts/exec.sh`, and select `@ccd/web-demo...` / `@ccd/desktop...` so internal package dependencies build with the app target.

Validation:

- Root wrapper script scan: passed.
- `pnpm exec turbo run build --filter='@ccd/web-demo...' --dry=json`: passed; selected `@ccd/web-demo#build` plus internal package dependency builds.
- `pnpm exec turbo run build --filter='@ccd/desktop...' --dry=json`: passed; selected `@ccd/desktop#build` plus internal package dependency builds.
- `pnpm build:web-demo`: passed.
- `pnpm build:desktop`: passed.
- `pnpm build:ci`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P2-Turbo-WorkspaceWrappers]` complete.

Residuals: `pnpm build:web-demo` and `pnpm build:ci` still emit existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; builds pass.

### P2-Shared-Dedupe

Start status: open.

Changed files:

- `packages/shared-utils/src/consoleLogger.ts`
- `packages/shared-utils/src/consoleLogger.spec.ts`
- `packages/shared-utils/src/index.ts`
- `apps/web-demo/src/adapters/logger.adapter.ts`
- `apps/desktop/src/adapters/index.ts`
- generated API/governance outputs from `pnpm api:report` and `pnpm governance:gate`
- generated package `dist/**` outputs from clean package/app builds
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a runtime-neutral `createConsoleLogger()` helper in `@ccd/shared-utils`.
- Replaced duplicated console-backed logger implementations in the web-demo and desktop app adapters with the shared helper while keeping each app responsible for injecting `globalThis.console`.
- Kept HTTP runtime and safeStorage runtime app-owned per owner decisions.

Validation:

- `pnpm --filter @ccd/shared-utils exec vitest run src/consoleLogger.spec.ts`: failed due package-CWD test include shape; rerun with root-relative path.
- `pnpm exec vitest run packages/shared-utils/src/consoleLogger.spec.ts`: passed, 1 file and 2 tests.
- `pnpm --filter @ccd/shared-utils type-check`: passed.
- `pnpm --filter @ccd/shared-utils build`: passed.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm --filter @ccd/desktop type-check`: passed.
- `pnpm arch:runtime`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm api:report`: passed.
- `pnpm build:web-demo`: passed.
- `pnpm build:desktop`: passed.
- `pnpm type-check`: passed when rerun sequentially after avoiding concurrent artifact churn.
- `pnpm ci:smoke:packages`: passed.
- `pnpm build:ci`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P2-Shared-Dedupe]` complete.

Residuals:

- Broader shared utility, hooks, theme, i18n, charts, UnoCSS, token, metadata, and app-local boundary work remains in following ledger tasks.
- `pnpm build:web-demo` and `pnpm build:ci` still emit existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; builds pass.

### P2-Shared-Utils

Start status: open.

Changed files:

- `apps/web-demo/src/adapters/http.adapter.ts`
- `apps/web-demo/src/views/dashboard/hooks/useChartOptions.ts`
- deleted `apps/web-demo/src/utils/guards.ts`
- generated API/governance outputs from `pnpm api:report` and `pnpm governance:gate`
- generated package/app `dist/**` outputs from validation builds
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Removed the app-local `@/utils/guards` pure utility shim.
- Updated the HTTP adapter and dashboard chart options hook to consume `isRecord` directly from `@ccd/shared-utils`.
- Left app-owned HTTP, safeStorage, runtime/e2e, event bus, and date/framework integration utilities in the app; theme/device and other shared lanes remain governed by following ledger tasks.

Validation:

- `rg -n "@/utils/guards|utils/guards" apps/web-demo/src packages`: passed for the app utility path; remaining hits are the separate router-local `router/utils/guards`.
- `pnpm --filter @ccd/web-demo exec vitest run src/adapters/http.adapter.spec.ts`: passed, 1 file and 15 tests.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm arch:runtime`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm api:report`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P2-Shared-Utils]` complete.

Residuals:

- `apps/web-demo/src/utils/date/**` retains app/framework integration through dayjs locale loading and `useMitt`; it was not moved in this shared-utils task.
- `apps/web-demo/src/utils/theme/**` and `apps/web-demo/src/utils/deviceSync.ts` remain for the later theme/shared-token ledger tasks.
- `pnpm build:web-demo` still emits existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; build passes.

### P2-Shared-Hooks

Start status: open.

Changed files:

- `packages/vue-hooks/src/useTableUrlSync.ts`
- `packages/vue-hooks/src/useTableUrlSync.spec.ts`
- `packages/vue-hooks/src/index.ts`
- `packages/vue-hooks/package.json`
- `apps/web-demo/src/hooks/modules/useProTableUrlSync.ts`
- generated API/governance outputs from `pnpm api:report` and `pnpm governance:gate`
- generated package/app `dist/**` outputs from validation builds
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Moved the reusable table-state/query synchronization algorithm into `@ccd/vue-hooks` as `useTableUrlSync()`.
- Kept the app-local `useProTableUrlSync()` hook as a thin `vue-router` adapter that injects `route.query`, `router.replace()`, and `router.push()` into the shared composable.
- Avoided adding `@ccd/vue-ui` or `vue-router` dependencies to `@ccd/vue-hooks`, preserving the package dependency direction and app runtime ownership.
- Added package-level tests for default query keys, custom key/push mode, watcher cleanup, and disabled sync behavior.

Validation:

- `pnpm exec vitest run packages/vue-hooks/src/useTableUrlSync.spec.ts`: passed, 1 file and 4 tests.
- `pnpm --filter @ccd/web-demo exec vitest run src/hooks/modules/useProTableUrlSync.spec.ts`: first run failed because `@ccd/vue-hooks` resolved stale `dist` output before package rebuild; rerun after `pnpm --filter @ccd/vue-hooks build` passed.
- `pnpm --filter @ccd/vue-hooks build`: passed.
- `pnpm --filter @ccd/vue-hooks type-check`: passed.
- `pnpm --filter @ccd/web-demo exec vitest run src/hooks/modules/useProTableUrlSync.spec.ts`: passed after package rebuild, 1 file and 4 tests.
- `pnpm --filter @ccd/vue-hooks test`: passed, 6 files and 19 tests.
- `pnpm --filter @ccd/vue-ui build`: passed.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm ci:smoke:packages`: passed.
- `pnpm arch:runtime`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm api:report`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm build:ci`: first run failed only on generated governance artifact sync after the new package API appeared in generated reports; `pnpm governance:gate` regenerated/stabilized those artifacts and passed; rerun `pnpm build:ci` passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P2-Shared-Hooks]` complete.

Residuals:

- App-specific hooks for auth, HTTP, locale, date/framework integration, loading, title, menu, and theme switching remain app-owned.
- `pnpm build:web-demo` and `pnpm build:ci` still emit existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; builds pass.

### P2-Shared-Theme

Start status: open.

Changed files:

- `packages/vue-hooks/src/browserDevice.ts`
- `packages/vue-hooks/src/browserDevice.spec.ts`
- `packages/vue-hooks/src/index.ts`
- `packages/vue-hooks/package.json`
- `packages/vue-hooks/tsconfig.json`
- `apps/web-demo/src/adapters/device.adapter.ts`
- `apps/web-demo/src/utils/theme/sizeEngine.ts`
- `apps/web-demo/src/utils/theme/transitions.ts`
- `apps/web-demo/src/stores/modules/system/device.ts`
- `apps/web-demo/src/views/example/utils/device-sync.vue`
- deleted `apps/web-demo/src/utils/deviceSync.ts`
- `.ai/governance/policies/topology.json`
- `.ai/governance/policies/supply-chain.json`
- `pnpm-lock.yaml`
- generated API/governance outputs from `pnpm api:report` and `pnpm governance:gate`
- generated package/app `dist/**` outputs from validation builds
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Confirmed generic theme engine primitives already live in `@ccd/design-tokens/theme-engine`; the app-local theme engine remains a DOM application facade.
- Moved browser device, OS, breakpoint, and aggregate device-state resolution into `@ccd/vue-hooks` as pure snapshot-driven helpers.
- Kept browser runtime reads for `navigator`, `window`, and `screen` inside the web app adapter at `apps/web-demo/src/adapters/device.adapter.ts`.
- Updated theme size resolution, transitions, device store, and the device-sync example view to consume the app adapter.
- Deleted the app-local `utils/deviceSync.ts` implementation.
- Updated governance topology and supply-chain policies to allow `@ccd/vue-hooks` to depend on `@ccd/design-tokens`.

Validation:

- `pnpm exec vitest run packages/vue-hooks/src/browserDevice.spec.ts`: passed, 1 file and 2 tests.
- `pnpm --filter @ccd/design-tokens build`: passed.
- `pnpm --filter @ccd/vue-hooks build`: passed.
- `pnpm --filter @ccd/vue-hooks type-check`: passed.
- `pnpm --filter @ccd/vue-hooks test`: passed, 7 files and 21 tests.
- `pnpm --filter @ccd/web-demo exec vitest run src/utils/theme/sizeEngine.spec.ts src/stores/modules/system/device.spec.ts`: passed, 2 files and 18 tests.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm ci:smoke:packages`: passed.
- `pnpm arch:runtime`: first run failed because browser globals had been placed in `@ccd/vue-hooks`; after moving those reads into the app adapter, rerun passed.
- `pnpm arch:boundaries`: first run failed until the new `@ccd/vue-hooks` to `@ccd/design-tokens` dependency was added to topology policy; rerun passed.
- `pnpm api:report`: passed.
- `pnpm supply:check`: first run failed until the new `@ccd/vue-hooks` runtime dependency was added to supply-chain policy; rerun passed.
- `pnpm governance:gate`: first run regenerated/stabilized governance artifacts after API and policy changes; rerun passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm build:ci`: passed, 12 Turbo tasks successful.

Completion decision: marked `[P2-Shared-Theme]` complete.

Residuals:

- App-owned DOM theme application and storage/runtime integration remain app-owned by design.
- Broader i18n, charts, UnoCSS, token SSOT, metadata, and app-local boundary work remains in following ledger tasks.
- `pnpm build:web-demo` and `pnpm build:ci` still emit existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; builds pass.

### P2-Shared-I18n

Start status: open.

Changed files:

- `packages/vue-app-platform/src/i18nRuntime.ts`
- `packages/vue-app-platform/src/i18nRuntime.spec.ts`
- `packages/vue-app-platform/src/index.ts`
- `packages/vue-app-platform/package.json`
- `apps/web-demo/src/adapters/i18n.adapter.ts`
- `apps/web-demo/src/locales/index.ts`
- `.ai/governance/policies/supply-chain.json`
- `pnpm-lock.yaml`
- generated API/governance outputs from `pnpm api:report` and `pnpm governance:gate`
- generated package/app `dist/**` outputs from validation builds
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added `@ccd/vue-app-platform` i18n runtime helpers for Vue I18n creation, plugin installation, supported-locale fallback resolution, locale mutation, and injected document attribute application.
- Kept app-specific messages, supported locale data, default/fallback locale values, datetime format config, and public locale module exports inside `apps/web-demo/src/locales/**`.
- Rewired the web-demo locale entry to use the shared runtime helpers while preserving `setupI18n`, `getCurrentLocale`, `setLocale`, `t`, `d`, `n`, `messages`, and locale type exports.
- Added a web-demo i18n adapter so browser `document` access remains app-owned instead of package-owned.
- Added package tests for runtime creation/install, locale fallback/mutation, and injected document language/direction updates.
- Added `vue` and `vue-i18n` as explicit `@ccd/vue-app-platform` runtime dependencies and updated supply-chain policy accordingly.

Validation:

- `pnpm exec vitest run packages/vue-app-platform/src/i18nRuntime.spec.ts`: passed, 1 file and 3 tests.
- `pnpm --filter @ccd/vue-app-platform type-check`: initially failed on broad `vue-i18n` overload types; fixed by exposing a narrow `AppI18nRuntime` structural type, then passed.
- `pnpm --filter @ccd/vue-app-platform build`: passed.
- `pnpm --filter @ccd/web-demo exec vitest run src/stores/modules/system/locale.spec.ts src/plugins/modules/primevue.spec.ts src/plugins/setupPlugins.spec.ts src/router/modules/example.spec.ts`: passed, 4 files and 14 tests.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm --filter @ccd/vue-app-platform test`: passed, 6 files and 23 tests.
- `pnpm arch:runtime`: initially failed because the shared helper read `document`; after moving browser global access into `apps/web-demo/src/adapters/i18n.adapter.ts`, rerun passed.
- `pnpm arch:boundaries`: passed.
- `pnpm supply:check`: passed.
- `pnpm api:report`: passed.
- `pnpm ci:smoke:packages`: passed.
- `pnpm build:web-demo`: passed.
- `pnpm type-check`: first parallel run failed due concurrent package artifact churn with `build:web-demo`; rerun sequentially passed, 22 Turbo tasks successful.
- `pnpm governance:gate`: first run regenerated/stabilized API, graph, SBOM, and governance artifacts; rerun passed.
- `pnpm build:ci`: passed, including package prep, package smoke, governance gate, web-demo build, and desktop build.

Completion decision: marked `[P2-Shared-I18n]` complete.

Residuals:

- Shared i18n contracts for locale registration, message loading, fallback locale policy, and PrimeVue locale mapping remain in the next explicit ledger task.
- PrimeVue locale map stays app-local until `[P2-Shared-I18nContracts]`.
- `pnpm build:web-demo` and `pnpm build:ci` still emit existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; builds pass.

### P2-Shared-I18nContracts

Start status: open.

Changed files:

- `packages/contracts/src/i18n.ts`
- `packages/contracts/src/index.ts`
- `packages/vue-app-platform/src/i18nRuntime.ts`
- `packages/vue-app-platform/package.json`
- `apps/web-demo/src/constants/locale.ts`
- `apps/web-demo/src/locales/index.ts`
- `apps/web-demo/src/locales/primevue-locales.ts`
- `.ai/governance/policies/topology.json`
- `.ai/governance/policies/supply-chain.json`
- `pnpm-lock.yaml`
- generated API/governance outputs from `pnpm api:report` and `pnpm governance:gate`
- generated package/app `dist/**` outputs from validation builds
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added type-only shared i18n contracts in `@ccd/contracts` for locale registration, fallback policy, locale message registry, message loader, PrimeVue locale map, and aggregate i18n registration shape.
- Re-exported the contracts from the package root.
- Reused `LocaleRegistration` in `@ccd/vue-app-platform` while keeping the existing `LocaleDescriptor` public alias for compatibility.
- Typed web-demo `supportedLocales`, `messages`, default/fallback locale constants, and `PRIMEVUE_LOCALE_MAP` against the shared contracts.
- Added `@ccd/contracts` as an explicit `@ccd/vue-app-platform` workspace dependency and updated topology/supply-chain policies.
- Kept PrimeVue locale data and app message files inside `apps/web-demo/src/locales/**`.

Validation:

- `pnpm --filter @ccd/contracts type-check`: passed.
- `pnpm --filter @ccd/vue-app-platform type-check`: first run failed because the old `@ccd/contracts` dist did not yet include new i18n exports; after `pnpm --filter @ccd/contracts build`, rerun passed.
- `pnpm exec vitest run packages/vue-app-platform/src/i18nRuntime.spec.ts`: passed, 1 file and 3 tests.
- `pnpm --filter @ccd/contracts build`: passed.
- `pnpm --filter @ccd/web-demo exec vitest run src/stores/modules/system/locale.spec.ts src/plugins/modules/primevue.spec.ts src/router/modules/example.spec.ts`: passed, 3 files and 13 tests.
- `pnpm --filter @ccd/web-demo type-check`: first run found an unused leftover `LocaleDescriptor` import; after removal, rerun passed.
- `pnpm --filter @ccd/vue-app-platform build`: passed.
- `pnpm --filter @ccd/vue-app-platform test`: passed, 6 files and 23 tests.
- `pnpm arch:runtime`: passed.
- `pnpm arch:boundaries`: first run failed because topology policy was edited on the wrong package entry; after correcting `@ccd/unocss-preset` back and adding `@ccd/contracts` to `@ccd/vue-app-platform`, rerun passed.
- `pnpm supply:check`: passed.
- `pnpm api:report`: passed.
- `pnpm ci:smoke:packages`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm governance:gate`: first run regenerated/stabilized API, graph, SBOM, and governance artifacts; rerun passed.
- `pnpm build:ci`: passed, including package prep, package smoke, governance gate, web-demo build, and desktop build.

Completion decision: marked `[P2-Shared-I18nContracts]` complete.

Residuals:

- Runtime message-loading implementation remains app-owned until a future task explicitly adds lazy loading behavior.
- PrimeVue locale values remain app-owned; only their map contract is shared.
- `pnpm build:web-demo` and `pnpm build:ci` still emit existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; builds pass.

### P2-Shared-Charts

Start status: open.

Changed files:

- `packages/vue-charts/src/chartRuntime.ts`
- `packages/vue-charts/src/chartRuntime.spec.ts`
- `packages/vue-charts/src/index.ts`
- `apps/web-demo/src/views/example/components/use-echarts/configs/dynamicChartConfig.ts`
- `apps/web-demo/src/views/example/components/use-echarts/index.vue`
- generated API/governance outputs from `pnpm api:report` and `pnpm governance:gate`
- generated package/app `dist/**` outputs from validation builds
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added shared chart runtime helpers in `@ccd/vue-charts` for dynamic option refresh, polling option lifecycle, auto-highlight dispatch, chart dispatch guards, category-axis length resolution, and Vue template-ref normalization.
- Exported the new helpers from `@ccd/vue-charts`.
- Updated the web-demo `use-echarts` dynamic config to keep local demo labels, data, and ECharts option factories, while delegating timer/lifecycle/highlight runtime behavior to `@ccd/vue-charts`.
- Replaced the page-local `unwrapChartRef()` helper with the shared package helper.
- Kept static demo chart options and page-specific mixed line/bar/pie bridge behavior in the app example surface.

Validation:

- `pnpm --filter @ccd/vue-charts exec vitest run src/chartRuntime.spec.ts src/UseEcharts/echarts-render-core.spec.ts src/UseEcharts/connectGroupRegistry.spec.ts src/UseEcharts/useChartElementSize.spec.ts`: passed, 4 files and 15 tests.
- `pnpm --filter @ccd/vue-charts type-check`: first run failed because deep ECharts option refs were unwrapped by Vue `ref`; after switching package option refs to `shallowRef`, rerun passed.
- `pnpm --filter @ccd/vue-charts build`: passed.
- `pnpm --filter @ccd/web-demo exec vitest run src/router/modules/example.spec.ts`: passed, 1 file and 6 tests.
- `pnpm --filter @ccd/web-demo type-check`: first run failed because readonly demo arrays were passed into mutable ECharts option fields; after copying arrays at the app option boundary, rerun passed.
- `pnpm --filter @ccd/vue-charts test`: passed, 4 files and 15 tests.
- `pnpm arch:runtime`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm api:report`: passed.
- `pnpm supply:check`: passed.
- `pnpm build:web-demo`: passed.
- `pnpm type-check`: first parallel run failed due concurrent package artifact churn with `build:web-demo`; rerun sequentially passed, 22 Turbo tasks successful.
- `pnpm ci:smoke:packages`: passed.
- `pnpm governance:gate`: first run regenerated/stabilized API, graph, SBOM, and governance artifacts; rerun passed.
- `pnpm build:ci`: passed, including package prep, package smoke, governance gate, web-demo build, and desktop build.

Completion decision: marked `[P2-Shared-Charts]` complete.

Residuals:

- The example-specific mixed line/bar/pie DOM bridge remains app-local because it depends on demo test IDs and Vue internal exposed component lookup.
- Static chart option data remains app-local as page-specific example configuration.
- `pnpm build:web-demo` and `pnpm build:ci` still emit existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; builds pass.

### P2-Shared-UnoCSS

Start status: open.

Changed files:

- `packages/unocss-preset/src/index.ts`
- `packages/unocss-preset/src/index.spec.ts`
- `packages/unocss-preset/package.json`
- generated API/governance outputs from `pnpm api:report` and `pnpm governance:gate`
- generated package/app `dist/**` outputs from validation builds
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added typed shared UnoCSS extension options for safelist, shortcuts, rules, and theme customization.
- Added `createCcdUnoTheme()` and `mergeCcdUnoTheme()` so callers can extend the token-backed theme through the preset instead of app-local override patches.
- Preserved default preset behavior and made caller extensions append after built-ins, matching UnoCSS priority ordering.
- Added focused tests for default preservation, extension merging, root config forwarding, and recursive theme merge behavior.
- Updated the `@ccd/unocss-preset` test script so filtered package tests run the package-local spec from the monorepo root.

Validation:

- `pnpm --filter @ccd/unocss-preset type-check`: first run caught helper type-shape issues; after narrowing record casts and shortcut normalization, rerun passed.
- `pnpm exec vitest run packages/unocss-preset/src/index.spec.ts`: passed, 1 file and 5 tests.
- `pnpm --filter @ccd/unocss-preset build`: passed.
- `pnpm --filter @ccd/unocss-preset test`: first script run was a no-op due Vitest include paths from package cwd; after updating the script, rerun passed, 1 file and 5 tests.
- `pnpm api:report`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm arch:runtime`: passed.
- `pnpm supply:check`: passed.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm governance:gate`: first run regenerated/stabilized API, graph, SBOM, and governance artifacts; rerun passed.
- `pnpm ci:smoke:packages`: passed.
- `pnpm build:ci`: passed, including package prep, package smoke, governance gate, web-demo build, and desktop build.

Completion decision: marked `[P2-Shared-UnoCSS]` complete.

Residuals:

- No app config currently consumes the extension options; the task adds the governed extension path without changing runtime behavior.
- `pnpm build:web-demo` and `pnpm build:ci` still emit existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; builds pass.

### P2-Shared-TokensSSOT

Start status: open.

Changed files:

- `packages/design-tokens/src/index.ts`
- `packages/design-tokens/src/index.spec.ts`
- `packages/design-tokens/package.json`
- generated API/governance outputs from `pnpm api:report` and `pnpm governance:gate`
- generated package/app `dist/**` outputs from validation builds
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Replaced the duplicated `@ccd/design-tokens` root implementation with a barrel that re-exports the canonical token modules.
- Kept public root export names stable while sourcing colors, semantic color usage, spacing scale, breakpoints, theme presets/defaults, size presets, and responsive/device primitives from their dedicated modules.
- Added root-export parity tests proving the root package shares object/function identity with canonical module exports.
- Updated the `@ccd/design-tokens` test script so filtered package validation runs the package-local specs from the monorepo root.
- Left `uno.config.ts` unchanged because it already consumes the shared `@ccd/unocss-preset` factory and no app-local override patch was present.

Validation:

- `pnpm --filter @ccd/design-tokens type-check`: passed.
- `pnpm --filter @ccd/design-tokens test`: passed, 4 files and 14 tests.
- `pnpm --filter @ccd/design-tokens build`: passed.
- `pnpm --filter @ccd/unocss-preset type-check`: passed.
- `pnpm --filter @ccd/unocss-preset test`: passed, 1 file and 5 tests.
- `pnpm --filter @ccd/unocss-preset build`: passed.
- `pnpm validate:tokens`: passed with existing decorative contrast advisories only.
- `pnpm api:report`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm arch:runtime`: passed.
- `pnpm supply:check`: passed.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed.
- `pnpm ci:smoke:packages`: passed.
- `pnpm governance:gate`: first run regenerated/stabilized API, graph, SBOM, and governance artifacts; rerun passed.
- `pnpm build:ci`: passed, including package prep, package smoke, governance gate, web-demo build, and desktop build.

Completion decision: marked `[P2-Shared-TokensSSOT]` complete.

Residuals:

- `pnpm validate:tokens` still reports existing ignored decorative contrast advisories; the validation command exits 0.
- `pnpm build:web-demo` and `pnpm build:ci` still emit existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`; builds pass.

### P2-Shared-Metadata

Start status: open.

Changed files:

- `apps/web-demo/src/constants/brand.ts`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Verified the existing metadata lane already uses `project.config.json` as the single manual source for product metadata, release version, and governance version.
- Ran `pnpm project:sync` as the generation step for derived metadata targets: root/workspace package manifests, web brand constants, Tauri config, Cargo package metadata, release manifest, and governance version policy.
- Confirmed `apps/desktop/index.html` remains a placeholder template and desktop HTML metadata is injected from `project.config.json` by `apps/desktop/build/html.ts`.
- No new metadata architecture was added; the smallest safe completion was to validate and sync the existing governed path.

Validation:

- `pnpm project:validate`: passed.
- `pnpm project:doctor`: passed before sync.
- `pnpm project:sync`: passed, synced metadata to `1.0.38`.
- `pnpm project:doctor`: passed after sync.
- `pnpm docs:commands`: passed.
- `pnpm ai:doctor --open`: passed and listed remaining open tasks.
- `pnpm codex:preflight`: passed.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P2-Shared-Metadata]` complete.

Residuals:

- `project:sync` normalized generated `brand.ts` string quoting via `JSON.stringify`; metadata values are unchanged.
- Broader dependency and GitHub metadata-policy tasks remain separate open ledger lanes.

### P2-Shared-MetadataDrift

Start status: open.

Changed files:

- `scripts/project-config.mjs`
- `scripts/sync-version.mjs`
- `scripts/sync-desktop-config.mjs`
- `docs/en/project-metadata-contract.md`
- `docs/zh/04-project-control-center.md`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Extended project metadata drift checks to cover `apps/web-demo/index.html` title, description, and author placeholders in addition to existing package, desktop, release, and governance metadata checks.
- Made `pnpm sync:version` run `project:sync` and then fail on `project:doctor` drift.
- Made `pnpm sync:desktop-config` run `project:doctor` after desktop-scoped checks so desktop product name, identifier, version, homepage, and title drift fails the command.
- Documented the web index metadata placeholder contract in English and Chinese docs.

Validation:

- `pnpm project:validate`: passed.
- `pnpm project:doctor`: passed.
- `pnpm sync:version`: passed.
- `pnpm sync:desktop-config`: passed.
- `pnpm docs:commands`: passed.
- `pnpm governance:gate`: passed.
- `pnpm codex:preflight`: passed.
- `pnpm ai:doctor --open`: passed and listed remaining open tasks.

Completion decision: marked `[P2-Shared-MetadataDrift]` complete.

Residuals:

- No residual metadata drift found.

### P2-Shared-AppLocalBoundaries

Start status: open.

Changed files:

- `scripts/architecture/shared-placement-rules.mjs`
- `scripts/architecture/shared-placement-rules.spec.ts`
- generated API/governance outputs from `pnpm api:report` and `pnpm governance:gate`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added explicit app-local shared-placement domains for `apps/web-demo/src/router`, `apps/web-demo/src/views`, `apps/web-demo/src/stores`, and `apps/web-demo/src/plugins`.
- Kept those surfaces importable only from `apps/web-demo/src/**`, preventing shared packages and root tooling from treating web-demo route/page/store/plugin wiring as public shared package APIs.
- Added focused rule tests for allowed app-local imports and blocked package imports for each app-local surface.

Validation:

- `pnpm exec vitest run scripts/architecture/shared-placement-rules.spec.ts`: passed, 1 file and 7 tests.
- `pnpm arch:boundaries`: passed.
- `pnpm ai:guard -- --format=json`: passed.
- `pnpm arch:runtime`: passed.
- `pnpm api:report`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P2-Shared-AppLocalBoundaries]` complete.

Residuals:

- No app-local route, view, store, or plugin runtime code was moved; this task only adds guard coverage for future leakage.

### P2-Views-Split

Start status: open.

Changed files:

- `apps/web-demo/src/views/example/components/c-scrollbar/index.vue`
- `apps/web-demo/src/views/example/components/c-scrollbar/demoData.ts`
- generated API/governance outputs from `pnpm governance:gate`
- generated package/app `dist/**` outputs from validation builds
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Split the oversized `CScrollbar` example page by moving page-local mock logs, members, notifications, visibility options, and display mapping helpers into colocated `demoData.ts`.
- Kept the existing route, template structure, scroll controls, copy-to-clipboard behavior, and theme toggle behavior unchanged.
- Reduced `index.vue` from 1703 lines to a page assembly SFC focused on reactive state and interactions; the colocated data module owns the page-local mock data/types.

Validation:

- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed with existing Vite chunk warnings for `core.ts` and `BrandPanel.vue`.
- `pnpm arch:boundaries`: passed.
- `pnpm governance:gate`: passed.
- `pnpm exec vitest run apps/web-demo/src/router/modules/example.spec.ts`: passed, 1 file and 6 tests.

Completion decision: marked `[P2-Views-Split]` complete.

Residuals:

- Existing Vite chunk warnings for `apps/web-demo/src/router/modules/core.ts` and `apps/web-demo/src/views/login/components/BrandPanel.vue` remain unrelated and non-failing.
- The checked-in Playwright route smoke covers login/dashboard/not-found, not this specific example page; the route module spec and web build exercised the `CScrollbar` lazy import.

### P2-Views-Patterns

Start status: open.

Changed files:

- `apps/web-demo/src/views/example/shared/ExampleSection.vue`
- `apps/web-demo/src/views/example/utils/type-casters.vue`
- `apps/web-demo/src/views/example/utils/strings-format.vue`
- `apps/web-demo/src/views/example/utils/device-sync.vue`
- `apps/web-demo/src/views/example/utils/ids.vue`
- generated API/governance outputs from `pnpm governance:gate`
- generated package/app `dist/**` outputs from validation builds
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a shared `ExampleSection` shell for the repeated `material-elevated` example section pattern.
- Migrated four utility example pages to the shared shell without changing form inputs, computed outputs, actions, or route behavior.
- Kept the extraction app-local under `apps/web-demo/src/views/example/shared` because the pattern is example-page presentation, not a public package API.

Validation:

- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm exec vitest run apps/web-demo/src/router/modules/example.spec.ts`: passed, 1 file and 6 tests.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm arch:boundaries`: passed.
- `pnpm build:web-demo`: passed with an existing Vite chunk warning for `apps/web-demo/src/router/modules/core.ts`.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P2-Views-Patterns]` complete.

Residuals:

- Table, form, and chart-specific pattern consolidation remains a future refinement opportunity; this ledger task was completed through the repeated demo-page section shell extraction with validation.

### P2-Views-AsyncStates

Start status: open.

Changed files:

- `apps/web-demo/src/views/example/shared/AsyncStatePreview.vue`
- `apps/web-demo/src/views/example/hooks/use-http-request.vue`
- generated API/governance outputs from `pnpm governance:gate`
- generated package/app `dist/**` outputs from validation builds
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added an app-local `AsyncStatePreview` component for loading, empty, error, and content states in example data-fetching panels.
- Replaced the three raw response `<pre>` panels in the `useHttpRequest` example with the async-state preview, preserving the existing request hooks, buttons, schema validation, and error computations.
- Kept the component under `apps/web-demo/src/views/example/shared` because it is an example-view presentation pattern, not shared package API.

Validation:

- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm exec vitest run apps/web-demo/src/router/modules/example.spec.ts`: passed, 1 file and 6 tests.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm arch:boundaries`: passed.
- `pnpm build:web-demo`: passed with an existing Vite chunk warning for `apps/web-demo/src/router/modules/core.ts`.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P2-Views-AsyncStates]` complete.

Residuals:

- Other example pages can adopt `AsyncStatePreview` later, but this task now provides and validates the missing loading/empty/error state shell on a data-fetching report page.

### P2-Views-I18nCoverage

Start status: open.

Changed files:

- `apps/web-demo/src/router/modules/example.spec.ts`
- generated API/governance outputs from `pnpm governance:gate`
- generated package/app `dist/**` outputs from validation builds
- Playwright report artifacts from `pnpm e2e:smoke`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added route/i18n coverage to the existing web-demo route module smoke spec.
- Collected every registered route `meta.titleKey` from the loaded route inventory and validated each key against every locale message registry.
- Added a raw-source scan for example view page translation literals in approved locale namespaces, covering `$t(...)` usage, route-key demos, and page-owned `emptyState.*` key props without depending on runtime i18n setup.

Validation:

- `pnpm exec vitest run apps/web-demo/src/router/modules/example.spec.ts`: passed, 1 file and 7 tests.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed with the existing non-failing Vite warning for `apps/web-demo/src/router/modules/core.ts`.
- `pnpm arch:boundaries`: passed.
- `pnpm governance:gate`: passed.
- `pnpm e2e:smoke`: passed, 10 Playwright tests.

Completion decision: marked `[P2-Views-I18nCoverage]` complete.

Residuals:

- The new page-key scan intentionally covers literal locale keys in example view source; dynamic translation-key construction remains outside this deterministic test surface.

### P2-Views-RouteConstants

Start status: open.

Changed files:

- `apps/web-demo/src/constants/router.ts`
- `apps/web-demo/src/router/modules/core.ts`
- `apps/web-demo/src/router/modules/dashboard.ts`
- `apps/web-demo/src/router/utils/helper.ts`
- `apps/web-demo/src/router/utils/permission.ts`
- generated API/governance outputs from `pnpm governance:gate`
- generated package/app `dist/**` outputs from validation builds
- Playwright report artifacts from `pnpm e2e:smoke`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added typed app-shell route path/name constants for root, login, register, dashboard, error pages, and catch-all routes.
- Rewired route whitelist/error-page lists, error route records, core route records, dashboard route records, `goBack`, and permission guard redirects/comparisons to use those constants.
- Preserved route module definitions, route names, paths, redirect inventory, and auth behavior.

Validation:

- `pnpm exec vitest run apps/web-demo/src/router/modules/example.spec.ts apps/web-demo/src/router/utils/helper.spec.ts apps/web-demo/src/router/utils/moduleLoader.spec.ts`: passed, 3 files and 11 tests.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed with the existing non-failing Vite warning for `apps/web-demo/src/router/modules/core.ts`.
- `pnpm arch:boundaries`: passed.
- `pnpm e2e:smoke`: passed, 10 Playwright tests.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P2-Views-RouteConstants]` complete.

Residuals:

- Route fixture literals remain in tests, and route-module feature path definitions remain literal by design; only reused app-shell navigation strings were centralized.

### P2-Env-Schema

Start status: open.

Changed files:

- `apps/web-demo/build/utils.ts`
- `scripts/env-doctor.mjs`
- generated API/governance outputs from `pnpm governance:gate`
- generated package/app `dist/**` outputs from validation builds
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added strict Vite env schema assertions to the web-demo build wrapper for API base URL, public path, router mode, app env, compression mode, storage prefix, root redirect, port, API timeout, and proxy timeout.
- Added `env-doctor` profile checks for merged development, production, and analyze env files so `.env` plus mode-specific overrides are validated as Vite actually consumes them.
- Added desktop config validation for `apps/desktop/vite.config.ts` server port and Tauri `build.devUrl` / `frontendDist` consistency without changing the current hard-coded desktop port lane.

Validation:

- `pnpm env:doctor`: passed with the inherited node PATH precedence warning.
- `pnpm env:doctor:strict`: passed with the same inherited node PATH precedence warning.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm build:web-demo`: passed with the existing non-failing Vite warning for `apps/web-demo/src/router/modules/core.ts`.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:desktop`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P2-Env-Schema]` complete.

Residuals:

- `env:doctor:strict` still reports the existing node PATH precedence warning but exits successfully; this task added schema validation and did not alter runtime PATH policy.
- Desktop dev port is now validated for consistency, but synchronized shared config extraction remains the next ledger task.

### P2-Dev-PortSync

Start status: open.

Changed files:

- `.env`
- `apps/desktop/vite.config.ts`
- `apps/web-demo/src/types/env.d.ts`
- `scripts/env-doctor.mjs`
- `scripts/sync-desktop-config.mjs`
- generated API/governance outputs from `pnpm governance:gate`
- generated package/app `dist/**` outputs from validation builds
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added `VITE_DESKTOP_PORT=1420` as the shared desktop/Tauri dev server port in root env configuration.
- Updated the desktop Vite config to load root env files via `loadEnv`, set `envDir` to the repo root, and use `VITE_DESKTOP_PORT` for `server.port`.
- Updated `sync:desktop-config` to read the shared desktop port from `.env` plus `.env.development` and deterministically synchronize Tauri `build.devUrl` to `http://localhost:<VITE_DESKTOP_PORT>`.
- Extended `env-doctor` to require and validate `VITE_DESKTOP_PORT`, confirm desktop Vite config consumes it, and verify Tauri `devUrl` matches it.

Validation:

- `pnpm sync:desktop-config`: passed; Tauri `devUrl` was already synchronized at `http://localhost:1420`.
- `pnpm env:doctor`: passed with the inherited node PATH precedence warning.
- `pnpm env:doctor:strict`: passed with the same inherited node PATH precedence warning.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed with the existing non-failing Vite warning for `apps/web-demo/src/router/modules/core.ts`.
- `pnpm build:desktop`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P2-Dev-PortSync]` complete.

Residuals:

- `env:doctor:strict` warning is unchanged from prior tasks and remains a PATH policy issue, not a desktop port sync issue.

### P2-Vite-SharedHelpers

Start status: open.

Changed files:

- `apps/vite.shared.ts`
- `apps/web-demo/vite.config.ts`
- `apps/desktop/vite.config.ts`
- `apps/web-demo/tsconfig.json`
- `apps/desktop/tsconfig.json`
- `scripts/env-doctor.mjs`
- generated API/governance outputs from `pnpm governance:gate`
- generated package/app `dist/**` outputs from validation builds
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a shared Vite helper module for app root resolution, repo root resolution, root/app env loading, shared local dev host, and port validation.
- Rewired web-demo and desktop Vite configs to use the shared env and host helpers while preserving existing build behavior and desktop strict-port behavior.
- Added the shared helper file to both app tsconfig include lists so checked Vite configs satisfy composite TypeScript project boundaries.
- Updated `env-doctor` to enforce that desktop Vite config consumes `VITE_DESKTOP_PORT` through the shared env helper.

Validation:

- `pnpm env:doctor`: passed with the inherited node PATH precedence warning.
- `pnpm sync:desktop-config`: passed; Tauri `devUrl` was already synchronized at `http://localhost:1420`.
- `pnpm env:doctor:strict`: passed with the same inherited node PATH precedence warning.
- `pnpm type-check`: initially failed because `apps/vite.shared.ts` was outside app tsconfig include lists, then passed after adding the exact shared helper include to both app projects.
- `pnpm build:web-demo`: passed with the existing non-failing Vite warning for `apps/web-demo/src/router/modules/core.ts`.
- `pnpm build:desktop`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P2-Vite-SharedHelpers]` complete.

Residuals:

- `env:doctor:strict` warning is unchanged from prior tasks and remains a PATH policy issue, not a shared Vite helper issue.

### P2-Vite-CORS

Start status: open.

Changed files:

- `apps/vite.shared.ts`
- `apps/web-demo/vite.config.ts`
- `scripts/env-doctor.mjs`
- generated API/governance outputs from `pnpm governance:gate`
- generated package/app `dist/**` outputs from validation builds
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a shared `localViteCors` allowlist for localhost, 127.0.0.1, and `[::1]` origins.
- Replaced open `cors: true` in web-demo dev server and preview config with the restricted local-origin CORS policy.
- Added an `env-doctor` guard that fails if web-demo returns to open Vite CORS or stops using the shared restricted policy.

Validation:

- `pnpm env:doctor`: passed with the inherited node PATH precedence warning and the new web-demo Vite CORS check.
- `pnpm env:doctor:strict`: passed with the same inherited node PATH precedence warning and the new web-demo Vite CORS check.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:web-demo`: passed with the existing non-failing Vite warning for `apps/web-demo/src/router/modules/core.ts`.
- `pnpm build:desktop`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P2-Vite-CORS]` complete.

Residuals:

- The CORS allowlist intentionally permits only local browser origins; any future non-local integration will need an explicit owner-approved config lane.

### P2-Vite-BundleBudgets

Start status: open.

Changed files:

- `package.json`
- `.github/workflows/ci.yml`
- generated API/governance outputs from `pnpm governance:gate`
- regenerated package/app `dist/**` outputs from clean validation builds
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added `pnpm budget:bundles` and `pnpm budget:desktop` to the end of root `build:ci` so local CI fails after app builds if browser or desktop size budgets regress.
- Added a GitHub CI `Browser Bundle Guard` step after the production build, complementing the existing `Desktop Bundle Guard`.
- Reused the existing budget scripts and budget thresholds; no budget values were loosened.

Validation:

- `pnpm ci:clean-artifacts`: passed.
- `pnpm ci:prepare-internal`: passed from clean artifacts, 10 package builds successful.
- `pnpm ci:smoke:packages`: passed.
- `pnpm build:web-demo`: passed with the existing non-failing Vite warning for `apps/web-demo/src/router/modules/core.ts`.
- `pnpm build:desktop`: passed.
- `pnpm budget:bundles`: passed; entry JS 203.5 KiB gzip / 260 KiB budget, entry CSS 38.8 KiB / 120 KiB, vendor core 42.0 KiB / 220 KiB, vendor UI 264.0 KiB / 460 KiB, vendor heavy 380.9 KiB / 620 KiB.
- `pnpm budget:desktop`: passed; desktop dist 592204 bytes / 2500000 byte budget.
- `pnpm type-check`: passed, 22 Turbo tasks successful.
- `pnpm build:ci`: passed and ran both budget scripts after the Turbo build.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P2-Vite-BundleBudgets]` complete.

Residuals:

- The browser bundle budget depends on Vite chunk names for the existing manual chunk groups; future Vite/Rolldown changes should revisit the grouping logic in the deferred Vite major migration lane.

### P2-Vite8-Branch

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Created the local branch pointer `modernize/vite8-compat` at the current `main` HEAD without switching branches.
- Preserved the current dirty repair worktree and did not commit, push, rebase, stash, reset, clean, or rewrite history.

Validation:

- `git branch --show-current`: `main`.
- `git branch --list modernize/vite8-compat`: branch exists.
- `git rev-parse HEAD` and `git rev-parse modernize/vite8-compat`: both resolved to `692875dd84c0882c96d024913aba506a56b77ddd`.

Completion decision: marked `[P2-Vite8-Branch]` complete.

Residuals:

- The branch exists only as a local pointer. The Vite 8 migration tasks remain deferred/open on the current worktree because `.ai/runtime/owner_decisions.md` marks `Vite major migration` as `FULL_GO_DEFERRED`, and the current repair run must not mix Vite major migration with unrelated UI, HTTP, route, or governance changes.

### P2-Vite8-Inventory

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that the inventory belongs on the isolated `modernize/vite8-compat` lane.
- Did not inspect or alter Vite/Rollup/esbuild migration surfaces in the current `main` worktree, because owner decisions defer Vite major migration and the active repair run contains unrelated changes.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Vite8-Inventory]` open as owner-deferred.

Residuals:

- Future execution must switch to a clean isolated Vite 8 lane before doing the inventory.

### P2-Vite8-OptimizeDeps

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that `optimizeDeps.esbuildOptions` to Rolldown migration belongs on the isolated Vite 8 lane after inventory.
- Did not alter `apps/web-demo/vite.config.ts`, package manifests, or lockfiles.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Vite8-OptimizeDeps]` open as owner-deferred.

Residuals:

- Future execution must happen on `modernize/vite8-compat` or another clean isolated Vite major migration lane.

### P2-Vite8-Oxc

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that top-level `esbuild` to Oxc/Rolldown migration belongs on the isolated Vite 8 lane.
- Did not alter Vite config, build plugins, package manifests, or lockfiles.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Vite8-Oxc]` open as owner-deferred.

Residuals:

- Future execution must happen on a clean isolated Vite major migration lane after the Vite-specific inventory.

### P2-Vite8-Minify

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that `build.minify: 'esbuild'` and console/drop behavior must be re-evaluated with the actual Vite 8/Oxc lane.
- Did not alter minification, console/drop, debugger/drop, or build-output settings.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Vite8-Minify]` open as owner-deferred.

Residuals:

- Future execution must run against the isolated Vite 8/Oxc toolchain rather than current Vite 7 behavior.

### P2-Vite8-Chunks

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that manual chunk and small-chunk behavior must be re-tested on the isolated Vite 8/Rolldown lane.
- Did not change current `manualChunks`, `experimentalMinChunkSize`, bundle-budget thresholds, or app build config.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Vite8-Chunks]` open as owner-deferred.

Residuals:

- Future execution must compare Rolldown output against current Rollup/Vite 7 output and rerun bundle budgets on the isolated lane.

### P2-Vite8-ECharts

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that the custom `echarts-treeshake-enhance` plugin must be revalidated on the isolated Vite 8/Rolldown lane.
- Did not alter ECharts plugin code, Vite plugin order, manual chunks, or package dependencies.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Vite8-ECharts]` open as owner-deferred.

Residuals:

- Future execution must build and inspect ECharts chunks on the isolated Vite 8 lane before deciding whether the plugin remains.

### P2-Vite8-Compression

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that `vite-plugin-compression` ownership must be evaluated on the isolated Vite 8 lane with deployment/server/CDN constraints.
- Did not remove, replace, or move compression behavior in the current app build.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Vite8-Compression]` open as owner-deferred.

Residuals:

- Future execution must compare build-time compression against deployment/CDN compression policy in the isolated modernization lane.

### P2-Vite8-Progress

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that `vite-plugin-progress` value and Vite 8 compatibility must be evaluated on the isolated Vite 8 lane.
- Did not remove, replace, or reorder build plugins in the current app build.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Vite8-Progress]` open as owner-deferred.

Residuals:

- Future execution must decide plugin removal/replacement only after measuring the isolated Vite 8 build path.

### P2-Vite8-Validation

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that Vite 8 validation must run only after migration work lands on the isolated branch.
- Did not run branch-specific Vite 8 validation commands against the current non-migrated `main` worktree.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Vite8-Validation]` open as owner-deferred.

Residuals:

- Future isolated-lane validation must include `pnpm build:ci`, `pnpm vercel:build`, `pnpm e2e:qa`, and bundle-budget checks after migration changes exist.

### P2-Deps-Outdated

Start status: open.

Changed files:

- `.ai/runtime/dependency-outdated-snapshot.md`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Ran the read-only outdated dependency inventory and recorded the snapshot in `.ai/runtime/dependency-outdated-snapshot.md`.
- Did not upgrade dependencies, edit package manifests for version changes, or change `pnpm-lock.yaml`.
- Preserved owner decision scope: dependency modernization remains `FULL_GO_DEFERRED` and future upgrades must use isolated single-dependency or compatibility lanes.

Validation:

- `pnpm deps:outdated`: completed inventory and exited `1` because outdated dependencies were found, which is expected for this task.

Completion decision: marked `[P2-Deps-Outdated]` complete.

Residuals:

- Outdated packages remain intentionally unchanged.

### P2-Deps-Catalogs

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that pnpm catalogs or a dependency policy file belong to a future isolated dependency governance lane.
- Did not alter `pnpm-workspace.yaml`, `package.json`, app package manifests, package manifests, or `pnpm-lock.yaml`.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Deps-Catalogs]` open as owner-deferred.

Residuals:

- Dependency version declarations remain as-is until owner-approved modernization work resumes.

### P2-Deps-Syncpack

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that syncpack or equivalent dependency alignment checks are deferred with the dependency modernization lane.
- Did not add dependencies, package scripts, CI steps, or lockfile entries.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Deps-Syncpack]` open as owner-deferred.

Residuals:

- Dependency alignment remains governed by existing package manifests and current validation gates until a future dependency governance lane.

### P2-Deps-Dedupe

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that deduplicating Vue, Vite, TypeScript, PrimeVue, UnoCSS, and Tauri versions belongs to future isolated compatibility lanes.
- Did not alter package manifests or `pnpm-lock.yaml`.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Deps-Dedupe]` open as owner-deferred.

Residuals:

- Repeated toolchain version declarations remain intentionally unchanged.

### P2-Deps-VersionRangePolicy

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that dependency version range policy changes require a future governance lane with manifest and lockfile review.
- Did not change dependency ranges, package manifests, or `pnpm-lock.yaml`.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Deps-VersionRangePolicy]` open as owner-deferred.

Residuals:

- Current range/pinning policy remains unchanged.

### P2-Deps-RuntimeStack

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that Vue runtime ecosystem upgrades require future isolated compatibility lanes and full app validation.
- Did not upgrade Vue, Vue Router, Vue I18n, Pinia, UnoCSS, runtime plugins, manifests, or lockfile entries.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Deps-RuntimeStack]` open as owner-deferred.

Residuals:

- Runtime dependency versions remain unchanged.

### P2-Deps-Vueuse

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that `@vueuse/core` upgrade requires an isolated compatibility lane with hook and auto-import checks.
- Did not alter `@vueuse/core`, auto-import configuration, manifests, or lockfile entries.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Deps-Vueuse]` open as owner-deferred.

Residuals:

- `@vueuse/core` remains unchanged.

### P2-Deps-VueTooling

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that Vue compiler, `vue-tsc`, `@vue/tsconfig`, TypeScript, and Vite Vue plugin alignment requires an isolated compatibility lane and must not mix with Vite 8.
- Did not alter Vue tooling dependencies, TypeScript, manifests, or lockfile entries.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Deps-VueTooling]` open as owner-deferred.

Residuals:

- Vue tooling versions remain unchanged.

### P2-Deps-ESLint

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that ESLint ecosystem upgrades require an isolated lint/tooling lane with deterministic `lint:check` validation.
- Did not alter ESLint packages, lint config, package manifests, or lockfile entries.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Deps-ESLint]` open as owner-deferred.

Residuals:

- ESLint ecosystem versions remain unchanged.

### P2-Deps-PrimeVue

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that PrimeVue upgrades require an isolated UI adapter lane with API and adapter behavior checks.
- Did not alter PrimeVue packages, adapter code, package manifests, or lockfile entries.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Deps-PrimeVue]` open as owner-deferred.

Residuals:

- PrimeVue ecosystem versions remain unchanged.

### P2-Deps-Alova

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that alova upgrades require an isolated HTTP runtime lane with request tests and adapter contract validation.
- Did not alter alova, HTTP runtime code, package manifests, or lockfile entries.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Deps-Alova]` open as owner-deferred.

Residuals:

- Alova version and app-owned HTTP runtime behavior remain unchanged.

### P2-Deps-Playwright

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that Playwright upgrades require an isolated test tooling lane and CI browser install/cache validation.
- Did not alter Playwright packages, browser cache behavior, CI setup, manifests, or lockfile entries.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Deps-Playwright]` open as owner-deferred.

Residuals:

- Playwright version and current CI browser assumptions remain unchanged.

### P2-Deps-Tauri

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that Tauri JS/Rust version synchronization requires an isolated desktop dependency lane with desktop build and security validation.
- Did not alter Tauri JS packages, Rust `tauri`/`tauri-build`, Cargo files, manifests, or lockfiles.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Deps-Tauri]` open as owner-deferred.

Residuals:

- Tauri JS and Rust dependency versions remain unchanged.

### P2-Deps-Scanning

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that automated pnpm/Cargo outdated and vulnerability scanning requires a future dependency governance lane and CI scope approval.
- Did not add scanners, package scripts, CI steps, or new dependencies.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Deps-Scanning]` open as owner-deferred.

Residuals:

- Existing supply-chain validation remains unchanged; new dependency scanning policy remains future work.

### P2-Deps-UnusedAudit

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that unused/demo-only dependency removal requires a future import-audit lane with manifest and lockfile review.
- Did not remove dependencies, change imports, edit manifests, or change `pnpm-lock.yaml`.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Deps-UnusedAudit]` open as owner-deferred.

Residuals:

- Potential unused or demo-only dependency cleanup remains future work.

### P2-Deps-Validation

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open ledger note explaining that dependency-lane validation is not meaningful until an isolated dependency modernization lane is actually executed.
- Did not run `pnpm validate` as dependency-lane validation for non-existent upgrade changes.

Validation:

- Ledger note added in `.ai/runtime/repair_list.md`.

Completion decision: left `[P2-Deps-Validation]` open as owner-deferred.

Residuals:

- Future dependency lanes must run targeted validation first, then `pnpm validate` when practical.

### P2-CSS-PxToRemAudit

Start status: open.

Changed files:

- `.ai/runtime/css-pxtorem-audit.md`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Audited the current `postcss-pxtorem` build-only configuration and recorded the result in `.ai/runtime/css-pxtorem-audit.md`.
- Confirmed file-level exclusions protect generated UnoCSS CSS and third-party package CSS.
- Confirmed authored `.vue` / `.scss` / `.css` files still contain fixed geometry requiring build-time conversion, while TS/TSX pixel strings and UnoCSS arbitrary classes are outside PostCSS conversion.

Validation:

- `rg` audit for literal `px` in authored `.vue` / `.scss` / `.css`: 29 files.
- `rg` audit for literal `px` in `.ts` / `.tsx`: 12 files.

Completion decision: marked `[P2-CSS-PxToRemAudit]` complete.

Residuals:

- Token-first migration remains open for authored styles and runtime sizing strings.

### P2-CSS-TokenFirst

Start status: open.

Changed files:

- `.ai/runtime/css-pxtorem-audit.md`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Recorded the token-first status in `.ai/runtime/css-pxtorem-audit.md`.
- Confirmed current config keeps generated UnoCSS CSS outside global px-to-rem conversion through file-level excludes.
- Preserved current authored CSS conversion behavior for fixed app geometry; did not disable pxtorem globally.

Validation:

- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm build:web-demo`: passed with the existing non-failing Vite warning for `apps/web-demo/src/router/modules/core.ts`.

Completion decision: marked `[P2-CSS-TokenFirst]` complete.

Residuals:

- Further token-first cleanup is incremental authored-style migration, not required for this guard-level task.

### P2-CSS-BlacklistRisk

Start status: open.

Changed files:

- `.ai/runtime/css-pxtorem-audit.md`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Recorded the current selector blacklist risk posture in `.ai/runtime/css-pxtorem-audit.md`.
- Confirmed generated CSS and third-party package CSS are protected by file-level excludes rather than a long selector blacklist.
- Confirmed the remaining selector blacklist is limited to root selectors, non-PrimeVue third-party compatibility prefixes, and explicit `no-rem` opt-out.

Validation:

- Existing web-demo validation from the CSS audit boundary passed: `pnpm --filter @ccd/web-demo type-check` and `pnpm build:web-demo`.

Completion decision: marked `[P2-CSS-BlacklistRisk]` complete.

Residuals:

- Future generated CSS sources should be added to file-level excludes, not selector blacklist entries.

### P2-CSS-PrimeVue

Start status: open.

Changed files:

- `.ai/runtime/css-pxtorem-audit.md`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Recorded the PrimeVue and third-party CSS px-to-rem boundary in `.ai/runtime/css-pxtorem-audit.md`.
- Confirmed package CSS from `primevue`, `@primevue/*`, and `@primeuix/*` remains protected by the `node_modules` file-level exclude.
- Confirmed `apps/web-demo/src/assets/styles/custom-primevue.scss` remains app-authored override CSS and should not be excluded as third-party CSS.

Validation:

- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm build:web-demo`: passed with the existing non-failing Vite warning for `apps/web-demo/src/router/modules/core.ts`.

Completion decision: marked `[P2-CSS-PrimeVue]` complete.

Residuals:

- Future package/generated CSS sources should use file-level excludes; broad `.p-*` selector blacklists remain intentionally avoided.

### P2-CSS-Mobile

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Validated existing mobile and iPadOS layout geometry after the CSS audit tasks.
- No runtime CSS changes were required for this task.

Validation:

- `pnpm e2e:layout`: failed overall because `deep business route refresh does not expose not-found title during stabilization` observed transient title `页面未找到 - CCD`; all iPhone and iPadOS layout geometry tests in that run passed.
- `pnpm exec playwright test e2e/layout-runtime-geometry.spec.ts --grep "layout runtime geometry — iPhone|layout runtime geometry — iPadOS" --workers=2`: passed, 6 tests.

Completion decision: marked `[P2-CSS-Mobile]` complete because the mobile/safe-area validation objective passed on the focused matrix.

Residuals:

- Broader `pnpm e2e:layout` still has an unrelated title-stabilization failure in `e2e/layout-runtime-geometry.spec.ts:787`.

### P2-CSS-Validation

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`
- `output/playwright/p2-css-login.png`
- `output/playwright/p2-css-dashboard.png`
- `output/playwright/p2-css-pro-table-basic.png`
- `output/playwright/p2-css-charts.png`

Implementation:

- Ran existing visual regression coverage for dashboard, login route geometry, and visual token states.
- Captured route screenshots for `/login`, `/dashboard`, `/example/primevue-collection/pro-table/basic`, and `/example/charts` under the e2e visual mode.
- Stopped the temporary Vite server after screenshot capture.

Validation:

- `pnpm e2e:visual`: passed, 4 tests.
- Temporary Playwright screenshot script: passed and wrote 4 route screenshots under `output/playwright/`.
- `sips -g pixelWidth -g pixelHeight output/playwright/p2-css-*.png`: confirmed each screenshot is `1280x720`.

Completion decision: marked `[P2-CSS-Validation]` complete.

Residuals:

- Screenshot artifacts are local validation output only.

### P2-Governance-Generated

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Confirmed this task is a generated-artifact discipline check, not a manual generated-file edit.
- Did not hand-edit `docs/generated/**`, `.ai/generated/**`, or `.ai/governance/api-snapshots/**`.
- Noted that currently dirty generated outputs remain command-owned and are handled by the following `P2-Governance-Refresh` task.

Validation:

- `git status --short docs/generated .ai/generated .ai/governance/api-snapshots ...`: completed; generated outputs are dirty but were not manually edited for this task.

Completion decision: marked `[P2-Governance-Generated]` complete.

Residuals:

- Generated governance outputs still need deterministic refresh/gate validation in the next ledger tasks.

### P2-Governance-Refresh

Start status: open.

Changed files:

- `.ai/generated/governance-report.json`
- `docs/generated/api-surface-report.json`
- `docs/generated/api-surface-report.md`
- `docs/generated/governance-report.md`
- `docs/generated/graphs/**`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Regenerated governance outputs through the official `pnpm governance:refresh` command.
- Did not manually edit generated governance artifacts.

Validation:

- `pnpm governance:refresh`: passed.

Completion decision: marked `[P2-Governance-Refresh]` complete.

Residuals:

- `P2-Governance-Gate` remains to validate the refreshed generated state.

### P2-Governance-Gate

Start status: open.

Changed files:

- `.ai/generated/governance-report.json`
- `docs/generated/api-surface-report.json`
- `docs/generated/governance-report.md`
- `docs/generated/graphs/**`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Ran the unified governance gate after generated refresh.
- Allowed generated governance outputs to be regenerated only through gate-owned commands.

Validation:

- `pnpm governance:gate`: passed.

Completion decision: marked `[P2-Governance-Gate]` complete.

Residuals:

- None for the governance gate task.

### P2-Governance-DocsCommands

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Ran the documentation command-reference validator as a standalone task check.

Validation:

- `pnpm docs:commands`: passed, 407 files scanned.

Completion decision: marked `[P2-Governance-DocsCommands]` complete.

Residuals:

- None.

### P2-Governance-ProjectDoctor

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Ran project metadata doctor after governance/generated work.

Validation:

- `pnpm project:doctor`: passed; all project metadata fields reported `ok`.

Completion decision: marked `[P2-Governance-ProjectDoctor]` complete.

Residuals:

- None.

### P2-GitHub-BranchProtection

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open note documenting that branch protection and remote repository settings are not authorized in this program.
- Did not call GitHub APIs and did not mutate remote repository settings.

Validation:

- Owner decision evidence: `.ai/runtime/owner_decisions.md` marks `GitHub branch protection / required checks` as `FULL_GO_DEFERRED`.

Completion decision: left `[P2-GitHub-BranchProtection]` open as owner/operator-deferred.

Residuals:

- Branch protection remains future operator-owned work.

### P2-GitHub-RequiredChecks

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open note documenting that remote required-check enforcement is blocked by the current owner decision.
- Did not mutate remote GitHub settings.

Validation:

- Owner decision evidence: `.ai/runtime/owner_decisions.md` marks `GitHub branch protection / required checks` as `FULL_GO_DEFERRED`.

Completion decision: left `[P2-GitHub-RequiredChecks]` open as owner/operator-deferred.

Residuals:

- Required checks remain future operator-owned branch-protection work.

### P2-GitHub-CIJobs

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open note explaining that `.github/workflows/**` CI job expansion is not authorized in this program.
- Did not mutate `.github/workflows/**` for this task.

Validation:

- Owner decision evidence: `.ai/runtime/owner_decisions.md` marks `GitHub branch protection / required checks` as `FULL_GO_DEFERRED` and disallows `.github/**` mutation.
- Existing local governance evidence: `pnpm governance:gate` passed in `P2-Governance-Gate`.

Completion decision: left `[P2-GitHub-CIJobs]` open as owner/operator-deferred.

Residuals:

- CI job expansion remains future operator-approved GitHub governance work.

### P2-GitHub-Codeowners

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open note explaining that `.github/CODEOWNERS` expansion is not authorized in this program.
- Did not mutate `.github/CODEOWNERS`.

Validation:

- Owner decision evidence: `.ai/runtime/owner_decisions.md` marks `GitHub branch protection / required checks` as `FULL_GO_DEFERRED` and disallows `.github/**` mutation.
- Existing inventory evidence: `.github/CODEOWNERS` exists and `pnpm governance:gate` validates it as a governance asset.

Completion decision: left `[P2-GitHub-Codeowners]` open as owner/operator-deferred.

Residuals:

- CODEOWNERS expansion remains future operator-approved GitHub governance work.

### P2-GitHub-Templates

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open note explaining that PR and issue template refinements are not authorized in this program.
- Did not mutate `.github/PULL_REQUEST_TEMPLATE.md` or `.github/ISSUE_TEMPLATE/**`.

Validation:

- Owner decision evidence: `.ai/runtime/owner_decisions.md` marks `GitHub branch protection / required checks` as `FULL_GO_DEFERRED` and disallows `.github/**` mutation.

Completion decision: left `[P2-GitHub-Templates]` open as owner/operator-deferred.

Residuals:

- PR/issue template refinements remain future operator-approved GitHub governance work.

### P2-GitHub-Release

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Validated release governance alignment locally without mutating `.github/**` or remote settings.

Validation:

- `pnpm release:governance`: passed.
- Prior supporting validation: `pnpm project:doctor` passed in `P2-Governance-ProjectDoctor`.

Completion decision: marked `[P2-GitHub-Release]` complete.

Residuals:

- None for local release governance alignment.

### P2-GitHub-Dependencies

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a deferred/open note explaining that dependency update policy automation is blocked by the current dependency modernization and GitHub governance owner decisions.
- Did not run `pnpm up --latest`, did not mutate package manifests, and did not change `pnpm-lock.yaml` for this task.

Validation:

- Owner decision evidence: `.ai/runtime/owner_decisions.md` marks `Dependency modernization` as `FULL_GO_DEFERRED` and GitHub branch protection / required-check governance as `FULL_GO_DEFERRED`.

Completion decision: left `[P2-GitHub-Dependencies]` open as owner/operator-deferred.

Residuals:

- Dependency update policy automation remains future owner/operator-approved work.

## P2 Boundary Validation

Changed files:

- `.ai/runtime/autonomous-repair-progress.md`
- Generated governance outputs refreshed by `pnpm governance:gate` / `pnpm build:ci`.

Validation:

- `pnpm ai:doctor`: passed; token contrast validation emitted existing decorative contrast advisories only.
- `pnpm codex:preflight`: passed; token contrast validation emitted existing decorative contrast advisories only.
- `pnpm type-check`: passed, 22 tasks.
- `pnpm build:ci`: passed, including `ci:prepare-internal`, `ci:smoke:packages`, `validate:governance`, workspace build, `budget:bundles`, and `budget:desktop`.
- `pnpm governance:gate`: passed.

Completion decision:

- P2 actionable tasks are complete.
- P2 GitHub mutation/automation tasks remain open with owner-deferred notes.

Residuals:

- `pnpm e2e:layout` still has an unrelated title-stabilization failure recorded under `P2-CSS-Mobile`; the focused mobile/safe-area matrix passed.

### P3-Login-Diorama-Deferred-Section

Start status: open section with multiple open `P3-Login-*` tasks.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added per-task deferred/open notes for all Login Diorama preflight, layout, composition, form, animation, design-engine, responsive, and validation tasks.
- Did not edit `apps/web-demo/src/views/login/**`, auth-flow code, PrimeVue login props/PT, UnoCSS shortcuts, or generated login typings.
- Preserved current login behavior as canonical.

Task labels documented:

- `P3-Login-Rules`
- `P3-Login-Context`
- `P3-Login-PrimeVue`
- `P3-Login-Constraints`
- `P3-Login-Layout`
- `P3-Login-Composition`
- `P3-Login-Password`
- `P3-Login-Depth`
- `P3-Login-VisualNoise`
- `P3-Login-Shell`
- `P3-Login-Grid`
- `P3-Login-FormZone`
- `P3-Login-StageZone`
- `P3-Login-Breakout`
- `P3-Login-TopControls`
- `P3-Login-BottomLinks`
- `P3-Login-ProForm`
- `P3-Login-Presets`
- `P3-Login-Username`
- `P3-Login-PasswordState`
- `P3-Login-PasswordShell`
- `P3-Login-Submit`
- `P3-Login-Feedback`
- `P3-Login-Reuse`
- `P3-Login-Scaling`
- `P3-Login-Floor`
- `P3-Login-Overflow`
- `P3-Login-ReducedMotion`
- `P3-Login-Tokens`
- `P3-Login-Sizing`
- `P3-Login-Shortcuts`
- `P3-Login-Borders`
- `P3-Login-ZIndex`
- `P3-Login-RuleOf7`
- `P3-Login-Deep`
- `P3-Login-Desktop`
- `P3-Login-Tablet`
- `P3-Login-Mobile`
- `P3-Login-MobileGrid`
- `P3-Login-SafeArea`
- `P3-Login-Static`
- `P3-Login-Type`
- `P3-Login-Governance`
- `P3-Login-Browser`
- `P3-Login-Responsive`
- `P3-Login-Interaction`
- `P3-Login-Regression`

Validation:

- Owner decision evidence: `.ai/runtime/owner_decisions.md` marks `Login Diorama product refactor` as `FULL_GO_DEFERRED`; current login behavior remains canonical.
- Supporting P2 boundary validations passed: `pnpm type-check`, `pnpm build:ci`, and `pnpm governance:gate`.

Completion decision:

- Left all `P3-Login-*` implementation and refactor-validation tasks open as product/operator-deferred.

Residuals:

- Login Diorama requires a future explicit product/operator-approved lane before implementation or focused refactor validation.

### P3-Docs-ArchitectureMap

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Verified the monorepo architecture map already exists in `README.md`, `README.en.md`, and `docs/en/architecture-contract.md`.
- Confirmed these docs show permitted dependency direction and runtime boundaries, including `@ccd/contracts -> @ccd/core -> apps/*` and app-local runtime adapter ownership.
- No documentation content change was required.

Validation:

- `pnpm docs:commands`: passed, 407 files scanned.

Completion decision: marked `[P3-Docs-ArchitectureMap]` complete.

Residuals:

- None.

### P3-Docs-PackageResponsibilities

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Verified package responsibility documentation already exists in `README.md` and `docs/en/architecture-contract.md`.
- Confirmed app-local adapter and ownership boundaries are documented in `docs/architecture/ownership-boundaries.md`.
- No documentation content change was required.

Validation:

- `pnpm docs:commands`: passed, 407 files scanned.

Completion decision: marked `[P3-Docs-PackageResponsibilities]` complete.

Residuals:

- None.

### P3-Docs-RouteInventory

Start status: open.

Changed files:

- `docs/architecture/example-route-inventory.md`
- `docs/architecture/ownership-boundaries.md`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added an app-owned example route inventory documenting route groups, route modules, page owner paths, and package/runtime boundaries.
- Linked the route inventory from `docs/architecture/ownership-boundaries.md`.
- Did not move or edit route/page source code.

Validation:

- `pnpm --filter @ccd/web-demo test -- src/router/modules/example.spec.ts`: failed initially because Vitest loaded Vite config without required env values.
- `VITE_API_BASE_URL=http://localhost:3003 VITE_PINIA_PERSIST_KEY_PREFIX=app-template-storage-test VITE_ROOT_REDIRECT=/dashboard pnpm --filter @ccd/web-demo test -- src/router/modules/example.spec.ts`: passed; 54 files and 363 tests, including `src/router/modules/example.spec.ts`.
- `pnpm docs:commands`: passed, 408 files scanned.

Completion decision: marked `[P3-Docs-RouteInventory]` complete.

Residuals:

- The focused test command requires valid Vite env values when run through the app package Vitest config.

### P3-Docs-DevCommands

Start status: open.

Changed files:

- `README.md`
- `README.en.md`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Standardized local development command documentation for web, desktop, build, type-check, lint, and validation workflows.
- Confirmed the documented commands already exist in the root `package.json`; no script or package metadata change was required.

Validation:

- `pnpm docs:commands`: passed, 408 files scanned.

Completion decision: marked `[P3-Docs-DevCommands]` complete.

Residuals:

- None.

### P3-Docs-RemoveDemoWording

Start status: open.

Changed files:

- `.env.analyze`
- `.env.development`
- `.env.production`
- `apps/web-demo/src/constants/size.ts`
- `apps/web-demo/src/plugins/modules/primevue.ts`
- `apps/web-demo/src/utils/safeStorage/core.ts`
- `playwright.config.ts`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Replaced stale `app-template-*` storage identifiers with `ccd-*` identifiers in environment files, app storage fallback constants, and Playwright's e2e storage prefix.
- Updated the PrimeVue bootstrap comment from template-oriented wording to the CCD design-system wording.
- Preserved intentional `web-demo`, `/example`, and public demo/mock policy wording because those are active app identity or runtime policy, not stale template metadata.

Validation:

- `rg -n "app-template|template's design system|template-storage" .env .env.analyze .env.development .env.production apps/web-demo playwright.config.ts --glob '!**/dist/**' --glob '!**/node_modules/**'`: passed with no matches.
- `pnpm docs:commands`: passed, 408 files scanned.
- `pnpm project:doctor`: passed.
- `pnpm env:doctor`: passed with the known mise node PATH precedence warning.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm ai:doctor`: passed with existing decorative token contrast advisories.
- `pnpm codex:preflight`: passed with existing decorative token contrast advisories.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P3-Docs-RemoveDemoWording]` complete.

Residuals:

- Existing local browser storage under old `app-template-*` prefixes will not be reused by the new `ccd-*` storage prefixes.

### P3-Docs-DesktopBoundary

Start status: open.

Changed files:

- `apps/desktop/src/README.md`
- `apps/web-demo/src/README.md`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added source-local boundary documentation for the desktop app, stating that `apps/desktop/src` owns the dedicated Tauri frontend entry and must not import browser app routes, stores, views, plugins, or adapters.
- Added source-local boundary documentation for the browser app, stating that `apps/web-demo/src` owns browser routes, stores, views, adapters, compatibility facades, and `/example/**`, and must not import desktop/Tauri runtime code.

Validation:

- `pnpm docs:commands`: passed, 408 files scanned.
- `pnpm ai:doctor`: passed with existing decorative token contrast advisories.
- `pnpm codex:preflight`: passed with existing decorative token contrast advisories.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P3-Docs-DesktopBoundary]` complete.

Residuals:

- None.

### P3-Desktop-SmokeCI

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Reviewed owner decisions and did not edit `.github/**`, desktop package metadata, or Cargo metadata.
- Added a deferred/open note to the ledger because desktop smoke CI requires future operator-approved CI scope.

Validation:

- Owner decision evidence: `.ai/runtime/owner_decisions.md` marks `Desktop drift CI integration` as `FULL_GO_DEFERRED`.
- Owner decision evidence: `.ai/runtime/owner_decisions.md` marks `GitHub branch protection / required checks` as `FULL_GO_DEFERRED` and says no `.github/**` mutation is authorized.

Completion decision: left `[P3-Desktop-SmokeCI]` open as owner/operator-deferred.

Residuals:

- Desktop smoke CI remains a future lane.

### P3-Desktop-Bundling

Start status: open.

Changed files:

- `apps/desktop/src-tauri/tauri.conf.json`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Enabled Tauri production bundling by setting `bundle.active` to `true`.
- Left existing bundle targets, product metadata, app identifier, and icons unchanged.

Validation:

- `pnpm sync:desktop-config`: passed; Tauri `devUrl` was already synchronized.
- `pnpm check:drift`: passed.
- `pnpm desktop:security`: passed.
- `pnpm build:desktop`: passed.
- `pnpm type-check`: passed, 22 tasks.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P3-Desktop-Bundling]` complete.

Residuals:

- Full OS package creation was not run; the ledger validation matrix only required desktop config/security checks plus `build:desktop`, type-check, and governance gate for this task.

### P3-Desktop-IPC

Start status: open.

Changed files:

- `packages/contracts/src/desktop-ipc.ts`
- `packages/contracts/src/index.ts`
- `apps/desktop/src/adapters/index.ts`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a type-only `DesktopIpcCommandMap` contract covering desktop storage, filesystem, and HTTP IPC commands.
- Added typed IPC command helper types and exported them from `@ccd/contracts`.
- Replaced stringly typed desktop adapter invokes with a local typed wrapper, keeping `@tauri-apps/api/core` confined to `apps/desktop/src/adapters/index.ts`.

Validation:

- `rg -n "invoke\\(|@tauri-apps/api/core" apps/desktop/src packages/contracts/src --glob '!**/dist/**'`: passed; raw Tauri import/invoke remains confined to the desktop adapter wrapper.
- `pnpm --filter @ccd/contracts build`: passed.
- `pnpm --filter @ccd/desktop type-check`: passed.
- `pnpm arch:runtime`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm api:report`: passed.
- `pnpm build:desktop`: passed.
- `pnpm desktop:security`: passed.
- `pnpm type-check`: first concurrent run failed while `pnpm build:desktop` was rebuilding package outputs in parallel; serialized rerun passed, 22 tasks.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P3-Desktop-IPC]` complete.

Residuals:

- None.

### P3-Desktop-IPCSchemas

Start status: open.

Changed files:

- `apps/desktop/src/adapters/index.ts`
- `apps/desktop/src/adapters/index.spec.ts`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added adapter-boundary runtime validation for desktop IPC storage keys, filesystem paths, HTTP methods, URLs, and headers before invoking Tauri.
- Added focused tests proving valid payloads reach the typed IPC wrapper and malformed payloads fail before `invoke`.
- No Rust command handlers are currently registered in `apps/desktop/src-tauri/src/main.rs`; the frontend validation now guards the existing command payload construction path and future handler registration can reuse the same contract names.

Validation:

- `pnpm --filter @ccd/desktop test -- src/adapters/index.spec.ts`: passed, 4 tests.
- `pnpm --filter @ccd/contracts build`: passed.
- `pnpm --filter @ccd/desktop type-check`: first concurrent run failed before `@ccd/contracts` build finished; serialized rerun passed.
- `pnpm ci:prepare-internal`: passed; Turbo replayed stale warning lines from earlier failed cache logs but reported 10 successful tasks and exited 0.
- `pnpm type-check`: passed, 22 tasks; Turbo replayed stale warning lines from earlier failed cache logs but exited 0.
- `pnpm build:desktop`: passed, 11 tasks; Turbo replayed stale warning lines from earlier failed cache logs but exited 0.
- `pnpm arch:runtime`: passed.
- `pnpm arch:boundaries`: passed.
- `pnpm api:report`: passed.
- `pnpm desktop:security`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P3-Desktop-IPCSchemas]` complete.

Residuals:

- Stale Turbo cache replay logs still include old failed package-build text even when current commands exit 0 and report successful task summaries.

### P3-Desktop-Icons

Start status: open.

Changed files:

- `apps/desktop/src-tauri/tauri.conf.json`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Verified production icon assets already exist under `apps/desktop/src-tauri/icons/**`, including PNG, ICNS, ICO, Windows, Android, and iOS icon outputs.
- Added explicit Tauri bundle icon paths and desktop bundle metadata: category, publisher, copyright, short description, and long description.

Validation:

- `pnpm --filter @ccd/desktop tauri info`: passed; Tauri accepted the config and reported `build-type: bundle`.
- `pnpm sync:desktop-config`: passed; Tauri `devUrl` was already synchronized and `project:doctor` passed.
- `pnpm desktop:security`: passed.
- `pnpm build:desktop`: passed, 11 tasks; Turbo replayed stale warning lines from earlier failed cache logs but exited 0.
- `pnpm type-check`: passed, 22 tasks; Turbo replayed stale warning lines from earlier failed cache logs but exited 0.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P3-Desktop-Icons]` complete.

Residuals:

- Full OS installer/package generation was not run; local Tauri config parsing and desktop frontend build passed.

### P3-Desktop-WindowDefaults

Start status: open.

Changed files:

- `apps/desktop/src-tauri/tauri.conf.json`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added explicit main window defaults: label, min size, centered startup, resizable, non-fullscreen, non-maximized, decorated, visible, and devtools disabled.
- Added explicit disabled asset protocol scope with an empty scope list.
- Preserved the existing `apps/desktop/src-tauri/security-scopes.json` external-navigation policy, which keeps external navigation disabled and denied by default.

Validation:

- `pnpm --filter @ccd/desktop tauri info`: passed; Tauri accepted the config.
- `pnpm sync:desktop-config`: passed; Tauri `devUrl` was already synchronized and `project:doctor` passed.
- `pnpm desktop:security`: passed.
- `pnpm build:desktop`: passed, 11 tasks; Turbo replayed stale warning lines from earlier failed cache logs but exited 0.
- `pnpm type-check`: passed, 22 tasks; Turbo replayed stale warning lines from earlier failed cache logs but exited 0.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P3-Desktop-WindowDefaults]` complete.

Residuals:

- None.

### P3-Desktop-RustLogging

Start status: open.

Changed files:

- `apps/desktop/src-tauri/src/main.rs`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Replaced the generic startup `.expect()` with an explicit `run_desktop()` result path.
- Added startup and setup log messages to stderr.
- Added fatal runtime error reporting with process exit code `1`.
- No new Rust dependencies were added.

Validation:

- `cargo fmt --check` in `apps/desktop/src-tauri`: passed.
- `cargo check` in `apps/desktop/src-tauri`: passed.
- `pnpm desktop:security`: passed.
- `pnpm --filter @ccd/desktop tauri info`: passed.
- `pnpm build:desktop`: passed, 11 tasks; Turbo replayed stale warning lines from earlier failed cache logs but exited 0.
- `pnpm type-check`: passed, 22 tasks; Turbo replayed stale warning lines from earlier failed cache logs but exited 0.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P3-Desktop-RustLogging]` complete.

Residuals:

- None.

### P3-Tests

Start status: open.

Changed files:

- `scripts/eslint-rules/no-hardcoded-colors.spec.ts`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Verified the focused Vue directive specs already call Vue 3 directive hooks with explicit vnode/previous vnode hook arguments.
- Removed the remaining focused test `@ts-ignore` by replacing the static local `.mjs` ESLint rule import with a typed dynamic import.

Validation:

- `VITE_API_BASE_URL=http://localhost:3003 VITE_PINIA_PERSIST_KEY_PREFIX=ccd-storage-test VITE_ROOT_REDIRECT=/dashboard pnpm exec vitest run apps/web-demo/src/directives/auth.spec.ts packages/vue-hooks/src/directives/tap.spec.ts packages/vue-hooks/src/directives/swipe.spec.ts packages/vue-hooks/src/directives/longPress.spec.ts scripts/eslint-rules/no-hardcoded-colors.spec.ts`: passed, 24 tests.
- `pnpm type-check`: passed, 22 tasks; Turbo replayed stale warning lines from earlier failed cache logs but exited 0.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P3-Tests]` complete.

Residuals:

- None.

### P3-CaseSensitivity

Start status: open.

Changed files:

- `apps/web-demo/src/views/example/components/primevue-collection/pro-table/api-events/columns.tsx`
- `apps/web-demo/src/views/example/components/primevue-collection/pro-table/server/columns.tsx`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Verified the canonical date utility implementation file is `apps/web-demo/src/utils/date/dateUtils.ts`.
- Replaced example view deep imports from `@/utils/date/dateUtils` and `@/utils/date/types` with the stable `@/utils/date` barrel export.

Validation:

- `rg -n "@/utils/date/dateUtils|@/utils/date/DateUtils|utils/date/dateUtils|utils/date/DateUtils" apps packages --glob "*.{ts,tsx,vue}" --glob "!**/dist/**"`: no matches.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm build:web-demo`: passed; existing Vite dynamic/static route import warning remains.
- `pnpm type-check`: passed, 22 tasks; Turbo replayed stale warning lines from earlier failed cache logs but exited 0.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P3-CaseSensitivity]` complete.

Residuals:

- None.

### P3-Tooling-CrossPlatform

Start status: open.

Changed files:

- `scripts/clean-artifacts.mjs`
- `scripts/clean-artifacts.spec.ts`
- `package.json`
- `packages/contracts/package.json`
- `packages/core/package.json`
- `packages/design-tokens/package.json`
- `packages/shared-utils/package.json`
- `packages/unocss-preset/package.json`
- `packages/vue-app-platform/package.json`
- `packages/vue-charts/package.json`
- `packages/vue-hooks/package.json`
- `packages/vue-primevue-adapter/package.json`
- `packages/vue-ui/package.json`
- Generated governance outputs under `.ai/generated/**` and `docs/generated/**` regenerated by `pnpm governance:gate`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added `scripts/clean-artifacts.mjs`, a Node-based build artifact cleaner with safe repository-root bounds checks.
- Added focused tests for explicit path cleanup, workspace artifact cleanup, and outside-root rejection.
- Replaced package build-script `rm -rf` / `rm -f` usage with the Node cleaner.
- Replaced root package bare POSIX environment assignments with existing `cross-env`.
- Replaced root `ci:clean-artifacts` with the Node workspace cleanup mode.

Validation:

- Package manifest JSON parse check: passed.
- Static package-script scan for bare `rm -rf` / `rm -f` and bare POSIX env assignments: no findings.
- `pnpm exec vitest run scripts/clean-artifacts.spec.ts`: passed, 3 tests.
- `pnpm ci:clean-artifacts`: passed.
- `pnpm ci:prepare-internal`: passed, 10 package builds.
- `pnpm ci:smoke:packages`: passed.
- `pnpm type-check`: passed, 22 tasks.
- `pnpm build:ci`: first run failed at `governance:gate` because generated governance artifacts changed during gate after script graph changes; no build/test failure.
- `pnpm governance:gate`: passed after generated artifacts stabilized.
- `pnpm build:ci`: passed on rerun, including package builds, governance, app builds, and bundle/desktop budgets.
- `pnpm governance:gate`: passed after `build:ci`.

Completion decision: marked `[P3-Tooling-CrossPlatform]` complete.

Residuals:

- Root runtime wrapper scripts still explicitly use `bash scripts/exec.sh` / `scripts/env.sh`; those are governed runtime execution surfaces and were not converted in this task.

### P3-Tooling-Stylelint

Start status: open.

Changed files:

- `stylelint.config.mjs`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Verified installed versions: `stylelint@17.4.0`, `stylelint-config-standard-scss@17.0.0`, `stylelint-config-prettier-scss@1.0.0`, and `prettier@3.8.1`.
- Replaced hard-coded `node_modules/...` Stylelint config paths with package-name `extends`, letting Stylelint resolve configs through the package manager.
- Replaced the non-effective `ignores` field with Stylelint 17's `ignoreFiles`.
- Added `**/target/**` to ignore generated Rust/Tauri build output.

Validation:

- `pnpm exec stylelint --version`: passed, reported `17.4.0`.
- `pnpm exec stylelint --print-config apps/web-demo/src/views/example/utils/strings-format.vue`: passed and showed `ignoreFiles` with `dist`, `dist-ssr`, `coverage`, and `target`.
- `pnpm exec stylelint "apps/**/*.{css,scss,vue}" --allow-empty-input`: initially failed because generated `dist` and Tauri `target` files were not ignored; passed after the config fix.
- `pnpm lint:style`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P3-Tooling-Stylelint]` complete.

Residuals:

- None.

### P3-Tooling-I18nReview

Start status: open.

Changed files:

- `packages/vue-app-platform/src/i18nRuntime.ts`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Checked the installed package (`vue-i18n@10.0.8`) and current npm latest (`11.4.5` on 2026-06-08).
- Checked official Vue I18n docs: Composition API mode uses `legacy: false`, `useI18n()` returns a Composer, and legacy mode/options are on the v12 removal path.
- Verified local runtime already creates i18n with `legacy: false`.
- Removed old `silentTranslationWarn` and `silentFallbackWarn` options from the shared i18n runtime; `missingWarn` and `fallbackWarn` remain the Composition API-compatible warning controls.
- Scanned for legacy plural API usage (`tc`, `$tc`) and component `i18n: {}` options; none were found in app/package source.

Validation:

- `pnpm view vue-i18n version`: passed, reported `11.4.5`.
- `rg -n "silentTranslationWarn|silentFallbackWarn|tc\\(|\\$tc|i18n:\\s*\\{" apps packages --glob "*.{ts,tsx,vue}" --glob "!**/dist/**"`: no matches.
- `pnpm --filter @ccd/vue-app-platform test`: passed, 23 tests.
- `pnpm --filter @ccd/vue-app-platform type-check`: passed.
- `pnpm --filter @ccd/vue-app-platform build`: passed.
- `pnpm --filter @ccd/web-demo type-check`: passed.
- `pnpm build:web-demo`: passed; existing Vite dynamic/static route import warning remains.
- `pnpm type-check`: passed, 22 tasks.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P3-Tooling-I18nReview]` complete.

Residuals:

- No dependency upgrade was attempted because dependency modernization is owner-deferred; the current code is aligned with the Composition API migration path.
- Official docs consulted: `https://vue-i18n.intlify.dev/guide/advanced/composition`, `https://vue-i18n.intlify.dev/guide/migration/breaking11`, `https://vue-i18n.intlify.dev/api/general`.

### P3-Verify

Start status: open.

Changed files:

- `packages/vue-app-platform/src/i18nRuntime.spec.ts`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Ran `pnpm check` after targeted P3 repairs.
- Fixed the only residual check failure by constructing locale test messages from entries so the `ar-SA` locale tag is not treated as a naming-convention property.
- Re-ran `pnpm check` and confirmed the final residual error surface is empty.

Validation:

- Initial `pnpm check`: failed only on `packages/vue-app-platform/src/i18nRuntime.spec.ts` `@typescript-eslint/naming-convention` for the `ar-SA` locale message key; type-check passed.
- `pnpm exec eslint packages/vue-app-platform/src/i18nRuntime.spec.ts`: passed after the targeted test cleanup.
- `pnpm exec vitest run packages/vue-app-platform/src/i18nRuntime.spec.ts`: passed, 3 tests.
- `pnpm check`: passed.
- `pnpm governance:gate`: passed.

Completion decision: marked `[P3-Verify]` complete.

Residuals:

- None.

### P3 Boundary Validation

Commands:

- `pnpm ai:doctor`: passed; existing decorative token contrast advisories only.
- `pnpm codex:preflight`: passed; existing decorative token contrast advisories only.
- `pnpm type-check`: passed, 22 tasks.
- `pnpm build:ci`: passed, including clean package prepare, package smoke, governance, web/desktop builds, and bundle/desktop budgets.
- `pnpm governance:gate`: passed.

Residuals:

- Existing Vite warning remains during web builds: `apps/web-demo/src/router/modules/core.ts` is both dynamically and statically imported by `apps/web-demo/src/router/index.ts`.

### Deferred Backlog Audit

Start status: open P1/P2/P3 ledger items remained after P3 boundary validation.

Changed files:

- None for the audit pass.

Completion decision:

- Left P1 guard expansion tasks open because `.ai/runtime/owner_decisions.md` sets guard enforcement scope to `FULL_GO_DEFERRED`.
- Left P2 Vite 8 tasks open because `.ai/runtime/owner_decisions.md` sets Vite major migration to `FULL_GO_DEFERRED` and the work belongs on an isolated lane.
- Left P2 dependency modernization tasks open except the local dependency-policy documentation task because `.ai/runtime/owner_decisions.md` sets dependency modernization to `FULL_GO_DEFERRED`.
- Left P2 GitHub CI/CODEOWNERS/template tasks open because `.ai/runtime/owner_decisions.md` defers GitHub required-check and `.github/**` governance changes.
- Left P3 Login Diorama tasks open because `.ai/runtime/owner_decisions.md` sets Login Diorama product refactor to `FULL_GO_DEFERRED`.
- Left P3 Desktop Smoke CI open because desktop drift CI integration and `.github/**` mutation require a future operator-approved lane.

Residuals:

- `pnpm ai:doctor --open` still reports these as legitimate open/deferred items.

### P2-GitHub-BranchProtection

Start status: open.

Changed files:

- `docs/governance/github-governance.md`
- `docs/governance/README.md`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Documented the local target for main branch protection without mutating remote GitHub settings.
- Kept remote branch protection enforcement deferred to a future operator-approved lane.

Validation:

- Consolidated documentation/governance validation passed: `pnpm ai:sync`, `node scripts/migrate-ledger.mjs`, `pnpm docs:commands`, `pnpm ai:doctor`, `pnpm codex:preflight`, `pnpm desktop:security`, `pnpm governance:gate`, and `pnpm ai:doctor --open`.

Completion decision: marked `[P2-GitHub-BranchProtection]` complete.

Residuals:

- Remote branch protection settings were not read or mutated.

### P2-GitHub-RequiredChecks

Start status: open.

Changed files:

- `docs/governance/github-governance.md`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Documented the required check set that maps to the current local CI workflow command families.
- Kept remote required-check enforcement deferred to a future operator-approved lane.

Validation:

- Consolidated documentation/governance validation passed: `pnpm ai:sync`, `node scripts/migrate-ledger.mjs`, `pnpm docs:commands`, `pnpm ai:doctor`, `pnpm codex:preflight`, `pnpm desktop:security`, `pnpm governance:gate`, and `pnpm ai:doctor --open`.

Completion decision: marked `[P2-GitHub-RequiredChecks]` complete.

Residuals:

- Remote required checks were not read or mutated.

### P2-GitHub-Dependencies

Start status: open.

Changed files:

- `docs/governance/dependency-policy.md`
- `docs/governance/README.md`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added a local dependency update policy that forbids blind global upgrades on `main`, requires lane isolation, and records placement/override/scanning rules.
- No dependency versions, manifests, or lockfile entries were changed.

Validation:

- Consolidated documentation/governance validation passed: `pnpm ai:sync`, `node scripts/migrate-ledger.mjs`, `pnpm docs:commands`, `pnpm ai:doctor`, `pnpm codex:preflight`, `pnpm desktop:security`, `pnpm governance:gate`, and `pnpm ai:doctor --open`.

Completion decision: marked `[P2-GitHub-Dependencies]` complete.

Residuals:

- Dependency modernization remains owner-deferred.

### P4 Deferred and Blocked Items

Start status: open.

Changed files:

- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added explicit deferred/open notes for `P4-NewOrganization-Deferred`, `P4-Starter-Deferred`, `P4-DesignSystem-Deferred`, `P4-RekaUI-Deferred`, `P4-TanStackQuery-Deferred`, and `P4-DesktopDriftCI`.
- Added explicit blocked/open notes for `P4-HttpCore-Blocked` and `P4-SafeStorageShared-Blocked`.
- No repositories, organizations, dependencies, HTTP runtime packages, safeStorage shared-runtime moves, remote settings, or `.github/**` files were created or changed.

Validation:

- Consolidated documentation/governance validation passed: `pnpm ai:sync`, `node scripts/migrate-ledger.mjs`, `pnpm docs:commands`, `pnpm ai:doctor`, `pnpm codex:preflight`, `pnpm desktop:security`, `pnpm governance:gate`, and `pnpm ai:doctor --open`.

Completion decision:

- Left these P4 items open as legitimate deferred/blocked strategic items.

Residuals:

- Future implementation requires the owner/operator decisions named in the ledger notes.

### P4-ADR-Stack

Start status: open.

Changed files:

- `docs/adr/ADR-007-runtime-stack-and-tooling-choices.md`
- `docs/governance/README.md`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added an ADR recording the current Vue 3, Vite, UnoCSS, PrimeVue, Tauri v2, pnpm workspace, and Turbo baseline.

Validation:

- Consolidated documentation/governance validation passed: `pnpm ai:sync`, `node scripts/migrate-ledger.mjs`, `pnpm docs:commands`, `pnpm ai:doctor`, `pnpm codex:preflight`, `pnpm desktop:security`, `pnpm governance:gate`, and `pnpm ai:doctor --open`.

Completion decision: marked `[P4-ADR-Stack]` complete.

Residuals:

- Vite major migration and dependency modernization remain future isolated lanes.

### P4-Desktop-RustCommands

Start status: open.

Changed files:

- `docs/adr/ADR-008-desktop-backend-ipc-and-updater-policy.md`
- `docs/runtime/desktop-runtime.md`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Documented that future Rust commands must be contract-first, adapter-routed, payload-validated, and registered only under `apps/desktop/src-tauri/src/**`.
- No placeholder Rust commands were added.

Validation:

- Consolidated documentation/governance validation passed: `pnpm ai:sync`, `node scripts/migrate-ledger.mjs`, `pnpm docs:commands`, `pnpm ai:doctor`, `pnpm codex:preflight`, `pnpm desktop:security`, `pnpm governance:gate`, and `pnpm ai:doctor --open`.

Completion decision: marked `[P4-Desktop-RustCommands]` complete.

Residuals:

- Actual backend commands still require a future capability-specific task.

### P4-Desktop-RustErrors

Start status: open.

Changed files:

- `docs/adr/ADR-008-desktop-backend-ipc-and-updater-policy.md`
- `docs/runtime/desktop-runtime.md`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Documented the structured Rust-side IPC error requirement for future commands.

Validation:

- Consolidated documentation/governance validation passed: `pnpm ai:sync`, `node scripts/migrate-ledger.mjs`, `pnpm docs:commands`, `pnpm ai:doctor`, `pnpm codex:preflight`, `pnpm desktop:security`, `pnpm governance:gate`, and `pnpm ai:doctor --open`.

Completion decision: marked `[P4-Desktop-RustErrors]` complete.

Residuals:

- No Rust error types were added because no new command was introduced.

### P4-Desktop-Updater

Start status: open.

Changed files:

- `docs/adr/ADR-008-desktop-backend-ipc-and-updater-policy.md`
- `docs/runtime/desktop-runtime.md`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Documented that updater and deep-link configuration remain disabled until a future security model exists.

Validation:

- Consolidated documentation/governance validation passed: `pnpm ai:sync`, `node scripts/migrate-ledger.mjs`, `pnpm docs:commands`, `pnpm ai:doctor`, `pnpm codex:preflight`, `pnpm desktop:security`, `pnpm governance:gate`, and `pnpm ai:doctor --open`.

Completion decision: marked `[P4-Desktop-Updater]` complete.

Residuals:

- No updater or deep-link configuration was added.

### P4-Deps-WorkspacePlacement

Start status: open.

Changed files:

- `docs/governance/dependency-policy.md`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added dependency placement rules for root, apps, shared packages, and `@ccd/*` workspace references.

Validation:

- Consolidated documentation/governance validation passed: `pnpm ai:sync`, `node scripts/migrate-ledger.mjs`, `pnpm docs:commands`, `pnpm ai:doctor`, `pnpm codex:preflight`, `pnpm desktop:security`, `pnpm governance:gate`, and `pnpm ai:doctor --open`.

Completion decision: marked `[P4-Deps-WorkspacePlacement]` complete.

Residuals:

- No manifest or lockfile placement changes were made.

### P4-Deps-OverridesPolicy

Start status: open.

Changed files:

- `docs/governance/dependency-policy.md`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Added pnpm override rationale, affected-chain, validation, and removal/review requirements.

Validation:

- Consolidated documentation/governance validation passed: `pnpm ai:sync`, `node scripts/migrate-ledger.mjs`, `pnpm docs:commands`, `pnpm ai:doctor`, `pnpm codex:preflight`, `pnpm desktop:security`, `pnpm governance:gate`, and `pnpm ai:doctor --open`.

Completion decision: marked `[P4-Deps-OverridesPolicy]` complete.

Residuals:

- Existing overrides were not changed.

### P4-Release-Changesets

Start status: open.

Changed files:

- `docs/release/release-policy.md`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/autonomous-repair-progress.md`

Implementation:

- Documented that `project.config.json` remains the manual version source of truth and Changesets remains package-change annotation/release-automation input.

Validation:

- Consolidated documentation/governance validation passed: `pnpm ai:sync`, `node scripts/migrate-ledger.mjs`, `pnpm docs:commands`, `pnpm ai:doctor`, `pnpm codex:preflight`, `pnpm desktop:security`, `pnpm governance:gate`, and `pnpm ai:doctor --open`.

Completion decision: marked `[P4-Release-Changesets]` complete.

Residuals:

- No release automation config was changed.

## Final Local Report

Date: 2026-06-08

### Completed Tasks In This Continuation

- P3 secondary repair tasks: `P3-Tests`, `P3-CaseSensitivity`, `P3-Tooling-CrossPlatform`, `P3-Tooling-Stylelint`, `P3-Tooling-I18nReview`, `P3-Verify`.
- Local GitHub governance documentation tasks: `P2-GitHub-BranchProtection`, `P2-GitHub-RequiredChecks`, `P2-GitHub-Dependencies`.
- P4 documentation/policy tasks: `P4-ADR-Stack`, `P4-Desktop-RustCommands`, `P4-Desktop-RustErrors`, `P4-Desktop-Updater`, `P4-Deps-WorkspacePlacement`, `P4-Deps-OverridesPolicy`, `P4-Release-Changesets`.

### Still Open / Deferred / Blocked

`pnpm ai:doctor --open` reports 91 open tasks:

- 8 P1 guard expansion/signoff tasks remain open because guard enforcement scope is `FULL_GO_DEFERRED`.
- 9 P2 Vite 8 tasks remain open because Vite major migration is `FULL_GO_DEFERRED` and belongs to an isolated future lane.
- 15 P2 dependency modernization tasks remain open because dependency modernization is `FULL_GO_DEFERRED`.
- 3 P2 GitHub CI/CODEOWNERS/template tasks remain open because `.github/**` and required-check governance changes need future operator approval.
- 47 P3 Login Diorama tasks remain open because Login Diorama product refactor is `FULL_GO_DEFERRED`.
- `P3-Desktop-SmokeCI` remains open because desktop drift CI integration is `FULL_GO_DEFERRED`.
- 8 P4 strategic deferrals/blockers remain open: new org/repo, starter split, standalone design-system split, Reka UI evaluation, TanStack Query evaluation, desktop drift CI, HTTP runtime promotion blocked by D-014, and safeStorage shared-runtime promotion blocked by D-019.

### Changed Files By Task

- `P2-GitHub-BranchProtection`, `P2-GitHub-RequiredChecks`: `docs/governance/github-governance.md`, `docs/governance/README.md`, `.ai/runtime/repair_list.md`, `.ai/runtime/autonomous-repair-progress.md`.
- `P2-GitHub-Dependencies`, `P4-Deps-WorkspacePlacement`, `P4-Deps-OverridesPolicy`: `docs/governance/dependency-policy.md`, `docs/governance/README.md`, `.ai/runtime/repair_list.md`, `.ai/runtime/autonomous-repair-progress.md`.
- `P4-ADR-Stack`: `docs/adr/ADR-007-runtime-stack-and-tooling-choices.md`, `docs/governance/README.md`, `.ai/runtime/repair_list.md`, `.ai/runtime/autonomous-repair-progress.md`.
- `P4-Desktop-RustCommands`, `P4-Desktop-RustErrors`, `P4-Desktop-Updater`: `docs/adr/ADR-008-desktop-backend-ipc-and-updater-policy.md`, `docs/runtime/desktop-runtime.md`, `.ai/runtime/repair_list.md`, `.ai/runtime/autonomous-repair-progress.md`.
- `P4-Release-Changesets`: `docs/release/release-policy.md`, `.ai/runtime/repair_list.md`, `.ai/runtime/autonomous-repair-progress.md`.
- P4 deferred/blocked ledger notes: `.ai/runtime/repair_list.md`, `.ai/runtime/autonomous-repair-progress.md`.
- Generated governance artifacts were refreshed only through `pnpm governance:gate`, `pnpm build:ci`, and `pnpm validate`; no generated governance file was hand-edited.

### Final Validation Results

- `pnpm ai:sync`: passed; `.ai/runtime/repair-ledger.json` regenerated with 226 tasks.
- `node scripts/migrate-ledger.mjs`: passed; ledger parseable.
- `pnpm docs:commands`: passed; 412 documentation files scanned.
- `pnpm ai:doctor`: passed; only existing decorative token contrast advisories appeared.
- `pnpm ai:doctor --open`: passed; 91 open tasks listed as legitimate deferred/blocked backlog.
- `pnpm codex:preflight`: passed; only existing decorative token contrast advisories appeared.
- `pnpm desktop:security`: passed.
- `pnpm type-check`: passed; 22 Turbo tasks successful.
- `pnpm build:ci`: passed; internal package builds, package smoke, governance, app builds, bundle budgets, and desktop budget succeeded.
- `pnpm governance:gate`: passed.
- `pnpm validate`: passed; governance, runtime validation, type-check, and web build succeeded.

Residuals:

- Existing web build warning remains: `apps/web-demo/src/router/modules/core.ts` is both dynamically and statically imported by `apps/web-demo/src/router/index.ts`.
- No commits, pushes, remote GitHub mutations, branch protection changes, `.github/**` edits, dependency upgrades, Vite major migration, HTTP runtime promotion, or safeStorage shared-runtime promotion were performed in this final pass.

## Final Closure Addendum

Date: 2026-06-08

Closure report: `.ai/runtime/final-closure-report.md`.

Implementation:

- Reproduced `P2-Governance-CleanArtifactDrift` through `pnpm build:ci`.
- Fixed generated artifact nondeterminism at the owning generators:
  - `scripts/architecture/generate-dependency-graphs.mjs`
  - `scripts/governance/report.mjs`
- Updated `.ai/runtime/final-repair-audit.md` so `P2-Governance-Gate` is no longer listed as incorrectly complete.

Validation:

- Final matrix passed: `pnpm ai:sync`, `node scripts/migrate-ledger.mjs`, `node scripts/migrate-ledger.mjs --self-check`, `pnpm ai:doctor`, `pnpm ai:doctor --open`, `pnpm codex:preflight`, `pnpm env:doctor`, `pnpm env:doctor:strict`, `pnpm project:doctor`, `pnpm docs:commands`, `pnpm ci:clean-artifacts`, `pnpm ci:prepare-internal`, `pnpm ci:smoke:packages`, `pnpm --filter @ccd/vue-ui build`, bare route smoke spec, app type-checks, `pnpm type-check`, `pnpm lint:check`, `pnpm check`, `pnpm arch:runtime`, `pnpm arch:boundaries`, `pnpm api:report`, `pnpm supply:check`, `pnpm build:web-demo`, `pnpm build:desktop`, `pnpm governance:refresh`, `pnpm generated:normalize`, `pnpm arch:report`, `pnpm arch:graphs`, `pnpm check:drift`, `pnpm build:ci`, `pnpm e2e:smoke`, `pnpm governance:gate`, and `pnpm validate`.

Final verdict: `complete-with-deferred-items`.
