# M14 Final Validation Report

## Scope

- Task IDs: M14-T1 and M14-T2.
- Lane: final validation, evidence closure, and go/no-go only.
- Out of scope: new repairs, dependency upgrades, Vite 8 migration, auth-flow changes, `.github/**` edits, remote GitHub settings, stage, commit, or push.

## Result

Final command validation passes after the official governance generated-sync rerun. The final decision is `NO_GO` because unresolved approval-gated blockers and the M8 non-causal e2e/layout blocker remain.

## Validation

| Command or check | Result | Evidence |
|---|---|---|
| `pnpm docs:commands` | PASS | `command-logs/M14-final-20260529-101200-pnpm-docs-commands.log` |
| `pnpm install --frozen-lockfile` | PASS | `command-logs/M14-final-20260529-101210-pnpm-install-frozen-lockfile.log` |
| `pnpm ci:prepare-internal` | PASS | `command-logs/M14-final-20260529-101220-pnpm-ci-prepare-internal.log` |
| `pnpm ci:smoke:packages` | PASS | `command-logs/M14-final-20260529-101230-pnpm-ci-smoke-packages.log` |
| `pnpm ai:doctor` | PASS | `command-logs/M14-final-20260529-101240-pnpm-ai-doctor.log` |
| `pnpm codex:preflight` | PASS | `command-logs/M14-final-20260529-101250-pnpm-codex-preflight.log` |
| `pnpm type-check` | PASS | `command-logs/M14-final-20260529-101300-pnpm-type-check.log` |
| `pnpm lint:check` | PASS with 2 existing warnings | `command-logs/M14-final-20260529-101310-pnpm-lint-check.log` |
| `pnpm test:run` | PASS, 67 files / 386 tests | `command-logs/M14-final-20260529-101320-pnpm-test-run.log` |
| `pnpm build:web-demo` | PASS | `command-logs/M14-final-20260529-101330-pnpm-build-web-demo.log` |
| `pnpm build:desktop` | PASS | `command-logs/M14-final-20260529-101340-pnpm-build-desktop.log` |
| `pnpm budget:desktop` | PASS | `command-logs/M14-final-20260529-101350-pnpm-budget-desktop.log` |
| `pnpm validate:governance` | PASS after reruns | `command-logs/M14-final-20260529-101409-pnpm-validate-governance-generated-sync-rerun.log` |
| `pnpm build:ci` | PASS | `command-logs/M14-final-20260529-101410-pnpm-build-ci.log` |

## Governance Gate Notes

The first final `pnpm validate:governance` attempt failed at `GitHub workflow registry hygiene` with `unable to list workflows`. Direct diagnostics showed:

- `gh auth status` succeeds with a masked token and `workflow` scope.
- `gh repo view` resolves `ichichuang/ccd`.
- `gh api repos/ichichuang/ccd/actions/workflows` succeeds and returns only allowed active paths.

The rerun passed GitHub workflow registry hygiene, then failed once because official generated governance artifacts changed during the gate. The generated-sync rerun passed.

## Open Ledger State

`pnpm ai:doctor --open` is expected to list open items only when they are explicitly marked `BLOCKED` or `DEFERRED`. Any actionable `[ ]` item without such evidence remains a stop condition.

`.ai/runtime/repair_list.md` and `.ai/runtime/repair-ledger.json` are ignored by git in this repository. They were not force-added; ignored status evidence is recorded in `command-logs/M14-final-20260529-101457-git-status-ai-runtime-ignored.log`.

## Final Blockers

| ID | Status | Evidence |
|---|---|---|
| B-003 | BLOCKED | `docs/ai-plan/STATUS.md` |
| B-004 | BLOCKED | `.ai/runtime/owner_decisions.md` |
| B-005 | BLOCKED | `.ai/runtime/owner_decisions.md` |
| B-006 | BLOCKED | `reports/M7-governance-github.md` |
| B-007 | BLOCKED | `reports/M8-table-production-hidden-diagnostic.json`, `reports/M8-ab-baseline-table-diagnostic.json` |
| B-008 | BLOCKED | `reports/M9-vite8-approval-gate.md` |
| B-009 | BLOCKED | `reports/M10-dependency-approval-gate.md` |
| B-010 | BLOCKED | `reports/M11-login-diorama-approval-gate.md` |

## Decision

`NO_GO` until blockers are approved, resolved, or explicitly accepted by the operator.
