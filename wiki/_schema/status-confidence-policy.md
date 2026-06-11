---
title_en: Status and Confidence Policy
title_zh: 状态与置信度策略
aliases:
  - Status and Confidence Policy
  - 状态与置信度策略
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

# Status and Confidence Policy

## Status lifecycle

```text
draft -> verified -> published -> deprecated
```

- `draft`: created or substantially changed but not fully checked.
- `verified`: checked against direct source evidence.
- `published`: safe for top-level navigation and human-facing indexes.
- `deprecated`: superseded or merged; retain for redirects until links are cleaned.

## Confidence values

- `0.90-1.00`: direct evidence, low ambiguity.
- `0.75-0.89`: well supported but needs periodic review.
- `0.50-0.74`: partial, single-source, or inferred.
- `<0.50`: not ready for presentation views.
