---
title_en: Maintenance Workflows
title_zh: 维护工作流
aliases:
  - Maintenance Workflows
  - 维护工作流
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
  - wiki/**
  - README.md
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Maintenance Workflows

## Ingest workflow

1. Identify source language and evidence path.
2. Preserve raw source unchanged.
3. Create or update English canonical pages.
4. Preserve exact identifiers and source terms.
5. Update frontmatter, `wiki/index.md`, relevant indexes, and Chinese presentation pages.
6. Append an entry to `wiki/log.md`.
7. Run wiki lint and any source-specific validation commands.

## Query workflow

Use canonical pages as the knowledge substrate. If an answer produces durable synthesis, file it back into canonical English pages and expose it through Chinese metadata/indexes if useful.

## Lint workflow

Check missing frontmatter, empty `source_paths`, duplicate English/Chinese canon, translated identifiers, broken wikilinks, low-confidence published pages, orphan pages, stale source paths, and generated-view drift.
