# Before / After

## Before

- P24 recorded no approval for D-020 through D-024.
- `docs/ai-plan/DECISIONS.md` listed all P23 menu items as `PROPOSED`.
- `CONDITIONAL_GO` was current; full GO unauthorized.
- C-06/G-02/M12 remained residual/proposed.

## After

- P25 records explicit approval to execute D-020 through D-024.
- No residual item is marked closed by the baseline lane.
- No runtime source, allowlist, repair-ledger checkbox, package manifest, or lockfile changed.
- `CONDITIONAL_GO` remains current pending implementation and final validation.

## Counts

| Surface | Before | After |
| --- | ---: | ---: |
| PrimeVue exact allowlist rows | 5 | 5 |
| `pnpm ai:doctor --open` tasks | 78 | 78 |
| Full GO status | not authorized | not authorized |
