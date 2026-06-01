# D-020 Before And After

## Before

- `apps/desktop/src/plugins/index.ts` imported `primevue/config` directly.
- `apps/web-demo/src/plugins/modules/primevue.ts` imported `primevue/config` directly.
- App bootstrap files combined app-level bootstrap orchestration with PrimeVue runtime installation details.
- PrimeVue exact allowlist count: 5.

## After

- `packages/vue-primevue-adapter/src/index.ts` owns `installPrimeVueRuntime(app, options)`.
- Desktop and web app bootstraps call `installPrimeVueRuntime()` from `@ccd/vue-primevue-adapter`.
- Web app still owns locale source selection and dialog runtime config provide.
- PrimeVue exact allowlist count: 3.
- Remaining exact rows:
  - `apps/web-demo/build/plugins.ts`
  - `apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue`
  - `apps/web-demo/src/types/components.d.ts`

## Behavior Preservation

- PrimeVue config is installed before global services.
- Toast, Confirmation, Dialog services and tooltip directive remain installed.
- Size source and locale options are passed through unchanged.
- Desktop router setup order remains after PrimeVue runtime installation.
