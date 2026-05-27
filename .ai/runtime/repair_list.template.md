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

| Area                   | Current responsibility                                      | Main paths                                                                                                                                       |
| ---------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| AI protocol and rules  | AI execution contract, preflight, rules, adapters           | `.ai/protocol/**`, `.ai/rules/**`, `.ai/skills/**`, `AGENTS.md`, `CLAUDE.md`                                                                     |
| Runtime ledger         | Local repair tracking and generated ledger JSON             | `.ai/runtime/repair_list.md`, `.ai/runtime/repair_list.template.md`, `.ai/runtime/repair-ledger.json`                                            |
| AI scripts             | Sync, doctor, preflight, migration, architecture guard      | `scripts/ai-sync.mjs`, `scripts/ai-doctor.mjs`, `scripts/codex-preflight.mjs`, `scripts/migrate-ledger.mjs`, `scripts/ai-architecture-guard.mjs` |
| Architecture contracts | Human and AI architecture contracts                         | `docs/en/architecture-contract.md`, `docs/en/governance-contract.md`, `docs/governance/**`                                                       |
| Contracts              | Runtime-neutral interfaces and DTOs                         | `packages/contracts/**`                                                                                                                          |
| Core                   | Runtime-neutral platform facade                             | `packages/core/**`                                                                                                                               |
| Frontend platform      | Tokens, UnoCSS preset, hooks, UI primitives, chart platform | `packages/design-tokens/**`, `packages/unocss-preset/**`, `packages/vue-hooks/**`, `packages/vue-ui/**`, `packages/vue-charts/**`                |
| PrimeVue adapter       | PrimeVue-specific theme and integration layer               | `packages/vue-primevue-adapter/**`                                                                                                               |
| Web app                | Browser app shell, routes, stores, views, app adapters      | `apps/web-demo/**`                                                                                                                               |
| Desktop app            | Tauri shell and desktop adapter                             | `apps/desktop/**`, `apps/desktop/src-tauri/**`                                                                                                   |
| CI / deployment        | GitHub Actions, Vercel, Pages                               | `.github/workflows/**`, `vercel.json` if present                                                                                                 |

## 4. Priority Overview

| Priority | Meaning                                                             | Action policy                                 |
| -------- | ------------------------------------------------------------------- | --------------------------------------------- |
| P0       | Blocking governance, parser, package boundary, or type-check repair | Fix before broad modernization                |
| P1       | Architecture boundary and platform consistency                      | Fix before dependency or UI expansion         |
| P2       | Modernization and dependency lanes                                  | Execute in isolated branches                  |
| P3       | UI flow refactors and feature surface polish                        | Execute after P0/P1 stabilize                 |
| P4       | Deferred strategic work                                             | Do not implement unless prerequisites are met |

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

- [ ] [P0-Ledger-Template] Rename or replace `.ai/runtime/repair_list.template.txt` with `.ai/runtime/repair_list.template.md` and use this document as the new template content.
- [ ] [P0-Ledger-Local] Ensure `pnpm ai:sync` creates `.ai/runtime/repair_list.md` from `.ai/runtime/repair_list.template.md` only when the local file does not already exist.
- [ ] [P0-Ledger-NoOverwrite] Preserve the local runtime ledger during `ai:sync`; never overwrite `.ai/runtime/repair_list.md` once it exists.
- [ ] [P0-Ledger-MigrateScript] Update `scripts/migrate-ledger.mjs` input from `.ai/runtime/repair_list.txt` to `.ai/runtime/repair_list.md`.
- [ ] [P0-Ledger-Parser] Update `scripts/migrate-ledger.mjs` to parse Markdown task lines: `- [ ] [Module] Task` and `- [x] [Module] Task`.
- [ ] [P0-Ledger-LegacyParser] Keep temporary parser support for legacy `[⬜️]` and `[✅]` lines until no legacy content remains.
- [ ] [P0-Ledger-JsonSource] Ensure `repair-ledger.json.source` records `.ai/runtime/repair_list.md`.
- [ ] [P0-Ledger-AiDoctor] Update `scripts/ai-doctor.mjs` canonical and local runtime checks from `.txt` to `.md`.
- [ ] [P0-Ledger-AiDoctorOpen] Update `pnpm ai:doctor --open` to read `.ai/runtime/repair_list.md` and group open Markdown tasks.
- [ ] [P0-Ledger-CodexPreflight] Update `scripts/codex-preflight.mjs` required paths from `.txt` to `.md`.
- [ ] [P0-Ledger-Protocol] Update `.ai/protocol/AGENTS.core.md` from `.ai/runtime/*.template.txt` and `repair_list.txt` to `.ai/runtime/*.template.md` and `repair_list.md`.
- [ ] [P0-Ledger-Rule] Update `.ai/rules/core/00-global-architect.mdc` ledger mandate to `.ai/runtime/repair_list.md`.
- [ ] [P0-Ledger-Docs] Update all docs, rules, workflow comments, VS Code settings, and owner decision references that mention `repair_list.txt`.
- [ ] [P0-Ledger-Search] Run a full repository search for `repair_list.txt`, `repair_list.template.txt`, and `.template.txt` references before completing the migration.
- [ ] [P0-Ledger-Validation] Run `pnpm ai:sync`, `pnpm ai:doctor`, `pnpm codex:preflight`, and `pnpm governance:gate` after the migration.

## 6. P0 — Existing Type and SFC Repair Surface

Rationale: current legacy repair template already records blocking type and SFC issues. These should stay ahead of broad library modernization.

### Tasks

- [ ] [P0-SFC] Move `defineOptions()` below top-level imports in `apps/web-demo/src/components/ProForm/renderers/ProFormNode.vue`, `apps/web-demo/src/components/ProTable/ProTable.vue`, and `apps/web-demo/src/components/ProTable/VirtualGridRenderer.vue` so the SFC parser restores module scope and downstream imports resolve.
- [ ] [P0-Verify] Re-run `pnpm type-check` after the SFC fixes to confirm the error count collapses before touching secondary typing debt.
- [ ] [P0-RepairLedger] Record residual type errors in `.ai/runtime/repair_list.md` after the focused SFC fix.

## 7. P0 — Internal Package Export Consistency

Rationale: architecture contract says internal workspace packages are consumed through build outputs. Some package manifests still expose source files directly.

### Current defect

- `packages/vue-ui/package.json` exports `./src/index.ts` and sets `main/module/types` to source paths.
- This conflicts with the architecture rule that internal workspace packages are consumed through build outputs.
- The mismatch can hide package boundary and build-output problems.

### Tasks

- [ ] [P0-PackageExports-VueUI] Update `packages/vue-ui/package.json` exports to `./dist/index.js` and `./dist/index.d.ts` if the package build can emit these outputs.
- [ ] [P0-PackageExports-Build] Add or adjust the `packages/vue-ui` build command so the package emits deterministic `dist` output instead of type-check-only source exports.
- [ ] [P0-PackageExports-Audit] Audit all `packages/*/package.json` manifests for direct `src` exports and align them with the build-output rule.
- [ ] [P0-PackageExports-Validation] Run `pnpm ci:prepare-internal`, `pnpm --filter @ccd/vue-ui build`, `pnpm type-check`, and `pnpm build:web-demo`.

## 8. P1 — Core Type Tightening

Rationale: current repair template records type widening in core form/table logic. This should be fixed after the SFC parser repair.

### Tasks

- [ ] [P1-CoreTypes] Tighten `apps/web-demo/src/components/ProForm/**` types, especially `FormController.ts`, `useField.ts`, `FieldRegistry.ts`, `SchemaNormalizer.ts`, and `ReactionEngine.ts`, so deep-clone, registry, and async-reaction values stop widening to `unknown` or `Record<string, unknown>`.
- [ ] [P1-CoreTypes-NoAny] Do not introduce `any` or assertion-driven business logic while repairing these types.
- [ ] [P1-CoreTypes-Validation] Run targeted `vue-tsc` and `vitest` checks for ProForm after changes.

## 9. P1 — Capability Bridge Generics

Rationale: current repair template records `createCapabilityBridge` generic friction. Fake index signatures should not be required for valid capability contracts.

### Tasks

- [ ] [P1-Bridge] Relax `apps/web-demo/src/infra/shared/createCapabilityBridge.ts` generics so `AuthBridge`, `RouterCapabilities`, and test bridges satisfy the helper without fake index signatures.
- [ ] [P1-Bridge-Contracts] Ensure bridge capabilities remain explicit and do not become a permissive catch-all map.
- [ ] [P1-Bridge-Validation] Run tests covering bridge creation and runtime adapter behavior.

## 10. P1 — ProTable Typing and Helper Restoration

Rationale: current repair template records missing ProTable typings and helper availability.

### Tasks

- [ ] [P1-ProTable] Restore missing ProTable typings and helper availability, including `useProTableInfiniteScroll`, `useProTableUrlSync`, props shape, and related imports after the SFC parse fix.
- [ ] [P1-ProTable-Exports] Ensure helpers are exported from the correct local or package boundary.
- [ ] [P1-ProTable-Validation] Run targeted type-check and smoke tests for ProTable views.

## 11. P1 — UI Library Boundary and PrimeVue Adapter

Rationale: PrimeVue should remain the supported UI ecosystem, but CCD components and apps should not allow PrimeVue details to leak everywhere.

### Current direction

- Keep PrimeVue.
- Keep `@ccd/vue-primevue-adapter` as the PrimeVue-specific theme and integration layer.
- Keep `@ccd/vue-ui` as CCD-owned UI primitives and shared components.
- Do not switch to Element Plus, Naive UI, Ant Design Vue, or Tailwind as a rebuild strategy.
- Optional future headless primitives may use Reka UI only after `@ccd/vue-ui` boundaries are stable.

### Tasks

- [ ] [P1-UIBoundary-Audit] Audit direct `primevue/*` imports in `apps/web-demo/**`, `apps/desktop/**`, and `packages/vue-ui/**`.
- [ ] [P1-UIBoundary-Policy] Define which PrimeVue imports are allowed in app bootstrap/plugin files and which must be routed through `@ccd/vue-ui` or `@ccd/vue-primevue-adapter`.
- [ ] [P1-UIBoundary-Adapter] Keep theme, PassThrough, services, and global PrimeVue configuration inside `packages/vue-primevue-adapter/**`.
- [ ] [P1-UIBoundary-Primitives] Ensure `packages/vue-ui/**` exports CCD-owned primitives and does not become a loose PrimeVue re-export bucket.
- [ ] [P1-UIBoundary-Guard] Add or extend architecture guard rules to detect forbidden direct PrimeVue imports if the boundary policy is accepted.
- [ ] [P1-UIBoundary-Validation] Run `pnpm api:report`, `pnpm arch:boundaries`, `pnpm type-check`, and focused UI smoke tests.

## 12. P1 — HTTP Contract and Request Boundary

Rationale: the stack currently uses alova. This should be preserved, but HTTP must be governed by explicit contracts and adapter boundaries.

### Current direction

- Keep alova as the high-level request toolkit.
- Do not switch to Axios.
- Ky may be used only as a low-level transport inside an approved adapter if there is a measurable reason.
- TanStack Query should remain deferred until server-state complexity justifies it.
- Zod should be used at API boundaries where runtime validation is needed.

### Tasks

- [ ] [P1-HttpContract-Contracts] Add or refine HTTP contracts under `packages/contracts/src/http/**`: request shape, response shape, error shape, transport client, retry policy, timeout policy, auth policy.
- [ ] [P1-HttpContract-Core] Add runtime-neutral HTTP orchestration under `packages/core/src/http/**` if needed, without importing browser APIs, fetch, timers, storage, router, or Pinia.
- [ ] [P1-HttpContract-Adapter] Keep alova implementation under `apps/web-demo/src/adapters/http/**` or another approved app adapter path.
- [ ] [P1-HttpContract-Zod] Add Zod response validation only at boundary points where schemas are stable and validation cost is acceptable.
- [ ] [P1-HttpContract-NoCoupling] Ensure HTTP code does not directly couple router/store/session behavior except through approved bridges.
- [ ] [P1-HttpContract-Validation] Run `pnpm arch:runtime`, `pnpm api:report`, `pnpm type-check`, and request-layer tests.

## 13. P1 — Architecture Guard Coverage and Owner Decisions

Rationale: owner decision log records pending decisions about guard coverage, rule contradictions, design-token consolidation, and desktop drift CI.

### Tasks

- [ ] [P1-Guard-SFCMacroOrder] Add guard coverage for Vue SFC macro define order if the team accepts strict enforcement.
- [ ] [P1-Guard-TypeAssertions] Add guard coverage for banned business-code `as Type` assertion patterns, with explicit approved exceptions.
- [ ] [P1-Guard-AutoMitt] Add guard coverage for `useAutoMitt` enforcement where event bus patterns are expected.
- [ ] [P1-Guard-ComposableReturnTypes] Add guard coverage for composable return type annotations where architecture requires them.
- [ ] [P1-Guard-DynamicUnoCSS] Add guard coverage for dynamic UnoCSS class detection and approved safelist usage.
- [ ] [P1-Guard-RuleContradictions] Resolve documented rule contradictions before adding stricter checks.
- [ ] [P1-Guard-DesignTokenCanonical] Choose a canonical design-token rule file and update duplicate references.
- [ ] [P1-Guard-OwnerSignoff] Update `.ai/runtime/owner_decisions.md` after owner decisions are made.

## 14. P2 — Vite 8 Compatibility Lane

Rationale: current CCD uses Vite 7. Vite 8 uses Rolldown and Oxc internally. CCD currently has Vite config that relies on esbuild and Rollup options, so migration must be isolated.

### Current risk surface

- `apps/web-demo/vite.config.ts` uses `optimizeDeps.esbuildOptions`.
- `apps/web-demo/vite.config.ts` uses `esbuild.drop` and `esbuild.pure`.
- `apps/web-demo/vite.config.ts` uses `build.minify: 'esbuild'`.
- `apps/web-demo/vite.config.ts` uses Rollup `manualChunks` and `experimentalMinChunkSize`.
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

- [ ] [P2-Deps-Outdated] Run `pnpm deps:outdated` and record results in a branch-local note before upgrading.
- [ ] [P2-Deps-Vueuse] Upgrade `@vueuse/core` in an isolated lane after checking compatibility with existing hooks and auto-imports.
- [ ] [P2-Deps-VueTooling] Upgrade Vue compiler, `vue-tsc`, and TypeScript as a tooling lane; do not mix with Vite 8.
- [ ] [P2-Deps-ESLint] Upgrade ESLint ecosystem only if `lint:check` remains deterministic.
- [ ] [P2-Deps-PrimeVue] Upgrade PrimeVue only after checking v4 API changes for used components and adapter behavior.
- [ ] [P2-Deps-Alova] Upgrade alova only after request tests and adapter contracts exist.
- [ ] [P2-Deps-Playwright] Upgrade Playwright only after confirming browser install/cache behavior in CI.
- [ ] [P2-Deps-Validation] For each lane run targeted checks first, then `pnpm validate`.

## 16. P2 — CSS, Tokens, and Responsive Engine

Rationale: the current PostCSS px-to-rem setup works by excluding UnoCSS classes through a selector blacklist. This is functional but fragile.

### Tasks

- [ ] [P2-CSS-PxToRemAudit] Audit `postcss-pxtorem` usage in `apps/web-demo/vite.config.ts` and confirm which authored CSS still needs conversion.
- [ ] [P2-CSS-TokenFirst] Prefer design tokens, CSS variables, `%`, viewport units, container queries, and UnoCSS rules over global px-to-rem conversion.
- [ ] [P2-CSS-BlacklistRisk] Reduce dependence on long selector blacklists where possible.
- [ ] [P2-CSS-PrimeVue] Ensure PrimeVue and third-party CSS remain excluded from accidental rem conversion.
- [ ] [P2-CSS-Mobile] Validate mobile layout and safe-area behavior after CSS changes.
- [ ] [P2-CSS-Validation] Run visual regression or screenshot checks for `/login`, dashboard, table-heavy views, and chart-heavy views.

## 17. P2 — Generated Artifacts and Governance Discipline

Rationale: generated files must be regenerated, not hand-edited.

### Tasks

- [ ] [P2-Governance-Generated] Do not manually edit `docs/generated/**`, `.ai/generated/**`, or `.ai/governance/api-snapshots/**`.
- [ ] [P2-Governance-Refresh] Run `pnpm governance:refresh` after dependency graph, API surface, supply-chain, or generated report changes.
- [ ] [P2-Governance-Gate] Run `pnpm governance:gate` before merging architecture changes.
- [ ] [P2-Governance-DocsCommands] Run `pnpm docs:commands` if command documentation is touched.
- [ ] [P2-Governance-ProjectDoctor] Run `pnpm project:doctor` if `project.config.json`, package metadata, version, branding, or generated project metadata is touched.

## 18. P2 — GitHub Repository Governance

Rationale: a new GitHub organization is deferred. The current repository should first gain stronger governance.

### Tasks

- [ ] [P2-GitHub-BranchProtection] Configure or document main branch protection: required PR, required checks, conversation resolution, and linear history if appropriate.
- [ ] [P2-GitHub-RequiredChecks] Ensure required checks include `governance:gate`, `type-check`, `lint:check`, `build:ci`, and UI/E2E checks when practical.
- [ ] [P2-GitHub-Codeowners] Add or update `CODEOWNERS` for architecture, AI rules, packages, apps, and workflows.
- [ ] [P2-GitHub-Templates] Add or refine PR and issue templates for architecture changes, UI changes, dependency upgrades, and bug reports.
- [ ] [P2-GitHub-Release] Keep release automation aligned with `project.config.json` and release governance scripts.
- [ ] [P2-GitHub-Dependencies] Add or refine dependency update policy; avoid blind `pnpm up --latest` on `main`.

## 19. P3 — Login Diorama Refactor Plan

Rationale: the legacy repair template contains a detailed login diorama plan. Keep it, but execute only after P0/P1 stabilization.

### Target state

- `apps/web-demo/src/views/login/index.vue` becomes a single integrated diorama panel instead of two independent left/right cards.
- Brand identity floats above the panel center; theme and locale controls remain in the viewport top-right.
- The login form occupies the left 55%–60% of the desktop panel and keeps `ProForm` as the only multi-field form boundary.
- `AnimatedCharacters` occupies the right 40%–45% as a physical scene object, aligned to the panel floor and breaking above the panel top by 15%–20%.
- Password field visual structure is repaired so prefix icon, input body, and mask toggle stay inside one aligned control shell.
- Light/dark theme, size density, semantic tokens, responsive breakpoints, and design-engine UnoCSS laws remain authoritative.

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

## 20. P3 — Directive Specs, Case Sensitivity, and Secondary Test Debt

Rationale: current repair template records secondary test and import-casing issues.

### Tasks

- [ ] [P3-Tests] Update directive specs for Vue 3 four-argument directive hook signatures and clean up unused imports / `expect-error` noise in focused test files.
- [ ] [P3-CaseSensitivity] Normalize `DateUtils` / `dateUtils` import casing across example views and shared date utilities.
- [ ] [P3-Verify] Run `pnpm check` and capture the final residual error surface once targeted repairs land.

## 21. P4 — Deferred Strategic Work

Do not implement these until P0, P1, and the relevant P2 lanes are stable.

### Tasks

- [ ] [P4-NewOrganization-Deferred] Do not create a new GitHub organization or new repository now; first stabilize current repository governance and architecture.
- [ ] [P4-Starter-Deferred] Create `ccd-vue-starter` only after `@ccd/contracts`, `@ccd/core`, `@ccd/vue-ui`, and `@ccd/vue-primevue-adapter` are stable.
- [ ] [P4-DesignSystem-Deferred] Split a standalone design-system repository only after UI primitives and adapter boundaries are stable.
- [ ] [P4-RekaUI-Deferred] Evaluate Reka UI only for specific headless primitive gaps after PrimeVue adapter boundaries are stable.
- [ ] [P4-TanStackQuery-Deferred] Evaluate TanStack Query Vue only if server-state complexity exceeds what alova + explicit adapters can cleanly handle.
- [ ] [P4-DesktopDriftCI] Add desktop drift CI only after owner sign-off on enforcement scope.

## 22. Validation Matrix

Use the smallest valid validation set first, then escalate.

| Change type               | Minimum validation                                           | Full validation                                     |
| ------------------------- | ------------------------------------------------------------ | --------------------------------------------------- |
| Ledger Markdown migration | `pnpm ai:sync`, `pnpm ai:doctor`, `pnpm codex:preflight`     | `pnpm governance:gate`                              |
| AI rules / protocol       | `pnpm ai:doctor`, `pnpm codex:preflight`                     | `pnpm governance:refresh`, `pnpm governance:gate`   |
| Package exports           | `pnpm ci:prepare-internal`, package build, `pnpm type-check` | `pnpm build:ci`                                     |
| Vite config               | `pnpm --filter @ccd/web-demo build`                          | `pnpm build:ci`, `pnpm vercel:build`, `pnpm e2e:qa` |
| HTTP contracts            | `pnpm arch:runtime`, `pnpm api:report`, targeted tests       | `pnpm validate`                                     |
| UI boundary               | `pnpm arch:boundaries`, `pnpm type-check`                    | browser screenshots + `pnpm e2e:qa`                 |
| Login UI                  | targeted eslint + web-demo type-check                        | Playwright screenshots + interaction smoke          |
| Dependency lane           | targeted package checks                                      | `pnpm validate`                                     |

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
