# D-022 Before And After

## Before

- `AppPrimeVueGlobals.vue` directly imported:
  - `primevue/toast`
  - `primevue/confirmpopup`
  - `primevue/dynamicdialog`
  - `primevue/usetoast`
  - `primevue/config`
- `scripts/ai-architecture-guard.mjs` kept `AppPrimeVueGlobals.vue` in `approvedPrimeVueAppImportFiles`.
- PrimeVue exact allowlist count: 1.

## After

- `AppPrimeVueGlobals.vue` imports global shell primitives only from `@ccd/vue-primevue-adapter`.
- `@ccd/vue-primevue-adapter` owns the raw PrimeVue component/composable imports and global message helpers.
- `approvedPrimeVueAppImportFiles` is empty.
- PrimeVue exact allowlist count: 0.

## Behavior Preservation

- Six Toast groups remain unchanged.
- Global `$toast` / `$message` APIs remain available in main-world runtime smoke.
- Locale synchronization and route dialog reset remain app-owned and unchanged.
- `PrimeDialog` and app dialog store wiring remain in the app shell.
