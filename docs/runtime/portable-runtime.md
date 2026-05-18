# Portable Runtime

The `main-portable-version` branch is CCD's clean reusable architecture scaffold.

## Runtime Contract

- zero-business template
- minimal reusable Web architecture
- no demo pollution
- no obsolete visual baselines
- functional AI governance contract

## Boundaries

- Remove example routes, demo pages, generated demo assets, and obsolete snapshots.
- Keep `.ai/**`, generated adapter flow, and governance commands usable.
- Do not remove architecture contracts that future projects need to stay governable.
- Do not introduce project-specific business assumptions.

## Validation

```bash
pnpm arch:check
pnpm type-check
```

Add targeted tests when portable cleanup changes runtime bootstrap, routing, stores, or build configuration.
