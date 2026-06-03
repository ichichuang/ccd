# Worktree Reanchor Audit

- Approval ID: `FINAL-WORKTREE-REANCHOR-AUDIT-APPROVED`
- Generated at: `2026-06-03`
- Scope: re-anchor after wrong-worktree/scope execution; inspect only except this audit report.

## Decision

Stop condition: `FINAL_WORKTREE_REANCHOR_READY`

Recommendation: proceed with public-layer staging/commit retry from the isolated worktree only, using `commit-readiness-preflight.md` as the source of truth for the public-layer three-commit plan.

## Why Previous Run Is Not FINAL_COMMITS_READY

The previous run executed a P3 DocsShell task in `/Users/cc/MyPorject/ccd`, not the approved public-layer final staged commit plan in `/Users/cc/MyPorject/ccd-public-layer-repair-m1`.

Therefore it is out of scope for the public-layer commit workflow and is not `FINAL_COMMITS_READY`.

The P3 DocsShell changes must remain excluded from the public-layer M1-M8 commit set. This audit did not delete, revert, move, stage, commit, push, merge, reset, clean, restore, rebase, or otherwise alter those changes.

## Isolated Worktree Status

```text
pwd
/Users/cc/MyPorject/ccd-public-layer-repair-m1

git branch --show-current
codex/public-layer-repair-m1

git rev-parse --short HEAD
343a540a
```

`git status --short` before writing this audit report:

```text
 M .ai/manifests/rule-index.json
 M apps/web-demo/src/api/auth/auth.api.ts
 M apps/web-demo/src/api/example/users.spec.ts
 M apps/web-demo/src/api/example/users.ts
 M apps/web-demo/src/api/system/preferences.api.ts
 M apps/web-demo/src/api/system/system.api.ts
 M apps/web-demo/src/hooks/modules/useSystemPreferencesSync.ts
 M apps/web-demo/src/router/utils/accessControl.ts
 M apps/web-demo/src/sync/systemPreferences/guards.ts
 M apps/web-demo/src/sync/systemPreferences/localPersist.ts
 M apps/web-demo/src/sync/systemPreferences/model.ts
 M apps/web-demo/src/sync/systemPreferences/register.ts
 M apps/web-demo/src/sync/systemPreferences/runtime.ts
 M apps/web-demo/src/types/api.ts
 M apps/web-demo/src/types/auto-imports.d.ts
 M apps/web-demo/src/types/systems/preferences.ts
 M apps/web-demo/src/utils/http/requestLayer.spec.ts
 M apps/web-demo/src/utils/http/types.ts
 M apps/web-demo/src/views/example/common/types.vue
 M docs/generated/api-surface-report.json
 M docs/generated/api-surface-report.md
 M packages/contracts/src/http/index.ts
 M packages/contracts/src/http/response.ts
 M packages/contracts/src/index.ts
 M packages/vue-app-platform/src/index.ts
 M scripts/ai-architecture-guard.mjs
?? apps/web-demo/src/sync/systemPreferences/guards.spec.ts
?? ccd-public-layer-repair-plan-package/
?? docs/ai-runs/20260602-140000-ccd-public-layer-repair-m2-api-dto-contract-normalization/
?? packages/contracts/src/preferences.ts
?? packages/contracts/src/routing.ts
?? packages/vue-app-platform/src/routeAccess.spec.ts
?? packages/vue-app-platform/src/routeAccess.ts
```

Staged files:

```text
git diff --cached --name-only
<empty>
```

Protected manifest diff:

```text
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml
<empty>
```

Commit-readiness source of truth:

```text
test -f ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/commit-readiness-preflight.md
exists
```

`ccd-public-layer-repair-plan-package/docs/ai-plan/STATUS.md` records:

- `Overall status: DONE`
- `Current milestone: M8`
- `Last completed task: M8`
- `Final completion state: GO_READY_FOR_HUMAN_REVIEW`

`ccd-public-layer-repair-plan-package/docs/ai-plan/FINAL_GO_NO_GO.md` records current state `GO_READY_FOR_HUMAN_REVIEW`.

## Main Worktree Status

```text
pwd
/Users/cc/MyPorject/ccd

git branch --show-current
main

git rev-parse --short HEAD
343a540a
```

`git status --short`:

```text
 M .ai/runtime/repair_list.md
 M apps/web-demo/src/types/auto-imports.d.ts
 M apps/web-demo/src/views/example/architecture/system-states/index.vue
 M apps/web-demo/src/views/example/common/types.vue
 M apps/web-demo/src/views/example/components/empty-state/index.vue
 D ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/CHANGE_SUMMARY.md
 D ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/CODEX_GOAL_PROMPT.md
 D ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/DECISIONS.md
 D ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/EVIDENCE_POLICY.md
 D ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/FINAL_GO_NO_GO.md
 D ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/FINAL_VALIDATION_MATRIX.md
 D ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/NEXT_ACTIONS.md
 D ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/OPERATOR_SOP.md
 D ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/PLAN.md
 D ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/REVIEW_CHECKLIST.md
 D ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/RISK_REGISTER.md
 D ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/ROLLBACK.md
 D ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/SECURITY_AND_APPROVALS.md
 D ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/SPEC.md
 D ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/STATUS.md
 D ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/VALIDATION.md
 D ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/WORKFLOW_RECOMMENDATIONS.md
 D ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-runs/README.md
 M docs/generated/graphs/dependency-graph.json
?? apps/web-demo/src/views/example/shared/
```

`git diff --stat`:

```text
 .ai/runtime/repair_list.md                         |   8 +
 apps/web-demo/src/types/auto-imports.d.ts          |  31 +-
 .../example/architecture/system-states/index.vue   | 445 ++++++++-------
 apps/web-demo/src/views/example/common/types.vue   | 168 +++---
 .../views/example/components/empty-state/index.vue | 611 +++++++++++----------
 .../docs/ai-plan/CHANGE_SUMMARY.md                 |  82 ---
 .../docs/ai-plan/CODEX_GOAL_PROMPT.md              |   1 -
 .../docs/ai-plan/DECISIONS.md                      |  26 -
 .../docs/ai-plan/EVIDENCE_POLICY.md                |  24 -
 .../docs/ai-plan/FINAL_GO_NO_GO.md                 |  24 -
 .../docs/ai-plan/FINAL_VALIDATION_MATRIX.md        |  24 -
 .../docs/ai-plan/NEXT_ACTIONS.md                   |   6 -
 .../docs/ai-plan/OPERATOR_SOP.md                   |  12 -
 .../docs/ai-plan/PLAN.md                           | 259 ---------
 .../docs/ai-plan/REVIEW_CHECKLIST.md               |  13 -
 .../docs/ai-plan/RISK_REGISTER.md                  |  12 -
 .../docs/ai-plan/ROLLBACK.md                       |  17 -
 .../docs/ai-plan/SECURITY_AND_APPROVALS.md         |  26 -
 .../docs/ai-plan/SPEC.md                           |  47 --
 .../docs/ai-plan/STATUS.md                         |  28 -
 .../docs/ai-plan/VALIDATION.md                     |  56 --
 .../docs/ai-plan/WORKFLOW_RECOMMENDATIONS.md       |  11 -
 .../docs/ai-runs/README.md                         |   3 -
 docs/generated/graphs/dependency-graph.json        |  50 +-
 24 files changed, 666 insertions(+), 1318 deletions(-)
```

`git diff --name-status`:

```text
M	.ai/runtime/repair_list.md
M	apps/web-demo/src/types/auto-imports.d.ts
M	apps/web-demo/src/views/example/architecture/system-states/index.vue
M	apps/web-demo/src/views/example/common/types.vue
M	apps/web-demo/src/views/example/components/empty-state/index.vue
D	ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/CHANGE_SUMMARY.md
D	ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/CODEX_GOAL_PROMPT.md
D	ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/DECISIONS.md
D	ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/EVIDENCE_POLICY.md
D	ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/FINAL_GO_NO_GO.md
D	ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/FINAL_VALIDATION_MATRIX.md
D	ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/NEXT_ACTIONS.md
D	ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/OPERATOR_SOP.md
D	ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/PLAN.md
D	ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/REVIEW_CHECKLIST.md
D	ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/RISK_REGISTER.md
D	ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/ROLLBACK.md
D	ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/SECURITY_AND_APPROVALS.md
D	ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/SPEC.md
D	ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/STATUS.md
D	ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/VALIDATION.md
D	ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/WORKFLOW_RECOMMENDATIONS.md
D	ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-runs/README.md
M	docs/generated/graphs/dependency-graph.json
```

Untracked file inventory:

```text
apps/web-demo/src/views/example/shared/ExampleDocPage.vue
```

Staged files:

```text
git diff --cached --name-only
<empty>
```

Protected manifest diff:

```text
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml
<empty>
```

## Main Worktree Dirty-State Classification

Out-of-scope P3 DocsShell task:

- `.ai/runtime/repair_list.md`
- `apps/web-demo/src/types/auto-imports.d.ts`
- `apps/web-demo/src/views/example/architecture/system-states/index.vue`
- `apps/web-demo/src/views/example/common/types.vue`
- `apps/web-demo/src/views/example/components/empty-state/index.vue`
- `apps/web-demo/src/views/example/shared/ExampleDocPage.vue`
- `docs/generated/graphs/dependency-graph.json`

Pre-existing unrelated dirty files:

- Deleted files under `ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-plan/**`
- Deleted file `ccd-post-go-app-public-layer-exhaustiveness-plan-package/docs/ai-runs/README.md`

Accidental public-layer residue:

- None detected. A path scan of main worktree dirty files found no `ccd-public-layer-repair` package residue and no public-layer M1-M8 source paths such as `packages/contracts/**`, `packages/vue-app-platform/**`, `apps/web-demo/src/sync/systemPreferences/**`, `apps/web-demo/src/router/utils/accessControl.ts`, public-layer API/DTO paths, public-layer generated API-surface reports, or `scripts/ai-architecture-guard.mjs`.

## Confirmation

- P3 DocsShell changes are excluded from the public-layer M1-M8 commit set.
- No files were staged in the isolated worktree at inspection time.
- No files were staged in the main worktree at inspection time.
- Protected manifest diff is empty in both worktrees.
- `commit-readiness-preflight.md` exists in the isolated worktree and remains the source of truth for the public-layer three-commit plan.
- This audit report itself is an unstaged evidence artifact created after the initial isolated worktree status capture.

## Blocker Checks

- `BLOCKED_BY_ISOLATED_WORKTREE_DRIFT`: not triggered.
- `BLOCKED_BY_STAGED_FILES`: not triggered.
- `BLOCKED_BY_PROTECTED_MANIFEST_DIFF`: not triggered.
- `BLOCKED_BY_MAIN_PUBLIC_LAYER_RESIDUE`: not triggered.
