# Claude AI Adapter Guide

## Discovery Entry

- Claude AI reads root CLAUDE.md when present.
- In this repo, CLAUDE.md is a generated pointer to AGENTS.md.
- AGENTS.md remains the shared generated entrypoint from .ai/protocol/AI.entry.md.
- Generic UI evidence routes through the same project-ui Skill ID used by Codex.

## Canonical Entrypoint

- AGENTS.md

## Protocol Load Order

1. .ai/protocol/AGENTS.core.md
2. .ai/rules/core/00-global-architect.mdc
3. .ai/rules/core/00-root-gatekeeper.mdc
4. .ai/rules/core/01-global-preflight.mdc
5. .ai/rules/core/02-ui-preflight.mdc when visual surfaces are touched
6. .ai/rules/core/10-ai-generation-workflow.mdc when creating or restructuring routes/pages/hooks
7. Domain rules under .ai/rules/\*\*

## Capability Boundary

- Capabilities: implementation, architecture, planning, governance, project-ui.
- Projection rules: CLAUDE-pointer-to-AGENTS, project-ui-routing-enabled, shared-entrypoint.
- Canonical repository policy remains owned by .ai/protocol/AGENTS.core.md.

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

- pnpm governance:full
- pnpm arch:check
- pnpm ai:sync
- pnpm ai:sync:claude
- pnpm ai:sync:skills
- pnpm ai:routing:validate
- pnpm ai:doctor
- pnpm env:doctor

Generated from:

- .ai/protocol/adapter-manifest.json
