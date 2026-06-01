# D-022 Inventory

## Source Inputs

- `apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue`
- `packages/vue-primevue-adapter/src/services.ts`
- `packages/vue-primevue-adapter/src/index.ts`
- `packages/vue-primevue-adapter/src/services.spec.ts`
- `scripts/ai-architecture-guard.mjs`
- `docs/generated/api-surface-report.{md,json}`

## Behavior Inventory

- Six PrimeVue Toast hosts remain mounted with groups `tl`, `tc`, `tr`, `bl`, `bc`, and `br`.
- `ToastMessageContent` remains the message slot renderer.
- Toast severity icon mapping remains sourced from `PRIMEVUE_TOAST_SEVERITY_ICONS`.
- Toast fallback icon remains sourced from `PRIMEVUE_TOAST_FALLBACK_ICON`.
- `ConfirmPopup`, `DynamicDialog`, and `PrimeDialog` remain mounted in the global shell.
- Locale watch still applies `PRIMEVUE_LOCALE_MAP` through `applyPrimeVueLocale()`.
- Route full-path watch still closes app dialog state on page transition.
- `window.$toast` and `window.$message` still mount on component mount and clear on unmount.
- Unmount still calls `closeAll()` and clears all PrimeVue toast groups.

## Governance Inventory

- Raw PrimeVue imports are now restricted to governed adapter internals, vue-ui internals, tests, build resolver boundary, generated registry boundary, and the remaining showcase exception.
- `approvedPrimeVueAppImportFiles` is now empty.
- `apps/web-demo/src/views/example/components/primevue-collection/**` remains the only C-06 app/showcase exception for D-024.
