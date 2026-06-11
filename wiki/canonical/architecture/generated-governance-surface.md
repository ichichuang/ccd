---
title_en: Generated Governance Surface
title_zh: 生成治理表面
aliases:
  - Generated evidence
  - Governance reports
  - 生成报告
  - 治理证据
tags:
  - architecture
  - governance
  - generated
tags_zh:
  - 架构
  - 治理
  - 生成物
status: verified
confidence: 0.93
source_langs:
  - en
source_paths:
  - README.en.md
  - .ai/README.md
  - wiki/generated/**
  - .ai/generated/**
  - .ai/governance/api-snapshots/**
  - scripts/governance/gate.mjs
  - scripts/architecture/check-api-surface.mjs
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Generated Governance Surface

Generated outputs are evidence, not hand-maintained canonical prose. CCD uses generated docs, API snapshots, governance reports, and dependency/architecture graphs as machine-readable or machine-produced evidence.

## Generated surfaces

- `wiki/generated/**`
- `.ai/generated/**`
- `.ai/governance/api-snapshots/**`
- `wiki/generated/api-surface-report.md`
- `wiki/generated/governance-report.md`
- `wiki/generated/architecture-overview.md`
- Mermaid diagrams under `wiki/generated/diagrams/**`

## Maintenance rule

If a generated artifact is stale or wrong, fix the source policy, generator, package export, or architecture input, then rerun the approved generation command. Do not manually edit generated reports or snapshots.

## Validation commands

```bash
pnpm governance:refresh
pnpm governance:gate
pnpm api:report
pnpm arch:report
pnpm arch:graphs
```

## Evidence paths

This page is compiled from the following repository evidence paths:

- `README.en.md`
- `.ai/README.md`
- `wiki/generated/**`
- `.ai/generated/**`
- `.ai/governance/api-snapshots/**`
- `scripts/governance/gate.mjs`
- `scripts/architecture/check-api-surface.mjs`

## Related pages

- [[generated-artifact-policy]]
- [[validation-gates]]
- [[source-provenance-policy]]
