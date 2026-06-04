# M0 Baseline Validation

## Result

Baseline validation status: `PASS`

All executed baseline commands returned exit status `0`. The workspace was already dirty before validation, and validation produced one generated-file formatting diff in `docs/generated/sbom.json`.

## Command Matrix

| Command | Status | Evidence |
| --- | --- | --- |
| `pnpm codex:preflight` | PASS | `command-logs/baseline-codex-preflight.log` |
| `pnpm ci:smoke:packages` | PASS | `command-logs/baseline-ci-smoke-packages.log` |
| `pnpm type-check` | PASS | `command-logs/baseline-type-check.log` |
| `pnpm lint:check` | PASS | `command-logs/baseline-lint-check.log` |
| `pnpm test:run` | PASS | `command-logs/baseline-test-run.log` |
| `pnpm arch:boundaries` | PASS | `command-logs/baseline-arch-boundaries.log` |
| `pnpm arch:runtime` | PASS | `command-logs/baseline-arch-runtime.log` |
| `pnpm ai:guard -- --format=json` | PASS | `command-logs/baseline-ai-guard-json.log` |
| `pnpm drift-check` | PASS | `command-logs/baseline-drift-check.log` |
| `pnpm validate:governance` | PASS | `command-logs/baseline-validate-governance.log` |
| `pnpm api:report` | PASS | `command-logs/baseline-api-report.log` |
| `pnpm supply:check` | PASS | `command-logs/baseline-supply-check.log` |
| `pnpm drift-check` after `supply:check` | PASS | `command-logs/baseline-drift-check-post-supply.log` |

## Validation Side Effects

`pnpm supply:check` changed formatting in `docs/generated/sbom.json` for the root package `sideEffects` array. This is command-generated output, not a manual generated-file edit.

Evidence:

- `diffs/post-m0-sbom-generated-diff.patch`
- `diffs/post-m0-diff-stat.patch`
- `command-logs/post-m0-final-git-status-short.log`

## Baseline Interpretation

- Baseline scripts and governance checks are green in the current repository state.
- Existing unrelated deletions under `ccd-post-go-app-public-layer-exhaustiveness-plan-package/**` remain present.
- The active plan package remains untracked.
- Source implementation must not start until the operator approves continuing in this dirty `main` working tree or provides an isolated worktree.
