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

[Architecture](./docs/architecture.md) · [Product Lines](./docs/branch-model.md) · [Governance](./docs/governance.md) · [Runtime Isolation](./docs/runtime/runtime-isolation.md) · [AI Workspace](./docs/ai-workspace.md) · [Codex](./docs/codex/quickstart.md)

</div>

---

## Project Positioning

CCD is an AI-first frontend architecture platform for long-lived Vue 3 product systems. It is no longer a single template repository with an experimental desktop branch; it is a three-line product architecture:

```text
CCD
├── main                  -> Web Application Runtime
├── desktop-version       -> Tauri Desktop Runtime
└── main-portable-version -> Clean Portable Architecture Template
```

The `main` branch is the stable Web runtime and architecture source. `desktop-version` rebuilds the desktop runtime from the optimized `main` baseline with Tauri v2. `main-portable-version` is the clean scaffold for new products, stripped of demo pollution and unnecessary runtime residue.

The previous experimental branch `feat/tauri-integration` has been deprecated. Desktop architecture is now rebuilt from scratch on the dedicated `desktop-version` branch.

---

## Branch Matrix

| Branch                  | Purpose                                | Stability       | Primary Runtime                         |
| ----------------------- | -------------------------------------- | --------------- | --------------------------------------- |
| `main`                  | Production web architecture            | Stable          | Browser-first Vue 3 application runtime |
| `desktop-version`       | Tauri desktop runtime                  | Active          | Native shell + WebView + Tauri IPC      |
| `main-portable-version` | Minimal reusable architecture scaffold | Stable Template | Clean project bootstrap                 |

Hard boundaries:

- Web runtime changes and shared architecture work land on `main`.
- Tauri shell, IPC, capabilities, desktop release metadata, and desktop validation land on `desktop-version`.
- Template cleanup, demo removal, and portable scaffold defaults land on `main-portable-version`.
- `feat/tauri-integration` is historical only and must not be used as a merge target or rebuild baseline.

Details: [Product Line Strategy](./docs/branch-model.md).

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

## Documentation System

| Document                                                               | Role                                                  |
| ---------------------------------------------------------------------- | ----------------------------------------------------- |
| [docs/architecture.md](./docs/architecture.md)                         | Multi-runtime architecture and runtime isolation laws |
| [docs/branch-model.md](./docs/branch-model.md)                         | Product line strategy and deprecation policy          |
| [docs/governance.md](./docs/governance.md)                             | AI-native governance system and command tiers         |
| [docs/ai-workspace.md](./docs/ai-workspace.md)                         | AI workspace governance and orchestration flow        |
| [docs/runtime/web-runtime.md](./docs/runtime/web-runtime.md)           | `main` Web runtime contract                           |
| [docs/runtime/desktop-runtime.md](./docs/runtime/desktop-runtime.md)   | `desktop-version` desktop runtime contract            |
| [docs/runtime/portable-runtime.md](./docs/runtime/portable-runtime.md) | `main-portable-version` portable scaffold             |
| [docs/codex/quickstart.md](./docs/codex/quickstart.md)                 | Codex collaboration entrypoint                        |
| [.ai/README.md](./.ai/README.md)                                       | Canonical AI workspace standard                       |

---

## Contribution Gate

Before opening a PR, run:

```bash
pnpm arch:check
pnpm type-check
pnpm lint:check
pnpm test:run
```

For release or CI-grade local verification:

```bash
pnpm arch:check:full
```

Desktop/Tauri changes on `desktop-version` additionally require:

```bash
pnpm sync:desktop-config
pnpm check:drift
```

---

## License

[GNU General Public License v3.0](./LICENSE)
