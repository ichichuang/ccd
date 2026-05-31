# M6a Governance Generated Sync Reconciliation Summary

## Baseline

- Branch: `main`
- Commit: `cc255d1a`
- Run directory: `docs/ai-runs/20260531-135533-ccd-m6a-governance-generated-sync-reconciliation/`
- Initial generated diff: 7 tracked generated files were already modified; `.ai/governance/api-snapshots/ccd__vue-app-platform.json` was already untracked.
- Initial M6 blocker: M6 `pnpm validate:governance` failed because generated artifacts changed during the gate.

## Scope Result

- Runtime source files changed: no.
- Package manifests changed: no.
- Lockfile changed: no.
- Generated files manually edited: no.
- Generator scripts changed: yes, limited to canonical generated-output formatting.
- PrimeVue imports or allowlists changed: no.
- Runtime enforcement weakened: no.

## Fix

- `scripts/normalize-generated-output.mjs` now runs the same Prettier formatting used by `scripts/governance/gate.mjs`, includes `.ai/governance/api-snapshots/**`, and traverses generated files in stable sorted order.
- `scripts/architecture/check-api-surface.mjs` now formats its generated API report and API snapshots after writing them, so standalone `pnpm api:report` and `pnpm validate:governance` no longer produce different JSON formatting states.

## Validation Result

| command | log | result |
|---|---|---|
| `pnpm validate:governance` | `command-logs/010-reproduce-pnpm-validate-governance.log` | pass, exit 0 in the already gate-normalized worktree |
| `pnpm api:report` | `command-logs/021-pnpm-api-report.log` | pass, exit 0; before fix, JSON checksum changed to generator formatting |
| `pnpm governance:refresh` | `command-logs/030-pnpm-governance-refresh.log` | pass, exit 0; before fix, generated formatting diverged from gate normalization |
| `pnpm validate:governance` | `command-logs/040-after-refresh-pnpm-validate-governance.log` | fail, exit 1; reproduced drift after pre-fix `governance:refresh` |
| `pnpm governance:refresh` | `command-logs/050-after-normalizer-fix-pnpm-governance-refresh.log` | pass, exit 0 |
| `pnpm validate:governance` | `command-logs/060-after-normalizer-fix-pnpm-validate-governance.log` | pass, exit 0 |
| `pnpm api:report` | `command-logs/080-after-api-generator-fix-pnpm-api-report.log` | pass, exit 0 |
| `pnpm validate:governance` | `command-logs/084-after-api-generator-fix-pnpm-validate-governance.log` | pass, exit 0 |
| `pnpm governance:refresh` | `command-logs/088-after-api-generator-fix-pnpm-governance-refresh.log` | pass, exit 0 |

Checksum comparisons:

- `command-logs/087-stability-shasum-diff-after-api-fix.log`: no checksum difference between standalone `pnpm api:report` and subsequent `pnpm validate:governance`.
- `command-logs/091-stability-shasum-diff-validate-vs-refresh-after-fixes.log`: no checksum difference between `pnpm validate:governance` and subsequent `pnpm governance:refresh`.

Final validation:

| command | log | result |
|---|---|---|
| `git diff --check` | `command-logs/100-final-git-diff-check.log` | pass, exit 0 |
| `pnpm docs:commands` | `command-logs/101-final-pnpm-docs-commands.log` | pass, exit 0 |
| `pnpm project:doctor` | `command-logs/102-final-pnpm-project-doctor.log` | pass, exit 0 |
| `pnpm ai:doctor --open` | `command-logs/103-final-pnpm-ai-doctor-open.log` | pass, exit 0 |
| `pnpm codex:preflight` | `command-logs/104-final-pnpm-codex-preflight.log` | pass, exit 0 |
| `pnpm arch:runtime` | `command-logs/105-final-pnpm-arch-runtime.log` | pass, exit 0 |
| `pnpm arch:boundaries` | `command-logs/106-final-pnpm-arch-boundaries.log` | pass, exit 0 |
| `pnpm api:report` | `command-logs/107-final-pnpm-api-report.log` | pass, exit 0 |
| `pnpm ai:guard -- --format=json` | `command-logs/108-final-pnpm-ai-guard-format-json.log` | pass, exit 0 |
| `pnpm validate:governance` | `command-logs/109-final-pnpm-validate-governance.log` | pass, exit 0 |

## Final Status

`M6A_GOVERNANCE_SYNC_RECONCILED`

M6 can be reported as `M6_DECISION_PACKET_READY`: decision packets remain `PROPOSED`, `B-07` remains `BLOCKED`, `C-06` remains `OPEN`, and generated sync validation now passes locally without committing, staging, resetting, or cleaning.
