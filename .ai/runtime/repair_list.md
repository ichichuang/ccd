# CCD Runtime Repair Ledger

> 中文注释：这是给 AI / Codex 使用的新版 `.ai/runtime/repair_list.md` 草案。建议先手动替换到 `.ai/runtime/repair_list.md`，再让 Codex 按本文底部的执行顺序升级 `.txt` 到 `.md` 的架构配置。

- Target path: `.ai/runtime/repair_list.md`
- Replacement target: legacy `.ai/runtime/repair_list.txt`
- Template target: `.ai/runtime/repair_list.template.md`
- Generated JSON target: `.ai/runtime/repair-ledger.json`
- Generated date: 2026-05-27
- Owner decision: keep the current CCD architecture and perform staged modernization, not a full rebuild.

## 0. Purpose

This ledger is the canonical AI-readable repair and modernization plan for CCD. It consolidates:

1. Existing local runtime repair tasks from the legacy repair ledger template.
2. Current architecture defects found during repository analysis.
3. Modernization work needed for Vite, Vue, UnoCSS, PrimeVue, HTTP, package exports, and GitHub governance.
4. A safe execution order that preserves CCD's deterministic multi-runtime platform architecture.

Do not treat this document as a normal issue list. It is an execution ledger for large AI-assisted refactors. Every item must be either open, completed, or explicitly deferred.

## 1. Ledger Format Contract

The new Markdown ledger format uses standard GitHub-style tasks:

- `[ ]` means open.
- `[x]` means completed and validated.
- Each actionable task must start with `- [ ] [Module]` or `- [x] [Module]`.
- The `Module` label should include priority when possible, for example `[P0-Ledger]`, `[P1-UIBoundary]`, `[P2-Vite8]`.
- Do not mark a task complete until the implementation and relevant validation commands pass.

Parser compatibility requirement:

- `scripts/migrate-ledger.mjs` must parse both the new Markdown format and the legacy icon format during the migration window.
- New preferred line format: `- [ ] [P0-Module] Task description`.
- Legacy accepted line format during migration: `[⬜️] [P0-Module] Task description` and `[✅] [P0-Module] Task description`.

## 2. Architectural Non-Negotiables

CCD must preserve these invariants:

- `packages/contracts` contains interfaces, DTOs, and cross-runtime contracts only.
- `packages/core` remains runtime-neutral and must not become a frontend utility bucket.
- Runtime capabilities must be injected through contracts and app adapters.
- Runtime APIs are allowed only in app adapter layers.
- Root package remains orchestration-only.
- Internal package boundaries must remain visible through workspace package resolution and build outputs.
- Do not add global `@ccd/*` path aliases to `tsconfig.base.json`.
- Do not weaken `governance:gate`, `ai:doctor`, `ai:guard`, or generated artifact rules.
- Do not replace the current architecture with a new GitHub organization or new repository at this stage.

## 3. Repository Directory Map

Use this map before editing.

| Area | Current responsibility | Main paths |
|---|---|---|
| AI protocol and rules | AI execution contract, preflight, rules, adapters | `.ai/protocol/**`, `.ai/rules/**`, `.ai/skills/**`, `AGENTS.md`, `CLAUDE.md` |
| Runtime ledger | Local repair tracking and generated ledger JSON | `.ai/runtime/repair_list.md`, `.ai/runtime/repair_list.template.md`, `.ai/runtime/repair-ledger.json` |
| AI scripts | Sync, doctor, preflight, migration, architecture guard | `scripts/ai-sync.mjs`, `scripts/ai-doctor.mjs`, `scripts/codex-preflight.mjs`, `scripts/migrate-ledger.mjs`, `scripts/ai-architecture-guard.mjs` |
| Architecture contracts | Human and AI architecture contracts | `docs/en/architecture-contract.md`, `docs/en/governance-contract.md`, `docs/governance/**` |
| Contracts | Runtime-neutral interfaces and DTOs | `packages/contracts/**` |
| Core | Runtime-neutral platform facade | `packages/core/**` |
| Frontend platform | Tokens, UnoCSS preset, hooks, UI primitives, chart platform | `packages/design-tokens/**`, `packages/unocss-preset/**`, `packages/vue-hooks/**`, `packages/vue-ui/**`, `packages/vue-charts/**` |
| PrimeVue adapter | PrimeVue-specific theme and integration layer | `packages/vue-primevue-adapter/**` |
| Web app | Browser app shell, routes, stores, views, app adapters | `apps/web-demo/**` |
| Desktop app | Tauri shell and desktop adapter | `apps/desktop/**`, `apps/desktop/src-tauri/**` |
| CI / deployment | GitHub Actions, Vercel, Pages | `.github/workflows/**`, `vercel.json` if present |

## 4. Priority Overview

| Priority | Meaning | Action policy |
|---|---|---|
| P0 | Blocking governance, parser, package boundary, or type-check repair | Fix before broad modernization |
| P1 | Architecture boundary and platform consistency | Fix before dependency or UI expansion |
| P2 | Modernization and dependency lanes | Execute in isolated branches |
| P3 | UI flow refactors and feature surface polish | Execute after P0/P1 stabilize |
| P4 | Deferred strategic work | Do not implement unless prerequisites are met |

## 5. P0 — Ledger Markdown Migration

Rationale: the current repo uses a versioned `.txt` repair ledger template and generates a local `.txt` ledger. The requested target is Markdown. This is a governance migration, not a content-only rename.

### Current defect

- The local runtime ledger is currently referenced as `.ai/runtime/repair_list.txt` in AI protocol, core rules, doctor, sync, preflight, migration script, docs, and owner decision log.
- `scripts/ai-sync.mjs` currently creates `.ai/runtime/repair_list.txt` from `.ai/runtime/repair_list.template.txt`.
- `scripts/migrate-ledger.mjs` currently reads `.ai/runtime/repair_list.txt` and writes `.ai/runtime/repair-ledger.json`.
- `scripts/ai-doctor.mjs` and `scripts/codex-preflight.mjs` currently require the `.txt` template and `.txt` runtime file.

### Required target state

- `.ai/runtime/repair_list.md` is the local runtime ledger.
- `.ai/runtime/repair_list.template.md` is the versioned template.
- `.ai/runtime/repair_list.template.txt` is retired after migration.
- `.ai/runtime/repair_list.txt` is no longer required by doctor or preflight.
- `repair-ledger.json` is generated from the Markdown ledger.
- During the transition, parsers may accept legacy icon-style task lines to avoid losing existing content.

### Tasks

- [x] [P0-Ledger-Template] Rename or replace `.ai/runtime/repair_list.template.txt` with `.ai/runtime/repair_list.template.md` and use this document as the new template content.
- [x] [P0-Ledger-Local] Ensure `pnpm ai:sync` creates `.ai/runtime/repair_list.md` from `.ai/runtime/repair_list.template.md` only when the local file does not already exist.
- [x] [P0-Ledger-NoOverwrite] Preserve the local runtime ledger during `ai:sync`; never overwrite `.ai/runtime/repair_list.md` once it exists.
- [x] [P0-Ledger-MigrateScript] Update `scripts/migrate-ledger.mjs` input from `.ai/runtime/repair_list.txt` to `.ai/runtime/repair_list.md`.
- [x] [P0-Ledger-Parser] Update `scripts/migrate-ledger.mjs` to parse Markdown task lines: `- [ ] [Module] Task` and `- [x] [Module] Task`.
- [x] [P0-Ledger-LegacyParser] Keep temporary parser support for legacy `[⬜️]` and `[✅]` lines until no legacy content remains.
- [x] [P0-Ledger-JsonSource] Ensure `repair-ledger.json.source` records `.ai/runtime/repair_list.md`.
- [x] [P0-Ledger-AiDoctor] Update `scripts/ai-doctor.mjs` canonical and local runtime checks from `.txt` to `.md`.
- [x] [P0-Ledger-AiDoctorOpen] Update `pnpm ai:doctor --open` to read `.ai/runtime/repair_list.md` and group open Markdown tasks.
- [x] [P0-Ledger-CodexPreflight] Update `scripts/codex-preflight.mjs` required paths from `.txt` to `.md`.
- [x] [P0-Ledger-Protocol] Update `.ai/protocol/AGENTS.core.md` from `.ai/runtime/*.template.txt` and `repair_list.txt` to `.ai/runtime/*.template.md` and `repair_list.md`.
- [x] [P0-Ledger-Rule] Update `.ai/rules/core/00-global-architect.mdc` ledger mandate to `.ai/runtime/repair_list.md`.
- [x] [P0-Ledger-Docs] Update all docs, rules, workflow comments, VS Code settings, and owner decision references that mention `repair_list.txt`.
- [x] [P0-Ledger-Search] Run a full repository search for `repair_list.txt`, `repair_list.template.txt`, and `.template.txt` references before completing the migration.
- [x] [P0-Ledger-Validation] Run `pnpm ai:sync`, `pnpm ai:doctor`, `pnpm codex:preflight`, and `pnpm governance:gate` after the migration.

## 6. P0 — Existing Type and SFC Repair Surface

Rationale: current legacy repair template already records blocking type and SFC issues. These should stay ahead of broad library modernization.

### Tasks

- [x] [P0-SFC] Move `defineOptions()` below top-level imports in `apps/web-demo/src/components/ProForm/renderers/ProFormNode.vue`, `apps/web-demo/src/components/ProTable/ProTable.vue`, and `apps/web-demo/src/components/ProTable/VirtualGridRenderer.vue` so the SFC parser restores module scope and downstream imports resolve.
- [x] [P0-Verify] Re-run `pnpm type-check` after the SFC fixes to confirm the error count collapses before touching secondary typing debt.
- [x] [P0-RepairLedger] Record residual type errors in `.ai/runtime/repair_list.md` after the focused SFC fix; residual TypeScript errors are currently none after the P0-SFC fix and full workspace `pnpm type-check`.
- [x] [P2-TurboOutputs] Verified Turbo build outputs for `@ccd/vue-charts#build` and `@ccd/vue-ui#build`: root `turbo.json` declares `build.outputs: ["dist/**"]`, both packages export `./dist/index.js` and `./dist/index.d.ts`, `pnpm ci:prepare-internal` and `pnpm build:shared-config` passed, and the M1-T3 warning scan found no no-output/cache-warning noise.

## 7. P0 — Internal Package Export Consistency

Rationale: architecture contract says internal workspace packages are consumed through build outputs. Some package manifests still expose source files directly.

### Current defect

- `packages/vue-ui/package.json` exports `./src/index.ts` and sets `main/module/types` to source paths.
- This conflicts with the architecture rule that internal workspace packages are consumed through build outputs.
- The mismatch can hide package boundary and build-output problems.

### Tasks

- [x] [P0-PackageExports-VueUI] Update `packages/vue-ui/package.json` exports to `./dist/index.js` and `./dist/index.d.ts` if the package build can emit these outputs.
- [x] [P0-PackageExports-Build] Add or adjust the `packages/vue-ui` build command so the package emits deterministic `dist` output instead of type-check-only source exports. Validated: satisfied by `@ccd/vue-ui` Vite library build plus `vue-tsc -p tsconfig.build.json` declaration emit.
- [x] [P0-PackageExports-Audit] Audit all `packages/*/package.json` manifests for direct `src` exports and build-output compliance. Result: all non-app workspace packages except `packages/vue-charts` currently align with the contract; `apps/web-demo` and `apps/desktop` remain app-local source-entry exceptions, not shared package contract violations.
- [x] [P0-PackageExports-VueCharts] `packages/vue-charts/package.json` now consumes `./dist/index.js` and `./dist/index.d.ts` through `exports`, `main`, `module`, and `types`; `ci:prepare-internal` was also updated to rebuild `@ccd/vue-charts` after `packages/*/dist` cleanup so internal prepare flows preserve the generated package outputs.
- [x] [P0-PackageExports-VueCharts-Build] `packages/vue-charts` now uses a Vite library build plus `vue-tsc -p tsconfig.build.json` declaration emit, keeping Vue/ECharts runtimes externalized while verifying clean outputs for `dist/index.js`, `dist/index.d.ts`, and required package-local declaration files.
- [x] [P0-PackageExports-Validation] Validated the `@ccd/vue-ui` and `@ccd/vue-charts` package export lane end-to-end through `pnpm ci:prepare-internal`, package smoke, dependent app type-checks, full `pnpm type-check`, `pnpm build:ci`, `pnpm governance:gate`, `pnpm ai:doctor --open`, and `pnpm codex:preflight` after restoring `@ccd/vue-ui` to the internal prepare build chain.

## 8. P1 — Core Type Tightening

Rationale: current repair template records type widening in core form/table logic. This should be fixed after the SFC parser repair.

### Tasks

- [x] [P1-CoreTypes] Tightened ProForm engine value precision by introducing `FormFieldValue<TValues>` and aligning `SubscriptionStore`, `FormController`, `ValidationEngine`, `useField`, `SchemaNormalizer`, and `ReactionEngine` boundaries to reduce `FieldState<unknown>` / `Record<string, unknown>` leakage while keeping runtime behavior unchanged.
- [x] [P1-CoreTypes-NoAny] Audited ProForm implementation code for `any`, `@ts-ignore`, and assertion-heavy core surfaces; implementation scan found no business-code `any`, and remaining casts are typed boundary bridges around generic schema keys, injection, record guards, or field/component adapter boundaries.
- [x] [P1-CoreTypes-Validation] Ran targeted ProForm validation: `pnpm --filter @ccd/web-demo type-check` passed, and focused Vitest for `FormController`, `DraftStorage`, `schemaResolver`, and `PrimeVueRenderer` passed with 4 files / 8 tests.

## 9. P1 — Capability Bridge Generics

Rationale: current repair template records `createCapabilityBridge` generic friction. Fake index signatures should not be required for valid capability contracts.

### Tasks

- [x] [P1-Bridge] Verified `packages/shared-utils/src/createCapabilityBridge.ts` already uses `T extends object`, so `AuthBridge`, `RouterCapabilities`, and `TestCapabilities` explicit interfaces satisfy the helper without fake index signatures; no implementation change was required.
- [x] [P1-Bridge-Contracts] Verified bridge capabilities remain explicit: no `[key: string]` or `Record<string, unknown>` catch-all appears in the bridge helper, shared-utils bridge spec, AuthBridge, or RouterCapabilities surfaces.
- [x] [P1-Bridge-Validation] Ran bridge validation covering creation and runtime adapter behavior: shared-utils and web-demo type-checks passed, and focused Vitest for `createCapabilityBridge`, `tokenProvider`, and `routeProvider` passed with 3 files / 19 tests.

## 10. P1 — ProTable Typing and Helper Restoration

Rationale: current repair template records missing ProTable typings and helper availability.

### Tasks

- [x] [P1-ProTable] Restored ProTable typing boundary: verified `useProTableInfiniteScroll` and `useProTableUrlSync` exist and are internal-only, introduced local `ProTableApiConfig`, and removed ProTable's type dependency on `@/utils/http/types` while preserving injected `apiExecutor` behavior.
- [x] [P1-ProTable-Exports] Exported approved public API types (`ProTableApiConfig`, `ProTableApiExecutor`, `ProTableApiExecutorContext`, `ProTableUrlSyncOptions`) from `apps/web-demo/src/components/ProTable/index.ts`; kept internal scroll/URL hooks unexported because external inventory found no public consumers, and updated the example executor import to the public ProTable boundary.
- [x] [P1-ProTable-Validation] Ran M3 validation: ProTable helper inventory, `pnpm --filter @ccd/web-demo type-check`, focused ProTable Vitest, and `pnpm api:report` all passed with evidence under `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/`.

## 11. P1 — UI Library Boundary and PrimeVue Adapter

Rationale: PrimeVue should remain the supported UI ecosystem, but CCD components and apps should not allow PrimeVue details to leak everywhere.

### Current direction

- Keep PrimeVue.
- Keep `@ccd/vue-primevue-adapter` as the PrimeVue-specific theme and integration layer.
- Keep `@ccd/vue-ui` as CCD-owned UI primitives and shared components.
- Do not switch to Element Plus, Naive UI, Ant Design Vue, or Tailwind as a rebuild strategy.
- Optional future headless primitives may use Reka UI only after `@ccd/vue-ui` boundaries are stable.

### Tasks

- [x] [P1-UIBoundary-Audit] Audited direct `primevue/*` and `@primevue/*` imports across `apps/web-demo/**`, `apps/desktop/**`, `packages/vue-ui/**`, and `packages/vue-primevue-adapter/**`; classified 37 direct source files in `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M4-T1-primevue-import-audit.md`.
- [x] [P1-UIBoundary-Policy] Recorded approved PrimeVue boundary policy in `docs/ai-plan/DECISIONS.md` D-003: adapter owns global integration; app bootstrap may install PrimeVue through adapter config/services; `@ccd/vue-ui` may compose PrimeVue inside CCD primitives but must not re-export raw PrimeVue; existing app direct imports are exact-allowlisted debt inventory, not current guard violations.
- [x] [P1-UIBoundary-Adapter] Verified `packages/vue-primevue-adapter/**` owns theme/PT/service adapter config and app bootstrap consumes `createPrimeVueAdapterConfig()` plus `installPrimeVueServices()`; no source move was required in this lane.
- [x] [P1-UIBoundary-Primitives] Verified `packages/vue-ui/**` exports CCD-owned primitives (`AnimateWrapper`, `CScrollbar`, `EmptyState`, `Icons`) and does not expose a loose raw PrimeVue re-export bucket; two internal PrimeVue compositions are recorded in the audit.
- [x] [P1-UIBoundary-Guard] Added `scripts/ai-architecture-guard.mjs` PrimeVue boundary enforcement: `@ccd/vue-ui` and `@ccd/vue-primevue-adapter` may import PrimeVue internally, tests may mock PrimeVue, existing app files are exact-allowlisted, new app direct PrimeVue imports fail, and raw `@ccd/vue-ui` PrimeVue re-exports fail.
- [x] [P1-UIBoundary-Validation] Ran M4 validation plus the UI-001 exact-allowlist guard validation: `pnpm ai:guard -- --format=json`, `pnpm governance:gate`, `pnpm ai:doctor`, `pnpm api:report`, `pnpm --filter @ccd/vue-ui build`, and `pnpm --filter @ccd/vue-primevue-adapter build` passed.
- [x] [P2-UIBoundary-GlobalServices] Extracted PrimeVue toast/message/locale helper logic from `apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue` into `packages/vue-primevue-adapter/src/services.ts`; focused adapter build and service tests passed in the active P2 run.
- [x] [P2-UIBoundary-ShowcaseException] Scoped direct PrimeVue import allowance for showcase examples to `apps/web-demo/src/views/example/components/primevue-collection/**`; non-showcase app files remain exact-allowlisted by `scripts/ai-architecture-guard.mjs`.

## 12. P1 — HTTP Contract and Request Boundary

Rationale: the stack currently uses alova. This should be preserved, but HTTP must be governed by explicit contracts and adapter boundaries.

### Current direction

- Keep alova as the high-level request toolkit.
- Do not switch to Axios.
- Ky may be used only as a low-level transport inside an approved adapter if there is a measurable reason.
- TanStack Query should remain deferred until server-state complexity justifies it.
- Zod should be used at API boundaries where runtime validation is needed.

### Tasks

- [x] [P1-HttpContract-Contracts] Added type-only HTTP contracts under `packages/contracts/src/http/**` (auth, error, request, response, retry, timeout, transport) per D-014 and `.ai/runtime/owner_decisions.md` HTTP contract scope `APPROVED`; `packages/core/src/http/**` remains blocked and app HTTP infrastructure stays canonical. Evidence: commit `892dad30`, `docs/ai-runs/20260530-205504-ccd-http-001-contracts-implementation/reports/http-001-contracts-implementation.md`, P18 closure `docs/ai-runs/20260601-180000-ccd-p18-g02-repair-ledger-debt-closure/reports/p18-selected-closure-batch.md`.
- [x] [P1-HttpContract-Core] Verified no current need for `packages/core/src/http/**`; adding runtime-neutral HTTP orchestration now would be speculative, and `packages/core` remains free of browser APIs, fetch, timers, storage, router, Pinia, and alova.
- [x] [P1-HttpContract-Adapter] Verified alova implementation remains in approved app infrastructure path `apps/web-demo/src/utils/http/**`, with `apps/web-demo/src/adapters/http.adapter.ts` owning Zod/route payload validation; no broad move to `apps/web-demo/src/adapters/http/**` was attempted.
- [x] [P1-HttpContract-Zod] Verified Zod validation exists only at app HTTP/API boundaries through `parseZodHttpPayload()` and `responseSchema`; no blanket schema churn was justified.
- [x] [P1-HttpContract-NoCoupling] Verified HTTP/API surfaces do not directly import Pinia stores, router, native storage, or session storage outside tests; auth/session behavior flows through `@/infra/auth/tokenProvider`.
- [x] [P1-HttpContract-Validation] Ran M5 validation: `pnpm arch:runtime`, `pnpm api:report`, `pnpm type-check`, and focused request-layer Vitest all passed with evidence under `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/`.
- [x] [P2-HttpMethodBuilders] Added example API Method builders and documented the request calling model: server-state/loading/cache/dedupe APIs prefer Method builders with `useHttpRequest`; one-shot compatibility wrappers remain explicitly imperative.
- [x] [P2-HttpRawTransportAllowlist] Documented and enforced raw transport exceptions for HTTP infrastructure, timezone probe, and the app-local Lottie asset loader.

## 13. P1 — Architecture Guard Coverage and Owner Decisions

Rationale: owner decision log records pending decisions about guard coverage, rule contradictions, design-token consolidation, and desktop drift CI.

### Tasks

- [x] [P1-Guard-SFCMacroOrder] D-023 FORMALLY_RESOLVED by owner/architect decision: current guard coverage is sufficient for Full GO; stricter guard work requires a future approved lane. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P1-Guard-TypeAssertions] D-023 FORMALLY_RESOLVED by owner/architect decision: current guard coverage is sufficient for Full GO; stricter guard work requires a future approved lane. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P1-Guard-AutoMitt] D-023 FORMALLY_RESOLVED by owner/architect decision: current guard coverage is sufficient for Full GO; stricter guard work requires a future approved lane. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P1-Guard-ComposableReturnTypes] D-023 FORMALLY_RESOLVED by owner/architect decision: current guard coverage is sufficient for Full GO; stricter guard work requires a future approved lane. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P1-Guard-DynamicUnoCSS] D-023 FORMALLY_RESOLVED by owner/architect decision: current guard coverage is sufficient for Full GO; stricter guard work requires a future approved lane. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P1-Guard-RuleContradictions] D-023 FORMALLY_RESOLVED by owner/architect decision: current guard coverage is sufficient for Full GO; stricter guard work requires a future approved lane. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P1-Guard-DesignTokenCanonical] D-023 FORMALLY_RESOLVED by owner/architect decision: current guard coverage is sufficient for Full GO; stricter guard work requires a future approved lane. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P1-Guard-OwnerSignoff] D-023 FORMALLY_RESOLVED by owner/architect decision: current guard coverage is sufficient for Full GO; stricter guard work requires a future approved lane. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.

## 13.5. P2 — App Platform Storage Boundary

Rationale: safeStorage has cross-app value, but browser storage access and obfuscation policy must not leak into `packages/core` or `packages/contracts`.

### Tasks

- [x] [P2-AppStorage-Contracts] Added runtime-neutral `SafeStoragePolicy`, `StorageCodec`, `SyncStorageCodec`, and `SafeStorageAdapter` contracts without browser imports.
- [x] [P2-AppStorage-Codec] Moved pure JSON storage serialization/parsing helpers to `packages/shared-utils/src/storageCodec.ts` and covered them with focused Vitest.
- [x] [P2-AppStorage-AppAdapter] Kept browser `localStorage` / `sessionStorage` policy and adapter implementation in `apps/web-demo/src/utils/safeStorage/**`; `packages/core` remains untouched.

## 14. P2 — Vite 8 Compatibility Lane

Rationale: current CCD uses Vite 7. Vite 8 uses Rolldown and Oxc internally. CCD currently has Vite config that relies on esbuild and Rollup options, so migration must be isolated.

### Current risk surface

- `apps/web-demo/vite.config.ts` uses `optimizeDeps.esbuildOptions`.
- `apps/web-demo/vite.config.ts` uses `esbuild.drop` and `esbuild.pure`.
- `apps/web-demo/vite.config.ts` uses `build.minify: 'esbuild'`.
- `apps/web-demo/vite.config.ts` uses Rollup `manualChunks` and `experimentalMinChunkSize`.
- Build plugins include custom ECharts tree-shake logic, compression, progress, HTML injection, build info, icon generation, and performance analysis.

### Tasks

- [x] [P2-Vite8-Branch] D-023 FORMALLY_RESOLVED by operator decision: Vite major migration is not a Full GO prerequisite; keep current Vite 7 on main and require a future isolated branch for any upgrade. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P2-Vite8-Inventory] Inventoried Vite/Rollup/esbuild-specific current surface in `apps/web-demo/vite.config.ts`, `apps/web-demo/build/**`, `apps/desktop/vite.config.ts`, `packages/vue-ui/vite.config.ts`, and `packages/vue-charts/vite.config.ts`; evidence: `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M9-T1-20260529-081820-vite-inventory.log` and `reports/M9-vite8-approval-gate.md`.
- [x] [P2-Vite8-OptimizeDeps] D-023 FORMALLY_RESOLVED by operator decision: Vite major migration is not a Full GO prerequisite; keep current Vite 7 on main and require a future isolated branch for any upgrade. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P2-Vite8-Oxc] D-023 FORMALLY_RESOLVED by operator decision: Vite major migration is not a Full GO prerequisite; keep current Vite 7 on main and require a future isolated branch for any upgrade. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P2-Vite8-Minify] D-023 FORMALLY_RESOLVED by operator decision: Vite major migration is not a Full GO prerequisite; keep current Vite 7 on main and require a future isolated branch for any upgrade. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P2-Vite8-Chunks] D-023 FORMALLY_RESOLVED by operator decision: Vite major migration is not a Full GO prerequisite; keep current Vite 7 on main and require a future isolated branch for any upgrade. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P2-Vite8-ECharts] D-023 FORMALLY_RESOLVED by operator decision: Vite major migration is not a Full GO prerequisite; keep current Vite 7 on main and require a future isolated branch for any upgrade. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P2-Vite8-Compression] D-023 FORMALLY_RESOLVED by operator decision: Vite major migration is not a Full GO prerequisite; keep current Vite 7 on main and require a future isolated branch for any upgrade. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P2-Vite8-Progress] Removed active `vite-plugin-progress` usage and recorded compatibility notes (`keep: false`) in `apps/web-demo/build/plugins.ts` during P2 BUILD-003; cosmetic plugin no longer blocks future Vite 8 lane review. Evidence: `docs/ai-runs/20260530-104228-ccd-p2-governance-css-build-modernization/reports/p2-governance-css-build-modernization.md` (BUILD-003), ledger `[x] [P2-CSS-BuildPluginCompatibility]`, P18 stale-entry closure `docs/ai-runs/20260601-180000-ccd-p18-g02-repair-ledger-debt-closure/reports/p18-selected-closure-batch.md`.
- [x] [P2-Vite8-Validation] D-023 FORMALLY_RESOLVED by operator decision: Vite major migration is not a Full GO prerequisite; keep current Vite 7 on main and require a future isolated branch for any upgrade. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.

## 15. P2 — Dependency Modernization Lane

Rationale: CCD already uses a modern Vue 3 stack. It should be upgraded by lanes, not by global latest replacement.

### Keep

- Vue 3
- TypeScript
- pnpm + Turbo monorepo
- Vite, but migrate cautiously
- UnoCSS
- PrimeVue
- alova
- Pinia
- Vue Router
- VueUse
- Zod
- Vitest
- Playwright
- Tauri 2

### Tasks

- [x] [P2-Deps-Outdated] Ran dependency inventory without package/lockfile mutation; evidence: `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M10-T1-20260529-081950-pnpm-deps-outdated.log`, `command-logs/M10-T1-20260529-082010-pnpm-outdated-json.log`, and `reports/M10-dependency-approval-gate.md`.
- [x] [P2-Deps-Vueuse] D-023 FORMALLY_RESOLVED by operator decision: dependency modernization is not a Full GO prerequisite; no manifest or lockfile change is authorized in this program, and future upgrades require single-dependency lanes. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P2-Deps-VueTooling] D-023 FORMALLY_RESOLVED by operator decision: dependency modernization is not a Full GO prerequisite; no manifest or lockfile change is authorized in this program, and future upgrades require single-dependency lanes. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P2-Deps-ESLint] D-023 FORMALLY_RESOLVED by operator decision: dependency modernization is not a Full GO prerequisite; no manifest or lockfile change is authorized in this program, and future upgrades require single-dependency lanes. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P2-Deps-PrimeVue] D-023 FORMALLY_RESOLVED by operator decision: dependency modernization is not a Full GO prerequisite; no manifest or lockfile change is authorized in this program, and future upgrades require single-dependency lanes. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P2-Deps-Alova] D-023 FORMALLY_RESOLVED by operator decision: dependency modernization is not a Full GO prerequisite; no manifest or lockfile change is authorized in this program, and future upgrades require single-dependency lanes. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P2-Deps-Playwright] D-023 FORMALLY_RESOLVED by operator decision: dependency modernization is not a Full GO prerequisite; no manifest or lockfile change is authorized in this program, and future upgrades require single-dependency lanes. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P2-Deps-Validation] D-023 FORMALLY_RESOLVED by operator decision: dependency modernization is not a Full GO prerequisite; no manifest or lockfile change is authorized in this program, and future upgrades require single-dependency lanes. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.

## 16. P2 — CSS, Tokens, and Responsive Engine

Rationale: the current PostCSS px-to-rem setup works by excluding UnoCSS classes through a selector blacklist. This is functional but fragile.

### Tasks

- [x] [P2-CSS-PxToRemAudit] Audited `postcss-pxtorem` usage in `apps/web-demo/vite.config.ts`; evidence: `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M8-T1-20260529-080113-css-pxtorem-audit.log` and `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M8-css-pxtorem.md`.
- [x] [P2-CSS-TokenFirst] Preserved token/UnoCSS generated styles outside global px-to-rem conversion by adding file-level UnoCSS exclusions without authored CSS rewrites; validation: `M8-20260529-081500-final-web-demo-type-check.log` and `M8-20260529-081515-final-pnpm-build-web-demo.log`.
- [x] [P2-CSS-BlacklistRisk] Reduced dependence on selector-only blacklists with `shouldExcludePxToRemFile()` while keeping the existing blacklist as a fallback.
- [x] [P2-CSS-PrimeVue] Preserved `node_modules` exclusion for PrimeVue and third-party CSS; build validation passed in `M8-20260529-081515-final-pnpm-build-web-demo.log`.
- [x] [P2-CSS-BuildPluginCompatibility] Added build plugin compatibility notes and removed active `vite-plugin-progress` usage without changing functional build plugins.
- [x] [P2-CSS-SassTypedConfig] Replaced Vite Sass `preprocessorOptions.scss as any` with an explicit local typed helper while preserving `api: 'modern-compiler'` and `charset: false`.
- [x] [P2-CSS-CiServerOpen] Made Vite dev/preview auto-open CI/e2e aware and set Playwright web server to `VITE_SERVER_OPEN=false`.
- [x] [P2-CSS-Mobile] Captured production mobile screenshots for `/login` and dashboard after the CSS config change; evidence: `screenshots/M8-login-mobile.png`, `screenshots/M8-dashboard-mobile.png`, and `reports/M8-production-screenshot-metrics.json`.
- [x] [P2-CSS-Validation] Resolved the prior table-heavy validation blocker with current P2 evidence: `pnpm e2e:layout`, `pnpm e2e:visual`, and `pnpm e2e:qa:prepared` passed in `docs/ai-runs/20260530-104228-ccd-p2-governance-css-build-modernization/command-logs/`, including the ProTable non-zero geometry regression.

## 17. P2 — Generated Artifacts and Governance Discipline

Rationale: generated files must be regenerated, not hand-edited.

### Tasks

- [x] [P2-Governance-Generated] Verified generated outputs were updated only by official commands; no manual edits were made to `docs/generated/**`, `.ai/generated/**`, or `.ai/governance/api-snapshots/**`, and post-gate status showed no remaining tracked drift in those generated paths.
- [x] [P2-Governance-Refresh] Ran `pnpm governance:refresh` after generated report changes; evidence saved under the active run command logs.
- [x] [P2-Governance-Gate] Ran `pnpm governance:gate`; first run generated governance artifacts and failed the sync check as expected, then the generated-sync rerun passed.
- [x] [P2-Governance-DocsCommands] Ran `pnpm docs:commands` after documentation command references were touched in planning/evidence docs.
- [x] [P2-Governance-ProjectDoctor] Verified project metadata through `pnpm governance:gate`, which runs `project:doctor`; no project metadata, package metadata, version, or branding files were changed in this lane.
- [x] [P2-Governance-NextActions] Refreshed `docs/ai-plan/NEXT_ACTIONS.md`, `docs/ai-plan/STATUS.md`, `docs/ai-plan/PLAN.md`, `docs/en/architecture-contract.md`, the P2 plan, and ledgers to reflect current P2 implementable/blocker status.

## 18. P2 — GitHub Repository Governance

Rationale: a new GitHub organization is deferred. The current repository should first gain stronger governance.

### Tasks

- [x] [P2-GitHub-BranchProtection] Documented recommended `main` branch protection in D-008 and the M7 report; no remote GitHub settings were changed.
- [x] [P2-GitHub-RequiredChecks] Verified local CI includes governance via `validate:governance` (`pnpm governance:gate`), type-check, tests, lint, production build, desktop build/budget, generated AI artifact sync, and E2E QA; required-check recommendations are recorded in D-008.
- [x] [P2-GitHub-Codeowners] D-023 FORMALLY_RESOLVED by operator decision: GitHub template/CODEOWNERS refinements are not Full GO prerequisites; current local governance remains sufficient, and no .github or remote change is authorized. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P2-GitHub-Templates] D-023 FORMALLY_RESOLVED by operator decision: GitHub template/CODEOWNERS refinements are not Full GO prerequisites; current local governance remains sufficient, and no .github or remote change is authorized. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P2-GitHub-Release] Verified release governance alignment through `pnpm governance:gate` release checks and existing release docs; no release automation rewrite was needed.
- [x] [P2-GitHub-Dependencies] Recorded dependency modernization policy in D-006 and M7 report; no dependency automation or upgrades were added without approval.

## 18.5. P3 — Example Documentation System Polish

Rationale: `apps/web-demo/src/views/example/**` documentation-style pages repeat the same shell/header markup and need a small shared view shell before broader documentation UI polish.

### Tasks

- [x] [P3-DocsShell] Added `ExampleDocPage` shared shell and applied it to representative type, empty-state, and system-state documentation pages without changing route, data, network, storage, or app runtime boundaries. Validation passed through targeted lint, web-demo type-check/build, `pnpm codex:preflight`, `pnpm ai:guard -- --format=json`, and Playwright desktop/mobile route checks.

## 19. P3 — Login Diorama Refactor Plan

Rationale: the legacy repair template contains a detailed login diorama plan. Keep it, but execute only after P0/P1 stabilization.

2026-05-30 P3 execution audit: no Login Diorama source lane was started because M11 operator approval and prerequisite stability are still missing. Evidence lives under `docs/ai-runs/20260530-114939-ccd-p3-feature-and-runtime-refactors/`.

### Target state

- `apps/web-demo/src/views/login/index.vue` becomes a single integrated diorama panel instead of two independent left/right cards.
- Brand identity floats above the panel center; theme and locale controls remain in the viewport top-right.
- The login form occupies the left 55%–60% of the desktop panel and keeps `ProForm` as the only multi-field form boundary.
- `AnimatedCharacters` occupies the right 40%–45% as a physical scene object, aligned to the panel floor and breaking above the panel top by 15%–20%.
- Password field visual structure is repaired so prefix icon, input body, and mask toggle stay inside one aligned control shell.
- Light/dark theme, size density, semantic tokens, responsive breakpoints, and design-engine UnoCSS laws remain authoritative.

### Preflight tasks

- [x] [P3-Login-Rules] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; no login files were edited.
- [x] [P3-Login-Context] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; top-K login implementation context was not built because the lane is not approved.
- [x] [P3-Login-PrimeVue] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; PrimeVue API verification is deferred until an approved login lane.
- [x] [P3-Login-Constraints] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; no login implementation changes were made.

### Layout and composition tasks

- [x] [P3-Login-Layout] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; Login Diorama layout was not implemented.
- [x] [P3-Login-Composition] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; brand/layout composition was not changed.
- [x] [P3-Login-Password] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; password shell was not changed.
- [x] [P3-Login-Depth] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; dark-mode elevation was not changed.
- [x] [P3-Login-VisualNoise] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; visual hierarchy was not changed.
- [x] [P3-Login-Shell] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; panel shell was not changed.
- [x] [P3-Login-Grid] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; panel grid was not changed.
- [x] [P3-Login-FormZone] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; form zone was not changed.
- [x] [P3-Login-StageZone] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; character stage zone was not changed.
- [x] [P3-Login-Breakout] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; character breakout positioning was not changed.
- [x] [P3-Login-TopControls] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; top controls were not changed.
- [x] [P3-Login-BottomLinks] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; bottom links were not changed.

### Form and interaction tasks

- [x] [P3-Login-ProForm] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; ProForm integration was not changed.
- [x] [P3-Login-Presets] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; demo account presets were not changed.
- [x] [P3-Login-Username] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; username focus wiring was not changed.
- [x] [P3-Login-PasswordState] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; password reaction state was not changed.
- [x] [P3-Login-PasswordShell] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; password shell was not rebuilt.
- [x] [P3-Login-Submit] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; submit flow was not changed.
- [x] [P3-Login-Feedback] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; login failure feedback was not changed.

### Animated character stage tasks

- [x] [P3-Login-Reuse] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; `AnimatedCharacters` was not changed.
- [x] [P3-Login-Scaling] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; character stage scaling was not changed.
- [x] [P3-Login-Floor] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; stage floor/shadow was not added.
- [x] [P3-Login-Overflow] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; overflow behavior was not changed.
- [x] [P3-Login-ReducedMotion] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; motion behavior was not changed.

### Design-engine compliance tasks

- [x] [P3-Login-Tokens] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; no login token usage was changed.
- [x] [P3-Login-Sizing] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; no login sizing was changed.
- [x] [P3-Login-Shortcuts] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; no UnoCSS shortcuts were added.
- [x] [P3-Login-Borders] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; no border utilities were changed.
- [x] [P3-Login-ZIndex] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; no z-index strategy was changed.
- [x] [P3-Login-RuleOf7] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; no login template utilities were changed.
- [x] [P3-Login-Deep] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; no new `:deep(.p-*)` selectors were added.

### Responsive strategy tasks

- [x] [P3-Login-Desktop] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; desktop diorama layout was not implemented.
- [x] [P3-Login-Tablet] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; tablet layout was not changed.
- [x] [P3-Login-Mobile] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; mobile layout was not changed.
- [x] [P3-Login-MobileGrid] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; mobile grid behavior was not changed.
- [x] [P3-Login-SafeArea] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; safe-area behavior was not changed.

### Validation tasks

- [x] [P3-Login-Static] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; no login code changes were made, so focused eslint was not applicable.
- [x] [P3-Login-Type] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; no focused refactor was made, so login-specific type validation was not applicable.
- [x] [P3-Login-Governance] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; no imports, boundaries, or runtime adapters were touched.
- [x] [P3-Login-Browser] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; no Login Diorama screenshots were captured for an unimplemented refactor.
- [x] [P3-Login-Responsive] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; responsive Diorama validation was not applicable.
- [x] [P3-Login-Interaction] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; interaction validation was not applicable.
- [x] [P3-Login-Regression] D-023 FORMALLY_RESOLVED by product/operator decision: Login Diorama is not a Full GO prerequisite; current login behavior remains canonical; password-shell regression validation was not applicable.

## 20. P3 — Directive Specs, Case Sensitivity, and Secondary Test Debt

Rationale: current repair template records secondary test and import-casing issues.

### Tasks

- [x] [P3-Tests] Focused directive specs were inspected and already use Vue 3 four-argument hook calls; no `expect-error` noise remains, and focused Vitest passed. Evidence: `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M12-T1-20260529-082430-directive-dateutils-noise-scan.log` and `command-logs/M12-T1-20260529-082500-focused-directive-vitest.log`.
- [x] [P3-CaseSensitivity] Normalized example `DateUtils` imports through the `@/utils/date` aggregate entry and added a named `DateUtils` export there; validation passed. Evidence: `reports/M12-secondary-test-casing.md`.
- [x] [P3-Verify] Ran `pnpm check`; it passed with the known two `vue/one-component-per-file` warnings in `packages/vue-hooks/src/createAutoMittHook.spec.ts`. Evidence: `command-logs/M12-T3-20260529-082620-pnpm-check.log`.

## 21. P4 — Deferred Strategic Work

Do not implement these until P0, P1, and the relevant P2 lanes are stable.

### Tasks

- [x] [P4-NewOrganization-Deferred] D-023 FORMALLY_RESOLVED by owner decision: strategic expansion work is not a Full GO prerequisite and remains future-charter work outside this remediation program. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P4-Starter-Deferred] D-023 FORMALLY_RESOLVED by owner decision: strategic expansion work is not a Full GO prerequisite and remains future-charter work outside this remediation program. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P4-DesignSystem-Deferred] D-023 FORMALLY_RESOLVED by owner decision: strategic expansion work is not a Full GO prerequisite and remains future-charter work outside this remediation program. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P4-RekaUI-Deferred] D-023 FORMALLY_RESOLVED by owner decision: strategic expansion work is not a Full GO prerequisite and remains future-charter work outside this remediation program. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P4-TanStackQuery-Deferred] D-023 FORMALLY_RESOLVED by owner decision: strategic expansion work is not a Full GO prerequisite and remains future-charter work outside this remediation program. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.
- [x] [P4-DesktopDriftCI] D-023 FORMALLY_RESOLVED by owner/operator decision: desktop drift CI is not a Full GO prerequisite; manual desktop validation remains sufficient until a future CI lane is approved. Evidence: docs/ai-runs/20260601-221034-ccd-full-remediation-d023-g02-closure/reports/g02-closure-table.md.

## 22. Validation Matrix

Use the smallest valid validation set first, then escalate.

| Change type | Minimum validation | Full validation |
|---|---|---|
| Ledger Markdown migration | `pnpm ai:sync`, `pnpm ai:doctor`, `pnpm codex:preflight` | `pnpm governance:gate` |
| AI rules / protocol | `pnpm ai:doctor`, `pnpm codex:preflight` | `pnpm governance:refresh`, `pnpm governance:gate` |
| Package exports | `pnpm ci:prepare-internal`, package build, `pnpm type-check` | `pnpm build:ci` |
| Vite config | `pnpm --filter @ccd/web-demo build` | `pnpm build:ci`, `pnpm vercel:build`, `pnpm e2e:qa` |
| HTTP contracts | `pnpm arch:runtime`, `pnpm api:report`, targeted tests | `pnpm validate` |
| UI boundary | `pnpm arch:boundaries`, `pnpm type-check` | browser screenshots + `pnpm e2e:qa` |
| Login UI | targeted eslint + web-demo type-check | Playwright screenshots + interaction smoke |
| Dependency lane | targeted package checks | `pnpm validate` |

## 23. Execution Order

Execute in this exact order unless the owner explicitly overrides it.

1. Upgrade runtime ledger from `.txt` to `.md`.
2. Run AI sync, doctor, preflight, and governance checks.
3. Fix P0 SFC parse/type-check blockers.
4. Fix internal package export consistency.
5. Tighten ProForm / ProTable / bridge typing.
6. Stabilize UI and HTTP architecture boundaries.
7. Resolve owner decisions and architecture guard coverage.
8. Run isolated Vite 8 compatibility lane.
9. Run isolated dependency modernization lanes.
10. Execute login diorama refactor.
11. Improve GitHub repository governance.
12. Revisit deferred organization/starter/design-system decisions only after the current repository is stable.

## 24. Anti-Patterns

Do not do the following:

- Do not rewrite CCD from scratch.
- Do not create a new organization or repository as a substitute for architecture repair.
- Do not replace PrimeVue just because another UI library is newer or fashionable.
- Do not switch from alova to Axios.
- Do not introduce TanStack Query until server-state complexity proves the need.
- Do not introduce raw `fetch`, raw storage, or router/store cross-coupling outside approved adapters.
- Do not introduce global `@ccd/*` TypeScript aliases.
- Do not hand-edit generated governance artifacts.
- Do not mix Vite 8 migration, UI refactor, HTTP refactor, and dependency upgrades in one branch.
- Do not weaken CI, governance gates, or AI preflight to make migration easier.

## 25. Completion Criteria

This ledger migration and repair plan is considered stable only when:

- `.ai/runtime/repair_list.md` exists locally and is used by AI workflows.
- `.ai/runtime/repair_list.template.md` exists in the repository.
- `.ai/runtime/repair_list.template.txt` is retired or no longer referenced by governance tooling.
- `scripts/migrate-ledger.mjs` generates `repair-ledger.json` from Markdown.
- `pnpm ai:sync` preserves existing local Markdown ledger content.
- `pnpm ai:doctor --open` lists open tasks from Markdown.
- `pnpm codex:preflight` checks Markdown paths.
- Repository search finds no stale required references to `repair_list.txt`.
- `pnpm ai:sync`, `pnpm ai:doctor`, `pnpm codex:preflight`, and `pnpm governance:gate` pass.
