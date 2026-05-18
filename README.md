<div align="center">

# CCD

### AI-governed frontend architecture platform

[![Vue 3.5](https://img.shields.io/badge/Vue-3.5+-42b883?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Vite 7](https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![PrimeVue 4](https://img.shields.io/badge/PrimeVue-4-41B883?style=flat-square)](https://primevue.org/)
[![UnoCSS](https://img.shields.io/badge/UnoCSS-66-333?style=flat-square&logo=unocss&logoColor=white)](https://unocss.dev/)
[![TypeScript 5.8](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js 26.1](https://img.shields.io/badge/Node.js-26.1-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10-f69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: GPL v3](https://img.shields.io/badge/License-GPL_v3-blue?style=flat-square)](./LICENSE)

[Docs](./docs/README.md)

</div>

---

## Project Positioning

CCD is an AI-first frontend architecture platform for long-lived Vue 3 product systems. It uses a core-first documentation and governance model with three active runtime branches:

```text
CCD
├── main                  -> Core/Web governance baseline
├── desktop-version       -> Tauri Desktop Runtime
└── main-portable-version -> Clean Portable Runtime
```

The `main` branch is the protected core/Web governance baseline. `desktop-version` and `main-portable-version` are the only active runtime lanes. Historical experimental branches are not active policy inputs.

Details: [Docs](./docs/README.md)

---

## Architecture Layers

CCD treats governance assets as first-class architecture, not auxiliary prompt files.

```text
AI Governance Layer
  -> Protocol Layer
  -> Workspace Layer
  -> Application Runtime Layer
```

| Layer                     | Ownership                                        | Responsibility                                                              |
| ------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------- |
| AI Governance Layer       | `.ai/rules/**`, `.ai/manifests/**`               | Architecture laws, routing manifests, generated locks, validation contracts |
| Protocol Layer            | `.ai/protocol/**`, `AGENTS.md`, `CLAUDE.md`      | Cross-agent entrypoints and generated adapter contracts                     |
| Workspace Layer           | `docs/**`, `scripts/**`, `.ai/skills/**`         | Documentation, orchestration commands, Codex skills, browser automation     |
| Application Runtime Layer | `src/**`, future `apps/**`, future `packages/**` | Vue runtime, domain modules, reusable packages, product surfaces            |

Current runtime architecture includes:

- `HTTP -> Adapters -> API -> Hooks -> Stores -> Views` data flow
- PrimeVue, ProForm, ProTable, Pinia, Alova, UnoCSS, and ECharts runtime systems
- explicit state synchronization through `syncAction(type, payload)`
- generated AI adapters and architecture validation gates

Details: [Multi-Runtime Architecture](./docs/architecture.md).

---

## Unified Governance Commands

The main architecture command is:

```bash
pnpm arch:check
```

It is the one-shot governance entrypoint for:

- AI protocol sync
- Codex skill sync
- architecture doctor validation
- drift validation
- Codex preflight validation
- git whitespace validation

Command tiers:

```bash
pnpm arch:check:fast # ai:doctor + drift-check
pnpm arch:check      # sync + doctor + drift + preflight + git diff --check
pnpm arch:check:full # arch:check + lint + type-check + test:run
```

Use `arch:check` after documentation, `.ai/**`, scripts, manifests, adapter, or architecture-rule changes. Use `arch:check:full` for release and PR gates.

---

## Quick Start

```bash
git clone git@github.com:ichichuang/ccd.git
cd ccd
pnpm install
pnpm ai:setup:codex
pnpm dev
```

Requirements:

| Tool    | Version     |
| ------- | ----------- |
| Node.js | `>= 26.1.0` |
| pnpm    | `>= 10.0.0` |

Daily commands:

```bash
pnpm dev
pnpm build
pnpm preview
pnpm arch:check
pnpm type-check
pnpm lint:check
pnpm test:run
```

---

## License

[GNU General Public License v3.0](./LICENSE)
