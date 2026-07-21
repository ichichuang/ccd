# CCD AI Governance

`.ai/` is the canonical source for repository AI instructions.

- `protocol/AGENTS.core.md` defines the shared operating contract.
- `rules/` contains focused architecture and implementation rules.
- `skills/project-ui/` owns product UI guidance.
- `skills/codex/task-orchestrator/` provides deterministic skill routing.
- `manifests/skill-routing.json` and `manifests/routing-scopes.json` are routing authority.

Use `pnpm ai:sync` to refresh root adapters, `pnpm ai:routing:validate` to validate routing, and the client-specific sync commands to materialize repository skills.
