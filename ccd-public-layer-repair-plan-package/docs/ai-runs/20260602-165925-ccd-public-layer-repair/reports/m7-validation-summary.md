# M7 Validation Summary

## Outcome

- Milestone: `M7 - Theme/size facade hardening`
- Approval ID: `M7-PLAN-SCOPE-EXECUTION-APPROVED`
- Status: `DONE`
- Timestamp: `2026-06-03T08:24:51+0800`
- Source implementation: `NOT_APPLICABLE`
- Visual/responsive smoke: `NOT_APPLICABLE`

## Validation Matrix

| Command or method | Result | Evidence | Notes |
| --- | --- | --- | --- |
| `pnpm codex:preflight` | PASS | `../command-logs/046-m7-required-01-codex-preflight-rerun.log` | Passed using repo Node `v24.15.0` and process-local `MISE_TRUSTED_CONFIG_PATHS`. |
| `pnpm ci:smoke:packages` | PASS | `../command-logs/047-m7-required-02-ci-smoke-packages.log` | Internal package resolution and required `dist` outputs passed. |
| `pnpm type-check` | PASS | `../command-logs/048-m7-required-03-type-check.log` | Workspace type-check passed across 12 packages / apps. |
| `pnpm lint:check` | PASS | `../command-logs/049-m7-required-04-lint-check.log` | No lint failures. |
| `pnpm test:run` | PASS | `../command-logs/050-m7-required-05-test-run.log` | 83 test files / 474 tests passed; existing stderr warnings remained non-fatal and pre-existing. |
| `pnpm arch:boundaries` | PASS | `../command-logs/051-m7-required-06-arch-boundaries.log` | No dependency boundary violations. |
| `pnpm arch:runtime` | PASS | `../command-logs/052-m7-required-07-arch-runtime.log` | Runtime leak and root-runtime decommission checks passed. |
| `pnpm ai:guard -- --format=json` | PASS | `../command-logs/053-m7-required-08-ai-guard-json.log` | No guarded-surface findings. |
| `pnpm drift-check` | PASS | `../command-logs/054-m7-required-09-drift-check.log` | Drift check passed. |
| `pnpm validate:governance` | PASS | `../command-logs/055-m7-required-10-validate-governance.log` | Governance gate passed, including API report generation and graph generation. |
| `pnpm validate:governance` after M7 docs updates | PASS | `../command-logs/063-m7-required-13-validate-governance-after-docs.log` | Final governance rerun passed after writing M7 evidence files. |
| `git diff --check` | PASS | `../command-logs/056-m7-required-11-git-diff-check.log` | No whitespace or conflict-marker diff issues. |
| `git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml` | PASS, empty diff | `../command-logs/057-m7-required-12-protected-manifest-diff.log` | Protected manifest diff remained empty. |
| `git status --short` plus generated diff summary | PASS | `../command-logs/058-m7-post-validation-diff-summary.log` | Existing command-owned generated diffs remained limited to `.ai/manifests/rule-index.json` and API surface reports. |
| Final diff checks after M7 docs updates | PASS | `../command-logs/065-m7-final-post-patch-diff-checks.log` | Protected manifest diff stayed empty after the last M7 evidence-file patch. |

## Not Applicable Checks

| Command or method | Status | Reason |
| --- | --- | --- |
| `pnpm --filter @ccd/vue-app-platform type-check` | NOT_APPLICABLE | Current M7 did not modify `@ccd/vue-app-platform` source. Workspace `pnpm type-check` already covered the package. |
| `pnpm --filter @ccd/vue-app-platform build` | NOT_APPLICABLE | Current M7 did not modify `@ccd/vue-app-platform` source. `pnpm codex:preflight` and `pnpm test:run` already rebuilt the package as part of their owning workflows. |
| `pnpm build:web-demo` | NOT_APPLICABLE | `VALIDATION.md` requires this for M7 only if theme/size code changes. No current M7 theme/size source changed. |
| `pnpm build:desktop` | NOT_APPLICABLE | `VALIDATION.md` requires this for M7 only if theme/size code changes. No current M7 desktop theme source changed. |
| Visual/responsive smoke screenshots | NOT_APPLICABLE | No UI output or first-paint behavior changed because `M7-T03` stayed `NOT_APPLICABLE`. |

## Generated And Protected File Notes

- `pnpm validate:governance` is the owning command that regenerated the tracked API surface outputs seen in current git diff:
  - `docs/generated/api-surface-report.json`
  - `docs/generated/api-surface-report.md`
- No protected manifest diff appeared for:
  - `package.json`
  - `pnpm-lock.yaml`
  - `pnpm-workspace.yaml`

## Conclusion

Current M7 completed as a validated decision-only milestone:

- theme derivation remains package-owned;
- theme runtime write remains capability-injected in `@ccd/vue-app-platform`;
- size DOM/preload/device behavior remains app-owned; and
- the optional size writer extraction remains `NOT_APPLICABLE` under the approved narrow scope.
