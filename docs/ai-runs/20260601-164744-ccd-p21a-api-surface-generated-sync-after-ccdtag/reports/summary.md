# P21a Summary

- Run ID: `20260601-164744-ccd-p21a-api-surface-generated-sync-after-ccdtag`
- Baseline branch: `main`
- Baseline HEAD: `95e352f5`
- Baseline `origin/main`: `9cbdd5cc`
- Generated files changed:
  - `docs/generated/api-surface-report.md`
  - `docs/generated/api-surface-report.json`
- `CcdTag` present in generated API report: yes
- Validation result:
  - baseline `pnpm validate:governance`: failed on generated artifact sync for `docs/generated/api-surface-report.{md,json}` only
  - post-sync `pnpm validate:governance`: pass
  - stability re-run `pnpm validate:governance`: pass
  - full validation matrix in this lane: pass
- Final architecture status: `CONDITIONAL_GO`
- Remaining residual debt:
  - `C-06`: 5 exact allowlist rows plus showcase
  - `G-02`: `ACCEPTED_DEFERRED_DEBT` with 78 open tasks
  - `M12`: `PARTIAL`
  - Full GO: unauthorized
- Push status: not performed

