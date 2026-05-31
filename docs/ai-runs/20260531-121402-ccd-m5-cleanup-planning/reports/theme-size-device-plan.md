# M5 Theme, Size, and Device Plan

## Theme Plan

| target | current source | split | future owner | facade strategy | validation |
| --- | --- | --- | --- | --- | --- |
| Pure theme derivation | `apps/web-demo/src/utils/theme/**` residues and `packages/design-tokens/src/theme-engine/**` | keep or move pure token/color/validate/cache/compiler helpers into `packages/design-tokens` | `packages/design-tokens` | switch consumers/root scripts to package public exports before deleting app residues | token tests, `pnpm validate:tokens`, API report |
| Theme DOM/storage application | `apps/web-demo/src/utils/theme/engine.ts` | pure vars already package-owned; DOM/storage target injected through `applyThemeVars` | `packages/vue-app-platform` plus app facade | keep `applyTheme(vars)` as app compatibility wrapper passing `document.documentElement` and storage keys | e2e visual, theme store specs |
| Mode resolution/application | `apps/web-demo/src/utils/theme/mode.ts` | pure `resolveThemeModeIsDark` versus `matchMedia`/root class application | pure resolver to `design-tokens`; target application to `vue-app-platform`; system query app-owned/injected | keep app facade until store and theme switch are migrated | theme store specs, e2e visual |
| Transition runtime | `apps/web-demo/src/utils/theme/transitions.ts`, `useThemeSwitch.ts` | pure geometry/config versus viewport/CSS/media-query reads and lock state | `vue-app-platform` for injected primitives; app UX remains app-owned | keep app integration facade; do not move cycle-breaking lock until dependency chain is redesigned | useThemeSwitch specs, e2e visual |
| Lottie theme utilities | `apps/web-demo/src/utils/theme/lottieThemeUtils.ts` | pure JSON color transform versus DOM token reads | pure transform to `shared-utils` or `vue-app-platform` only if reused; DOM token reads app/injected | keep app helper until reuse is proven | LoadingLottie smoke, e2e visual |

## Size Plan

| target | current source | split | future owner | facade strategy | validation |
| --- | --- | --- | --- | --- | --- |
| Size variables and layout calculations | `apps/web-demo/src/utils/theme/sizeEngine.ts` | `generateSizeVars`, `decideRootFontSize`, `decideLayoutDimensions`, `getPresetBySizeMode` | `packages/design-tokens` | app `sizeEngine.ts` re-exports while source lane migrates consumers | size unit tests, design-tokens tests |
| DOM size application | `applySizeTheme`, `applyRuntimeSizeUpdate`, `applyAllSizeVars` | target style write and `dataset.fontScale` mutation | `packages/vue-app-platform` with injected target | keep app wrapper that supplies `document.documentElement` | e2e layout, e2e visual |
| First-paint preload | `preload()` | storage read, safe decode, device read, size var application | app preloader adapter plus `vue-app-platform` primitive | keep app-owned `preload()` until storage and device APIs are split | web-demo smoke, e2e layout |
| Size store | `apps/web-demo/src/stores/modules/system/size.ts` | Pinia state and sync remain app-owned; pure preset/var generation moves out | app store plus platform APIs | keep store API stable; call injected/package helpers later | `size.spec.ts`, layout e2e |

## Device Plan

| target | current source | split | future owner | facade strategy | validation |
| --- | --- | --- | --- | --- | --- |
| Device type resolver | `apps/web-demo/src/utils/deviceSync.ts` | pure UA/maxTouchPoints/screen-short-side resolver versus browser reads | `packages/design-tokens` or `packages/vue-app-platform` | keep `getDeviceTypeSync()` facade collecting browser inputs | device resolver tests |
| OS resolver | `apps/web-demo/src/utils/deviceSync.ts` | pure UA resolver versus navigator access | likely app/system type owner unless cross-runtime value is approved | keep app facade | device tests |
| Breakpoint resolver | `deviceSync.ts`, `device.ts` | pure width-to-breakpoint resolver from `BREAKPOINTS` | `packages/design-tokens` | package pure resolver; app facade reads `window.innerWidth` | device and layout tests |
| Runtime listeners | `apps/web-demo/src/stores/modules/system/device.ts` | browser event collection, debounce/rAF, visualViewport, Pinia state | app store/runtime listener | keep singleton/idempotent app ownership | device specs, e2e layout |

## Ordering

1. Add pure resolver/calculation tests against current app behavior.
2. Move or expose pure size/device helpers from package owners.
3. Keep app facades calling package helpers.
4. Move DOM target helpers only with injected targets and visual validation.
5. Revisit root scripts that deep-import app theme helpers in M6.

## Non-Goals

- No source migration in M5.
- No movement into `packages/core`.
- No new broad runtime allowlist entries.
- No PrimeVue allowlist reduction in this lane.
