# M3 Risk Notes

## Post-merge note

This document records the pre-merge execution and closeout state of the public-layer repair and post-GO apps public-layer certification lane. PR #38 has since been merged into `main`. Historical statements such as "ready for human review", "branch remains unmerged", or "do not merge" refer to the execution-time branch state rather than the current `main` branch state. Any residual risks noted here remain future improvement lanes, not blockers to the completed merge.

## Closed risk

- Desktop no longer owns duplicated theme and size scale derivation logic.
- The app now consumes the governed design-token package APIs for the shared
  parts of theme/size variable generation.

## Remaining app-owned parts

- `desktopSizeSource` stays app-owned because it is passed to the concrete
  PrimeVue runtime adapter.
- `writeRootVars()` stays app-owned because it writes to `document`.
- Desktop layout dimensions and `--dialog-settings-width` stay app-owned in
  this lane because package `generateSizeVars()` intentionally does not include
  those app root variables.

## Residual risk

- Theme generation now uses the package compiler and cache/observability
  behavior. This is the governed API used by the web theme facade, but it is a
  small runtime behavior difference from the previous local direct mapper.
- No browser or desktop visual smoke was run in M3; validation used package
  tests, type-check, build, and governance commands.
