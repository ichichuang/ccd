# AGENTS Entry (CCD)

Canonical protocol: `.ai/protocol/AGENTS.core.md`.

All agents must load and follow that file before any implementation.

Quick mandates:
- Rules first, then skills.
- Keep strict layer boundaries and type safety.
- Reuse existing architecture assets before creating new abstractions.
- Use `repair_list.txt` (alias) as the runtime ledger for large refactors.
