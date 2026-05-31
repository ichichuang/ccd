# Remaining Dirty Classification (P10c)

Captured: 2026-06-01. HEAD: `cd4cdccc`. Remaining count: **8 files**.

## Classification table

| file_path | git_status | category | likely_origin | current_commit_group | should_commit | should_exclude | should_quarantine | generated_by_command | can_regenerate | risk_if_committed | risk_if_excluded | recommended_action | owner_decision_required | notes |
|-----------|------------|----------|---------------|------------------------|---------------|----------------|-------------------|----------------------|----------------|-------------------|------------------|--------------------|-------------------------|-------|
| `.ai/rules/components/00-primevue-ecosystem.mdc` | M | rule-doc-drift | P10 platform/vue-ui path migration (M4/M15/M16) left rules unstaged | none (post-G4) | yes (S1) | no | no | manual / follow-up edit | n/a | Low — tightens paths only; guards unchanged | Stale rules reference `src/components/Pro*` after commits | **S1 supplemental commit** after owner approval | yes | 2 hunks: ProForm + ProTable paths → `packages/vue-ui/...` |
| `.ai/rules/components/01-primevue-pt-styling.mdc` | M | rule-doc-drift | same as above | none | yes (S1) | no | no | manual / follow-up edit | n/a | Low | Stale `:deep` exception path | **S1** | yes | 1 hunk: ProTable path only |
| `.ai/rules/components/02-pro-components.mdc` | M | rule-doc-drift | same as above | none | yes (S1) | no | no | manual / follow-up edit | n/a | Low | globs still point at removed `src/components/Pro*` | **S1** | yes | globs + native `<form>` exception path updated |
| `apps/web-demo/src/types/auto-imports.d.ts` | M | generated-type-output | `unplugin-auto-import` via `apps/web-demo/build/plugins.ts` (`dts: src/types/auto-imports.d.ts`) | none (excluded from G3) | yes (S2) | no | no | `pnpm build:web-demo` / Vite dev (AutoImport plugin) | yes | Low — cosmetic `export type` formatting only | Drift vs CI/dev regeneration noise on next build | **S2** or regenerate then commit | yes | No `/Users/` or machine-local paths in diff |
| `docs/ai-plan/STATUS.md` | M | status-surface-update | Post-P10 manual ledger refresh | none | yes (S3) | no | no | manual | partial | Low if NO_GO/push semantics preserved | STATUS lags P10 reality | **S3** | yes | Records `P10_LOCAL_COMMITS_CREATED`, P10a, `cd4cdccc`, not pushed; **does not claim GO** |
| `docs/ai-runs/20260601-121000-ccd-p10-local-commits/reports/summary.md` | M | post-commit-evidence | P10 closure rewrite after successful commits | none | yes (S3) | no | no | manual | no | Low — documents hashes and NO_GO | P10 run folder contradicts committed `P10_HOOK_BLOCKED` narrative | **S3** | yes | Aligns evidence with 6 commits; push/GO denied |
| `CCD_ARCHITECTURE_ISSUE_REPAIR_LOG.md` | ?? | root-duplicate-input | Local export/snapshot (Chinese header, 652 lines) | S4 exclusion | **no** | **yes** | no | unknown local copy | n/a | Duplicates/conflicts canonical `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md` (1878 lines) | None if canonical doc kept | **Do not commit**; keep untracked or relocate in approved lane | yes | File self-states canonical path is `docs/ai-plan/...` |
| `docs/ai-runs/20260601-121000-ccd-p10-local-commits/command-logs/19-post-commit-validation.log` | ?? | evidence-log | Post-P10 validation capture | none | conditional (S3) | no | no | `pnpm validate:governance` + downstream chain | yes | Medium — embeds absolute `/Users/cc/MyPorject/ccd` paths (standard pnpm logs) | Missing log if summary cites full matrix | **S3 with owner ack** or commit summary-only | **yes** | 1036 lines; text; referenced by P10 evidence closure |

## Per-file diff inspection summary

### Tracked — rule docs (S1)

- `00-primevue-ecosystem.mdc`: `src/components/ProForm/...` → `packages/vue-ui/src/ProForm/...`; `src/components/ProTable/...` → `packages/vue-ui/src/ProTable/...`
- `01-primevue-pt-styling.mdc`: ProTable exception path updated
- `02-pro-components.mdc`: `globs` and ProForm native `<form>` note updated

### Tracked — auto-imports (S2)

- Diff: collapses multi-line `export type { ... }` blocks to single-line declarations (lines ~402–430 region only).
- Generator: `unplugin-auto-import` in `apps/web-demo/build/plugins.ts` (`dts: 'src/types/auto-imports.d.ts'`).

### Tracked — status surfaces (S3)

- `STATUS.md`: milestone `P10_HOOK_BLOCKED_PRECOMMIT` → `P10_LOCAL_COMMITS_CREATED`; adds P10a row; HEAD `cd4cdccc`; review/commit `DONE`; workspace note updated.
- P10 `summary.md`: status flipped to 6 commits; hook-block narrative removed; remaining dirty list updated.

### Untracked — root duplicate (S4)

- `wc -l`: 652 lines; UTF-8 text.
- `diff -q` vs `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md`: **files differ** (canonical 1878 lines, English machine-readable header).

### Untracked — evidence log (S3)

- `wc -l`: 1036 lines.
- `sed -n '1,80p'`: starts with `validate:governance` / `governance:gate` / `project:doctor` (pass).
- Tail: `build:desktop` vite build success.

## Category legend

Allowed values used: `rule-doc-drift`, `generated-type-output`, `root-duplicate-input`, `post-commit-evidence`, `status-surface-update`, `evidence-log`.
