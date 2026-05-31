# M5 System Store and Hook Facade Plan

## System Stores

| store | current role | extractable pieces | app-owned pieces | future lane | validation |
| --- | --- | --- | --- | --- | --- |
| `system/theme.ts` | Pinia theme preference state, sync, refresh, mode listener lifecycle | pure mode resolver; theme var generation already in design-tokens; target theme application through vue-app-platform | Pinia state, persisted keys, app sync, localStorage first-paint key, system media listener lifecycle | M5-source-theme-runtime | theme store specs, e2e visual |
| `system/size.ts` | Pinia density preference state, sync, CSS var application | pure size var and layout calculation helpers | Pinia state, persisted key, app sync, store lifecycle | M5-source-size | size store specs, e2e layout |
| `system/device.ts` | Pinia viewport/device state and listener singleton | pure device, OS, breakpoint resolvers; layout device flags already in vue-app-platform | event listeners, visualViewport, debounce/rAF, mitt resize emit, Pinia state | M5-source-device | device specs, e2e layout |
| `system/layout.ts` | Pinia layout preference state and migration helpers | pure visibility dependency state machine may be extracted if reused | Pinia persistence, app layout preferences, device store dependency, sync | M7-layout-store-cleanup | layout store specs |
| `system/locale.ts` | locale/i18n preference state and compatibility events | timezone mapping resolver only if reused | app i18n calls, window compatibility events, sync, localStorage | M7-locale-cleanup | locale specs |
| `system/index.ts` | grouped store barrel | none | app store grouped entrypoint | none | web-demo type-check |

System stores remain app-owned state containers. Future source lanes may extract pure resolvers or state machines, but should not move Pinia stores into packages.

## Hook and Facade Plan

| facade | current package owner | app coupling | retention strategy | removal strategy | validation |
| --- | --- | --- | --- | --- | --- |
| `useAutoMitt.ts` | `@ccd/vue-hooks` owns `createAutoMittHook` | app `mitt` singleton and event map | keep thin binding | remove only if app can inject event map directly through package-safe setup | vue-hooks tests, web-demo type-check |
| `useDialog.tsx` | `@ccd/vue-ui` owns `useDialogCore`, PrimeDialog, message content | app `t()` translation and semantic default helpers | keep app i18n facade | extract only generic non-translated builders if a second app needs them | vue-ui dialog tests, web-demo type-check |
| `useProTableUrlSync.ts` | `@ccd/vue-ui` owns adapter key and types | `useRoute`, `useRouter`, query semantics | keep app router adapter | do not remove until a different router adapter abstraction is approved | ProTable URL sync tests if changed |
| `layouts/runtime/layoutRuntime.ts` | `@ccd/vue-app-platform` owns layout runtime | none | keep thin re-export facade for app import compatibility | remove after all app imports use package public export | layout runtime tests |
| `plugins/modules/proform.ts` | `@ccd/vue-ui` owns ProForm adapter points | app DateUtils, safeStorage, env, browser storage | keep app plugin shell | no package migration; only update injected codec after safeStorage split | ProForm draft tests |
| `plugins/modules/protable.ts` | `@ccd/vue-ui` owns adapter key | app router URL sync facade | keep app provider | no move into package | web-demo type-check |
| `plugins/modules/primevue.ts` | `@ccd/vue-primevue-adapter`, `@ccd/vue-ui` | app stores, locale maps, translation, device flags | keep app plugin shell | reduce only when adapter owns more generic service/locale wrappers | ai guard, adapter tests |

## Compatibility Facade Count

M5 keeps these 7 compatibility facades/integration facades:

- `apps/web-demo/src/hooks/modules/useAutoMitt.ts`
- `apps/web-demo/src/hooks/modules/useDialog.tsx`
- `apps/web-demo/src/hooks/modules/useProTableUrlSync.ts`
- `apps/web-demo/src/layouts/runtime/layoutRuntime.ts`
- `apps/web-demo/src/utils/theme/engine.ts`
- `apps/web-demo/src/utils/safeStorage/index.ts`
- `apps/web-demo/src/utils/safeStorage/safeStorage.ts`

## Residual Risks

- Facades can grow generic behavior if future lanes do not keep package owners explicit.
- Store extraction is high-risk because persisted keys, sync events, and first-paint behavior are intertwined.
- `useProTableUrlSync` is intentionally app-owned; moving router coupling into `@ccd/vue-ui` would be a boundary regression.
