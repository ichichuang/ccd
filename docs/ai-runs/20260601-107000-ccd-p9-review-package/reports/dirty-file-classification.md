# P9 Dirty File Classification (Summary)

Generated: 2026-06-01  
Full listing: `reports/git-status-full.txt` (**975** status lines)

## Category totals (approximate)

| category | modified tracked | untracked | should_commit | notes |
|---|---|---|---|---|
| governance-policy | 3 | 1 snapshot | yes | G1 |
| generated | 6+ | 1 | yes (via gate) | G1; command-owned |
| package-source | 6 | 0 | yes | G2 |
| source (web-demo) | 8 | 3 specs | yes | G3 |
| doc/status-surface | 8+ | 1 ARCH log | yes | G4 |
| doc/architecture | 6 | 0 | yes | G4 |
| evidence (ai-runs) | 0 | ~850+ | yes (grouped) | G4 |
| tooling/scripts | 8 | 0 | yes | G5 |
| config | 2 | 0 | yes | G3/G6 |
| local IDE | 0 | 1+ | **no** | `.cursor/plans/` |
| duplicate input | 0 | 1 | **no** | root CCD_ARCHITECTURE_ISSUE_REPAIR_LOG.md |

## Modified tracked files (51 after P4)

Includes all M1–M16a inherited modifications plus:

| file | lane_origin | category | requires_human_review |
|---|---|---|---|
| `apps/web-demo/src/utils/safeStorage/index.ts` | P4 | source | yes — comment-only ownership boundary |
| `docs/ai-plan/DECISIONS.md` | P1–P3 | doc/decisions | yes |
| `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md` | P0–P8 | doc/status | yes |
| `docs/ai-plan/FINAL_GO_NO_GO.md` | P8 | doc/status | yes |
| `docs/ai-plan/STATUS.md` | P8 | doc/status | yes |

## P0–P9 new evidence directories (untracked)

| directory | lane |
|---|---|
| `docs/ai-runs/20260601-100000-ccd-p0-post-m16-blocker-baseline/` | P0 |
| `docs/ai-runs/20260601-101000-ccd-p1-d016-safe-storage-crypto-decision/` | P1 |
| `docs/ai-runs/20260601-102000-ccd-p2-b08-compression-lz-string-decision/` | P2 |
| `docs/ai-runs/20260601-103000-ccd-p3-d017-primevue-reduction-decision/` | P3 |
| `docs/ai-runs/20260601-104000-ccd-p4-safe-storage-non-crypto-cleanup/` | P4 |
| `docs/ai-runs/20260601-105000-ccd-p7-repair-ledger-reconciliation/` | P7 |
| `docs/ai-runs/20260601-106000-ccd-p8-final-go-no-go-reconciliation/` | P8 |
| `docs/ai-runs/20260601-107000-ccd-p9-review-package/` | P9 |

## Review package status

- **P9_REVIEW_PACKAGE_READY**
- Commits: **not authorized** in this lane
