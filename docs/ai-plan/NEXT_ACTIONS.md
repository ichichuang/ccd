# CCD Next Actions

## Current Priority

Active lane: P3 feature and runtime refactors.

Evidence directory:

- `docs/ai-runs/20260530-114939-ccd-p3-feature-and-runtime-refactors/`

Implementable P3 items in the active lane:

- None. The P3 plan and ledgers currently contain no actionable `OPEN` P3 item.

## Blocked or Deferred P3 Items

Keep these blocked unless explicit owner/operator approval is added to `.ai/runtime/owner_decisions.md` or `docs/ai-plan/DECISIONS.md`:

- DEPS-004 PrimeVue upgrade remains `BLOCKED_BY_REVIEW`; no dependency or lockfile mutation.
- DEPS-005 alova upgrade remains `BLOCKED_BY_HTTP_CONTRACT`; no dependency or request-stack mutation.
- DOC-003 Login Diorama remains `DEFERRED`; no login UI or auth-flow mutation.
- Runtime-ledger `P3-Login-*` tasks remain blocked pending M11 operator approval and prerequisite stability.

## Required Validation

Run narrow validation first, then the final matrix:

```bash
pnpm install --frozen-lockfile
pnpm ci:prepare-internal
pnpm ai:doctor
pnpm codex:preflight
pnpm validate:governance
pnpm type-check
pnpm test:run
pnpm lint:check
pnpm build:web-demo
pnpm build:desktop
pnpm budget:desktop
pnpm e2e:smoke
pnpm e2e:layout
pnpm e2e:perf
pnpm e2e:visual
pnpm e2e:qa:prepared
pnpm build:ci
git diff --check
git status --short --untracked-files=all
```

Do not push, stage, commit, switch branches, rewrite history, upgrade dependencies, start Vite 8 migration, or mutate GitHub remote settings in this lane.

## Recommended Next Lane After P3

If final validation passes, the next useful owner action is deciding one blocked lane:

- approve or reject Login Diorama M11 product/owner lane;
- approve or reject PrimeVue dependency review lane;
- approve or reject alova lane after HTTP contract prerequisites;
- accept remaining blocked P3/P4 items as governance exceptions.

## Archived P1 Notes

The previous current action was the P1 platform extraction run. It completed with approval-gated blockers and final validation evidence under:

- `docs/ai-runs/20260529-170536-ccd-p1-platform-extraction-and-boundaries/`

Historical P1 recommendations are no longer the active next action. They included M2 Capability Bridge generics, UI boundary audit, HTTP boundary inventory, CSS pxtorem validation, and final P1 validation. Use the sealed P1 reports for evidence, not this file, before reopening any P1 lane.
