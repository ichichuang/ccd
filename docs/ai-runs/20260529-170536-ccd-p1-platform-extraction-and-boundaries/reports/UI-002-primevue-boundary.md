# UI-002 — PrimeVue Layout/Desktop Boundary

Status: DONE

Task IDs: UI-002

Boundary:
- Moved direct layout/desktop PrimeVue component consumption behind `@ccd/vue-ui` named façade exports for the audited layout and desktop shell paths.
- Kept PrimeVue service/global shell imports in `AppPrimeVueGlobals.vue` as app wiring.
- Kept policy hardening for raw re-export semantics under UI-003.

Changed surfaces:
- `packages/vue-ui/src/CcdPrimeControls/index.ts`
- `packages/vue-ui/src/index.ts`
- `packages/vue-ui/vite.config.ts`
- `packages/vue-ui/package.json`
- `apps/web-demo/src/layouts/**`
- `apps/desktop/src/views/DesktopHome.vue`
- `apps/desktop/tsconfig.json`

Validation:
- PASS `pnpm --filter @ccd/vue-ui build`
- PASS `pnpm --filter @ccd/web-demo type-check`
- PASS `pnpm --filter @ccd/desktop type-check`
- PASS `pnpm e2e:layout`

Evidence:
- `command-logs/UI-002-*-vue-ui-build*.log`
- `command-logs/UI-002-*-web-demo-type-check*.log`
- `command-logs/UI-002-*-desktop-type-check*.log`
- `command-logs/UI-002-*-pnpm-e2e-layout-after-jsx-build.log`

Residual risk:
- UI-003 must replace or explicitly govern raw PrimeVue façade exports before final API policy closure.
