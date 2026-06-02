# M7 Final App-Owned Register

## Scope

This register consolidates M1 through M6. It records every remaining app-owned,
facade, generated, demo, or deferred area after the only source migration in
M3.

## Final classifications

| Area | Paths | Final classification | Reason | Guard / evidence |
| --- | --- | --- | --- | --- |
| App shell/bootstrap | `apps/**/main.ts`, `App.vue`, `plugins/**`, `index.html` | `APP_OWNED_PLUGIN_SHELL` | Concrete app creation, router/i18n/store/service install, preloader/error host. | `arch:runtime`, `arch:boundaries`, `validate:governance`. |
| Desktop/Tauri adapters | `apps/desktop/src/adapters/**`, `src-tauri/**` | `APP_OWNED_RUNTIME_ADAPTER` | Tauri APIs and desktop permissions must stay in desktop adapter boundary. | `arch:runtime`, `.dependency-cruiser.cjs`. |
| Desktop design system setup | `apps/desktop/src/theme/index.ts` | `APP_OWNED_RUNTIME_ADAPTER` plus package-backed pure logic | M3 moved pure theme/size derivation to design-token APIs; DOM root writes and desktop layout vars remain app-owned. | M3 validation, `build:desktop`, `arch:runtime`. |
| Router/routes | `apps/web-demo/src/router/**` | `APP_OWNED_ROUTE_OR_FEATURE` | Concrete route tables, guards, view loading, permission flow, store integration. | `ai:guard`, `arch:runtime`, route tests. |
| Pinia stores | `apps/web-demo/src/stores/**` | `APP_OWNED_STORE` | Concrete persisted state, store IDs, sync policy, safeStorage serializers. | `ai:guard`, store tests. |
| HTTP/API runtime | `apps/web-demo/src/utils/http/**`, `apps/web-demo/src/api/**` | `APP_OWNED_RUNTIME_ADAPTER` | Alova/fetch/download/auth refresh/window notification runtime. | `ai:guard`, `arch:runtime`, HTTP tests. |
| safeStorage crypto/compression | `apps/web-demo/src/utils/safeStorage/**` | `APP_OWNED_RUNTIME_ADAPTER` / `NOT_SAFE_TO_MOVE` | D-016 keeps crypto/HMAC/WebCrypto app-owned; D-019 keeps lz-string app-owned. | `ai:guard`, safeStorage tests, prior decisions. |
| DateUtils | `apps/web-demo/src/utils/date/**`, `useDateUtils.ts`, date plugin | `NOT_SAFE_TO_MOVE` | dayjs plugins, framework hydration, locale/timezone, mitt/window integration. | plugin/hook tests and M4 evidence. |
| Theme/size web facades | `apps/web-demo/src/utils/theme/**`, related constants/stores | `APP_COMPATIBILITY_FACADE` | Pure token logic is package-backed; app owns DOM/storage/preload facade. | theme/size tests and M1/M2 evidence. |
| Vue hook facades | directives, `useAutoMitt`, `useDialog`, `useProTableUrlSync` | `APP_COMPATIBILITY_FACADE` or `APP_OWNED_ROUTE_OR_FEATURE` | Package primitives exist; app injects concrete emitter, i18n, router, or URL policy. | M4 package/app tests. |
| UI/PrimeVue wrappers | app global shell/facades | `APP_COMPATIBILITY_FACADE` / `APP_OWNED_PLUGIN_SHELL` | Governed wrappers live in `@ccd/vue-ui` or adapter; app owns concrete global shell. | `ai:guard`, M5 validation. |
| Chart facade | `apps/web-demo/src/adapters/charts/UseEcharts.vue` | `APP_COMPATIBILITY_FACADE` | App import facade over `@ccd/vue-charts`. | M1 evidence. |
| Build utilities | `apps/web-demo/build/**`, `apps/*/vite.config.ts` | `APP_OWNED_BUILD_UTILITY` / `APP_OWNED_BUILD_CONFIG` | No governed build package owner; app-specific Vite/env/generated paths. | M6 evidence, `drift-check`, `validate:governance`. |
| Generated registries | `auto-imports.d.ts`, `components.d.ts`, icon list, generated docs | `GENERATED_OWNED` | Owning generator commands produce these files; manual edits forbidden. | `lint-staged-safe`, M6 generated diff checks. |
| Examples/showcases | `apps/web-demo/src/views/example/**`, demo assets | `DEMO_OR_SHOWCASE` | Demo route content, not shared production API. | `ai:guard` and route classification. |

## M1 candidate resolution

| Candidate | Final status |
| --- | --- |
| `M3-DESKTOP-THEME` | Migrated in M3. |
| `M3-ROUTE-ACCESS` | Deferred; remains app-owned until route/menu type ownership is approved. |
| `M3-SYSTEM-PREF-GUARDS` | Deferred; remains app-owned until preference payload contract owner exists. |
| `M3-DTO-CONTRACTS` | Deferred; schema movement blocked by D-A002 manifest boundary. |
| `M3-PURE-UTILITY-REVIEW` | Deferred; router utils remain app-owned due Vue Router/logger/import.meta coupling. |
| `M6-BUILD-GENERATOR` | Classified app build-owned/generated-owned in M6. |
| `BLOCK-SAFESTORAGE-CRYPTO` | Terminal app-owned by D-016. |
| `BLOCK-SAFESTORAGE-COMPRESSION` | Terminal app-owned by D-019. |
| `BLOCK-DATEUTILS` | Not safe to move. |
| `BLOCK-HTTP-RUNTIME` | App runtime adapter. |
| `FACADE-THEME-TOKENS` | App compatibility facade over packages. |
| `FACADE-VUE-HOOKS` | App compatibility facade over `@ccd/vue-hooks`. |
| `FACADE-VUE-UI` | App compatibility facade over `@ccd/vue-ui`. |
| `FACADE-CHARTS` | App compatibility facade over `@ccd/vue-charts`. |
| `GENERATED-PRIMEVUE-REGISTRY` | Generated-owned and build-owned boundary. |

## Result

No unclassified M1 candidate remains. Deferred candidates are explicitly
blocked by owner, dependency, or runtime boundary decisions.
