# legacy/root-app Archive Metadata

Status: archive-only snapshot.

## Snapshot provenance

`legacy/root-app` preserves the former root web runtime for audit, rollback analysis, and migration comparison only. It is not a workspace package and must not be used as an active runtime source.

## Original runtime assumptions

- Single root Vite/Vue browser app.
- Root `src/` owned production browser execution.
- Runtime dependencies were resolved outside the current `apps/web-demo` workspace boundary.

## Migration completion status

- Active browser runtime moved to `apps/web-demo`.
- Root is orchestration-only.
- `legacy/root-app` is excluded from pnpm workspace participation, root TypeScript checks, search indexing, dependency graphs, and CI execution.
- Future deletion remains blocked by the legacy deletion gates in `.ai/runtime/repair_list.txt`.

## Archive rules

Do not edit, fix, build, import from, or sync changes into this archive. Use it only for audit and historical behavior comparison.
