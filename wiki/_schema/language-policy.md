---
title_en: Language Policy
title_zh: 语言策略
aliases:
  - Language Policy
  - 语言策略
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

# Language Policy

The canonical wiki language is English.

## Raw sources

Raw sources stay in their original language and are not translated, renamed, or normalized in place.

## Canonical pages

Canonical pages use English filenames and English body text. Preserve exact source identifiers in any language when they matter.

## Chinese presentation

Chinese support is provided through `title_zh`, Chinese aliases, `tags_zh`, generated indexes under `indexes-zh/**`, and maps under `maps-zh/**`. Chinese pages are views, not independent canonical authority.

## Identifier preservation

Never translate code identifiers, file paths, commands, package names, config keys, stack traces, URLs, API names, protocol tokens, commit hashes, or PR references.
