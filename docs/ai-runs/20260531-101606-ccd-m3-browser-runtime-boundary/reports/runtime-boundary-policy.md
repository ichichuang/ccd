# Runtime Boundary Policy

## Result

- Final M3 status: `M3_RUNTIME_BOUNDARY_ENFORCED`
- Policy source: `.ai/governance/policies/runtime.json`
- Validator: `scripts/architecture/check-runtime-leaks.mjs`
- Default gate: `pnpm arch:runtime`

## Policy Model

Runtime governance now has four layers:

1. `runtimeSurfaces`: browser/runtime globals and APIs monitored across apps and packages.
2. `runtimeClassifications`: exact package/app source roots mapped to runtime classes.
3. `runtimePathAllowances`: adapter-owned runtime paths for web and desktop adapters.
4. `runtimeSurfaceExceptions`: exact existing file/surface exceptions with classification, issue IDs, migration target, and revisit lane.

`packages/contracts/src` and `packages/core/src` are strict runtime-neutral paths. Tauri imports and `invoke()` remain restricted to `apps/desktop/src/adapters/**`.

## Counts

| metric | count |
|---|---:|
| inventory rows | 387 |
| production runtime rows | 330 |
| production file/surface pairs | 301 |
| exact exception objects | 122 |
| exact exception file/surface pairs | 297 |
| adapter path allowances | 2 |
| unclassified production findings | 0 |

## Enforcement

Existing non-adapter runtime source was not migrated. It is classified as app bootstrap, app plugin, app store, app view, app layout, app-local compatibility facade, app-local shared candidate, web-library package runtime, node-build package runtime, or violation candidate.

New production runtime access outside adapter path allowances must add an exact file/surface policy entry or `pnpm arch:runtime` fails.

## Deferred Lanes

- M4: app-local shared candidate and PrimeVue direct-import cleanup.
- M5: safeStorage/theme/size/device extraction and runtime-source cleanup.
- M6/M7: remaining tooling/build and owner-decision cleanup.
