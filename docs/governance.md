# AI-Native Governance System

CCD treats AI governance as a first-class architecture layer. The governance system is not a collection of helper prompts; it is the control plane that keeps agents, generated adapters, runtime rules, and validation commands aligned.

Canonical baseline contracts are frozen in `docs/architecture/stable-baseline.md`.
Codex execute-path reliability contracts are defined in `docs/runtime/execute-reliability.md`.

## Governance Stack

```text
.ai/
├── protocol/   -> agent entrypoints and adapter manifest
├── rules/      -> architecture laws and implementation constraints
├── skills/     -> local Codex execution capabilities
├── manifests/  -> generated routing, rule, and skill locks
└── runtime/    -> local repair ledgers and runtime state templates
```

Generated adapters:

- `AGENTS.md`
- `CLAUDE.md`
- `~/.codex/skills/**`

These are materialized from `.ai/**`; they are not the source of truth.

## Governance Flow

```text
authoring
  -> sync
  -> adapter generation
  -> environment validation
  -> doctor validation
  -> drift validation
  -> governance validation
  -> protocol/adapters/orchestration validation
  -> preflight validation
```

The command entrypoint is:

```bash
pnpm arch:check
```

It runs:

```bash
pnpm ai:sync
pnpm ai:sync:codex
pnpm env:doctor
pnpm ai:doctor
pnpm drift-check
pnpm governance:validate
pnpm adapters:validate
pnpm orchestration:validate
pnpm codex:preflight
git diff --check
```

## Command Tiers

| Command                          | Purpose                                                                                                | Use Case                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| `pnpm env:doctor`                | node/pnpm version, binary resolution, shell wrapper leakage                                            | runtime preflight                   |
| `pnpm ai-os:doctor`              | project governance plus optional machine runtime checks when `STRICT_LOCAL_RUNTIME=1` is set           | local AI OS preflight               |
| `pnpm ai-os:doctor:strict-local` | project governance plus `/Users/cc/.ai-os` runtime freeze audit                                        | user-machine gate, not CI           |
| `pnpm runtime:env`               | deterministic runtime bootstrap with `mise` for Node and pinned pnpm binary path                       | local runtime verification          |
| `pnpm runtime:env:strict`        | fail fast when `mise` is unavailable                                                                   | Node migration gate                 |
| `pnpm runtime:exec`              | run one command through the deterministic runtime wrapper                                              | shell-independent command execution |
| `pnpm runtime:exec:strict`       | shell-independent command execution with strict `mise` requirement                                     | Node migration gate                 |
| `pnpm arch:check:fast`           | `env:doctor + ai:doctor + drift-check + governance:validate`                                           | quick local feedback                |
| `pnpm arch:check`                | env, sync, generated adapter, doctor, drift, governance, adapter, orchestration, preflight, whitespace | normal architecture gate            |
| `pnpm arch:check:full`           | `arch:check + arch:snapshot + arch:report + arch:visualize + lint + type-check + test:run`             | PR, release, CI-grade local gate    |
| `pnpm arch:snapshot`             | generate machine-readable architecture snapshot                                                        | deterministic governance inventory  |
| `pnpm arch:report`               | generate governance report outputs                                                                     | governance state reporting          |
| `pnpm arch:visualize`            | generate Mermaid architecture diagrams                                                                 | synchronized visualization          |

## Governance Boundaries

- Edit `.ai/**` canonical sources first.
- Regenerate adapters with `pnpm arch:check` or `pnpm ai:sync`.
- Keep generated adapter changes reviewable and committed when canonical sources change.
- Do not manually maintain `AGENTS.md`, `CLAUDE.md`, or `~/.codex/skills/**`.
- Do not weaken architecture rules to pass a local change; fix the violating surface or record an explicit architecture decision.

## Product Line Integration

| Product Line            | Governance Expectation                                                            |
| ----------------------- | --------------------------------------------------------------------------------- |
| `main`                  | full governance system, full examples, full architecture docs                     |
| `desktop-version`       | full governance plus desktop branch guardrails and Tauri drift checks             |
| `main-portable-version` | minimal but functional governance, no example-specific residue unless intentional |
