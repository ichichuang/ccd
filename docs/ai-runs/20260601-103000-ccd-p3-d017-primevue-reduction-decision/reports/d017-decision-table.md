# P3 D-017 PrimeVue Decision Table

| option_id | expected_allowlist_reduction_count | source_migration_required | visual_regression_risk | wrapper_required | adapter_required | e2e_required | guard_update_required | recommendation | approval_status |
|---|---|---|---|---|---|---|---|---|---|
| A | 0 (keep debt) | no | none | no | no | no | no | maintain exact allowlists | **APPROVED** |
| B | varies | yes | mid | yes | no | yes | after migration | future slice only | not approved now |
| C | varies | yes | mid | no | yes | yes | after migration | future slice only | not approved now |
| D | 0 (block new non-showcase) | no | none | no | no | no | no (already enforced) | block new violations | **APPROVED** |
| E | staged per feature | yes | mid-high | varies | varies | yes | after migration | future M12 lanes | **not approved** |

## M4/M5 baseline (unchanged)

- PrimeVue import rows: 163
- Exact app allowlist rows: 70
- Showcase exception rows: 12
- Removable without source migration: 0
- Future reduction groups: 7

## Outcome

- `D-017`: APPROVED (Options A + D)
- `C-06`: remains OPEN (allowlist debt accepted)
- `M12`: remains BLOCKED (Option E not approved)
- P6 skipped
