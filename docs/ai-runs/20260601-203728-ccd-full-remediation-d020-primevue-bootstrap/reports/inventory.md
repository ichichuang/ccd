# D-020 Inventory

## Files Inspected

- `apps/desktop/src/plugins/index.ts`
- `apps/web-demo/src/plugins/modules/primevue.ts`
- `apps/web-demo/src/plugins/modules/primevue.spec.ts`
- `packages/vue-primevue-adapter/src/index.ts`
- `packages/vue-primevue-adapter/src/services.spec.ts`
- `scripts/ai-architecture-guard.mjs`
- `.ai/rules/architecture/05-runtime-bootstrap.mdc`
- `.ai/rules/components/00-primevue-ecosystem.mdc`
- `.ai/rules/components/01-primevue-pt-styling.mdc`
- `.ai/rules/integrations/08-cross-platform-tauri.mdc`
- `.ai/rules/integrations/10-desktop-preflight.mdc`

## Source Inventory

- Desktop bootstrap directly installed `primevue/config` with `createPrimeVueAdapterConfig()` and `installPrimeVueServices()`.
- Web bootstrap directly installed `primevue/config` with `createPrimeVueAdapterConfig()` and `installPrimeVueServices()`, then provided dialog runtime config.
- `@ccd/vue-primevue-adapter` already owned config creation, PT/theme configuration, service installation, tooltip directive, and global service helpers.
- Guard allowlist had five exact app rows before D-020:
  - `apps/desktop/src/plugins/index.ts`
  - `apps/web-demo/build/plugins.ts`
  - `apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue`
  - `apps/web-demo/src/plugins/modules/primevue.ts`
  - `apps/web-demo/src/types/components.d.ts`

## Stop Checks

- `.cursor`: absent.
- Root duplicate `CCD_ARCHITECTURE_ISSUE_REPAIR_LOG.md`: absent.
- No package manifest or lockfile change required.
