# P0 Blocker Baseline Table

Generated: 2026-06-01  
Evidence run: `docs/ai-runs/20260601-100000-ccd-p0-post-m16-blocker-baseline/`

| blocker_id | related_decision | current_status | evidence_file | approval_present | implementation_allowed | lanes_blocked | next_required_action |
|---|---|---|---|---|---|---|---|
| B-07 | D-016 | BLOCKED | `docs/ai-runs/20260531-130051-ccd-m6-owner-decision-packet/reports/b07-safe-storage-crypto-owner-decision.md` | no (PROPOSED) | non-crypto cleanup only after P1 | crypto migration | P1 record Option A approval |
| B-08 | — | OPEN | `docs/ai-runs/20260531-144505-ccd-m7-safe-storage-codec-foundation/reports/safe-storage-codec-dependency-map.md` | no | no manifest lane | P5 compression migration | P2 confirm app-owned Option A |
| C-06 | D-017 | OPEN | `docs/ai-runs/20260531-121402-ccd-m5-cleanup-planning/reports/primevue-allowlist-reduction-plan.md` | no (PROPOSED) | guard posture docs only | M12/P6 allowlist reduction | P3 record Option A+D approval |
| D-016 | — | PROPOSED | `docs/ai-plan/DECISIONS.md` | owner selected A (pending P1 write) | P1 decision lane | P4 crypto movement | P1 lane |
| D-017 | — | PROPOSED | `docs/ai-plan/DECISIONS.md` | owner selected A+D (pending P3 write) | no reduction impl | P6/M12 | P3 lane |
| G-02 | — | OPEN | `.ai/runtime/repair_list.md`, `pnpm ai:doctor --open` | n/a | P7 classification only | G-03 | P7 reconciliation |
| G-03 | — | BLOCKED | `docs/ai-plan/FINAL_GO_NO_GO.md` | n/a | P8 only | GO | P8 after P1–P7 |
| M12 | D-017 | BLOCKED | `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md` §11 | no Option E | skip P6 | allowlist source migration | future owner lane |
| review/commit | — | OPEN | `docs/ai-runs/20260531-215707-ccd-m15-no-go-surface-sync-review-package/` | n/a | P9 only | release | P9 review package |

## Acceptance checks

- B-07 remains BLOCKED until P1 records D-016 approval: **confirmed**
- B-08 remains OPEN until P2: **confirmed**
- C-06 remains OPEN until P3: **confirmed**
- D-016/D-017 remain PROPOSED: **confirmed**
- G-02 OPEN with 80 tasks: **confirmed**
- G-03 BLOCKED: **confirmed**
- Top-level NO_GO: **confirmed**

## M16a evidence gap

- Referenced path: `docs/ai-runs/20260531-230000-ccd-m16a-ledger-evidence-polish/`
- On-disk status: **missing**
- Classification: `P0_LEDGER_INCONSISTENT` (ledger text vs evidence directory)
