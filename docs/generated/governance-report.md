# Governance Report

- Protocol version: 1.0.0
- Policy version: 2026.05.18
- Manifest version: 1.0.0
- Adapter version: 1.0.0
- Governance version: 1.0.0
- Adapters: Codex, Claude
- Orchestration roles: architect-governance, frontend-runtime, desktop-runtime
- Rule count: 38
- Skill routes: 10

## Dependency Graph

- @ccd/contracts: implementation-free public contract package
- @ccd/core -> @ccd/contracts
- @ccd/web-demo -> @ccd/contracts, @ccd/core
- @ccd/desktop -> @ccd/contracts, @ccd/core

## Package Criticality

- @ccd/contracts: critical
- @ccd/core: critical
- @ccd/web-demo: flexible
- @ccd/desktop: protected

## Boundary Validation Status

- Dependency direction: contracts -> core -> apps
- Runtime neutrality: validated by pnpm arch:runtime and pnpm arch:boundaries
- Deep imports: validated by dependency-cruiser and scripts/architecture/validate-boundaries.mjs
- Cross-app imports: forbidden
- Legacy imports: forbidden

## Public API Governance

- API report command: pnpm api:report
- API snapshot directory: .ai/governance/api-snapshots
- Fail on export removal: true
- Fail on subpath removal: true
- Approved public package exports are explicit package.json exports only.

## Release Governance

- Version governance: changesets
- Release order: @ccd/contracts -> @ccd/core -> @ccd/web-demo -> @ccd/desktop
- Release gate: pnpm release:governance

## Build Graph Topology

- Orchestrator: Turbo
- Topological order: @ccd/contracts -> @ccd/core -> @ccd/web-demo -> @ccd/desktop
- Affected commands: pnpm affected:lint, pnpm affected:test, pnpm affected:typecheck, pnpm affected:build

## Supply Chain Governance

- Frozen install: validated by pnpm install --frozen-lockfile
- Lifecycle scripts: forbidden by pnpm supply:check
- Supply check: validated by pnpm supply:check
- SBOM: docs/generated/sbom.json

## Orphan Checks

- docs/generated present: true
- orchestration manifest present: true
- protocol version present: true
