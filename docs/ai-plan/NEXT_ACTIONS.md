# CCD Next Actions

## Immediate action

Current next action is owner/operator resolution of the final `NO_GO` blockers.

Final validation passes, but the ledger still contains explicit BLOCKED/DEFERRED items. Do not push, stage, commit, or mutate approval-gated lanes unless the operator gives exact approval.

## After M0

Run post-7 validation checkpoint:

```bash
pnpm install --frozen-lockfile
pnpm ci:prepare-internal
pnpm ci:smoke:packages
pnpm ai:doctor
pnpm codex:preflight
pnpm type-check
pnpm lint:check
pnpm test:run
pnpm build:web-demo
pnpm build:desktop
pnpm budget:desktop
pnpm validate:governance
pnpm build:ci
git diff --check
git status --short --untracked-files=all
```

## Recommended first implementation lane

M2 — Capability Bridge generics.

Reasons:

- smallest P1 blast radius;
- clear acceptance criteria;
- unlikely to touch `packages/contracts` or `packages/core`;
- good testability;
- does not require UI/HTTP/Vite/dependency changes.

## Do not start yet

Do not start these until prerequisites are satisfied and operator explicitly chooses the lane:

- M4 UI boundary guard enforcement;
- M5 HTTP contract implementation;
- M9 Vite 8 compatibility;
- M10 dependency modernization;
- M11 Login Diorama;
- M13 strategic P4 work.

M8 `P2-CSS-Validation` remains blocked by table-heavy ProTable/AppContainer layout debt unrelated to the pxtorem patch.
M9 Vite 8 migration remains blocked pending isolated branch/worktree approval.
M10 dependency upgrades remain blocked pending per-lane approval.
M11 Login Diorama remains blocked pending operator approval and prerequisite stability.
M12 directive/date casing cleanup is complete; `pnpm check` passes with two existing lint warnings.
M13 P4 strategic work is deferred or blocked with evidence.
M14 final validation is complete; final decision is `NO_GO` until blockers are resolved or accepted.

## Open owner decisions

- UI boundary policy for direct PrimeVue imports.
- HTTP contract shape and whether `packages/contracts/src/http/**` should be edited.
- Guard enforcement strictness.
- Design-token canonical rule file.
- Desktop drift CI enforcement scope.
- GitHub branch protection / CODEOWNERS / template updates.

## Recommended milestone order

1. M0 — Planning system and baseline.
2. M1 — Residual type/Turbo output validation.
3. M2 — Capability Bridge generics.
4. M3 — ProTable typings/helper boundary.
5. M4 — UI boundary audit and policy.
6. M5 — HTTP boundary inventory and contract proposal.
7. M6 — Guard coverage and owner decisions.
8. M7 — Governance docs.
9. M8 — CSS/token audit.
10. M12 — Secondary test/casing cleanup.
11. M14 — Final validation for selected milestones.

M9, M10, and M11 should remain separate approved lanes.

## Recommended next lane

B-007 is the least approval-heavy blocker to resolve next: open a focused ProTable/AppContainer layout validation lane for `.p-datatable` height `0` and the two existing e2e failures. Keep Vite 8, dependency upgrades, Login Diorama, `.github/**`, and P4 strategic work blocked until separately approved.
