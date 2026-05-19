# Legacy Archive

`legacy/root-app` is an immutable historical snapshot of the retired root web runtime.

Allowed usage:

- Migration audit and source comparison.
- Behavior comparison while validating `apps/web-demo` parity.
- Rollback reference during release stabilization.
- Historical debugging for regressions introduced after monorepo convergence.

Forbidden usage:

- Bug fixes or new features inside `legacy/root-app`.
- Active imports from `legacy/**` into `apps/**`, `packages/**`, scripts, or tests.
- Re-entering pnpm workspace, Turbo, CI, type-check, lint, or production build graphs.
- Syncing legacy changes back into the active runtime without a governed migration task.

Active edit targets are limited to `apps/web-demo/**`, `apps/desktop/**`, `packages/contracts/**`, and `packages/core/**`.

Deletion gate:

Do not delete `legacy/root-app` until functional equivalence, stable production release, and regression snapshot coverage replace it as the audit reference.
