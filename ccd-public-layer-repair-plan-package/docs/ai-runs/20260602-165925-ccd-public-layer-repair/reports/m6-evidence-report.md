# M6 Evidence Report

## Outcome

- Milestone: `M6 - Build config owner decision and optional extraction plan`
- Approval ID: `M6-PLAN-SCOPE-EXECUTION-APPROVED`
- Status: `DONE`
- Timestamp: `2026-06-03T07:10:36+0800`
- Stop condition: Stop after M6; do not advance to M7.

## Scope Result

M6 is decision-only. Build config extraction and cleanup are `DEFERRED` because no separate build package owner, dependency, manifest, lockfile, production config, or Vite migration approval exists.

No build source files, package manifests, lockfiles, production config, or generated files were manually edited.

## Pre-Run Checks

| Check | Result | Evidence |
| --- | --- | --- |
| `pwd` | `/Users/cc/MyPorject/ccd-public-layer-repair-m1` | `../command-logs/m6-001-pre-run-checks.log` |
| branch | `codex/public-layer-repair-m1` | `../command-logs/m6-001-pre-run-checks.log` |
| HEAD | `343a540a92b8a1bd5e8bb86eec7772f15946aab1` | `../command-logs/m6-001-pre-run-checks.log` |
| protected manifest diff | empty | `../command-logs/m6-001-pre-run-checks.log` |
| M1-T03, M2, M3, M4, M5 completion evidence | present in `STATUS.md` | `../command-logs/m6-001-pre-run-checks.log` |
| M5 evidence summary | present | `../command-logs/m6-001-pre-run-checks.log` |
| materialized adapter files | present | `../command-logs/m6-001-pre-run-checks.log` |
| inactive accidental evidence dirs | inspected read-only, not used for writes | `../command-logs/m6-001-pre-run-checks.log`, `../command-logs/m6-016-final-status-diff-after-validation.log` |

## Validation Matrix

| Command | Result | Evidence |
| --- | --- | --- |
| `pnpm build:web-demo` | PASS | `../command-logs/m6-required-01-build-web-demo.log` |
| `pnpm drift-check` | PASS | `../command-logs/m6-required-02-drift-check.log` |
| `pnpm ai:guard -- --format=json` | PASS | `../command-logs/m6-required-03-ai-guard-json.log` |
| `pnpm type-check` | PASS | `../command-logs/m6-required-04-type-check.log` |
| `pnpm validate:governance` | PASS | `../command-logs/m6-required-05-validate-governance.log` |
| `pnpm validate:governance` rerun | PASS | `../command-logs/m6-required-06-validate-governance-rerun.log` |
| `pnpm validate:governance` final rerun after M6 docs | PASS | `../command-logs/m6-required-07-validate-governance-after-docs.log` |
| `pnpm validate:governance` final rerun after evidence links | PASS | `../command-logs/m6-required-08-validate-governance-final-after-evidence-links.log` |
| generated/protected diff check | PASS | `../command-logs/m6-016-final-status-diff-after-validation.log` |

## Generated And Protected File Evidence

- Existing generated diff set remained stable after validation:
  - `.ai/manifests/rule-index.json`
  - `apps/web-demo/src/types/auto-imports.d.ts`
  - `docs/generated/api-surface-report.json`
  - `docs/generated/api-surface-report.md`
- Protected manifest diff stayed empty:
  - `package.json`
  - `pnpm-lock.yaml`
  - `pnpm-workspace.yaml`
- Production/config manifest diff sample stayed empty for package manifests, `turbo.json`, and `apps/web-demo/vite.config.ts`.

## Command Notes

- `m6-002-plan-router-package-context.log` recorded the local untrusted `mise.toml` shim failure.
- `m6-005-plan-router-package-context-rerun.log` successfully ran skill routing but had a package JSON quoting error.
- `m6-006-package-scripts-context-rerun.log` successfully captured package scripts using the repo Node/pnpm path and process-local `MISE_TRUSTED_CONFIG_PATHS`.

## Changed Files

M6 changed only plan-package documentation and evidence:

- `ccd-public-layer-repair-plan-package/docs/ai-plan/STATUS.md`
- `ccd-public-layer-repair-plan-package/docs/ai-plan/DECISIONS.md`
- `ccd-public-layer-repair-plan-package/docs/ai-plan/RISK_REGISTER.md`
- `ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/build-config-coupling-map.md`
- `ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/build-owner-decision.md`
- `ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/m6-evidence-report.md`
- `ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m6-*.log`
- `ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/command-logs/m6-required-*.log`

## Residual Risks

- Build/Vite package extraction remains deferred until a future explicit owner/dependency/manifest lane is approved.
- Existing accepted M1-M5 dirty baseline remains present and was not reverted.
- Generated output diffs from prior command-owned validation remain present and must be reviewed before any commit.
- Do not advance to M7 without new approval.
