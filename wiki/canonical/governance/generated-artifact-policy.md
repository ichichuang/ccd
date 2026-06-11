---
title_en: Generated Artifact Policy
title_zh: 生成物策略
aliases:
  - Generated outputs
  - Artifact policy
  - 生成文档
  - 生成证据
tags:
  - governance
  - generated
  - evidence
tags_zh:
  - 治理
  - 生成物
  - 证据
status: verified
confidence: 0.95
source_langs:
  - en
source_paths:
  - README.en.md
  - .ai/README.md
  - docs/README.md
  - docs/documentation-system.md
  - docs/generated/**
  - .ai/generated/**
  - .ai/governance/api-snapshots/**
  - scripts/normalize-generated-output.mjs
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Generated Artifact Policy

Generated outputs are source evidence views and drift checks. They must not be manually maintained as canonical prose.

## Do not hand edit

- `docs/generated/**`
- `.ai/generated/**`
- `.ai/governance/api-snapshots/**`

## Update path

Fix the generator, package export, governance policy, or source input, then regenerate with the approved commands and commit generated output with the source change.

```bash
pnpm governance:refresh
pnpm governance:gate
```

## Wiki representation

The wiki may create generated-view style pages under `wiki/generated/**`, but those are navigation and coverage summaries. They do not replace original generated evidence.

## Evidence paths

This page is compiled from the following repository evidence paths:

- `README.en.md`
- `.ai/README.md`
- `docs/README.md`
- `docs/documentation-system.md`
- `docs/generated/**`
- `.ai/generated/**`
- `.ai/governance/api-snapshots/**`
- `scripts/normalize-generated-output.mjs`

## Related pages

- [[generated-governance-surface]]
- [[source-coverage]]
- [[validation-gates]]
