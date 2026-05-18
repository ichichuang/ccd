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
- legacy/\*\* is a read-only archive and must never re-enter active dependency graphs.
- For desktop/Tauri work, keep @tauri-apps imports and invoke() inside apps/desktop/src/adapters/\*\*.
- Use governance commands: pnpm governance:full, pnpm arch:runtime, pnpm api:report, and pnpm supply:check.

Core mandate:

- .ai/\*\* is the only source of truth for AI governance.
- Adapter paths (AGENTS.md, CLAUDE.md) are generated compatibility entrypoints only.
- Materialize repo adapters with pnpm ai:sync and local Codex skills with pnpm ai:sync:codex.
- Keep package imports on public exports only; no deep imports, cross-app imports, or legacy imports.
- For new runtime capabilities, add contracts first, implement core logic runtime-neutrally, then inject app adapters.

Generated from:

- .ai/protocol/adapter-manifest.json
