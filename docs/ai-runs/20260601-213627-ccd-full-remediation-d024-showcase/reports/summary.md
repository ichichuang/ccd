# D-024 Summary

## Result

`D-024` is implemented for the PrimeVue showcase direct-import exception.

The `primevue-collection/**` showcase no longer imports raw `primevue/*` or `@primevue/*`
modules. The guard path exception was removed, and `pnpm ai:guard -- --format=json`
passes with no findings.

## Scope

- Added `@ccd/vue-ui` `CcdInputText` using the existing `CcdPrimeControls` wrapper pattern.
- Added `@ccd/vue-primevue-adapter` `usePrimeVueConfirmService()` facade.
- Migrated showcase Button, Tag, InputText, Select, and useConfirm imports to governed
  `@ccd/vue-ui` or adapter surfaces.
- Regenerated command-owned `components.d.ts` and API surface reports.

## Decision

The showcase exception is migrated, not retained and not retired. `C-06` no longer has
exact app allowlist rows or a path-scoped showcase exception.
