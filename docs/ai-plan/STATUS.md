# CCD Architecture Repair Status

## Current Execution State

- Current program: `CCD post-M16 blocker-resolution program`
- Current milestone: P20 `P20_C06_RESIDUAL_ALLOWLIST_REDUCED` — one more non-showcase PrimeVue exact allowlist row removed (6 → 5) by adding `@ccd/vue-ui` `CcdTag` wrapper and migrating `use-app-element-size.vue`; CONDITIONAL_GO unchanged; full GO still unauthorized.
- Prior milestone: P19 `P19_C06_RESIDUAL_ALLOWLIST_REDUCED` — one more non-showcase PrimeVue exact allowlist row removed (7 → 6) by migrating an example-page `primevue/tieredmenu` import to the `@ccd/vue-ui` `CcdTieredMenu` wrapper; CONDITIONAL_GO unchanged; full GO still unauthorized.
- Prior milestone: P18 `P18_G02_LEDGER_REDUCED` — closed 2 stale/evidence-backed repair-ledger rows (80 → 78); CONDITIONAL_GO unchanged; full GO still unauthorized.
- Prior milestone: P17 `P17_C06_RESIDUAL_ALLOWLIST_REDUCED` — one type-only PrimeVue exact allowlist row removed (8 → 7) via adapter `PrimeVuePopoverInstance` facade; CONDITIONAL_GO unchanged; full GO still unauthorized.
- Prior milestone: P16a `P16A_CONDITIONAL_GO_CONSISTENCY_REPAIRED` — status-surface consistency repair; owner-accepted residual debt formalized.
- Prior milestone: P16 `P16_FINAL_CONDITIONAL_GO` — full validation matrix passed (2026-06-01).
- Current accepted baseline: `M14_STATUS_LEDGER_RECONCILED_NO_GO`.
- Prior cleanup lane: `M16_STALE_REFERENCES_CLEANED` / `M16A_LEDGER_EVIDENCE_POLISHED`.
- Baseline branch: `main`.
- Pre-P10 baseline commit: `cc255d1a`.
- Last remote-state reconciliation: P11 reconciled P10g push state; P11 itself was pushed after that reconciliation — use `git log` / remote history as source of truth for current HEAD.
- P20 evidence directory: `docs/ai-runs/20260601-200000-ccd-p20-c06-residual-allowlist-closure-pass-3/`.
- P19 evidence directory: `docs/ai-runs/20260601-190000-ccd-p19-c06-residual-allowlist-closure-pass-2/`.
- P18 evidence directory: `docs/ai-runs/20260601-180000-ccd-p18-g02-repair-ledger-debt-closure/`.
- P17 evidence directory: `docs/ai-runs/20260601-125343-ccd-p17-c06-primevue-residual-allowlist-closure/`.
- P16a evidence directory: `docs/ai-runs/20260601-161000-ccd-p16a-conditional-go-consistency-repair/`.
- P16 evidence directory: `docs/ai-runs/20260601-160000-ccd-p16-final-go-no-go-reconciliation/`.
- P15 evidence directory: `docs/ai-runs/20260601-155000-ccd-p15-repair-ledger-closure/`.
- P14 evidence directories: `docs/ai-runs/20260601-152000-ccd-p14-e1-adapter-primevue-reduction/` through `docs/ai-runs/20260601-154000-ccd-p14-e4-generated-typing-resolver-review/`.
- P13 evidence directory: `docs/ai-runs/20260601-151000-ccd-p13-primevue-m12-owner-decision/`.
- P11 evidence directory: `docs/ai-runs/20260601-140000-ccd-p11-remote-state-surface-reconciliation/`.
- P0–P8 evidence roots: `docs/ai-runs/20260601-100000-ccd-p0-post-m16-blocker-baseline/` through `docs/ai-runs/20260601-105000-ccd-p7-repair-ledger-reconciliation/`.
- Runtime source changed in P4: comment-only in `apps/web-demo/src/utils/safeStorage/index.ts`.
- Package manifests or lockfile changed in P0–P20: no.
- P12–P20 have been pushed to origin/main through P19 reconciliation commit `e0135e10`; P20 is local-only until separately authorized; no clean/reset/rebase was performed.
- P12–P19 commits are present on origin/main; verify current HEAD via git history.
- P10 local commits (2026-06-01): **6 commits created** (G5→G2→G3→G6→G1→G4); pre-commit passed without `--no-verify` after P10a quarantine; see `docs/ai-runs/20260601-121000-ccd-p10-local-commits/reports/summary.md` and `docs/ai-runs/20260601-130000-ccd-p10a-cursor-retired-path-quarantine/`.
- P10g push (2026-06-01): **manual push to `origin/main` completed**; current HEAD must be verified via git history, not hardcoded status docs.

## Top-Level Status

- P20 reconciliation: `P20_C06_RESIDUAL_ALLOWLIST_REDUCED` (PrimeVue exact allowlist 6 → 5; example-page `primevue/tag` → `@ccd/vue-ui` `CcdTag` wrapper; showcase untouched).
- P19 reconciliation: `P19_C06_RESIDUAL_ALLOWLIST_REDUCED` (PrimeVue exact allowlist 7 → 6; example-page `primevue/tieredmenu` → `@ccd/vue-ui` `CcdTieredMenu` wrapper; showcase untouched).
- P18 reconciliation: `P18_G02_LEDGER_REDUCED` (repair-ledger 80 → 78; 2 evidence-backed stale-row closures).
- P17 reconciliation: `P17_C06_RESIDUAL_ALLOWLIST_REDUCED` (PrimeVue exact allowlist 8 → 7; type-only adapter facade; showcase untouched).
- P16a reconciliation: `P16A_CONDITIONAL_GO_CONSISTENCY_REPAIRED`.
- P16 reconciliation: `P16_FINAL_CONDITIONAL_GO`.
- P15 reconciliation: `P15_REPAIR_LEDGER_ACCEPTED_DEBT`.
- P14 reconciliation: `P14_M12_SLICE_DONE` (E1/E2) + E4 review complete; E3 showcase deferred.
- P13 reconciliation: `P13_M12_APPROVED`.
- P12 reconciliation: `P12_STATUS_SURFACE_ANTI_DRIFT_REPAIRED`.
- P11 reconciliation: `P11_REMOTE_STATE_RECONCILED_NO_GO`.
- Overall final status: **`CONDITIONAL_GO`** (owner-accepted residual debt).
- Full GO is not authorized.
- `pnpm ai:doctor --open` reports **78 open tasks** (P18 closed 2 evidence-backed rows; G-02 remains owner-accepted deferred debt).
- Remote state: last reconciled in P11 to P10g push state; use git history for current HEAD; P12 removed self-staling remote-commit claims from status surfaces.

## Post-M16 Program Results (P0–P16a)

| Phase | Status                                     | Key outcome                                                                                                                                     |
| ----- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| P0    | `P0_BLOCKER_BASELINE_CONFIRMED`            | Baseline + blocker table; M16a evidence gap noted                                                                                               |
| P1    | `P1_D016_APPROVED`                         | D-016 Option A; B-07 DONE (app-owned)                                                                                                           |
| P2    | `P2_B08_APP_OWNED_DECIDED`                 | D-019 Option A; B-08 DONE (app-owned)                                                                                                           |
| P3    | `P3_D017_APPROVED`                         | Options A+D; C-06 OPEN; M12 blocked                                                                                                             |
| P4    | `P4_SAFE_STORAGE_NOOP_CONFIRMED`           | Facade boundary comment only                                                                                                                    |
| P5    | skipped                                    | compression app-owned                                                                                                                           |
| P6    | skipped                                    | no allowlist reduction authorized                                                                                                               |
| P7    | `P7_REPAIR_LEDGER_CLASSIFIED_NONZERO`      | 80 tasks classified                                                                                                                             |
| P8    | `P8_FINAL_NO_GO`                           | validation matrix mostly pass; codex:preflight fail inherited                                                                                   |
| P9    | `P9_REVIEW_PACKAGE_READY`                  | commit grouping prepared                                                                                                                        |
| P9a   | `P9A_EVIDENCE_RECONCILED`                  | M16a path verified; codex exception documented                                                                                                  |
| P10a  | `P10A_CURSOR_QUARANTINED`                  | `.cursor` moved to sibling quarantine; ai:doctor unblocked                                                                                      |
| P10   | `P10_LOCAL_COMMITS_CREATED`                | G1–G6 committed locally (6)                                                                                                                     |
| P10c  | `P10C_REMAINING_DIRTY_CLASSIFIED`          | supplemental commit recommendations                                                                                                             |
| P10f  | `P10F_PUSH_READINESS_RESTORED`             | auto-imports/vue-charts build prep                                                                                                              |
| P10g  | `P10G_REMOTE_PUSH_COMPLETED`               | manual push to `origin/main` completed (2026-06-01)                                                                                             |
| P11   | `P11_REMOTE_STATE_RECONCILED`              | status surfaces aligned to remote post-push state                                                                                               |
| P12   | `P12_STATUS_SURFACE_ANTI_DRIFT_REPAIRED`   | volatile remote HEAD wording replaced with stable reconciliation event                                                                          |
| P13   | `P13_M12_APPROVED`                         | owner approved Option E staged PrimeVue reduction; P14 unlocked                                                                                 |
| P14   | `P14_M12_SLICE_DONE`                       | E1/E2 allowlist 13→8; E4 review; E3 showcase deferred                                                                                           |
| P15   | `P15_REPAIR_LEDGER_ACCEPTED_DEBT`          | G-02 owner-accepted; 80 open tasks unchanged                                                                                                    |
| P16   | `P16_FINAL_CONDITIONAL_GO`                 | full validation green; G-03 DONE; CONDITIONAL_GO declared                                                                                       |
| P16a  | `P16A_CONDITIONAL_GO_CONSISTENCY_REPAIRED` | ledger §0 + implementation log + DECISIONS consistency; no runtime change                                                                       |
| P17   | `P17_C06_RESIDUAL_ALLOWLIST_REDUCED`       | PrimeVue exact allowlist 8→7 via adapter `PrimeVuePopoverInstance` type facade; showcase untouched; full GO unchanged                           |
| P18   | `P18_G02_LEDGER_REDUCED`                   | G-02 repair-ledger 80→78; closed P1-HttpContract-Contracts + P2-Vite8-Progress stale rows                                                       |
| P19   | `P19_C06_RESIDUAL_ALLOWLIST_REDUCED`       | PrimeVue exact allowlist 7→6; example-page `primevue/tieredmenu` → `@ccd/vue-ui` `CcdTieredMenu` wrapper; showcase untouched; full GO unchanged |
| P20   | `P20_C06_RESIDUAL_ALLOWLIST_REDUCED`       | PrimeVue exact allowlist 6→5; example-page `primevue/tag` → `@ccd/vue-ui` `CcdTag` wrapper; showcase untouched; full GO unchanged               |

## Issue Status After P16a

| Issue ID | Status                           | Notes                                                                           |
| -------- | -------------------------------- | ------------------------------------------------------------------------------- |
| `B-07`   | `DONE`                           | App-owned crypto terminal boundary (D-016 A)                                    |
| `B-08`   | `DONE`                           | App-owned compression terminal boundary (D-019 A)                               |
| `D-016`  | `APPROVED`                       | Option A, 2026-06-01                                                            |
| `D-017`  | `APPROVED`                       | Options A+D+E, 2026-06-01                                                       |
| `D-019`  | `APPROVED`                       | B-08 compression Option A (new)                                                 |
| `C-06`   | `OPEN` (owner-accepted residual) | 5 exact allowlist + showcase; P14 E1/E2 + P17 + P19 + P20 reduced               |
| `G-02`   | `ACCEPTED_DEFERRED_DEBT`         | 78 tasks owner-accepted deferred debt (P15 acceptance; P18 closed 2 stale rows) |
| `G-03`   | `DONE`                           | Completion gate satisfied (P16)                                                 |
| `M12`    | `PARTIAL`                        | E1/E2 + P17 + P19 + P20 done; E4 reviewed; E3 showcase deferred                 |

## Unresolved Blockers And Decisions

| ID          | Status                           | Required next action                                                                                                                    |
| ----------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `C-06`      | `OPEN` (owner-accepted residual) | 5 exact rows + showcase remain (P17/P19/P20 removed 1 each); further reduction requires separate owner authorization beyond E3 showcase |
| `G-02`      | `ACCEPTED_DEFERRED_DEBT`         | Owner accepted 78 deferred ledger tasks (P15 acceptance; P18 closed 2 evidence-backed rows)                                             |
| `G-03`      | `DONE`                           | P16 completion gate satisfied with owner-accepted residual debt                                                                         |
| `M12`       | `PARTIAL`                        | E1/E2/E4 + P17 + P19 slices complete; E3 showcase long-lived per D-017 Option D                                                         |
| remote push | `DONE`                           | P10g manual push to `origin/main` completed (2026-06-01); verify HEAD via git history                                                   |

## M16a Evidence Path (P9a reconciled)

- `docs/ai-runs/20260531-230000-ccd-m16a-ledger-evidence-polish/` **exists on disk** with `reports/` and `command-logs/` (verified P9a 2026-06-01).
- Prior P0 "missing on disk" note was superseded; see `docs/ai-runs/20260601-120000-ccd-p9a-evidence-path-validation-reconciliation/reports/m16a-evidence-path-reconciliation.md`.

## Validation Status

P16 full matrix logs: `docs/ai-runs/20260601-160000-ccd-p16-final-go-no-go-reconciliation/command-logs/`

P8 full matrix logs: `docs/ai-runs/20260601-106000-ccd-p8-final-go-no-go-reconciliation/command-logs/`

P11 surface reconciliation: `docs/ai-runs/20260601-140000-ccd-p11-remote-state-surface-reconciliation/command-logs/`

P10 commit attempt: `docs/ai-runs/20260601-121000-ccd-p10-local-commits/reports/summary.md`

P9a reconciliation: `docs/ai-runs/20260601-120000-ccd-p9a-evidence-path-validation-reconciliation/reports/summary.md`
