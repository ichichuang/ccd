# P14 E2 Menu Type and Dashboard Button Reduction Summary

## Phase status

- **Final status**: `P14_M12_SLICE_DONE` (E2)
- **Allowlist reduction**: 3 rows removed (11 -> 8)

## Changes

- `menuTypes.ts`: `PrimeVueMenuItem`, `PrimeVueTieredMenuInstance`
- `helper.ts`, `useAdminBreadcrumbs.ts`: adapter type facades
- `dashboard/index.vue`: `CcdButton` from `@ccd/vue-ui`
- Guard allowlist: removed 3 rows

## Remaining exact allowlist (8)

Bootstrap/plugin/build/globals/generated/example files per D-017 Option D.
