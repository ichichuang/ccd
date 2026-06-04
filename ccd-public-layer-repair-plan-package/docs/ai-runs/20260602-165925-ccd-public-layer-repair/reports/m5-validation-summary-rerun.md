# M5 Validation Summary Rerun

## Outcome

- Milestone: `M5 - Sync runtime owner decision and optional extraction plan`
- Approval ID: `M5-PLAN-SCOPE-EXECUTION-APPROVED`
- Status: `DONE`
- Rerun timestamp: `2026-06-02T21:54:58+0800`
- Stop condition: Stop after M5; do not advance to M6.

## Scope Result

M5 remains decision-only. Sync runtime extraction is `DEFERRED` because no separate sync owner/package/dependency/manifest approval exists. No source implementation files were changed for this rerun.

## Validation Matrix

| Command | Result | Evidence |
| --- | --- | --- |
| `pnpm codex:preflight` | PASS | `../command-logs/m5-rerun-001-codex-preflight.log` |
| `pnpm --filter @ccd/contracts type-check` | PASS | `../command-logs/m5-rerun-002-contracts-type-check.log` |
| `pnpm --filter @ccd/contracts test` | PASS | `../command-logs/m5-rerun-003-contracts-test.log` |
| `pnpm --filter @ccd/contracts build` | PASS | `../command-logs/m5-rerun-004-contracts-build.log` |
| `pnpm build:core` | PASS | `../command-logs/m5-rerun-005-build-core.log` |
| `pnpm ci:smoke:packages` | PASS | `../command-logs/m5-rerun-006-ci-smoke-packages.log` |
| `pnpm type-check` | PASS | `../command-logs/m5-rerun-007-type-check.log` |
| `pnpm lint:check` | PASS | `../command-logs/m5-rerun-008-lint-check.log` |
| `pnpm test:run` | PASS | `../command-logs/m5-rerun-009-test-run.log` |
| `pnpm arch:boundaries` | PASS | `../command-logs/m5-rerun-010-arch-boundaries.log` |
| `pnpm arch:runtime` | PASS | `../command-logs/m5-rerun-011-arch-runtime.log` |
| `pnpm ai:guard -- --format=json` | PASS | `../command-logs/m5-rerun-012-ai-guard-json.log` |
| `pnpm drift-check` | PASS | `../command-logs/m5-rerun-013-drift-check.log` |
| `pnpm validate:governance` | PASS | `../command-logs/m5-rerun-014-validate-governance.log` |
| generated diff check | PASS, unchanged after governance | `../command-logs/m5-rerun-015-generated-diff-after.log` |
| `pnpm validate:governance` rerun after generated check | PASS | `../command-logs/m5-rerun-016-validate-governance-rerun-after-generated-check.log` |

`pnpm test:run` passed with 83 test files and 474 tests.

## Generated And Manifest Evidence

- Generated/API diff was unchanged by this validation rerun: `../command-logs/m5-rerun-015-generated-diff-after.log`.
- Protected manifest diff remained empty: `../command-logs/m5-rerun-017-protected-manifest-diff.log`.
- Final git status was recorded: `../command-logs/m5-rerun-018-final-git-status-short.log`.
- `pnpm codex:preflight` was run as an explicitly required validation command. No direct `pnpm ci:prepare-internal` command was run.
- Conditional `@ccd/vue-app-platform` M5 validation was not required because this M5 rerun did not modify `@ccd/vue-app-platform`.

## Changed Files

This rerun changed only evidence and plan-package documentation:

- `ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m5-evidence-report.md`
- `ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m5-validation-summary-rerun.md`
- `ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m5-rerun-*.log`
- `ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/artifacts/m5-generated-diff-before.patch`
- `ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/artifacts/m5-generated-diff-after.patch`
- `ccd-public-layer-repair-plan-package/docs/ai-plan/STATUS.md`
- `ccd-public-layer-repair-plan-package/docs/ai-plan/DECISIONS.md`

## Residual Risks

- Sync reuse remains deferred until a future explicit sync owner/package/dependency/manifest lane is approved.
- Existing accepted M1-M4 dirty baseline remains present and was not reverted.
- Do not advance to M6 without new approval.
