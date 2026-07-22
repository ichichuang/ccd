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
4. `.ai/rules/core/10-ai-generation-workflow.mdc` for new routes, pages, or hooks
5. Matching domain rules under `.ai/rules/**`
6. `.ai/rules/ui/00-project-ui-entry.mdc` for UI-scoped work

## Skills and validation

- Repository architecture and safety rules remain mandatory for every task.
- Before any UI implementation, modification, refactor, review, route or page creation, visual, layout, component, theme, responsive, accessibility, interaction, chart presentation, styling, or motion work, load `.ai/skills/project-ui/SKILL.md`.
- `.ai/skills/project-ui/SKILL.md` is the highest UI-specific authority. Framework and platform skills, including Vue, UnoCSS, Vite, and desktop skills, are supplemental only and do not override it.
- Detailed UI guidance belongs only in `.ai/skills/project-ui/SKILL.md` and `.ai/skills/project-ui/references/**`; no other file may claim to be the UI source of truth.
- Generated adapters and synchronized client copies are non-authoritative pointers to this protocol and UI authority.
- Explicit GitHub work routes to the matching skill.
- Use `node .ai/skills/codex/task-orchestrator/scripts/skill_router.mjs "<task>" --json` for deterministic routing.
- Use `python3 .ai/skills/codex/task-orchestrator/scripts/skill_router.py "<task>" --json` only when Node is unavailable.

Production validation commands are `pnpm type-check`, `pnpm lint:check`, `pnpm arch:boundaries`, `pnpm arch:runtime`, `pnpm build:web-demo`, and `pnpm build:desktop`.
