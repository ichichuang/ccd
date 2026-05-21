# AI Governance Workspace

`.ai/**` is the canonical control plane for AI execution, architecture policy, generated adapters, and machine-enforced repository governance.

## Current Platform State

CCD is a self-protecting deterministic multi-runtime platform repository.

```text
@ccd/contracts -> @ccd/core -> apps/*
```

- `packages/contracts`: public ABI, interfaces, and shared types only.
- `packages/core`: runtime-neutral platform logic.
- `apps/web-demo`: single browser runtime source of truth and browser adapters.
- `apps/desktop`: Tauri runtime adapters.
- `root`: orchestration-only shell.
- Removed runtime archives are retained in Git history only; active graphs use workspace packages and app adapters.

## Canonical AI Paths

| Path                              | Role                                                      |
| --------------------------------- | --------------------------------------------------------- |
| `.ai/protocol/**`                 | agent entrypoints, adapter contracts, protocol versioning |
| `.ai/rules/**`                    | architecture and implementation laws                      |
| `.ai/skills/**`                   | local AI execution skills                                 |
| `.ai/manifests/**`                | generated routing, rule, and skill locks                  |
| `.ai/governance/policies/**`      | machine-readable architecture policy engine               |
| `.ai/governance/api-snapshots/**` | public API immutability baselines                         |
| `.ai/generated/**`                | generated governance reports                              |
| `.ai/runtime/**`                  | local runtime ledger and execution state                  |
| `.ai/orchestration/**`            | agent and role orchestration manifests                    |

## Single Governance Gate

The authoritative architecture gate is:

```bash
pnpm governance:gate
```

It executes:

1. `pnpm governance:validate`
2. `pnpm ai:guard -- --format=json`
3. `pnpm arch:boundaries`
4. `pnpm arch:runtime`
5. `pnpm api:report`
6. `pnpm supply:check`
7. `pnpm release:governance`
8. `pnpm governance:github-workflows`
9. `pnpm arch:report`
10. generated governance artifact drift check

CI calls this gate directly before typecheck, tests, lint, and production builds.

## Policy Engine

Policy files under `.ai/governance/policies/**` define repository constraints:

- `topology.json`: package layers, dependency direction, criticality, export rules
- `runtime.json`: runtime-neutral denylist and adapter boundaries
- `ai.json`: AI-safe code generation constraints and allowed adapter exceptions
- `api.json`: API snapshot baseline and breaking-change rules
- `supply-chain.json`: dependency allowlists, lifecycle script policy, license policy
- `release.json`: Changesets config, release order, protected paths, single gate contract
- `version.json`: policy version baseline

Validation scripts must consume these manifests instead of duplicating hardcoded rules.

## Generated Adapter Contract

Generated compatibility adapters:

- `AGENTS.md` <= `.ai/protocol/AI.entry.md`
- `CLAUDE.md` <= `.ai/protocol/adapter-manifest.json`
- `.ai/protocol/adapters/*.md` <= `.ai/protocol/adapter-manifest.json`
- local Codex skills <= `.ai/skills/**`

Do not manually maintain generated adapters. Edit canonical `.ai/**` sources and run:

```bash
pnpm ai:sync
pnpm ai:sync:codex
```

## AI Agent Rules

- Load `.ai/protocol/AGENTS.core.md` before implementation.
- Use the minimum applicable skill set for the touched surface.
- Treat `pnpm governance:gate` as the required final architecture gate.
- Never deep import workspace packages.
- Never revive removed runtime archive directories into active dependency graphs.
- Keep runtime APIs inside app adapter directories.
- Commit generated reports and API snapshot changes with the source change that produced them.

## Documentation Maintenance Protocol

Before editing any documentation:

1. Read `package.json` and confirm every documented command exists in `scripts`.
2. Run `pnpm docs:commands` to validate command references.
3. Do not invent command names.
4. Do not manually edit `docs/generated/**`, `.ai/generated/**`, or `.ai/governance/api-snapshots/**`.

Before changing architecture:

1. Read `docs/en/architecture-contract.md`.
2. Read `.ai/protocol/AGENTS.core.md`.
3. Confirm runtime neutrality is preserved.

Before returning a result:

1. Report touched files, commands executed, validation results, and unresolved risks.
2. Report exact follow-up commands for the human operator.

## GitHub Enforcement

GitHub CI enforces:

```text
pnpm install --frozen-lockfile
pnpm ai:sync
pnpm governance:gate
pnpm ai:sync && pnpm ai:sync:codex drift check
pnpm type-check
pnpm test:run
pnpm lint:check
turbo run build
pnpm build:desktop && pnpm budget:desktop
pnpm e2e:qa
```

Ownership starts at `.github/CODEOWNERS`; branch protection should require the CI workflow before merge.

Remote workflow registry state is part of governance:

- active repo workflows: `ci.yml`, `deploy.yml`
- active remote-managed workflow: `dynamic/dependabot/dependabot-updates`
- disabled historical workflows: `Build Desktop (Windows)`, `Release Desktop`, `Smoke Desktop`

`pnpm governance:github-workflows` fails if any undeclared workflow becomes active again.

## Reference Docs

- [Platform README](../README.md)
- [Documentation Index](../docs/README.md)
- [Governance](../docs/governance.md)
- [AI Workspace](../docs/ai-workspace.md)
- [Codex Quickstart](../docs/codex/quickstart.md)
