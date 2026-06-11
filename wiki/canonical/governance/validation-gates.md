---
title_en: Validation Gates
title_zh: 验证门禁
aliases:
  - Governance gate
  - Quality gate
  - 验证
  - 治理门禁
tags:
  - governance
  - validation
  - ci
tags_zh:
  - 治理
  - 验证
  - CI
status: verified
confidence: 0.94
source_langs:
  - en
source_paths:
  - package.json
  - .ai/README.md
  - wiki/**
  - wiki/**
  - .github/workflows/ci.yml
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Validation Gates

The authoritative architecture gate is `pnpm governance:gate`. It orchestrates governance validation, AI guard checks, boundary validation, runtime checks, API surface reporting, supply-chain checks, release governance, GitHub workflow registry checks, architecture reports, and generated artifact drift checks.

## Common gates

```bash
pnpm wiki:commands
pnpm arch:runtime
pnpm arch:boundaries
pnpm api:report
pnpm supply:check
pnpm governance:gate
pnpm type-check
pnpm lint:check
pnpm test:run
pnpm build:ci
pnpm validate
```

## Desktop gates

```bash
pnpm desktop:security
pnpm desktop:smoke
pnpm build:desktop
cargo check --locked --manifest-path apps/desktop/src-tauri/Cargo.toml
```

## Gate design

Subcommands are useful for local diagnosis, but CI and merge readiness depend on the unified gate and quality workflows. Generated governance artifacts must be reproducible and committed with the source changes that produced them.

## Evidence paths

This page is compiled from the following repository evidence paths:

- `package.json`
- `.ai/README.md`
- `wiki/**`
- `wiki/**`
- `.github/workflows/ci.yml`

## Related pages

- [[command-surface]]
- [[generated-artifact-policy]]
- [[ci-and-deploy]]
- [[adr-003-governance-pipeline]]
