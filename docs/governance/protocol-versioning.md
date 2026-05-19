# Protocol Versioning

CCD protocol assets are versioned through `.ai/protocol/version.json`. This file is the source of truth for AI protocol compatibility, adapter projection compatibility, governance baseline naming, runtime-profile schema compatibility, and router schema compatibility.

## Version Fields

| Field                         | Owner                                | Meaning                                                                    |
| ----------------------------- | ------------------------------------ | -------------------------------------------------------------------------- |
| `protocolVersion`             | `.ai/protocol/**`                    | Shared protocol contract consumed by generated entrypoints and adapters.   |
| `manifestVersion`             | `.ai/protocol/adapter-manifest.json` | Adapter-manifest schema and projection content version.                    |
| `adapterVersion`              | `.ai/protocol/adapters/**`           | Generated adapter contract version for Codex, Claude, and future runtimes. |
| `governanceVersion`           | `.ai/governance/**`                  | Governance policy and validation command surface version.                  |
| `governanceBaselineVersion`   | governance release owner             | Human-readable baseline label for current architecture state.              |
| `runtimeProfileSchemaVersion` | `.ai/execution/**`                   | Runtime/provider/session profile schema version.                           |
| `routerSchemaVersion`         | `.ai/orchestration/**`               | Skill router and orchestration manifest schema version.                    |

## Compatibility Policy

- `.ai/protocol/version.json` is authoritative.
- `.ai/protocol/adapter-manifest.json` must mirror the active protocol versions under `protocolVersions`.
- Every adapter listed in `adapterGuides` must have `adapterMetadata` with compatible protocol and adapter versions.
- Generated compatibility reports must be created through `pnpm protocol:migrate`; do not hand-edit `.ai/generated/protocol-compatibility.json`.
- Incompatible protocol projections must fail before execution through `pnpm adapters:validate` and `pnpm governance:validate`.
- Migrations must be deterministic and idempotent.

## Upgrade Workflow

1. Bump the relevant fields in `.ai/protocol/version.json`.
2. Mirror the same values in `.ai/protocol/adapter-manifest.json#protocolVersions`.
3. Update adapter metadata compatibility when `protocolVersion` or `adapterVersion` changes.
4. Run `pnpm protocol:migrate`.
5. Run `pnpm ai:sync` to regenerate `AGENTS.md`, `CLAUDE.md`, and adapter docs.
6. Run `pnpm adapters:validate`.
7. Run `pnpm governance:validate` or the full `pnpm governance:gate` before publishing.

## Commands

```bash
pnpm protocol:migrate
pnpm ai:sync
pnpm adapters:validate
pnpm governance:validate
pnpm governance:gate
```
