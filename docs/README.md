# CCD Docs Map

This file is a routing map for human developers and AI agents.

Do not treat it as a full manual. It points to the canonical docs and explains how to read them.

## 1. Chinese human reading order

Use this path for onboarding, usage, operations, and troubleshooting.

1. [README.md](../README.md)
2. [docs/zh/00-overview.md](./zh/00-overview.md)
3. [docs/zh/01-quickstart.md](./zh/01-quickstart.md)
4. [docs/zh/02-architecture.md](./zh/02-architecture.md)
5. [docs/zh/03-governance.md](./zh/03-governance.md)
6. [docs/zh/04-project-control-center.md](./zh/04-project-control-center.md)
7. [docs/zh/05-ci-deploy.md](./zh/05-ci-deploy.md)
8. [docs/zh/06-ai-workflow.md](./zh/06-ai-workflow.md)
9. [docs/zh/07-troubleshooting.md](./zh/07-troubleshooting.md)
10. [docs/zh/08-release.md](./zh/08-release.md)

## 2. English AI reading order

Use this path for contracts, constraints, validation, and repair behavior.

1. [README.en.md](../README.en.md)
2. [docs/en/ai-entry.md](./en/ai-entry.md)
3. [docs/en/architecture-contract.md](./en/architecture-contract.md)
4. [docs/en/governance-contract.md](./en/governance-contract.md)
5. [docs/en/command-contract.md](./en/command-contract.md)
6. [docs/en/ci-deploy-contract.md](./en/ci-deploy-contract.md)
7. [docs/en/project-metadata-contract.md](./en/project-metadata-contract.md)
8. [docs/en/troubleshooting-contract.md](./en/troubleshooting-contract.md)

## 3. First-time developer path summary

Start with the repo root, then move from overview to quickstart, architecture, governance, and CI/deploy.

Recommended minimum:

1. [README.md](../README.md)
2. [docs/zh/00-overview.md](./zh/00-overview.md)
3. [docs/zh/01-quickstart.md](./zh/01-quickstart.md)
4. [docs/zh/02-architecture.md](./zh/02-architecture.md)
5. [docs/zh/03-governance.md](./zh/03-governance.md)
6. [docs/zh/05-ci-deploy.md](./zh/05-ci-deploy.md)

## 4. AI maintenance path summary

AI agents should read the English contract layer before modifying code, workflows, or generated artifacts.

Recommended minimum:

1. [README.en.md](../README.en.md)
2. [docs/en/ai-entry.md](./en/ai-entry.md)
3. [docs/en/architecture-contract.md](./en/architecture-contract.md)
4. [docs/en/command-contract.md](./en/command-contract.md)
5. [docs/en/governance-contract.md](./en/governance-contract.md)
6. [docs/en/troubleshooting-contract.md](./en/troubleshooting-contract.md)

## 5. Architecture and governance document map

| Domain              | Docs                                                                                                                                  | Source of truth                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Platform            | [README.md](../README.md), [docs/zh/02-architecture.md](./zh/02-architecture.md)                                                      | `packages/**`, `apps/**`, root shell, `.ai/governance/policies/topology.json` |
| Governance          | [docs/zh/03-governance.md](./zh/03-governance.md), [docs/en/governance-contract.md](./en/governance-contract.md)                      | `.ai/governance/policies/**`, `scripts/governance/**`                         |
| Commands            | [docs/en/command-contract.md](./en/command-contract.md)                                                                               | root `package.json`, repo scripts                                             |
| CI / Deploy         | [docs/zh/05-ci-deploy.md](./zh/05-ci-deploy.md), [docs/en/ci-deploy-contract.md](./en/ci-deploy-contract.md)                          | `.github/workflows/**`, deploy configs                                        |
| AI workflow         | [docs/zh/06-ai-workflow.md](./zh/06-ai-workflow.md), [docs/en/ai-entry.md](./en/ai-entry.md)                                          | `.ai/protocol/**`, `.ai/rules/**`, `.ai/skills/**`                            |
| Troubleshooting     | [docs/zh/07-troubleshooting.md](./zh/07-troubleshooting.md), [docs/en/troubleshooting-contract.md](./en/troubleshooting-contract.md)  | issue patterns, logs, CI failure history                                      |
| Generated artifacts | [docs/generated/governance-report.md](./generated/governance-report.md) and other files under `docs/generated/**`, `.ai/generated/**` | generated outputs only                                                        |

## 6. Generated artifact explanation

Human docs explain usage, onboarding, operations, and troubleshooting.

AI docs define contracts, constraints, validation, and repair behavior.

Generated docs are audit outputs and must not be manually edited.

If generated docs are wrong, fix the generator or policy source and rerun governance commands.

Validation command:

```bash
pnpm docs:commands
```
