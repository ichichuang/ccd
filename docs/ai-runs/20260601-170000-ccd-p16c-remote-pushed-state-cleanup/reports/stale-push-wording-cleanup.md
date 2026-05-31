# P16c Stale Push Wording Cleanup

## Problem

After P16a landed on `origin/main` at `d53aa9c3`, status surfaces still described P12–P16a as local/unpushed commits. That wording was stale relative to the verified remote state.

## Stale phrases removed

| File | Before | After |
|------|--------|-------|
| `docs/ai-plan/STATUS.md` | `Stage/commit/push/clean/reset/rebase in P0–P16a: local commits only; no push after P10g.` | `P12–P16a have been pushed to origin/main; no clean/reset/rebase was performed.` |
| `docs/ai-plan/STATUS.md` | `P12–P16a local commits (unpushed, 2026-06-01): ...` | `P12–P16a commits are present on origin/main through d53aa9c3.` |
| `docs/ai-plan/FINAL_GO_NO_GO.md` | `Local P12–P16 commits remain unpushed unless owner separately authorizes push.` | `P12–P16a status and evidence are present on origin/main through d53aa9c3.` |

## Files searched, not changed

| File | Reason |
|------|--------|
| `docs/ai-plan/ARCHITECTURE_ISSUE_REPAIR_LOG.md` | No `unpushed`, `local commits`, or `Local P12` matches in §0 or implementation log |

## Preserved semantics

- Final decision remains **`CONDITIONAL_GO`**
- Full GO remains unauthorized
- **C-06** remains owner-accepted residual debt
- **G-02** remains owner-accepted deferred debt
- **M12** remains `PARTIAL`
- **G-03** remains `DONE` only as conditional completion gate
- No runtime source, package manifest, lockfile, or generated output changes

## Remote verification (2026-06-01)

- Branch: `main`
- `HEAD`: `d53aa9c3`
- `origin/main`: `d53aa9c3`
- Latest commit message: `docs(architecture): 修正 P16 条件通过状态与残余债务表述`
