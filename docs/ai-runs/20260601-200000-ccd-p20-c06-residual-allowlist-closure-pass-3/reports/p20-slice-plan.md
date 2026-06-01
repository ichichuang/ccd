# P20 Slice Plan

## Selected row

R6: `apps/web-demo/src/views/example/hooks/use-app-element-size.vue`
Direct import `import Tag from 'primevue/tag'` → governed `import { CcdTag } from '@ccd/vue-ui'`.

## Expected allowlist count

- Before: 6
- After: 5

## Source files

- `apps/web-demo/src/views/example/hooks/use-app-element-size.vue`
  - Replace direct PrimeVue Tag import with `@ccd/vue-ui` `CcdTag` in script setup (TSX render function).
  - Replace template `<Tag>` with `<CcdTag>` for consistent governed boundary.

## Package files

- `packages/vue-ui/src/CcdPrimeControls/index.ts`
  - Add `CcdTag` via existing `createCcdPrimeControl('CcdTag', PrimeTag)` pattern (no ref forwarding needed).
- `packages/vue-ui/src/index.ts`
  - Export `CcdTag`.
- `packages/vue-ui/src/CcdPrimeControls/CcdTag.spec.ts`
  - Minimal render test verifying value/severity props forward to underlying PrimeVue Tag.

## Guard files

- `scripts/ai-architecture-guard.mjs`
  - Remove `apps/web-demo/src/views/example/hooks/use-app-element-size.vue` from `approvedPrimeVueAppImportFiles` after source migration and validation.

## Tests

- `pnpm --filter @ccd/vue-ui test` (new CcdTag spec).
- `pnpm --filter @ccd/web-demo type-check` and `pnpm --filter @ccd/web-demo test`.
- Full validation matrix per Phase 6.

## Risk

- Low. Tag is presentational only (`value`, `severity` props); no ref API or slots beyond default content. Wrapper uses established `createCcdPrimeControl` passthrough pattern identical to `CcdButton`.

## Rollback plan

If any validation fails:
1. Revert `use-app-element-size.vue` import and template tags back to PrimeVue `Tag`.
2. Remove `CcdTag` from `CcdPrimeControls` and `index.ts`; delete `CcdTag.spec.ts`.
3. Restore the removed allowlist row in `scripts/ai-architecture-guard.mjs`.
4. Re-run `pnpm ai:guard -- --format=json` and `pnpm validate:governance` to confirm return to baseline (6 rows, PASS).
5. Record `P20_VALIDATION_BLOCKED` with failing command output.
