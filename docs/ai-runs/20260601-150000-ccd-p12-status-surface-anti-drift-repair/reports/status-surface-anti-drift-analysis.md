# P12 Status Surface Anti-Drift Analysis

## Problem

P11 recorded remote commit `0de90f64` as "Latest remote commit (`origin/main`)" in permanent status docs. P11 itself was then pushed as commit `a0c10c1c`, creating immediate self-staling drift: every future status-only commit would invalidate hardcoded HEAD values.

## Drift locations found (pre-P12)

| File | Volatile field | Issue |
|------|----------------|-------|
| `docs/ai-plan/FINAL_GO_NO_GO.md` | `Latest remote commit (origin/main): 0de90f64` | Stale after P11 push |
| `docs/ai-plan/STATUS.md` | `Remote HEAD (origin/main): 0de90f64` | Stale after P11 push |
| `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md` §0 | `latest_remote_commit: 0de90f64` | Used as durable status truth |

## Remediation applied

1. Replaced volatile "latest remote commit / Remote HEAD" wording with **last remote-state reconciliation event** references.
2. P11 evidence directory retained as the reconciliation anchor for P10g push state.
3. Added explicit guidance: use `git log` / remote history as source of truth for current HEAD.
4. Demoted `latest_remote_commit` in repair log §0 to `last_remote_state_reconciliation` (evidence snapshot only, not durable truth).
5. Kept `Final decision: NO_GO` and all blockers (C-06, G-02, G-03, M12) unchanged.

## Post-P12 stable wording pattern

- **Last remote-state reconciliation**: P11, evidence dir `docs/ai-runs/20260601-140000-ccd-p11-remote-state-surface-reconciliation/`, reconciled P10g push state.
- **Current HEAD**: verify via git history, not hardcoded status docs.

## Residual blockers (unchanged)

| ID | Status |
|----|--------|
| C-06 | OPEN |
| G-02 | OPEN (80 tasks) |
| G-03 | BLOCKED |
| M12 | BLOCKED |
