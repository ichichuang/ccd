# M0 Repository Baseline

## Stack and Package Manager

- Workspace root: `/Users/cc/MyPorject/ccd`
- Package manager: `pnpm@10.28.2`
- Node runtime observed: `v24.11.1`
- Root package: `ccd@1.0.38`
- Monorepo layout: `apps/*`, `packages/*`
- Build orchestrator: Turbo via `turbo run type-check` and related scripts.
- Primary frontend stack observed: Vue 3, TypeScript, Vite 7, UnoCSS, PrimeVue 4, Pinia, Vue Router, Vitest, Playwright.

Evidence:

- `command-logs/runtime-versions.log`
- `command-logs/script-inventory-rerun.log`
- `command-logs/workspace-list-depth0-rerun.log`
- `command-logs/workspace-config.log`
- `command-logs/config-file-inventory.log`

## Script Inventory Highlights

Confirmed expected scripts exist:

- `pnpm ci:smoke:packages`
- `pnpm type-check`
- `pnpm lint:check`
- `pnpm test:run`
- `pnpm arch:boundaries`
- `pnpm arch:runtime`
- `pnpm ai:guard`
- `pnpm drift-check`
- `pnpm validate:governance`
- `pnpm build:web-demo`
- `pnpm build:desktop`
- `pnpm validate`

Also observed governance/protocol scripts:

- `pnpm governance:gate`
- `pnpm governance:full`
- `pnpm api:report`
- `pnpm supply:check`
- `pnpm codex:preflight`
- `pnpm ai:doctor`
- `pnpm ai:sync`
- `pnpm ai:sync:codex`

Evidence:

- `command-logs/script-inventory-rerun.log`
- `command-logs/governance-script-inventory.log`

## Rule and Skill Routing Evidence

Loaded before source changes:

- `AGENTS.md`
- every file under `docs/ai-plan/`
- `.ai/protocol/AGENTS.core.md`
- `.ai/rules/core/00-global-architect.mdc`
- `.ai/rules/core/00-root-gatekeeper.mdc`
- `.ai/rules/core/01-global-preflight.mdc`
- `.ai/rules/core/02-ui-preflight.mdc`
- `.ai/rules/core/10-ai-generation-workflow.mdc`
- `.ai/runtime/repair_list.md`

Repo-local skill router result:

- Selected `.ai/skills/codex/task-orchestrator`
- Selected `.ai/skills/core/vite`
- Precheck suggested: `pnpm codex:preflight`

Evidence:

- `command-logs/skill-router.log`

## Current Workspace Risk

The workspace is dirty before implementation. M0 can continue as evidence-only work, but source implementation should not begin until the operator approves continuing in this dirty `main` working tree or provides an isolated worktree.

Evidence:

- `command-logs/git-status-short-rerun.log`
- `command-logs/git-diff-name-only-rerun.log`
