# NEXT_ACTIONS — Immediate Next Steps

## First action

Review the validated branch diff.

This branch is now `GO_READY_FOR_HUMAN_REVIEW`; the next step is human review, not more implementation by default.

## Recommended human review sequence

1. Review `FINAL_GO_NO_GO.md`.
2. Review `FINAL_VALIDATION_MATRIX.md`.
3. Inspect the current implementation diff in:
   - `packages/contracts/**`
   - `packages/vue-app-platform/**`
   - `apps/web-demo/src/router/utils/accessControl.ts`
   - `apps/web-demo/src/types/api.ts`
   - `apps/web-demo/src/utils/http/types.ts`
   - `apps/web-demo/src/sync/systemPreferences/**`
   - `scripts/ai-architecture-guard.mjs`
4. Review command-owned generated diffs:
   - `.ai/manifests/rule-index.json`
   - `apps/web-demo/src/types/auto-imports.d.ts`
   - `docs/generated/api-surface-report.json`
   - `docs/generated/api-surface-report.md`

## Optional follow-up after review

Choose one:

1. Approve staging/commit on the current branch.
2. Request targeted fixes on the current branch.
3. Open a separate approved lane for deferred sync/build/size-writer work.

## Deferred lanes

- Sync runtime extraction
- Build/Vite extraction
- Any schema-owner expansion into `@ccd/contracts`
- Optional size DOM writer extraction

## Stop condition for the coding agent

Stop after M8 final artifacts are complete and reported. Do not commit, push, or merge unless explicitly requested.
