# REVIEW_CHECKLIST — Human Reviewer Checklist

## Scope match

- [ ] Work matches the public-layer repair plan.
- [ ] No unrelated broad rewrites were introduced.
- [ ] Non-goals were respected.

## Architecture risk

- [ ] `@ccd/contracts` remains runtime-neutral unless explicitly approved otherwise.
- [ ] Runtime helpers are in an approved runtime owner.
- [ ] App stores, route views, plugin shells, generated files, and runtime adapters remain app-owned unless explicitly approved.
- [ ] No package boundary or dependency direction violation is introduced.

## Type safety

- [ ] Public contracts are explicit and typed.
- [ ] App-local ambient globals are reduced only where safe.
- [ ] No duplicate ambiguous API response contracts remain.
- [ ] Type-check evidence is present.

## Test coverage

- [ ] Route/access/redirect/menu helper tests cover semantics and security edge cases.
- [ ] API/DTO and system preference tests cover updated contracts.
- [ ] Sync/build deferred decisions have evidence if not implemented.
- [ ] Tests were not removed or weakened to pass validation.

## Validation evidence

- [ ] Every PASS in final matrix has a command log or manual evidence path.
- [ ] Every BLOCKED/DEFERRED/NOT_APPLICABLE has evidence.
- [ ] Baseline validation is recorded.
- [ ] Final Git status/diff are recorded using non-destructive commands.

## Security

- [ ] Safe redirect behavior is preserved.
- [ ] Role/auth semantics are preserved.
- [ ] No secrets or credentials are logged.
- [ ] No external services or production systems were accessed without approval.

## Performance

- [ ] No unnecessary dependencies were added.
- [ ] Bundle/build impact is documented if relevant.
- [ ] Theme/size DOM writer changes do not introduce repeated layout/style recalculation problems.

## Accessibility and UI compatibility

- [ ] UI smoke evidence exists if route/menu/theme/layout behavior changed.
- [ ] Responsive states were checked if layout/menu changes occurred.
- [ ] Keyboard/accessibility smoke was checked if menu behavior changed.

## Compatibility

- [ ] Existing app import compatibility is preserved or deprecated safely.
- [ ] Persisted state compatibility is preserved.
- [ ] Generated files are produced only by owning commands.
- [ ] Desktop and web-demo are validated when shared packages changed.

## Rollback readiness

- [ ] Rollback notes exist per milestone/task.
- [ ] Failed validation logs, if any, are preserved.
- [ ] No rollback requires destructive Git unless separately approved.

## Documentation completeness

- [ ] `STATUS.md` final state is accurate.
- [ ] `DECISIONS.md` records owner decisions.
- [ ] `RISK_REGISTER.md` is updated.
- [ ] `CHANGE_SUMMARY.md` matches the diff.
- [ ] `OPERATOR_SOP.md` and `NEXT_ACTIONS.md` are usable.

## Git cleanliness

- [ ] No commit/push/reset/clean/rebase/history rewrite occurred unless explicitly requested.
- [ ] Final `git status --short` is recorded.
- [ ] Unrelated changes are identified.

## Go/no-go decision

- [ ] Final decision is evidence-backed.
- [ ] Residual risks are acceptable or clearly blocked/deferred.
- [ ] The agent stopped at the required final stop condition.
