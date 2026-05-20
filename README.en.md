# CCD - AI Entry

This is the English AI-facing entrypoint for the CCD repository.

Human developers should read `README.md` and `docs/zh/**`.

## Project Identity

CCD is a self-protecting deterministic multi-runtime platform repository.

Canonical package topology:

```text
packages/contracts  -> interfaces and shared types only
packages/core       -> runtime-neutral platform logic
apps/web-demo       -> single browser runtime source of truth
apps/desktop        -> Tauri runtime shell and adapters
root                -> orchestration-only shell
```

## Architecture Invariant

Dependency direction is fixed:

```text
@ccd/contracts -> @ccd/core -> apps/*
```

- `packages/contracts` must stay implementation-free.
- `packages/core` must stay runtime-neutral.
- Runtime APIs are only allowed in app adapter layers.
- Root must not host active runtime source code.

## Canonical Commands

Before documenting or invoking any command, confirm it exists in `package.json`.

Preferred commands:

- `pnpm project:doctor`
- `pnpm ccd:fix`
- `pnpm ccd:ship -- "type: message"`
- `pnpm governance:refresh`
- `pnpm governance:gate`
- `pnpm build:ci`
- `pnpm vercel:build`
- `pnpm e2e:qa`
- `pnpm ci:prepare-internal`
- `pnpm ci:smoke:packages`

## GitHub Actions / Vercel / GitHub Pages Separation

- GitHub Actions is the quality gate.
- Vercel is the deployment build target.
- GitHub Pages serves the web-demo static deployment.
- `build:ci` is the CI validation build.
- `vercel:build` is the deployment build.

Do not confuse deployment build with CI validation build.

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

## Required Validation

Before returning a result, prefer checking the exact failing command first.

Typical validation:

- `pnpm project:doctor`
- `pnpm ccd:fix`
- `pnpm lint:check`
- `pnpm type-check`
- `pnpm governance:gate`

## Report Format

When acting as an AI agent, report:

1. touched files
2. commands executed
3. validation results
4. remaining risks
5. exact recommended follow-up commands for the human operator
