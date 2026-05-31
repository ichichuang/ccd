# M6 Owner Decision Packet Summary

## Baseline

- Branch: `main`
- Commit: `cc255d1a`
- Run directory: `docs/ai-runs/20260531-130051-ccd-m6-owner-decision-packet/`
- Initial dirty state: prior M1-M5 governance, docs, generated, script, and evidence artifacts were already dirty/untracked. M6 does not clean, reset, stage, commit, push, or switch branches.

## Scope Result

- Runtime source files changed: no.
- Package manifests changed: no.
- Lockfile changed: no.
- Generated files manually edited: no.
- PrimeVue imports or allowlists changed: no.
- Runtime enforcement weakened: no.

## Planning Outputs

- `reports/b07-safe-storage-crypto-owner-decision.md`
- `reports/c06-primevue-allowlist-decision.md`
- `reports/implementation-lane-split.md`
- `reports/approval-checklist.md`

## Decision Results

- `B-07` remains `BLOCKED`. M6 records proposed options and recommends non-crypto codec extraction first, with crypto app-owned by default unless an owner approves another path.
- `C-06` remains `OPEN`. M6 records proposed options and recommends one-feature-area-at-a-time PrimeVue reduction only after wrapper/adapter migration.
- `D-016` and `D-017` were added to `docs/ai-plan/DECISIONS.md` as `PROPOSED`, not approved.

## Future Lane Split

- `M7-safeStorage-codec-foundation`
- `M8-theme-size-resolver-foundation`
- `M9-device-runtime-resolver-foundation`
- `M10-system-store-pure-state-extraction`
- `M11-hook-facade-convergence`
- `M12-primevue-allowlist-reduction`
- `M13-tsconfig-build-boundary-repair`
- `M14-status-and-ledger-reconciliation`

## Validation

Validation commands are recorded under `command-logs/`.

| command | log | result |
|---|---|---|
| `git diff --check` | `command-logs/after-git-diff-check.txt` | pass, exit 0 |
| `pnpm docs:commands` | `command-logs/after-pnpm-docs-commands.txt` | pass, exit 0 |
| `pnpm project:doctor` | `command-logs/after-pnpm-project-doctor.txt` | pass, exit 0 |
| `pnpm ai:doctor --open` | `command-logs/after-pnpm-ai-doctor-open.txt` | pass, exit 0; reports existing open ledger blockers |
| `pnpm codex:preflight` | `command-logs/after-pnpm-codex-preflight.txt` | pass, exit 0 |
| `pnpm arch:runtime` | `command-logs/after-pnpm-arch-runtime.txt` | pass, exit 0 |
| `pnpm arch:boundaries` | `command-logs/after-pnpm-arch-boundaries.txt` | pass, exit 0 |
| `pnpm validate:governance` | `command-logs/after-pnpm-validate-governance.txt` | fail, exit 1; governance gate generated artifact sync drift |
| `pnpm validate:governance` rerun | `command-logs/after-pnpm-validate-governance-rerun.txt` | fail, exit 1; same generated artifact sync drift |
| `pnpm api:report` | `command-logs/after-pnpm-api-report.txt` | pass, exit 0 |
| `pnpm ai:guard -- --format=json` | `command-logs/after-pnpm-ai-guard-format-json.txt` | pass, exit 0 |

The governance failure is not a manual generated-file edit. The gate itself reports generated outputs changed during the run and asks for generated artifact sync/commit. This lane does not stage, commit, reset, or clean those pre-existing/generated paths.

## M6a Post-Validation

M6a evidence directory:

- `docs/ai-runs/20260531-135533-ccd-m6a-governance-generated-sync-reconciliation/`

M6a reconciled the generated sync blocker by fixing canonical generated-output formatting in generator scripts and regenerating generated outputs through approved commands only.

M6a validation evidence:

- `command-logs/060-after-normalizer-fix-pnpm-validate-governance.log`: pass, exit 0
- `command-logs/084-after-api-generator-fix-pnpm-validate-governance.log`: pass, exit 0
- `command-logs/087-stability-shasum-diff-after-api-fix.log`: no generated checksum drift
- `command-logs/091-stability-shasum-diff-validate-vs-refresh-after-fixes.log`: no generated checksum drift

M6a status: `M6A_GOVERNANCE_SYNC_RECONCILED`.

Post-summary checks:

- `command-logs/final-git-diff-check.txt`: pass, exit 0
- `command-logs/final-pnpm-docs-commands.txt`: pass, exit 0
- `command-logs/final-git-status-short-untracked-all.txt`: captured final dirty/untracked state
- `command-logs/final-git-diff-name-only.txt`: captured final changed tracked files

## Final Status

`M6_DECISION_PACKET_READY`

Reason: decision packet and lane split deliverables are complete; `B-07` remains `BLOCKED`, `C-06` remains `OPEN`, `D-016` and `D-017` remain `PROPOSED`, and M6a reconciled generated sync drift so `pnpm validate:governance` passes.
