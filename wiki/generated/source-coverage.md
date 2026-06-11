---
title_en: Source Coverage
title_zh: 来源覆盖
aliases:
  - source coverage
  - 来源覆盖
tags:
  - generated
  - evidence
tags_zh:
  - 生成视图
  - 证据
status: published
confidence: 0.90
source_langs:
  - en
source_paths:
  - wiki/**/*.md
  - docs/**
  - .ai/**
  - apps/**
  - packages/**
  - scripts/**
  - .github/workflows/**
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Source Coverage

Generated view from wiki frontmatter `source_paths`.

## Docs disposition coverage

| Disposition        | Count |
| ------------------ | ----: |
| canonical page     |    50 |
| raw archive        |  2537 |
| generated evidence |    19 |
| compatibility shim |     1 |
| obsolete/skip      |    11 |
| blocker            |     0 |

## Frontmatter source-path usage

| Source path                                                  | References |
| ------------------------------------------------------------ | ---------: |
| `.ai/**`                                                     |          1 |
| `.ai/generated/**`                                           |          3 |
| `.ai/governance/api-snapshots/**`                            |          3 |
| `.ai/governance/policies/**`                                 |          1 |
| `.ai/governance/policies/runtime.json`                       |          1 |
| `.ai/manifests/**`                                           |          1 |
| `.ai/protocol/**`                                            |          1 |
| `.ai/README.md`                                              |          8 |
| `.ai/rules/**`                                               |          1 |
| `.ai/runtime/owner_decisions.md`                             |          1 |
| `.ai/runtime/repair_list.md`                                 |          6 |
| `.ai/skills/**`                                              |          1 |
| `.github/CODEOWNERS`                                         |          1 |
| `.github/workflows/**`                                       |          1 |
| `.github/workflows/ci.yml`                                   |          5 |
| `.github/workflows/deploy.yml`                               |          2 |
| `apps/**`                                                    |          1 |
| `apps/desktop/**`                                            |          1 |
| `apps/desktop/src-tauri/**`                                  |          1 |
| `apps/desktop/src-tauri/capabilities/default.json`           |          1 |
| `apps/desktop/src-tauri/Cargo.toml`                          |          2 |
| `apps/desktop/src-tauri/security-scopes.json`                |          1 |
| `apps/desktop/src-tauri/src/main.rs`                         |          2 |
| `apps/desktop/src-tauri/tauri.conf.json`                     |          1 |
| `apps/desktop/src/adapters/index.ts`                         |          3 |
| `apps/web-demo/**`                                           |          2 |
| `apps/web-demo/src/utils/http/**`                            |          1 |
| `apps/web-demo/src/utils/safeStorage/**`                     |          1 |
| `docs/**`                                                    |          4 |
| `docs/adr/ADR-001-monorepo-runtime-boundary.md`              |          1 |
| `docs/adr/ADR-002-legacy-freeze-policy.md`                   |          1 |
| `docs/adr/ADR-003-governance-pipeline.md`                    |          2 |
| `docs/adr/ADR-004-runtime-environment-policy.md`             |          2 |
| `docs/adr/ADR-005-common-platform-layer-terminology.md`      |          2 |
| `docs/adr/ADR-006-approval-gated-architecture-lanes.md`      |          3 |
| `docs/adr/ADR-007-runtime-stack-and-tooling-choices.md`      |          1 |
| `docs/adr/ADR-008-desktop-backend-ipc-and-updater-policy.md` |          3 |
| `docs/architecture/ownership-boundaries.md`                  |          1 |
| `docs/documentation-system.md`                               |         10 |
| `docs/en/ai-entry.md`                                        |          2 |
| `docs/en/architecture-contract.md`                           |         20 |
| `docs/en/ci-deploy-contract.md`                              |          1 |
| `docs/en/command-contract.md`                                |          1 |
| `docs/en/governance-contract.md`                             |          1 |
| `docs/en/troubleshooting-contract.md`                        |          1 |
| `docs/generated/**`                                          |          3 |
| `docs/generated/api-surface-report.md`                       |         11 |
| `docs/governance/dependency-policy.md`                       |          1 |
| `docs/governance/desktop-security-scope-review.md`           |          4 |
| `docs/governance/github-governance.md`                       |          1 |
| `docs/governance/primevue-i18n-verification.md`              |          2 |
| `docs/governance/product-lines.md`                           |          1 |
| `docs/governance/strategic-guardrails.md`                    |         14 |
| `docs/project-control-center.md`                             |          1 |
| `docs/README.md`                                             |         10 |
| `docs/release/release-policy.md`                             |          1 |
| `docs/release/runtime-promotion-checklist.md`                |          1 |
| `docs/runtime/desktop-runtime.md`                            |          3 |
| `docs/runtime/execute-reliability.md`                        |          1 |
| `docs/runtime/portable-runtime.md`                           |          1 |
| `docs/runtime/runtime-isolation.md`                          |         10 |
| `docs/runtime/web-runtime.md`                                |          2 |
| `docs/zh/01-quickstart.md`                                   |          1 |
| `docs/zh/04-project-control-center.md`                       |          1 |
| `docs/zh/05-ci-deploy.md`                                    |          1 |
| `docs/zh/07-troubleshooting.md`                              |          1 |
| `docs/zh/08-release.md`                                      |          1 |
| `https://github.com/ichichuang/ccd`                          |          1 |
| `mise.toml`                                                  |          2 |
| `package.json`                                               |         12 |
| `packages/**`                                                |          1 |
| `packages/contracts/src/http/**`                             |          1 |
| `packages/contracts/src/index.ts`                            |          2 |
| `packages/contracts/src/storage.ts`                          |          1 |
| `packages/core/src/index.ts`                                 |          2 |
| `packages/design-tokens/**`                                  |          1 |
| `packages/shared-utils/**`                                   |          2 |
| `packages/unocss-preset/**`                                  |          1 |
| `packages/vue-app-platform/**`                               |          1 |
| `packages/vue-charts/**`                                     |          1 |
| `packages/vue-hooks/**`                                      |          1 |
| `packages/vue-primevue-adapter/**`                           |          1 |
| `packages/vue-ui/**`                                         |          1 |
| `pnpm-lock.yaml`                                             |          1 |
| `pnpm-workspace.yaml`                                        |          2 |
| `README.en.md`                                               |         36 |
| `README.md`                                                  |         10 |
| `scripts/**`                                                 |          1 |
| `scripts/architecture/check-api-surface.mjs`                 |          1 |
| `scripts/architecture/check-release-governance.mjs`          |          1 |
| `scripts/architecture/check-root-runtime-decommissioned.mjs` |          1 |
| `scripts/architecture/check-runtime-leaks.mjs`               |          1 |
| `scripts/architecture/check-supply-chain.mjs`                |          1 |
| `scripts/architecture/desktop-security-rules.mjs`            |          1 |
| `scripts/architecture/release-audit.mjs`                     |          1 |
| `scripts/env.sh`                                             |          1 |
| `scripts/exec.sh`                                            |          1 |
| `scripts/governance/gate.mjs`                                |          1 |
| `scripts/normalize-generated-output.mjs`                     |          1 |
| `scripts/project-config.mjs`                                 |          1 |
| `scripts/validate-workspace.mjs`                             |          1 |
| `uploaded://deep-research-report.md`                         |          2 |
| `uploaded://llm-wiki.md`                                     |         10 |
| `wiki/_schema/**`                                            |          1 |
| `wiki/_schema/docs-deletion-readiness.md`                    |          1 |
| `wiki/_schema/frontmatter-contract.md`                       |          1 |
| `wiki/_schema/status-confidence-policy.md`                   |          1 |
| `wiki/**`                                                    |          2 |
| `wiki/**/*.md`                                               |          4 |
| `wiki/canonical/**`                                          |         22 |
| `wiki/generated/**`                                          |          1 |
| `wiki/generated/docs-deletion-readiness-report.md`           |          1 |
| `wiki/index.md`                                              |          7 |
| `wiki/indexes-zh/**`                                         |          8 |
| `wiki/indexes/**`                                            |          1 |
| `wiki/indexes/migration-map.md`                              |          2 |
