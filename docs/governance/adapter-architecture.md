# Adapter Architecture

Adapters are protocol projection targets, not canonical prompt sources. CCD keeps all AI-runtime instructions under `.ai/**` and materializes compatibility entrypoints only when sync commands run.

## Canonical Source

- `.ai/protocol/AGENTS.core.md` — shared execution protocol.
- `.ai/protocol/adapter-manifest.json` — projection manifest, load order, adapter metadata, and health commands.
- `.ai/protocol/version.json` — compatibility version contract.
- `.ai/rules/**` — architecture and implementation laws.
- `.ai/skills/**` — local skill catalogs and operational workflows.

## Generated Projection Targets

| Target                            | Purpose                                                      | Source                               |
| --------------------------------- | ------------------------------------------------------------ | ------------------------------------ |
| `AGENTS.md`                       | Shared entrypoint for Codex and AGENTS-aware tools           | `.ai/protocol/AI.entry.md`           |
| `CLAUDE.md`                       | Claude pointer to the shared AGENTS entrypoint               | `.ai/protocol/adapter-manifest.json` |
| `.ai/protocol/adapters/codex.md`  | Codex-specific discovery, skill mapping, and health commands | `.ai/protocol/adapter-manifest.json` |
| `.ai/protocol/adapters/claude.md` | Claude-specific discovery and health commands                | `.ai/protocol/adapter-manifest.json` |
| `~/.codex/skills/**`              | Local Codex skill materialization                            | `.ai/skills/**`                      |

Generated adapter files are reviewable outputs, but `.ai/**` remains the only source of truth.

## Adapter Interface

Each adapter declares:

- capability matrix
- compatible protocol and adapter versions
- projection rules
- validation hooks
- discovery entrypoints
- health commands

## Change Rules

- Add or edit adapter behavior in `.ai/protocol/adapter-manifest.json` first.
- Keep `protocolVersions` aligned with `.ai/protocol/version.json`.
- Regenerate projections through `pnpm ai:sync`.
- Validate compatibility through `pnpm adapters:validate`.
- Do not manually diverge `AGENTS.md`, `CLAUDE.md`, or generated adapter docs.

## Current Targets

- Codex
- Claude

Future AI runtimes should be added by extending `adapterGuides` and `adapterMetadata`, then reusing the same projection and validation pipeline.

## Validation

```bash
pnpm ai:sync
pnpm adapters:validate
pnpm governance:validate
```
