# OPERATOR_SOP — Human Operator Standard Procedure

## Purpose

This SOP explains how to review the current branch now that M8 final validation/certification has completed.

Final state for this run: `GO_READY_FOR_HUMAN_REVIEW`.

## Immediate review

1. Read `FINAL_GO_NO_GO.md`.
2. Read `FINAL_VALIDATION_MATRIX.md`.
3. Read `CHANGE_SUMMARY.md`.
4. Inspect `STATUS.md` for the current M8 rows.
5. Inspect the current non-destructive workspace evidence:
   - `command-logs/072-m8-004-status-short.log`
   - `command-logs/109-m8-post-validation-status.log`
   - `command-logs/108-m8-required-21-protected-manifest-diff.log`

## Review focus

Review these implementation surfaces first:

- `packages/contracts/**`
- `packages/vue-app-platform/**`
- `apps/web-demo/src/router/utils/accessControl.ts`
- `apps/web-demo/src/types/api.ts`
- `apps/web-demo/src/utils/http/types.ts`
- `apps/web-demo/src/sync/systemPreferences/**`
- `scripts/ai-architecture-guard.mjs`

Then review command-owned generated outputs:

- `.ai/manifests/rule-index.json`
- `apps/web-demo/src/types/auto-imports.d.ts`
- `docs/generated/api-surface-report.json`
- `docs/generated/api-surface-report.md`

## Commands already passed

The current M8 run passed:

- `pnpm codex:preflight`
- `pnpm --filter @ccd/contracts type-check`
- `pnpm --filter @ccd/contracts test`
- `pnpm --filter @ccd/contracts build`
- `pnpm --filter @ccd/vue-app-platform type-check`
- `pnpm --filter @ccd/vue-app-platform build`
- `pnpm build:core`
- `pnpm build:shared-config`
- `pnpm ci:smoke:packages`
- `pnpm type-check`
- `pnpm lint:check`
- `pnpm test:run`
- `pnpm build:web-demo`
- `pnpm build:desktop`
- `pnpm arch:boundaries`
- `pnpm arch:runtime`
- `pnpm ai:guard -- --format=json`
- `pnpm drift-check`
- `pnpm validate:governance`

## Approval decisions still reserved for the human operator

Only the human operator can approve:

- staging/committing the branch;
- pushing or merging;
- reopening deferred sync/build/size-writer lanes;
- any dependency or manifest/lockfile change;
- any generated-file manual edit;
- any destructive git operation.

## Acceptance criteria

Accept the branch for the next step if all of the following are true:

- `FINAL_GO_NO_GO.md` says `GO_READY_FOR_HUMAN_REVIEW`
- `FINAL_VALIDATION_MATRIX.md` has current-run evidence
- protected manifest diff remains empty
- generated diffs are understood and acceptable
- no evidence contradiction is found across `STATUS.md`, `DECISIONS.md`, and `RISK_REGISTER.md`

## Rejection conditions

Reject or request rework if:

- any current-run evidence path is missing;
- generated diffs cannot be attributed to owning commands;
- human review finds boundary violations despite passing automated guards;
- commit/push/merge is attempted without explicit approval.
