# Claude AI Adapter Guide

## Discovery Entry

- Claude AI reads root CLAUDE.md when present.
- In this repo, CLAUDE.md is a generated pointer to AGENTS.md.
- AGENTS.md remains the shared generated entrypoint from .ai/protocol/AI.entry.md.

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

- Capabilities: implementation, architecture, planning, governance.
- Projection rules: CLAUDE-pointer-to-AGENTS, shared-entrypoint.
- Canonical repository policy remains owned by .ai/protocol/AGENTS.core.md.

## Health Commands

- pnpm governance:full
- pnpm arch:check
- pnpm ai:sync
- pnpm ai:doctor
- pnpm env:doctor

Generated from:

- .ai/protocol/adapter-manifest.json
