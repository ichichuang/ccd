# ADR-002: Legacy Freeze Policy

## Context

`legacy/root-app` is retained as a historical reference after browser runtime ownership moved to `apps/web-demo`.

## Decision

`legacy/root-app` is frozen, isolated, and outside active workspace dependency graphs. It may be used only for migration audit, behavioral comparison, rollback reference, and historical debugging.

## Consequences

No bug fixes, features, imports, dependency graph re-entry, or sync-back changes are allowed in legacy. Deletion is deferred until equivalence, release, rollback, and audit criteria are satisfied.

## Rejected alternatives

- Delete the archive before equivalence evidence exists.
- Keep legacy as a working runtime copy.
- Reconnect legacy to pnpm workspace builds or imports.

## Migration implications

Replacement readiness is tracked by `docs/architecture/legacy-equivalence-checklist.md`. Legacy remains documentation/audit input only.
