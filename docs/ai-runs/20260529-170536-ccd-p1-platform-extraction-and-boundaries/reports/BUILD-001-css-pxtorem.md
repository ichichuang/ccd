# BUILD-001 CSS Px-To-Rem Boundary

Status: DONE

Boundary:
- Reduced `PX_TO_REM_SELECTOR_BLACKLIST` reliance in `apps/web-demo/vite.config.ts`.
- Kept file-level generated/UnoCSS exclusions as the primary protection boundary.
- Did not migrate Vite or change token semantics.

Validation:
- PASS `pnpm build:web-demo`
- PASS `pnpm --filter @ccd/web-demo type-check`

Evidence:
- `command-logs/BUILD-001-*-pnpm-build-web-demo*.log`
- `command-logs/BUILD-001-*-web-demo-type-check-theme-subpath.log`

Residual risk:
- Visual coverage is still governed by final E2E visual/perf/layout suites.
