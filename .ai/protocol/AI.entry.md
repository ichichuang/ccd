# AI Entry (Unified)

Canonical AI protocol is:

- `.ai/protocol/AGENTS.core.md`

This file is the shared entrypoint target for:

- `AGENTS.md` (Codex and other agent CLIs)
- `CLAUDE.md` (Claude family tools)

Per-AI adapter guidance:

- Codex: `.ai/protocol/adapters/codex.md`
- Claude: `.ai/protocol/adapters/claude.md`
- Cursor: `.ai/protocol/adapters/cursor.md`

Core mandate:

- `.ai/**` is the only source of truth.
- Adapter paths (`AGENTS.md`, `CLAUDE.md`, `.cursor/**`, `.claude/**`) are generated compatibility entrypoints only.
- Materialize adapters locally with `pnpm ai:sync`.
