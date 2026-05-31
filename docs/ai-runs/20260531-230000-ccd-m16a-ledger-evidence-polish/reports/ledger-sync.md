# M16a Ledger Sync

## Baseline

- Branch: `main`
- Commit: `cc255d1a`
- Accepted M16 status: `M16_STALE_REFERENCES_CLEANED`
- Prior lane: M16 stale documentation and tooling reference cleanup

## §0 Machine-Readable Summary

| Field | Before M16a | After M16a |
|---|---|---|
| `document_version` | `2026-05-31.m16` | `2026-05-31.m16a` |
| `current_lane` | M16 stale documentation and tooling reference cleanup lane | M16a ledger evidence polish lane |
| `partially_obsolete` | `[B-03, C-04, D-09, D-10]` | `[B-03, C-04, D-09, D-10, D-11]` |
| `done` | missing `D-08` | includes `D-08` |
| `final_status_decision` | `M16_STALE_REFERENCES_CLEANED` | `M16_STALE_REFERENCES_CLEANED` (unchanged) |

## G-02 Wording

| Location | Before M16a | After M16a |
|---|---|---|
| §4 main table repair notes | M14 and M15 report 80 open tasks; no ledger closure in M15 | M14, M15, and M16 all report 80 open tasks; no ledger closure in M16 |
| §4 main table lanes | `M14, M15` | `M14, M15, M16` |
| §5 `G-02` problem | M14/M15 evidence | M14/M15/M16 evidence |
| §5 `G-02` repair notes | M14 and M15 both surface 80 open tasks | M14, M15, and M16 all surface 80 open tasks |
| §5 related files | `docs/ai-plan/PLAN.md` only | adds M16 `005-pnpm-ai-doctor-open.log` reference |
| `G-02` status | `OPEN` | `OPEN` (unchanged) |

## Issue Statuses (unchanged)

| Issue | Status |
|---|---|
| `D-08` | `DONE` |
| `D-11` | `PARTIALLY_OBSOLETE` |
| `G-02` | `OPEN` |
| `B-07` | `BLOCKED` |
| `B-08` | `OPEN` |
| `C-06` | `OPEN` |
| `D-016` | `PROPOSED` |
| `D-017` | `PROPOSED` |
| `G-03` | `BLOCKED` |

## Result

Ledger §0 YAML and G-02 wording now match the M16 issue table and evidence without changing substantive statuses or top-level `NO_GO`.
