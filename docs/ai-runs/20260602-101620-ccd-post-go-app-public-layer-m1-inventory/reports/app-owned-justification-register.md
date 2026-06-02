# M1 App-Owned Justification Register

| Area | Paths | Classification | Justification |
| --- | --- | --- | --- |
| App shell/bootstrap | main.ts, App.vue, index.html, plugins/** | APP_OWNED_PLUGIN_SHELL | Creates concrete app, installs router/i18n/stores/PrimeVue services, owns preloader/error shell. |
| Desktop/Tauri adapters | apps/desktop/src/adapters/**, src-tauri/** | APP_OWNED_RUNTIME_ADAPTER | @tauri-apps invoke and desktop permissions must stay in desktop adapter boundary. |
| Router/routes | router/** | APP_OWNED_ROUTE_OR_FEATURE | Route tables, view loaders, route meta, guards, and window navigation are app-owned; pure subsets need M2 review. |
| Pinia stores | stores/** | APP_OWNED_STORE | Concrete persisted state, store IDs, syncAction, localStorage, and app singleton coupling remain app-owned. |
| HTTP/API runtime | utils/http/**, api/**, adapters/http.adapter.ts | APP_OWNED_RUNTIME_ADAPTER | Alova, fetch/download, auth refresh, notification policy, and browser network runtime stay app-owned. |
| SafeStorage | utils/safeStorage/** | APP_OWNED_RUNTIME_ADAPTER / NOT_SAFE_TO_MOVE | D-016/D-019 keep crypto and compression app-owned; JSON codec is already in @ccd/shared-utils. |
| Theme/size facade | utils/theme/**, constants/theme*, constants/size* | APP_COMPATIBILITY_FACADE | Pure token logic already package-owned; DOM/localStorage/preload compatibility stays app-owned. |
| Hooks facades | hooks/modules/useAutoMitt.ts, useDialog.tsx, useProTableUrlSync.ts | APP_COMPATIBILITY_FACADE | Facades preserve app i18n/router behavior while packages own reusable core. |
| Layout/admin shell | layouts/** | APP_OWNED_ROUTE_OR_FEATURE | Admin chrome, global shell, context menu, and window.$toast/message host are app UI shell. |
| Locales | locales/** | APP_OWNED_ROUTE_OR_FEATURE | App message catalog and current i18n runtime. |
| Generated registries | types/components.d.ts, auto-imports.d.ts, iconLists.generated.ts | GENERATED_OWNED | Only owning generators may update; manual edits forbidden. |
| Examples/showcases | views/example/**, public demo assets | DEMO_OR_SHOWCASE | Demonstration routes and sample configs are not shared production package API. |
| Build utilities | build/**, vite.config.ts | NEEDS_OWNER_DECISION | Potential shared build concerns exist, but no governed build package owner is approved. |

## Guard posture

- `pnpm ai:guard -- --format=json` passed in M0 and current PrimeVue direct surfaces are either package-owned, generated, app build config, or test mocks.
- `pnpm arch:runtime` passed inside M0 `pnpm validate:governance`; runtime APIs remain governed by existing exact exceptions and package policies.
- M1 did not weaken guards and did not add new app-owned exceptions.
