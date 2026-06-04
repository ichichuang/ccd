# M5 Plan Scope and Initial Evidence

## Outcome

- Approval ID: `M5-PLAN-SCOPE-EXECUTION-APPROVED`
- Milestone: `M5 - Sync runtime owner decision and optional extraction plan`
- Status: `IN_PROGRESS`
- Active worktree: `/Users/cc/MyPorject/ccd-public-layer-repair-m1`
- Branch: `codex/public-layer-repair-m1`
- HEAD: `343a540a92b8a1bd5e8bb86eec7772f15946aab1`

## Required Initial Checks

| Check | Result | Evidence |
| --- | --- | --- |
| `pwd` matches approved worktree | PASS | `../command-logs/m5-001-pwd.log` |
| Branch matches approved branch | PASS | `../command-logs/m5-002-branch.log` |
| HEAD recorded | PASS | `../command-logs/m5-003-head.log` |
| Full `git status --short` recorded | PASS | `../command-logs/m5-004-status-short.log` |
| Protected manifest diff check recorded | PASS, empty diff | `../command-logs/m5-005-protected-manifest-diff.log`, `../command-logs/m5-017-protected-manifest-diff-check.log` |
| M1-T03 marked DONE | PASS | `../command-logs/m5-012-status-milestone-confirmations.log` |
| M2 validation marked DONE | PASS | `../command-logs/m5-012-status-milestone-confirmations.log` |
| M3 validation marked DONE | PASS | `../command-logs/m5-012-status-milestone-confirmations.log` |
| M4 validation marked DONE / STOP_AFTER_M4 | PASS | `../command-logs/m5-012-status-milestone-confirmations.log` |
| M4 validation summary records final governance rerun | PASS | `../command-logs/m5-013-read-m4-validation-summary.log` |
| M4 adapter materialization evidence records approval and preflight | PASS | `../command-logs/m5-014-read-m4-adapter-summary.log` |
| AI adapter status recorded | PASS | `../command-logs/m5-015-current-ai-adapter-status.log` |
| `AGENTS.md`, `CLAUDE.md`, and `.ai/protocol/adapters/claude.md` exist | PASS | `../command-logs/m5-016-required-adapter-file-checks.log` |
| Repo-local skill router executed | PASS after process-local `MISE_TRUSTED_CONFIG_PATHS` rerun | `../command-logs/m5-025-run-skill-router.log`, `../command-logs/m5-031-run-skill-router-trusted-env.log` |

## Exact PLAN.md M5 Scope

Title:

`Milestone M5 - Sync runtime owner decision and optional extraction plan`

Purpose:

Decide whether sync runtime should remain app-owned or move to a new/public runtime owner in a future approved lane.

Scope:

Produce an owner decision and, only if approved without manifest risk, implement a minimal extraction of transport-agnostic pure sync types/helpers. Otherwise classify as deferred.

Out of scope:

No new package creation, manifest edits, lockfile edits, external WebSocket access, or broad sync runtime rewrite without approval.

Evidence: `../command-logs/m5-018-plan-m5-section.log`.

## Scope Gate Decision

Current M5 does not have separate approval for a sync package owner, manifest/dependency changes, or moving browser transport/runtime code into a package. Current source evidence shows the reusable-looking sync surface is coupled to browser transport, VueUse timers, env access, app stores, safeStorage, and system preference runtime.

Therefore M5 execution is decision-only:

- M5-T01: audit current sync coupling.
- M5-T02: refresh the owner decision.
- M5-T03: mark extraction `DEFERRED`.
- M5-T04: keep guard/documentation refinement `DEFERRED` to a future approved owner/guard lane.

No source implementation, package manifest, lockfile, generated registry, production config, deployment config, or secret file is required by the approved M5 path.
