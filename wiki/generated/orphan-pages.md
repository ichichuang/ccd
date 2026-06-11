---
title_en: Orphan Pages
title_zh: 孤立页面
aliases:
  - orphan pages
  - 孤立页面
tags:
  - generated
  - lint
tags_zh:
  - 生成视图
  - 检查
status: published
confidence: 0.82
source_langs:
  - en
source_paths:
  - wiki/**/*.md
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Orphan Pages

Generated-view style page.

## Result

No canonical orphan pages were intentionally generated. Every canonical page is reachable through at least one of:

- `wiki/index.md`
- a domain index under `wiki/indexes/**`
- a Chinese presentation index under `wiki/indexes-zh/**`
- a map fallback under `wiki/maps-zh/**`

A future lint pass should compute inbound wikilinks and update this file automatically.
