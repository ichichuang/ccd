# Commit Readiness Preflight

- Approval ID: `FINAL-COMMIT-READINESS-REPORT-REGENERATE-APPROVED`
- Generated at: `2026-06-03T10:56:30+0800`
- Worktree: `/Users/cc/MyPorject/ccd-public-layer-repair-m1`
- Branch: `codex/public-layer-repair-m1`
- HEAD: `343a540a`
- Scope: regenerate this report from current isolated worktree state only. No staging, commit, push, merge, reset, clean, restore, rebase, source edit, generated-file manual edit, `.gitignore` edit, package manifest edit, or lockfile edit was performed.

## Source Of Truth Note

The previous `commit-readiness-preflight.md` existed only in quarantine:

```text
/Users/cc/MyPorject/ccd-main-worktree-miswrite-quarantine-20260603-residue/ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/commit-readiness-preflight.md
```

That quarantined file was checked for existence only. It was not copied back into the repository and is not used as the source of truth for this regenerated report.

## Required Preflight Evidence

```text
pwd
/Users/cc/MyPorject/ccd-public-layer-repair-m1

git branch --show-current
codex/public-layer-repair-m1

git rev-parse --short HEAD
343a540a
```

`git status --short`:

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

`git diff --stat`:

```text
 .ai/manifests/rule-index.json                      |  16 +-
 apps/web-demo/src/api/auth/auth.api.ts             |   4 +-
 apps/web-demo/src/api/example/users.spec.ts        |   6 +-
 apps/web-demo/src/api/example/users.ts             |   6 +-
 apps/web-demo/src/api/system/preferences.api.ts    |   2 +-
 apps/web-demo/src/api/system/system.api.ts         |   2 +-
 .../src/hooks/modules/useSystemPreferencesSync.ts  |   2 +-
 apps/web-demo/src/router/utils/accessControl.ts    | 219 +++------------------
 apps/web-demo/src/sync/systemPreferences/guards.ts |   2 +-
 .../src/sync/systemPreferences/localPersist.ts     |   2 +-
 apps/web-demo/src/sync/systemPreferences/model.ts  |   2 +-
 .../src/sync/systemPreferences/register.ts         |   2 +-
 .../web-demo/src/sync/systemPreferences/runtime.ts |   2 +-
 apps/web-demo/src/types/api.ts                     |  12 +-
 apps/web-demo/src/types/auto-imports.d.ts          |  31 +--
 apps/web-demo/src/types/systems/preferences.ts     |  25 +--
 apps/web-demo/src/utils/http/requestLayer.spec.ts  |   2 +-
 apps/web-demo/src/utils/http/types.ts              |   2 +-
 apps/web-demo/src/views/example/common/types.vue   |  19 +-
 docs/generated/api-surface-report.json             |  24 ++-
 docs/generated/api-surface-report.md               |   4 +-
 packages/contracts/src/http/index.ts               |   6 +-
 packages/contracts/src/http/response.ts            |   6 +
 packages/contracts/src/index.ts                    |  17 ++
 packages/vue-app-platform/src/index.ts             |  11 ++
 scripts/ai-architecture-guard.mjs                  |  44 +++++
 26 files changed, 187 insertions(+), 283 deletions(-)
```

`git diff --name-status`:

```text
M	.ai/manifests/rule-index.json
M	apps/web-demo/src/api/auth/auth.api.ts
M	apps/web-demo/src/api/example/users.spec.ts
M	apps/web-demo/src/api/example/users.ts
M	apps/web-demo/src/api/system/preferences.api.ts
M	apps/web-demo/src/api/system/system.api.ts
M	apps/web-demo/src/hooks/modules/useSystemPreferencesSync.ts
M	apps/web-demo/src/router/utils/accessControl.ts
M	apps/web-demo/src/sync/systemPreferences/guards.ts
M	apps/web-demo/src/sync/systemPreferences/localPersist.ts
M	apps/web-demo/src/sync/systemPreferences/model.ts
M	apps/web-demo/src/sync/systemPreferences/register.ts
M	apps/web-demo/src/sync/systemPreferences/runtime.ts
M	apps/web-demo/src/types/api.ts
M	apps/web-demo/src/types/auto-imports.d.ts
M	apps/web-demo/src/types/systems/preferences.ts
M	apps/web-demo/src/utils/http/requestLayer.spec.ts
M	apps/web-demo/src/utils/http/types.ts
M	apps/web-demo/src/views/example/common/types.vue
M	docs/generated/api-surface-report.json
M	docs/generated/api-surface-report.md
M	packages/contracts/src/http/index.ts
M	packages/contracts/src/http/response.ts
M	packages/contracts/src/index.ts
M	packages/vue-app-platform/src/index.ts
M	scripts/ai-architecture-guard.mjs
```

Protected manifest diff result:

```text
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml
<empty>
```

Staged files check:

```text
git diff --cached --name-only
<empty>
```

Final M8 closeout files exist:

- `ccd-public-layer-repair-plan-package/docs/ai-plan/STATUS.md`
- `ccd-public-layer-repair-plan-package/docs/ai-plan/FINAL_GO_NO_GO.md`
- `ccd-public-layer-repair-plan-package/docs/ai-plan/FINAL_VALIDATION_MATRIX.md`
- `ccd-public-layer-repair-plan-package/docs/ai-plan/CHANGE_SUMMARY.md`
- `ccd-public-layer-repair-plan-package/docs/ai-plan/NEXT_ACTIONS.md`
- `ccd-public-layer-repair-plan-package/docs/ai-plan/OPERATOR_SOP.md`
- `ccd-public-layer-repair-plan-package/docs/ai-plan/RISK_REGISTER.md`

Final state evidence:

- `STATUS.md` records `Overall status: DONE`, current milestone `M8`, and final completion state `GO_READY_FOR_HUMAN_REVIEW`.
- `FINAL_GO_NO_GO.md` records current state `GO_READY_FOR_HUMAN_REVIEW`.

## Changed-File Inventory

### Source Contract Changes

- `packages/contracts/src/routing.ts`
- `packages/contracts/src/preferences.ts`
- `packages/contracts/src/http/response.ts`
- `packages/contracts/src/http/index.ts`
- `packages/contracts/src/index.ts`

### App Compatibility And Facade Changes

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

### Platform Helper Changes

- `packages/vue-app-platform/src/routeAccess.ts`
- `packages/vue-app-platform/src/routeAccess.spec.ts`
- `packages/vue-app-platform/src/index.ts`

### Generated And Governance Changes

- `.ai/manifests/rule-index.json`
- `apps/web-demo/src/types/auto-imports.d.ts`
- `docs/generated/api-surface-report.json`
- `docs/generated/api-surface-report.md`
- `scripts/ai-architecture-guard.mjs`

### AI Adapter Materialization

No current root-level AI adapter materialization files have a git diff in the isolated worktree:

- `.ai/protocol/AI.entry.md`
- `.ai/protocol/adapters/README.md`
- `.ai/protocol/adapters/codex.md`
- `.ai/protocol/adapters/claude.md`
- `AGENTS.md`
- `CLAUDE.md`
- `.ai/manifests/unocss-semantic-shortcuts.json`
- `.vscode/unocss-semantic-shortcuts.html-data.json`
- `.vscode/unocss-semantic-shortcuts.code-snippets`

The evidence package still records the AI adapter materialization workflow and related validation.

### Evidence And Plan Package

- `ccd-public-layer-repair-plan-package/**`
- Current package file count: `691` files.
- Active reports count: `48` files.
- Active command logs count: `607` files.

Key active reports that must be present for the evidence commit:

- `final-human-review-packet.md`
- `final-validation-summary.md`
- `m8-validation-summary.md`
- `quarantine-audit.md`
- `main-residue-quarantine-audit.md`
- `commit-readiness-preflight.md`

### Excluded And Unexpected Files

Explicitly excluded from the commit set:

```text
docs/ai-runs/20260602-140000-ccd-public-layer-repair-m2-api-dto-contract-normalization/**
```

This inactive accidental evidence directory remains untracked and must not be staged without a separate approval.

Explicitly excluded from the commit set:

```text
/Users/cc/MyPorject/ccd-main-worktree-miswrite-quarantine-20260603-commit-readiness/**
/Users/cc/MyPorject/ccd-main-worktree-miswrite-quarantine-20260603-residue/**
```

All quarantine paths are outside the repository and must not be copied back, staged, or committed.

## Ignored Active Reports

The active reports path is ignored by the repository-level `reports/` rule:

```text
.gitignore:118:reports/ ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/commit-readiness-preflight.md
```

Evidence commit must use `git add -f` for:

```text
ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/
```

Do not edit `.gitignore`.

## Final Recommended Commit Split

Create exactly three commits.

Because `packages/contracts/src/index.ts` contains route exports and HTTP/preferences exports in one hunk, it must be staged by patch. If the hunk cannot be safely split, stop with `BLOCKED_BY_UNSAFE_COMMIT_SPLIT` rather than mixing commit scopes.

### Commit 1: Public Route Contract And Route Access Helper

Files:

- `packages/contracts/src/routing.ts`
- `packages/contracts/src/index.ts` route export block only
- `packages/vue-app-platform/src/routeAccess.ts`
- `packages/vue-app-platform/src/routeAccess.spec.ts`
- `packages/vue-app-platform/src/index.ts`
- `apps/web-demo/src/router/utils/accessControl.ts`

Commit message:

```text
feat: 抽离路由访问控制公共契约与纯工具

本次变更将 apps/web-demo 中可复用的路由访问控制能力拆分到受治理的公共层，降低 app-local 公共封装残留风险。

主要变更：
- 在 @ccd/contracts 中新增路由、菜单、访问控制相关 type-only 契约。
- 在 @ccd/vue-app-platform 中新增 routeAccess 纯工具与单元测试。
- 保留 apps/web-demo 的 accessControl 兼容 facade，避免破坏历史导入路径。
- 更新 @ccd/vue-app-platform public exports。

验证：
- pnpm --filter @ccd/contracts type-check/test/build 已在 M1/M8 验证链中通过。
- pnpm --filter @ccd/vue-app-platform type-check/build 已在 M2/M8 验证链中通过。
- pnpm type-check、lint:check、test:run、arch:boundaries、arch:runtime、ai:guard、drift-check、validate:governance 均在最终验证链中通过。

残余风险：
- 本次仅迁移纯函数和 type-only 契约。
- router singleton、route table、store、i18n、logger、window/BroadcastChannel 行为仍保持 app-owned。
- 后续扩展 route/menu contract 时仍需保持 runtime-neutral 边界。
```

### Commit 2: API/DTO And System Preferences Contract Normalization

Files:

- `packages/contracts/src/http/response.ts`
- `packages/contracts/src/http/index.ts`
- `packages/contracts/src/preferences.ts`
- `packages/contracts/src/index.ts` HTTP/preferences export changes only
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

Commit message:

```text
feat: 收敛 API 响应与系统偏好公共类型契约

本次变更将 API 响应 envelope 与系统偏好同步 payload 的可共享类型抽离到 @ccd/contracts，解决 app 内同名不同义类型和跨模块契约漂移问题。

主要变更：
- 在 @ccd/contracts 中新增 HTTP response/envelope 类型。
- 在 @ccd/contracts 中新增 system preferences type-only 契约。
- 调整 apps/web-demo 中 API response 命名，区分后端响应 envelope 与 HTTP client runtime 类型。
- 更新 systemPreferences sync guards、model、register、runtime、localPersist、hook 与 API 层类型引用。
- 保留 Zod schema、sync runtime、BroadcastChannel/WebSocket、Pinia store、safeStorage 等 app-owned runtime 行为。

验证：
- pnpm --filter @ccd/contracts type-check/test/build 已通过。
- pnpm test:run 通过 83 files / 474 tests。
- pnpm type-check、lint:check、arch:boundaries、arch:runtime、ai:guard、drift-check、validate:governance 均通过。
- package.json、pnpm-lock.yaml、pnpm-workspace.yaml 无 diff。

残余风险：
- Zod schema 未迁移到 @ccd/contracts。
- 后续若需要 schema 共享，应单独审批 schema owner 与 dependency 策略。
- Sync runtime extraction 仍为 DEFERRED，未来需要独立 owner/package/dependency/manifest 审批。
```

### Commit 3: Governance, Generated Outputs, And Evidence

Files:

- `scripts/ai-architecture-guard.mjs`
- `.ai/manifests/rule-index.json`
- `apps/web-demo/src/types/auto-imports.d.ts`
- `docs/generated/api-surface-report.json`
- `docs/generated/api-surface-report.md`
- `ccd-public-layer-repair-plan-package/**`

Commit message:

```text
chore: 更新公共层修复治理报告与执行证据

本次变更同步公共层修复的治理产物、AI adapter materialization 证据、generated outputs 与完整执行证据，确保 M1-M8 长周期修复过程可审计、可复核、可回滚。

主要变更：
- 更新 API surface generated reports。
- 更新 auto-import generated types。
- 更新 AI/rule generated manifest。
- 收录 public-layer repair plan package、milestone evidence、validation summaries、final go/no-go、final validation matrix、risk register、operator SOP、final human review packet 与 commit-readiness audits。
- 更新 architecture guard 以覆盖本次公共层迁移后的治理边界。

验证：
- pnpm codex:preflight 通过。
- pnpm ai:guard -- --format=json 通过。
- pnpm drift-check 通过。
- pnpm validate:governance 多轮 rerun 通过，generated outputs 由 owning commands 收敛。
- git diff --check 通过。
- package.json、pnpm-lock.yaml、pnpm-workspace.yaml 无 diff。

残余风险：
- 部分 evidence reports 位于 reports/ ignore 规则覆盖的路径，提交时需通过显式 force add 纳入。
- Build/Vite extraction、sync runtime extraction、size DOM writer extraction 均保持 DEFERRED，后续重开需单独审批。
```

## Exact Proposed Git Add Commands

Do not execute these commands until staging/commit approval is active.

Commit 1:

```bash
git add packages/contracts/src/routing.ts \
  packages/vue-app-platform/src/routeAccess.ts \
  packages/vue-app-platform/src/routeAccess.spec.ts \
  packages/vue-app-platform/src/index.ts \
  apps/web-demo/src/router/utils/accessControl.ts
git add -p packages/contracts/src/index.ts
```

For `git add -p packages/contracts/src/index.ts` in Commit 1, stage only:

```ts
export type {
  BackendRouteContract,
  MenuAccessItem,
  RouteAccessMeta,
  RouteMenuNode,
  SafeRedirectResult,
} from './routing'
```

Commit 2:

```bash
git add packages/contracts/src/http/response.ts \
  packages/contracts/src/http/index.ts \
  packages/contracts/src/preferences.ts \
  apps/web-demo/src/api/auth/auth.api.ts \
  apps/web-demo/src/api/example/users.ts \
  apps/web-demo/src/api/example/users.spec.ts \
  apps/web-demo/src/api/system/preferences.api.ts \
  apps/web-demo/src/api/system/system.api.ts \
  apps/web-demo/src/hooks/modules/useSystemPreferencesSync.ts \
  apps/web-demo/src/sync/systemPreferences/guards.ts \
  apps/web-demo/src/sync/systemPreferences/guards.spec.ts \
  apps/web-demo/src/sync/systemPreferences/localPersist.ts \
  apps/web-demo/src/sync/systemPreferences/model.ts \
  apps/web-demo/src/sync/systemPreferences/register.ts \
  apps/web-demo/src/sync/systemPreferences/runtime.ts \
  apps/web-demo/src/types/api.ts \
  apps/web-demo/src/types/systems/preferences.ts \
  apps/web-demo/src/utils/http/requestLayer.spec.ts \
  apps/web-demo/src/utils/http/types.ts \
  apps/web-demo/src/views/example/common/types.vue
git add -p packages/contracts/src/index.ts
```

For `git add -p packages/contracts/src/index.ts` in Commit 2, stage:

```ts
BackendApiResponseEnvelope,
```

and:

```ts
export type {
  SystemPreferenceEnvelope,
  SystemPreferenceLayoutState,
  SystemPreferencePayload,
  SystemPreferences,
  SystemPreferenceSizeState,
  SystemPreferenceSyncType,
  SystemPreferenceThemeState,
} from './preferences'
```

Commit 3:

```bash
git add scripts/ai-architecture-guard.mjs \
  .ai/manifests/rule-index.json \
  apps/web-demo/src/types/auto-imports.d.ts \
  docs/generated/api-surface-report.json \
  docs/generated/api-surface-report.md \
  ccd-public-layer-repair-plan-package/
git add -f ccd-public-layer-repair-plan-package/docs/ai-runs/20260602-165925-ccd-public-layer-repair/reports/
```

Do not run:

```bash
git add docs/ai-runs/20260602-140000-ccd-public-layer-repair-m2-api-dto-contract-normalization/
git add /Users/cc/MyPorject/ccd-main-worktree-miswrite-quarantine-20260603-commit-readiness/
git add /Users/cc/MyPorject/ccd-main-worktree-miswrite-quarantine-20260603-residue/
git add .
git add -A
```

## Recommendation

Proceed to staging/commit only after separate explicit staging/commit approval is active.

Stop status for this regeneration step:

```text
FINAL_COMMIT_READINESS_REGENERATED
```
