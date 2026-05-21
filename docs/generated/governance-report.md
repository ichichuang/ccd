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

- @ccd/contracts -> @ccd/design-tokens
- @ccd/core -> @ccd/contracts
- @ccd/design-tokens: implementation-free public contract package
- @ccd/unocss-preset -> @ccd/design-tokens
- @ccd/shared-utils: implementation-free public contract package
- @ccd/vue-hooks: implementation-free public contract package
- @ccd/vue-ui: implementation-free public contract package
- @ccd/vue-primevue-adapter -> @ccd/design-tokens
- @ccd/vue-charts: implementation-free public contract package
- @ccd/web-demo -> @ccd/contracts, @ccd/core, @ccd/design-tokens, @ccd/unocss-preset, @ccd/vue-ui, @ccd/vue-primevue-adapter
- @ccd/desktop -> @ccd/contracts, @ccd/core, @ccd/design-tokens, @ccd/unocss-preset

## Package Criticality

- @ccd/contracts: critical
- @ccd/core: critical
- @ccd/design-tokens: protected
- @ccd/unocss-preset: protected
- @ccd/shared-utils: protected
- @ccd/vue-hooks: protected
- @ccd/vue-ui: protected
- @ccd/vue-primevue-adapter: protected
- @ccd/vue-charts: protected
- @ccd/web-demo: flexible
- @ccd/desktop: protected

## Boundary Validation Status

- Dependency direction: contracts -> core -> apps
- Runtime neutrality: validated by pnpm arch:runtime and pnpm arch:boundaries
- Deep imports: validated by dependency-cruiser and scripts/architecture/validate-boundaries.mjs
- Cross-app imports: forbidden
- Removed runtime imports: validated by dependency and runtime boundary checks

## Public API Governance

- API report command: pnpm api:report
- API snapshot directory: .ai/governance/api-snapshots
- Fail on export removal: true
- Fail on subpath removal: true
- Approved public package exports are explicit package.json exports only.

## Release Governance

- Version governance: changesets
- Release order: @ccd/contracts -> @ccd/core -> @ccd/design-tokens -> @ccd/unocss-preset -> @ccd/shared-utils -> @ccd/vue-hooks -> @ccd/vue-ui -> @ccd/vue-primevue-adapter -> @ccd/vue-charts -> @ccd/web-demo -> @ccd/desktop
- Release gate: pnpm release:governance

## Build Graph Topology

- Orchestrator: Turbo
- Topological order: @ccd/contracts -> @ccd/core -> @ccd/design-tokens -> @ccd/unocss-preset -> @ccd/shared-utils -> @ccd/vue-hooks -> @ccd/vue-ui -> @ccd/vue-primevue-adapter -> @ccd/vue-charts -> @ccd/web-demo -> @ccd/desktop
- Recommended validation commands: pnpm lint:check, pnpm test:run, pnpm type-check, pnpm build:ci, pnpm governance:gate, pnpm ci:prepare-internal, pnpm ci:smoke:packages, pnpm vercel:build

## Supply Chain Governance

- Frozen install: validated by pnpm install --frozen-lockfile
- Lifecycle scripts: forbidden by pnpm supply:check
- Supply check: validated by pnpm supply:check
- SBOM: docs/generated/sbom.json

## Orphan Checks

- docs/generated present: true
- orchestration manifest present: true
- protocol version present: true
