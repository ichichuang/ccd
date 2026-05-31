# P7 Repair-Ledger Task Reconciliation

Generated: 2026-06-01  
Source: `pnpm ai:doctor --open` → 80 open tasks  
Run: `docs/ai-runs/20260601-105000-ccd-p7-repair-ledger-reconciliation/`

## Summary

| classification | count | proposed_new_status | close in ledger? |
|---|---|---|---|
| BLOCKED_BY_OWNER | 9 | remain open | no |
| BLOCKED_BY_OPERATOR | 22 | remain open | no |
| BLOCKED_BY_PRODUCT | 0 | — | — |
| DEFERRED | 5 | remain open (explicit deferral) | no |
| ACTIONABLE_FUTURE_LANE | 1 | remain open | no |
| DONE_WITH_EVIDENCE | 0 | — | no — no task met strict closure evidence in P7 |
| STALE_LEDGER_ENTRY | 0 | — | no |
| NEEDS_INVESTIGATION | 0 | — | — |
| **Total open** | **80** | — | **0 closed in P7** |

**G-02 status after P7**: `OPEN` (80 tasks remain; all classified)

**Final P7 status**: `P7_REPAIR_LEDGER_CLASSIFIED_NONZERO`

## Group reconciliation

### P1 Guard coverage (9 tasks) — BLOCKED_BY_OWNER

| task module | count | related_issue | reason | owner_needed |
|---|---|---|---|---|
| P1-Guard-* | 8 | G-03, ADR-006 | pending owner Decision 2/3/4 on guard strictness | yes |
| P1-Guard-OwnerSignoff | 1 | G-03 | no guard scope owner signoff | yes |

### P1 HTTP contracts (1 task) — ACTIONABLE_FUTURE_LANE

| task_id | source_file | classification | reason |
|---|---|---|---|
| P1-HttpContract-Contracts | `.ai/runtime/repair_list.md` §12 | ACTIONABLE_FUTURE_LANE | D-014 approved type-only HTTP contract scope; implementation lane not executed |

### P2 Dependency modernization (7 tasks) — BLOCKED_BY_OPERATOR

All `P2-Deps-*` tasks blocked pending operator approval for isolated dependency lanes.

### P2 GitHub governance (2 tasks) — BLOCKED_BY_OPERATOR

`P2-GitHub-Codeowners`, `P2-GitHub-Templates` — `.github/**` edits require operator approval.

### P2 Vite 8 (9 tasks) — BLOCKED_BY_OPERATOR

All `P2-Vite8-*` tasks blocked pending isolated Vite 8 branch/worktree approval.

### P3 Login Diorama (43 tasks) — BLOCKED_BY_OPERATOR

All `P3-Login-*` tasks blocked pending M11 operator approval; no login implementation authorized.

### P4 Strategic deferred (5 tasks) — DEFERRED

| task_id | classification | reason |
|---|---|---|
| P4-NewOrganization-Deferred | DEFERRED | strategic out of scope |
| P4-Starter-Deferred | DEFERRED | needs owner approval |
| P4-DesignSystem-Deferred | DEFERRED | prerequisites incomplete |
| P4-RekaUI-Deferred | DEFERRED | no approved gap lane |
| P4-TanStackQuery-Deferred | DEFERRED | product complexity threshold not met |

### P4 Desktop drift CI (1 task) — BLOCKED_BY_OWNER

`P4-DesktopDriftCI` — pending owner sign-off on desktop drift CI scope.

## Mapping to architecture blockers (post P1–P3)

| architecture ID | related open tasks | classification |
|---|---|---|
| B-07 | 0 | DONE (P1) |
| B-08 | 0 | DONE (P2) |
| C-06 | 0 direct ledger tasks | OPEN issue; guard posture approved P3 |
| D-016 | 0 | APPROVED (P1) |
| D-017 | 0 | APPROVED (P3) |
| G-03 | all blocked/deferred groups | BLOCKED |

## Closure policy applied

No `[ ]` → `[x]` checkbox edits were made in `.ai/runtime/repair_list.md` because every open task remains legitimately blocked, deferred, or awaiting a future implementation lane with explicit owner/operator approval.

## Evidence

- Full task dump: `../20260601-100000-ccd-p0-post-m16-blocker-baseline/command-logs/08-pnpm-ai-doctor-open-full.log`
- Post-P7 count: `command-logs/01-pnpm-ai-doctor-open.log`
