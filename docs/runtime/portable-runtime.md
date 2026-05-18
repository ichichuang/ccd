# Portable Runtime

Portable runtime is now represented by workspace portability, not by a separate active delivery lane.

Portable guarantees live in:

- `packages/contracts`: implementation-free contract layer
- `packages/core`: runtime-neutral platform logic
- app adapter boundaries: runtime-specific capability injection
- governance checks: `pnpm governance:gate`

Historical portable scaffold material belongs in `legacy/**` or documentation only. Active package code must not import it.

## Validation

```bash
pnpm install --frozen-lockfile
pnpm governance:gate
pnpm build
```
