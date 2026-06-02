# SECURITY AND APPROVALS

## Allowed

- Read repository files.
- Run local validation commands.
- Modify code within active lane scope.
- Generate evidence.
- Commit locally after validation.

## Requires approval

- Push.
- package manifest or lockfile changes.
- new dependencies.
- destructive git operations.
- production config, secrets, auth flows, deployment settings.
- broad rewrites outside lane scope.

## Forbidden

- `git clean`, `git reset`, `git rebase`, force push, history rewrite.
- manual generated file edits.
- secret exposure.
- Clawd/theme issue work.
- weakening architecture guards.
