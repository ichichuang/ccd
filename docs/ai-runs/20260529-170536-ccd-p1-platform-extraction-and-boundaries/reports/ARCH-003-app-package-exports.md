# ARCH-003 App Package Exports

Status: DONE

Boundary:
- Removed app package `exports` from `apps/web-demo/package.json` and `apps/desktop/package.json`.
- Marked app packages as private non-public API surfaces in `.ai/governance/policies/topology.json`.
- Updated API/boundary scripts to skip public API enforcement for `publicApi: false` packages.

Validation:
- PASS `pnpm api:report`
- PASS `pnpm arch:boundaries`
- PASS `pnpm ci:smoke:packages`

Evidence:
- `command-logs/ARCH-003-*-pnpm-api-report*.log`
- `command-logs/ARCH-003-*-pnpm-arch-boundaries*.log`
- `command-logs/ARCH-003-*-pnpm-ci-smoke-packages.log`

Residual risk:
- None known.
