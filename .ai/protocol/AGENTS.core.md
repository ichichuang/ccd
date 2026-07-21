# CCD Repository Protocol

## Repository model

CCD is a deterministic pnpm and Turbo monorepo. The active dependency direction is:

`packages/contracts -> packages/core -> apps/*`

- `packages/contracts` contains interfaces and shared types only.
- `packages/core` is runtime-neutral and may depend only on `@ccd/contracts`.
- Browser and desktop capabilities are injected by adapters under each app.
- Tauri imports and `invoke()` stay inside `apps/desktop/src/adapters/**`.

## Change discipline

Inspect repository state before editing, preserve unrelated work, apply the smallest viable patch, and validate the affected production surface. Do not weaken architecture, lint, type, or build checks to hide failures.

For new runtime capabilities, add contracts first, implement runtime-neutral core logic, then inject app adapters.

## Rule loading

Load these rules in order when relevant:

1. `.ai/rules/core/00-global-architect.mdc`
2. `.ai/rules/core/00-root-gatekeeper.mdc`
3. `.ai/rules/core/01-global-preflight.mdc`
4. `.ai/rules/core/02-ui-preflight.mdc` for visual changes
5. `.ai/rules/core/10-ai-generation-workflow.mdc` for new routes, pages, or hooks
6. Matching domain rules under `.ai/rules/**`

## Skills and validation

- Generic UI work routes to `project-ui`.
- Explicit Vue, UnoCSS, Vite, desktop, or GitHub work routes to the matching skill.
- Use `node .ai/skills/codex/task-orchestrator/scripts/skill_router.mjs "<task>" --json` for deterministic routing.
- Use `python3 .ai/skills/codex/task-orchestrator/scripts/skill_router.py "<task>" --json` only when Node is unavailable.

Production validation commands are `pnpm type-check`, `pnpm lint:check`, `pnpm arch:boundaries`, `pnpm arch:runtime`, `pnpm build:web-demo`, and `pnpm build:desktop`.
