# ADR-006: Approval-Gated Architecture Lanes

- Status: Proposed
- Date: 2026-05-29

## Context

Several remaining architecture lanes require owner/operator decisions before implementation. Without a single approval structure, agents may mix audit, implementation, guard expansion, and remote governance changes in one run.

## Decision

Approval-gated lanes must be tracked as explicit decisions before implementation:

| Lane                                                                     | Approval required from | Default without approval                                               |
| ------------------------------------------------------------------------ | ---------------------- | ---------------------------------------------------------------------- |
| UI / PrimeVue boundary policy and guard enforcement                      | Owner / Architect      | Audit and document only; do not add broad guard enforcement.           |
| HTTP contracts or `packages/core/src/http/**`                            | Owner / Architect      | Keep `packages/contracts/src/network.ts` and app HTTP infrastructure.  |
| Architecture guard strictness expansion                                  | Owner / Architect      | Keep pending rules in owner decision log.                              |
| GitHub remote branch protection or broad `.github/**` governance changes | Operator               | Document local evidence only; do not mutate remote settings.           |
| Vite major migration                                                     | Operator               | Keep as isolated future lane; do not mix with UI/HTTP/dependency work. |
| Dependency modernization                                                 | Operator               | No broad upgrade or lockfile churn.                                    |

Each approved lane must record scope, allowed paths, forbidden paths, validation, rollback plan, and evidence.

## Consequences

- The owner decision log is an index/status ledger, not the implementation source of truth.
- Detailed decisions live in ADRs or `docs/ai-plan/DECISIONS.md`.
- Guard changes follow approved policy; they are not used to force unresolved policy choices.

## Validation

- `pnpm docs:commands`
- `pnpm ai:doctor`
- Relevant lane validation after approval
