# M11 Hook/Facade Eligibility

Baseline: `main` / `cc255d1a`.

M11 result: `M11_HOOK_FACADE_CONVERGENCE_VERIFIED`.

No production hook, plugin, package, manifest, lockfile, PrimeVue allowlist, route, dialog UX, ProTable URL sync, or ProForm draft behavior was changed. This lane added focused app-facade tests and recorded ownership evidence.

| file | exported_symbol_or_facade | current_owner | target_owner | uses_vue_lifecycle | uses_app_event_map | uses_app_router | uses_app_store | uses_app_i18n | uses_browser_runtime | uses_primevue_directly | uses_platform_package | is_thin_facade | is_runtime_neutral_or_web_library_safe | can_move_without_manifest_change | can_move_in_M11 | proposed_action | tests_required | reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `packages/vue-hooks/src/createAutoMittHook.ts` | `createAutoMittHook` | `@ccd/vue-hooks` | `@ccd/vue-hooks` | yes | no | no | no | no | no | no | no | n/a | yes, Vue web-library safe | already package-owned | already done | Keep package factory unchanged. | `pnpm --filter @ccd/vue-hooks test`; focused package spec | Generic lifecycle cleanup belongs in `@ccd/vue-hooks`; app event map is injected by the app facade. |
| `apps/web-demo/src/hooks/modules/useAutoMitt.ts` | `useAutoMitt` | `apps/web-demo` | app event-map facade over `@ccd/vue-hooks` | indirectly through package factory | yes | no | no | no | no | no | yes | yes | app-safe only, not package-neutral because it binds `Events` and emitter | no | no | Keep as thin app compatibility facade; add app facade test. | `apps/web-demo/src/hooks/modules/useAutoMitt.spec.ts`; web-demo type-check/test | It binds the app mitt singleton and event map, while delegating cleanup to `createAutoMittHook`. |
| `packages/vue-ui/src/PrimeDialog/useDialog.ts` | `useDialogCore` | `@ccd/vue-ui` | `@ccd/vue-ui` | no | no | no | no | no | timer only through `globalThis` for open delay | no | yes | n/a | yes, UI web-library safe | already package-owned | already done | Keep core state manager unchanged. | `pnpm --filter @ccd/vue-ui test`; package dialog spec | Core dialog store, delayed open, close/remove/update behavior are already owned by `@ccd/vue-ui`. |
| `apps/web-demo/src/hooks/modules/useDialog.tsx` | `useDialog` | `apps/web-demo` | app i18n/content facade over `@ccd/vue-ui` | no | no | no | no | yes | no | no direct PrimeVue import | yes | partial; broad but app-specific | app-safe only, not package-neutral because translated labels/defaults are app-owned | no | no | Keep app facade; add tests for translated defaults, severities, close commands, and callbacks. | `apps/web-demo/src/hooks/modules/useDialog.spec.ts`; `pnpm --filter @ccd/vue-ui test`; web-demo type-check/test | It owns app `t()` labels, default message text, convenience severity mapping, and callback wiring. Moving it would either hardcode app i18n into `@ccd/vue-ui` or change dialog semantics. |
| `packages/vue-ui/src/ProTable/engine/hooks/useProTableUrlSync.ts` | `PRO_TABLE_URL_SYNC_ADAPTER_KEY`, URL-sync adapter types | `@ccd/vue-ui` | `@ccd/vue-ui` | no | no | no | no | no | no | no | yes | n/a | yes, type/key-only web-library safe | already package-owned | already done | Keep adapter key and structural types unchanged. | `pnpm --filter @ccd/vue-ui test`; ProTable package tests | `@ccd/vue-ui` owns the injection contract, not the concrete router implementation. |
| `apps/web-demo/src/hooks/modules/useProTableUrlSync.ts` | `useProTableUrlSync` | `apps/web-demo` | app router adapter injected into `@ccd/vue-ui` | yes | no | yes | no | no | no | no | yes | partial; facade plus query behavior | app-safe only, not package-neutral because it calls `useRoute()`/`useRouter()` | no for the whole hook; pure query helpers could be reconsidered only with parity approval | no | Keep app-owned; add focused URL query behavior tests. | `apps/web-demo/src/hooks/modules/useProTableUrlSync.spec.ts`; web-demo type-check/test | The hook owns concrete app router query read/write, replace/push mode, key mapping, and route watcher lifecycle. Moving router coupling into `@ccd/vue-ui` would be a boundary regression. |
| `apps/web-demo/src/plugins/modules/proform.ts` | `setupProForm` | `apps/web-demo` | app plugin integration injecting capabilities into `@ccd/vue-ui` | no | no | no | no | no | yes: `window.localStorage`, `import.meta.env`, app safeStorage/date runtime | no | yes | yes | app-safe only, not package-neutral | no | no | Keep app plugin shell unchanged. | ProForm package tests; web-demo type-check/test | It injects app storage prefix, safeStorage codec, env key, and `DateUtils` into package extension points. Those capabilities stay app-owned. |
| `apps/web-demo/src/plugins/modules/protable.ts` | `setupProTable` | `apps/web-demo` | app plugin integration injecting router adapter into `@ccd/vue-ui` | no | no | indirectly via injected hook | no | no | no | no | yes | yes | app-safe only | no | no | Keep plugin provider unchanged. | URL sync app spec; web-demo type-check/test | It wires the app router facade into `PRO_TABLE_URL_SYNC_ADAPTER_KEY`; no package migration is needed. |
| `apps/web-demo/src/plugins/modules/primevue.ts` | `setupPrimeVue` | `apps/web-demo` | app PrimeVue/plugin shell over `@ccd/vue-primevue-adapter` and `@ccd/vue-ui` config | no | no | no | yes | yes | no | yes, approved app plugin allowlist | yes | no, app integration | app-safe only | no | no | Keep app plugin shell unchanged. | Existing `primevue.spec.ts`; `pnpm ai:guard` | It combines app stores, locale mapping, `t`, device layout, PrimeVue install, adapter config, and dialog runtime config. |

## Implementation Decision

M11 selected Option C plus evidence updates:

- Add focused tests around app facade behavior.
- Do not move source behavior.
- Do not add public package exports.
- Do not modify package manifests or lockfile.
- Do not change dialog UX, ProTable URL query semantics, plugin wiring, or PrimeVue allowlists.

## Future Lane Needs

- `B-01` remains open as an app-local compatibility facade watch item, but reusable lifecycle behavior is already package-owned.
- `B-02` remains open until there is owner-approved demand for package-level translated-dialog builder APIs; app `t()` defaults stay app-owned.
- `B-12` remains open as an app router adapter facade; future extraction should only consider pure query helpers with explicit parity fixtures.
- `C-06`, `B-07`, `B-08`, `D-016`, `D-017`, and `G-03` were not changed by M11.
