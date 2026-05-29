# COMP-004 Examples Public Entry

Status: DONE

Boundary:
- Verified primevue-collection examples consume ProForm/ProTable through public package/app entries after extraction.
- No internal `../engine`, `../types/props`, or migrated app component paths remain in example consumers.

Validation:
- PASS `pnpm arch:boundaries`
- PASS `pnpm api:report`
- PASS `pnpm --filter @ccd/web-demo type-check`

Evidence:
- `command-logs/COMP-004-20260529-182342-pnpm-arch-boundaries.log`
- `command-logs/COMP-004-20260529-182354-pnpm-api-report.log`
- `command-logs/COMP-004-20260529-182354-web-demo-type-check.log`

Residual risk:
- PrimeVue showcase-specific direct import exceptions remain governed by UI boundary policy and are not expanded in this lane.
