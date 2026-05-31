# P14 E4 Generated Typing and Resolver Boundary Review

## Scope

Review-only slice. No hand-edits to `apps/web-demo/src/types/components.d.ts`.

## Findings

| surface | owner | allowlist_required | migration_path | recommendation |
|---|---|---|---|---|
| `apps/web-demo/src/types/components.d.ts` | generated auto-import registry | yes | generator-owned only | keep; regenerate via build, never hand-edit |
| `apps/web-demo/build/plugins.ts` | build resolver (`@primevue/auto-import-resolver`) | yes | build tooling | keep on allowlist; not runtime migration target |
| `apps/web-demo/src/plugins/modules/primevue.ts` | app bootstrap install | yes | adapter config/services | keep; legitimate install point |
| `apps/desktop/src/plugins/index.ts` | desktop bootstrap install | yes | adapter config/services | keep; legitimate install point |
| `apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue` | global shell (Toast/ConfirmPopup/DynamicDialog) | yes | future adapter shell wrappers | defer; E1 narrowed icons only |
| showcase `primevue-collection/**` | demo exception (D-017 Option D) | path-scoped | long-lived debt | keep per Option D |
| example hooks (3 files) | demo surfaces | yes | low-priority demo cleanup | defer |

## Residual allowlist state after P14 E1+E2

- Exact allowlist rows: **8** (down from 13 pre-P14)
- Showcase exception: unchanged (path-scoped)
- C-06 status: **OPEN** with owner-accepted residual (bootstrap + generated + globals + showcase + examples)

## E3 decision

Showcase cleanup **not approved** in this lane. Keep as long-lived demo exception per D-017 Option D.
