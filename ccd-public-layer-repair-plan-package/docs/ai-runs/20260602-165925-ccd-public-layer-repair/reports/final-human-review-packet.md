# Final Human Review Packet

## Review state

- Stop condition: `FINAL_REVIEW_PACKET_READY`
- Worktree: `/Users/cc/MyPorject/ccd-public-layer-repair-m1`
- Branch: `codex/public-layer-repair-m1`
- HEAD: `343a540a92b8a1bd5e8bb86eec7772f15946aab1`
- Review packet generated under active evidence directory: `ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/final-human-review-packet.md`
- No commit, push, merge, reset, clean, restore, rebase, delete, or branch switch was performed.

## Captured git evidence

Captured before writing this packet.

```text
pwd
/Users/cc/MyPorject/ccd-public-layer-repair-m1

git branch --show-current
codex/public-layer-repair-m1

git rev-parse HEAD
343a540a92b8a1bd5e8bb86eec7772f15946aab1
```

`git status --short --untracked-files=all` showed:

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

`git diff --stat` showed 26 tracked files changed, with `187 insertions(+)` and `283 deletions(-)`. Untracked files are not included in that stat.

`git diff --name-status` showed the tracked modified files listed in the same tracked set above.

Protected manifest diff:

```text
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml

```

Result: empty. No protected package manifest / lockfile / workspace manifest diff was detected.

Governance manifest diff:

- `.ai/manifests/rule-index.json` changed by 16 lines.
- The diff moves ProForm/ProTable rule globs from root `src/components/**` paths to `packages/vue-ui/src/**` paths.
- Classified as generated/governance output, not a package manifest diff.

## M8 status verification

Verified in `ccd-public-layer-repair-plan-package/docs/ai-plan/STATUS.md`:

- `Overall status: DONE`
- `Current milestone: M8`
- `Current task: STOP_AFTER_M8`
- `Last completed task: M8`
- `Final completion state: GO_READY_FOR_HUMAN_REVIEW`
- `Current final state: GO_READY_FOR_HUMAN_REVIEW`

The root `docs/ai-plan/**` files are from a different P31 full-remediation context and were not used as the M8 package status source.

## Final artifact consistency

All required M8 package artifacts are present:

- `ccd-public-layer-repair-plan-package/docs/ai-plan/FINAL_GO_NO_GO.md`
- `ccd-public-layer-repair-plan-package/docs/ai-plan/FINAL_VALIDATION_MATRIX.md`
- `ccd-public-layer-repair-plan-package/docs/ai-plan/CHANGE_SUMMARY.md`
- `ccd-public-layer-repair-plan-package/docs/ai-plan/NEXT_ACTIONS.md`
- `ccd-public-layer-repair-plan-package/docs/ai-plan/OPERATOR_SOP.md`
- `ccd-public-layer-repair-plan-package/docs/ai-plan/RISK_REGISTER.md`

Internal consistency result: no `BLOCKED_BY_REVIEW_CONTRADICTION`.

Evidence:

- `FINAL_GO_NO_GO.md` says `GO_READY_FOR_HUMAN_REVIEW`.
- `FINAL_VALIDATION_MATRIX.md` records M8 validation rows as `PASS` or explicit `NOT_APPLICABLE`, with current-run evidence paths.
- `CHANGE_SUMMARY.md` says M8 did not add new runtime/source implementation and classifies source, generated, and plan/evidence areas.
- `NEXT_ACTIONS.md` says the next step is human review, not more implementation by default.
- `OPERATOR_SOP.md` reserves staging, commit, push, merge, deferred lanes, manifest changes, generated manual edits, and destructive git operations for explicit human approval.
- `RISK_REGISTER.md` final state is `GO_READY_FOR_HUMAN_REVIEW` and keeps generated diffs plus deferred sync/build/size lanes as residual review items.

Checked active evidence files exist under the package:

- `command-logs/087-m8-019-runtime-env.log`
- `command-logs/088-m8-required-01-codex-preflight.log`
- `command-logs/107-m8-required-20-git-diff-check.log`
- `command-logs/108-m8-required-21-protected-manifest-diff.log`
- `command-logs/109-m8-post-validation-status.log`
- `reports/m8-validation-summary.md`
- `reports/final-validation-summary.md`

## Changed-file classification

### Source contract changes

- `packages/contracts/src/http/index.ts`
- `packages/contracts/src/http/response.ts`
- `packages/contracts/src/index.ts`
- `packages/contracts/src/preferences.ts`
- `packages/contracts/src/routing.ts`

### App compatibility/facade changes

- `packages/vue-app-platform/src/index.ts`
- `packages/vue-app-platform/src/routeAccess.ts`
- `packages/vue-app-platform/src/routeAccess.spec.ts`
- `apps/web-demo/src/router/utils/accessControl.ts`
- `apps/web-demo/src/api/auth/auth.api.ts`
- `apps/web-demo/src/api/example/users.ts`
- `apps/web-demo/src/api/example/users.spec.ts`
- `apps/web-demo/src/api/system/preferences.api.ts`
- `apps/web-demo/src/api/system/system.api.ts`
- `apps/web-demo/src/hooks/modules/useSystemPreferencesSync.ts`
- `apps/web-demo/src/sync/systemPreferences/guards.ts`
- `apps/web-demo/src/sync/systemPreferences/guards.spec.ts`
- `apps/web-demo/src/sync/systemPreferences/localPersist.ts`
- `apps/web-demo/src/sync/systemPreferences/model.ts`
- `apps/web-demo/src/sync/systemPreferences/register.ts`
- `apps/web-demo/src/sync/systemPreferences/runtime.ts`
- `apps/web-demo/src/types/api.ts`
- `apps/web-demo/src/types/systems/preferences.ts`
- `apps/web-demo/src/utils/http/requestLayer.spec.ts`
- `apps/web-demo/src/utils/http/types.ts`
- `apps/web-demo/src/views/example/common/types.vue`

### Generated/governance changes

- `.ai/manifests/rule-index.json`
- `apps/web-demo/src/types/auto-imports.d.ts`
- `docs/generated/api-surface-report.json`
- `docs/generated/api-surface-report.md`
- `scripts/ai-architecture-guard.mjs`

### AI adapter materialization

- No root AI adapter file is dirty in the final diff.
- `AGENTS.md`, `CLAUDE.md`, and `.ai/protocol/adapters/**` are present but not changed in the current dirty set.
- M4 adapter materialization evidence is inside the plan package and command logs.

### Evidence/plan package

- `ccd-public-layer-repair-plan-package/**`

Observed package size and shape:

- Size: approximately `9.8M`
- File count: `688`
- Includes plan docs, active evidence, command logs, diffs, artifacts, and a timestamped evidence-dir template.
- Important git visibility note: `.gitignore:118` contains `reports/`, so files under active evidence `reports/` are ignored by default, including this review packet. A future human staging step must either intentionally force-add the needed report files or adjust evidence placement/policy before committing. No staging was performed in this review.

### Accidental or unexpected files

- `docs/ai-runs/20260602-140000-ccd-public-layer-repair-m2-api-dto-contract-normalization/**`

Reason: this root-level untracked evidence directory is not the active M8 package evidence directory and is not referenced by the final M8 package status. It appears to be a prior failed/scope-blocked evidence shard. Recommendation: do not include it in the M8 commit set unless a reviewer explicitly decides it is needed for traceability.

## Plan package commit decision

Recommendation: commit `ccd-public-layer-repair-plan-package/` fully if the branch is accepted as an evidence-backed M8 delivery package.

Trade-offs:

- Full commit preserves the evidence chain referenced by `STATUS.md`, `FINAL_VALIDATION_MATRIX.md`, `OPERATOR_SOP.md`, and `RISK_REGISTER.md`.
- Full commit adds bulk: about `9.8M` and `688` files.
- Full commit is not a plain `git add ccd-public-layer-repair-plan-package/` operation if ignored `reports/` evidence must be included; those files are ignored by the repository-level `reports/` rule.
- Partial commit reduces repository noise, but risks broken evidence paths and weakens the stated "DONE requires evidence" policy.
- Excluding the package keeps the implementation diff smaller, but leaves the branch without the M8 review/certification artifact set that justifies `GO_READY_FOR_HUMAN_REVIEW`.

If repository policy rejects large command-log bundles, the safer partial alternative is:

1. Commit `ccd-public-layer-repair-plan-package/docs/ai-plan/**`.
2. Commit summarized reports under `ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/**`.
3. Commit only validation-critical command logs referenced by `FINAL_VALIDATION_MATRIX.md`.
4. Exclude template `.gitkeep` placeholders and older noncritical artifacts only after updating all references.

That partial path requires doc/reference cleanup before commit. Without that cleanup, partial inclusion is riskier than full inclusion.

## Commit conventions inspected

Sources inspected:

- `commitlint.config.ts`
- `package.json`
- Recent `git log --oneline -12`

Observed convention:

- Conventional Commits format: `<type>(<scope>): <subject>`.
- Allowed types include `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `wip`, `release`, `workflow`, and `types`.
- Scope is optional but must be lowercase when present.
- Chinese subjects are allowed by config.
- Recent commits use examples such as `docs(architecture): ...`, `docs: ...`, `refactor: ...`, and `chore: ...`.

## Proposed commit split plan

Do not commit during this review step.

### Commit 1

```text
feat(contracts): 添加公共层路由偏好与响应信封契约

引入 route/menu/access、system preferences 与 backend response envelope 的 type-only contract。
保持 @ccd/contracts runtime-neutral，不引入 app runtime、schema runtime、storage 或 router 依赖。
```

Suggested files:

- `packages/contracts/src/http/index.ts`
- `packages/contracts/src/http/response.ts`
- `packages/contracts/src/index.ts`
- `packages/contracts/src/preferences.ts`
- `packages/contracts/src/routing.ts`

### Commit 2

```text
refactor(platform): 迁移路由访问纯 helper 到平台包

将 route access、whitelist、safe redirect 与 menu access 纯逻辑迁移到 @ccd/vue-app-platform。
保留行为语义并补充平台包 focused tests。
```

Suggested files:

- `packages/vue-app-platform/src/index.ts`
- `packages/vue-app-platform/src/routeAccess.ts`
- `packages/vue-app-platform/src/routeAccess.spec.ts`

### Commit 3

```text
refactor(web-demo): 接入公共契约并保留应用兼容门面

让 web-demo API、HTTP、preferences 与 accessControl facade 消费新的公共契约和平台 helper。
保留原 app import surface，避免运行时行为变化。
```

Suggested files:

- `apps/web-demo/src/api/auth/auth.api.ts`
- `apps/web-demo/src/api/example/users.ts`
- `apps/web-demo/src/api/example/users.spec.ts`
- `apps/web-demo/src/api/system/preferences.api.ts`
- `apps/web-demo/src/api/system/system.api.ts`
- `apps/web-demo/src/hooks/modules/useSystemPreferencesSync.ts`
- `apps/web-demo/src/router/utils/accessControl.ts`
- `apps/web-demo/src/sync/systemPreferences/guards.ts`
- `apps/web-demo/src/sync/systemPreferences/guards.spec.ts`
- `apps/web-demo/src/sync/systemPreferences/localPersist.ts`
- `apps/web-demo/src/sync/systemPreferences/model.ts`
- `apps/web-demo/src/sync/systemPreferences/register.ts`
- `apps/web-demo/src/sync/systemPreferences/runtime.ts`
- `apps/web-demo/src/types/api.ts`
- `apps/web-demo/src/types/systems/preferences.ts`
- `apps/web-demo/src/utils/http/requestLayer.spec.ts`
- `apps/web-demo/src/utils/http/types.ts`
- `apps/web-demo/src/views/example/common/types.vue`

### Commit 4

```text
workflow(governance): 加强公共层边界守卫并同步生成输出

新增 route access helper ownership 与 ambiguous ApiResponse guard。
同步 rule index、auto imports 与 API surface generated reports。
```

Suggested files:

- `scripts/ai-architecture-guard.mjs`
- `.ai/manifests/rule-index.json`
- `apps/web-demo/src/types/auto-imports.d.ts`
- `docs/generated/api-surface-report.json`
- `docs/generated/api-surface-report.md`

### Commit 5

```text
docs: 添加公共层修复 M8 review evidence package

记录 M1-M8 计划、验证矩阵、风险、操作 SOP、最终 GO_READY_FOR_HUMAN_REVIEW 状态与人工 review packet。
保留 active evidence、command logs、diffs 与 artifacts 以支撑人工复核。
```

Suggested files:

- `ccd-public-layer-repair-plan-package/**`

Reviewer decision before this commit:

- Prefer full package commit for evidence integrity.
- Exclude `docs/ai-runs/20260602-140000-ccd-public-layer-repair-m2-api-dto-contract-normalization/**` unless explicitly accepted as extra historical evidence.

## Minimal validation run during this review

```text
git diff --check
```

Result: pass, no output.

```text
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml
```

Result: pass, empty output.

No full final ladder was rerun during this review, per instruction.

## Residual review risks

- The final implementation/evidence remains dirty and uncommitted by design.
- `ccd-public-layer-repair-plan-package/**` is large; human reviewer should decide whether evidence policy justifies committing the full package.
- Active evidence `reports/` files are ignored by `.gitignore`; this packet exists on disk but is not visible in ordinary `git status` untracked output.
- Root `docs/ai-runs/20260602-140000-ccd-public-layer-repair-m2-api-dto-contract-normalization/**` is not part of the M8 active evidence package and should be excluded unless explicitly accepted.
- Generated diffs are attributed to owning commands by M8 artifacts, but still need human review.
