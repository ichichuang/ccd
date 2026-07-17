# Claude AI Entry

Read the tracked repository AI entrypoints:

- [AGENTS.md](./AGENTS.md)
- [.ai/protocol/AGENTS.core.md](./.ai/protocol/AGENTS.core.md)
- [.ai/protocol/adapters/claude.md](./.ai/protocol/adapters/claude.md)

Do not duplicate AI protocol content here. This compatibility entry is generated from .ai/protocol/adapter-manifest.json by scripts/generate-ai-protocol-adapters.mjs.

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
