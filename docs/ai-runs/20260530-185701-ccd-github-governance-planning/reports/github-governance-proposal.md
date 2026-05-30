# CCD GitHub Governance Planning Proposal

## Scope

- Lane: planning-only GitHub remote governance proposal.
- Baseline supplied by operator: `main` at `9e7423649ce4e7784ba288f230c7f6b934c1db5e`; DEPS-004 sealed; CI Guardian `26681727942` PASS.
- Repo evidence root: `/Users/cc/MyPorject/ccd`.
- No remote GitHub settings, branch protection, repo settings, secrets, environments, Actions permissions, required checks, dependencies, package manifests, runtime code, Vite config, HTTP runtime, Login Diorama, P4 work, generated governance files, or `.github/**` files were edited.

## Evidence Summary

- Local GitHub context: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `.github/CODEOWNERS`, `.github/PULL_REQUEST_TEMPLATE.md`, and two issue templates exist; no local `.github/dependabot.yml` exists. Evidence: `command-logs/github-context.log`.
- CI Guardian has two PR-relevant jobs: `Core Quality` and `E2E QA`. `Core Quality` runs install, runtime summary, `ai:sync`, `ci:prepare-internal`, `ai:doctor`, `validate:governance`, generated AI artifact drift check, type-check, tests, lint, build, desktop build, and desktop budget. `E2E QA` runs prepared Playwright QA and uploads failure artifacts.
- Deploy workflow is push-to-main and manual only; it builds `apps/web-demo/dist` through `pnpm build:web-demo`, uploads Pages artifact, then deploys to `github-pages`.
- Governance docs define `pnpm governance:gate` as the single authoritative gate; `pnpm governance:github-workflows` is a blocking registry hygiene check.
- Release docs require `pnpm validate:release`, `pnpm api:report`, `pnpm supply:check`, `pnpm arch:graphs`, and artifact review for `apps/web-demo/dist`.
- Owner decision ledger keeps GitHub branch protection / required checks as `PENDING_OPERATOR`; default without approval is local documentation only.
- `GOV-003` remains `BLOCKED_BY_OPERATOR`: `.github/**` changes and remote branch protection require operator approval.

## Branch Protection Proposal

Target branch: `main`.

Recommended rules:

- Require pull request before merge.
- Require CODEOWNERS review.
- Require approval for most recent push.
- Dismiss stale approvals on new commits.
- Require conversation resolution.
- Require linear history if the operator wants squash/rebase-only history.
- Block force pushes and branch deletion.
- Restrict bypass to repo administrators only, with written incident note in the active run or release evidence.
- Require status checks to pass before merge.
- Require branches to be up to date before merge only if CI queue time remains acceptable; otherwise keep disabled to avoid unnecessary reruns.

Required status checks:

- `Core Quality` from `CI Guardian`.
- `E2E QA` from `CI Guardian`.

Do not require `Deploy to GitHub Pages` for PR merge because the workflow currently runs on `push` to `main` and `workflow_dispatch`, not on `pull_request`. The deployment workflow should remain a post-merge promotion signal unless an approved `.github/**` change adds a PR-safe deploy/build check.

Step-level checks such as `pnpm validate:governance`, type-check, lint, unit tests, and build cannot be required independently unless CI is split into separate jobs. For current workflow shape, `Core Quality` is the required umbrella check.

## CODEOWNERS Ownership Matrix Proposal

Current local CODEOWNERS covers `apps/web-demo`, `apps/desktop`, `packages/contracts`, `packages/core`, `.ai`, architecture/governance docs, governance scripts, workflow files, and `.changeset`.

Recommended expanded matrix for a future approved `.github/CODEOWNERS` PR:

| Path | Owner |
| --- | --- |
| `/apps/web-demo/` | `@web-runtime`, `@platform-architecture` for boundary-sensitive changes |
| `/apps/desktop/` | `@desktop-runtime`, `@platform-architecture` |
| `/apps/desktop/src-tauri/` | `@desktop-runtime`, `@platform-architecture` |
| `/packages/contracts/` | `@platform-architecture` |
| `/packages/core/` | `@platform-architecture` |
| `/packages/design-tokens/` | `@platform-architecture` |
| `/packages/shared-utils/` | `@platform-architecture` |
| `/packages/unocss-preset/` | `@platform-architecture` |
| `/packages/vue-hooks/` | `@web-runtime`, `@platform-architecture` |
| `/packages/vue-app-platform/` | `@web-runtime`, `@platform-architecture` |
| `/packages/vue-ui/` | `@web-runtime`, `@platform-architecture` |
| `/packages/vue-primevue-adapter/` | `@web-runtime`, `@platform-architecture` |
| `/packages/vue-charts/` | `@web-runtime`, `@platform-architecture` |
| `/.ai/` | `@platform-architecture` |
| `/scripts/governance/` | `@platform-architecture` |
| `/scripts/architecture/` | `@platform-architecture` |
| `/.github/` | `@platform-architecture` |
| `/docs/governance/`, `/docs/architecture/`, `/docs/adr/`, `/docs/release/` | `@platform-architecture` |
| `/package.json`, `/pnpm-lock.yaml`, `/pnpm-workspace.yaml`, `/turbo.json`, `/mise.toml` | `@platform-architecture` |

Prerequisite: confirm GitHub teams or handles exist. If `@web-runtime`, `@desktop-runtime`, or `@platform-architecture` are not valid repository teams/users, branch protection with CODEOWNERS review may block merges.

## PR Template Proposal

Future approved PR template changes should add explicit sections for:

- Scope lane: implementation, docs-only, governance-only, release, dependency, Vite, UI, HTTP, desktop, or emergency hotfix.
- Approval gate: owner/operator/product approval link when touching `.github/**`, remote governance, dependencies, Vite, HTTP contracts/runtime, Login Diorama, P4, generated governance, or package topology.
- CCD Vue constraints: auto-import first; no manual Vue API imports covered by auto-imports; no `import { h } from 'vue'`; no `h()`; TSX render/return only.
- Generated artifacts: list the exact generator command used, not manual edits.
- Validation evidence: required commands and evidence directory.
- Rollback: exact rollback file paths or remote settings.

## Issue Template Proposal

Keep existing bug and feature templates, then add approved forms for:

- Governance approval request: scope, affected paths, owner/operator, allowed paths, forbidden paths, required validations, rollback.
- Dependency lane request: one dependency family, official changelog links, package/lockfile impact, validation ladder, rollback plan.
- Release/hotfix request: baseline, artifact, runtime fingerprint, required checks, rollback target.
- CI failure report: workflow run URL, failed job, failing command, smallest reproduced local command, suspected owner boundary.

## Release Governance Proposal

- Keep releases promoted only from deterministic workspace runtime.
- Keep `apps/web-demo/dist` as the only browser release artifact for GitHub Pages.
- Require `pnpm validate:release`, `pnpm api:report`, `pnpm supply:check`, `pnpm arch:graphs`, and artifact review before release promotion.
- Require release evidence to record Node, pnpm, Turbo, mise, active workspace root, runtime fingerprint, and dependency graph checksum.
- Treat GitHub Pages deploy as post-merge promotion unless an approved workflow change introduces a PR-safe release candidate check.
- Optional future approval: protect `github-pages` environment with required reviewers. This requires explicit operator approval because it mutates environment governance.

## Dependency Policy Proposal

- Preserve current policy: one dependency lane at a time; no blind latest upgrades; cite official changelog or migration docs.
- Keep dependency additions/upgrades blocked without explicit operator approval.
- For PrimeVue / DEPS-004: keep sealed and blocked by review; do not upgrade until UI boundary policy and wrapper migration prerequisites are accepted and adapter plus visual validation are budgeted.
- For Vite major work: keep isolated branch/worktree approval requirement.
- Required dependency lane validation should include at minimum `pnpm install --frozen-lockfile`, targeted package build/test, `pnpm supply:check`, `pnpm api:report` when public API can drift, `pnpm validate:governance`, and affected E2E if UI/runtime behavior can change.

## Rollout Order

1. Operator reviews this proposal and chooses whether the next lane is remote-only settings, local `.github/**` PR, or both.
2. If remote settings are in scope, capture current branch protection, repository settings, Actions permissions, environments, required checks, and Pages settings before changing anything.
3. Confirm CODEOWNERS actors exist in GitHub and have repository access.
4. Open a dedicated `.github/**` PR only after explicit approval; keep it separate from runtime/dependency work.
5. Merge template/CODEOWNERS updates after `Core Quality` and `E2E QA` pass.
6. Enable branch protection required checks for `Core Quality` and `E2E QA`.
7. Run a dry PR to confirm CODEOWNERS review and required checks behave as expected.
8. Optionally add issue templates, Dependabot policy, or Pages environment protection as separate approval-gated follow-ups.

## Rollback Plan

- For remote branch protection: restore the pre-change settings snapshot. If merges are blocked, temporarily remove only the newly added required check or CODEOWNERS requirement with operator signoff and record the rollback in evidence.
- For CODEOWNERS/template changes: revert the dedicated `.github/**` PR through a normal PR; do not force push.
- For required checks: remove the problematic required check, then rerun a dry PR to confirm mergeability.
- For Pages environment protection: restore prior environment reviewer/wait timer configuration.
- For dependency automation: disable the new automation rule or revert `.github/dependabot.yml` through PR.

## Exact Operator Approvals Required

Required before any future action:

- Approval to query remote repository governance settings with `gh api` or GitHub UI, if the operator wants a remote-state inventory beyond current local evidence.
- Approval to edit `.github/**`.
- Approval to create or modify GitHub teams/users referenced by CODEOWNERS.
- Approval to enable or change branch protection on `main`.
- Approval to set required checks, including exact check names.
- Approval to require CODEOWNERS review and dismiss stale approvals.
- Approval to change repository merge settings, linear history, force-push/delete restrictions, or admin bypass.
- Approval to change Actions permissions.
- Approval to change repository secrets, variables, or environments.
- Approval to protect the `github-pages` environment.
- Approval to add dependency automation such as Dependabot configuration.
- Approval for any package manifest or lockfile mutation.

## Blocked Remote Actions

Not performed in this run:

- Branch protection inspection or mutation.
- Required check mutation.
- Repository settings mutation.
- Secrets, variables, or environment mutation.
- Actions permissions mutation.
- GitHub team/user mutation.
- Pages environment mutation.
- Dependabot or dependency automation changes.
- Any `.github/**` edit.

## Validation

- `pnpm docs:commands` PASS, then final report rerun PASS.
- `pnpm governance:github-workflows` PASS.
- `pnpm ai:doctor` PASS with token contrast advisory warnings only.
- `pnpm codex:preflight` PASS with token contrast advisory warnings only.
- `pnpm validate:governance` PASS.
- `git diff --check` PASS, then final report rerun PASS.
- `git status --short --untracked-files=all` shows only this run's untracked evidence files.

## Evidence Files

- `command-logs/skill-router.json`
- `command-logs/github-context.log`
- `command-logs/relevant-files.txt`
- `command-logs/git-remote-v.log`
- `command-logs/git-branch-current.log`
- `command-logs/git-status-initial.log`
- `command-logs/pnpm-docs-commands.log`
- `command-logs/pnpm-governance-github-workflows.log`
- `command-logs/pnpm-ai-doctor.log`
- `command-logs/pnpm-codex-preflight.log`
- `command-logs/pnpm-validate-governance.log`
- `command-logs/git-diff-check.log`
- `command-logs/git-status-final-pre-report.log`
- `command-logs/post-report-pnpm-docs-commands.log`
- `command-logs/post-report-git-diff-check.log`
- `command-logs/final-pnpm-docs-commands.log`
- `command-logs/final-git-diff-check.log`
- `command-logs/git-status-final.log`
