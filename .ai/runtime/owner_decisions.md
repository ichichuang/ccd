# Owner Decision Log

Pending decisions requiring explicit owner/operator sign-off. This file is an index and status ledger; detailed rationale belongs in ADRs and `docs/ai-plan/DECISIONS.md`.

## Approval Structure

| Decision                                   | Scope                                                                             | Status             | Default without approval                                                                              | Reference                             |
| ------------------------------------------ | --------------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Restore login retry/offline UX             | `apps/web-demo/src/hooks/modules/useAuth.ts`                                      | `APPROVED`         | Future implementation must fail closed; offline read-only mode remains blocked.                       | `docs/ai-plan/DECISIONS.md` D-015     |
| Guard enforcement scope                    | `scripts/ai-architecture-guard.mjs`, `.ai/rules/**`                               | `FULL_GO_DEFERRED` | Current guard coverage is sufficient for Full GO; strict expansion needs a future lane.               | `docs/ai-plan/DECISIONS.md` P30 D-023 |
| Rule contradiction resolution              | `.ai/runtime/rule_coverage_matrix.md`, `.ai/rules/**`                             | `FULL_GO_DEFERRED` | Do not encode contradictory rules in guard; future resolution is not a Full GO prerequisite.          | `docs/ai-plan/DECISIONS.md` P30 D-023 |
| Design-token canonical rule file           | `.ai/rules/**`                                                                    | `FULL_GO_DEFERRED` | Keep current files; broad consolidation is not a Full GO prerequisite.                                | `docs/ai-plan/DECISIONS.md` P30 D-023 |
| Desktop drift CI integration               | `.github/workflows/**`, `.ai/rules/integrations/09-desktop-branch-governance.mdc` | `FULL_GO_DEFERRED` | Keep desktop drift review manual; CI integration needs a future lane.                                 | `docs/ai-plan/DECISIONS.md` P30 D-023 |
| HTTP contract package scope                | `packages/contracts/src/http/**`; `packages/core/src/http/**` remains blocked     | `APPROVED`         | Type-only HTTP contracts may be implemented in a future lane; keep app HTTP infrastructure canonical. | `docs/ai-plan/DECISIONS.md` D-014     |
| UI / PrimeVue boundary enforcement         | `packages/vue-ui/**`, `packages/vue-primevue-adapter/**`, `apps/*/**`             | `APPROVED`         | Exact app allowlist enforced by `scripts/ai-architecture-guard.mjs`.                                  | `docs/ai-plan/DECISIONS.md` D-003     |
| GitHub branch protection / required checks | `.github/**`, remote repository settings                                          | `FULL_GO_DEFERRED` | Local governance is sufficient for Full GO; no `.github/**` or remote mutation is authorized.         | `docs/ai-plan/DECISIONS.md` P30 D-023 |
| Vite major migration                       | `package.json`, `pnpm-lock.yaml`, Vite configs                                    | `FULL_GO_DEFERRED` | Keep current Vite on main; major migration requires a future isolated branch.                         | `docs/ai-plan/DECISIONS.md` P30 D-023 |
| Dependency modernization                   | `package.json`, `pnpm-lock.yaml`, package toolchain versions                      | `FULL_GO_DEFERRED` | Current dependencies are sufficient for Full GO; future upgrades need single-dependency lanes.        | `docs/ai-plan/DECISIONS.md` P30 D-023 |
| Login Diorama product refactor             | `apps/web-demo/src/views/login/**`, auth UX behavior                              | `FULL_GO_DEFERRED` | Current login behavior remains canonical; Diorama refactor is not a Full GO prerequisite.             | `docs/ai-plan/DECISIONS.md` P30 D-023 |

## Status Values

- `PENDING_PRODUCT`: product behavior or UX decision required.
- `PENDING_OWNER`: owner/architect approval required.
- `PENDING_OPERATOR`: repository/CI/remote-operation approval required.
- `PENDING_ARCHITECT`: architecture contradiction requires written resolution.
- `FULL_GO_DEFERRED`: explicit decision that the item is not required for current Full GO and needs a future lane if resumed.
- `APPROVED`: approved with scope, validation, and rollback plan recorded in an ADR.
- `REJECTED`: rejected with replacement policy recorded.
