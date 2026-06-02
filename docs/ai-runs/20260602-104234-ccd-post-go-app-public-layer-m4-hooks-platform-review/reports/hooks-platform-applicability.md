# M4 Hooks / Platform Applicability Review

## Decision

Status: `NOT_APPLICABLE`.

M4 found no additional app hook or platform helper that is eligible for source
migration under the current rules.

## Evidence reviewed

- M1 candidate and app-owned reports.
- M2 batch plan and candidate review table.
- Current app hook/directive file list.
- Current app hook/platform coupling search.
- Current `@ccd/vue-hooks` and `@ccd/vue-app-platform` package surfaces.

## App hook classifications

| Surface | Current owner | M4 classification | Reason |
| --- | --- | --- | --- |
| `apps/web-demo/src/directives/tap.ts` | app facade over `@ccd/vue-hooks` | `APP_COMPATIBILITY_FACADE` | Re-exports package directive for app import compatibility. |
| `apps/web-demo/src/directives/swipe.ts` | app facade over `@ccd/vue-hooks` | `APP_COMPATIBILITY_FACADE` | Re-exports package directive for app import compatibility. |
| `apps/web-demo/src/directives/longPress.ts` | app facade over `@ccd/vue-hooks` | `APP_COMPATIBILITY_FACADE` | Re-exports package directive for app import compatibility. |
| `apps/web-demo/src/hooks/modules/useAutoMitt.ts` | app facade over `@ccd/vue-hooks` | `APP_COMPATIBILITY_FACADE` | Package owns lifecycle cleanup hook; app injects concrete emitter and event map. |
| `apps/web-demo/src/hooks/modules/useDialog.tsx` | app facade over `@ccd/vue-ui` | `APP_COMPATIBILITY_FACADE` | Package owns dialog core; app adds i18n strings and message composition. |
| `apps/web-demo/src/hooks/modules/useProTableUrlSync.ts` | app | `APP_OWNED_ROUTE_OR_FEATURE` | Uses concrete `useRoute()`/`useRouter()` and app table URL policy. |
| `apps/web-demo/src/hooks/modules/useDateUtils.ts` | app | `NOT_SAFE_TO_MOVE` | Depends on app `DateUtils`, locale store, mitt events, and browser timezone. |
| `apps/web-demo/src/hooks/modules/useLocale.ts` | app | `APP_OWNED_ROUTE_OR_FEATURE` | Depends on app i18n and locale store. |
| `apps/web-demo/src/hooks/modules/useThemeSwitch.ts` | app | `APP_OWNED_ROUTE_OR_FEATURE` | Depends on theme store, DOM, localStorage, and view-transition behavior. |
| `apps/web-demo/src/hooks/modules/useSystemPreferencesSync.ts` | app | `APP_OWNED_RUNTIME_ADAPTER` | Depends on user store, API sync, and demo runtime policy. |
| `apps/web-demo/src/hooks/modules/usePermissionRoutes.ts` | app | `APP_OWNED_ROUTE_OR_FEATURE` | Depends on concrete permission store and route ownership. |
| `apps/web-demo/src/hooks/modules/useAuth.ts` | app | `APP_OWNED_RUNTIME_ADAPTER` | Depends on concrete auth/session stores and app logout/reset policy. |

## Package owner posture

- `@ccd/vue-hooks` already owns the reusable lifecycle/directive primitives:
  `createAutoMittHook`, interaction hooks, and tap/swipe/longPress directives.
- `@ccd/vue-app-platform` already owns platform bootstrap, layout runtime,
  preloader, preload error, and theme runtime helpers.
- No M4-reviewed app surface can move to either package without also moving app
  router, store, i18n, DOM, API, or runtime policy ownership.

## Outcome

M4 does not change production source. Existing app-owned/facade classifications
remain justified.
