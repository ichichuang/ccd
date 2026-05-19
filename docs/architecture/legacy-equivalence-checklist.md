# Legacy Replacement Equivalence Checklist

This checklist prepares eventual deletion of `legacy/root-app`. It is documentation-only and must not reconnect legacy to the active workspace.

## UI equivalence

- Primary layouts match accepted web-demo behavior.
- Navigation, menus, dialogs, forms, tables, charts, and responsive states have replacement coverage.
- Visual regressions are captured by snapshots or equivalent browser evidence.

## API equivalence

- Active adapters cover required network behavior.
- Error, loading, retry, auth, and permission paths are represented by tests or documented acceptance evidence.
- Public app/package exports remain stable per `pnpm api:report`.

## Route equivalence

- Active routes in `apps/web-demo` cover required legacy route intent.
- Redirects, guards, RBAC metadata, and fallback routes are tested.
- No route depends on root `/src` or `legacy/root-app`.

## State behavior equivalence

- Store initialization, persistence, reset, locale/theme behavior, and session transitions are covered.
- Business data storage uses approved safe-storage paths.
- Cross-layer flow remains `api -> hooks -> stores -> views`.

## Regression snapshot requirements

- Browser smoke coverage for critical routes.
- Snapshot or screenshot evidence for high-risk UI surfaces.
- Unit coverage for runtime-neutral replacement logic.
- E2E coverage for auth/navigation/regression-critical flows.

## Rollback readiness criteria

- Last known production release is identified.
- Rollback procedure is documented.
- Data compatibility and config rollback risks are reviewed.
- Legacy archive has no active runtime linkage before deletion.

## Production release criteria

- `pnpm governance:full`, `pnpm arch:runtime`, `pnpm type-check`, `pnpm build`, `pnpm api:report`, and `pnpm supply:check` pass.
- At least one stable production release ships from the monorepo runtime.
- Functional equivalence review is approved by boundary owners.

## Archive retention policy

Retain `legacy/root-app` until equivalence evidence, rollback readiness, production release criteria, and audit retention needs are satisfied. Deletion must be a dedicated change with no runtime edits.
