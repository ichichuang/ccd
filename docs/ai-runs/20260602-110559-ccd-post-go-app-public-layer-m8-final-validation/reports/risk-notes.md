# M8 Risk Notes

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
