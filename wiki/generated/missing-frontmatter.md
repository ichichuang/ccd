---
title_en: Missing Frontmatter
title_zh: 缺失 Frontmatter
aliases:
  - frontmatter lint
  - frontmatter 检查
tags:
  - generated
  - lint
tags_zh:
  - 生成视图
  - 检查
status: published
confidence: 0.86
source_langs:
  - en
source_paths:
  - wiki/canonical/**
  - wiki/_schema/frontmatter-contract.md
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Missing Frontmatter

Generated-view style page.

## Result

Local package validation requires every canonical markdown file under `wiki/canonical/**` to include:

- `title_en`
- `title_zh`
- `aliases`
- `tags`
- `tags_zh`
- `status`
- `confidence`
- `source_langs`
- `source_paths`
- `last_reviewed`
- `wiki_owner`

The validation summary in `WIKI_PACKAGE_MANIFEST.md` records the current result.
