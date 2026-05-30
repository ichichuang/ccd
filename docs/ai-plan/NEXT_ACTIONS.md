# CCD Next Actions

## Current Priority

Active lane: P2 governance, CSS, build, HTTP, storage, and PrimeVue boundary modernization.

Evidence directory:

- `docs/ai-runs/20260530-104228-ccd-p2-governance-css-build-modernization/`

Implementable P2 items in the active lane are:

- APP-003 safeStorage contract/codec extraction.
- BUILD-003 build plugin compatibility notes and progress plugin removal.
- GOV-005 current-priority docs refresh.
- HTTP-005 Method builder guidance for server-state APIs.
- HTTP-006 raw transport exception policy.
- UI-004 PrimeVue global service helper extraction.
- BUILD-004 typed Sass preprocessor config.
- BUILD-005 CI/e2e-safe Vite server open behavior.
- UI-005 scoped PrimeVue showcase exception.

## Blocked or Deferred P2 Items

Keep these blocked unless explicit owner/operator approval is added to `.ai/runtime/owner_decisions.md` or `docs/ai-plan/DECISIONS.md`:

- APP-004 desktop drift CI enforcement scope.
- BUILD-002 Vite 8 migration.
- COMP-005 new `packages/vue-pro-components` package split.
- DEPS-001 Vite dependency lane.
- DEPS-002 Vue tooling dependency lane.
- DEPS-003 Playwright dependency lane.
- GitHub remote governance and `.github/**` refinements.

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

## Recommended Next Lane After P2

If final validation passes, the next useful owner action is deciding one blocked lane:

- approve or reject APP-004 desktop drift CI enforcement;
- approve or reject COMP-005 package split;
- approve one isolated dependency/toolchain lane;
- accept remaining blocked items as governance exceptions.

## Archived P1 Notes

The previous current action was the P1 platform extraction run. It completed with approval-gated blockers and final validation evidence under:

- `docs/ai-runs/20260529-170536-ccd-p1-platform-extraction-and-boundaries/`

Historical P1 recommendations are no longer the active next action. They included M2 Capability Bridge generics, UI boundary audit, HTTP boundary inventory, CSS pxtorem validation, and final P1 validation. Use the sealed P1 reports for evidence, not this file, before reopening any P1 lane.
