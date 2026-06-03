# M8 App-Owned Justification Register

## Scope

Milestone: `M8`

Task: `M8-T01`

Objective: classify remaining public-layer candidates that should remain app-owned in this plan.

## Evidence

- `command-logs/m8-app-owned-classification-scan.log`
- `reports/current-candidate-matrix.md`
- `reports/sync-owner-decision.md`
- `reports/build-owner-decision.md`
- `reports/theme-size-boundary-review.md`

## Register

| Surface | Paths | Classification | Reason | Future trigger |
| --- | --- | --- | --- | --- |
| Pinia stores | `apps/web-demo/src/stores/**` | APP_OWNED_RUNTIME_STATE | Store modules depend on Pinia lifecycle, persistence, app runtime state, UI policy, auth/session semantics, and app integration behavior. | Reopen only with a state adapter package owner and tests proving persisted compatibility. |
| Route views | `apps/web-demo/src/views/**`, `apps/desktop/src/router/routes.ts` | APP_OWNED_VIEW_SURFACE | Views are concrete app screens, examples, demos, and route components, not reusable contracts. | Reopen only for explicit shared UI component extraction, not route-table movement. |
| Route tables and router runtime | `apps/web-demo/src/router/**` | APP_OWNED_ROUTER_RUNTIME | Vue Router instances, guards, dynamic loading, route modules, and app view references are app runtime behavior. | Reopen only for pure helper extraction after route contracts exist and source lane is approved. |
| Plugin shells | `apps/web-demo/src/plugins/**` | APP_OWNED_BOOTSTRAP_ADAPTER | Plugins wire PrimeVue, router, stores, locales, scrollbars, error handlers, and app-specific install order. | Reopen only for package-owned adapter utilities with no app singleton leakage. |
| SafeStorage | `apps/web-demo/src/utils/safeStorage/**` | APP_OWNED_SECURITY_STORAGE | SafeStorage includes browser storage, compression/encryption serialization, Pinia persistence serializer, and app migration behavior. | Reopen only with explicit crypto/storage owner and security review. |
| DateUtils | `apps/web-demo/src/utils/date/**`, `apps/web-demo/src/plugins/modules/date.ts` | APP_OWNED_DATE_RUNTIME | Date utilities are connected to app plugin setup, timezone defaults, locale/runtime behavior, and demo surfaces. | Reopen only with a date utility package owner and compatibility tests. |
| HTTP runtime | `apps/web-demo/src/utils/http/**` | APP_OWNED_HTTP_ADAPTER | HTTP layer contains request instance, interceptors, upload manager, auth refresh policy, notification policy, schema validation policy, and app error mapping. | Reopen only with an approved HTTP adapter package and auth/error compatibility tests. |
| Sync runtime | `apps/web-demo/src/sync/**` | APP_OWNED_SYNC_RUNTIME | Sync uses browser APIs, environment access, VueUse timers, registries, and app-specific runtime integration. | Reopen only with approved sync package owner or capability-injected runtime lane. |
| Build config | `apps/**/vite.config.*`, `scripts/**`, build/governance generated paths | APP_OWNED_BUILD_GOVERNANCE | Build config touches Vite/Rollup/esbuild/PostCSS plugins, generated reports, package scripts, and manifest policy. | Reopen only with approved build package owner and manifest/lockfile approval. |
| Generated registries and reports | `docs/generated/**`, `.ai/generated/**`, generated route/icon/registry files | GENERATED_OWNED_BY_COMMAND | Generated files must be produced by owning generators, not manually edited. | Reopen only by running owning generator and recording generated diff evidence. |
| Theme/size app facades | `apps/web-demo/src/utils/theme/**`, `apps/desktop/src/theme/index.ts` | APP_OWNED_FACADE_WITH_PACKAGE_DERIVATION | Pure derivation is package-owned; browser DOM/storage/preload/desktop setup remains app-owned. | Reopen optional size writer only with visual smoke and approved package owner. |

## Conclusion

The remaining candidates are intentionally app-owned, generated-owned, or deferred. Moving them in this plan would require approval for source implementation, package owner decisions, or visual/security validation beyond the current evidence lane.
