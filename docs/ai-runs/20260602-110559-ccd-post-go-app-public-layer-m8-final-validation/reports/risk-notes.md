# M8 Risk Notes

## Post-merge note

This document records the pre-merge execution and closeout state of the public-layer repair and post-GO apps public-layer certification lane. PR #38 has since been merged into `main`. Historical statements such as "ready for human review", "branch remains unmerged", or "do not merge" refer to the execution-time branch state rather than the current `main` branch state. Any residual risks noted here remain future improvement lanes, not blockers to the completed merge.

## Non-blocking residual risks

- Deferred M1 candidates remain future product/architecture decisions:
  route access, system preference guard exports, DTO/Zod ownership,
  DateUtils naming, safeStorage crypto/compression, and HTTP runtime ownership.
- No new governed build package was created; build utilities remain app-owned
  because this plan forbids manifest/lockfile changes and no package owner
  currently exists.
- Browser/desktop visual smoke was not added to the final matrix; validation is
  based on package, architecture, governance, type, test, and build gates.
- `build:web-demo` still reports the existing Vite warning where
  `src/router/modules/core.ts` is both dynamically and statically imported by
  `src/router/index.ts`; build completes successfully and this plan did not
  modify that routing topology.

## Blocking risks

None recorded.
