# CCD Operator SOP

## How to start

1. Unzip the planning package at the repository root, or let Codex Desktop copy files.
2. Paste `CODEX_GOAL_PROMPT.txt` into Codex Desktop.
3. Let Codex run M0 only.
4. Review `docs/ai-plan/STATUS.md` and active `docs/ai-runs/**`.

## How to rerun baseline validation

Use:

```bash
git status --short --untracked-files=all
git log -10 --oneline
git branch --show-current
git diff --check
```

For post-7 checkpoint or final validation, use the commands in `VALIDATION.md`.

## How to inspect evidence

1. Open active run directory:
   `docs/ai-runs/YYYYMMDD-HHMMSS-ccd-architecture-repair/`
2. Check:
   - `command-logs/`
   - `reports/`
   - `diffs/`
   - `screenshots/`
   - `sources/`
3. Confirm every `DONE` task has evidence.

## How to continue next milestone

1. Confirm `STATUS.md` current milestone is complete.
2. Confirm no blocker remains.
3. Choose exactly one next milestone.
4. Give Codex Desktop a mission packet for that milestone.
5. Require Codex to stop after that milestone.

Recommended first implementation milestone after M0 and post-7 checkpoint:

`M2 — Capability Bridge generics`

## How to handle generated drift

Known recurring generated drift:

- `apps/web-demo/src/types/auto-imports.d.ts`
- `apps/web-demo/src/views/example/components/icons/configs/iconLists.generated.ts`

If unrelated, inspect and report. Restore only if safe.

If any of these change unexpectedly, stop and report:

- `docs/generated/**`
- `.ai/generated/**`
- `.ai/governance/api-snapshots/**`

Do not manually edit generated governance outputs.

## How to rollback

Use `ROLLBACK.md`. Avoid destructive git commands unless explicitly approved.

Preferred rollback is manual targeted revert of active-milestone files.

## How to prepare a commit

Only if operator asks.

1. Run pre-stage status check.
2. Define exact dirty-file allowlist.
3. Stage exact files only.
4. Never use `git add .`.
5. Run `git diff --cached --check`.
6. Use a detailed Simplified Chinese commit message.
7. Use normal `git commit`.
8. Never use `--no-verify`.
9. Do not push unless explicitly approved.

## How to push

Do not push unless the operator explicitly confirms:

- target branch;
- that push is allowed;
- whether force push is forbidden or allowed.

Default: do not push.

## How to stop safely

Stop when:

- validation fails;
- evidence is missing;
- scope broadens;
- dependency change becomes necessary;
- generated governance drift is unexpected;
- risky git operation is needed;
- runtime-neutrality cannot be proven.
