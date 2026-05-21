# AI Entry

This document is the concise English AI entrypoint for CCD.

## Read Order

1. `README.en.md`
2. `AGENTS.md`
3. `.ai/protocol/AGENTS.core.md`
4. `docs/en/ai-entry.md`
5. `docs/en/architecture-contract.md`
6. `docs/en/governance-contract.md`
7. `docs/en/command-contract.md`
8. `docs/en/ci-deploy-contract.md`

## Scope Boundaries

AI agents should treat CCD as a governed deterministic pnpm + Turbo monorepo.

Allowed routine work:

- documentation updates
- targeted bug fixes
- diagnostics
- validation
- local regeneration of generated artifacts when instructed

Restricted areas unless explicitly required:

- `.ai/governance/**`
- `scripts/governance/**`
- `scripts/architecture/**`
- `tsconfig.base.json`
- `vercel.json`
- `.github/workflows/**`
- `docs/generated/**`
- `.ai/generated/**`
- `.ai/governance/api-snapshots/**`

## Commands

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

## Forbidden Changes

Do not:

- add global `@ccd/*` paths to `tsconfig.base.json`
- make Vercel run `build:ci`
- weaken governance
- bypass Husky
- manually edit generated reports or API snapshots
- force push
- invent missing package.json scripts

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

### Final Response Checklist

Before returning a result:

1. Report touched files.
2. Report commands executed.
3. Report validation results.
4. Report unresolved risks.
5. Report exact follow-up commands for the human operator.

## Validation Requirements

Before returning a result, identify the first failing command and validate after the fix.

Typical validation sequence:

1. `pnpm project:doctor`
2. `pnpm ccd:fix`
3. `pnpm lint:check`
4. `pnpm type-check`
5. `pnpm docs:commands`
6. `pnpm governance:gate`

## Documentation Language Rule

- Use Chinese docs for human developers.
- Use English docs for AI contracts.
- Keep `README.md` as the human entry point.
- Keep `README.en.md` and `docs/en/**` as AI entry points.

## Report Format

AI agents should report:

1. touched files
2. commands executed
3. validation results
4. remaining risks
5. exact recommended follow-up commands for the human operator
