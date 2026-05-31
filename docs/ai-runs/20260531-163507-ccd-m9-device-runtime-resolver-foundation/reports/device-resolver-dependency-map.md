# M9 Device Resolver Dependency Map

## Package Direction

```text
@ccd/design-tokens
  -> pure breakpoint resolver
  -> pure device type resolver
  -> pure OS resolver
  -> pure orientation resolver
  -> pure viewport metrics resolver

@ccd/vue-app-platform
  -> existing pure layout device flags/effective layout resolver

apps/web-demo
  -> browser input collection
  -> compatibility deviceSync facade
  -> Pinia device store state, mutation, listeners, rAF/timer lifecycle
```

## Implemented Movement

- Added `packages/design-tokens/src/deviceResolver.ts`.
- Added `packages/design-tokens/src/deviceResolver.spec.ts`.
- Exported the new pure helpers from `packages/design-tokens/src/index.ts`.
- Updated `apps/web-demo/src/utils/deviceSync.ts` to keep its public facade while injecting browser inputs into package pure resolvers.
- Updated `apps/web-demo/src/stores/modules/system/device.ts` to use package pure breakpoint, orientation, and viewport metrics resolvers without changing state shape or listener lifecycle.
- Updated `packages/design-tokens/src/breakpoints.ts` internal import to `./sizeScale.js` so the new package-internal ESM dependency remains resolvable after build.

## Not Moved

- `getDeviceTypeSync`, `getOsTypeSync`, and `getBreakpointSync` remain app-owned browser facades.
- `useDeviceStore.init`, `detectViewportInfo`, resize/orientation/pageshow/visibility listeners, `visualViewport` listeners, debounce, timers, and `requestAnimationFrame` remain app-owned.
- Pinia store state shape, persistence behavior, resize behavior, and layout adaptation behavior were not changed.
- No package manifests, lockfiles, PrimeVue imports, safeStorage, or generated files were manually edited.

## Runtime Surface Evidence

`command-logs/062-runtime-surface-scan-device-resolver.log` has 0 matches for browser/runtime identifiers in:

- `packages/design-tokens/src/deviceResolver.ts`
- `packages/design-tokens/src/breakpoints.ts`

Existing runtime identifiers remain in app-owned files:

- `apps/web-demo/src/utils/deviceSync.ts`
- `apps/web-demo/src/stores/modules/system/device.ts`

## Eligibility Table

| file | exported_symbol_or_internal_helper | current_owner | target_owner | uses_document | uses_window | uses_navigator | uses_screen | uses_visualViewport | uses_requestAnimationFrame | uses_timer | uses_pinia_store | uses_app_alias | uses_app_constants | uses_browser_runtime | is_runtime_neutral_if_inputs_injected | can_move_without_manifest_change | can_move_in_M9 | proposed_action | tests_required | reason |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `apps/web-demo/src/utils/deviceSync.ts` | `getDeviceTypeSync` | app facade | app facade + `@ccd/design-tokens` pure helper | no | yes | yes | via `window.screen` | no | no | no | no | yes | no | yes | yes | yes | yes, pure formula only | Keep facade; delegate to `resolveDeviceTypeFromInputs()` with explicit `userAgent`, `maxTouchPoints`, `screenWidth`, `screenHeight`. | `deviceResolver.spec.ts`, web-demo tests | Browser access makes facade ineligible as-is, but formula is pure once inputs are injected. |
| `apps/web-demo/src/utils/deviceSync.ts` | `getOsTypeSync` | app facade | app facade + `@ccd/design-tokens` pure helper | no | no | yes | no | no | no | no | no | yes | no | yes | yes | yes | yes, pure formula only | Keep facade; delegate to `resolveOsTypeFromUserAgent()`. | `deviceResolver.spec.ts`, web-demo tests | UA parsing is pure; navigator collection remains app-owned. |
| `apps/web-demo/src/utils/deviceSync.ts` | `getBreakpointSync` | app facade | app facade + `@ccd/design-tokens` pure helper | no | yes | no | no | no | no | no | no | no | no | yes | yes | yes | yes, pure formula only | Keep facade; delegate to `resolveBreakpointFromWidth()`. | `deviceResolver.spec.ts`, device store spec | Width-to-breakpoint mapping is pure; default width collection remains app-owned. |
| `apps/web-demo/src/stores/modules/system/device.ts` | internal `resolveBreakpoint` | app store | `@ccd/design-tokens` | no | no | no | no | no | no | no | yes | no | no | no | yes | yes | yes | Replace duplicated helper with `resolveBreakpointFromWidth()`. | `deviceResolver.spec.ts`, device store spec | Exact duplicate of `deviceSync` breakpoint formula. |
| `apps/web-demo/src/stores/modules/system/device.ts` | orientation derivation | app store | `@ccd/design-tokens` | no | no | no | no | no | no | no | yes | no | no | no | yes | yes | yes | Use `resolveOrientationFromViewport()`. | `deviceResolver.spec.ts`, device store spec | Formula depends only on width/height and preserves `width >= height` behavior. |
| `apps/web-demo/src/stores/modules/system/device.ts` | viewport metrics derivation | app store | `@ccd/design-tokens` | no | yes, collector only | no | via collector only | no | no | no | yes | no | no | yes in caller | yes | yes | yes, pure formula only | Use `resolveViewportMetrics()` after collecting explicit browser values. | `deviceResolver.spec.ts`, device store spec | Derived fields are pure after app collects viewport/screen/pixelRatio inputs. |
| `apps/web-demo/src/stores/modules/system/device.ts` | `initHardwareInfo` | app store | app store | no | through facade | through facade | through facade | no | no | no | yes | yes | no | yes | no | no | no | Keep app-owned; call compatibility facades. | device store spec, web-demo tests | Mutates Pinia state and owns app initialization behavior. |
| `apps/web-demo/src/stores/modules/system/device.ts` | `detectViewportInfo` | app store | app store | no | yes | no | yes | no | no | no | yes | no | no | yes | partially | no | no | Keep browser collection and Pinia mutation app-owned; only delegate pure derivation. | device store spec, web-demo tests | Direct window/screen reads and store mutation are runtime/app behavior. |
| `apps/web-demo/src/stores/modules/system/device.ts` | `init` listener lifecycle | app store | app store | yes | yes | no | no | yes | yes | yes | yes | no | no | yes | no | no | no | Keep unchanged. | device store spec, web-demo tests | Event listeners, rAF, timers, visualViewport, cleanup, and singleton lifecycle are forbidden to move in M9. |
| `packages/vue-app-platform/src/layoutRuntime.ts` | `resolveLayoutDeviceFlags` | `@ccd/vue-app-platform` | existing owner | no | no | no | no | no | no | no | no | no | no | no | yes | n/a | no source move needed | Leave existing resolver in place; app store already reuses it. | vue-app-platform tests, device store spec | Correct platform resolver already exists and is reused. |

## Public API Impact

`@ccd/design-tokens` root exports now include:

- `createSortedBreakpoints`
- `SORTED_BREAKPOINTS`
- `resolveBreakpointFromWidth`
- `resolveDeviceTypeFromInputs`
- `resolveOsTypeFromUserAgent`
- `resolveOrientationFromViewport`
- `resolveViewportMetrics`
- related resolver input/output types

No package manifest or lockfile change was required.
