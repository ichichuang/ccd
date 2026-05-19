# CCD Governance Entry

CCD governance is consolidated around one authoritative gate:

```bash
pnpm governance:gate
```

`pnpm governance:full` is an alias for the same gate. CI calls the gate once, then runs type-check, tests, lint, build, desktop bundle guard, and E2E QA. Individual commands remain for local diagnosis only.

## Entrypoints

| Entrypoint                    | Role                                                             |
| ----------------------------- | ---------------------------------------------------------------- |
| `.ai/governance/policies/**`  | Machine-readable governance policy source.                       |
| `scripts/governance/gate.mjs` | Single executable governance gate.                               |
| `scripts/architecture/**`     | Runtime, boundary, API, supply-chain, graph, and release checks. |
| `package.json` scripts        | Stable local and CI command surface.                             |
| `turbo.json`                  | Workspace task orchestration.                                    |
| `.github/workflows/ci.yml`    | Merge-blocking governance and quality enforcement.               |
| `.github/CODEOWNERS`          | Ownership authority for governed paths.                          |

## Validation Flows

### Runtime validation

`pnpm arch:runtime` verifies that `packages/contracts` and `packages/core` remain runtime-neutral and that root `/src` remains decommissioned. Runtime capabilities stay in app adapters only.

### Architecture enforcement

`pnpm arch:boundaries` combines dependency-cruiser and custom boundary validation. It blocks package-to-app imports, cross-app imports, workspace deep imports, legacy imports, and Tauri access outside desktop adapters.

### Dependency enforcement

Turbo preserves topological workspace execution. Package dependency direction is declared in `.ai/governance/policies/topology.json` and visualized by `pnpm arch:graphs` under `docs/generated/graphs/`.

### Release validation

`pnpm release:governance` validates release policy, Changesets configuration, release order, public exports, and protected governance paths.

### Supply-chain validation

`pnpm supply:check` validates lifecycle-script policy, runtime dependency allowlists, singleton runtime dependencies, and the generated SBOM.

## Governance Command Matrix

| Command                            | Purpose                                                     | CI usage                            | Local usage                                | Blocking severity     |
| ---------------------------------- | ----------------------------------------------------------- | ----------------------------------- | ------------------------------------------ | --------------------- |
| `pnpm governance:gate`             | Unified governance gate.                                    | Required before quality/build jobs. | Primary pre-PR gate.                       | Blocking              |
| `pnpm governance:full`             | Alias for the unified governance gate.                      | Equivalent to gate.                 | Equivalent to gate.                        | Blocking              |
| `pnpm governance:validate`         | Validate required governance assets and policies.           | Inside gate.                        | Diagnose missing/drifted governance files. | Blocking              |
| `pnpm ai:guard -- --format=json`   | Detect unsafe generated/runtime patterns.                   | Inside gate.                        | Diagnose AI rule violations.               | Blocking              |
| `pnpm arch:boundaries`             | Enforce workspace and adapter boundaries.                   | Inside gate.                        | Diagnose dependency/import drift.          | Blocking              |
| `pnpm arch:runtime`                | Enforce runtime-neutral packages and root decommission.     | Inside gate and final validation.   | Diagnose runtime leaks.                    | Blocking              |
| `pnpm api:report`                  | Validate public API snapshots and regenerate API report.    | Inside gate and final validation.   | Review API compatibility.                  | Blocking              |
| `pnpm supply:check`                | Validate supply-chain policy and SBOM.                      | Inside gate and final validation.   | Dependency review.                         | Blocking              |
| `pnpm release:governance`          | Validate release topology and protected paths.              | Inside gate.                        | Release readiness.                         | Blocking              |
| `pnpm governance:github-workflows` | Validate remote workflow registry hygiene.                  | Inside gate.                        | GitHub workflow drift diagnosis.           | Blocking              |
| `pnpm arch:report`                 | Regenerate governance report.                               | Inside gate.                        | Observability refresh.                     | Blocking on drift     |
| `pnpm arch:graphs`                 | Generate workspace/package/runtime graphs.                  | Inside gate.                        | Topology visibility refresh.               | Blocking on drift     |
| `pnpm doctor`                      | Validate deterministic local runtime and AI runtime health. | Optional preflight.                 | Local shell/runtime diagnosis.             | Blocking when invoked |
| `pnpm type-check`                  | Turbo workspace type check.                                 | Required after gate.                | Pre-PR quality check.                      | Blocking              |
| `pnpm build`                       | Workspace production build through core and web-demo.       | Required after gate.                | Release/build validation.                  | Blocking              |

## Deterministic Resolution

Critical governance execution resolves through deterministic wrappers:

- `pnpm governance:gate` executes via `scripts/exec.sh`.
- `scripts/exec.sh` delegates to `scripts/env.sh`.
- `scripts/env.sh` removes shell function wrappers, activates mise when available, enables Corepack when available, and verifies `node`/`pnpm` binaries.

Turbo remains the workspace orchestrator for build, type-check, test, lint, and affected command families.

## Ownership and Escalation

Governance-sensitive changes require the owners in `.github/CODEOWNERS`. Cross-boundary changes must document why the change is required, which boundary is touched, validation run, and rollback plan. If a change touches more than one runtime boundary, escalate to platform architecture review before merge.

## ADR Index

- [ADR-001 Monorepo Runtime Boundary](../adr/ADR-001-monorepo-runtime-boundary.md)
- [ADR-002 Legacy Freeze Policy](../adr/ADR-002-legacy-freeze-policy.md)
- [ADR-003 Governance Pipeline](../adr/ADR-003-governance-pipeline.md)
- [ADR-004 Runtime Environment Policy](../adr/ADR-004-runtime-environment-policy.md)
