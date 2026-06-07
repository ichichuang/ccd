# GitHub Governance Policy

This is the local policy record for GitHub repository governance. Remote repository settings and `.github/**` changes remain operator-gated by `.ai/runtime/owner_decisions.md`.

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
- Bundle and desktop budgets: `pnpm budget:bundles`, `pnpm build:desktop`, and `pnpm budget:desktop`.
- Browser QA when practical: `pnpm e2e:qa:prepared` or the current CI Playwright QA entrypoint.

## Deferred Remote Enforcement

This document does not mutate branch protection, required checks, CODEOWNERS, issue templates, pull request templates, or workflow files. Those changes require an operator-approved GitHub governance lane.
