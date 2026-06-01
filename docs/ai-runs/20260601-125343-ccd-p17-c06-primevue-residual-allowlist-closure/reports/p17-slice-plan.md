# P17 Slice Plan

## selected_rows

- R8: `apps/web-demo/src/views/example/system-configuration/layout.vue` (type-only `import type Popover from 'primevue/popover'`).

## affected_files

- `packages/vue-primevue-adapter/src/overlayTypes.ts` (new) — adapter-owned `PrimeVuePopoverInstance` type facade.
- `packages/vue-primevue-adapter/src/index.ts` — re-export the new type from the adapter public surface.
- `apps/web-demo/src/views/example/system-configuration/layout.vue` — replace direct PrimeVue type import with adapter type facade.
- `scripts/ai-architecture-guard.mjs` — remove R8 from `approvedPrimeVueAppImportFiles` after source import removal.

## target_owner

- `@ccd/vue-primevue-adapter` (mirrors existing `PrimeVueTieredMenuInstance` facade from P14 E2 in `menuTypes.ts`).

## expected_allowlist_reduction_count

- 1 (8 -> 7 exact rows). Showcase exceptions unchanged.

## expected_behavior_change

- None. The change is type-only. `Popover` component is globally auto-registered, so the template `<Popover ref="fabPopoverRef">` and `fabPopoverRef.value?.toggle/hide()` calls are unchanged. Only the TS type used to type the `ref` moves from a direct PrimeVue type import to an equivalent `InstanceType<typeof Popover>` alias owned by the adapter.

## tests_required

- `packages/vue-primevue-adapter` build (type emission) must pass.
- `@ccd/web-demo` type-check must resolve `PrimeVuePopoverInstance` and keep `fabPopoverRef` typed identically.
- No new behavioral test required (no runtime change); existing adapter spec coverage retained.

## risk

- Low. Type-only facade. Worst case is a TypeScript resolution error caught by `pnpm --filter @ccd/web-demo type-check` and `pnpm type-check`.

## rollback_plan

- Revert the four affected files (restore `import type Popover from 'primevue/popover'`, re-add R8 to `approvedPrimeVueAppImportFiles`, delete `overlayTypes.ts`, revert index export). No package manifest, lockfile, or generated artifact changes are involved, so rollback is a clean file-level revert.
