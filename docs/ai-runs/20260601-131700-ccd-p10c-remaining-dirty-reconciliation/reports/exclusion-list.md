# P10c Exclusion List

Files that **must not** be included in supplemental commits without a separate approved lane.

| file_path | reason | recommended handling |
|-----------|--------|----------------------|
| `CCD_ARCHITECTURE_ISSUE_REPAIR_LOG.md` | Root duplicate of canonical `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md`; stale/partial (652 lines vs 1878) | Do not stage; do not commit; do not delete without explicit authorization |
| `.cursor/**` (repo root) | Quarantined to sibling path per P10a | Must not restore to repo root unless explicitly instructed |
| Any file under external quarantine `../ccd.cursor.quarantine.*/` | Out of repo scope | Do not read private content into reports; do not restore |

## Not excluded (pending owner-approved commits)

| file_path | intended group |
|-----------|----------------|
| `.ai/rules/components/*.mdc` | S1 |
| `apps/web-demo/src/types/auto-imports.d.ts` | S2 |
| `docs/ai-plan/STATUS.md` | S3 |
| `docs/ai-runs/20260601-121000-ccd-p10-local-commits/reports/summary.md` | S3 |
| `docs/ai-runs/20260601-121000-ccd-p10-local-commits/command-logs/19-post-commit-validation.log` | S3 (owner may omit) |

## Generated / forbidden manual edit (unchanged policy)

- `docs/generated/**` — do not manually edit
- `.ai/generated/**` — do not manually edit
- `.ai/governance/api-snapshots/**` — do not manually edit
