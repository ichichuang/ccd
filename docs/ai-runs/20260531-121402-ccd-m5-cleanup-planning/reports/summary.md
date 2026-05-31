# M5 Cleanup Planning Summary

## Baseline

- Branch: `main`
- Commit: `cc255d1a`
- Run directory: `docs/ai-runs/20260531-121402-ccd-m5-cleanup-planning/`
- Initial dirty state: pre-existing M1-M4 policy, docs, generated, script, and evidence artifacts were already dirty/untracked. M5 did not clean, reset, stage, commit, push, or switch branches.

## Scope Result

- Runtime source files changed: no.
- Package manifests changed: no.
- Lockfile changed: no.
- Generated files under `docs/generated/**` or `.ai/generated/**` manually edited: no.
- PrimeVue imports or allowlists reduced: no.
- Runtime enforcement weakened: no.

## Planning Outputs

- `reports/extraction-candidate-dependency-map.md`
- `reports/package-target-api-plan.md`
- `reports/safe-storage-plan.md`
- `reports/theme-size-device-plan.md`
- `reports/system-store-and-hook-facade-plan.md`
- `reports/primevue-allowlist-reduction-plan.md`

## Counts

- Extraction candidates: 20.
- SafeStorage candidates: 6.
- Theme candidates: 5.
- Size candidates: 2.
- Device candidates: 2.
- Store candidates: 1 grouped system-store candidate.
- Hook/facade candidates: 4 hook/layout facades plus 3 app plugin/facade integrations.
- PrimeVue allowlist reduction candidate groups: 7.
- Compatibility facades retained: 7.
- Migration candidates identified: 12.
- Needs-owner-decision items: 1 (`B-07`, safeStorage crypto runtime owner).

## Issue Updates

- Touched: A-03, B-01, B-02, B-03, B-04, B-05, B-06, B-07, B-08, B-09, B-10, B-11, B-12, C-06, D-06.
- Newly added issue IDs: none.
- Marked `BLOCKED`: B-07.
- Kept `OPEN`: B-01, B-02, B-04, B-05, B-06, B-08, B-09, B-10, B-11, B-12, C-06.
- Kept `PARTIALLY_OBSOLETE`: B-03.
- Kept `NEEDS_REVIEW`: A-03, D-06.
- Kept `BLOCKED`: G-03.
- Marked `DONE`: none.

## Key Decisions

- `packages/core` is not a target for safeStorage, theme, size, device, hooks, UI, or PrimeVue work.
- SafeStorage splits into contracts types, shared pure helpers, and app-owned browser/key/runtime adapters.
- Theme pure token derivation already belongs to `packages/design-tokens`; DOM/storage application belongs to `packages/vue-app-platform` with app-injected targets.
- Size pure derivation can move to `packages/design-tokens`; DOM/preload/runtime application needs `packages/vue-app-platform` plus app adapters.
- Device pure resolvers can move to package-owned pure APIs; browser probes and listeners remain app-owned.
- System stores remain app-owned Pinia containers.
- PrimeVue allowlist reduction requires future source migration; M5 removes no allowlist rows.

## Validation

Validation commands are recorded under `command-logs/`.

| command | log | result |
| --- | --- | --- |
| `git diff --check` | `command-logs/020-git-diff-check.log` | pass, exit 0 |
| `pnpm docs:commands` | `command-logs/021-pnpm-docs-commands.log` | pass, exit 0 |
| `pnpm project:doctor` | `command-logs/022-pnpm-project-doctor.log` | pass, exit 0 |
| `pnpm ai:doctor --open` | `command-logs/023-pnpm-ai-doctor-open.log` | pass, exit 0 |
| `pnpm codex:preflight` | `command-logs/024-pnpm-codex-preflight.log` | pass, exit 0 |
| `pnpm arch:runtime` | `command-logs/025-pnpm-arch-runtime.log` | pass, exit 0 |
| `pnpm arch:boundaries` | `command-logs/026-pnpm-arch-boundaries.log` | pass, exit 0 |
| `pnpm validate:governance` | `command-logs/027-pnpm-validate-governance.log` | pass, exit 0 |
| `pnpm api:report` | `command-logs/028-pnpm-api-report.log` | pass, exit 0 |
| `pnpm ai:guard -- --format=json` | `command-logs/029-pnpm-ai-guard-format-json.log` | pass, exit 0 |

Final guard logs:

- Forbidden source/manifest diff check: `command-logs/030-final-forbidden-source-manifest-diff-name-only.log` is empty.
- Final git status: `command-logs/031-final-git-status-short-untracked-all.log`.
- Final diff stat: `command-logs/032-final-git-diff-stat.log`.
- Generated diff list: `command-logs/033-final-generated-diff-name-only.log`; generated paths were already dirty at baseline and were not manually edited by M5.
- Post-summary `git diff --check`: `command-logs/034-final-git-diff-check.log`, pass, exit 0.
- Post-summary `pnpm docs:commands`: `command-logs/035-final-pnpm-docs-commands.log`, pass, exit 0.

## Final Status

M5_PARTIAL

Reason: planning deliverables are complete, but the safeStorage crypto runtime owner (`B-07`) remains blocked on an owner decision.
