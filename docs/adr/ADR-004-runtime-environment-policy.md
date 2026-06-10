# ADR-004: Runtime Environment Policy

## Context

Local shells, CI, VSCode tasks, Turbo tasks, and Codex execution can resolve different Node or pnpm binaries without deterministic wrappers.

## Decision

Critical governance execution uses deterministic runtime wrappers. `scripts/env.sh` clears shell wrappers, activates mise when available, enables Corepack when available, and verifies Node/pnpm. `scripts/exec.sh` is the command wrapper. `pnpm doctor` validates local runtime health.

Node.js `24.x` is the intentional repository engine lane for the current toolchain. The policy is aligned across root `package.json` engines, `mise.toml`, GitHub Actions `actions/setup-node` inputs, `@tsconfig/node24`, and `@types/node@24`. This is stricter than many upstream minimums, but it keeps local, CI, TypeScript library, and generated governance execution on one baseline.

Do not relax Node engines in mixed cleanup, dependency, UI, or desktop branches. A lower baseline requires a future owner-approved toolchain policy lane with CI, type-library, package-manager, and validation evidence.

## Consequences

CI keeps explicit Node and pnpm setup while local execution gains the same toolchain expectations. Strict mise enforcement remains opt-in to preserve fallback compatibility during migration.

Contributors should use `mise install` or an equivalent Node 24 runtime before running `pnpm install --frozen-lockfile`.

## Rejected alternatives

- Depend on interactive shell startup files.
- Require immediate hard failure when mise is absent on every machine.
- Restore API keys or local entitlement bypasses to repair runtime variance.
- Relax Node to a broad upstream minimum without a dedicated toolchain validation lane.

## Migration implications

As machines converge, strict runtime checks can be promoted from opt-in to blocking without changing command semantics.
