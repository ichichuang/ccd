# ADR-001: Monorepo Runtime Boundary

## Context

CCD converged from root-owned runtime code to a pnpm + Turbo workspace topology. The active topology is `packages/contracts -> packages/core -> apps/*`.

## Decision

`apps/web-demo` is the active browser `web-demo` application shell. `apps/desktop` is the dedicated Tauri desktop runtime shell with its own frontend entry and `src-tauri` backend boundary. `packages/contracts` contains interfaces and shared types only. `packages/core` remains runtime-neutral and depends only on `@ccd/contracts`. Runtime APIs are adapter-injected from application adapter directories.

## Consequences

Root stays orchestration-only. Runtime code under root `/src` is forbidden. Workspace package imports must use public exports only. App-to-app imports are forbidden.

## Rejected alternatives

- Restore root `/src` as a browser runtime owner.
- Allow `packages/core` to call browser, Node, timer, storage, network, crypto, or Tauri APIs directly.
- Permit workspace deep imports for convenience.

## Migration implications

New runtime capability starts in contracts, is implemented runtime-neutrally in core, and is injected by app adapters. Existing fallback runtime compatibility remains until replacement is validated.
