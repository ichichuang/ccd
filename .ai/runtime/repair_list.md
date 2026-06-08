# CCD Runtime Repair Ledger

- Target path: `.ai/runtime/repair_list.md`
- Template source: `.ai/runtime/repair_list.template.md`
- Owner decisions: `.ai/runtime/owner_decisions.md`
- Rule coverage: `.ai/runtime/rule_coverage_matrix.md`
- Generated JSON target: `.ai/runtime/repair-ledger.json`
- Runtime state policy: `.ai/runtime/repair_list.md` is local runtime state; `pnpm ai:sync` may create it from `.ai/runtime/repair_list.template.md` when missing, but must not overwrite it once it exists.
- Last reorganized: 2026-06-08
- Reset basis: 2026-06-08 final architecture repair confirmation + existing 2026-06-05 runtime repair ledger.
- Cleanup rule applied: all completed `[x]` task items from the previous ledger were removed. This file contains only open, deferred, blocked, or re-opened architecture repair work.
- Owner decision: keep the current CCD repository and perform staged modernization, not a full rebuild.

## 0. Purpose

This ledger is the canonical AI-readable repair and modernization plan for CCD after the 2026-06-08 architecture scope reset.

The current scope is **CCD architecture system completion**, not product development. CCD should remain a governed multi-runtime platform skeleton:

- `apps/web-demo` demonstrates browser-side architecture capabilities.
- `apps/desktop` demonstrates Tauri desktop packaging, IPC, permissions, windows, security, and desktop runtime adapter capabilities.
- `packages/contracts` and `packages/core` stay runtime-neutral.
- Runtime capabilities are injected through contracts and app adapters.
- Runtime APIs appear only in app adapter layers or approved runtime-specific boundaries.
- Root package remains orchestration-only.

The following are not current architecture repair work and must remain deferred unless explicitly approved in a future product/strategy lane:

- operator identity, RBAC, endpoint enrollment, signed action envelopes, immutable audit, remote-control approval workflow.
- document-management business models, object storage, upload, preview, directory-tree, and file-table product pages.
- Login Diorama work outside the current P3-approved integrated panel scope.
- new organization, starter repository, standalone design-system repository.

## 1. Ledger Format Contract

- `[ ]` means open, deferred, blocked, or awaiting validation.
- `[x]` means completed and validated; completed items must not be kept in this cleaned ledger.
- Each actionable task must start with `- [ ] [Module] Task`.
- The `Module` label must include priority, for example `[P1-Desktop-CSP]` or `[P2-Vite8-Inventory]`.
- Do not mark a task complete until implementation and relevant validation commands pass.

Parser compatibility:

- `scripts/migrate-ledger.mjs` must parse `- [ ] [Module] Task`.
- Legacy icon lines `[⬜️]` / `[✅]` are migration-only and should not be introduced into this ledger.

## 2. Architectural Non-Negotiables

- `packages/contracts` contains interfaces, DTOs, and cross-runtime contracts only.
- `packages/core` remains runtime-neutral and must not become a frontend utility bucket.
- Runtime capabilities must be injected through contracts and app adapters.
- Runtime APIs are allowed only in app adapter layers or approved runtime-specific boundaries.
- Root package remains orchestration-only.
- Internal package boundaries must remain visible through workspace package resolution and build outputs.
- Do not add global `@ccd/*` TypeScript path aliases to `tsconfig.base.json`.
- Do not weaken `governance:gate`, `ai:doctor`, `ai:guard`, generated artifact rules, architecture guard rules, or dependency boundary checks.
- Do not move Alova HTTP runtime into `packages/core` or a generic shared request runtime.
- Do not move safeStorage crypto, compression, or runtime into `@ccd/shared-utils`.
- Do not replace PrimeVue or switch from alova to Axios without direct source evidence and an approved architecture decision.
- Do not replace the current architecture with a new GitHub organization, new repository, or full rebuild at this stage.

## 3. Current Repair Scope Overview

| Priority | Area                        | Current state                                                                                                                                                          | Action policy                                   |
| -------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| P1       | Desktop/Tauri baseline      | CSP, capabilities, scopes, IPC, Rust boundary, bundle, windows, icons, and security checks need a closed, testable desktop demo baseline.                              | Do first.                                       |
| P1       | Runtime capability model    | Browser, desktop, storage, network, filesystem, shell, notification, clipboard, and external navigation contracts/adapters need formal conformance and guard coverage. | Do first.                                       |
| P1       | UI library boundary         | PrimeVue adapter, `vue-ui` primitives, direct-import allowlist, and UI smoke coverage need final hardening.                                                            | Do first.                                       |
| P1       | HTTP boundary               | Type-only contracts, app-owned alova runtime, Zod boundary validation, and router/store decoupling need continued enforcement.                                         | Do first.                                       |
| P1       | safeStorage boundary        | Runtime remains app-owned; contracts and no-shared-move guard must prevent regression.                                                                                 | Do first.                                       |
| P1       | Architecture guards         | AI rules, architecture guards, and contradiction checks need stricter or clearer coverage.                                                                             | Do first if owner accepts stricter guard scope. |
| P2       | Shared layer                | hooks, utils, theme, i18n, charts, tokens, and metadata need systematic shared/app placement validation.                                                               | Do after P1 baseline.                           |
| P2       | Build/dev                   | Turbo inputs/outputs, prebuild cleanup, failure output, env schema, Vite helper sharing, CORS, and bundle budgets need reproducible validation.                        | Do after P1 baseline.                           |
| P2       | web-demo example surface    | Oversized examples, repeated patterns, async states, route constants, and i18n coverage need cleanup.                                                                  | Do after shared boundaries.                     |
| P2       | CSS/token responsive engine | pxtorem blacklist risk and token-first responsive rules need hardening.                                                                                                | Do after theme/token placement.                 |
| P2       | Vite 8 lane                 | Vite/Rolldown/Oxc migration must stay isolated.                                                                                                                        | Deferred isolated branch.                       |
| P2       | Dependency lanes            | Vue, PrimeVue, alova, Playwright, Tauri, and tooling upgrades must stay isolated.                                                                                      | Deferred isolated branches.                     |
| P3       | Docs/ADR/governance         | Architecture map, package responsibilities, desktop boundary, command docs, and ADRs need maintenance after implementation changes.                                    | Follow repair work.                             |
| P4       | Strategic/product           | Starter repo, design-system repo, new org, optional library evaluations, and Login Diorama work outside the current P3-approved integrated panel scope.                 | Deferred.                                       |

## 4. P1 — Tauri Desktop Architecture Capability Closure

Rationale: `apps/desktop` must be a real Tauri runtime capability demonstration surface, not only a desktop shell that can build.

### Tasks

- [x] [P1-Desktop-CSP] Replace `csp: null` with a restrictive production CSP in `apps/desktop/src-tauri/tauri.conf.json`.
  - Paths: `apps/desktop/src-tauri/tauri.conf.json`, desktop security policy docs.
  - Acceptance: CSP is non-null in production config; local app assets and required Tauri IPC remain functional.
  - Validation: `pnpm desktop:security`, `pnpm build:desktop`, `pnpm governance:gate`.
  - Completion: validated non-null restrictive CSP with `pnpm desktop:security`; final build/governance validation runs in the P1 close-out ladder.

- [x] [P1-Desktop-CSP-Allowlist] Define explicit CSP allowlists for `default-src`, `script-src`, `style-src`, `img-src`, `connect-src`, and related Tauri/dev URLs.
  - Paths: `apps/desktop/src-tauri/tauri.conf.json`, `scripts/architecture/**`, desktop docs.
  - Acceptance: no `unsafe-eval`; `unsafe-inline` exists only with a documented Tauri/PrimeVue reason.
  - Validation: desktop security snapshot or equivalent scripted check.
  - Completion: validated explicit CSP directives and no `unsafe-inline` / `unsafe-eval` with `pnpm desktop:security`.

- [x] [P1-Desktop-Capabilities] Add or harden Tauri v2 least-privilege capability files for the desktop demo.
  - Paths: `apps/desktop/src-tauri/capabilities/**`.
  - Acceptance: capabilities grant only the minimal permissions required by current desktop adapter demos.
  - Validation: capability snapshot plus `pnpm desktop:security`.
  - Completion: default capability remains local/main-window scoped with no broad permissions; validated by `pnpm desktop:security`.

- [x] [P1-Desktop-Scopes] Define explicit allow/deny scopes before enabling filesystem, shell, dialog, clipboard, updater, opener, notification, HTTP, or external navigation behavior.
  - Paths: `apps/desktop/src-tauri/capabilities/**`, `apps/desktop/src-tauri/tauri.conf.json`, `scripts/architecture/**`.
  - Acceptance: every enabled or planned desktop plugin has a documented scope decision; denied/unavailable capabilities are tested negatively where practical.
  - Validation: negative capability tests or scripted scope check.
  - Completion: `security-scopes.json` denies listed plugin/navigation surfaces by default and `desktop-security-rules.spec.ts` covers negative scope checks.

- [x] [P1-Desktop-NoPrematurePlugins] Prevent premature Tauri plugin enablement when no desktop demo use case and scoped permission file exist.
  - Paths: `apps/desktop/src-tauri/**`, `apps/desktop/src/adapters/**`, `scripts/architecture/**`.
  - Acceptance: shell/fs/http/updater/deep-link/plugin families stay disabled until an adapter demo and permission scope exist.
  - Validation: architecture guard.
  - Completion: desktop security guard rejects premature JS/Rust Tauri plugin packages and unscoped permissions; validated by spec and `pnpm desktop:security`.

- [x] [P1-Desktop-SecurityChecks] Add automated desktop security checks for non-null CSP, least-privilege capabilities, plugin usage, window defaults, and external navigation policy.
  - Paths: `scripts/architecture/**`, root `package.json`, `.github/workflows/**` if operator approves CI mutation.
  - Acceptance: `pnpm desktop:security` fails on null CSP, broad capability expansion, unscoped plugin enablement, or missing production window/navigation defaults.
  - Validation: `pnpm desktop:security`, `pnpm governance:gate`.
  - Completion: `desktop:security` now validates CSP, capabilities, plugin scopes, production window defaults, asset protocol, and external-navigation denial.

- [x] [P3-Desktop-IPC] Add typed frontend IPC wrappers instead of scattering raw Tauri `invoke` calls through UI code.
  - Paths: `apps/desktop/src/**`, `apps/desktop/src/adapters/**`, `packages/contracts`.
  - Acceptance: UI components/pages do not call raw `invoke`; adapter boundary owns IPC calls.
  - Validation: targeted IPC tests, type-check, architecture guard.
  - Completion: `apps/desktop/src/adapters/index.ts` remains the only raw `invoke` boundary in desktop app source; UI code does not call `invoke`; `pnpm --filter @ccd/desktop test`, `pnpm desktop:security`, `pnpm desktop:smoke:dev`, and `pnpm desktop:smoke:release` passed.

- [x] [P3-Desktop-IPCSchemas] Define shared IPC request/response contracts and validate frontend-to-backend payloads before executing Rust commands.
  - Paths: `packages/contracts/src/desktop-ipc.ts` or `packages/contracts/src/desktop/**`, `apps/desktop/src/adapters/**`, `apps/desktop/src-tauri/src/**`.
  - Acceptance: command payloads are typed and schema-validated where runtime data enters the boundary.
  - Validation: Vitest, `pnpm type-check`, desktop smoke.
  - Completion: `packages/contracts/src/desktop-ipc.ts` owns type-only command contracts; desktop adapters validate IPC payload shape before invoking; `pnpm --filter @ccd/desktop test`, `pnpm desktop:smoke:dev`, and `pnpm desktop:smoke:release` passed.

- [ ] [P4-Desktop-RustCommands] Add Rust command handlers only through audited typed IPC boundaries when backend commands are actually introduced.
  - Paths: `apps/desktop/src-tauri/src/**`, `packages/contracts`.
  - Acceptance: no placeholder or product-premature Rust commands; every command has typed frontend contract, scoped permission rationale, and tests.
  - Validation: `cargo test`, desktop smoke.
  - Owner decision: non-actionable until a real desktop backend capability is approved.
  - Prerequisites: contract-first IPC design, Rust command threat model, scoped Tauri permission rationale, frontend adapter validation, rollback plan.
  - Status: deferred guardrail; no new Rust commands were introduced in the P4 governance closure.
  - Validation guardrail: `pnpm desktop:security`, `pnpm desktop:smoke:dev`, `pnpm desktop:smoke:release`, `pnpm build:desktop`, and Rust tests when commands exist.

- [ ] [P4-Desktop-RustErrors] Use structured Rust-side IPC error types instead of string-only errors when commands are introduced.
  - Paths: `apps/desktop/src-tauri/src/**`.
  - Acceptance: errors are stable, typed, and mapped to frontend contract errors.
  - Validation: Rust tests and IPC error tests.
  - Owner decision: non-actionable until Rust IPC commands exist.
  - Prerequisites: stable command contract, frontend error mapping contract, Rust error enum or typed error envelope.
  - Status: deferred guardrail; no placeholder error model was added without commands.
  - Validation guardrail: Rust tests, IPC adapter tests, and `pnpm governance:gate`.

- [x] [P3-Desktop-BundleMetadata] Enable production bundling or explicitly document why it is disabled; complete desktop bundle metadata.
  - Paths: `apps/desktop/src-tauri/tauri.conf.json`, `apps/desktop/src-tauri/icons/**`, desktop docs.
  - Acceptance: identifier, product name, version, icon set, bundle targets, and distribution metadata are either production-ready or intentionally documented.
  - Validation: Tauri build smoke.
  - Completion: Tauri bundle metadata is explicit in `apps/desktop/src-tauri/tauri.conf.json`; `pnpm desktop:security`, `pnpm desktop:smoke:release`, and `pnpm budget:desktop` validate the local bundle/build path.

- [x] [P3-Desktop-WindowDefaults] Set explicit production window, navigation, resizable/fullscreen, min-size, title, and asset protocol defaults.
  - Paths: `apps/desktop/src-tauri/tauri.conf.json`, `apps/desktop/src/**`.
  - Acceptance: no important desktop window/security default is implicit.
  - Validation: desktop e2e/snapshot or config security check.
  - Completion: Tauri window title, label, dimensions, min-size, centering, resizable/fullscreen/maximized/decorations/visibility/devtools, CSP, asset protocol, and navigation policy are explicit; `pnpm desktop:security` passed.

- [x] [P3-Desktop-SmokeCI] Add desktop smoke validation for Tauri dev and release builds in CI after operator approval for workflow mutation.
  - Paths: `.github/workflows/**`, `apps/desktop/package.json`, `apps/desktop/src-tauri/Cargo.toml`.
  - Acceptance: CI validates desktop build/security smoke without changing remote branch protection settings.
  - Validation: GitHub CI green.
  - Completion: root and desktop package smoke scripts now cover desktop security, Tauri dev CLI plus locked Cargo dev check, and `tauri build --no-bundle --ci`; `.github/workflows/ci.yml` runs dev/release smoke before desktop build/budget. Local validation passed with `pnpm desktop:smoke:dev` and `pnpm desktop:smoke:release`; remote CI execution remains external because this lane does not push or mutate remote settings.

## 5. P1 — Runtime Capability Model and Boundary Enforcement

Rationale: CCD's architecture center is contract-driven runtime capability injection through app adapters.

### Tasks

- [x] [P1-Capability-Model] Define a formal runtime capability model for browser, desktop, storage, network, filesystem, shell, notification, clipboard, and external navigation.
  - Paths: `packages/contracts`, `packages/core`, `apps/web-demo/src/adapters/**`, `apps/desktop/src/adapters/**`.
  - Acceptance: contracts describe capability shape; app adapters implement runtime-specific behavior; runtime-neutral packages do not import runtime APIs.
  - Validation: `pnpm arch:runtime`, `pnpm api:report`.
  - Completion: `@ccd/contracts` owns type-only runtime capability contracts; `@ccd/core` consumes them runtime-neutrally; app adapters implement runtime behavior.

- [x] [P1-Capability-AdapterConformance] Add adapter conformance tests for `web-demo` and `desktop` runtime adapters.
  - Paths: `apps/web-demo/src/adapters/**`, `apps/desktop/src/adapters/**`, tests.
  - Acceptance: every adapter satisfies the shared contract and shape drift is caught.
  - Validation: adapter tests plus `pnpm type-check`.
  - Completion: added browser runtime conformance spec and validated it with the existing desktop adapter spec.

- [x] [P1-Boundary-Tests] Expand architecture-boundary tests for shared/app placement of theme, tokens, UnoCSS preset, hooks, utils, i18n, request, services, and runtime adapters.
  - Paths: `.dependency-cruiser.*`, `scripts/architecture/**`, `packages/**`, `apps/**`.
  - Acceptance: violations fail locally and in governance gate.
  - Validation: `pnpm arch:boundaries`, `pnpm governance:gate`.
  - Completion: validated dependency-cruiser, package placement, PrimeVue, HTTP/storage, and runtime boundaries with `pnpm arch:boundaries` and `pnpm ai:guard`.

- [x] [P1-Package-Surfaces] Ensure all shared packages expose only approved public entry points and block cross-package deep imports from `packages/*/src/**`.
  - Paths: `packages/*/src/index.ts`, `packages/*/package.json`, `scripts/architecture/**`.
  - Acceptance: package exports point to build outputs; public API reports match package metadata.
  - Validation: `pnpm api:report`, package surface rules, `pnpm type-check`.
  - Completion: `pnpm api:report` and `pnpm arch:boundaries` validate dist-only exports and block package source deep imports.

- [x] [P1-Runtime-LeakGuard] Prevent browser, Node, Tauri, storage, network, timer, crypto, and console side effects from entering `packages/contracts` or `packages/core`.
  - Paths: `packages/contracts/**`, `packages/core/**`, `scripts/architecture/**`.
  - Acceptance: runtime-neutral layers remain side-effect-free and environment-neutral.
  - Validation: `pnpm arch:runtime`.
  - Completion: `pnpm arch:runtime` passes for strict runtime-neutral `packages/contracts` and `packages/core` surfaces.

- [x] [P1-RawRuntimeApiBan] Ban raw `fetch`, raw storage, raw Tauri API, and unapproved runtime API usage outside adapter paths.
  - Paths: `apps/**`, `packages/**`, `scripts/architecture/**`.
  - Acceptance: runtime API access is concentrated in approved app adapter layers.
  - Validation: architecture guard.
  - Completion: `pnpm ai:guard` and `pnpm arch:runtime` pass with raw runtime access classified or blocked by approved boundaries.

## 6. P1 — HTTP, safeStorage, and Network Boundary

Rationale: HTTP contracts are shared type contracts; the alova runtime and app-specific behavior stay app-owned. safeStorage runtime remains app-owned by approved owner decision.

### Tasks

- [x] [P1-HttpContract-Contracts] Complete HTTP contracts for request, response, error, transport, retry, timeout, auth, base URL, cancellation, interceptor lifecycle, and normalized error mapping.
  - Paths: `packages/contracts/src/http/**`.
  - Acceptance: contracts are type-only/cross-runtime and do not import alova or app runtime.
  - Validation: `pnpm api:report`, `pnpm arch:runtime`.
  - Completion: type-only HTTP contract modules are exported from `@ccd/contracts`; validated with `pnpm api:report` and `pnpm arch:runtime`.

- [x] [P1-HttpContract-AppOwned] Keep alova instance, interceptors, auth refresh, cache, retry, deduplication, timeout, UI notification, and app schema validation under the app-owned HTTP adapter/runtime.
  - Paths: `apps/web-demo/src/utils/http/**`, `apps/web-demo/src/adapters/**` if used.
  - Acceptance: no alova runtime promotion to `packages/core` or a generic shared request package.
  - Validation: boundary test.
  - Completion: app-owned HTTP runtime stays under `apps/web-demo/src/utils/http/**`; HTTP policy/request tests and guards passed.

- [x] [P1-HttpContract-NoRouterStoreCoupling] Ensure HTTP runtime does not directly couple router, store, session, or UI behavior except through approved bridges/adapters.
  - Paths: `apps/web-demo/src/utils/http/**`, `apps/web-demo/src/infra/**`, adapters.
  - Acceptance: navigation/session/error UI side effects are injected or bridged, not imported ad hoc.
  - Validation: request-layer tests and architecture guard.
  - Completion: HTTP coupling guard and request-layer tests passed; router/store/session coupling remains bridge-owned.

- [x] [P1-HttpContract-ZodBoundary] Add Zod response validation only at stable, cost-acceptable boundary points.
  - Paths: API modules, `apps/web-demo/src/utils/http/**`, contracts/schemas if present.
  - Acceptance: schemas validate external data where valuable without turning every internal call into expensive runtime validation.
  - Validation: request tests.
  - Completion: app HTTP adapter/schema validation tests passed, including Zod payload normalization.

- [x] [P1-SafeStorage-AppOwned] Preserve app-owned safeStorage runtime for crypto/HMAC/Web Crypto, compression, serializer, migration, and maintenance behavior.
  - Paths: `apps/web-demo/src/utils/safeStorage/**`.
  - Acceptance: runtime stays app-local; no crypto/compression/runtime move to `@ccd/shared-utils`.
  - Validation: safeStorage tests and architecture guard.
  - Completion: safeStorage runtime remains app-owned and targeted safeStorage tests passed.

- [x] [P1-SafeStorage-Contracts] Keep only safeStorage capability contracts shared, without moving runtime implementation.
  - Paths: `packages/contracts/src/storage.ts` or `packages/contracts/src/storage/**`, `apps/web-demo/src/utils/safeStorage/**`.
  - Acceptance: contracts describe expected storage capability; runtime remains app adapter/local utility.
  - Validation: `pnpm api:report`, `pnpm arch:runtime`.
  - Completion: `packages/contracts/src/storage.ts` remains type-only and app runtime stays local; API/runtime checks passed.

- [x] [P1-SafeStorage-NoSharedMoveGuard] Add or keep a guard preventing safeStorage runtime, compression, and crypto from being promoted into `@ccd/shared-utils`.
  - Paths: `scripts/architecture/**`, `packages/shared-utils/**`, `apps/web-demo/src/utils/safeStorage/**`.
  - Acceptance: forbidden promotion fails validation.
  - Validation: architecture guard.
  - Completion: architecture runtime/boundary guards keep storage crypto/compression/runtime out of shared-utils; validation passed.

## 7. P1 — UI Library Boundary and PrimeVue Adapter

Rationale: PrimeVue stays the supported UI ecosystem, but PrimeVue-specific integration must not leak across app/package boundaries.

### Tasks

- [x] [P1-UIBoundary-Audit] Audit direct `primevue/*` imports in apps and UI packages.
  - Paths: `apps/web-demo/**`, `apps/desktop/**`, `packages/vue-ui/**`, `packages/vue-primevue-adapter/**`.
  - Acceptance: every direct import is classified as allowed bootstrap/plugin usage, adapter-owned usage, or forbidden leakage.
  - Validation: report plus guard.
  - Completion: `.ai/runtime/primevue-direct-import-audit.md` classifies direct imports; `pnpm ai:guard` validates the policy.

- [x] [P1-UIBoundary-Allowlist] Define the PrimeVue direct-import allowlist and enforce it through architecture guards.
  - Paths: `scripts/architecture/**`, `.ai/rules/components/**`, package docs.
  - Acceptance: only app bootstrap/plugin files and `@ccd/vue-primevue-adapter` use direct PrimeVue imports unless explicitly approved.
  - Validation: `pnpm arch:boundaries`.
  - Completion: `primevue-boundary-policy.mjs` enforces direct-import allowlist; `pnpm ai:guard` and `pnpm arch:boundaries` passed.

- [x] [P1-UIBoundary-AdapterOwnership] Keep PrimeVue theme, PassThrough, services, locale mapping, and global config in `packages/vue-primevue-adapter`.
  - Paths: `packages/vue-primevue-adapter/**`, `apps/*/src/plugins/**`.
  - Acceptance: apps register the adapter but do not own reusable PrimeVue integration logic.
  - Validation: `pnpm api:report`, UI smoke.
  - Completion: apps call `installPrimeVueRuntime`; adapter service/theme smoke tests and API report passed.

- [x] [P1-UIBoundary-Primitives] Ensure `packages/vue-ui` exposes CCD-owned primitives and does not become a loose PrimeVue re-export bucket.
  - Paths: `packages/vue-ui/**`, `packages/vue-ui/package.json`.
  - Acceptance: public API is CCD-owned and build-output aligned.
  - Validation: API snapshot and package surface check.
  - Completion: `@ccd/vue-ui` exports CCD-owned primitives and guard blocks raw PrimeVue public re-exports; API/package checks passed.

- [x] [P1-UIBoundary-AppRegistrationOnly] Keep app-level PrimeVue files limited to registration/wiring.
  - Paths: `apps/web-demo/src/plugins/modules/primevue.ts`, desktop plugin/wiring path if present.
  - Acceptance: reusable theme/PT/service logic stays in adapter package.
  - Validation: boundary tests.
  - Completion: app plugin files remain registration-only and direct PrimeVue imports are forbidden by guard.

- [x] [P1-UIBoundary-Smoke] Add focused UI smoke coverage for PrimeVue adapter, ProForm, ProTable, theme service, and both runtime surfaces where practical.
  - Paths: UI tests, Playwright smoke, `packages/vue-ui`, `packages/vue-primevue-adapter`, `apps/**`.
  - Acceptance: representative UI integration fails fast on adapter/theme/public API regression.
  - Validation: Vitest + build + optional browser smoke.
  - Completion: targeted PrimeVue adapter, ProForm, ProTable, CScrollbar, CCD Prime controls, and dialog tests passed.

## 8. P1 — Architecture Guard Coverage and Rule Contradictions

Rationale: architecture system repair is incomplete unless future drift is blocked by guards and clear rules.

### Tasks

- [x] [P1-Guard-ContradictionAudit] Re-audit AI rules and architecture rules for contradictions after the 2026-06-08 scope reset.
  - Paths: `.ai/rules/**`, `.ai/runtime/rule_coverage_matrix.md`, `.ai/runtime/owner_decisions.md`, `scripts/architecture/**`.
  - Acceptance: no current rule recommends product/RMM/document-management work as architecture repair; owner-deferred items are clearly labeled.
  - Validation: `pnpm ai:doctor`, `pnpm codex:preflight`.
  - Completion: rules, owner decisions, and coverage matrix were re-read; deferred guard scope remains labeled and no product/RMM/document-management work was promoted.

- [x] [P1-Guard-SFCMacroOrder] Add guard coverage for Vue SFC macro define order if the team accepts strict enforcement.
  - Paths: `.ai/rules/**`, `scripts/architecture/**`, ESLint if appropriate.
  - Acceptance: future `defineOptions()`/macro-order regressions are caught or explicitly exempted.
  - Validation: guard test.
  - Completion: `scripts/ai-architecture-guard.mjs` now enforces script setup macro order and `defineExpose()` last; reordered existing SFC violations. Validated with `pnpm ai:guard -- --format=json`.

- [x] [P1-Guard-TypeAssertions] Add guard coverage for banned business-code `as Type` assertion patterns, with explicit approved exceptions.
  - Paths: `.ai/rules/**`, `scripts/architecture/**`, `apps/**`, `packages/**`.
  - Acceptance: unsafe assertions fail while type-caster/bridge exceptions remain allowed.
  - Validation: architecture guard.
  - Completion: business-code assertions now fail unless they are `as const`, DOM/event narrowing, or an approved bridge path; straightforward app casts were replaced with `castValue()`. Validated with `pnpm ai:guard -- --format=json`.

- [x] [P1-Guard-AutoMitt] Decide and enforce `useAutoMitt` usage where event bus patterns are expected.
  - Paths: `.ai/rules/**`, `scripts/architecture/**`, event/composable paths.
  - Acceptance: either the rule is enforced with exceptions or documented as not enforced.
  - Validation: guard test.
  - Completion: Vue `<script setup>` components now fail on direct `useMitt()` usage and must use `useAutoMitt()` for event-bus subscriptions. Validated with `pnpm ai:guard -- --format=json`.

- [x] [P1-Guard-ComposableReturnTypes] Add guard coverage for composable return type annotations where architecture requires them.
  - Paths: `packages/vue-hooks/**`, `apps/**/src/hooks/**`, `.ai/rules/**`, `scripts/architecture/**`.
  - Acceptance: public/shared composables expose stable typed returns.
  - Validation: type-check and guard.
  - Completion: exported `use*` composables in app hooks, view/layout composables, and shared Vue packages now require explicit return types; missing return contracts were added. Validated with `pnpm ai:guard -- --format=json`.

- [x] [P1-Guard-DynamicUnoCSS] Add guard coverage for dynamic UnoCSS class detection and approved safelist usage.
  - Paths: `packages/unocss-preset/**`, `apps/**`, `.ai/rules/design-system/**`, `scripts/architecture/**`.
  - Acceptance: dynamic classes are either tokenized, safelisted, or rejected.
  - Validation: UnoCSS/design-system guard.
  - Completion: dynamic UnoCSS utility templates/concats now fail outside approved generator/demo paths, and the dynamic size/theme safelist contract is checked. Validated with `pnpm ai:guard -- --format=json`.

- [x] [P1-Guard-DateUtils] Decide whether `ai:guard` should enforce DateUtils usage beyond the current raw-date-constructor rule.
  - Paths: shared utils, app views, `.ai/rules/**`, `scripts/architecture/**`.
  - Acceptance: decision is recorded and guard scope matches it.
  - Validation: guard test or owner-decision update.
  - Completion: current architecture rules accept broader DateUtils enforcement; `ai:guard` now rejects raw `new Date()`, `Date.now()`, raw ISO/locale/display Date APIs outside DateUtils/tests/approved timestamp infrastructure. Validated with `pnpm ai:guard -- --format=json`.

- [x] [P1-Guard-RouteModuleSize] Add max-file-length and max-route-module-size governance checks to prevent future 4000+ line route files.
  - Paths: `eslint.config.ts`, `scripts/architecture/**`, `apps/web-demo/src/router/**`.
  - Acceptance: oversized route modules fail before merging.
  - Validation: architecture guard.
  - Completion: `ai:guard` now enforces route module line and record budgets; validated with `pnpm ai:guard --format=json`.

- [x] [P1-Guard-RawRuntimeAPIs] Add explicit guard rules for raw runtime API usage outside approved adapters.
  - Paths: `scripts/architecture/**`, `apps/**`, `packages/**`.
  - Acceptance: raw `fetch`, raw storage, raw Tauri API, direct shell/fs API, and external navigation calls are detected outside allowed boundaries.
  - Validation: `pnpm arch:runtime`.
  - Completion: `arch:runtime` and `ai:guard` validate raw runtime surfaces against adapter allowances and exact exceptions.

- [x] [P1-Guard-OwnerSignoff] Update `.ai/runtime/owner_decisions.md` when guard scope changes from deferred to enforced.
  - Paths: `.ai/runtime/owner_decisions.md`.
  - Acceptance: strict guard expansion is not introduced without owner/team acceptance.
  - Validation: `pnpm ai:doctor --open`.
  - Completion: owner decisions now record the 2026-06-08 operator override as P1-scoped approval; non-P1 broad guard expansion remains deferred. Validated with `pnpm ai:guard -- --format=json` and `pnpm ai:doctor --open`.

## 9. P2 — Shared Layer Consolidation

Rationale: reusable platform code should live in workspace packages; app-specific routes, pages, stores, and plugin wiring stay in apps.

### Tasks

- [x] [P2-Shared-Dedupe] Remove duplicated shared capability implementations across `web-demo` and `desktop` and consume workspace packages where appropriate.
  - Paths: `apps/web-demo/**`, `apps/desktop/**`, `packages/*`.
  - Acceptance: generic shared capabilities are package-owned; app-specific adapters remain app-local.
  - Validation: dependency graph and `pnpm arch:boundaries`.
  - Completion: shared capability/package consumption passes `pnpm arch:boundaries`; app runtime adapters remain app-local.

- [x] [P2-Shared-Utils] Move pure reusable utilities to `packages/shared-utils` while keeping app-domain utilities inside apps.
  - Paths: `packages/shared-utils/**`, `apps/web-demo/src/utils/**`, `apps/desktop/src/**`.
  - Acceptance: no runtime/browser/Tauri/storage side effects enter shared utils.
  - Validation: unit tests and runtime leak guard.
  - Completion: `packages/shared-utils` stays pure; runtime/storage/network code remains app-owned and `pnpm arch:runtime` passes.

- [x] [P2-Shared-Hooks] Move reusable Vue composables to `packages/vue-hooks`; keep runtime adapters and app-domain hooks app-local.
  - Paths: `packages/vue-hooks/**`, `apps/web-demo/src/hooks/**`, `apps/desktop/src/**`.
  - Acceptance: shared composables are generic, typed, and runtime-neutral or explicitly browser-safe if package responsibility allows it.
  - Validation: type-check and tests.
  - Completion: shared hook surfaces stay in `packages/vue-hooks`; app-domain hooks remain under apps; web-demo type-check and tests pass.

- [x] [P2-Shared-Theme] Centralize generic theme engine primitives, size/density resolution, breakpoint helpers, and device helpers.
  - Paths: `packages/design-tokens/**`, `packages/vue-hooks/**`, app theme utilities.
  - Acceptance: app-specific theme wiring stays app-local; generic primitives are reusable.
  - Validation: token/theme tests.
  - Completion: generic theme/token primitives remain package-owned; app theme wiring remains local; `pnpm --filter @ccd/web-demo type-check` passes.

- [x] [P2-Shared-I18n] Promote generic i18n setup to a shared app-platform layer while keeping app messages app-owned.
  - Paths: `packages/vue-app-platform/**`, `apps/web-demo/src/locales/**`, `apps/desktop/src/**`.
  - Acceptance: locale runtime setup is common; route/page messages remain app-local.
  - Validation: i18n tests.
  - Completion: i18n setup is package/platform-owned while app messages remain app-local; route/page locale coverage test passes.

- [x] [P2-Shared-I18nContracts] Add i18n contracts for locale registration, fallback locale, message loading, and PrimeVue locale mapping.
  - Paths: `packages/contracts/**`, `packages/vue-app-platform/**`, `apps/web-demo/src/locales/**`, `packages/vue-primevue-adapter/**`.
  - Acceptance: apps implement a consistent i18n capability contract.
  - Validation: API report and tests.
  - Completion: i18n contracts/API surface validate with `pnpm api:report`; route/page i18n smoke passes.

- [x] [P2-Shared-Charts] Keep chart runtime helpers in `packages/vue-charts`; keep page-specific chart config local.
  - Paths: `packages/vue-charts/**`, `apps/web-demo/src/views/example/**`.
  - Acceptance: chart helper package is reusable and not polluted by page/demo config.
  - Validation: chart tests.
  - Completion: chart helpers remain in `packages/vue-charts`; demo configs/components stay colocated under the chart example surface.

- [x] [P2-Shared-UnoCSS] Provide shared UnoCSS extension points instead of app-level patches or overrides.
  - Paths: `packages/unocss-preset/**`, `packages/design-tokens/**`, app UnoCSS config.
  - Acceptance: app customization flows through approved preset extension points.
  - Validation: build and design-system guard.
  - Completion: UnoCSS extension points remain package-owned; `pnpm css:pxtorem:check` and boundary validation pass.

- [x] [P2-Shared-TokensSSOT] Keep design tokens as the single source of truth for colors, semantic colors, spacing, breakpoints, theme names, and responsive primitives.
  - Paths: `packages/design-tokens/**`, `packages/unocss-preset/**`, `uno.config.ts`.
  - Acceptance: no competing token definitions in apps.
  - Validation: token validation.
  - Completion: design tokens remain the source for theme/responsive primitives; token and CSS policy checks are wired into governance.

- [x] [P2-Shared-Metadata] Keep application metadata and version centralized in `project.config.json` and generated/synced into package manifests, Tauri config, and app constants.
  - Paths: `project.config.json`, `apps/*/package.json`, `packages/*/package.json`, `apps/desktop/src-tauri/tauri.conf.json`, sync scripts.
  - Acceptance: metadata is generated, synced, or validated rather than manually drifting.
  - Validation: `pnpm project:doctor`.
  - Completion: `pnpm project:doctor` validates centralized version/product metadata across manifests, app constants, Tauri, Cargo, and governance policy.

- [x] [P2-Shared-MetadataDrift] Ensure drift checks fail when package version, Tauri version, product name, desktop identifier, homepage, app title, or metadata constants diverge.
  - Paths: `scripts/sync-version.mjs`, `scripts/sync-desktop-config.mjs`, `scripts/project-config.*`, CI/governance scripts.
  - Acceptance: metadata divergence fails local validation and CI/governance where configured.
  - Validation: project doctor and governance gate.
  - Completion: metadata drift is checked by `project:doctor` and governance gate wiring.

- [x] [P2-Shared-AppLocalBoundaries] Keep app-specific routes, pages, stores, and plugin wiring inside apps and prevent them from becoming shared package APIs.
  - Paths: `apps/web-demo/src/router/**`, `apps/web-demo/src/views/**`, `apps/web-demo/src/stores/**`, `apps/web-demo/src/plugins/**`, `apps/desktop/src/**`.
  - Acceptance: app-owned features are not exported from shared packages.
  - Validation: architecture guard and API report.
  - Completion: app routes/pages/stores/plugin wiring remain app-owned; `pnpm arch:boundaries` and `pnpm api:report` pass.

## 10. P2 — Build, Turbo, Environment, and Vite Helpers

Rationale: clean checkout, CI, and local development must be reproducible without fragile manual chains.

### Tasks

- [x] [P2-Turbo-Tasks] Let Turborepo own package build ordering through task dependencies and workspace dependency graph resolution.
  - Paths: `turbo.json`, root `package.json`, app/package manifests.
  - Acceptance: app builds do not depend on undocumented manual prebuild sequences.
  - Validation: clean build.
  - Completion: `build:ci` now runs the workspace build through Turbo graph orchestration before package smoke/budgets.

- [x] [P2-Turbo-InputsOutputs] Define accurate Turbo inputs, outputs, cache behavior, and dependencies for build, type-check, lint, test, e2e, and package artifacts.
  - Paths: `turbo.json`.
  - Acceptance: cache is correct and build artifacts are declared.
  - Validation: `pnpm build:ci`.
  - Completion: existing Turbo task inputs/outputs/dependencies are preserved and exercised by the final build ladder.

- [x] [P2-Turbo-RemoveDuplicatePrebuild] Remove or prevent duplicated prebuild scripts once Turbo orchestration handles package builds.
  - Paths: root `package.json`, `apps/*/package.json`, `packages/*/package.json`.
  - Acceptance: no stale duplicate prebuild chain competes with Turbo.
  - Validation: script audit.
  - Completion: `build:ci` no longer manually runs `ci:prepare-internal` before Turbo; package smoke remains after graph build.

- [x] [P2-Turbo-BuildFailureOutput] Improve failure output when shared package builds fail before app builds.
  - Paths: `scripts/exec.sh`, build wrappers, root scripts.
  - Acceptance: failures identify the package/task that failed.
  - Validation: failure smoke.
  - Completion: build orchestration now uses `scripts/exec.sh` with an explicit `CCD_EXEC_PHASE`/`CCD_EXEC_HINT` for Turbo graph failures.

- [x] [P2-Turbo-WorkspaceWrappers] Add or maintain workspace wrappers for filtered app builds that automatically include dependencies.
  - Paths: root `package.json`, Turbo/pnpm scripts.
  - Acceptance: filtered app builds work from clean artifacts.
  - Validation: clean filtered builds.
  - Completion: app build wrappers use filtered Turbo builds; `vercel:build` delegates through `build:web-demo` instead of a bespoke prebuild chain.

- [x] [P2-Env-Schema] Add strict environment schema validation for API base URL, timeout, public path, compression mode, storage prefix, and desktop-specific variables.
  - Paths: `scripts/env-doctor.mjs`, build utilities, `.env*`, app config.
  - Acceptance: invalid env values fail early.
  - Validation: env doctor.
  - Completion: `pnpm env:doctor` validates app env schemas, public path, API, compression, storage prefix, and desktop variables.

- [x] [P2-Dev-PortSync] Synchronize Vite ports and Tauri `devUrl` through shared config or a drift checker.
  - Paths: `apps/desktop/vite.config.ts`, `apps/desktop/src-tauri/tauri.conf.json`, `.env*`, project config.
  - Acceptance: port drift fails validation.
  - Validation: project doctor.
  - Completion: desktop port/devUrl drift is covered by shared Vite helpers plus `project:doctor`/`env:doctor`.

- [x] [P2-Vite-SharedHelpers] Extract shared Vite configuration helpers where `web-demo` and `desktop` should stay aligned.
  - Paths: `apps/web-demo/vite.config.ts`, `apps/desktop/vite.config.ts`, possible shared build config path.
  - Acceptance: common Vite behavior is shared without hiding app-specific differences.
  - Validation: web and desktop builds.
  - Completion: `web-demo` and `desktop` consume shared Vite env/host/port/CORS helpers while retaining app-specific build behavior.

- [x] [P2-Vite-CORS] Restrict Vite dev and preview CORS by default; require explicit opt-in for special local integrations.
  - Paths: app Vite configs, env schema.
  - Acceptance: broad CORS is not default production/demo behavior.
  - Validation: config tests or targeted build/test.
  - Completion: desktop Vite dev/preview now uses `localViteCors`; `pnpm env:doctor` fails open CORS drift for both apps.

- [x] [P2-Vite-BundleBudgets] Add bundle-budget checks to CI for browser and desktop builds.
  - Paths: `scripts/check-bundle-budgets.mjs`, `scripts/architecture/check-desktop-size.mjs`, root scripts, CI if approved.
  - Acceptance: oversized bundles fail with actionable output.
  - Validation: budget checks.
  - Completion: `build:ci` runs browser and desktop budget checks after Turbo build; final validation runs both budgets.

## 11. P2 — Web-Demo Example Surface Governance

Rationale: `web-demo` is not a product, but its example surface must remain clean because it demonstrates architecture capabilities.

### Tasks

- [x] [P2-Views-Split] Split oversized demo views and colocate page-specific schemas, mocks, constants, and composables beside each page.
  - Paths: `apps/web-demo/src/views/example/**`.
  - Acceptance: views stay readable and page-specific code remains colocated.
  - Validation: type-check.
  - Completion: route modules are split/guarded; chart configs/components remain colocated; the UnoCSS page data block moved to sibling `unocss.demoData.ts`; web-demo type-check passes.

- [x] [P2-Views-Patterns] Extract repeated table, form, chart, and demo-page patterns into reusable components or composables where genuinely generic.
  - Paths: `apps/web-demo/src/views/example/**`, `packages/vue-ui/**`, `packages/vue-hooks/**`.
  - Acceptance: repeated patterns are shared only when generic; demo/page-specific config stays app-local.
  - Validation: tests.
  - Completion: generic demo wrappers, chart cards/controls, and package UI/hooks are reused while page-specific config remains app-local.

- [x] [P2-Views-AsyncStates] Add loading, empty, and error states around async demos and data-fetching example pages.
  - Paths: `apps/web-demo/src/views/example/**`.
  - Acceptance: representative async pages handle all states.
  - Validation: route smoke.
  - Completion: representative async HTTP/demo surfaces use `AsyncStatePreview`; route/lazy import smoke passes.

- [x] [P2-Views-I18nCoverage] Add i18n key coverage tests for every route `titleKey` and page-level translation key.
  - Paths: `apps/web-demo/src/router/**`, `apps/web-demo/src/locales/**`.
  - Acceptance: missing route/page keys fail tests.
  - Validation: i18n tests.
  - Completion: `apps/web-demo/src/router/modules/example.spec.ts` covers route title keys and example page translation keys across locales.

- [x] [P2-Views-RouteConstants] Replace repeated hard-coded route strings with typed route constants or generated route names where navigation is reused.
  - Paths: `apps/web-demo/src/router/**`, `apps/web-demo/src/views/**`.
  - Acceptance: reusable navigation does not rely on scattered string literals.
  - Validation: route tests.
  - Completion: router-meta reused paths/names now live in app-local route constants consumed by route config and demo navigation; route smoke passes.

- [x] [P3-Docs-RemoveDemoWording] Remove stale template/example-only wording from production-facing docs and metadata while keeping `web-demo` as the architecture demonstration app.
  - Paths: `README.md`, `README.en.md`, `docs/**`, `.env*`, app metadata.
  - Acceptance: user-facing docs do not imply an unrelated business/demo product, but architecture demo identity remains clear.
  - Validation: docs check.
  - Completion: production-facing README governance state and stack badges now match the current branch; `web-demo` wording is retained only as the architecture demonstration app identity; HTML placeholder tokens remain source-injection inputs owned by the existing project doctor contract. `pnpm docs:commands` passed.

## 12. P2 — CSS, Tokens, and Responsive Engine

Rationale: `postcss-pxtorem` selector blacklists are functional but fragile in a token-first architecture.

### Tasks

- [x] [P2-CSS-PxToRemAudit] Audit current `postcss-pxtorem` usage and identify which authored CSS still requires px-to-rem conversion.
  - Paths: `apps/web-demo/vite.config.ts`, PostCSS config, CSS/style files.
  - Acceptance: conversion scope is documented and intentionally limited.
  - Validation: audit report.
  - Completion: added `pnpm css:pxtorem:check` to validate build-only, explicit, file-excluded px-to-rem policy.

- [x] [P2-CSS-TokenFirst] Prefer design tokens, CSS variables, `%`, viewport units, container queries, and UnoCSS rules over global px-to-rem conversion.
  - Paths: `packages/design-tokens/**`, `packages/unocss-preset/**`, app styles.
  - Acceptance: new layout/responsive work is token-first.
  - Validation: visual checks.
  - Completion: token-first policy is enforced by design-token validation and the px-to-rem checker; no global conversion broadening was added.

- [x] [P2-CSS-BlacklistRisk] Reduce selector blacklist maintenance risk in pxtorem/PostCSS config.
  - Paths: Vite/PostCSS config.
  - Acceptance: fewer fragile selectors or clearer exclusion ownership.
  - Validation: build.
  - Completion: pxtorem exclusions are centralized and file-level vendor/shared-package exclusions reduce selector-blacklist dependence.

- [x] [P2-CSS-PrimeVue] Ensure PrimeVue and third-party CSS are excluded from accidental rem conversion.
  - Paths: PostCSS config, PrimeVue adapter/global styles.
  - Acceptance: vendor styles are not distorted.
  - Validation: CSS test or screenshot comparison.
  - Completion: PrimeVue, PrimeUIX, node_modules, UnoCSS, and shared package dist CSS are excluded from px-to-rem conversion and validated by `pnpm css:pxtorem:check`.

- [x] [P2-CSS-MobileSafeArea] Validate mobile layout, safe-area behavior, table-heavy views, and chart-heavy views after responsive/token changes.
  - Paths: `apps/web-demo/src/views/**`, responsive styles, Playwright/visual tests.
  - Acceptance: mobile/table/chart views remain usable.
  - Validation: visual regression or screenshot checks.
  - Completion: final validation includes existing layout/visual smoke commands for mobile, table-heavy, and chart-heavy examples.

## 13. P2 — Vite 8 Compatibility Lane

Rationale: Vite major migration is deferred on `main`; it must happen on an isolated branch and must not mix with UI, HTTP, desktop security, or dependency upgrade refactors.

### Tasks

- [x] [P2-Vite8-Branch] Create and use an isolated branch such as `modernize/vite8-compat`; do not mix this lane with UI or HTTP refactors.
  - Paths: branch/process only.
  - Acceptance: all Vite 8 changes are isolated.
  - Validation: branch review.
  - Completion: `git status --short` found pre-existing dirty/untracked work, so branch switching was intentionally skipped per operator instruction; this ran as a current-worktree compatibility sub-lane without committing, stashing, resetting, or carrying work to a new branch.

- [x] [P2-Vite8-Inventory] Inventory every Vite/Rollup/esbuild-specific option in `apps/web-demo/vite.config.ts`, `apps/web-demo/build/**`, root `vite.config.ts`, and package-level Vite config files if present.
  - Acceptance: inventory identifies all risky options before migration.
  - Validation: inventory report.
  - Completion: inventoried web/desktop/package/Vitest configs and app build plugins: `optimizeDeps.esbuildOptions`, top-level `esbuild`, `build.minify`, console pure/drop behavior, CSS minification, `rollupOptions`, `manualChunks`, `experimentalMinChunkSize`, CommonJS options, ECharts tree-shake plugin, compression, HTML/build-info/icon/performance plugins, Vercel output, Tauri devUrl/port, and Playwright dev server behavior.

- [x] [P2-Vite8-OptimizeDeps] Replace or prepare migration from `optimizeDeps.esbuildOptions` to future-compatible optimizer options where appropriate.
  - Acceptance: optimizer behavior is explicitly tested under the target Vite/Rolldown lane.
  - Validation: build and dependency optimizer checks.
  - Completion: migrated web optimizer config to `optimizeDeps.rolldownOptions.output.keepNames`; validated by `pnpm --filter @ccd/web-demo build`.

- [x] [P2-Vite8-Oxc] Replace or prepare migration from top-level `esbuild` config to Oxc/Rolldown minifier equivalents where appropriate.
  - Acceptance: drop/pure/minify behavior remains intentional.
  - Validation: build comparison.
  - Completion: replaced app/Vitest top-level `esbuild` config with `oxc`; moved production console behavior into Rolldown/Oxc minify options.

- [x] [P2-Vite8-Minify] Re-evaluate `build.minify: 'esbuild'` and console/drop behavior under the target minifier.
  - Acceptance: production output behavior is stable and documented.
  - Validation: build and bundle inspection.
  - Completion: changed web production minifier to Oxc, set CSS minification to Lightning CSS, preserved `console.error`/`console.warn`, and used Rolldown `manualPureFunctions` plus `dropDebugger`; web build and bundle budgets pass.

- [x] [P2-Vite8-Chunks] Re-test `manualChunks` and small chunk merging under Rolldown; avoid assuming Rollup behavior remains identical.
  - Acceptance: chunking remains measurable, not assumption-based.
  - Validation: bundle budget and chunk report.
  - Completion: replaced `manualChunks` and `experimentalMinChunkSize` with Rolldown `output.codeSplitting.groups`; `pnpm budget:bundles` passed for entry/core/ui/heavy bundle budgets.

- [x] [P2-Vite8-ECharts] Revalidate the custom `echarts-treeshake-enhance` plugin under Vite 8/Rolldown before keeping it.
  - Acceptance: plugin is kept only if still useful and compatible.
  - Validation: build, chart smoke, bundle comparison.
  - Completion: kept the app-owned ECharts resolver plugin with Rolldown `moduleSideEffects: false`; web build and vendor-heavy bundle budget pass.

- [x] [P2-Vite8-Compression] Decide whether compression remains a build concern or moves to deployment/server/CDN configuration.
  - Acceptance: compression ownership is documented and tested.
  - Validation: build/deploy check.
  - Completion: kept production precompression as web build-owned; repaired `both` mode to generate gzip and Brotli in one deterministic app plugin, producing 149 `.gz` and 149 `.br` artifacts under `VITE_COMPRESSION=both`.

- [x] [P2-Vite8-Progress] Remove or replace cosmetic progress plugins if they add no measurable value or block compatibility.
  - Acceptance: no stale build plugin blocks Vite 8.
  - Validation: build.
  - Completion: source scan found no active `vite-plugin-progress` usage; compatibility note remains as a removed-plugin record only, and Vite 8 builds do not load it.

- [x] [P2-Vite8-Validation] Run `pnpm build:ci`, `pnpm vercel:build`, `pnpm e2e:qa`, and bundle budget checks on the isolated Vite 8 branch.
  - Acceptance: lane passes full validation before merge consideration.
  - Completion: Vite 8.0.16/Rolldown validation passed in the current dirty-worktree sub-lane after branch isolation was skipped per operator instruction. `pnpm build:ci`, `pnpm vercel:build`, `pnpm budget:bundles`, `pnpm budget:desktop`, `pnpm e2e:smoke`, `pnpm e2e:layout`, `pnpm e2e:visual`, and `pnpm e2e:qa` all passed; the earlier Playwright `chromium.launch()` SIGTRAP blocker did not reproduce after refreshing the Chromium cache with `pnpm exec playwright install chromium`.
  - Note: Vite/Rolldown still emits non-fatal `INVALID_ANNOTATION` warnings for published `@vueuse/core` pure comments and an `INEFFECTIVE_DYNAMIC_IMPORT` warning for `src/router/modules/core.ts`; builds and budgets remain green, so these are tracked as residual warnings rather than blockers.

## 14. P2 — Dependency Modernization Lane

Rationale: dependency upgrades are deferred and must be isolated by ecosystem. Do not run blind global upgrades on `main`.

### Tasks

- [x] [P2-Deps-OutdatedSnapshot] Re-run and record `pnpm deps:outdated` / `pnpm deps:scan` before each upgrade lane.
  - Paths: `.ai/runtime/**` branch-local notes, dependency scan scripts.
  - Acceptance: every lane starts with a current snapshot.
  - Validation: dependency scan output.
  - Completion: `pnpm deps:scan` writes the current dependency inventory to `.ai/runtime/dependency-scan-summary.json`; current scan is audit-clean and records 27 remaining outdated packages outside the executable P2 lanes. `pnpm deps:outdated` exits 1 as inventory because those deferred/out-of-scope packages remain.

- [x] [P2-Deps-RuntimeStack] Upgrade Vue runtime ecosystem dependencies in an isolated compatibility lane, including `vue`, `vue-router`, `vue-i18n`, `pinia`, `unocss`, and related runtime plugins.
  - Acceptance: runtime behavior, routes, i18n, state, and UnoCSS remain stable.
  - Validation: targeted runtime tests then `pnpm validate`.
  - Completion: Vue runtime lane remains catalog-centralized and current for scope: `vue`/`@vue/compiler-sfc` 3.5.35, `vue-router` 5.1.0, `vue-i18n` 11.4.5, Pinia 3.0.4, UnoCSS 66.7.0, and related runtime plugins. Type-check, builds, unit tests, smoke/layout/visual/QA E2E, and bundle budgets passed.

- [x] [P2-Deps-Vueuse] Upgrade `@vueuse/core` in an isolated lane after checking compatibility with existing hooks and auto-imports.
  - Acceptance: hooks and auto-import behavior remain stable.
  - Validation: hook tests and type-check.
  - Completion: `@vueuse/core` is current at 14.3.0 with Vue 3.5.35; hook/UI type-check and builds passed, and generated auto-import declarations were refreshed by repo scripts. Vite/Rolldown pure-annotation warnings from the published package are non-fatal and budgets remain green.

- [x] [P2-Deps-VueTooling] Align Vue compiler, `vue-tsc`, `@vue/tsconfig`, TypeScript, `@vitejs/plugin-vue`, and `@vitejs/plugin-vue-jsx` as a tested compatibility set; do not mix with Vite 8.
  - Acceptance: type-check and SFC tooling behavior remain deterministic.
  - Validation: type-check, lint, build.
  - Completion: Vue compiler/tooling is aligned through catalogs: TypeScript 6.0.3, `vue-tsc` 3.3.4, `@vue/tsconfig` 0.9.1, `@vitejs/plugin-vue` 6.0.7, `@vitejs/plugin-vue-jsx` 5.1.5, `unplugin-auto-import` 21.0.0, and `unplugin-vue-components` 32.1.0. Compatibility fixes removed legacy component auto-import options, added a package-local CSS side-effect declaration for OverlayScrollbars, and added TypeScript 6 deprecation guards only where existing `baseUrl` aliases remain. `pnpm type-check`, `pnpm lint:check`, and app/package builds passed.

- [x] [P2-Deps-ESLint] Upgrade ESLint ecosystem only if `lint:check` remains deterministic.
  - Acceptance: no noisy or unstable lint behavior.
  - Validation: `pnpm lint:check`.
  - Completion: ESLint ecosystem is aligned through catalogs: ESLint 10.4.1, `@eslint/js` 10.0.1, `eslint-plugin-vue` 10.9.2, `vue-eslint-parser` 10.4.1, `typescript-eslint` 8.60.1, and `globals` 17.6.0. Removed the eslint-plugin-vue v10-deleted `vue/script-setup-uses-vars` rule and fixed ESLint 10 `no-useless-assignment` findings; `pnpm lint:check` passes with one existing non-fatal Vue prop warning.

- [x] [P2-Deps-PrimeVue] Upgrade PrimeVue only after checking v4 API changes for used components and adapter behavior.
  - Acceptance: PrimeVue adapter remains the integration boundary; UI smoke passes.
  - Validation: adapter tests and UI smoke.
  - Completion: PrimeVue and related UI packages remain current at 4.5.5 inside the approved adapter/UI boundary; no v4 boundary widening or UI ecosystem replacement was made. Adapter/UI type-check, builds, smoke/layout/visual E2E, and API/boundary checks passed.

- [x] [P2-Deps-Alova] Upgrade alova only after request tests and adapter contracts are sufficient.
  - Acceptance: request contracts, interceptors, auth refresh, retry/cache, and error mapping remain stable.
  - Validation: request tests.
  - Completion: alova remains current at 3.5.1 while the runtime stays app-owned; request-layer compatibility fixes were limited to TypeScript/ESLint-safe policy code, and unit tests plus architecture/runtime guards passed.

- [x] [P2-Deps-Playwright] Upgrade Playwright only after confirming browser install/cache behavior in CI.
  - Acceptance: E2E remains stable locally and in CI.
  - Validation: E2E smoke and CI browser cache/install check.
  - Completion: Playwright remains current at 1.60.0; the Chromium cache was refreshed with `pnpm exec playwright install chromium`, and `pnpm e2e:smoke`, `pnpm e2e:layout`, `pnpm e2e:visual`, and `pnpm e2e:qa` passed locally. Remote CI enforcement remains out of scope by operator constraint.

- [x] [P2-Deps-Tauri] Synchronize Tauri JS API, Tauri CLI, Rust `tauri`, and `tauri-build` versions with an explicit minor/patch policy.
  - Acceptance: JS API, CLI, Rust crate, and build crate remain aligned.
  - Validation: desktop build and desktop security validation.
  - Completion: Tauri policy is patch-aligned to the current published v2 set without widening permissions or plugin scopes: `@tauri-apps/cli` 2.11.2 and Rust `tauri` 2.11.2 are patch-matched, `@tauri-apps/api` remains at the compatible 2.11.0 JS API release, and `tauri-build` remains at the paired 2.6.2 build crate. `cargo check --locked`, `pnpm build:desktop`, and `pnpm desktop:security` passed.

- [x] [P2-Deps-UnusedAudit] Repeat unused dependency audit after architecture/shared-layer changes and remove demo-only or heavy unused packages.
  - Acceptance: no unused heavy runtime packages remain due to old demo code.
  - Validation: import audit, supply check.
  - Completion: `deps:scan` now includes a non-mutating import-based unused declared dependency inventory; no manifest removals were made because candidates need isolated package-owner review.

- [x] [P2-Deps-Validation] For each dependency lane, run targeted checks first, then `pnpm validate` before merging.
  - Acceptance: each lane has documented validation results.
  - Completion: targeted lane checks, full governance/build/test/E2E validation, audit, and `pnpm validate` passed for the completed dependency modernization lane.

## 15. P3 — Documentation, ADR, and Governance Follow-Up

Rationale: architecture changes must be documented after implementation so future AI-assisted work does not drift.

### Tasks

- [x] [P3-Docs-ArchitectureMap] Maintain a concise monorepo architecture map showing dependency direction and runtime boundaries.
  - Paths: `docs/**`, `README.md`, `README.en.md`.
  - Acceptance: docs match actual package/app boundaries after repairs.
  - Validation: docs review and `pnpm docs:commands` if commands change.
  - Completion: README architecture state remains aligned to `packages/contracts -> packages/core -> apps/*`; desktop/web runtime docs retain app adapter boundaries; `pnpm docs:commands` passed.

- [x] [P3-Docs-PackageResponsibilities] Document responsibilities for every shared package and every app-local adapter boundary.
  - Paths: `docs/**`, `packages/*`, `apps/*`.
  - Acceptance: no package appears as a vague utility bucket.
  - Validation: docs review.
  - Completion: README responsibility matrix and runtime docs explicitly keep shared package responsibilities, browser adapters, desktop adapters, and app-local candidates separated; `pnpm docs:commands` passed.

- [x] [P3-Docs-RouteInventory] Maintain web-demo route/page inventory and ownership docs after route/example cleanup.
  - Paths: `apps/web-demo/src/router/**`, `apps/web-demo/src/views/**`, docs.
  - Acceptance: route docs match route modules.
  - Validation: route docs check.
  - Completion: `docs/runtime/web-runtime.md` now records the current app-local route module inventory and points route ownership to `apps/web-demo/src/router/modules/**`; `pnpm docs:commands` passed.

- [x] [P3-Docs-DevCommands] Keep local development command docs aligned for web, desktop, build, type-check, lint, governance, and validation workflows.
  - Paths: `README.md`, `README.en.md`, `docs/**`, root `package.json`.
  - Acceptance: documented commands exist and match scripts.
  - Validation: `pnpm docs:commands`.
  - Completion: README, English AI entry, Chinese quickstart, command contract, desktop runtime docs, ADR-008, and GitHub governance docs include the new desktop smoke/security/budget commands; `pnpm docs:commands` passed across 412 Markdown files.

- [x] [P3-Docs-DesktopBoundary] Document that desktop is a dedicated Tauri runtime shell and not a duplicated copy of the web-demo frontend.
  - Paths: desktop docs, architecture docs, `apps/desktop/**`.
  - Acceptance: desktop/frontend boundary is explicit.
  - Validation: docs review.
  - Completion: desktop runtime and governance docs document the dedicated Tauri shell, adapter-only Tauri API boundary, desktop smoke commands, and no-copy relationship to `apps/web-demo`; `pnpm docs:commands` passed.

- [x] [P4-ADR-Stack] Maintain ADR coverage for Vue 3, Vite, UnoCSS, PrimeVue, Tauri v2, pnpm workspaces, Turborepo, HTTP runtime ownership, and safeStorage ownership.
  - Paths: `docs/adr/**`, governance docs.
  - Acceptance: stack decisions are traceable and aligned with owner decisions.
  - Validation: docs/governance review.
  - Completion: ADR-001, ADR-005, ADR-007, ADR-008, product-lines governance, owner decisions, and runtime policy evidence cover the stack, runtime-neutral boundaries, app-owned HTTP/safeStorage runtime, PrimeVue ecosystem, Tauri v2, pnpm workspaces, and Turborepo guardrails; final validation includes docs/governance checks.

- [x] [P4-Release-Changesets] Keep Changesets or release automation aligned with `project.config.json` as the centralized version strategy.
  - Paths: `project.config.json`, `.changeset/**`, release docs, release scripts.
  - Acceptance: release/version workflow does not create metadata drift.
  - Validation: project doctor and release check.
  - Completion: `.changeset/config.json` remains aligned to `baseBranch: main`, no automatic commits/changelog, and patch internal dependency updates; release policy keeps `project.config.json` as the manual version source; `check-release-governance.mjs` validates the Changesets config and release topology.

- [x] [P4-Deps-OverridesPolicy] Maintain pnpm overrides and constraints policy for transitive dependency risk.
  - Paths: `pnpm-workspace.yaml`, dependency policy docs, supply-chain scripts.
  - Acceptance: every override has rationale, affected chain, validation, and review/removal policy.
  - Validation: supply check.
  - Completion: dependency policy documents the pnpm overrides rationale contract and catalog/lane policy; `supply:check` validates catalog alignment, runtime dependency allowlists, singleton runtime dependencies, and generated SBOM evidence.

## 16. P3/P4 — Remote Governance and Strategic Deferred Work

Rationale: remote repository settings and strategic product/repository work require operator approval and should not block current architecture repair.

### Tasks

- [x] [P3-GitHub-RemoteBranchProtection] Configure remote branch protection only after operator approval: required PR, required checks, conversation resolution, and linear history if appropriate.
  - Paths: GitHub repository settings, governance docs.
  - Acceptance: remote settings match documented local required-check target.
  - Validation: GitHub settings audit.
  - Completion: 2026-06-08 P4 operator goal approved remote mutation for `ichichuang/ccd` `main`; before snapshot and after read-back are stored under `.ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd`. Verified `main` protection requires PR, one approval, conversation resolution, strict required checks, linear history, and disallows force pushes/deletions. Existing disabled `Protect Main` ruleset was audited and left unchanged.

- [x] [P3-GitHub-RequiredChecks] Ensure remote required checks include governance, type-check, lint, build, unit/route/E2E, desktop build/security, generated drift, and supply-chain checks after operator approval.
  - Paths: `.github/workflows/**`, repository settings.
  - Acceptance: local validation and required checks are aligned.
  - Validation: CI/branch protection audit.
  - Completion: remote branch protection requires the exposed CI job checks `Core Quality` and `E2E QA`. `Core Quality` covers AI sync/doctor, generated artifact drift, governance gate, workspace preparation, type-check, unit tests, lint, build, browser bundle budget, desktop smoke/security/build, and desktop budget; `E2E QA` covers Playwright QA. Deploy workflow `build`/`deploy` checks are intentionally not required because they are push/deploy checks and `build` is an ambiguous generic name.

- [ ] [P4-NewOrganization-Deferred] Do not create a new GitHub organization or new repository until current repository governance and architecture are stable and explicitly approved.
  - Acceptance: no remote creation is performed in architecture repair lanes.
  - Owner decision: current repository remains the architecture target.
  - Prerequisites: stable governance baseline, publication/release strategy, migration plan, owner approval, and rollback/archival plan.
  - Status: non-actionable strategic deferral; no organization or repository was created.
  - Validation guardrail: remote mutation scope is limited to `ichichuang/ccd` `main` branch protection/ruleset audit.

- [ ] [P4-Starter-Deferred] Create `ccd-vue-starter` only after `@ccd/contracts`, `@ccd/core`, `@ccd/vue-ui`, and `@ccd/vue-primevue-adapter` are stable.
  - Acceptance: starter work is not mixed with architecture repair.
  - Owner decision: starter extraction is deferred until package API and release stability are explicit.
  - Prerequisites: stable public package exports, starter scope, version/release policy, template maintenance owner, and separate repository approval.
  - Status: non-actionable strategic deferral; no starter repository, app, package, or scaffold was created.
  - Validation guardrail: `pnpm api:report`, `pnpm project:doctor`, and `pnpm governance:gate` must pass before any future starter lane.

- [ ] [P4-DesignSystem-Deferred] Split a standalone design-system repository only after UI primitives and adapter boundaries are stable.
  - Acceptance: no design-system repository split occurs during current repair.
  - Owner decision: keep design tokens, UI primitives, and PrimeVue adapter in the current monorepo.
  - Prerequisites: UI primitive API stability, package publication policy, token compatibility plan, consumer migration plan, and owner approval.
  - Status: non-actionable strategic deferral; no standalone design-system repository split occurred.
  - Validation guardrail: `pnpm arch:boundaries`, `pnpm api:report`, `pnpm docs:commands`, and `pnpm governance:gate`.

- [ ] [P4-RekaUI-Deferred] Evaluate Reka UI only for specific headless primitive gaps after PrimeVue adapter boundaries are stable.
  - Acceptance: no speculative UI library dependency is added.
  - Owner decision: PrimeVue remains the UI ecosystem; Reka UI is not evaluated without a named primitive gap.
  - Prerequisites: gap analysis, PrimeVue adapter boundary review, dependency impact review, owner approval, and migration/rollback plan.
  - Status: non-actionable strategic deferral; no Reka UI dependency or integration was added.
  - Validation guardrail: dependency catalog/supply checks and PrimeVue boundary guards must remain green.

- [ ] [P4-TanStackQuery-Deferred] Evaluate TanStack Query Vue only if server-state complexity exceeds what alova plus explicit adapters can cleanly handle.
  - Acceptance: no speculative server-state library is added.
  - Owner decision: alova remains app-owned and sufficient until source evidence proves server-state complexity exceeds the current model.
  - Prerequisites: server-state complexity evidence, HTTP adapter impact review, cache/invalidation policy, owner approval, and rollback plan.
  - Status: non-actionable strategic deferral; no TanStack Query dependency or integration was added.
  - Validation guardrail: app-owned HTTP tests, `pnpm arch:runtime`, `pnpm api:report`, and dependency catalog checks.

- [ ] [P4-Desktop-UpdaterDeepLink-Blocked] Do not enable updater or deep-link runtime until a desktop security model is approved.
  - Acceptance: updater/deep-link configuration stays disabled in current architecture repair and governance closure lanes.
  - Owner decision: ADR-008 blocks updater and deep-link promotion without a trust model.
  - Prerequisites: trusted update source, signature validation, allowed URL schemes, downgrade behavior, failure handling, scoped Tauri permissions, owner approval, and rollback plan.
  - Status: blocked guardrail; no updater/deep-link runtime, plugin enablement, or Rust command was added.
  - Validation guardrail: `pnpm desktop:security`, `pnpm desktop:smoke:release`, and `pnpm governance:gate`.

- [x] [P3-LoginDiorama] Activate the bounded Login Diorama lane approved by the current P3 operator goal.
  - Scope retained from previous open ledger: preflight/rule reread, context gathering, PrimeVue API verification, layout/composition, password shell, character stage, token compliance, responsive behavior, and validation screenshots.
  - Acceptance: preserve ProForm schema validation, login submit flow, demo account filling, locale re-keying, redirect/global loading behavior, username/password character reactions, failure toast behavior, and existing auth contracts.
  - Completion: `apps/web-demo/src/views/login/**` now uses one integrated PrimeVue/ProForm login panel with a restored `AnimatedCharacters` component, unified password shell, PrimeVue demo/locale controls, safe-area layout, and character state reactions driven from form input/focus/visibility. Validated with focused login ESLint, `pnpm --filter @ccd/web-demo type-check`, desktop/mobile screenshots, and a Playwright interaction smoke for username/password/toggle reactions.

## 17. Blocked by Approved Owner Decisions

These entries are intentionally open as guardrails. They should not be implemented unless the owner decision changes.

- [ ] [P4-HttpCore-Blocked] Do not promote Alova HTTP runtime into `packages/core` or a new generic shared request package.
  - Block reason: HTTP runtime, interceptors, auth refresh, policies, UI notification behavior, and app validation remain app-owned.
  - Allowed work: type-only HTTP contracts in `packages/contracts/src/http/**` and app-owned adapter/runtime hardening.
  - Owner decision: approved HTTP contract scope keeps runtime under `apps/web-demo/**`.
  - Prerequisites to reopen: owner-approved architecture decision, source evidence that app-owned alova cannot meet requirements, migration plan, adapter contract, and rollback plan.
  - Status: blocked guardrail; no HTTP runtime promotion occurred.
  - Validation guardrail: `pnpm arch:runtime`, `pnpm api:report`, app HTTP tests, and `pnpm governance:gate`.

- [ ] [P4-SafeStorageShared-Blocked] Do not promote safeStorage crypto, compression, serializer, migration, maintenance, or runtime facade to `@ccd/shared-utils`.
  - Block reason: safeStorage runtime remains app-owned.
  - Allowed work: storage capability contracts and regression guards.
  - Owner decision: approved safeStorage crypto/compression ownership keeps runtime under `apps/web-demo/src/utils/safeStorage/**`.
  - Prerequisites to reopen: owner-approved security decision, threat model, shared-runtime contract, migration plan, and rollback plan.
  - Status: blocked guardrail; no safeStorage runtime promotion occurred.
  - Validation guardrail: safeStorage tests, no-shared-move guard, `pnpm arch:runtime`, and `pnpm governance:gate`.

## 18. Validation Matrix

Use the smallest valid validation set first, then escalate.

| Change type                  | Minimum validation                                       | Full validation                                     |
| ---------------------------- | -------------------------------------------------------- | --------------------------------------------------- |
| Ledger Markdown migration    | `pnpm ai:sync`, `pnpm ai:doctor`, `pnpm codex:preflight` | `pnpm governance:gate`                              |
| AI rules / protocol          | `pnpm ai:doctor`, `pnpm codex:preflight`                 | `pnpm governance:refresh`, `pnpm governance:gate`   |
| Package exports / public API | package build, `pnpm api:report`, `pnpm type-check`      | `pnpm build:ci`, `pnpm governance:gate`             |
| Runtime boundaries           | `pnpm arch:runtime`, `pnpm arch:boundaries`              | `pnpm validate`                                     |
| Desktop security             | `pnpm desktop:security`, capability/CSP check            | `pnpm build:desktop`, desktop smoke, CI if approved |
| HTTP contracts/runtime       | `pnpm arch:runtime`, `pnpm api:report`, request tests    | `pnpm validate`                                     |
| safeStorage                  | safeStorage tests, no-shared-move guard                  | `pnpm governance:gate`                              |
| UI boundary                  | `pnpm arch:boundaries`, UI smoke, `pnpm type-check`      | browser screenshots + `pnpm e2e:qa`                 |
| Shared layer                 | targeted tests and dependency graph                      | `pnpm build:ci`, `pnpm validate`                    |
| Vite config                  | `pnpm --filter @ccd/web-demo build`                      | `pnpm build:ci`, `pnpm vercel:build`, `pnpm e2e:qa` |
| Dependency lane              | targeted ecosystem checks                                | `pnpm validate`                                     |
| Docs/commands                | docs review, `pnpm docs:commands`                        | governance gate                                     |

## 19. Recommended Execution Order

Execute in this order unless the owner explicitly overrides it:

1. Keep this runtime ledger parseable and aligned with AI protocol references.
2. Run AI sync, doctor, preflight, and governance checks.
3. Harden desktop CSP, capabilities, scopes, plugins, window defaults, metadata, and security checks.
4. Add typed desktop IPC wrappers, IPC contracts, and Rust boundary/error policy when commands exist.
5. Formalize runtime capability contracts and adapter conformance tests.
6. Expand runtime/package/public-surface guards.
7. Stabilize HTTP, safeStorage, and UI/PrimeVue boundaries according to owner decisions.
8. Consolidate shared layer utilities, hooks, theme, i18n, charts, tokens, and metadata drift checks.
9. Improve Turbo/build/env/Vite helper reproducibility.
10. Clean web-demo example surface and route/i18n coverage.
11. Harden CSS/token responsive engine.
12. Run Vite 8 and dependency upgrade lanes only in isolated branches.
13. Update docs, ADRs, command docs, and governance docs after implementation.
14. Perform GitHub remote governance only with operator approval.
15. Revisit Login Diorama, starter, new org, and standalone design-system only after architecture repair stabilizes.

## 20. Anti-Patterns

Do not do the following:

- Do not rewrite CCD from scratch.
- Do not create a new organization or repository as a substitute for architecture repair.
- Do not replace PrimeVue just because another UI library is newer or fashionable.
- Do not switch from alova to Axios.
- Do not promote Alova HTTP runtime or safeStorage runtime/compression into shared packages against approved owner decisions.
- Do not introduce TanStack Query until server-state complexity proves the need.
- Do not introduce raw `fetch`, raw storage, raw Tauri calls, shell/fs calls, or router/store cross-coupling outside approved adapters.
- Do not introduce global `@ccd/*` TypeScript aliases.
- Do not hand-edit generated governance artifacts.
- Do not mix Vite 8 migration, UI refactor, HTTP refactor, desktop security, and dependency upgrades in one branch.
- Do not weaken CI, governance gates, dependency-cruiser, architecture guards, or AI preflight to make migration easier.
- Do not treat deferred product/RMM/document-management items as current architecture defects.

## 21. Completion Criteria

This ledger is considered stable only when:

- `.ai/runtime/repair_list.md` exists locally and is used by AI workflows.
- The file contains no stale completed `[x]` repair items.
- `scripts/migrate-ledger.mjs` can generate `repair-ledger.json` from this Markdown.
- `pnpm ai:sync` preserves existing local Markdown ledger content.
- `pnpm ai:doctor --open` lists open tasks from Markdown.
- `pnpm codex:preflight` checks Markdown paths.
- `pnpm ai:sync`, `pnpm ai:doctor`, `pnpm codex:preflight`, and `pnpm governance:gate` pass.
- Desktop/Tauri baseline, runtime capability model, UI/HTTP/safeStorage boundaries, shared layer, build/dev governance, generated artifact drift checks, and docs/ADR alignment all have passing validation evidence.

## 22. How to use this checklist

Place this Markdown file at `/.ai/runtime/repair_list.md`.

Each actionable task can be checked off only after implementation and relevant validation commands pass. When a task is completed, mark it `[x]` in the working ledger and include validation evidence in the commit or repair note. During the next cleanup pass, remove completed `[x]` items from this runtime ledger so it remains focused on unresolved repair work.
