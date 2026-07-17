# AI Entry (Unified)

Canonical AI protocol is:

- .ai/protocol/AGENTS.core.md

Load this entrypoint, then continue with:

1. .ai/protocol/AGENTS.core.md
2. .ai/rules/core/00-global-architect.mdc
3. .ai/rules/core/00-root-gatekeeper.mdc
4. .ai/rules/core/01-global-preflight.mdc
5. .ai/rules/core/02-ui-preflight.mdc when visual surfaces are touched
6. .ai/rules/core/10-ai-generation-workflow.mdc when creating or restructuring routes/pages/hooks
7. Domain rules under .ai/rules/\*\*

This file is the shared entrypoint target for:

- AGENTS.md for Codex and other AGENTS-aware agent CLIs
- CLAUDE.md for Claude AI, pointing to AGENTS.md

Per-AI adapter guidance:

- Codex: .ai/protocol/adapters/codex.md
- Claude: .ai/protocol/adapters/claude.md

Current repo defaults:

- Treat this repository as a governed deterministic pnpm + Turbo monorepo.
- Active topology is packages/contracts -> packages/core -> apps/\*.
- packages/contracts contains interfaces and shared types only.
- packages/core must remain runtime-neutral and may depend only on @ccd/contracts.
- Runtime APIs must be adapter-injected from apps/web-demo/src/adapters/\*\* or apps/desktop/src/adapters/\*\*.
- For desktop/Tauri work, keep @tauri-apps imports and invoke() inside apps/desktop/src/adapters/\*\*.
- Use governance commands: pnpm governance:full, pnpm arch:runtime, pnpm api:report, and pnpm supply:check.

Core mandate:

- .ai/\*\* is the only source of truth for AI governance.
- Adapter paths (AGENTS.md, CLAUDE.md) are generated compatibility entrypoints only.
- Materialize repo adapters with pnpm ai:sync; synchronize Skills with pnpm ai:sync:codex, pnpm ai:sync:claude, or pnpm ai:sync:skills.
- Repository .ai/skills/\*\* sources are canonical; synchronized client copies are noncanonical materializations.
- For new runtime capabilities, add contracts first, implement core logic runtime-neutrally, then inject app adapters.

Deterministic Skill routing:

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

Generated from:

- .ai/protocol/adapter-manifest.json
