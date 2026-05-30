# CCD Rollback Guidance

## General rollback

Before rollback:

1. Preserve evidence.
2. Save current `git status`.
3. Save current diff summary.
4. Identify active milestone and task.
5. Ask approval if rollback requires destructive git operations.

Preferred rollback:

- manually revert only files changed by the active milestone;
- avoid `git reset`;
- avoid `git clean`;
- avoid deleting branches;
- do not discard evidence.

## Code changes

Rollback by:

- reverting targeted source edits;
- keeping evidence files unless operator says otherwise;
- re-running milestone validation.

Verify rollback:

- `git diff --check`
- targeted validation command
- `git status --short --untracked-files=all`

## Dependency changes

Rollback by:

- restoring package manifests and lockfile from pre-change diff;
- running `pnpm install --frozen-lockfile`;
- running targeted and full validation as required.

Requires approval if:

- lockfile rewrite broadens beyond target lane;
- package manager tries to remove many packages;
- peer conflicts require additional changes.

## Configuration changes

Rollback by:

- restoring exact config files;
- validating affected scripts;
- checking no production config changed.

## Migrations or data changes

No migrations/data changes are currently in scope.

If any migration/data operation is discovered:

1. Stop.
2. Preserve evidence.
3. Ask for explicit approval.
4. Require backup, staging validation, and rollback plan before proceeding.

## Generated files

If generated files changed:

- identify command that produced them;
- do not manually edit generated governance outputs;
- if unexpected, stop and report.

## P4 planning-only rollback

Rollback for the 2026-05-30 P4 planning-only lane is documentation/evidence-only:

- revert the P4 planning/status/risk/decision doc edits from the active lane;
- preserve command logs and reports unless the operator explicitly requests removal;
- do not use rollback to create/delete repositories, mutate GitHub remote settings, edit `.github/**`, change packages, change dependencies, touch auth/HTTP/runtime UI, or manually edit generated files;
- rerun `pnpm docs:commands`, `pnpm ai:doctor --open`, `pnpm codex:preflight`, `pnpm validate:governance`, `git diff --check`, and `git status --short --untracked-files=all`.

## Preserve evidence before rollback

Always keep:

- failed command logs;
- diff before rollback;
- blocker report;
- rollback validation logs.

## Human approval required

Approval required for:

- destructive git rollback;
- dependency rollback involving lockfile conflicts;
- branch deletion;
- production config rollback;
- external system rollback.

## Rollback success criteria

Rollback is successful when:

- active-lane files are restored to the intended state;
- validation for the affected lane passes or failure is documented;
- no unrelated generated drift remains;
- `STATUS.md` records rollback outcome;
- evidence has been preserved.
