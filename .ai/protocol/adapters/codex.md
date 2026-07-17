# Codex Adapter Guide

## Discovery Entry

- Codex reads root AGENTS.md.
- In this repo, AGENTS.md is generated from .ai/protocol/AI.entry.md.

## What to Load First

1. .ai/protocol/AGENTS.core.md
2. .ai/rules/core/00-global-architect.mdc
3. .ai/rules/core/00-root-gatekeeper.mdc
4. .ai/rules/core/01-global-preflight.mdc
5. .ai/rules/core/02-ui-preflight.mdc when visual surfaces are touched
6. .ai/rules/core/10-ai-generation-workflow.mdc when creating or restructuring routes/pages/hooks
7. Domain rules under .ai/rules/\*\*

## Skill Mapping

- Generic UI authority: .ai/skills/project-ui
- Implementation: .ai/skills/core/{vue,vueuse-functions,unocss,vite}
- Design: .ai/skills/design/{ccd-product-language,ccd-page-archetypes,ccd-material-system,ccd-motion-system,ccd-gsap-motion,ccd-animate-lite,ccd-ui-review-gate}
- Orchestration: .ai/skills/codex/task-orchestrator
- Browser/E2E: .ai/skills/codex/architecture-browser-master
- Desktop/Tauri: .ai/skills/codex/desktop-tauri-guard
- GitHub/remote workflows: .ai/skills/codex/github-ops

## Auto-Trigger Hints

- Start with node .ai/skills/codex/task-orchestrator/scripts/skill_router.mjs "<task>" --json for ambiguous tasks or deterministic low-token skill selection.
- Use the Python router only as a fallback: python3 .ai/skills/codex/task-orchestrator/scripts/skill_router.py "<task>" --json.
- If the task mentions GitHub, PRs, issues, Actions, CI, releases, reviews, remote branches, or .github/\*\*, load github-ops and inspect local repo GitHub context first.
- If the task explicitly requires browser execution, screenshots, navigation validation, Playwright, or runtime inspection, load architecture-browser-master.
- Generic UI work with explicit UI evidence routes first to project-ui; use only the additional implementation or motion Skill IDs returned by the router.
- New page or route composition with explicit creation evidence routes to project-ui + task-orchestrator + vue; motion Skills require explicit engine evidence.
- UnoCSS and Vite use narrow, isolated evidence and must not be inferred from generic style, design, build, or scripts wording.
- If the task touches Tauri, desktop bridge behavior, src-tauri/\*\*, capability files, or desktop drift cleanup, load desktop-tauri-guard.
- If the task mentions Playwright CRX, recorder exports, codegen, traces, recordings, or replaying browser flows, load architecture-browser-master and prefer flow-import or flow-run.
- If the task is vague, cross-module, or likely needs staged validation, load task-orchestrator.

## Deterministic Routing and Synchronization

- Generic UI evidence routes to the stable primary Skill ID project-ui.
- New page or route composition routes to project-ui + task-orchestrator + vue when explicit creation evidence is present.
- Non-UI Vue work can route to vue without activating project-ui.
- Browser validation activates only from explicit browser, screenshot, navigation, Playwright, or runtime evidence.
- Motion Skills activate only from their own explicit engine evidence; there is no legacy generic design chain.
- Node is primary: node .ai/skills/codex/task-orchestrator/scripts/skill_router.mjs "<task>" --json.
- Python is fallback: python3 .ai/skills/codex/task-orchestrator/scripts/skill_router.py "<task>" --json.
- Validate routing with node scripts/governance/project-ui-routing-validate.mjs.
- Synchronize Codex with pnpm ai:sync:codex, Claude with pnpm ai:sync:claude, or both with pnpm ai:sync:skills.
- Repository .ai/skills/\*\* sources are canonical; synchronized Codex and Claude copies are noncanonical runtime materializations.

## Health Commands

- pnpm ai:doctor
- pnpm env:doctor
- pnpm governance:full
- pnpm arch:boundaries
- pnpm arch:runtime
- pnpm api:report
- pnpm supply:check
- pnpm arch:report
- pnpm arch:visualize
- pnpm ai:sync
- pnpm ai:sync:codex
- pnpm ai:sync:claude
- pnpm ai:sync:skills
- pnpm ai:routing:validate
- pnpm codex:preflight

Generated from:

- .ai/protocol/adapter-manifest.json
