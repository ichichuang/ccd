# M6 Implementation Lane Split

M6 does not implement source migration. It splits future work into approval-sized lanes so each patch can be reviewed, validated, and rolled back independently.

## Lane Briefs

### M7-safeStorage-codec-foundation

- objective: Extract or consume pure safeStorage codec/compression helpers while keeping browser storage, key/env/logger behavior app-owned.
- issue IDs covered: B-05, B-06, B-08; B-07 as blocker only.
- allowed paths: `packages/contracts/src/storage.ts`, `packages/shared-utils/src/storageCodec.ts`, optional `packages/shared-utils/src/storageCompression.ts`, `apps/web-demo/src/utils/safeStorage/**`, `apps/web-demo/src/plugins/modules/proform.ts`, focused tests.
- forbidden paths: `packages/core/**`, crypto implementation moves, package manifests/lockfile unless explicitly approved, auth/HTTP behavior.
- source files likely touched: safeStorage core/facade/lzstring/serializer/storage maintenance and ProForm draft injection.
- package files likely touched: contracts/shared-utils source and tests; manifest only if new public export is approved.
- generated files expected: API report outputs only if public API changes.
- prerequisites: persisted payload fixtures and M6 B-07 proposed decision acknowledged.
- owner decisions required: B-07 approval if crypto is touched; none for non-crypto codec foundation.
- validation commands: shared-utils tests, focused safeStorage/Pinia serializer/ProForm draft tests, web-demo type-check, `pnpm arch:runtime`, `pnpm arch:boundaries`, `pnpm api:report` if exports change.
- rollback plan: revert helper/package/app facade edits together.
- residual risk: persisted data compatibility and previous-key fallback.
- expected final status: `M7_SAFE_STORAGE_CODEC_FOUNDATION_DONE`; `B-07` remains `BLOCKED` unless owner approval exists.

### M8-theme-size-resolver-foundation

- objective: Move or expose pure theme/size resolver logic through owning packages and keep DOM/storage application injected.
- issue IDs covered: B-03, B-04, B-09, B-11, F-04.
- allowed paths: `packages/design-tokens/src/**`, `packages/vue-app-platform/src/themeRuntime.ts`, app theme facades under `apps/web-demo/src/utils/theme/**`, focused tests.
- forbidden paths: `packages/core/**`, raw app-store moves into packages, broad UI rewrites, dependency/lockfile changes.
- source files likely touched: `engine.ts`, `sizeEngine.ts`, `mode.ts`, `transitions.ts`, `lottieThemeUtils.ts`.
- package files likely touched: design-tokens/vue-app-platform source and tests.
- generated files expected: API report outputs if package exports change.
- prerequisites: parity fixtures for size vars, theme vars, mode resolution, first-paint behavior.
- owner decisions required: approval for any new exported resolver.
- validation commands: design-tokens tests, vue-app-platform tests, theme/size store specs, `pnpm validate:tokens`, `pnpm e2e:layout`, `pnpm e2e:visual`, `pnpm arch:runtime`.
- rollback plan: revert package exports and app facade calls together.
- residual risk: first-frame theme/size flicker and visual regressions.
- expected final status: `M8_THEME_SIZE_RESOLVER_FOUNDATION_DONE`.

### M9-device-runtime-resolver-foundation

- objective: Split pure device/OS/breakpoint resolution from app browser collectors and listeners.
- issue IDs covered: B-10, B-09, B-04.
- allowed paths: `packages/design-tokens/src/breakpoints.ts`, optional package resolver file, `packages/vue-app-platform/src/layoutRuntime.ts`, `apps/web-demo/src/utils/deviceSync.ts`, `apps/web-demo/src/stores/modules/system/device.ts`, focused tests.
- forbidden paths: moving browser listeners into `packages/core` or contracts, broad runtime allowlists, unrelated layout rewrites.
- source files likely touched: `deviceSync.ts`, `device.ts`, package resolver/runtime files.
- package files likely touched: design-tokens/vue-app-platform source and tests.
- generated files expected: API report outputs if package exports change.
- prerequisites: UA/maxTouchPoints/screen-short-side fixture matrix including iPadOS.
- owner decisions required: whether OS resolver belongs in design-tokens, vue-app-platform, or app-only type surface.
- validation commands: device specs, layout runtime tests, `pnpm e2e:layout`, `pnpm arch:runtime`, `pnpm arch:boundaries`.
- rollback plan: restore app-local resolver path and remove package resolver exports.
- residual risk: responsive layout and mobile/tablet classification drift.
- expected final status: `M9_DEVICE_RESOLVER_FOUNDATION_DONE`.

### M10-system-store-pure-state-extraction

- objective: Extract only pure state machines/resolvers from system stores while keeping Pinia containers app-owned.
- issue IDs covered: A-03, B-09, B-10, B-11.
- allowed paths: `apps/web-demo/src/stores/modules/system/**`, `packages/design-tokens/src/**`, `packages/vue-app-platform/src/**`, focused store tests.
- forbidden paths: moving Pinia stores into packages, changing persisted keys without fixtures, auth/HTTP behavior.
- source files likely touched: `theme.ts`, `size.ts`, `device.ts`, `layout.ts`, `locale.ts`.
- package files likely touched: design-tokens/vue-app-platform pure helpers only.
- generated files expected: API report outputs only if package API changes.
- prerequisites: M8/M9 foundations or explicit parity fixtures.
- owner decisions required: approval for any new package state-machine export.
- validation commands: system store specs, web-demo type-check, `pnpm e2e:layout`, `pnpm e2e:visual`, `pnpm arch:runtime`.
- rollback plan: revert package helper calls and restore store-local pure logic.
- residual risk: persisted preferences, sync events, first-paint behavior.
- expected final status: `M10_SYSTEM_STORE_PURE_STATE_DONE`.

### M11-hook-facade-convergence

- objective: Thin app hook/plugin facades around package-owned primitives without moving app router/i18n/storage bindings into packages.
- issue IDs covered: B-01, B-02, B-05, B-06, B-12.
- allowed paths: app hook facades, app ProForm/ProTable plugins, `packages/vue-hooks/src/createAutoMittHook.ts`, `packages/vue-ui/src/{PrimeDialog,ProTable,ProForm}/**`, focused tests.
- forbidden paths: app route/i18n imports in `packages/vue-ui`, storage/runtime implementation in packages without injection, raw app public exports.
- source files likely touched: `useAutoMitt.ts`, `useDialog.tsx`, `useProTableUrlSync.ts`, `proform.ts`, `protable.ts`.
- package files likely touched: vue-hooks/vue-ui source and tests.
- generated files expected: API report outputs if public API changes.
- prerequisites: M7 safeStorage facade stability for ProForm draft storage.
- owner decisions required: public API approval for any new vue-ui/vue-hooks exported helper.
- validation commands: vue-hooks tests, vue-ui dialog/ProTable/ProForm tests, web-demo type-check, focused ProTable URL sync tests, `pnpm api:report`.
- rollback plan: restore app facade implementations and remove added package exports.
- residual risk: router query sync, translated dialog defaults, draft storage behavior.
- expected final status: `M11_HOOK_FACADE_CONVERGENCE_DONE`.

### M12-primevue-allowlist-reduction

- objective: Reduce PrimeVue direct app allowlists one feature area at a time after wrapper/adapter migration.
- issue IDs covered: C-06, D-11.
- allowed paths: `packages/vue-ui/src/**`, `packages/vue-primevue-adapter/src/**`, selected app global-shell/feature/example files, `scripts/ai-architecture-guard.mjs`, generated type registry only through its generator.
- forbidden paths: broad allowlist globs, raw PrimeVue public re-export buckets, manual generated type edits, unrelated UI rewrites.
- source files likely touched: one selected feature/demo/global-shell group at a time.
- package files likely touched: vue-ui/vue-primevue-adapter wrappers/adapters and tests.
- generated files expected: generated component typings only if generator output is intentionally refreshed.
- prerequisites: owner approval of reduction group and visual validation budget.
- owner decisions required: C-06 concrete reduction policy and approval for any showcase exception shrinkage.
- validation commands: `pnpm ai:guard -- --format=json`, `pnpm api:report`, package tests/builds, web-demo type-check, focused visual/e2e smoke.
- rollback plan: restore allowlist row and migrated feature imports together.
- residual risk: UI behavior and showcase coverage regressions.
- expected final status: `M12_PRIMEVUE_ALLOWLIST_REDUCTION_PARTIAL` until all exact app/showcase rows are migrated.

### M13-tsconfig-build-boundary-repair

- objective: Remove package source include bypasses and root script app-source imports.
- issue IDs covered: F-01, F-02, F-03, F-04.
- allowed paths: `apps/*/tsconfig.json`, package tsconfigs/references, root tooling scripts, package public APIs if approved.
- forbidden paths: root global `@ccd/*` aliases, dependency changes, lockfile changes, generated manual edits.
- source files likely touched: app tsconfigs and root theme tooling scripts.
- package files likely touched: package public exports/build configs only if required by missing declarations.
- generated files expected: none unless API/package report generators are intentionally run.
- prerequisites: package builds emit required declarations; app builds can consume outputs.
- owner decisions required: build/reference strategy if package public API additions are needed.
- validation commands: `pnpm ci:prepare-internal`, app type-checks, `pnpm type-check`, `pnpm build:web-demo`, `pnpm build:desktop`, `pnpm arch:boundaries`, `pnpm validate:tokens`.
- rollback plan: revert TS config/tooling changes.
- residual risk: previously masked missing declarations surface.
- expected final status: `M13_TS_BUILD_BOUNDARY_REPAIRED`.

### M14-status-and-ledger-reconciliation

- objective: Align docs, status, ADRs, blockers, runtime ledger, and final go/no-go state with current evidence.
- issue IDs covered: A-01, A-02, A-03, D-05, D-06, D-07, D-08, D-10, G-01, G-02, G-03.
- allowed paths: non-generated docs under `README.md`, `docs/**`, `.ai/runtime/repair_list.md`, `.ai/runtime/owner_decisions.md` only if owner approves.
- forbidden paths: source implementation, generated manual edits, blocked lane implementation, owner-decision fabrication.
- source files likely touched: none.
- package files likely touched: none.
- generated files expected: none unless owning generator commands are intentionally run.
- prerequisites: latest `pnpm ai:doctor --open`, stale doc grep, owner/operator decisions for status changes.
- owner decisions required: ADR status approval, final blocker disposition, any proposed owner-decision records moved to approved.
- validation commands: `pnpm docs:commands`, `pnpm ai:doctor --open`, `pnpm codex:preflight`, `pnpm validate:governance`, `git diff --check`.
- rollback plan: revert status/doc/ledger edits.
- residual risk: status changes without owner evidence are invalid.
- expected final status: `M14_STATUS_LEDGER_RECONCILED` only if blockers are explicitly represented and no false DONE/GO state remains.
