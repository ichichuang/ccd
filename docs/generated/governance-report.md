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

- @ccd/contracts: no declared workspace dependencies
- @ccd/core -> @ccd/contracts
- @ccd/design-tokens: no declared workspace dependencies
- @ccd/unocss-preset -> @ccd/design-tokens
- @ccd/shared-utils: no declared workspace dependencies
- @ccd/vue-hooks -> @ccd/shared-utils
- @ccd/vue-app-platform -> @ccd/design-tokens
- @ccd/vue-ui -> @ccd/design-tokens, @ccd/shared-utils, @ccd/vue-hooks
- @ccd/vue-primevue-adapter -> @ccd/design-tokens
- @ccd/vue-charts -> @ccd/design-tokens
- @ccd/web-demo -> @ccd/contracts, @ccd/core, @ccd/design-tokens, @ccd/shared-utils, @ccd/unocss-preset, @ccd/vue-hooks, @ccd/vue-app-platform, @ccd/vue-ui, @ccd/vue-primevue-adapter, @ccd/vue-charts
- @ccd/desktop -> @ccd/contracts, @ccd/core, @ccd/design-tokens, @ccd/shared-utils, @ccd/unocss-preset, @ccd/vue-app-platform, @ccd/vue-hooks, @ccd/vue-primevue-adapter, @ccd/vue-ui

## Package Responsibilities

- @ccd/contracts: Cross-runtime interfaces and DTO contracts only.
- @ccd/core: Minimal runtime-neutral adapter facade; not a shared frontend bucket.
- @ccd/design-tokens: Shared design token source and theme/size/breakpoint primitives.
- @ccd/unocss-preset: Shared UnoCSS preset, safelist, and build-time styling helpers.
- @ccd/shared-utils: Pure shared utilities.
- @ccd/vue-hooks: Shared Vue/browser composables.
- @ccd/vue-app-platform: Shared frontend app bootstrap lifecycle and platform orchestration primitives.
- @ccd/vue-ui: Shared Vue UI primitives.
- @ccd/vue-primevue-adapter: PrimeVue-specific theme and adaptation layer.
- @ccd/vue-charts: Shared chart runtime and helpers.
- @ccd/web-demo: Browser app shell, routes, pages, stores, app adapters, and temporary app-local shared candidates.
- @ccd/desktop: Tauri shell and desktop adapter.

## Package Criticality

- @ccd/contracts: critical
- @ccd/core: critical
- @ccd/design-tokens: protected
- @ccd/unocss-preset: protected
- @ccd/shared-utils: protected
- @ccd/vue-hooks: protected
- @ccd/vue-app-platform: protected
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
- Release order: @ccd/contracts -> @ccd/core -> @ccd/design-tokens -> @ccd/unocss-preset -> @ccd/shared-utils -> @ccd/vue-hooks -> @ccd/vue-app-platform -> @ccd/vue-ui -> @ccd/vue-primevue-adapter -> @ccd/vue-charts -> @ccd/web-demo -> @ccd/desktop
- Release gate: pnpm release:governance

## Build Graph Topology

- Orchestrator: Turbo
- Topological order: @ccd/contracts -> @ccd/core -> @ccd/design-tokens -> @ccd/unocss-preset -> @ccd/shared-utils -> @ccd/vue-hooks -> @ccd/vue-app-platform -> @ccd/vue-ui -> @ccd/vue-primevue-adapter -> @ccd/vue-charts -> @ccd/web-demo -> @ccd/desktop
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
