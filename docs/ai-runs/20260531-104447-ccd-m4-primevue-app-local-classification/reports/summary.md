# M4 PrimeVue and App-Local Shared Classification Summary

## Baseline

- Branch and commit logs: `../command-logs/001-git-branch.txt`, `002-git-rev-parse-short-head.txt`.
- Dirty-state log: `../command-logs/003-git-status-short-untracked.txt`.
- Source runtime migration: none.
- Package manifest or dependency changes: none.

## Results

- PrimeVue inventory: 163 import rows; 163 allowed by current policy; 0 unallowed rows.
- PrimeVue exact app allowlist rows: 70; showcase exception rows: 12.
- App-local candidate inventory: 71 rows; 6 compatibility facades; 23 migration candidates; 20 app adapter/plugin rows; 1 owner-decision row; 15 test-only rows.
- C-06 remains OPEN because existing direct app PrimeVue imports still depend on exact allowlists and the primevue-collection showcase exception.
- New B-category issue added by this inventory: B-12 for `apps/web-demo/src/hooks/modules/useProTableUrlSync.ts` / `plugins/modules/protable.ts` classification.

## Reports

- `primevue-boundary-inventory.md`
- `app-local-shared-candidates.md`
- `recommended-m5-extraction-targets.md`

## Validation

- `git diff --check` passed (`../command-logs/020-git-diff-check.txt`).
- `pnpm docs:commands` passed (`../command-logs/021-pnpm-docs-commands.txt`).
- `pnpm ai:guard` passed (`../command-logs/022-pnpm-ai-guard.txt`).
- `pnpm arch:runtime` passed (`../command-logs/023-pnpm-arch-runtime.txt`).
- `pnpm arch:boundaries` passed (`../command-logs/024-pnpm-arch-boundaries.txt`).
- `pnpm supply:check` passed (`../command-logs/026-pnpm-supply-check.txt`).
- `pnpm governance:full` first regenerated generated governance artifacts, then passed on rerun (`../command-logs/025-pnpm-governance-full.txt`, `027-pnpm-governance-full-rerun.txt`).
- `pnpm api:report` passed (`../command-logs/028-pnpm-api-report.txt`).
- `pnpm project:doctor` passed (`../command-logs/035-pnpm-project-doctor.txt`).
- `pnpm ai:doctor --open` passed and still reports the open ledger queue (`../command-logs/036-pnpm-ai-doctor-open.txt`).
- `pnpm codex:preflight` passed (`../command-logs/037-pnpm-codex-preflight.txt`).
- `pnpm validate:governance` first regenerated generated governance artifacts after the standalone API report, then passed on rerun (`../command-logs/038-pnpm-validate-governance.txt`, `039-pnpm-validate-governance-rerun.txt`).

## Guard Assessment

`scripts/ai-architecture-guard.mjs` already enforces `primevue-direct-import-boundary` and `primevue-public-api-leak`. M4 did not need to broaden allowlists or weaken runtime enforcement.

## Residual Risks

- App-local classification does not approve indefinite app ownership; it only separates app shell/adapters/facades from future migration candidates.
- M5 source lanes must validate persisted storage, theme visuals, layout/size behavior, and device breakpoint behavior before any extraction.
- M7 still needs broader stale-doc cleanup outside this lane's allowed documentation set.
