# UI-003 Public API Policy

Status: DONE

Boundary:
- Replaced raw PrimeVue re-exports in `packages/vue-ui/src/CcdPrimeControls` with CCD-owned wrapper components.
- Added `packages/vue-ui/README.md` public API policy.
- Updated `EmptyState` to consume the CCD-owned button wrapper internally.

Validation:
- PASS `pnpm --filter @ccd/vue-ui build`
- PASS `pnpm api:report`

Evidence:
- `command-logs/UI-003-*-vue-ui-build.log`
- `command-logs/UI-003-*-api-report.log`

Residual risk:
- Broad PrimeVue direct-import guard enforcement remains blocked under UI-001 until the owner approves exceptions.
