---
title_en: README Replacement Note
title_zh: README 替换说明
aliases:
  - README cutover
  - README 切换
tags:
  - readme
  - cutover
tags_zh:
  - README
  - 切换
status: published
confidence: 0.9
source_langs:
  - en
source_paths:
  - README.md
  - README.en.md
  - wiki/_schema/readme-cutover-plan.md
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# README Replacement Note

This ZIP contains a generated `wiki/` directory intended for review and direct extraction into the CCD repository root.

## Placement

From the repository root, extract the ZIP so that the result is:

```text
wiki/index.md
wiki/log.md
wiki/canonical/**
wiki/indexes/**
wiki/indexes-zh/**
wiki/maps-zh/**
wiki/_schema/**
wiki/_templates/**
wiki/generated/**
wiki/raw/**
```

## Future README cutover

After review, root `README.md` should become a thin portal that points to:

- `wiki/index.md`
- `wiki/indexes-zh/开始阅读.md`
- `wiki/indexes/ai-entry.md`
- `wiki/indexes/generated-evidence-index.md`

`README.en.md` should become a thin AI portal to the same wiki substrate.

## Do not delete `/docs` yet

Do not delete `/docs` until:

- `wiki/indexes/migration-map.md` covers every `/docs` item.
- Source-path provenance is validated.
- Wiki links are validated.
- Raw archive preservation is complete for historical evidence.
- README cutover is complete.
- `pnpm docs:commands`, `pnpm governance:gate`, and targeted architecture/runtime/desktop validation pass in a real checkout.
