# EVIDENCE_POLICY — Evidence Collection Rules

## Active run directory

Before implementation, create:

`docs/ai-runs/YYYYMMDD-HHMMSS-ccd-public-layer-repair/`

Required subdirectories:

- `reports/`
- `command-logs/`
- `diffs/`
- `screenshots/`
- `artifacts/`

Create `reports/run-metadata.md` containing:

- Start date/time.
- Agent/tool used.
- Repository branch or detached state.
- Node and pnpm versions.
- Workspace status summary.
- Plan version or package source.

## Required evidence per task

Each task must collect:

- Task ID and status.
- Summary of changed files or evidence-only result.
- Commands run, with log paths and exit statuses.
- Diff summary if files changed.
- Acceptance criteria status.
- Rollback note.
- Blockers or assumptions.

## Required evidence per milestone

Each milestone must collect:

- Milestone summary report.
- Candidate or consumer map if discovery was involved.
- Decision entries if owner/boundary decisions were involved.
- Validation command logs.
- Diff summary.
- Updated `STATUS.md` excerpt or reference.
- Remaining risks.

## Required final evidence

Final evidence must include:

- `FINAL_VALIDATION_MATRIX.md` completed.
- `FINAL_GO_NO_GO.md` completed.
- `CHANGE_SUMMARY.md` completed.
- Final `RISK_REGISTER.md` update.
- Final `STATUS.md` update.
- `command-logs/final-git-status-short.log` or equivalent non-destructive status log.
- `diffs/final-diff-summary.patch` or equivalent diff summary.
- Screenshots if UI-affecting work occurred.

## Console output capture expectations

For every command:

- Capture stdout and stderr.
- Capture exit code.
- Include timestamp or command sequence number.
- Store logs under `command-logs/`.
- Summarize results in `reports/*validation*.md`.

Do not truncate logs in a way that hides failures. If logs are large, provide a summary plus path to full log.

## Screenshot expectations

Screenshots are required when:

- Theme, size, layout, menu, route rendering, or PrimeVue behavior changes.
- Browser smoke tests are run.
- Manual visual validation is used because automated visual tests are unavailable.

Store screenshots under `screenshots/` with names that include milestone/task and viewport.

## Test result expectations

A test is passed only when:

- The command was run in the active repository state.
- Exit status is zero.
- The log is saved.
- The summary identifies command, purpose, and evidence path.

## Diff summary expectations

For every task that changes files, record:

- `git diff --name-only` output.
- A short explanation per changed file.
- Whether generated files changed and which owning command produced them.
- Whether manifest or lockfile changed. If yes, stop unless explicitly approved.

Do not run destructive Git commands.

## External source citation expectations

If current version-specific or security-sensitive facts are needed, use current official sources and cite them in the relevant report. Prefer official docs, specs, release notes, changelogs, and repository source.

## Recording `BLOCKED`

A blocked task must record:

- Blocking condition.
- Why it blocks safe execution.
- Required human decision or environment change.
- Evidence path.
- Proposed next action.

## Recording `NOT_APPLICABLE`

A not-applicable task must record:

- Candidate reviewed.
- Why it does not apply.
- Evidence proving non-applicability.
- Whether a future trigger should reopen it.

## Recording `DEFERRED`

A deferred task must record:

- Deferred owner or future lane.
- Why current lane must not implement it.
- Approval or dependency needed.
- Escalation trigger.

## Handling failed validation

1. Preserve failed log.
2. Update `STATUS.md`.
3. Classify failure as baseline, introduced, environment-blocked, or unknown.
4. Apply smallest safe fix only if within scope.
5. Re-run failed and dependent validations.
6. Stop for approval if fix crosses a protected operation.

## Anti-fabrication rule

Never state that validation passed, evidence exists, a command ran, a diff is clean, or a file was inspected unless the active run directory contains evidence.
