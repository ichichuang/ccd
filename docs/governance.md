# Platform Governance System

CCD treats architecture governance as executable platform infrastructure. Governance is not advisory documentation; it is a machine-enforced gate wired into GitHub CI.

## Governance Stack

```text
.ai/governance/policies/**       -> machine-readable policy engine
.ai/governance/api-snapshots/**  -> public API baselines
.ai/runtime-profile/**          -> governed Codex execution runtime profiles
scripts/architecture/**          -> boundary, runtime, API, supply-chain, release checks
scripts/governance/**            -> unified gate, reports, diagrams, protocol validation
.github/workflows/ci.yml         -> merge-blocking CI execution
.github/CODEOWNERS               -> ownership entrypoint
package.json scripts             -> stable command surface
turbo.json                       -> graph-aware orchestration
```

## Single Governance Gate

The authoritative platform gate is:

```bash
pnpm governance:gate
```

It is the only architecture gate CI needs to call directly. Individual commands remain available for local debugging, but they are subordinate to the unified gate.

| Gate Stage         | Command                            | Blocks                                                                   |
| ------------------ | ---------------------------------- | ------------------------------------------------------------------------ |
| Governance assets  | `pnpm governance:validate`         | missing protocol, policy, runtime profile, or CI governance assets       |
| AI guard           | `pnpm ai:guard -- --format=json`   | unsafe generated code, raw runtime access outside adapters, deep imports |
| Boundaries         | `pnpm arch:boundaries`             | dependency direction, cross-app imports, legacy imports, Tauri leakage   |
| Runtime neutrality | `pnpm arch:runtime`                | browser/Node/Tauri/timer/storage/network globals in contracts/core       |
| API compatibility  | `pnpm api:report`                  | public export removals, internal export leakage, API snapshot drift      |
| Supply chain       | `pnpm supply:check`                | lifecycle scripts, unapproved runtime dependencies, SBOM drift           |
| Release topology   | `pnpm release:governance`          | invalid Changesets config, release order drift, public export gaps       |
| Workflow registry  | `pnpm governance:github-workflows` | active remote workflows not declared in policy                           |
| Observability      | `pnpm arch:report`                 | stale generated governance state                                         |
| Generated drift    | internal git snapshot check        | gate-generated report/API snapshot changes not committed                 |

## GitHub CI Contract

GitHub Actions enforce the following path:

```text
frozen install
-> AI adapter materialization
-> pnpm governance:gate
-> AI adapter sync drift check
-> typecheck
-> tests
-> lint
-> production build
-> desktop bundle guard
-> e2e QA
```

Merge protection should require the `CI Guardian / Core Quality` and `CI Guardian / E2E QA` jobs.

Current workflow topology:

| Workflow                  | Path                                          | State    | Purpose                                                    |
| ------------------------- | --------------------------------------------- | -------- | ---------------------------------------------------------- |
| `CI Guardian`             | `.github/workflows/ci.yml`                    | active   | single governance gate, quality checks, build verification |
| `Deploy to GitHub Pages`  | `.github/workflows/deploy.yml`                | active   | web demo build and GitHub Pages deployment                 |
| `Dependabot Updates`      | `dynamic/dependabot/dependabot-updates`       | active   | GitHub-managed dependency updates                          |
| `Build Desktop (Windows)` | `.github/workflows/build-desktop-windows.yml` | disabled | historical desktop lane                                    |
| `Release Desktop`         | `.github/workflows/release-desktop.yml`       | disabled | historical desktop release lane                            |
| `Smoke Desktop`           | `.github/workflows/smoke-desktop.yml`         | disabled | historical desktop smoke lane                              |

## Policy Engine

Policy manifests live in `.ai/governance/policies/**`.

| Policy              | Purpose                                                                 |
| ------------------- | ----------------------------------------------------------------------- |
| `version.json`      | policy baseline and governance phase                                    |
| `topology.json`     | layers, package criticality, dependency direction, export rules         |
| `runtime.json`      | runtime-neutral denylist and adapter boundaries                         |
| `ai.json`           | AI-safe code generation patterns and allowed adapter exceptions         |
| `api.json`          | API snapshot directory and breaking-change rules                        |
| `supply-chain.json` | dependency allowlists, lifecycle policy, license policy                 |
| `release.json`      | Changesets config, release order, protected paths, single-gate contract |

Validation scripts should consume policy manifests through `scripts/governance/policy-utils.mjs`.

## Public API Governance

Public API state is version-governed through snapshots:

```text
.ai/governance/api-snapshots/ccd__contracts.json
.ai/governance/api-snapshots/ccd__core.json
.ai/governance/api-snapshots/ccd__web-demo.json
.ai/governance/api-snapshots/ccd__desktop.json
```

Run:

```bash
pnpm api:report
```

Outputs:

- `docs/generated/api-surface-report.json`
- `docs/generated/api-surface-report.md`

The check fails on removed public root symbols, removed export subpaths, or internal subpath leakage according to `.ai/governance/policies/api.json`.

## Runtime Leak Governance

`pnpm arch:runtime` fails if `packages/contracts` or `packages/core` use forbidden runtime APIs:

- browser globals
- Node builtins
- Tauri imports
- `invoke()`
- timers
- `fetch`
- `console`
- `crypto`
- storage globals

Runtime access belongs in:

```text
apps/web-demo/src/adapters/**
apps/desktop/src/adapters/**
```

## Supply Chain Governance

`pnpm supply:check` enforces:

- no install lifecycle scripts
- runtime dependency allowlists
- singleton runtime dependency tracking
- generated SBOM at `docs/generated/sbom.json`

## Release Governance

Release governance is defined by:

- `.changeset/config.json`
- `.ai/governance/policies/release.json`

Release order is fixed:

```text
@ccd/contracts -> @ccd/core -> @ccd/web-demo -> @ccd/desktop
```

## Legacy Archive Governance

`legacy/root-app` is an immutable historical snapshot. It is governed by `.ai/governance/policies/topology.json` and validated by `pnpm governance:validate`.

Enforced invariants:

- `legacy/root-app` must not participate in `pnpm-workspace.yaml`.
- root `tsconfig.json` must exclude `legacy/**`.
- active graph entry from `legacy/**` is forbidden.
- deletion remains blocked until functional equivalence review, stable production release, and regression snapshot coverage are complete.

Audit guidance lives in `docs/architecture/legacy-web-demo-cleanup.md`.

## Root Orchestration Policy

The repository root is orchestration-only. It may host:

- workspace definitions
- governance policies
- scripts
- generated adapters and reports

It must not own active browser runtime source code or production web entrypoints. Browser runtime ownership belongs to `apps/web-demo`.

Critical packages:

- `@ccd/contracts`
- `@ccd/core`

## GitHub Workflow Registry Hygiene

GitHub Actions keeps workflow records after workflow files are deleted. CCD treats the remote registry as governed state.

Policy:

```text
active remote workflows must correspond to declared files in .github/workflows
orphaned historical workflows must be disabled, not reintroduced
```

Declared active workflow files:

- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`

Allowed remote-managed workflow paths:

- `dynamic/dependabot/dependabot-updates`

Check:

```bash
pnpm governance:github-workflows
```

If stale workflows are reported, disable them through the GitHub API while preserving run history:

```bash
gh api -X PUT repos/ichichuang/ccd/actions/workflows/<workflow-id>/disable
```

Current disabled historical workflow IDs:

```text
258463452 -> Build Desktop (Windows)
261585932 -> Release Desktop
261585911 -> Smoke Desktop
```

## Generated Artifacts

Do not manually edit generated outputs. Regenerate through:

```bash
pnpm governance:gate
```

Generated architecture state is reviewable and should be committed with the source change:

- `docs/generated/**`
- `.ai/generated/**`
- `.ai/governance/api-snapshots/**`

## Local Debugging

Use targeted checks only to isolate a failing gate:

```bash
pnpm governance:validate
pnpm ai:guard -- --format=json
pnpm arch:boundaries
pnpm arch:runtime
pnpm api:report
pnpm supply:check
pnpm release:governance
pnpm arch:report
```
