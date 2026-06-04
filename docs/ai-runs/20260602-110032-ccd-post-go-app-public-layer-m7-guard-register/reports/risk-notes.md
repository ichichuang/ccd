# M7 Risk Notes

## Post-merge note

This document records the pre-merge execution and closeout state of the public-layer repair and post-GO apps public-layer certification lane. PR #38 has since been merged into `main`. Historical statements such as "ready for human review", "branch remains unmerged", or "do not merge" refer to the execution-time branch state rather than the current `main` branch state. Any residual risks noted here remain future improvement lanes, not blockers to the completed merge.

## Residual risks

- Deferred candidates still require explicit owner or dependency decisions
  before any future movement.
- Generated artifacts can drift after owning commands; final M8 must repeat the
  generated normalization and diff checks.
- App build utilities remain app-owned because no build package exists.

## Controls

- Existing guard commands cover the remaining boundaries.
- Final app-owned register records why each remaining app surface stays in apps.
- M8 will run the full validation matrix before certification.

## No-go items preserved

- No manifest or lockfile change.
- No destructive git operation.
- No push.
- No manual generated edits.
- No guard weakening.
