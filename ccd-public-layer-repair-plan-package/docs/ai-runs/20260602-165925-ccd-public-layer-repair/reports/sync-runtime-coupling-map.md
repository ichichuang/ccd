# M5-T01 Sync Runtime Coupling Map

## Status

Task status: `DONE`

This is a current M5 read-only audit after accepted M4 state. No source implementation files were changed.

## Evidence

- Current M5 scope: `m5-plan-scope.md`
- File inventory: `../command-logs/m5-026-sync-file-inventory.log`
- Coupling search: `../command-logs/m5-027-sync-coupling-rg.log`
- Core sync source: `../command-logs/m5-028-read-sync-core-source.log`
- System preferences sync source: `../command-logs/m5-029-read-sync-system-preferences-source.log`
- Sync entry/tests: `../command-logs/m5-034-read-sync-action-setup-tests.log`
- Boundary rules: `../command-logs/m5-035-read-sync-boundary-rules.log`
- Package owner evidence: `../command-logs/m5-030-read-package-owner-evidence.log`

## Coupling Summary

The sync runtime under `apps/web-demo/src/sync/**` remains app-owned and coupled to:

- `BroadcastChannel`
- `WebSocket`
- `import.meta.env.VITE_SYNC_WS_URL`
- VueUse timers (`useDebounceFn`, `useTimeoutFn`)
- `Date.now()`, `crypto.randomUUID`, and client-id generation
- app sync registry and middleware sequencing
- app system preference stores/runtime
- app safeStorage wrappers for persisted preferences
- app system stores under `@/stores/modules/system`
- app theme, size, layout, locale constants and side effects

## Classification

| Surface | Classification | Reason |
| --- | --- | --- |
| `apps/web-demo/src/sync/middleware.ts` | App-owned runtime | Owns middleware stack, `Date.now()` fallback timestamping, local/remote dispatch, and registry callback execution. |
| `apps/web-demo/src/sync/registry.ts` | App-owned runtime | Module-local sync handler registry. Moving it would define a package owner surface that is not approved in M5. |
| `apps/web-demo/src/sync/syncAction.ts` | App-owned boundary | Explicit sync entry required by `.ai/rules/core/05-state-boundaries.mdc`; depends on the app registry and middleware. |
| `apps/web-demo/src/sync/runtime.ts` | Not safe to move now | Uses `BroadcastChannel`, app WebSocket transport, `import.meta.env`, VueUse debounce, active channel/socket singletons, and local echo suppression. |
| `apps/web-demo/src/sync/socket.ts` | Not safe to move now | Uses `WebSocket`, VueUse reconnect timer, `crypto.randomUUID`, `Date.now()`, and reconnection lifecycle state. |
| `apps/web-demo/src/sync/setup.ts` | App-owned runtime setup | Wires app system preferences sync and registration. |
| `apps/web-demo/src/sync/systemPreferences/model.ts` | App-owned domain runtime | Reads/writes Pinia stores, theme/size/layout/locale constants, and store side effects. |
| `apps/web-demo/src/sync/systemPreferences/register.ts` | App-owned domain runtime | Registers handlers that patch owner stores and persist remote updates. |
| `apps/web-demo/src/sync/systemPreferences/runtime.ts` | App-owned domain runtime | Uses VueUse debounce, app sync runtime, `syncAction`, app cloud-save callback, timestamps, and local bootstrap. |
| `apps/web-demo/src/sync/systemPreferences/localPersist.ts` | App-owned persistence | Uses `@/utils/safeStorage` read/write/pack/unpack wrappers. |
| `apps/web-demo/src/sync/systemPreferences/guards.ts` | App-owned validation helper | Pure-looking sanitizer surface, but current owner is app domain sync; moving runtime guards would require an approved sync/domain owner lane. |
| `apps/web-demo/src/sync/**/*.spec.ts` | App-owned tests | Tests validate registry boundary, middleware order, system preference store side effects, and payload guards. |

## Transport-Agnostic Candidates

The following pieces are structurally transport-agnostic but not approved for extraction in M5:

- sync context/message type shapes in `middleware.ts`
- registry handler signatures in `registry.ts`
- system preference payload sanitizers in `guards.ts`

Reason: moving these would create or extend a public sync owner surface. `@ccd/contracts` is type-only, `@ccd/vue-app-platform` currently has no approved dependency path to `@ccd/contracts`, and no `@ccd/vue-sync` package or manifest change is approved.

## Conclusion

No sync runtime extraction is approved in M5. Keep sync runtime app-owned and defer any package owner lane until a maintainer explicitly approves sync owner/dependency/manifest implications.
