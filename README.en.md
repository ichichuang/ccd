# CCD - AI Entry

This is the English AI-facing entrypoint for the CCD repository.

Human developers should read `README.md` and `docs/zh/**`.

## Project Identity

CCD is a self-protecting deterministic multi-runtime platform repository.

Runtime policy: Node.js `24.x` is intentional for this repository. The root
`engines.node`, `mise.toml`, CI setup, `@tsconfig/node24`, and `@types/node@24`
are aligned. Do not relax the engine policy in cleanup or feature branches; use
a dedicated toolchain policy lane if the owner approves a broader baseline.

Canonical package topology:

```text
packages/contracts  -> interfaces and shared types only
packages/core       -> runtime-neutral platform logic
apps/web-demo       -> browser web-demo application shell, routes, stores, views, and app adapters
apps/desktop        -> dedicated Tauri desktop runtime shell with its own frontend entry and src-tauri backend boundary
root                -> orchestration-only shell
```

## Architecture Invariant

Dependency direction is fixed:

```text
@ccd/contracts -> @ccd/core -> apps/*
```

- `packages/contracts` must stay implementation-free.
- `packages/core` must stay runtime-neutral.
- `apps/web-demo` is the browser `web-demo` application shell for browser entry, routes, stores, views, app adapters, and app-level plugin wiring.
- `apps/desktop` is the dedicated Tauri desktop runtime shell with its own frontend entry, desktop adapters, and `apps/desktop/src-tauri/**` backend boundary. It is not a full duplicate of `apps/web-demo`.
- App-specific routes, stores, pages/views, plugin wiring, runtime access, and compatibility facades stay app-local.
- Shared components, tokens, hooks, UI primitives, integration adapters such as the PrimeVue adapter, contracts, and runtime-neutral logic belong in governed `packages/*`.
- Reusable or public monorepo capability must live in governed `packages/*` and be exposed through package exports.
- Do not create public shared capability exports from `apps/*` unless a future explicit owner decision changes the target architecture.
- Runtime APIs are only allowed in app adapter layers.
- Root must not host active runtime source code.

## P4 Strategic Guardrail State

P0, P1, P2, and P3 repair work is closed for the current architecture program. The remaining P4 entries are non-actionable strategic guardrails, not repair tasks approved for implementation.

The durable registry is `docs/governance/strategic-guardrails.md`. `pnpm ai:doctor --open` intentionally keeps those P4 rows visible through `.ai/runtime/repair_list.md` as warning-preserving guardrails.

Do not implement P4 strategic products, create a new organization or repository, extract a starter, split a standalone design-system repository, add Reka UI or TanStack Query, enable additional Tauri plugins, add Rust commands, move alova HTTP runtime into core/shared, move safeStorage runtime into shared utilities, add global `@ccd/*` aliases, mutate remote GitHub settings, or perform dependency upgrades without a future owner-approved lane.

## Canonical Commands

Before documenting or invoking any command, confirm it exists in `package.json`.

| Command                            | Purpose                                                                    | When to run                                                       |
| ---------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `pnpm project:doctor`              | Validate project metadata and governed config                              | Before commits and after project metadata changes                 |
| `pnpm ccd:doctor`                  | Run the daily project health check                                         | Before local development or release prep                          |
| `pnpm ccd:fix`                     | Sync metadata, refresh generated outputs, format, and validate             | Before preparing a local change                                   |
| `pnpm ccd:ship -- "type: message"` | Fix, validate, stage, and commit through Husky and commitlint              | For a normal local commit                                         |
| `pnpm ci:prepare-internal`         | Build internal workspace packages                                          | Before app builds, Vercel builds, or package-resolution debugging |
| `pnpm ci:smoke:packages`           | Verify workspace package resolution and built `dist` outputs               | After internal package builds or before deployment builds         |
| `pnpm governance:refresh`          | Refresh generated governance outputs                                       | After API, topology, policy, or report-source changes             |
| `pnpm governance:gate`             | Run the unified architecture and governance gate                           | Before commits, in CI, or after governance refreshes              |
| `pnpm type-check`                  | Run workspace TypeScript checks                                            | After TypeScript, Vue, contract, or package export changes        |
| `pnpm lint:check`                  | Run workspace ESLint checks                                                | After code, script, or Vue SFC changes                            |
| `pnpm check`                       | Run the fast non-complete type-check and lint gate                         | Quick local feedback only; not a merge gate                       |
| `pnpm build:ci`                    | Run the CI Core Quality parity gate                                        | Before pushing or reproducing the CI quality job                  |
| `pnpm vercel:build`                | Run the Vercel deployment build                                            | Only for Vercel deployment validation                             |
| `pnpm dev:web-demo`                | Start the browser `web-demo` development server                            | Browser app development                                           |
| `pnpm dev:desktop`                 | Start the desktop shell frontend development server                        | Desktop frontend development                                      |
| `pnpm build:web-demo`              | Build the web-demo static app                                              | GitHub Pages and local static build validation                    |
| `pnpm build:desktop`               | Build the Tauri desktop runtime shell frontend                             | Desktop frontend build validation                                 |
| `pnpm desktop:security`            | Validate Tauri CSP, capabilities, plugins, windows, and navigation policy  | After desktop security boundary changes                           |
| `pnpm desktop:smoke:dev`           | Validate the Tauri dev compile path                                        | After Tauri config or desktop dependency changes                  |
| `pnpm desktop:smoke:release`       | Validate the Tauri release compile path without bundling                   | After Tauri release config changes or CI reproduction             |
| `pnpm desktop:smoke`               | Run desktop security plus dev and release smoke checks                     | Full local desktop P3 smoke                                       |
| `pnpm budget:desktop`              | Validate desktop frontend bundle budget                                    | After desktop builds                                              |
| `pnpm validate`                    | Run the canonical full local gate through `scripts/validate-workspace.mjs` | Before merge or when complete local validation is needed          |
| `pnpm e2e:qa`                      | Run QA regression tests                                                    | After UI, route, layout, or runtime changes                       |

## GitHub Actions / Vercel / GitHub Pages Separation

- GitHub Actions is the quality gate.
- Vercel is the deployment build target.
- GitHub Pages serves the web-demo static deployment.
- `build:ci` is the CI `Core Quality` parity gate.
- `vercel:build` is the deployment build.

Do not confuse deployment build with CI quality validation.

## Generated Artifact Rule

Do not manually edit:

- `docs/generated/**`
- `.ai/generated/**`
- `.ai/governance/api-snapshots/**`

Refresh instead with:

```bash
pnpm governance:refresh
pnpm governance:gate
```

## AI Entrypoints

Read in order:

1. `README.en.md`
2. `AGENTS.md`
3. `.ai/protocol/AGENTS.core.md`
4. `docs/en/ai-entry.md`
5. `docs/en/architecture-contract.md`
6. `docs/en/governance-contract.md`
7. `docs/en/command-contract.md`
8. `docs/en/ci-deploy-contract.md`

## Forbidden Changes

Do not:

- add global `@ccd/*` paths to `tsconfig.base.json`
- make Vercel run `build:ci`
- weaken governance gates
- bypass Husky
- manually edit generated reports or API snapshots
- force push
- invent package.json commands that do not exist

## AI Preflight Rules

### Documentation Preflight

Before editing any documentation:

1. Read `package.json`.
2. Confirm every documented command exists in `scripts`.
3. Run `pnpm docs:commands` when available.
4. Do not invent command names.

### Generated Output Preflight

Before editing any generated output:

1. Stop.
2. Find the source generator or policy file.
3. Run the approved generation command.
4. Do not manually edit `docs/generated/**`, `.ai/generated/**`, or `.ai/governance/api-snapshots/**`.

### Architecture Preflight

Before changing architecture:

1. Read `docs/en/architecture-contract.md`.
2. Read `.ai/protocol/AGENTS.core.md`.
3. Confirm the change does not violate runtime neutrality.
4. Do not add global `@ccd/*` aliases to `tsconfig.base.json`.

### CI / Deploy Preflight

Before changing Vercel or CI:

1. Read `docs/en/ci-deploy-contract.md`.
2. Keep Vercel on `pnpm vercel:build`.
3. Keep GitHub Actions as the quality gate.
4. Do not use `pnpm build:ci` as the Vercel deployment build.

## Required Validation

Before returning a result, prefer checking the exact failing command first.

Typical validation:

- `pnpm project:doctor`
- `pnpm ccd:fix`
- `pnpm lint:check`
- `pnpm type-check`
- `pnpm docs:commands`
- `pnpm governance:gate`

## Report Format

When acting as an AI agent, report:

1. touched files
2. commands executed
3. validation results
4. remaining risks
5. exact recommended follow-up commands for the human operator
