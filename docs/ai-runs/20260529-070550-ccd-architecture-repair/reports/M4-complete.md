# M4 Complete — UI Library Boundary and PrimeVue Adapter

## Scope

- Task IDs: `P1-UIBoundary-Audit`, `P1-UIBoundary-Policy`, `P1-UIBoundary-Adapter`, `P1-UIBoundary-Primitives`, `P1-UIBoundary-Guard`, `P1-UIBoundary-Validation`
- Lane: M4 only.
- Out of scope: PrimeVue replacement, Reka UI adoption, broad component rewrites, Login Diorama, HTTP boundary migration.

## Changes

- Added PrimeVue import audit report:
  - `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M4-T1-primevue-import-audit.md`
- Updated proposed decision D-003 in `docs/ai-plan/DECISIONS.md`.
- Updated canonical ledger and plan/status files.
- No UI source migration or guard rule was implemented in this lane.

## Findings

- Direct `primevue/*` or `@primevue/*` imports exist in 37 source files across the audited target areas.
- `packages/vue-primevue-adapter/**` already owns PrimeVue adapter config, PT/theme helpers, and service installation.
- App bootstrap files install PrimeVue through adapter config/services.
- `packages/vue-ui/**` exports CCD-owned primitives and does not expose a loose raw PrimeVue re-export bucket.
- Existing app/example/layout direct PrimeVue imports are broad enough that a guard would need an approved policy and exception list first.

## Guard status

`P1-UIBoundary-Guard` is BLOCKED pending operator approval of the proposed D-003 policy and explicit exception list. No guard was added.

## Validation

| Command or check | Result | Evidence |
|---|---|---|
| M4 PrimeVue import audit | PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M4-T1-20260529-074704-primevue-import-audit.log` |
| `pnpm arch:boundaries` | PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M4-20260529-074814-pnpm-arch-boundaries.log` |
| Targeted UI boundary type-checks | PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M4-20260529-074821-ui-adapter-type-check.log` |
| `pnpm api:report` | PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M4-20260529-074829-pnpm-api-report.log` |
| Focused UI tests | PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M4-20260529-074835-focused-ui-tests.log` |

## Residual risks

- D-003 remains `PROPOSED`, not approved.
- App/example/layout PrimeVue direct imports remain candidate migration surfaces.
- M5 HTTP boundary and P1 guard/owner-decision lanes remain open.
