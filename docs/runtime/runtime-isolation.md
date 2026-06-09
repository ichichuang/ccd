# Runtime Isolation

CCD enforces runtime isolation through workspace package boundaries and adapter injection.

## Active Runtime Surfaces

```text
packages/contracts          -> strict runtime-neutral contracts
packages/core               -> strict runtime-neutral injected-adapter facade
packages/design-tokens      -> runtime-neutral token layer; classified diagnostics debt only
packages/shared-utils       -> runtime-neutral utility layer
packages/unocss-preset      -> node-build package
packages/vue-*              -> governed web-library packages with exact runtime surface classification
apps/web-demo               -> browser app runtime; adapters preferred, exact app-local exceptions registered
apps/desktop                -> desktop WebView app; Tauri runtime in adapters only
root                        -> orchestration-only shell
```

## Core Runtime-Neutrality

`packages/contracts` and `packages/core` are strict runtime-neutral packages and must not access:

- browser globals: `window`, `document`, `navigator`, `localStorage`, `sessionStorage`, `fetch`, `XMLHttpRequest`
- Node globals/builtins: `process`, `fs`, `path`
- runtime side effects: `console`, timers, direct `crypto`
- Tauri APIs or `invoke()`

`packages/design-tokens` and `packages/shared-utils` are also classified as runtime-neutral. Existing non-strict diagnostics runtime references are exact policy exceptions and are tracked as debt, not as reusable runtime permission. `packages/shared-utils/src/createCapabilityBridge.ts` no longer reads `import.meta.env`; test resets require the explicit `CAPABILITY_BRIDGE_TEST_RESET_TOKEN` export instead.

Validation:

```bash
pnpm arch:runtime
```

## Adapter Boundaries

Runtime access should be adapter-owned first:

```text
apps/web-demo/src/adapters/**
apps/desktop/src/adapters/**
```

Rules:

- Browser storage/network/logger implementations stay in web adapters.
- Tauri imports and `invoke()` stay in desktop adapters.
- Adapters translate runtime capability to contracts; they do not own business workflows.

M3 does not migrate existing app source. Existing non-adapter browser runtime usage is allowed only when the exact file and runtime surface are registered in `.ai/governance/policies/runtime.json` with classification, related issue IDs, migration target, and revisit lane. New unclassified production browser runtime access fails `pnpm arch:runtime`.

M4 app-local classification adds a second layer of meaning on top of those exact runtime exceptions: app shell, app adapter, app store, app plugin integration, app view, app layout, app-local compatibility facade, app-local shared candidate, migration candidate, stale-doc candidate, test-only, violation candidate, or needs-owner-decision. This classification is evidence for future lanes, not a runtime allowlist broadening.

P2A records the current safeStorage/theme/size/device split without moving runtime source: type-only storage contracts live in `packages/contracts`; JSON storage codecs and pure capability bridge helpers live in `packages/shared-utils`; pure theme/size/device derivation lives in `packages/design-tokens`; concrete browser collectors, persistence, Pinia stores, router/i18n bindings, and app bootstrap wiring stay app-owned or adapter-injected.

D-016 and D-019 approve app-owned safeStorage terminal runtime boundaries. Crypto/HMAC/Web Crypto, frontend obfuscation-key resolution, `lz-string` compression, Pinia serializer behavior, migration/fallback behavior, browser storage access, and app safeStorage facade exports stay under `apps/web-demo/src/utils/safeStorage/**`; they must not move into `packages/core`, `packages/contracts`, or `@ccd/shared-utils`.

P2A does not broaden runtime or PrimeVue allowlists. Current app-side raw PrimeVue allowlist rows are closed; new app-side raw `primevue/*` or `@primevue/*` imports still require a future exact owner decision.

M8 establishes pure size resolver helpers under `packages/design-tokens` and keeps browser DOM/preload/storage/device/store behavior in `apps/web-demo`. This is non-crypto foundation progress only and does not reduce runtime exception requirements for app-owned surfaces.

M9 establishes pure device resolver helpers under `packages/design-tokens` and keeps browser collectors, listener lifecycle, `visualViewport`, rAF/timers, and store mutation in `apps/web-demo`.

M10 establishes pure layout visibility reducer helpers under `packages/vue-app-platform` and keeps Pinia ownership, persisted preferences, `syncAction`, loading counters, mobile drawer runtime state, and app singleton access in `apps/web-demo`.

M11 verifies hook/facade convergence without reducing runtime boundaries. App event maps, app i18n defaults, app router query sync, app storage/date injection, and PrimeVue app plugin wiring stay in `apps/web-demo`; package layers keep only the generic Vue hook factory, dialog core, ProTable adapter key/types, and ProForm extension points.

Inventory and exceptions:

- `docs/ai-runs/20260531-101606-ccd-m3-browser-runtime-boundary/reports/runtime-surface-inventory.md`
- `docs/ai-runs/20260531-101606-ccd-m3-browser-runtime-boundary/reports/exceptions-register.md`

## Import Boundaries

Validation:

```bash
pnpm arch:boundaries
```

This blocks:

- circular dependencies
- app-to-app imports
- core-to-app imports
- deep package imports
- imports from removed runtime archive paths
- Tauri imports outside desktop adapters

## Deterministic Runtime Commands

```bash
pnpm install --frozen-lockfile
pnpm governance:gate
pnpm type-check
pnpm test
pnpm build
```
