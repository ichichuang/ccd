---
title_en: Linking Conventions
title_zh: 链接约定
aliases:
  - Linking Conventions
  - 链接约定
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

# Linking Conventions

Use stable Obsidian wikilinks between canonical pages.

## Canonical links

- Link by unique English slug: `[[runtime-isolation]]`.
- Avoid duplicate filenames across canonical domains.
- Keep exact repo paths in backticks, not as translated prose.
- Link Chinese presentation pages back to English canonical pages.

## Index links

- `wiki/index.md` is the master content-oriented entry.
- `wiki/log.md` is chronological and append-only.
- `wiki/indexes/**` is English/domain-oriented.
- `wiki/indexes-zh/**` is Chinese presentation.
- `wiki/maps-zh/**` is Chinese map/fallback navigation.
