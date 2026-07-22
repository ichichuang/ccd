# CCD

## Purpose

CCD is a deterministic multi-runtime application platform that shares contracts and runtime-neutral core logic across web and Tauri desktop applications.

## Stack

- Vue 3, TypeScript, Vite, Pinia, and Vue Router
- PrimeVue, UnoCSS, and shared CCD UI packages
- Tauri 2 for the desktop runtime
- pnpm workspaces and Turbo for monorepo orchestration
- ESLint, Stylelint, Prettier, and dependency-cruiser for production quality gates

## Install

```bash
pnpm install
```

The repository runtime versions are defined in `mise.toml` and `package.json`.

## Development

```bash
pnpm dev:web-demo
pnpm dev:desktop
```

## Build

```bash
pnpm build:web-demo
pnpm build:desktop
```

## Directory structure

```text
apps/
  web-demo/       Web application
  desktop/        Tauri desktop application
packages/
  contracts/      Shared interfaces and types
  core/           Runtime-neutral application logic
  design-tokens/  Theme and design primitives
  shared-utils/   Shared runtime-neutral utilities
  unocss-preset/  CCD UnoCSS preset
  vue-*/          Shared Vue platform packages
scripts/          Production automation and architecture checks
.ai/              Repository AI protocol, rules, skills, and routing
```

## Environment variables

The committed `.env`, `.env.development`, and `.env.production` files define non-secret defaults. Use local overrides for secrets.

- `VITE_APP_TITLE`, `VITE_APP_ENV`: application identity and environment
- `VITE_API_BASE_URL`, `VITE_API_TIMEOUT`, `VITE_PROXY_TIMEOUT`: API routing and timeouts
- `VITE_PORT`, `VITE_DESKTOP_PORT`: development ports
- `VITE_PUBLIC_PATH`, `VITE_ROUTER_MODE`, `VITE_ROOT_REDIRECT`: public URL and routing
- `VITE_PINIA_PERSIST_KEY_PREFIX`: persisted state namespace
- `VITE_PUBLIC_STORAGE_OBFUSCATION_KEY`: client-visible storage obfuscation material
- `VITE_COMPRESSION`, `VITE_BUILD_SOURCEMAP`: production build behavior
- `VITE_DROP_DEBUGGER`, `VITE_DROP_CONSOLE`: production debug stripping
- `VITE_AUTH_ENABLED`: independent authentication feature gate
- `VITE_DEMO_MOCK_ENABLED`: explicit authentication and dynamic-route demo boundary; enabled only when exactly `true`, with committed development and production defaults set to `false`
- `VITE_SYNC_WS_URL`: optional synchronization endpoint
