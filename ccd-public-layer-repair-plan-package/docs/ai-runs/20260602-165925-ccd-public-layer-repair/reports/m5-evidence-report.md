# M5 Initial Required Checks

## Command: pwd
/Users/cc/MyPorject/ccd-public-layer-repair-m1

## Command: git branch --show-current
codex/public-layer-repair-m1

## Command: git rev-parse HEAD
343a540a92b8a1bd5e8bb86eec7772f15946aab1

## Command: git status --short
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

## Command: git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml

## Command: git status --short -- .ai AGENTS.md CLAUDE.md .vscode
 M .ai/manifests/rule-index.json

## Command: test -f AGENTS.md
PASS AGENTS.md exists

## Command: test -f CLAUDE.md
PASS CLAUDE.md exists

## Command: test -f .ai/protocol/adapters/claude.md
PASS .ai/protocol/adapters/claude.md exists

## M5 Scope Gate

Approval ID: `M5-PLAN-SCOPE-EXECUTION-APPROVED`

Exact PLAN.md M5 title:

`Milestone M5 — Sync runtime owner decision and optional extraction plan`

Exact PLAN.md M5 purpose:

Decide whether sync runtime should remain app-owned or move to a new/public runtime owner in a future approved lane.

Exact PLAN.md M5 scope:

Produce an owner decision and, only if approved without manifest risk, implement a minimal extraction of transport-agnostic pure sync types/helpers. Otherwise classify as deferred.

Exact PLAN.md M5 out-of-scope:

No new package creation, manifest edits, lockfile edits, external WebSocket access, or broad sync runtime rewrite without approval.

Scope assessment:

- M1-T03, M2, M3, and M4 completion evidence is present in `STATUS.md`.
- `m4-validation-summary.md` records passing validation, including final `validate:governance` rerun after generated updates.
- `m4-adapter-materialization-and-scope.md` records `M4-AI-ADAPTER-MATERIALIZATION-APPROVED`, `pnpm ai:sync` PASS, `pnpm ai:doctor` PASS, `pnpm codex:preflight` PASS, and materialization diff evidence.
- Required adapter files exist: `AGENTS.md`, `CLAUDE.md`, and `.ai/protocol/adapters/claude.md`.
- PLAN.md M5 does not require dependency changes, lockfile changes, new package creation, production config changes, destructive git operations, broad rewrites, generated manual edits, or runtime behavior changes outside the approved narrow scope.
- Current M5 owner decision remains `DEFERRED`; no sync runtime extraction is approved.

Evidence:

- `../command-logs/000-m5-initial-required-checks.log`
- `../command-logs/003-targeted-milestone-status-plan.log`
- `../command-logs/004-read-current-m5-report-and-plan-scope.log`
- `../command-logs/005-read-existing-m5-evidence.log`
