# CCD Governance Entry

CCD governance is consolidated around one authoritative gate:

```bash
pnpm governance:gate
```

`pnpm governance:full` is an alias for the same gate. CI calls the gate once, then runs type-check, tests, lint, build, desktop bundle guard, and E2E QA. Individual commands remain for local diagnosis only.

The repository-wide full validation gate is `pnpm validate`. It runs through `scripts/validate-workspace.mjs full` and covers governance, dependencies, docs, runtime boundaries, package preparation, type-check, lint, unit tests, web and desktop builds, desktop security/smoke, E2E QA, budgets, CI parity, and locked Cargo validation. `pnpm check` is intentionally fast and non-complete.

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

`pnpm arch:boundaries` combines dependency-cruiser and custom boundary validation. It blocks package-to-app imports, cross-app imports, workspace deep imports, removed archive imports, and Tauri access outside desktop adapters.

### Dependency enforcement

Turbo preserves topological workspace execution. Package dependency direction is declared in `.ai/governance/policies/topology.json` and visualized by `pnpm arch:graphs` under `docs/generated/graphs/`.

### Release validation

`pnpm release:governance` validates release policy, Changesets configuration, release order, public exports, and protected governance paths.

### Supply-chain validation

`pnpm supply:check` validates lifecycle-script policy, runtime dependency allowlists, singleton runtime dependencies, dependency catalog alignment, and the generated SBOM. `pnpm deps:scan` records local outdated, audit, and Cargo inventory evidence without upgrading packages.

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
| `pnpm deps:catalog:check`          | Validate pnpm catalog dependency alignment.                 | Inside supply check.                | Dependency manifest review.                | Blocking              |
| `pnpm deps:scan`                   | Record outdated, audit, and Cargo dependency scan summary.  | Optional evidence lane.             | Dependency security review.                | Informational         |
| `pnpm release:governance`          | Validate release topology and protected paths.              | Inside gate.                        | Release readiness.                         | Blocking              |
| `pnpm governance:github-workflows` | Validate remote workflow registry hygiene.                  | Inside gate.                        | GitHub workflow drift diagnosis.           | Blocking              |
| `pnpm arch:report`                 | Regenerate governance report.                               | Inside gate.                        | Observability refresh.                     | Blocking on drift     |
| `pnpm arch:graphs`                 | Generate workspace/package/runtime graphs.                  | Inside gate.                        | Topology visibility refresh.               | Blocking on drift     |
| `pnpm doctor`                      | Validate deterministic local runtime and AI runtime health. | Optional preflight.                 | Local shell/runtime diagnosis.             | Blocking when invoked |
| `pnpm validate`                    | Canonical full local gate.                                  | Union of Core Quality and E2E QA.   | Complete pre-merge validation.             | Blocking              |
| `pnpm check`                       | Fast type-check plus lint gate.                             | Not a complete CI gate.             | Quick local feedback.                      | Partial               |
| `pnpm build:ci`                    | Core Quality parity orchestrator.                           | Required quality job equivalent.    | Reproduce CI quality failures.             | Blocking              |
| `pnpm type-check`                  | Turbo workspace type check.                                 | Inside build:ci and validate.       | Diagnostic helper.                         | Blocking              |
| `pnpm build`                       | Workspace production build through core and web-demo.       | Build helper only.                  | Release/build diagnosis.                   | Blocking when invoked |

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
- [ADR-002: Removed Browser Runtime Archive](../adr/ADR-002-legacy-freeze-policy.md)
- [ADR-003 Governance Pipeline](../adr/ADR-003-governance-pipeline.md)
- [ADR-004 Runtime Environment Policy](../adr/ADR-004-runtime-environment-policy.md)
- [ADR-005 Common Platform Layer Terminology](../adr/ADR-005-common-platform-layer-terminology.md)
- [ADR-006 Approval-Gated Architecture Lanes](../adr/ADR-006-approval-gated-architecture-lanes.md)
- [ADR-007 Runtime Stack and Tooling Choices](../adr/ADR-007-runtime-stack-and-tooling-choices.md)
- [ADR-008 Desktop Backend IPC and Updater Policy](../adr/ADR-008-desktop-backend-ipc-and-updater-policy.md)

## Policy Records

- [GitHub Governance Policy](github-governance.md)
- [Dependency Governance Policy](dependency-policy.md)
