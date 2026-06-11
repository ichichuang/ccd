---
title_en: README Cutover Plan
title_zh: README 切换计划
aliases:
  - README Cutover Plan
  - README 切换计划
tags:
  - schema
  - wiki-governance
tags_zh:
  - 模式
  - Wiki 治理
status: published
confidence: 0.93
source_langs:
  - en
  - zh
source_paths:
  - uploaded://llm-wiki.md
  - README.en.md
  - docs/documentation-system.md
  - docs/README.md
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# README Cutover Plan

This file is a replacement note, not an instruction to edit the repository during package review.

## Future root README shape

Root `README.md` should become a thin portal:

- Project identity in one screen.
- Minimal quickstart commands that exist in `package.json`.
- Link to `wiki/index.md` as the single architecture knowledge base.
- Link to `wiki/indexes-zh/开始阅读.md` for Chinese reader navigation.
- Link to `wiki/indexes/ai-entry.md` for AI maintainers.
- Link to generated evidence indexes, not scattered generated reports.

`README.en.md` should become a thin AI-facing portal to the same wiki substrate instead of a separate English documentation universe.

## Do not delete `/docs` during README cutover

Cut README first, keep `/docs` as compatibility, validate links and provenance, then only consider `/docs` deletion after the deletion-readiness checklist passes.
