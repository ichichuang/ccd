# ADR-007: Runtime Stack and Tooling Choices

## Status

Accepted.

## Context

CCD is a governed pnpm + Turbo monorepo with a browser application, a Tauri desktop shell, and runtime-neutral workspace packages. The stack must preserve package boundaries, deterministic builds, and AI governance checks while allowing app-local runtime adapters.

## Decision

CCD keeps the following stack as the current architecture baseline:

- Vue 3 with TypeScript and Composition API for browser and desktop frontends.
- Vite as the app and package build tool on the current approved major version. Vite major migration work stays in an isolated future lane.
- UnoCSS as the atomic CSS engine, constrained by design-token and shortcut rules.
- PrimeVue v4 as the primary component system, with shared UI and adapter behavior owned by `packages/vue-ui` and `packages/vue-primevue-adapter`.
- Tauri v2 as the desktop runtime shell under `apps/desktop`.
- pnpm workspaces as the package manager and dependency graph owner.
- Turborepo as the deterministic workspace task orchestrator.

## Consequences

- Runtime behavior stays in apps and app adapters; `packages/core` remains runtime-neutral.
- Public package consumption goes through package exports and generated `dist/**` outputs.
- Vite 8, dependency modernization, and UI library replacement are future isolated lanes, not drive-by changes.
- PrimeVue replacement or headless UI expansion requires a specific gap analysis and owner approval.
- Tooling changes must keep `pnpm governance:gate`, `pnpm type-check`, and `pnpm build:ci` deterministic.

## Rejected Alternatives

- Replace pnpm, Turbo, Vue, Vite, PrimeVue, UnoCSS, or Tauri as part of unrelated repair work.
- Move browser or desktop runtime APIs into `packages/core`.
- Add global `@ccd/*` TypeScript path aliases to bypass package exports.

## Validation

- `pnpm docs:commands`
- `pnpm ai:doctor`
- `pnpm codex:preflight`
- `pnpm governance:gate`
