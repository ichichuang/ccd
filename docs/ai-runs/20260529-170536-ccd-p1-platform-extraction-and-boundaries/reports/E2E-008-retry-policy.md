# E2E-008 Retry Policy

Status: DONE

Boundary:
- Verified existing Playwright config already has global `retries: 0`.
- Verified smoke/layout/perf/visual suites are separated in `package.json`, with perf and visual explicitly using `--retries=0`.
- No code change required.

Validation:
- PASS `pnpm governance:gate`

Evidence:
- `command-logs/GOV-004-*-governance-gate-final-rerun.log`

Residual risk:
- None known.
