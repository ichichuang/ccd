# M4 Adapter Materialization and Scope Report

## Outcome

- Milestone: `M4 — System preference contract split`
- Approval ID: `M4-AI-ADAPTER-MATERIALIZATION-APPROVED`
- Status: `DONE`
- Result: Approved adapter materialization resolved the M4 preflight blocker. `pnpm ai:doctor` and `pnpm codex:preflight` passed before M4 source edits.

## Original Blocker

- `pnpm codex:preflight` failed before M4 source edits because required generated adapter paths were missing:
  - `.ai/protocol/adapters/claude.md`
  - `AGENTS.md`
  - `CLAUDE.md`
- Evidence: `../command-logs/030-codex-preflight-before-m4.log`

## Materialization Commands

| Command | Result | Evidence |
| --- | --- | --- |
| `test ! -e .cursor` | PASS | `../command-logs/032-cursor-existence-check.log` |
| `pnpm ai:sync` | FAIL_THEN_PASS | Literal run hit the local `mise.toml` trust shim: `../command-logs/034-pnpm-ai-sync-approved.log`; process-local trusted-env rerun passed: `../command-logs/035-pnpm-ai-sync-approved-trusted-env.log` |
| `pnpm ai:doctor` | PASS | `../command-logs/039-pnpm-ai-doctor-after-ai-sync.log` |
| `pnpm codex:preflight` | PASS | `../command-logs/040-pnpm-codex-preflight-after-ai-sync.log` |

## Post-Materialization Diff

- `package.json` and `pnpm-lock.yaml` diff: empty.
- Tracked generated diff under approved AI surfaces:
  - `.ai/manifests/rule-index.json`
- Materialized ignored adapter/runtime files observed:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `.ai/protocol/adapters/claude.md`
  - `.ai/runtime/repair-ledger.json`
- `.cursor` was absent before execution and absent after execution.
- Evidence:
  - `../command-logs/031-adapter-materialization-initial-checks.log`
  - `../command-logs/036-post-ai-sync-required-checks.log`
  - `../command-logs/037-post-ai-sync-ai-diff-name-status.log`
  - `../command-logs/041-post-preflight-adapter-file-state.log`

## M4 Scope Confirmation

PLAN.md exact title:

`Milestone M4 — System preference contract split`

Approved M4 scope:

- Extract type-only preference contracts.
- Update app guards/runtime to consume type contracts explicitly.
- Keep Zod schema, sanitizer runtime, sync runtime, app stores, local persistence, and normalization app-owned unless separately approved.

No M4 plan requirement forces dependency changes, lockfile changes, new package creation, production config changes, destructive Git operations, broad rewrites, generated manual edits, or runtime behavior changes outside the approved narrow scope.

## Residual Risks

- `pnpm ai:sync` reported legacy `.cursor` cleanup even though `.cursor` was absent before execution; post-check confirms no `.cursor` path and no tracked deletion.
- `pnpm ai:doctor` and `pnpm codex:preflight` internally ran `ci:prepare-internal`, including package artifact cleanup/rebuild through repository-owned scripts.
- Continue only through M4; do not advance to M5.
