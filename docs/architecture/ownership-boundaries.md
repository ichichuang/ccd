# Ownership and Boundary Authority

Ownership turns CCD governance from advisory policy into reviewable authority. CODEOWNERS is the enforcement entrypoint; this document explains escalation expectations.

## Boundary Owners

| Boundary             | Paths                                                       | Authority                                                                                         |
| -------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Browser runtime      | `apps/web-demo/**`                                          | Web runtime owners review browser shell, routes, UI integration, and web adapters.                |
| Desktop runtime      | `apps/desktop/**`                                           | Desktop owners review Tauri shell, capabilities, and desktop adapters.                            |
| Runtime-neutral core | `packages/core/**`                                          | Platform architecture owners review runtime-neutral logic and dependency direction.               |
| Contracts            | `packages/contracts/**`                                     | Platform architecture owners review public ABI and compatibility.                                 |
| AI governance        | `.ai/**`                                                    | Platform architecture owners review AI rules, protocol, skills, manifests, and governance policy. |
| Architecture docs    | `docs/architecture/**`, `docs/adr/**`, `docs/governance/**` | Platform architecture owners review architecture intent and governance documentation.             |
| Governance scripts   | `scripts/governance/**`, `scripts/architecture/**`          | Platform architecture owners review executable enforcement.                                       |
| CI/workflows         | `.github/workflows/**`, `.github/CODEOWNERS`                | Platform architecture owners review merge gates and ownership routing.                            |

## Escalation Rules

Cross-boundary changes must include:

1. impacted boundaries and owners,
2. reason the change cannot stay inside one boundary,
3. validation commands and results,
4. rollback plan,
5. ADR update when the change modifies architecture intent.

Changes are escalated to platform architecture review when they touch contracts plus any runtime, core plus app adapters, governance scripts plus CI, or any protected boundary plus generated artifacts.

## Non-active Legacy Policy

`legacy/root-app` is not an active owner boundary and must not be referenced as active code. It remains a frozen historical archive governed by ADR-002 and the legacy equivalence checklist.
