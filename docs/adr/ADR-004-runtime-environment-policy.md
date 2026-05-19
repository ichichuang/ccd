# ADR-004: Runtime Environment Policy

## Context

Local shells, CI, VSCode tasks, Turbo tasks, and Codex execution can resolve different Node or pnpm binaries without deterministic wrappers.

## Decision

Critical governance execution uses deterministic runtime wrappers. `scripts/env.sh` clears shell wrappers, activates mise when available, enables Corepack when available, and verifies Node/pnpm. `scripts/exec.sh` is the command wrapper. `pnpm doctor` validates local runtime health.

## Consequences

CI keeps explicit Node and pnpm setup while local execution gains the same toolchain expectations. Strict mise enforcement remains opt-in to preserve fallback compatibility during migration.

## Rejected alternatives

- Depend on interactive shell startup files.
- Require immediate hard failure when mise is absent on every machine.
- Restore API keys or local entitlement bypasses to repair runtime variance.

## Migration implications

As machines converge, strict runtime checks can be promoted from opt-in to blocking without changing command semantics.
