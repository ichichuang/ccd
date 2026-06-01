# P19 Slice Plan

## Selected row

R6: `apps/web-demo/src/views/example/hooks/layout-breadcrumbs.vue`
Direct import `import TieredMenu from 'primevue/tieredmenu'` → governed `import { CcdTieredMenu as TieredMenu } from '@ccd/vue-ui'`.

## Expected allowlist count

- Before: 7
- After: 6

## Source files

- `apps/web-demo/src/views/example/hooks/layout-breadcrumbs.vue`
  - Replace the direct PrimeVue default import with the `@ccd/vue-ui` `CcdTieredMenu` wrapper, aliased to `TieredMenu` so the template `<TieredMenu>` usage and slots stay byte-identical.

## Package files

- None. `@ccd/vue-ui` already exports `CcdTieredMenu` (`packages/vue-ui/src/CcdPrimeControls/index.ts`), which wraps `primevue/tieredmenu` and forwards `methods: ['toggle','show','hide']` and `properties: ['container','target']`. No new wrapper/type is required.

## Guard files

- `scripts/ai-architecture-guard.mjs`
  - Remove the exact allowlist row `apps/web-demo/src/views/example/hooks/layout-breadcrumbs.vue` from `approvedPrimeVueAppImportFiles` only AFTER the source import is migrated and validated.

## Tests

- `pnpm --filter @ccd/vue-ui test` (CcdTieredMenu owner package).
- `pnpm --filter @ccd/web-demo type-check` and `pnpm --filter @ccd/web-demo test` (consumer app).
- `pnpm type-check`, `pnpm test:run`, `pnpm build:web-demo`, `pnpm build:desktop`.

## Risk

- Low. The ref API used by `useAdminBreadcrumbs` (`.hide()`, `.toggle(e)`) is fully forwarded by `CcdTieredMenu`. The production `AdminBreadcrumbBar.vue` already consumes `CcdTieredMenu as TieredMenu` against the identical hook, so behavior parity is established.
- Auto-import surface unaffected: this is an explicit local import, not an auto-imported global; `apps/web-demo/src/types/auto-imports.d.ts` should produce an empty diff.

## Rollback plan

If any validation fails:
1. Revert `layout-breadcrumbs.vue` import back to `import TieredMenu from 'primevue/tieredmenu'`.
2. Restore the removed allowlist row in `scripts/ai-architecture-guard.mjs`.
3. Re-run `pnpm ai:guard -- --format=json` and `pnpm validate:governance` to confirm return to baseline (7 rows, PASS).
4. Record `P19_VALIDATION_BLOCKED` with the failing command output.
