# Human Review Checklist

## Scope

- [ ] Scope matched the active milestone.
- [ ] No unrelated repair lane was touched.
- [ ] No broad rewrite occurred.
- [ ] `STATUS.md` reflects the actual state.

## Architecture

- [ ] `packages/contracts -> packages/core -> apps/*` invariant preserved.
- [ ] `packages/contracts` stayed runtime-neutral.
- [ ] `packages/core` stayed runtime-neutral.
- [ ] No global `@ccd/*` TypeScript aliases added.
- [ ] Package exports still consume build outputs.
- [ ] Runtime APIs stayed in app adapter/approved runtime surfaces.

## Type safety

- [ ] No unjustified `any`.
- [ ] No assertion-driven business logic.
- [ ] Type-check evidence exists.
- [ ] Public types are not coupled to concrete app internals unless approved.

## Tests and validation

- [ ] Required commands were run.
- [ ] Command logs exist.
- [ ] Exit codes are recorded.
- [ ] Failures are not hidden.
- [ ] Skipped checks have rationale.

## Security

- [ ] No secrets in diff or logs.
- [ ] No weakened auth/session/storage boundary.
- [ ] No unapproved dependency change.
- [ ] No production config changes without approval.
- [ ] No generated governance output hand edits.

## UI / accessibility

For UI work:

- [ ] Screenshots exist.
- [ ] Responsive matrix checked.
- [ ] Keyboard/focus behavior checked.
- [ ] Contrast/token rules respected.
- [ ] No forbidden raw styling introduced.

## Performance

- [ ] Build/bundle validation exists if performance-relevant files changed.
- [ ] Startup critical path not worsened without evidence.
- [ ] Bundle risk documented for Vite/dependency changes.

## Compatibility

- [ ] Existing behavior preserved unless explicitly changed.
- [ ] Browser/device compatibility checked where relevant.
- [ ] Desktop build/budget checked if desktop-affecting.

## Rollback readiness

- [ ] Rollback strategy exists.
- [ ] Active-lane changed files are known.
- [ ] Evidence preserved before any rollback.

## Git cleanliness

- [ ] `git status --short --untracked-files=all` recorded.
- [ ] No `git add .`.
- [ ] No `git commit --no-verify`.
- [ ] No push unless explicitly approved.
- [ ] Staged files match allowlist if a commit is requested.

## Final decision

- [ ] `FINAL_GO_NO_GO.md` complete.
- [ ] `FINAL_VALIDATION_MATRIX.md` complete.
- [ ] Remaining risks documented.
- [ ] Next actions clear.
