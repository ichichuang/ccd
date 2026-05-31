# P3 D-017 PrimeVue Reduction Decision Summary

## Phase status

- **Final status**: `P3_D017_APPROVED`
- **Baseline branch**: `main`
- **Baseline commit**: `cc255d1a`
- **Runtime source changed**: no
- **Guard/allowlist changed**: no

## Owner decision

- **Options A + D approved**: keep exact allowlists and showcase exceptions; continue blocking new non-showcase direct imports via `pnpm ai:guard`.

## Blocker updates

| ID | Before | After |
|---|---|---|
| D-017 | PROPOSED | APPROVED (A+D) |
| C-06 | OPEN | OPEN (strategy approved; debt remains) |
| M12 | BLOCKED | BLOCKED (no Option E approval) |

## P6 status

Skipped — no allowlist reduction implementation authorized.

## Residual debt (accepted)

- Stale allowlist rows referencing removed app component paths (D-11)
- 70 exact allowlist rows until future M12 lane

## Full GO authorized

No.
