# M7 Risk Notes

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
