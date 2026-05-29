# M8 CSS / Px-to-rem Repair Report

## Scope

- Lane: M8 CSS, tokens, and responsive engine.
- Source change: `apps/web-demo/vite.config.ts` only.
- No authored view CSS, PrimeVue theme, route, dependency, or Login Diorama changes were made.

## Change

- Added `PX_TO_REM_FILE_EXCLUDES` and `shouldExcludePxToRemFile()` for `postcss-pxtorem`.
- Preserved the existing `node_modules` exclusion.
- Added file-level exclusions for UnoCSS virtual/generated CSS identifiers (`uno.css`, `__uno.css`, `virtual:uno`, `@unocss`).
- Kept the existing selector blacklist as a fallback for current authored CSS conversion behavior.

## Validation

PASS:

- `pnpm --filter @ccd/web-demo type-check`
  - `command-logs/M8-20260529-081500-final-web-demo-type-check.log`
- `pnpm build:web-demo`
  - `command-logs/M8-20260529-081515-final-pnpm-build-web-demo.log`
- `pnpm lint:check`
  - `command-logs/M8-20260529-081540-pnpm-lint-check.log`
  - Existing warnings only: `packages/vue-hooks/src/createAutoMittHook.spec.ts` has two `vue/one-component-per-file` warnings.
- Production screenshots captured:
  - `screenshots/M8-login-desktop.png`
  - `screenshots/M8-login-mobile.png`
  - `screenshots/M8-dashboard-desktop.png`
  - `screenshots/M8-dashboard-mobile.png`
  - `screenshots/M8-chart-desktop.png`

BLOCKED validation:

- `pnpm e2e:qa`
  - `command-logs/M8-20260529-080320-pnpm-e2e-qa.log`
  - 34 passed, 2 failed.
  - Failed tests:
    - `AppContainer CScrollbar restores persisted scroll memory smoothly after refresh`
    - `visual baselines catch silent layout collapse`
- Focused e2e rerun reproduced both failures:
  - `command-logs/M8-20260529-080600-e2e-failure-rerun.log`
- Production table-heavy screenshot is blocked because `.p-datatable` renders with height `0` on `/example/primevue-collection/pro-table/basic`.
  - Current patched diagnostic: `reports/M8-table-production-hidden-diagnostic.json`
  - Screenshot: `screenshots/M8-table-production-hidden-diagnostic.png`

## A/B Evidence

The table-heavy production failure is not caused by the M8 pxtorem file-exclude patch:

- A/B run temporarily restored original `exclude: /node_modules/i`.
- Rebuilt with the original pxtorem exclusion.
- Re-ran production table diagnostic.
- Result remained `.p-datatable` height `0`.
- Evidence:
  - `command-logs/M8-20260529-081250-ab-baseline-pnpm-build-web-demo.log`
  - `command-logs/M8-20260529-081355-ab-baseline-table-diagnostic.log`
  - `reports/M8-ab-baseline-table-diagnostic.json`
  - `screenshots/M8-ab-baseline-table-diagnostic.png`

## Residual Risk

- `P2-CSS-Validation` remains BLOCKED because the table-heavy screenshot and two e2e checks do not pass.
- The narrowest next action is a separate ProTable/AppContainer layout validation lane focused on the zero-height table container and scroll-memory regression.
