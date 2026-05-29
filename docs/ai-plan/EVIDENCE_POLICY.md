# CCD Evidence Policy

## Active run directory naming

Use:

`docs/ai-runs/YYYYMMDD-HHMMSS-ccd-architecture-repair/`

Inside it create:

- `command-logs/`
- `diffs/`
- `reports/`
- `screenshots/`
- `sources/`

## Required evidence per task

Each task needs:

- task ID;
- status;
- files inspected;
- files changed;
- validation commands run;
- command log paths;
- diff summary;
- rollback note;
- blockers or approvals;
- `NOT_APPLICABLE` reason when skipped.

## Required evidence per milestone

Each milestone needs:

- milestone summary;
- acceptance criteria checklist;
- validation summary;
- changed files list;
- generated drift handling;
- risk changes;
- decision updates;
- next action.

## Required final evidence

- full validation logs;
- final diff summary;
- final status;
- final risk register;
- final go/no-go;
- final validation matrix;
- final operator SOP;
- final next actions.

## Console output capture

For every command:

- save full stdout/stderr to `command-logs/`;
- record exit code;
- record timestamp;
- summarize result in `STATUS.md`.

Recommended log naming:

`command-logs/MILESTONE-TASK-YYYYMMDD-HHMMSS-command-slug.log`

## Screenshot expectations

For UI work, capture:

- desktop light;
- desktop dark;
- tablet;
- mobile;
- interaction states where relevant;
- before/after if possible.

Screenshot metadata must include:

- route;
- viewport;
- theme;
- browser;
- timestamp;
- related task ID.

## Test result expectations

A passing test claim is valid only if:

- command is recorded;
- exit code is recorded;
- log path exists;
- failure summaries are not omitted.

## Diff summary expectations

For each milestone:

- list changed files;
- group files by lane;
- explain why each file belongs in scope;
- identify generated files;
- identify restored generated drift.

## External source citation expectations

For version-specific or security/tooling facts:

- cite official docs, release notes, changelogs, source repositories, or vendor docs;
- record sources in `sources/`;
- do not rely on memory for current dependency facts.

## `BLOCKED` status

Record:

- blocker ID;
- failed task;
- command or evidence causing block;
- exact reason;
- proposed next narrow action;
- whether owner approval is needed.

## `NOT_APPLICABLE` status

Record:

- task ID;
- reason not applicable;
- evidence that the condition does not apply;
- reviewer or operator confirmation if needed.

## Failed validation

When validation fails:

1. Stop.
2. Save logs.
3. Mark task `BLOCKED`.
4. Update `STATUS.md`.
5. Do not broaden scope.
6. Ask operator if fix requires another lane.

## Avoid fabricating evidence

Never mark `DONE` unless evidence exists. Do not summarize a command as passed if it was not run. Do not invent screenshots, logs, source citations, test names, or validation results.
