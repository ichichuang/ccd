# CCD Next Actions

## Current Priority

Active lane: none for the approved full-remediation program.

Evidence directory:

- `docs/ai-runs/20260601-222424-ccd-full-remediation-final/`

Current state:

- Final architecture decision: `GO`.
- D-020 through D-024: `DONE`.
- `C-06`, `M12`, and `G-02`: `DONE`.
- `pnpm ai:doctor --open`: 0 open tasks.
- The P25-P31 local remediation commit stack is not pushed.

Accepted target guardrail:

- `apps/*` remain runtime-shell and adapter ownership surfaces, including routes/views/plugins/stores and compatibility facades.
- New reusable or public monorepo capability must be introduced in governed `packages/*` through package exports.
- Do not create public shared-capability exports from `apps/*` unless a future explicit owner decision changes the architecture.

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

## Recommended Next Lane After Full GO

No next lane is required for current Full GO. If work resumes, open exactly one separately approved future-charter lane:

- Vite major migration.
- Dependency modernization.
- GitHub remote/settings or `.github/**` governance changes.
- Login Diorama product lane.
- Desktop drift CI.
- Stricter guard expansion.

Do not push the P25-P31 local commit stack without separate authorization.

## Archived P1 Notes

The previous current action was the P1 platform extraction run. It completed with approval-gated blockers and final validation evidence under:

- `docs/ai-runs/20260529-170536-ccd-p1-platform-extraction-and-boundaries/`

Historical P1 recommendations are no longer the active next action. They included M2 Capability Bridge generics, UI boundary audit, HTTP boundary inventory, CSS pxtorem validation, and final P1 validation. Use the sealed P1 reports for evidence, not this file, before reopening any P1 lane.
