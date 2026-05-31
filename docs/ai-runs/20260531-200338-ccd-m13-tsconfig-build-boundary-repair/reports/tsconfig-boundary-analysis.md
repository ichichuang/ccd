# Tsconfig boundary analysis

| file | current_include | current_references | package_source_include_count | direct_package_source_include_paths | expected_consumption_model | package_exports_available | package_types_available | project_reference_available | can_remove_source_include | required_change | risk | validation_commands | related_issue_ids |
|---|---|---|---:|---|---|---|---|---|---|---|---|---|---|
| `apps/web-demo/tsconfig.json` before | `src/**/*`, `vite.config.ts`, `build/**/*.ts`, `../../packages/vue-ui/src/**/*.ts`, `../../packages/vue-ui/src/**/*.tsx`, `../../packages/vue-ui/src/**/*.vue`, `../../packages/vue-charts/src/**/*.ts`, `../../packages/vue-charts/src/**/*.vue` | none | 5 | `../../packages/vue-ui/src/**/*.ts`, `../../packages/vue-ui/src/**/*.tsx`, `../../packages/vue-ui/src/**/*.vue`, `../../packages/vue-charts/src/**/*.ts`, `../../packages/vue-charts/src/**/*.vue` | package exports after `pnpm ci:prepare-internal` | yes: `@ccd/vue-ui`, `@ccd/vue-charts` | yes: `dist/index.d.ts` exists for both | no | pending before validation | remove source includes | declaration gaps could surface | `pnpm ci:prepare-internal`, web-demo type-check/build | F-01, F-03 |
| `apps/web-demo/tsconfig.json` after | `src/**/*`, `vite.config.ts`, `build/**/*.ts` | none | 0 | none | package exports after `pnpm ci:prepare-internal` | yes: `@ccd/vue-ui`, `@ccd/vue-charts` | yes: `dist/index.d.ts` exists for both | no | yes | none remaining | low; app type-check/build passed | `pnpm --filter @ccd/web-demo type-check`, `pnpm build:web-demo`, `pnpm arch:boundaries` | F-01, F-03 |
| `apps/desktop/tsconfig.json` before | `src/**/*.ts`, `src/**/*.vue`, `vite.config.ts`, `../../packages/vue-ui/src/**/*.ts`, `../../packages/vue-ui/src/**/*.tsx`, `../../packages/vue-ui/src/**/*.vue` | `../../packages/contracts`, `../../packages/core`, `../../packages/design-tokens`, `../../packages/shared-utils`, `../../packages/unocss-preset`, `../../packages/vue-app-platform`, `../../packages/vue-hooks`, `../../packages/vue-primevue-adapter` | 3 | `../../packages/vue-ui/src/**/*.ts`, `../../packages/vue-ui/src/**/*.tsx`, `../../packages/vue-ui/src/**/*.vue` | package exports after `pnpm ci:prepare-internal`; existing references remain | yes: `@ccd/vue-ui` | yes: `dist/index.d.ts` exists | yes | pending before validation | remove source includes | declaration gaps could surface | `pnpm ci:prepare-internal`, desktop type-check/build | F-02, F-03 |
| `apps/desktop/tsconfig.json` after | `src/**/*.ts`, `src/**/*.vue`, `vite.config.ts` | unchanged | 0 | none | package exports after `pnpm ci:prepare-internal`; existing references remain | yes: `@ccd/vue-ui` | yes: `dist/index.d.ts` exists | yes | yes | none remaining | low; app type-check/build passed | `pnpm --filter @ccd/desktop type-check`, `pnpm build:desktop`, `pnpm arch:boundaries` | F-02, F-03 |

Explicit cases checked:

- `apps/web-demo` no longer includes `../../packages/vue-ui/src/**/*.ts`
- `apps/web-demo` no longer includes `../../packages/vue-ui/src/**/*.tsx`
- `apps/web-demo` no longer includes `../../packages/vue-ui/src/**/*.vue`
- `apps/web-demo` no longer includes `../../packages/vue-charts/src/**/*.ts`
- `apps/web-demo` no longer includes `../../packages/vue-charts/src/**/*.vue`
- `apps/desktop` no longer includes `../../packages/vue-ui/src/**/*.ts`
- `apps/desktop` no longer includes `../../packages/vue-ui/src/**/*.tsx`
- `apps/desktop` no longer includes `../../packages/vue-ui/src/**/*.vue`

Source logs:

- Before: `command-logs/008_tsconfig_boundary_before.log`
- After: `command-logs/017_tsconfig_boundary_after.log`

