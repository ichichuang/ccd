# M3 Browser Runtime Boundary Summary

## Baseline

- Branch: `main`
- Commit: `cc255d1a`
- Run directory: `docs/ai-runs/20260531-101606-ccd-m3-browser-runtime-boundary/`
- Initial dirty state included pre-existing M1/M2 generated, policy, script, and doc artifacts. No branch switch, stage, commit, push, reset, or clean was performed.

## Changes

- Expanded `.ai/governance/policies/runtime.json` to schema version 2 with runtime surfaces, scan roots, runtime classes, adapter path allowances, and exact exceptions.
- Replaced `scripts/architecture/check-runtime-leaks.mjs` with an AST/SFC-aware runtime surface checker that can emit inventory and exception reports.
- Updated runtime architecture docs:
  - `docs/runtime/runtime-isolation.md`
  - `docs/runtime/web-runtime.md`
  - `docs/runtime/desktop-runtime.md`
  - `docs/en/architecture-contract.md`
  - `docs/zh/02-architecture.md`
  - `docs/architecture/ownership-boundaries.md`
- Updated `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md` for M3 status and evidence.
- Created M3 evidence reports and command logs.
- Source runtime files changed: no.
- Package manifests changed: no.
- Generated governance files changed: no manual generated edits.

## Runtime Inventory Result

- Inventory rows: 387.
- Production runtime rows: 330.
- Production file/surface pairs: 301.
- Exact exception objects: 122.
- Exact exception file/surface pairs: 297.
- Adapter path allowances: 2.
- Unclassified production findings: 0.

Reports:

- `reports/runtime-surface-inventory.md`
- `reports/runtime-boundary-policy.md`
- `reports/exceptions-register.md`

## Issues

- Touched: C-01, C-02, C-04, C-05, C-06.
- Marked `DONE`: C-01, C-02, C-05.
- Marked `PARTIALLY_OBSOLETE`: C-04.
- Left `OPEN`: C-06.
- Newly added issue IDs: none.
- Existing blocker unchanged: G-03.

## Validation

- `git diff --check`: passed.
- `pnpm docs:commands`: passed.
- `pnpm project:doctor`: passed.
- `pnpm ai:doctor --open`: passed; still reports 80 open ledger tasks.
- `pnpm codex:preflight`: passed; existing token contrast advisories remain warnings.
- `pnpm arch:runtime`: passed; `findings=387`, `exact_exceptions=297`.
- `pnpm arch:boundaries`: passed; depcruise reported no violations and boundary validator passed.
- `pnpm validate:governance`: passed.
- `pnpm api:report`: passed and regenerated API surface report outputs.
- `pnpm exec eslint scripts/architecture/check-runtime-leaks.mjs`: passed.

Validation command logs are under `command-logs/`.

## Residuals

- Existing runtime source debt remains classified, not migrated.
- C-06 PrimeVue direct-import migration remains M4 scope.
- M5 remains the next source cleanup lane for safeStorage/theme/size/device and app-local runtime extraction.

## Final Status

M3_RUNTIME_BOUNDARY_ENFORCED
