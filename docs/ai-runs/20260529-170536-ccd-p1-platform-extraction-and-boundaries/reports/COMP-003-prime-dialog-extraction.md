# COMP-003 — PrimeDialog Extraction

Status: DONE

Task IDs: COMP-003

Boundary:
- Moved reusable PrimeDialog component/core store/types into `packages/vue-ui/src/PrimeDialog`.
- App retains `apps/web-demo/src/hooks/modules/useDialog.tsx` as localized convenience API.
- App injects dialog runtime capabilities through `PRIME_DIALOG_RUNTIME_CONFIG_KEY`; package no longer imports app locale or stores.

Changed surfaces:
- `packages/vue-ui/src/PrimeDialog/**`
- `packages/vue-ui/src/index.ts`
- `apps/web-demo/src/hooks/modules/useDialog.tsx`
- `apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue`
- `apps/web-demo/src/plugins/modules/primevue.ts`
- `apps/web-demo/src/views/example/components/primevue-collection/prime-dialog/index.vue`

Validation:
- PASS `pnpm --filter @ccd/vue-ui build`
- PASS `pnpm --filter @ccd/vue-ui test`
- PASS `pnpm --filter @ccd/web-demo type-check`
- PASS `pnpm --filter @ccd/web-demo build`

Evidence:
- `command-logs/COMP-003-*-vue-ui-build*.log`
- `command-logs/COMP-003-*-vue-ui-test.log`
- `command-logs/COMP-003-*-web-demo-type-check*.log`
- `command-logs/COMP-003-*-web-demo-vite-build-refresh-components.log`

Residual risk:
- Public UI boundary policy is now documented and narrowed under UI-003.
