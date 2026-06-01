# D-021 Generated Registry Summary

## Scope

- Lane: `D-021` / `P27_D021_GENERATED_REGISTRY_DONE`
- Objective: close C-06 R2/R5 by moving build resolver ownership behind a governed build boundary and classifying generated component registry ownership.
- Baseline: local HEAD `79a361c9`, `origin/main` `6132c9c9`; branch `main`.

## Result

- Added `apps/web-demo/build/resolvers/primevue.ts` as the build-only resolver boundary.
- Replaced the direct `PrimeVueResolver()` call in `apps/web-demo/build/plugins.ts` with `createPrimeVueComponentResolver()`.
- Updated `scripts/drift-check.mjs` to enforce the boundary and keep PrimeVue auto-registration protected.
- Updated `scripts/ai-architecture-guard.mjs` so R2/R5 are no longer exact app allowlist rows:
  - R2 is a governed build resolver boundary.
  - R5 is a governed generated registry boundary.
- `apps/web-demo/src/types/components.d.ts` was not manually edited.

## Status

- `C-06`: still `OPEN`, reduced from 3 exact rows plus showcase to 1 exact row plus showcase.
- `G-02`: unchanged, 78 open tasks.
- `M12`: still `PARTIAL`.
- Final decision: `CONDITIONAL_GO`.
- Push: not performed.
