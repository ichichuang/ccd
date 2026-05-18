# Stable Governance Baseline

`main` is the canonical governance baseline for CCD multi-runtime migration.
This is the core-first optimization SSOT: shared governance freezes on `main` first, then branch-specific runtime profiles diverge only where explicitly allowed.

## Baseline Versions

| Contract                         | Version                     |
| -------------------------------- | --------------------------- |
| `GOVERNANCE_BASELINE_VERSION`    | `2026.05-main-governance.1` |
| `RUNTIME_PROFILE_SCHEMA_VERSION` | `1.0.0`                     |
| `ROUTER_SCHEMA_VERSION`          | `1.0.0`                     |

## Snapshot Scope

| Domain                  | Canonical Source                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Runtime profiles        | `mise.toml`, `docs/runtime/runtime-isolation.md`, `/Users/cc/AI-Research-OS/runtime-profiles/runtime-bootstrap.md` |
| Governance gates        | `scripts/governance/validate.mjs`, `docs/governance.md`, `.ai/protocol/version.json`                               |
| Provider policy         | `/Users/cc/AI-Research-OS/AI_CONTEXT.md`, `/Users/cc/AI-Research-OS/COMMANDS.md`                                   |
| Routing policy          | `/Users/cc/.codex/scripts/codex_token_pipeline.py`, `.ai/skills/codex/task-orchestrator/**`                        |
| Orchestration preflight | `.ai/orchestration/manifest.json`, `scripts/governance/orchestration-validate.mjs`                                 |

## Immutable Contracts

### Runtime Profile Schema

- Runtime profiles must declare runtime source, Node source, pnpm source, `PATH` policy, provider policy, isolation policy, governance strictness, and orchestration capabilities.
- Profiles must be self-contained and must not rely on hidden interactive-shell state.
- Portable profiles must never silently fall back to machine runtime.

### Governance API

- `.ai/**` remains the only project governance source of truth.
- Generated adapters must be regenerated from canonical sources, not edited as primary sources.
- `pnpm governance:validate` is the minimum project-scoped gate for governance assets.
- Machine-local governance is optional and belongs only to `pnpm ai-os:doctor:strict-local`.

### Provider Resolution Order

- `ACTIVE_CODEX_PROVIDER` is the canonical provider selector.
- Allowed values are `remote-moacode` and `packy-local`.
- Provider health checks may validate endpoints, but shared governance must not hardcode provider-specific endpoints as control-flow sources.

### Routing Score Model

- `micro` is limited to trivial isolated edits.
- `low` is limited to simple single-file tasks.
- `mid` covers standard multi-file product changes.
- `high` covers governance, runtime, orchestration, provider, isolation, topology, and system migration work.

### Execution Escalation Semantics

- Governance, runtime, provider, topology, orchestration, or AI OS tasks must route to `complex -> high`.
- Execute mode must remain deterministic and must not introduce hidden runtime fallbacks.
- Escalation changes must be validated with `codex-token --no-execute --json`.

## Branch Migration Contract

| Branch                  | Contract                                                |
| ----------------------- | ------------------------------------------------------- |
| `main`                  | frozen canonical governance baseline                    |
| `desktop-version`       | profile-driven desktop migration, no governance fork    |
| `main-portable-version` | isolated portable migration, no machine-runtime leakage |

## Validation Contract

- `pnpm governance:validate`
- `pnpm ai-os:doctor`
- `codex-token --no-execute --json "<AI OS governance/runtime task>"`
- No branch-specific logic in shared governance core unless guarded by explicit runtime profile metadata.
