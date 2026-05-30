# Owner Decision Log

Pending decisions requiring explicit owner/operator sign-off. This file is an index and status ledger; detailed rationale belongs in ADRs and `docs/ai-plan/DECISIONS.md`.

## Approval Structure

| Decision                                   | Scope                                                                             | Status              | Default without approval                                                                              | Reference                                                              |
| ------------------------------------------ | --------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Restore login retry/offline UX             | `apps/web-demo/src/hooks/modules/useAuth.ts`                                      | `PENDING_PRODUCT`   | Keep current auth behavior; do not add retry/offline policy.                                          | `docs/ai-plan/DECISIONS.md`                                            |
| Guard enforcement scope                    | `scripts/ai-architecture-guard.mjs`, `.ai/rules/**`                               | `PENDING_OWNER`     | Keep unresolved rules documented; do not broaden guard.                                               | [ADR-006](../../docs/adr/ADR-006-approval-gated-architecture-lanes.md) |
| Rule contradiction resolution              | `.ai/runtime/rule_coverage_matrix.md`, `.ai/rules/**`                             | `PENDING_ARCHITECT` | Do not encode contradictory rules in guard.                                                           | `.ai/runtime/rule_coverage_matrix.md`                                  |
| Design-token canonical rule file           | `.ai/rules/**`                                                                    | `PENDING_OWNER`     | Keep current files; avoid broad consolidation.                                                        | `.ai/runtime/rule_coverage_matrix.md`                                  |
| Desktop drift CI integration               | `.github/workflows/**`, `.ai/rules/integrations/09-desktop-branch-governance.mdc` | `PENDING_OPERATOR`  | Keep desktop drift review manual.                                                                     | [ADR-006](../../docs/adr/ADR-006-approval-gated-architecture-lanes.md) |
| HTTP contract package scope                | `packages/contracts/src/http/**`; `packages/core/src/http/**` remains blocked     | `APPROVED`          | Type-only HTTP contracts may be implemented in a future lane; keep app HTTP infrastructure canonical. | `docs/ai-plan/DECISIONS.md` D-014                                      |
| UI / PrimeVue boundary enforcement         | `packages/vue-ui/**`, `packages/vue-primevue-adapter/**`, `apps/*/**`             | `APPROVED`          | Exact app allowlist enforced by `scripts/ai-architecture-guard.mjs`.                                  | `docs/ai-plan/DECISIONS.md` D-003                                      |
| GitHub branch protection / required checks | `.github/**`, remote repository settings                                          | `PENDING_OPERATOR`  | Document local governance only; do not mutate remote settings.                                        | [ADR-006](../../docs/adr/ADR-006-approval-gated-architecture-lanes.md) |
| Vite major migration                       | `package.json`, `pnpm-lock.yaml`, Vite configs                                    | `PENDING_OPERATOR`  | Keep isolated future lane; no migration in repair work.                                               | [ADR-006](../../docs/adr/ADR-006-approval-gated-architecture-lanes.md) |

## Status Values

- `PENDING_PRODUCT`: product behavior or UX decision required.
- `PENDING_OWNER`: owner/architect approval required.
- `PENDING_OPERATOR`: repository/CI/remote-operation approval required.
- `PENDING_ARCHITECT`: architecture contradiction requires written resolution.
- `APPROVED`: approved with scope, validation, and rollback plan recorded in an ADR.
- `REJECTED`: rejected with replacement policy recorded.
