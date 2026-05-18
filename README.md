<div align="center">

# CCD

### Self-protecting deterministic multi-runtime platform architecture

[![Vue 3.5](https://img.shields.io/badge/Vue-3.5+-42b883?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Vite 7](https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![TypeScript 5.8](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2-black?style=flat-square&logo=turborepo)](https://turbo.build/repo)
[![pnpm](https://img.shields.io/badge/pnpm-10-f69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: GPL v3](https://img.shields.io/badge/License-GPL_v3-blue?style=flat-square)](./LICENSE)

[Docs](./docs/README.md) · [Governance](./docs/governance.md) · [API Surface](./docs/generated/api-surface-report.md) · [Governance Report](./docs/generated/governance-report.md)

</div>

---

## Platform Position

CCD is an enterprise-grade governed platform repository for deterministic, AI-safe, multi-runtime product systems.

The repository has moved beyond monorepo restructuring into a self-protecting platform architecture:

- machine-readable architecture policies
- runtime-neutral contracts and core
- isolated app runtime adapters
- public API snapshot governance
- supply-chain governance
- release topology validation
- AI-generated code guardrails
- GitHub CI-enforced unified governance gate

```text
packages/contracts  -> public ABI: interfaces and shared types only
packages/core       -> runtime-neutral platform logic
apps/web-demo       -> browser runtime shell and browser adapters
apps/desktop        -> Tauri runtime shell and desktop adapters
legacy/root-app     -> read-only historical archive
```

Canonical dependency direction:

```text
@ccd/contracts -> @ccd/core -> apps/*
```

Runtime APIs are allowed only in app adapter layers. `packages/contracts` and `packages/core` must remain free of browser, Node, Tauri, timer, crypto, storage, network, and console globals.

## Self-Protection Model

CCD does not rely on contributor discipline for architecture safety. The active merge gate is:

```bash
pnpm governance:gate
```

The gate must pass before CI continues to typecheck, tests, lint, and production builds.

| Protection | Enforced By |
| --- | --- |
| Policy asset presence | `.ai/governance/policies/**` + `pnpm governance:validate` |
| AI-safe code generation | `.ai/governance/policies/ai.json` + `pnpm ai:guard` |
| Dependency boundaries | dependency-cruiser + `scripts/architecture/validate-boundaries.mjs` |
| Runtime neutrality | `scripts/architecture/check-runtime-leaks.mjs` |
| Public API immutability | `.ai/governance/api-snapshots/**` + `pnpm api:report` |
| Supply-chain baseline | `.ai/governance/policies/supply-chain.json` + `pnpm supply:check` |
| Release order | `.ai/governance/policies/release.json` + `pnpm release:governance` |
| Workflow registry hygiene | `.ai/governance/policies/release.json` + `pnpm governance:github-workflows` |
| Governance observability | generated reports under `docs/generated/**` and `.ai/generated/**` |

The repository also governs GitHub's remote workflow registry. Historical desktop workflow records remain visible for audit, but they are disabled and are no longer execution surfaces.

## Quick Start

```bash
git clone git@github.com:ichichuang/ccd.git
cd ccd
pnpm install --frozen-lockfile
pnpm dev:web-demo
```

Requirements:

| Tool | Version |
| --- | --- |
| Node.js | `24.x` |
| pnpm | `>= 10.0.0` |

## Core Commands

```bash
pnpm governance:gate      # single mandatory architecture governance gate
pnpm build:ci             # governance gate + Turbo build
pnpm arch:boundaries      # dependency topology and import boundary validation
pnpm arch:runtime         # runtime leak scanner for contracts/core
pnpm api:report           # API snapshot compatibility and API reports
pnpm supply:check         # dependency policy and SBOM generation
pnpm release:governance   # Changesets/release topology validation
pnpm governance:github-workflows # GitHub Actions registry hygiene
pnpm ai:guard             # AI-safe generated-code and architecture guard
```

Affected-only commands:

```bash
pnpm affected:lint
pnpm affected:test
pnpm affected:typecheck
pnpm affected:build
```

## GitHub CI Contract

Active GitHub workflows:

```text
CI Guardian            -> .github/workflows/ci.yml
Deploy to GitHub Pages -> .github/workflows/deploy.yml
Dependabot Updates     -> dynamic/dependabot/dependabot-updates
```

Disabled historical workflow records:

```text
Build Desktop (Windows) -> disabled_manually
Release Desktop         -> disabled_manually
Smoke Desktop           -> disabled_manually
```

The primary CI workflow runs:

```text
frozen install
-> AI adapter materialization
-> pnpm governance:gate
-> generated AI adapter sync check
-> typecheck
-> tests
-> lint
-> production build
-> desktop bundle guard
-> e2e QA
```

`pnpm governance:gate` is the single entrypoint for architecture regression blocking. Individual checks remain available for local debugging, but CI treats the unified gate as the authoritative platform protection layer.

## Documentation

- [Documentation Index](./docs/README.md)
- [Architecture](./docs/architecture.md)
- [Governance](./docs/governance.md)
- [AI Workspace](./docs/ai-workspace.md)
- [Runtime Isolation](./docs/runtime/runtime-isolation.md)
- [Codex Quickstart](./docs/codex/quickstart.md)
- [Generated Governance Report](./docs/generated/governance-report.md)
- [Generated API Surface Report](./docs/generated/api-surface-report.md)

Generated outputs under `docs/generated/**` and `.ai/generated/**` are produced by governance scripts. Do not edit generated reports manually.

## License

[GNU General Public License v3.0](./LICENSE)
