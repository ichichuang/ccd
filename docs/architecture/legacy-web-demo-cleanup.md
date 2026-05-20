# Removed Browser Runtime Archive Cleanup

The former duplicate browser runtime archive has been removed from the working tree. `apps/web-demo` is the browser runtime source of truth, and shared behavior is promoted through explicit workspace packages.

## Current state

- Root is orchestration/configuration only.
- Browser runtime code lives in `apps/web-demo`.
- Desktop runtime code lives in `apps/desktop` adapters.
- Shared contracts and runtime-neutral logic live in `packages/contracts` and `packages/core`.
- Historical audit uses Git history, generated reports, and release artifacts.

## Guardrails

- Do not recreate removed archive directories as active source.
- Do not copy historical code from Git history without a governed migration task.
- Do not add removed archive paths to workspaces, CI, scripts, generated graphs, or package manifests.
- Use package public exports and app adapters for all active runtime changes.
