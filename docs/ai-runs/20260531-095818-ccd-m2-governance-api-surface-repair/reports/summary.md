# M2 Governance and API Surface Repair Summary

## Baseline

- Branch: `main`
- Commit: `cc255d1a`
- Run directory: `docs/ai-runs/20260531-095818-ccd-m2-governance-api-surface-repair/`
- Initial dirty state included pre-existing M1/generated/doc artifacts; no branch switch, stage, commit, push, reset, or clean was performed.

## Changes

- Changed API discovery in `scripts/architecture/check-api-surface.mjs` from API-policy-list filtering to topology `publicApi` plus `package.json` exports discovery.
- Added a guard so topology public API packages with exports fail `pnpm api:report` if missing from `.ai/governance/policies/api.json`.
- Added `@ccd/vue-app-platform` to `.ai/governance/policies/api.json`.
- Regenerated API report outputs through `pnpm api:report`:
  - `docs/generated/api-surface-report.md`
  - `docs/generated/api-surface-report.json`
  - `.ai/governance/api-snapshots/ccd__vue-app-platform.json`
- Required `pnpm validate:governance` also regenerated existing governance artifacts before the rerun passed:
  - `.ai/generated/governance-report.json`
  - `docs/generated/governance-report.md`
  - `docs/generated/graphs/README.md`
  - `docs/generated/graphs/dependency-graph.json`
  - `docs/generated/graphs/package-dependency-graph.mmd`
- Updated stale package topology wording in `docs/en/architecture-contract.md`.
- Updated `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md` for D-04 and M2 evidence.
- Source runtime behavior changed: no.
- Package manifests changed: no.
- Lockfile changed: no.

## API Discovery Result

- Before: API report packages were `@ccd/contracts`, `@ccd/core`, `@ccd/design-tokens`, `@ccd/unocss-preset`, `@ccd/shared-utils`, `@ccd/vue-hooks`, `@ccd/vue-ui`, `@ccd/vue-primevue-adapter`, `@ccd/vue-charts`.
- After: API report packages are `@ccd/contracts`, `@ccd/core`, `@ccd/design-tokens`, `@ccd/unocss-preset`, `@ccd/shared-utils`, `@ccd/vue-hooks`, `@ccd/vue-app-platform`, `@ccd/vue-ui`, `@ccd/vue-primevue-adapter`, `@ccd/vue-charts`.
- Discovery table: `reports/api-surface-discovery.md`.

## Issues

- Touched: D-04.
- Marked `DONE`: D-04.
- Newly added issue IDs: none.
- Newly marked `NEEDS_REVIEW`, `BLOCKED`, `PARTIALLY_OBSOLETE`, or `SUPERSEDED`: none.
- Existing blocker unchanged: G-03.

## Validation

- `git diff --check`: passed.
- `pnpm docs:commands`: passed.
- `pnpm project:doctor`: passed.
- `pnpm ai:doctor --open`: passed; still reports 80 open ledger tasks.
- `pnpm codex:preflight`: passed; token contrast advisories remain warnings.
- `pnpm api:report`: passed.
- `pnpm validate:governance`: first run generated governance artifacts and failed sync check; rerun passed.
- `pnpm arch:runtime`: passed.
- `pnpm arch:boundaries`: passed.

## Residuals

- Existing dirty files outside the M2 API lane remain in the worktree from prior lanes.
- G-03 remains blocked and `pnpm ai:doctor --open` still reports 80 open tasks.
- Browser runtime boundary work remains deferred to M3.

## Final Status

M2_API_SURFACE_ALIGNED
