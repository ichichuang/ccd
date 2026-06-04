# ROLLBACK — Rollback Guidance

## Principles

- Preserve evidence before rollback.
- Revert the smallest safe change set.
- Do not use destructive Git commands unless explicitly approved.
- After rollback, rerun validation relevant to the reverted area.
- Update `STATUS.md` and `RISK_REGISTER.md`.

## Reverting code changes safely

Preferred approach:

1. Identify files changed by the current task using non-destructive diff commands.
2. Copy or record the failing diff under `diffs/`.
3. Manually revert only the task-local edits or apply a carefully reviewed reverse patch.
4. Rerun task-level validation.
5. Record rollback summary under `reports/rollback-<task-id>.md`.

Do not run `git reset` or `git clean` unless the user explicitly approves.

## Reverting dependency changes

Dependency changes are not approved by default. If an approved dependency change must be reverted:

1. Preserve manifest and lockfile diffs.
2. Restore prior manifest/lockfile content using a reviewed patch.
3. Run package resolution smoke validation.
4. Run affected build/type/test commands.
5. Record dependency rollback evidence.

## Reverting configuration changes

Configuration changes are not expected except local build/test config adjustments explicitly approved by a milestone.

To revert:

1. Preserve config diff.
2. Restore previous values manually.
3. Run the config owner validation command.
4. Record before/after behavior.

Production configuration is out of scope and requires explicit approval.

## Reverting migrations or data changes

No database migrations, schema changes, data backfills, or destructive data operations are in scope. If a task appears to require them, stop before implementation and request approval.

## Reverting generated file changes

Generated files must be changed only by owning generators.

If generated drift appears:

1. Preserve generated diff.
2. Identify owning generator.
3. Re-run owning generator if appropriate.
4. If drift remains unexplained, stop and mark blocked.
5. Do not manually edit generated files.

## Preserving evidence before rollback

Before any rollback:

- Save command logs.
- Save diff summary.
- Save screenshots if relevant.
- Update `STATUS.md` with failure state.
- Record rollback intent.

## Verifying rollback success

Run at least:

- The failed command that triggered rollback.
- Affected package/app type-check.
- Affected tests.
- Guard/governance commands if package boundaries changed.

## Human approval required

Human approval is required before:

- Destructive Git rollback.
- Dependency or lockfile rollback if it mutates package state.
- Production config rollback.
- Database rollback.
- Broad rewrite or cross-milestone rollback.
