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

- Treat this repository as Vue 3 + TypeScript + Vite + UnoCSS + PrimeVue + Playwright.
- Treat desktop-runtime changes as Tauri v2 + guest bindings bridge work; route to .ai/skills/codex/desktop-tauri-guard.
- Prefer Playwright CLI plus .ai/skills/codex/architecture-browser-master.
- Prefer Playwright CRX for recording browser flows, then import the exported Python into .ai/skills/codex/architecture-browser-master flow assets.
- For desktop/Tauri-scoped changes on main, run pnpm sync:desktop-config, then pnpm drift-check.
- Keep user-facing pages within Lighthouse 90+ budgets unless the task explicitly says otherwise.

Core mandate:

- .ai/\*\* is the only source of truth.
- Adapter paths (AGENTS.md, CLAUDE.md) are generated compatibility entrypoints only.
- Materialize repo adapters with pnpm ai:sync and local Codex skills with pnpm ai:sync:codex.
- For new page/route work, scaffold first with pnpm ai:scaffold:view-route, then enforce pnpm ai:guard.

Generated from:

- .ai/protocol/adapter-manifest.json
