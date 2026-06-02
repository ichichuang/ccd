# M1 Candidate Dependency Map

## Candidate groups

| Candidate | Current surface | Potential owner | Dependencies/coupling | M1 note | Status |
| --- | --- | --- | --- | --- | --- |
| M3-DESKTOP-THEME | apps/desktop/src/theme/index.ts | @ccd/design-tokens for pure var derivation; app keeps DOM write | design tokens only plus document write | review pure createThemeVars/createSizeVars duplication; no manifest change expected | M2_REVIEW |
| M3-ROUTE-ACCESS | apps/web-demo/src/router/utils/accessControl.ts | @ccd/vue-app-platform or contracts after route/menu type extraction | pure string/list logic plus global MenuItem shape | eligible only if route/menu contracts are explicit and tests move with it | M2_REVIEW |
| M3-SYSTEM-PREF-GUARDS | apps/web-demo/src/sync/systemPreferences/guards.ts | @ccd/shared-utils or contracts after preference type owner exists | @ccd/shared-utils castValue; app preference type | not eligible until SystemPreferencePayload contract is package-owned | M2_REVIEW |
| M3-DTO-CONTRACTS | apps/web-demo/src/types/dto/*.ts; src/types/api.ts | @ccd/contracts if type-only; schema package only with approval | zod, RouteMeta, app route DTO aliases | manifest change would be needed for schema migration; type-only split may be possible | M2_REVIEW |
| M3-PURE-UTILITY-REVIEW | apps/web-demo/src/router/utils/menu.ts; transform.ts; resolver.ts | @ccd/vue-app-platform only for isolated pure subsets | Vue Router types, app logger, import.meta.glob, route meta globals | most of the module stays app-owned; only small pure reducers may be extractable | M2_REVIEW |
| M6-BUILD-GENERATOR | apps/web-demo/build/**; vite.config.ts | no current governed build package owner | Vite, process.env, package.json, PrimeVue resolver/generated typing | requires M6 owner decision; do not create package or manifest changes in M1 | M2_REVIEW |
| BLOCK-SAFESTORAGE-CRYPTO | apps/web-demo/src/utils/safeStorage/crypto.ts | apps/web-demo | crypto-es, Web Crypto/fallback, logger/env/security policy | D-016 terminal app-owned; do not migrate | APP_OWNED_TERMINAL |
| BLOCK-SAFESTORAGE-COMPRESSION | apps/web-demo/src/utils/safeStorage/lzstring.ts | apps/web-demo | lz-string declared in app package only | D-019 terminal app-owned; manifest change forbidden | APP_OWNED_TERMINAL |
| BLOCK-DATEUTILS | apps/web-demo/src/utils/date/** | apps/web-demo | dayjs plugins, dynamic locale/timezone, mitt/window integration | needs future package/dependency owner decision; not eligible now | NOT_SAFE_TO_MOVE |
| BLOCK-HTTP-RUNTIME | apps/web-demo/src/utils/http/**; src/api/** | apps/web-demo | alova, browser fetch/download, notification/window policy, auth refresh | runtime adapter boundary; contracts already hold shared HTTP types | APP_OWNED_RUNTIME_ADAPTER |
| FACADE-THEME-TOKENS | apps/web-demo/src/utils/theme/**; constants/theme*; constants/size* | @ccd/design-tokens plus @ccd/vue-app-platform | facade delegates pure logic; app keeps DOM/storage/preload | already migrated foundation; keep app facade unless M2 proves narrow leftover | APP_COMPATIBILITY_FACADE |
| FACADE-VUE-HOOKS | directives tap/swipe/longPress; useAutoMitt | @ccd/vue-hooks | app compatibility re-exports/wrapper | already package-owned; keep app facade for import compatibility | APP_COMPATIBILITY_FACADE |
| FACADE-VUE-UI | useDialog; useProTableUrlSync; proform/protable plugin shells | @ccd/vue-ui plus app router/i18n injection | router/i18n/storage capability injection | M11/D-020 classify as app facade/plugin shell | APP_COMPATIBILITY_FACADE |
| FACADE-CHARTS | apps/web-demo/src/adapters/charts/UseEcharts.vue | @ccd/vue-charts | app import facade over package component/types | already package-owned | APP_COMPATIBILITY_FACADE |
| GENERATED-PRIMEVUE-REGISTRY | apps/web-demo/src/types/components.d.ts; build/resolvers/primevue.ts | owning generators/build config | generated registry and PrimeVue resolver | guarded/generated-owned; only owning generator may change | GENERATED_OWNED |

## Dependency observations

- `@ccd/contracts` has no runtime dependencies; moving Zod schemas into it would require manifest approval.
- `@ccd/shared-utils` depends only on `lodash-es` and `uuid`; `dayjs`, `zod`, `lz-string`, and browser APIs are not approved there.
- `@ccd/core` remains runtime-neutral and depends only on contracts; no app utility should move there without orchestration value.
- `@ccd/vue-app-platform` already owns bootstrap, preloader, theme runtime, and layout runtime helpers.
- `@ccd/vue-hooks`, `@ccd/vue-ui`, `@ccd/vue-primevue-adapter`, and `@ccd/vue-charts` already own the main reusable Vue/UI/PrimeVue/chart surfaces.
