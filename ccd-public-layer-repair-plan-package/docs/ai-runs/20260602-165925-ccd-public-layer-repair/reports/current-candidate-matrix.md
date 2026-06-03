# M0 Current Candidate Matrix

## Classification Labels

Allowed labels from `SPEC.md`:

- `MIGRATE_NOW`
- `TYPE_ONLY_CONTRACT`
- `APP_OWNED_RUNTIME_ADAPTER`
- `APP_COMPATIBILITY_FACADE`
- `GENERATED_OWNED`
- `DEFERRED_OWNER_DECISION`
- `NOT_SAFE_TO_MOVE`
- `NOT_APPLICABLE`

## Candidate Matrix

| Candidate surface | Current evidence | Classification | M0 conclusion |
| --- | --- | --- | --- |
| Route/menu/access ambient globals | `apps/web-demo/src/types/modules/router.d.ts` defines `RouteConfig`, `BackendRouteConfig`, `MenuItem`, `TabItem`, `RouteUtils`, `DynamicRouteManager`; consumers found in route/utils/layout surfaces. | `TYPE_ONLY_CONTRACT` | Eligible for M1 type-only contract extraction if Vue Router runtime and app-specific globals stay app-owned. |
| Route access pure helpers | `apps/web-demo/src/router/utils/accessControl.ts` exports pure `checkRouteRoles`, `checkRouteAuths`, `checkRouteAccess`, `isWhiteListed`, `parseSafeRedirect`, and `filterMenuByAccess`; no store/router singleton import observed. | `MIGRATE_NOW` after M1 | Candidate for M2 migration to an approved runtime owner after contracts/tests are explicit. |
| Menu tree helper functions | `apps/web-demo/src/router/utils/menu.ts` includes route/menu tree shaping tied to `RouteConfig`, `LayoutMode`, route meta, and breadcrumb structures. | `APP_COMPATIBILITY_FACADE` / partial `TYPE_ONLY_CONTRACT` | Full migration is not M0-approved; evaluate narrow pieces in M2 only if contracts are generic enough. |
| API backend response envelope | `apps/web-demo/src/types/api.ts` defines `ApiResponse<T>` as `{ code, message, data }`. | `TYPE_ONLY_CONTRACT` | Candidate for M3 explicit backend envelope naming in `@ccd/contracts`. |
| HTTP client response envelope | `apps/web-demo/src/utils/http/types.ts` defines a different `ApiResponse<T>` as `{ success, data?, message?, code?, total?, page?, pageSize? }` and imports Zod type for request config. | `TYPE_ONLY_CONTRACT` plus `APP_OWNED_RUNTIME_ADAPTER` | Candidate for M3 rename/normalization; HTTP runtime and Zod schema behavior remain app-owned. |
| Existing HTTP contracts | `packages/contracts/src/http/response.ts` exports `HttpResponseEnvelope<TData, TMetadata>`. | `TYPE_ONLY_CONTRACT` | Existing structure should be reused where naming fits; avoid duplicate incompatible names. |
| System preference types | `apps/web-demo/src/types/systems/preferences.ts` combines Zod schema with `SystemPreferences`, `SystemPreferenceSyncType`, `SystemPreferencePayload`, and `SystemPreferenceEnvelope`. | `TYPE_ONLY_CONTRACT` | Candidate for M4 type-only split; Zod schema remains app-owned without approval. |
| System preference guards/runtime | `apps/web-demo/src/sync/systemPreferences/**` imports app stores, locale, design tokens, and sanitizer logic. | `APP_OWNED_RUNTIME_ADAPTER` | Runtime/sanitizer movement is not M0-approved; type imports can be adjusted in M4. |
| Sync runtime transport | `apps/web-demo/src/sync/runtime.ts` and `socket.ts` use `BroadcastChannel`, `WebSocket`, `import.meta.env`, `@vueuse/core`, timers, and app middleware. | `DEFERRED_OWNER_DECISION` / `NOT_SAFE_TO_MOVE` | M5 should record owner decision; no extraction without approval. |
| Build/Vite config utilities | `apps/web-demo/build/**` and `apps/web-demo/vite.config.ts` use Vite/Rollup/esbuild/PostCSS/plugin APIs, filesystem, generated icon list ownership, and app env. | `DEFERRED_OWNER_DECISION` / `APP_OWNED_RUNTIME_ADAPTER` | M6 should record owner decision; no new build package or manifest changes without approval. |
| Theme engine facade | `apps/web-demo/src/utils/theme/engine.ts` delegates pure derivation to `@ccd/design-tokens` and browser var writing to `@ccd/vue-app-platform` via injected DOM/storage. | `APP_COMPATIBILITY_FACADE` | Mostly correct; M7 should review only. |
| Size engine facade | `apps/web-demo/src/utils/theme/sizeEngine.ts` performs app-owned first-paint, safeStorage unpack, device/breakpoint sync, DOM writes, and size CSS variable application. | `APP_COMPATIBILITY_FACADE` / possible `MIGRATE_NOW` narrow helper | Optional M7 extraction only for low-risk capability-injected DOM writer; preserve first-paint behavior. |
| Desktop theme setup | `apps/desktop/src/theme/index.ts` writes desktop root vars directly from design tokens. | `APP_OWNED_RUNTIME_ADAPTER` | Desktop-specific setup remains app-owned; validate if shared theme/size helper changes occur. |
| SafeStorage crypto/compression | `apps/web-demo/src/utils/safeStorage/**` appears as approved storage infra; scan includes `localStorage` exceptions. | `NOT_SAFE_TO_MOVE` | Out of scope by plan. |
| DateUtils/date formatting | Existing guard allowlist includes date runtime exceptions; plan blocks DateUtils migration. | `NOT_SAFE_TO_MOVE` | Out of scope without owner decision. |
| HTTP runtime adapter | `apps/web-demo/src/utils/http/**` owns Alova methods, interceptors, policies, upload/download runtime, and Zod response schema config. | `APP_OWNED_RUNTIME_ADAPTER` | Out of scope for runtime movement; M3 only normalizes type names/contracts. |
| Generated registries | `apps/web-demo/src/types/components.d.ts`, `auto-imports.d.ts`, and icon list generated outputs are build/tool-owned. | `GENERATED_OWNED` | Do not manually edit; use owning generator and drift checks only. |
| Pinia stores | `apps/web-demo/src/stores/**` are app state/runtime owned. | `APP_OWNED_RUNTIME_ADAPTER` | Do not move. |
| Route views and plugin shells | `apps/web-demo/src/views/**`, `layouts/**`, plugin/global setup surfaces are app UI/runtime glue. | `APP_OWNED_RUNTIME_ADAPTER` | Do not move except future explicit approvals. |

## Evidence

- `command-logs/apps-public-scan.log`
- `command-logs/route-type-rg.log`
- `command-logs/api-dto-rg.log`
- `command-logs/system-preferences-rg.log`
- `command-logs/sync-runtime-coupling-rg.log`
- `command-logs/build-config-coupling-rg.log`
- `command-logs/theme-size-rg.log`
- `command-logs/package-public-exports-scan.log`
