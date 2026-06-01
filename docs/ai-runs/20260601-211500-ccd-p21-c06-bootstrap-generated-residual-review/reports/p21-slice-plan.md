# P21 Slice Plan

## Status

No slice selected. Outcome: **`P21_NO_SAFE_RESIDUAL_REDUCTION`**.

## Rationale

None of the five remaining exact allowlist rows satisfy P21 “one proven-safe row” criteria:

- Plugin install rows (R1, R4) need a new adapter bootstrap API and dual-app migration.
- Build resolver row (R2) is owned by Vite/unplugin build config, not adapter install API.
- Global shell row (R3) requires overlay host facades beyond existing toast/message helpers.
- Generated registry row (R5) cannot be edited manually; generator ownership change is out of P21 scope.

## If a future lane targets bootstrap (not authorized in P21)

| field | value |
| --- | --- |
| selected row | _(none)_ |
| expected exact allowlist count before | 5 |
| expected exact allowlist count after | 5 (unchanged in P21) |
| source files | — |
| package files | — |
| generated files | — |
| tests | — |
| risk | — |
| rollback plan | — |

Future owner-approved Option C lane (M6) may pair R1+R4 behind `installPrimeVueRuntime`; R2/R5 need separate build/generator lanes.
