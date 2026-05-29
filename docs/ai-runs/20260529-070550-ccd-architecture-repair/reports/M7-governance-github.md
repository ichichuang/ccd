# M7 Governance and GitHub Repository Report

## Scope

- Task IDs: `P2-Governance-*`, `P2-GitHub-*`
- Lane: M7 only.
- Out of scope: remote GitHub setting changes, pushes, commits, release automation rewrites, dependency upgrades.

## Inventory

- `.github/CODEOWNERS` exists.
- `.github/PULL_REQUEST_TEMPLATE.md` exists and already references `pnpm governance:gate`, `pnpm type-check`, `pnpm lint:check`, generated artifacts, and UI snapshot review.
- `.github/ISSUE_TEMPLATE/bug_report.md` and `feature_request.md` exist.
- `.github/workflows/ci.yml` exists with `Core Quality` and `E2E QA` jobs.
- CI `Core Quality` includes deterministic install, runtime summary, `ai:sync`, `ai:doctor`, `validate:governance`, generated AI artifact sync, `type-check`, tests, lint, production build, desktop build, and desktop budget.
- `validate:governance` maps to `pnpm governance:gate`.
- No `dependabot.yml` file exists.

## Generated artifact discipline

- `docs/generated/**`, `.ai/generated/**`, and `.ai/governance/api-snapshots/**` were not manually edited.
- Earlier generated drift was produced by official commands (`pnpm api:report`, `pnpm governance:refresh`, `pnpm governance:gate`).
- `pnpm governance:gate` initially failed because generated outputs changed during the gate; the generated-sync rerun passed.
- Current targeted status check showed no remaining tracked drift under `docs/generated`, `.ai/generated`, or `.ai/governance/api-snapshots`.

## GitHub governance posture

Recommended required branch protection checks for `main`:

- `Core Quality`
- `E2E QA`
- generated AI artifact sync check inside `Core Quality`
- governance gate via `validate:governance`
- strict type-check, tests, lint, production build, desktop build, and desktop budget inside `Core Quality`

Recommended settings:

- require pull request before merge;
- require conversation resolution;
- require the above status checks before merge;
- optionally require linear history after owner/team agreement.

## Approval-gated follow-ups

- Remote branch protection cannot be changed in this run.
- `.github/CODEOWNERS` already covers apps, contracts/core, AI/governance docs/scripts, and workflows, but does not explicitly cover every package such as `shared-utils`, `vue-ui`, `vue-hooks`, `vue-charts`, `design-tokens`, `unocss-preset`, and `vue-primevue-adapter`. Editing CODEOWNERS is blocked pending operator approval.
- PR/issue templates can be refined for architecture/UI/dependency/generated-artifact lanes, but `.github/**` edits are blocked pending operator approval.
- Dependency automation is blocked pending owner approval and must not perform blind latest upgrades.

## Validation

| Command or check | Result | Evidence |
|---|---|---|
| M7 governance/GitHub inventory | PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M7-T1-20260529-075728-governance-github-inventory.log` |
| `pnpm governance:refresh` | PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M7-20260529-075736-pnpm-governance-refresh.log` |
| `pnpm governance:gate` | FAIL, generated sync required | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M7-20260529-075746-pnpm-governance-gate.log` |
| `pnpm governance:gate` generated-sync rerun | PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M7-20260529-075806-pnpm-governance-gate-generated-sync-rerun.log` |
