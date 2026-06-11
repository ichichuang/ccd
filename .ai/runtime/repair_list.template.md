# CCD Runtime Repair Ledger

- Target path: `.ai/runtime/repair_list.md`
- Template source: `.ai/runtime/repair_list.template.md`
- Owner decisions: `.ai/runtime/owner_decisions.md`
- Rule coverage: `.ai/runtime/rule_coverage_matrix.md`
- Generated JSON target: `.ai/runtime/repair-ledger.json`
- Runtime state policy: `.ai/runtime/repair_list.md` is local runtime state; `pnpm ai:sync` may create it from `.ai/runtime/repair_list.template.md` when missing, but must not overwrite it once it exists.
- Last reorganized: 2026-06-05
- Owner decision: keep the current CCD architecture and perform staged modernization, not a full rebuild.

## 0. Purpose

This ledger is the canonical AI-readable repair and modernization plan for CCD. It consolidates:

1. Repository audit findings from the legacy flat repair list.
2. Architecture defects and modernization work tracked by the template.
3. Owner decision constraints from `.ai/runtime/owner_decisions.md`.
4. Guard and rule-coverage backlog from `.ai/runtime/rule_coverage_matrix.md`.

Do not treat this document as a normal issue list. It is an execution ledger for large AI-assisted refactors. Every item must be either open, completed, or explicitly deferred.

## 1. Ledger Format Contract

- `[ ]` means open.
- `[x]` means completed and validated.
- Each actionable task must start with `- [ ] [Module]` or `- [x] [Module]`.
- The `Module` label must include priority, for example `[P0-Ledger]`, `[P1-RouteModule]`, `[P2-Vite8]`.
- Do not mark a task complete until implementation and relevant validation commands pass.

Parser compatibility:

- `scripts/migrate-ledger.mjs` must parse `- [ ] [Module] Task` and `- [x] [Module] Task`.
- Legacy icon lines `[⬜️]` / `[✅]` remain accepted during migration only.

## 2. Architectural Non-Negotiables

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

| Area                   | Current responsibility                                                                                                | Main paths                                                                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| AI protocol and rules  | AI execution contract, preflight, rules, adapters                                                                     | `.ai/protocol/**`, `.ai/rules/**`, `.ai/skills/**`, `AGENTS.md`, `CLAUDE.md`                                                                     |
| Runtime ledger         | Local repair tracking and generated ledger JSON                                                                       | `.ai/runtime/repair_list.md`, `.ai/runtime/repair_list.template.md`, `.ai/runtime/repair-ledger.json`                                            |
| AI scripts             | Sync, doctor, preflight, migration, architecture guard                                                                | `scripts/ai-sync.mjs`, `scripts/ai-doctor.mjs`, `scripts/codex-preflight.mjs`, `scripts/migrate-ledger.mjs`, `scripts/ai-architecture-guard.mjs` |
| Architecture contracts | Human and AI architecture contracts                                                                                   | `wiki/canonical/**`, `wiki/indexes/**`, `.ai/protocol/**`                                                                                        |
| Contracts              | Runtime-neutral interfaces and DTOs                                                                                   | `packages/contracts/**`                                                                                                                          |
| Core                   | Runtime-neutral platform facade                                                                                       | `packages/core/**`                                                                                                                               |
| Frontend platform      | Tokens, UnoCSS preset, hooks, UI primitives, chart platform                                                           | `packages/design-tokens/**`, `packages/unocss-preset/**`, `packages/vue-hooks/**`, `packages/vue-ui/**`, `packages/vue-charts/**`                |
| PrimeVue adapter       | PrimeVue-specific theme and integration layer                                                                         | `packages/vue-primevue-adapter/**`                                                                                                               |
| Web-demo app           | browser `web-demo` application shell, routes, stores, views, app adapters, and app-level plugin wiring                | `apps/web-demo/**`                                                                                                                               |
| Desktop app            | dedicated Tauri desktop runtime shell with its own frontend entry, desktop adapters, and `src-tauri` backend boundary | `apps/desktop/**`, `apps/desktop/src-tauri/**`                                                                                                   |
| CI / deployment        | GitHub Actions, Vercel, Pages                                                                                         | `.github/workflows/**`, `vercel.json` if present                                                                                                 |

## 4. Priority Overview

| Priority | Meaning                                                             | Action policy                                 |
| -------- | ------------------------------------------------------------------- | --------------------------------------------- |
| P0       | Blocking governance, parser, package boundary, or type-check repair | Fix before broad modernization                |
| P1       | Architecture boundary, route integrity, and platform consistency    | Fix before dependency or UI expansion         |
| P2       | Modernization, build orchestration, and dependency lanes            | Execute in isolated branches                  |
| P3       | UI flow refactors, documentation polish, and secondary test debt    | Execute after P0/P1 stabilize                 |
| P4       | Deferred strategic work                                             | Do not implement unless prerequisites are met |

## 5. P0 — Ledger and Governance Surface

Rationale: the runtime ledger must remain machine-parseable and aligned with AI protocol references.

### Tasks

- [ ] [P0-Ledger-Template] Ensure `.ai/runtime/repair_list.template.md` remains the versioned template and matches this ledger contract.
- [ ] [P0-Ledger-Local] Ensure `pnpm ai:sync` creates `.ai/runtime/repair_list.md` from `.ai/runtime/repair_list.template.md` only when the local file does not already exist.
- [ ] [P0-Ledger-NoOverwrite] Preserve the local runtime ledger during `ai:sync`; never overwrite `.ai/runtime/repair_list.md` once it exists.
- [ ] [P0-Ledger-MigrateScript] Ensure `scripts/migrate-ledger.mjs` reads `.ai/runtime/repair_list.md` and writes `.ai/runtime/repair-ledger.json`.
- [ ] [P0-Ledger-Parser] Ensure `scripts/migrate-ledger.mjs` parses Markdown task lines: `- [ ] [Module] Task` and `- [x] [Module] Task`.
- [ ] [P0-Ledger-LegacyParser] Keep temporary parser support for legacy `[⬜️]` and `[✅]` lines until no legacy content remains.
- [ ] [P0-Ledger-Validation] Run `pnpm ai:sync`, `pnpm ai:doctor`, `pnpm codex:preflight`, and `pnpm governance:gate` after ledger edits.

## 6. P0 — Type, SFC, and Package Export Blockers

Rationale: blocking type and package-boundary defects must stay ahead of broad modernization.

### Tasks

- [ ] [P0-SFC] Move `defineOptions()` below top-level imports in `apps/web-demo/src/components/ProForm/renderers/ProFormNode.vue`, `apps/web-demo/src/components/ProTable/ProTable.vue`, and `apps/web-demo/src/components/ProTable/VirtualGridRenderer.vue` so the SFC parser restores module scope and downstream imports resolve.
- [ ] [P0-Verify] Re-run `pnpm type-check` after the SFC fixes to confirm the error count collapses before touching secondary typing debt.
- [ ] [P0-RepairLedger] Record residual type errors in this ledger after the focused SFC fix.
- [ ] [P0-PackageExports-VueUI] Update `packages/vue-ui/package.json` exports to `./dist/index.js` and `./dist/index.d.ts` if the package build can emit these outputs.
- [ ] [P0-PackageExports-Build] Add or adjust the `packages/vue-ui` build command so the package emits deterministic `dist` output instead of type-check-only source exports.
- [ ] [P0-PackageExports-Audit] Audit all `packages/*/package.json` manifests for direct `src` exports and align them with the build-output rule.
- [ ] [P0-PackageExports-Policy] Add explicit exports, types, and build artifact policies for every shared package to prevent accidental internal imports (`packages/*/package.json`).
- [ ] [P0-PackageExports-Validation] Run `pnpm ci:prepare-internal`, `pnpm --filter @ccd/vue-ui build`, `pnpm type-check`, and `pnpm build:web-demo`.

## 7. P0 — Build Self-Sufficiency

Rationale: each app must build from a clean checkout without fragile manual prebuild chains.

### Tasks

- [ ] [P0-Build-SelfSufficient] Fix build self-sufficiency so `apps/web-demo` and `apps/desktop` can build from a clean checkout without manually prebuilding internal packages (`apps/web-demo/package.json`, `apps/desktop/package.json`, root `package.json`).
- [ ] [P0-Build-DependencyDirection] Enforce dependency direction so runtime-agnostic packages cannot access browser, Node, Tauri, storage, network, timers, crypto, or console APIs (`packages/contracts`, `packages/core`, `scripts/architecture/**`).

## 8. P1 — Naming, Documentation, and App Identity

Rationale: historical alternate naming and ambiguous browser-app wording created broken filters, docs, and operator confusion; current canonical browser app identity is `web-demo`.

### Tasks

- [ ] [P1-Naming-Canonical] Align active documentation, scripts, package filters, generated command documentation, AI/runtime docs, and app metadata on the canonical `web-demo` browser app name without renaming `apps/web-demo` or `@ccd/web-demo` (`README.md`, `README.en.md`, `wiki/`, root `package.json`, `apps/web-demo/package.json`).
- [ ] [P1-Naming-Folder] Keep the folder/package identity decision open; do not rename `apps/web-demo` or `@ccd/web-demo` unless a future owner decision approves a different canonical app identity (`apps/web-demo`, `@ccd/web-demo`).
- [ ] [P1-Wiki-AppRoles] Update documentation to clearly identify `apps/web-demo` as the `web-demo` browser application and `apps/desktop` as the Tauri desktop runtime shell (`README.md`, `README.en.md`, `wiki/`).
- [ ] [P1-DemoMode-Prod] Disable production demo/mock mode unless the deployment is explicitly a public demo environment (`apps/web-demo/.env.production` or equivalent).

## 9. P1 — Route Module Integrity

Rationale: `apps/web-demo/src/router/modules/example.ts` is a 4158-line severe maintainability blocker.

### Current defect

- One mega route module owns components, hooks, utils, charts, forms, tables, auth, permissions, and architecture examples.
- Missing route smoke coverage increases lazy-import and redirect breakage risk.

### Tasks

- [ ] [P1-RouteModule-Split] Split the oversized route module in `apps/web-demo/src/router/modules/example.ts`.
- [ ] [P1-RouteModule-Groups] Extract route groups for components, hooks, utils, charts, forms, tables, auth, permissions, and architecture examples into separate route files under `apps/web-demo/src/router/modules/`.
- [ ] [P1-RouteModule-Smoke] Add route-level smoke tests for every `web-demo` route to catch broken lazy imports, missing pages, and invalid redirects (`apps/web-demo/src/router/modules/example.spec.ts`, `e2e/`).
- [ ] [P1-RouteModule-Metadata] Add typed route metadata validation for `titleKey`, `icon`, `rank`, `roles`, `auths`, `redirects`, and route names (`apps/web-demo/src/router/**`).
- [ ] [P1-RouteModule-Registration] Replace the single mega route aggregation with typed feature route registration or route discovery (`apps/web-demo/src/router/**`).
- [ ] [P1-RouteModule-DeadCode] Remove unused imports, dead demo code, orphaned routes, and unreachable pages after splitting route modules (`apps/web-demo/src/router/modules/example.ts`, `apps/web-demo/src/views/example/**`).

## 10. P1 — Core Typing and Capability Bridges

Rationale: ProForm, ProTable, and bridge generics remain blocking typing debt after SFC repair.

### Tasks

- [ ] [P1-CoreTypes] Tighten `apps/web-demo/src/components/ProForm/**` types, especially `FormController.ts`, `useField.ts`, `FieldRegistry.ts`, `SchemaNormalizer.ts`, and `ReactionEngine.ts`, so deep-clone, registry, and async-reaction values stop widening to `unknown` or `Record<string, unknown>`.
- [ ] [P1-CoreTypes-NoAny] Do not introduce `any` or assertion-driven business logic while repairing these types.
- [ ] [P1-CoreTypes-Validation] Run targeted `vue-tsc` and `vitest` checks for ProForm after changes.
- [ ] [P1-Bridge] Relax `apps/web-demo/src/infra/shared/createCapabilityBridge.ts` generics so `AuthBridge`, `RouterCapabilities`, and test bridges satisfy the helper without fake index signatures.
- [ ] [P1-Bridge-Contracts] Ensure bridge capabilities remain explicit and do not become a permissive catch-all map.
- [ ] [P1-Bridge-Validation] Run tests covering bridge creation and runtime adapter behavior.
- [ ] [P1-ProTable] Restore missing ProTable typings and helper availability, including `useProTableInfiniteScroll`, `useProTableUrlSync`, props shape, and related imports after the SFC parse fix.
- [ ] [P1-ProTable-Exports] Ensure helpers are exported from the correct local or package boundary.
- [ ] [P1-ProTable-Validation] Run targeted type-check and smoke tests for ProTable views.

## 11. P1 — Runtime Capability Model and Boundary Enforcement

Rationale: ad hoc runtime access must be replaced by explicit contracts and adapter injection.

### Tasks

- [ ] [P1-Capability-Model] Implement a formal runtime capability model for browser, desktop, storage, network, filesystem, shell, notifications, clipboard, and external navigation instead of ad hoc runtime access (`packages/contracts`, `packages/core`, `apps/*/adapters/**`).
- [ ] [P1-Boundary-Tests] Add architecture-boundary tests for shared placement of theme, tokens, UnoCSS preset, hooks, utils, i18n, request, and services (`dependency-cruiser` config, `scripts/architecture/**`).
- [ ] [P1-Package-Surfaces] Define explicit public export surfaces for shared packages and prevent imports from package internals across workspace boundaries (`packages/*/src/index.ts`, `packages/*/package.json`, `apps/*`).

## 12. P1 — UI Library Boundary and PrimeVue Adapter

Rationale: PrimeVue stays the supported UI ecosystem, but details must not leak across app and package boundaries. Owner decision D-003 is `APPROVED`.

### Tasks

- [ ] [P1-UIBoundary-Audit] Audit direct `primevue/*` imports in `apps/web-demo/**`, `apps/desktop/**`, and `packages/vue-ui/**`.
- [ ] [P1-UIBoundary-Policy] Define which PrimeVue imports are allowed in app bootstrap/plugin files and which must be routed through `@ccd/vue-ui` or `@ccd/vue-primevue-adapter`.
- [ ] [P1-UIBoundary-Adapter] Keep theme, PassThrough, services, and global PrimeVue configuration inside `packages/vue-primevue-adapter/**`.
- [ ] [P1-UIBoundary-Primitives] Ensure `packages/vue-ui/**` exports CCD-owned primitives and does not become a loose PrimeVue re-export bucket.
- [ ] [P1-UIBoundary-Migrate] Move reusable PrimeVue integration into `packages/vue-primevue-adapter` and leave only app registration inside apps (`apps/web-demo/src/plugins/modules/primevue.ts`).
- [ ] [P1-UIBoundary-Guard] Add or extend architecture guard rules to detect forbidden direct PrimeVue imports per the approved allowlist.
- [ ] [P1-UIBoundary-Validation] Run `pnpm api:report`, `pnpm arch:boundaries`, `pnpm type-check`, and focused UI smoke tests.

## 13. P1 — HTTP Contract and Request Boundary

Rationale: alova stays canonical. Owner decision D-014 is `APPROVED`: type-only HTTP contracts live in `packages/contracts/src/http/**`; app HTTP runtime stays app-owned under `apps/web-demo/src/utils/http/**`. Do not promote Alova runtime to `packages/core`.

### Tasks

- [ ] [P1-HttpContract-Contracts] Add or refine HTTP contracts under `packages/contracts/src/http/**`: request shape, response shape, error shape, transport client, retry policy, timeout policy, auth policy.
- [ ] [P1-HttpContract-ContractFacets] Extend HTTP contracts with base URL policy, interceptor lifecycle contracts, cancellation/abort semantics, and normalized error mapping (`packages/contracts/src/http/**`, `apps/web-demo/src/utils/http/**`).
- [ ] [P1-HttpContract-AppOwned] Keep alova instance, methods, interceptors, retry/cache/deduplication/timeout policies, auth refresh/token wiring, error mapping, UI notification behavior, and app Zod schema validation under `apps/web-demo/src/utils/http/**` or another approved app adapter path.
- [ ] [P1-HttpContract-Zod] Add Zod response validation only at boundary points where schemas are stable and validation cost is acceptable.
- [ ] [P1-HttpContract-NoCoupling] Ensure HTTP code does not directly couple router/store/session behavior except through approved bridges.
- [ ] [P1-HttpContract-Validation] Run `pnpm arch:runtime`, `pnpm api:report`, `pnpm type-check`, and request-layer tests.

## 14. P1 — safeStorage Ownership

Rationale: owner decisions D-016 and D-019 are `APPROVED`. Crypto, compression, and storage runtime stay app-owned.

### Tasks

- [ ] [P1-SafeStorage-AppOwned] Keep crypto/HMAC/Web Crypto, `lz-string` compression, Pinia serializer, storage maintenance, migration behavior, and facade exports app-owned under `apps/web-demo/src/utils/safeStorage/**`.
- [ ] [P1-SafeStorage-Contracts] Define storage capability contracts for app-owned safeStorage behavior without moving crypto, compression, or storage runtime out of `apps/web-demo/src/utils/safeStorage/**` (`packages/contracts`, `apps/web-demo/src/utils/safeStorage/**`).
- [ ] [P1-SafeStorage-NoSharedMove] Do not move safeStorage runtime to `@ccd/shared-utils` or mutate package manifests/lockfile for it in this program.

## 15. P1 — Architecture Guard Coverage and Rule Contradictions

Rationale: `rule_coverage_matrix.md` records partial guard coverage and six documented contradictions. Owner decisions mark strict guard expansion and rule-contradiction resolution as `FULL_GO_DEFERRED` for current Full GO, but backlog items remain tracked here.

### Rule contradiction backlog

- [ ] [P1-Guard-StorageContradiction] Clarify that only approved infrastructure may touch native storage; resolve the `04-safe-storage.mdc` wrapper example contradiction.
- [ ] [P1-Guard-VueUseContradiction] Add explicit VueUse exclusions to `00-root-gatekeeper.mdc` for restricted business HTTP/storage composables.
- [ ] [P1-Guard-TypeAssertionContradiction] Replace the `props.item as UserInfo` example in `08-vue-template-strictness.mdc` with an approved type-caster pattern.
- [ ] [P1-Guard-ScaffoldArchetype] Align scaffold output with the Pro Components archetype law or document scaffold archetypes as approved variants.
- [ ] [P1-Guard-DesignTokenCanonical] Choose a canonical design-token rule file and update duplicate references across design-system rules.

### Guard expansion backlog

- [ ] [P1-Guard-SFCMacroOrder] Add guard coverage for Vue SFC macro define order if the team accepts strict enforcement.
- [ ] [P1-Guard-TypeAssertions] Add guard coverage for banned business-code `as Type` assertion patterns, with explicit approved exceptions.
- [ ] [P1-Guard-AutoMitt] Add guard coverage for `useAutoMitt` enforcement where event bus patterns are expected.
- [ ] [P1-Guard-ComposableReturnTypes] Add guard coverage for composable return type annotations where architecture requires them.
- [ ] [P1-Guard-DynamicUnoCSS] Add guard coverage for dynamic UnoCSS class detection and approved safelist usage.
- [ ] [P1-Guard-DateUtils] Decide whether `ai:guard` should enforce DateUtils usage beyond the current raw-date-constructor rule.
- [ ] [P1-Guard-RouteModuleSize] Add max-file-length and max-route-module-size governance checks to prevent future 4000+ line route files (`eslint.config.ts`, `scripts/architecture/**`).
- [ ] [P1-Guard-OwnerSignoff] Update `.ai/runtime/owner_decisions.md` after owner decisions are made.

## 16. P1 — Desktop Security Baseline

Rationale: desktop currently exposes null CSP and incomplete permission scoping.

### Tasks

- [ ] [P1-Desktop-CSP] Replace null CSP with a restrictive production CSP (`apps/desktop/src-tauri/tauri.conf.json`).
- [ ] [P1-Desktop-CSP-Allowlist] Add CSP allowances only for local app assets and required API endpoints; avoid `unsafe-inline` or `unsafe-eval` unless explicitly justified.
- [ ] [P1-Desktop-Capabilities] Add Tauri v2 permissions and capabilities files with least-privilege scopes (`apps/desktop/src-tauri/capabilities/**`).
- [ ] [P1-Desktop-Scopes] Define explicit allow/deny scopes for filesystem, shell, dialog, clipboard, updater, opener, notification, HTTP, and external navigation before enabling any Tauri plugin.
- [ ] [P1-Desktop-NoPrematurePlugins] Avoid enabling shell or filesystem plugins until a concrete use case and scoped permission file exist.
- [ ] [P1-Desktop-SecurityChecks] Add automated security checks for CSP, permission scopes, plugin usage, and capabilities manifests (`scripts/architecture/**`).

## 17. P2 — Build Orchestration and Turbo

Rationale: Turborepo must own package build ordering instead of duplicated shell prebuild chains.

### Tasks

- [ ] [P2-Turbo-Tasks] Replace fragile manual prebuild chains with Turborepo task dependencies and pnpm workspace dependency graph resolution (`turbo.json`, root `package.json`).
- [ ] [P2-Turbo-InputsOutputs] Expand Turborepo task definitions with accurate inputs, outputs, cache behavior, and dependencies for build, type-check, lint, test, e2e, and package artifacts (`turbo.json`).
- [ ] [P2-Turbo-RemoveDuplicatePrebuild] Remove duplicated prebuild scripts once Turbo dependency orchestration handles package builds reliably.
- [ ] [P2-Turbo-BuildFailureOutput] Add clear failure output when shared package builds fail before app builds (`package.json` scripts, `scripts/exec.sh`).
- [ ] [P2-Turbo-WorkspaceWrappers] Add workspace-level wrappers for building filtered apps together with their dependencies (root `package.json`).

## 18. P2 — Shared Layer Consolidation

Rationale: reusable platform code should live in workspace packages; app-specific routes, pages, stores, and plugin wiring stay in apps.

### Tasks

- [ ] [P2-Shared-Dedupe] Remove duplicated shared capability implementations across `web-demo` and `desktop` and consume workspace packages instead.
- [ ] [P2-Shared-Utils] Move pure reusable utilities to `packages/shared-utils` and keep only app-domain utilities inside apps (`apps/web-demo/src/utils/**`).
- [ ] [P2-Shared-Hooks] Move reusable Vue composables to `packages/vue-hooks` and keep only app/runtime adapters in app-local hooks (`apps/web-demo/src/hooks/**`).
- [ ] [P2-Shared-Theme] Move generic theme engine primitives, size resolution, breakpoint helpers, and device helpers into shared packages (`apps/web-demo/src/utils/theme/**`, `packages/design-tokens`, `packages/vue-hooks`).
- [ ] [P2-Shared-I18n] Promote generic i18n setup into a shared app-platform package while keeping app-specific messages inside the app (`apps/web-demo/src/locales/**`).
- [ ] [P2-Shared-I18nContracts] Add shared i18n contracts for locale registration, fallback locale, message loading, and PrimeVue locale mapping (`apps/web-demo/src/locales/primevue-locales.ts`).
- [ ] [P2-Shared-Charts] Move chart runtime helpers into `packages/vue-charts` and keep page-specific chart configuration local (`apps/web-demo/src/views/example/components/use-echarts/**`).
- [ ] [P2-Shared-UnoCSS] Add shared extension points for theme and UnoCSS customization instead of app-level patches or overrides (`packages/design-tokens`, `packages/unocss-preset`).
- [ ] [P2-Shared-TokensSSOT] Make design tokens the single source of truth for colors, semantic colors, spacing, breakpoints, theme names, and responsive primitives (`packages/design-tokens`, `uno.config.ts`, `packages/unocss-preset`).
- [ ] [P2-Shared-Metadata] Centralize application metadata and version in one source and generate package manifests, Tauri config, and app constants from it (`project.config.json`, `apps/*/package.json`, `apps/desktop/src-tauri/tauri.conf.json`).
- [ ] [P2-Shared-MetadataDrift] Add drift checks that fail when package version, Tauri version, product name, desktop identifier, homepage, or app title diverge from the central config (`scripts/sync-version.mjs`, `scripts/sync-desktop-config.mjs`).
- [ ] [P2-Shared-AppLocalBoundaries] Keep app-specific routes, pages, stores, and plugin wiring inside `apps/web-demo` and prevent them from being exported as public shared package APIs (`apps/web-demo/src/router/**`, `apps/web-demo/src/views/**`, `apps/web-demo/src/stores/**`, `apps/web-demo/src/plugins/**`).

## 19. P2 — View and Example Surface Cleanup

Rationale: oversized example views and missing UX states create maintenance drag after route-module splitting.

### Tasks

- [ ] [P2-Views-Split] Split oversized view/page components and colocate page-specific schemas, mock data, constants, and composables beside each page (`apps/web-demo/src/views/example/**`).
- [ ] [P2-Views-Patterns] Extract repeated table, form, chart, and demo-page patterns into reusable components or composables (`apps/web-demo/src/views/example/**`, `packages/vue-ui`, `packages/vue-hooks`).
- [ ] [P2-Views-AsyncStates] Add loading, empty, and error states around async route components and data-fetching report pages (`apps/web-demo/src/views/example/**`).
- [ ] [P2-Views-I18nCoverage] Add i18n key coverage tests for every route `titleKey` and page-level translation key (`apps/web-demo/src/router/modules/example.ts`, `apps/web-demo/src/locales/**`).
- [ ] [P2-Views-RouteConstants] Replace repeated hard-coded route strings with typed route constants or generated route names where navigation is reused (`apps/web-demo/src/router/**`).

## 20. P2 — Environment, Dev Sync, and Vite Helpers

Rationale: local dev and deployment configuration must stay synchronized across web and desktop surfaces.

### Tasks

- [ ] [P2-Env-Schema] Add strict environment schema validation for API base URL, timeout, public path, compression mode, storage prefix, and desktop-specific variables (`build/utils`, `scripts/env-doctor.mjs`).
- [ ] [P2-Dev-PortSync] Synchronize Vite dev ports and Tauri `devUrl` through shared configuration (`apps/desktop/vite.config.ts`, `apps/desktop/src-tauri/tauri.conf.json`, `.env*`).
- [ ] [P2-Vite-SharedHelpers] Extract shared Vite configuration helpers where `web-demo` and `desktop` should stay aligned (`apps/web-demo/vite.config.ts`, `apps/desktop/vite.config.ts`).
- [ ] [P2-Vite-CORS] Restrict Vite dev and preview CORS unless open CORS is required for a specific local integration (`apps/web-demo/vite.config.ts`).
- [ ] [P2-Vite-BundleBudgets] Add bundle-budget checks to CI for both browser and desktop builds (`scripts/check-bundle-budgets.mjs`, `scripts/architecture/check-desktop-size.mjs`).

## 21. P2 — Vite 8 Compatibility Lane

Rationale: owner decision marks Vite major migration as `FULL_GO_DEFERRED` on `main`; execute only in an isolated branch.

### Current risk surface

- `apps/web-demo/vite.config.ts` uses `optimizeDeps.esbuildOptions`, `esbuild.drop`, `esbuild.pure`, `build.minify: 'esbuild'`, Rollup `manualChunks`, and `experimentalMinChunkSize`.
- Build plugins include custom ECharts tree-shake logic, compression, progress, HTML injection, build info, icon generation, and performance analysis.

### Tasks

- [ ] [P2-Vite8-Branch] Create an isolated branch such as `modernize/vite8-compat`; do not mix this work with UI or HTTP refactors.
- [ ] [P2-Vite8-Inventory] Inventory every Vite/Rollup/esbuild-specific option in `apps/web-demo/vite.config.ts`, `apps/web-demo/build/**`, root `vite.config.ts`, and package-level Vite config files if present.
- [ ] [P2-Vite8-OptimizeDeps] Replace or prepare migration from `optimizeDeps.esbuildOptions` to `optimizeDeps.rolldownOptions` where appropriate.
- [ ] [P2-Vite8-Oxc] Replace or prepare migration from top-level `esbuild` config to `oxc`/Rolldown minifier equivalents where appropriate.
- [ ] [P2-Vite8-Minify] Re-evaluate `build.minify: 'esbuild'` and console/drop behavior under Oxc minification.
- [ ] [P2-Vite8-Chunks] Re-test `manualChunks` and small chunk merging under Rolldown; avoid assuming Rollup behavior remains identical.
- [ ] [P2-Vite8-ECharts] Revalidate the custom `echarts-treeshake-enhance` plugin under Vite 8/Rolldown before keeping it.
- [ ] [P2-Vite8-Compression] Decide whether `vite-plugin-compression` remains a build concern or should move to deployment/server/CDN configuration.
- [ ] [P2-Vite8-Progress] Remove or replace `vite-plugin-progress` if it adds no measurable value or blocks Vite 8 compatibility.
- [ ] [P2-Vite8-Validation] Run `pnpm build:ci`, `pnpm vercel:build`, `pnpm e2e:qa`, and bundle budget checks on the isolated branch.

## 22. P2 — Dependency Modernization Lane

Rationale: owner decision marks dependency modernization as `FULL_GO_DEFERRED` for current Full GO; upgrade by isolated lanes only.

### Tasks

- [ ] [P2-Deps-Outdated] Run `pnpm deps:outdated` and record results in a branch-local note before upgrading.
- [ ] [P2-Deps-Catalogs] Replace scattered dependency version declarations with pnpm catalogs or a single dependency policy file (`pnpm-workspace.yaml`, root `package.json`, `apps/*/package.json`).
- [ ] [P2-Deps-Syncpack] Add syncpack or an equivalent dependency alignment check to CI.
- [ ] [P2-Deps-Dedupe] Deduplicate repeated Vue, Vite, TypeScript, PrimeVue, UnoCSS, and Tauri versions between root and app package manifests.
- [ ] [P2-Deps-VersionRangePolicy] Pin or range-manage major-version dependencies consistently instead of mixing update policies across apps and packages (`package.json`, `apps/*/package.json`, `packages/*/package.json`).
- [ ] [P2-Deps-RuntimeStack] Upgrade Vue runtime ecosystem dependencies in isolated compatibility lanes, including `vue`, `vue-router`, `vue-i18n`, `pinia`, `unocss`, and related runtime plugins (`package.json`, `apps/*/package.json`).
- [ ] [P2-Deps-Vueuse] Upgrade `@vueuse/core` in an isolated lane after checking compatibility with existing hooks and auto-imports.
- [ ] [P2-Deps-VueTooling] Align Vue compiler, `vue-tsc`, `@vue/tsconfig`, TypeScript, `@vitejs/plugin-vue`, and `@vitejs/plugin-vue-jsx` as a tested compatibility set; do not mix with Vite 8.
- [ ] [P2-Deps-ESLint] Upgrade ESLint ecosystem only if `lint:check` remains deterministic.
- [ ] [P2-Deps-PrimeVue] Upgrade PrimeVue only after checking v4 API changes for used components and adapter behavior.
- [ ] [P2-Deps-Alova] Upgrade alova only after request tests and adapter contracts exist.
- [ ] [P2-Deps-Playwright] Upgrade Playwright only after confirming browser install/cache behavior in CI.
- [ ] [P2-Deps-Tauri] Synchronize Tauri JS API, Tauri CLI, Rust `tauri`, and `tauri-build` versions with explicit minor/patch policy.
- [ ] [P2-Deps-Scanning] Add automated outdated and vulnerability scanning for pnpm and Cargo dependencies.
- [ ] [P2-Deps-UnusedAudit] Remove unused or demo-only dependencies after an import audit, especially heavy runtime packages not required by production pages.
- [ ] [P2-Deps-Validation] For each lane run targeted checks first, then `pnpm validate`.

## 23. P2 — CSS, Tokens, and Responsive Engine

Rationale: `postcss-pxtorem` selector blacklists are functional but fragile in a token-first architecture.

### Tasks

- [ ] [P2-CSS-PxToRemAudit] Audit `postcss-pxtorem` usage in `apps/web-demo/vite.config.ts` and confirm which authored CSS still needs conversion.
- [ ] [P2-CSS-TokenFirst] Prefer design tokens, CSS variables, `%`, viewport units, container queries, and UnoCSS rules over global px-to-rem conversion.
- [ ] [P2-CSS-BlacklistRisk] Reduce dependence on long selector blacklists where possible.
- [ ] [P2-CSS-PrimeVue] Ensure PrimeVue and third-party CSS remain excluded from accidental rem conversion.
- [ ] [P2-CSS-Mobile] Validate mobile layout and safe-area behavior after CSS changes.
- [ ] [P2-CSS-Validation] Run visual regression or screenshot checks for `/login`, dashboard, table-heavy views, and chart-heavy views.

## 24. P2 — Generated Artifacts and Governance Discipline

### Tasks

- [ ] [P2-Governance-Generated] Do not manually edit `wiki/generated/**`, `.ai/generated/**`, or `.ai/governance/api-snapshots/**`.
- [ ] [P2-Governance-Refresh] Run `pnpm governance:refresh` after dependency graph, API surface, supply-chain, or generated report changes.
- [ ] [P2-Governance-Gate] Run `pnpm governance:gate` before merging architecture changes.
- [ ] [P2-Governance-WikiCommands] Run `pnpm wiki:commands` if command documentation is touched.
- [ ] [P2-Governance-ProjectDoctor] Run `pnpm project:doctor` if `project.config.json`, package metadata, version, branding, or generated project metadata is touched.

## 25. P2 — GitHub Repository Governance

Rationale: owner decision marks branch protection and remote repository mutation as `FULL_GO_DEFERRED` for current Full GO. Track locally; do not mutate `.github/**` or remote settings without operator approval.

### Tasks

- [ ] [P2-GitHub-BranchProtection] Configure or document main branch protection: required PR, required checks, conversation resolution, and linear history if appropriate.
- [ ] [P2-GitHub-RequiredChecks] Ensure required checks include `governance:gate`, `type-check`, `lint:check`, `build:ci`, and UI/E2E checks when practical.
- [ ] [P2-GitHub-CIJobs] Add CI jobs for type-check, lint, unit tests, route smoke tests, e2e smoke, desktop build, and governance checks on clean artifacts (`.github/workflows/`, root `package.json`).
- [ ] [P2-GitHub-Codeowners] Add or update `CODEOWNERS` for architecture, AI rules, packages, apps, and workflows.
- [ ] [P2-GitHub-Templates] Add or refine PR and issue templates for architecture changes, UI changes, dependency upgrades, and bug reports.
- [ ] [P2-GitHub-Release] Keep release automation aligned with `project.config.json` and release governance scripts.
- [ ] [P2-GitHub-Dependencies] Add or refine dependency update policy; avoid blind `pnpm up --latest` on `main`.

## 26. P3 — Login Diorama Refactor Plan

Rationale: owner decision marks Login Diorama as `FULL_GO_DEFERRED` for current Full GO. Keep the plan; execute only after P0/P1 stabilization.

### Target state

- `apps/web-demo/src/views/login/index.vue` becomes a single integrated diorama panel instead of two independent left/right cards.
- Brand identity floats above the panel center; theme and locale controls remain in the viewport top-right.
- The login form occupies the left 55%–60% of the desktop panel and keeps `ProForm` as the only multi-field form boundary.
- `AnimatedCharacters` occupies the right 40%–45% as a physical scene object, aligned to the panel floor and breaking above the panel top by 15%–20%.
- Password field visual structure is repaired so prefix icon, input body, and mask toggle stay inside one aligned control shell.

### Preflight tasks

- [ ] [P3-Login-Rules] Re-read `.ai/protocol/AGENTS.core.md`, `.ai/rules/core/01-global-preflight.mdc`, `.ai/rules/core/02-ui-preflight.mdc`, `.ai/rules/components/00-primevue-ecosystem.mdc`, `.ai/rules/components/02-pro-components.mdc`, and `.ai/rules/design-system/00-unocss-guardrails.mdc` before editing login files.
- [ ] [P3-Login-Context] Build top-K context from `apps/web-demo/src/views/login/index.vue`, login components, `apps/web-demo/src/views/login/composables/useLoginSubmit.ts`, `packages/unocss-preset/src/shortcuts/semanticShortcuts.ts`, and relevant ProForm renderer typings.
- [ ] [P3-Login-PrimeVue] Verify PrimeVue v4 `Password`, `Button`, `Select`, `IconField`, and `InputText` APIs before changing props, slots, or PassThrough configuration.
- [ ] [P3-Login-Constraints] Confirm no native `<form>`, `<input>`, `<button>`, raw `overflow-auto`, raw hex colors, `rem`/`em`, raw z-index classes, invented shortcuts, or direct `glass-base` usage enter the login view.

### Layout and composition tasks

- [ ] [P3-Login-Layout] Replace the current independent `login-visual-panel` and `login-card` split with one `login-diorama-panel` that owns both form and character stage.
- [ ] [P3-Login-Composition] Remove duplicate brand placement inside the old visual panel and move brand/logo/title into a centered floating block above the diorama panel.
- [ ] [P3-Login-Password] Fix password icon misalignment caused by the separate absolute leading icon plus PrimeVue `Password` internal structure.
- [ ] [P3-Login-Depth] Improve dark-mode elevation using border plus inset-highlight semantics instead of relying on outer shadows alone.
- [ ] [P3-Login-VisualNoise] Reduce decorative copy and pills inside the main panel so the form and breakout character dominate the hierarchy.
- [ ] [P3-Login-Shell] Create a centered horizontal panel with `width: min(92vw, 960px)` baseline, max expansion capped near `1200px`, and height governed by viewport-safe min/max values.
- [ ] [P3-Login-Grid] Define panel internal grid as `minmax(0, 58%) minmax(0, 42%)` on desktop and keep it non-nested with existing layout shortcut laws.
- [ ] [P3-Login-FormZone] Place login heading, subtitle, presets, fields, submit button, register link, and version footer in the left zone with consistent token gaps.
- [ ] [P3-Login-StageZone] Place the character stage in the right zone with `overflow: visible`, floor alignment, and no extra textual content.
- [ ] [P3-Login-Breakout] Position `AnimatedCharacters` so the body baseline aligns to the panel lower visual floor and the top breaks out above the panel by 15%–20%.
- [ ] [P3-Login-TopControls] Keep theme switch and locale select in a compact top-right toolbar with safe-area offsets.
- [ ] [P3-Login-BottomLinks] Keep help/privacy links centered below the panel and visually separated from the panel bottom.

### Form and interaction tasks

- [ ] [P3-Login-ProForm] Preserve `ProForm` schema, validation, submit flow, demo account filling, locale re-keying, and `ProFormExpose` usage.
- [ ] [P3-Login-Presets] Convert demo accounts to a segmented-control-like pair using PrimeVue `Button` or approved component structure, keeping clear active/quick-fill affordance.
- [ ] [P3-Login-Username] Keep username focus state wired to `AnimatedCharacters` through `isUsernameFocused`.
- [ ] [P3-Login-PasswordState] Keep `passwordValue`, `passwordLength`, and `isPasswordVisible` synchronized so character password reactions remain deterministic.
- [ ] [P3-Login-PasswordShell] Rebuild the password field wrapper as one aligned control shell with prefix icon, input, and toggle inside the same visual boundary.
- [ ] [P3-Login-Submit] Keep one primary submit button, full-width within the form column, with loading state and existing redirect/global loading behavior unchanged.
- [ ] [P3-Login-Feedback] Keep failed login feedback routed through `window.$toast?.dangerIn` and clear only the password field after failure.

### Animated character stage tasks

- [ ] [P3-Login-Reuse] Reuse `AnimatedCharacters` rather than replacing GSAP animation logic.
- [ ] [P3-Login-Scaling] Adjust only the parent stage sizing and position first; modify `TOTEM_REF_W`, `TOTEM_REF_H`, or internal CSS vars only if browser evidence proves parent scaling cannot satisfy the design.
- [ ] [P3-Login-Floor] Add a subtle tokenized stage floor or shadow under the characters if needed, without adding text or unrelated ornamentation.
- [ ] [P3-Login-Overflow] Ensure the parent diorama panel allows character breakout while preserving panel clipping for internal form/material effects where needed.
- [ ] [P3-Login-ReducedMotion] Preserve current interaction behavior and verify no new infinite motion is added beyond existing GSAP loops.

### Design-engine compliance tasks

- [ ] [P3-Login-Tokens] Use semantic color tokens only: `background`, `card`, `foreground`, `muted`, `border`, `primary`, `info`, `success`, `warn`, and related foreground/light variants.
- [ ] [P3-Login-Sizing] Use CSS variables, `%`, `vw`, and `vh` for authored sizing; avoid `rem`/`em` and avoid unnecessary raw px outside existing animation geometry.
- [ ] [P3-Login-Shortcuts] Use only registered shortcuts from `semanticShortcuts.ts`; do not invent login-specific UnoCSS shortcuts unless the design engine registry is intentionally extended.
- [ ] [P3-Login-Borders] Pair every border utility with explicit style and semantic color if authored in template classes.
- [ ] [P3-Login-ZIndex] Use `z-base`, `z-content`, `z-layout`, `z-overlay`, `z-popover`, or DOM stacking context restructuring only.
- [ ] [P3-Login-RuleOf7] Move complex layout and decorative geometry into scoped CSS classes when template utility count would exceed the Rule of 7.
- [ ] [P3-Login-Deep] Avoid adding new `:deep(.p-*)` selectors beyond existing documented login exception unless a focused architectural justification is added.

### Responsive strategy tasks

- [ ] [P3-Login-Desktop] For `>= 1024px`, render the full horizontal diorama panel and breakout character stage.
- [ ] [P3-Login-Tablet] For `768px–1023px`, reduce panel width to viewport-safe bounds, shift form/stage ratio toward `65%/35%`, and scale characters down while preserving breakout.
- [ ] [P3-Login-Mobile] For `< 768px`, switch to single-column composition with brand, compact character overlap, form, and footer links stacked vertically.
- [ ] [P3-Login-MobileGrid] Hide or further weaken background grid on mobile if it competes with form legibility.
- [ ] [P3-Login-SafeArea] Preserve top and bottom `env(safe-area-inset-*)` spacing for mobile and desktop shells.

### Validation tasks

- [ ] [P3-Login-Static] Run `pnpm exec eslint apps/web-demo/src/views/login/index.vue apps/web-demo/src/views/login/components/*.vue apps/web-demo/src/views/login/composables/useLoginSubmit.ts` after code changes.
- [ ] [P3-Login-Type] Run `pnpm --filter @ccd/web-demo type-check` after the focused refactor.
- [ ] [P3-Login-Governance] Run `pnpm arch:runtime`, `pnpm api:report`, and `pnpm supply:check` if imports, package boundaries, or runtime adapters are touched.
- [ ] [P3-Login-Browser] Use Browser plugin or Playwright fallback to capture `/login` in light and dark modes at desktop width.
- [ ] [P3-Login-Responsive] Capture or inspect tablet and mobile breakpoints for panel wrapping, character breakout, safe-area spacing, and footer position.
- [ ] [P3-Login-Interaction] Verify username focus makes characters react, password typing triggers privacy behavior, password visibility toggle updates state, presets fill both fields, failed login clears password only, and successful login redirects.
- [ ] [P3-Login-Regression] Verify the password prefix icon and visibility toggle remain inside the input shell in both light and dark screenshots.

## 27. P3 — Documentation, Desktop Follow-Up, and Secondary Debt

### Documentation tasks

- [ ] [P3-Wiki-ArchitectureMap] Add a concise monorepo architecture map showing permitted dependency direction and runtime boundaries (`wiki/`, `README.md`).
- [ ] [P3-Wiki-PackageResponsibilities] Document the responsibilities of every shared package and every app-local adapter boundary (`wiki/`, `packages/*`, `apps/*`).
- [ ] [P3-Docs-RouteInventory] Add route/page inventory documentation for all report instance pages and their owners (`apps/web-demo/src/router/modules/example.ts`, `apps/web-demo/src/views/example/**`).
- [ ] [P3-Docs-DevCommands] Standardize local development command documentation for web, desktop, build, type-check, lint, and validation workflows (`README.md`, `README.en.md`, root `package.json`).
- [ ] [P3-Docs-RemoveDemoWording] Remove stale template, example, or demo-only wording from production-facing docs and metadata where the project is no longer only a demo (`README.md`, `.env.*`, `apps/web-demo/**`).
- [ ] [P3-Docs-DesktopBoundary] Document whether the desktop app intentionally reuses the web frontend or maintains a dedicated desktop frontend boundary (`apps/desktop/src/**`, `apps/web-demo/src/**`).

### Desktop follow-up tasks

- [ ] [P3-Desktop-SmokeCI] Add desktop smoke validation for Tauri dev and release builds in CI (`apps/desktop/package.json`, `apps/desktop/src-tauri/Cargo.toml`, `.github/workflows/**`).
- [ ] [P3-Desktop-Bundling] Enable production bundling or document why desktop bundling is intentionally disabled (`apps/desktop/src-tauri/tauri.conf.json`).
- [ ] [P3-Desktop-IPC] Add typed frontend IPC wrappers instead of scattering raw `invoke` calls through UI code (`apps/desktop/src/**`, `packages/contracts`).
- [ ] [P3-Desktop-IPCSchemas] Validate all frontend-to-backend payloads with shared schemas/contracts before executing Rust commands.
- [ ] [P3-Desktop-Icons] Add production icons and complete bundle metadata for desktop distribution (`apps/desktop/src-tauri/icons/**`).
- [ ] [P3-Desktop-WindowDefaults] Set explicit production window and navigation defaults such as resizable/fullscreen behavior, external navigation policy, and asset protocol scopes.
- [ ] [P3-Desktop-RustLogging] Add a Rust backend startup logging and error strategy instead of a generic startup expect message (`apps/desktop/src-tauri/src/main.rs`).

### Secondary test and tooling tasks

- [ ] [P3-Tests] Update directive specs for Vue 3 four-argument directive hook signatures and clean up unused imports / `expect-error` noise in focused test files.
- [ ] [P3-CaseSensitivity] Normalize `DateUtils` / `dateUtils` import casing across example views and shared date utilities.
- [ ] [P3-Tooling-CrossPlatform] Replace shell-specific script syntax with Node wrappers or cross-platform tooling where Windows support matters.
- [ ] [P3-Tooling-Stylelint] Audit Stylelint and Prettier-related Stylelint config compatibility with the installed Stylelint major version (`stylelint.config.mjs`, root `package.json`).
- [ ] [P3-Tooling-I18nReview] Review `vue-i18n` usage and migration path against the current supported major version and composition API recommendations.
- [ ] [P3-Verify] Run `pnpm check` and capture the final residual error surface once targeted repairs land.

## 28. P4 — Deferred Strategic Work

Do not implement these until P0, P1, and the relevant P2 lanes are stable.

### Owner-deferred items

- [ ] [P4-NewOrganization-Deferred] Do not create a new GitHub organization or new repository now; first stabilize current repository governance and architecture.
- [ ] [P4-Starter-Deferred] Create `ccd-vue-starter` only after `@ccd/contracts`, `@ccd/core`, `@ccd/vue-ui`, and `@ccd/vue-primevue-adapter` are stable.
- [ ] [P4-DesignSystem-Deferred] Split a standalone design-system repository only after UI primitives and adapter boundaries are stable.
- [ ] [P4-RekaUI-Deferred] Evaluate Reka UI only for specific headless primitive gaps after PrimeVue adapter boundaries are stable.
- [ ] [P4-TanStackQuery-Deferred] Evaluate TanStack Query Vue only if server-state complexity exceeds what alova + explicit adapters can cleanly handle.
- [ ] [P4-DesktopDriftCI] Add desktop drift CI only after owner sign-off on enforcement scope.

### Rejected or blocked by approved owner decisions

- [ ] [P4-HttpCore-Blocked] Do not promote Alova HTTP runtime into `packages/core` or a new `packages/request` package; D-014 keeps app HTTP runtime app-owned.
- [ ] [P4-SafeStorageShared-Blocked] Do not promote safeStorage compression/runtime to `@ccd/shared-utils`; D-019 keeps it app-owned.

### Low-priority strategic documentation

- [ ] [P4-ADR-Stack] Add architecture decision records for Vue 3, Vite, UnoCSS, PrimeVue, Tauri v2, pnpm workspace, and Turborepo choices (`wiki/canonical/decisions/`).
- [ ] [P4-Desktop-RustCommands] Add Rust command handlers only through audited, typed boundaries when backend commands are introduced.
- [ ] [P4-Desktop-RustErrors] Add Rust-side structured error types instead of string-only IPC errors when commands are added.
- [ ] [P4-Desktop-Updater] Add updater and deep-link configuration only when needed and only with a documented security model.
- [ ] [P4-Deps-WorkspacePlacement] Decide whether workspace packages belong in root dependencies or devDependencies and keep placement consistent.
- [ ] [P4-Deps-OverridesPolicy] Add a documented pnpm overrides and constraints policy for transitive dependency risk.
- [ ] [P4-Release-Changesets] Keep Changesets or release automation aligned with the centralized project version strategy.

## 29. Validation Matrix

Use the smallest valid validation set first, then escalate.

| Change type               | Minimum validation                                           | Full validation                                     |
| ------------------------- | ------------------------------------------------------------ | --------------------------------------------------- |
| Ledger Markdown migration | `pnpm ai:sync`, `pnpm ai:doctor`, `pnpm codex:preflight`     | `pnpm governance:gate`                              |
| AI rules / protocol       | `pnpm ai:doctor`, `pnpm codex:preflight`                     | `pnpm governance:refresh`, `pnpm governance:gate`   |
| Package exports           | `pnpm ci:prepare-internal`, package build, `pnpm type-check` | `pnpm build:ci`                                     |
| Route module split        | route smoke tests, `pnpm type-check`                         | `pnpm e2e:qa`                                       |
| Vite config               | `pnpm --filter @ccd/web-demo build`                          | `pnpm build:ci`, `pnpm vercel:build`, `pnpm e2e:qa` |
| HTTP contracts            | `pnpm arch:runtime`, `pnpm api:report`, targeted tests       | `pnpm validate`                                     |
| UI boundary               | `pnpm arch:boundaries`, `pnpm type-check`                    | browser screenshots + `pnpm e2e:qa`                 |
| Desktop security          | capabilities/CSP audit scripts                               | desktop build + smoke validation                    |
| Login UI                  | targeted eslint + web-demo type-check                        | Playwright screenshots + interaction smoke          |
| Dependency lane           | targeted package checks                                      | `pnpm validate`                                     |

## 30. Execution Order

Execute in this exact order unless the owner explicitly overrides it.

1. Keep the runtime ledger parseable and aligned with AI protocol references.
2. Run AI sync, doctor, preflight, and governance checks.
3. Fix P0 SFC parse/type-check blockers and package export consistency.
4. Fix P0 build self-sufficiency and dependency-direction enforcement.
5. Resolve P1 naming, route-module integrity, and documentation identity issues.
6. Tighten ProForm / ProTable / bridge typing and runtime capability boundaries.
7. Stabilize UI, HTTP, and safeStorage architecture boundaries per approved owner decisions.
8. Resolve rule contradictions and architecture guard coverage backlog.
9. Harden desktop CSP and capabilities baseline.
10. Run isolated Turbo/build orchestration and shared-layer consolidation lanes.
11. Run isolated Vite 8 and dependency modernization lanes.
12. Execute login diorama refactor and secondary documentation debt.
13. Improve GitHub repository governance only with operator approval.
14. Revisit deferred organization/starter/design-system decisions only after the current repository is stable.

## 31. Anti-Patterns

Do not do the following:

- Do not rewrite CCD from scratch.
- Do not create a new organization or repository as a substitute for architecture repair.
- Do not replace PrimeVue just because another UI library is newer or fashionable.
- Do not switch from alova to Axios.
- Do not promote Alova HTTP runtime or safeStorage compression into shared packages against approved owner decisions.
- Do not introduce TanStack Query until server-state complexity proves the need.
- Do not introduce raw `fetch`, raw storage, or router/store cross-coupling outside approved adapters.
- Do not introduce global `@ccd/*` TypeScript aliases.
- Do not hand-edit generated governance artifacts.
- Do not mix Vite 8 migration, UI refactor, HTTP refactor, and dependency upgrades in one branch.
- Do not weaken CI, governance gates, or AI preflight to make migration easier.

## 32. Completion Criteria

This ledger is considered stable only when:

- `.ai/runtime/repair_list.md` exists locally and is used by AI workflows.
- `.ai/runtime/repair_list.template.md` exists in the repository.
- `scripts/migrate-ledger.mjs` generates `repair-ledger.json` from Markdown.
- `pnpm ai:sync` preserves existing local Markdown ledger content.
- `pnpm ai:doctor --open` lists open tasks from Markdown.
- `pnpm codex:preflight` checks Markdown paths.
- Repository search finds no stale required references to `repair_list.txt`.
- `pnpm ai:sync`, `pnpm ai:doctor`, `pnpm codex:preflight`, and `pnpm governance:gate` pass.

## 33. How to use this checklist

Place this Markdown file at `/.ai/runtime/repair_list.md`. Each actionable task can be checked off only after implementation and relevant validation commands pass.
