# GitHub Governance Policy

This is the local policy record for GitHub repository governance. Remote repository settings and `.github/**` changes remain operator-gated by `.ai/runtime/owner_decisions.md`.

## Remote Enforcement State

As of 2026-06-08, operator approval was granted for scope-limited remote governance convergence on `ichichuang/ccd` `main`.

Evidence was captured before mutation and after read-back under:

```text
.ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd
```

Verified remote `main` branch protection now requires:

- Pull requests before merge.
- One approving review.
- Conversation resolution before merge.
- Strict required status checks.
- Linear history.
- No force pushes.
- No branch deletion.

Repository rulesets were audited but not changed. The existing `Protect Main` repository ruleset is disabled, so active enforcement is branch-protection based.

## Main Branch Protection Target

When operator approval is granted, `main` should require:

- Pull requests before merge.
- Required status checks before merge.
- Conversation resolution before merge.
- Linear history when it does not conflict with the repository release workflow.
- No bypass for architecture, governance, package, runtime, or security-sensitive paths without owner review.

## Required Check Set

The required check set should cover these command families:

- AI adapter sync and doctor checks: `pnpm ai:sync`, `pnpm ai:doctor`, and generated AI artifact drift checks.
- Governance gate: `pnpm governance:gate` or its CI alias `pnpm validate:governance`.
- Workspace package preparation: `pnpm ci:prepare-internal`.
- Type checking: `pnpm type-check`.
- Unit tests: `pnpm test:run`.
- Linting: `pnpm lint:check`.
- Production builds: `pnpm build:ci` or the equivalent Turbo app/package build path.
- Bundle budgets: `pnpm budget:bundles`.
- Desktop runtime checks: `pnpm desktop:security`, `pnpm desktop:smoke:dev`, `pnpm desktop:smoke:release`, `pnpm build:desktop`, and `pnpm budget:desktop`.
- Browser QA when practical: `pnpm e2e:qa:prepared` or the current CI Playwright QA entrypoint.

## Active Required Checks

Current `.github/workflows/ci.yml` exposes two merge-blocking GitHub Actions job checks:

- `Core Quality`
- `E2E QA`

`Core Quality` aggregates AI sync/doctor, generated artifact drift, governance gate, workspace preparation, type-check, unit tests, lint, production build, browser bundle budget, desktop smoke/security/build, and desktop budget commands. `E2E QA` covers the Playwright QA command family.

The deploy workflow also exposes `build` and `deploy` checks on `main` pushes. They are not required for branch protection because `build` is an ambiguous generic name and the deploy workflow is not the PR quality gate.

GitHub rejected an attempted app-pinned required-check payload containing both legacy `contexts` and app-pinned `checks`. The final applied policy uses the unambiguous current CI job contexts, and local workflow job-name audit found no duplicate job names.

## Future Remote Changes

Future remote governance changes must:

- Create a fresh timestamped snapshot before mutation.
- Stay limited to the approved repository and branch/ruleset scope.
- Prefer active branch protection unless a ruleset is explicitly approved and validated.
- Read back branch protection, rulesets, required checks, and workflow job names after mutation.
- Record any permission, plan-limit, or API blocker in `.ai/runtime/repair_list.md` and this document.
