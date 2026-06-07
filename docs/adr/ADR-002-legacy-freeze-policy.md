# ADR-002: Removed Browser Runtime Archive

## Status

Accepted; supersedes the former archive freeze policy.

## Context

Browser runtime ownership moved to `apps/web-demo`, with shared platform logic promoted into workspace packages. The former archived root runtime directory has been removed from the working tree after governance, release, dependency, and documentation checks no longer required it as an audit reference.

## Decision

The repository no longer carries a working-tree browser runtime archive. Historical comparison and rollback investigation use Git history, generated reports, release artifacts, and current governance snapshots.

Removed archive directories must not be recreated, added to `pnpm-workspace.yaml`, referenced by package manifests, or used as runtime/build inputs.

## Consequences

- `apps/web-demo` remains the browser `web-demo` application shell.
- `packages/contracts` and `packages/core` remain runtime-neutral.
- Governance validates that removed archive directories are not present or required by active commands.
- Historical explanations may reference the migration, but active policy must not require the removed archive to exist.
