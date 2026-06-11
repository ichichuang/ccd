---
title_en: Dependency Governance
title_zh: 依赖治理
aliases:
  - Dependency policy
  - Supply chain
  - 依赖策略
  - 供应链治理
tags:
  - governance
  - dependencies
  - supply-chain
tags_zh:
  - 治理
  - 依赖
  - 供应链
status: verified
confidence: 0.94
source_langs:
  - en
source_paths:
  - wiki/**
  - package.json
  - pnpm-workspace.yaml
  - pnpm-lock.yaml
  - scripts/architecture/check-supply-chain.mjs
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Dependency Governance

CCD dependency work is policy-driven and lane-isolated. Do not run blind global upgrades on `main`.

## Placement policy

- Root `dependencies` are the central runtime singleton registry for app stacks and supply-chain policy; the root remains orchestration-only and must not import runtime code.
- Root `devDependencies` own workspace orchestration tools and local workspace package references used by governance, builds, and generated reports.
- Apps declare runtime packages they import in `dependencies`.
- Shared packages declare imported runtime packages in `dependencies`; build/test tools belong in `devDependencies`.
- `@ccd/*` workspace package placement must reflect runtime/build role, not hoisting convenience.

## Version policy

External dependency ranges are centralized in the default pnpm catalog in `pnpm-workspace.yaml`. Overrides may be used only for documented transitive risk, compatibility constraints, or security response. Modernization uses isolated lanes with manifest diff review, lockfile review, targeted validation, and rollback notes.

## Validation commands

```bash
pnpm deps:catalog:check
pnpm deps:scan
pnpm supply:check
pnpm governance:gate
```

## Evidence paths

This page is compiled from the following repository evidence paths:

- `wiki/**`
- `package.json`
- `pnpm-workspace.yaml`
- `pnpm-lock.yaml`
- `scripts/architecture/check-supply-chain.mjs`

## Related pages

- [[strategic-guardrails]]
- [[validation-gates]]
- [[release-policy]]
