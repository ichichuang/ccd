---
title_en: Wiki Governance
title_zh: Wiki 治理
aliases:
  - Wiki Governance
  - Wiki 治理
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

# Wiki Governance

This wiki is the compiled CCD architecture knowledge base. It follows the LLM Wiki model: raw sources are immutable evidence, canonical wiki pages are LLM-maintained compiled knowledge, and schema files discipline future maintenance.

## Operating principles

- Current `main` repository files remain source evidence.
- Canonical pages under `wiki/canonical/**` are English-first maintained synthesis.
- Chinese reader support lives in frontmatter, aliases, `tags_zh`, `indexes-zh/**`, and `maps-zh/**`.
- Do not maintain duplicated English/Chinese canonical pages.
- Preserve exact identifiers, package names, file paths, commands, config keys, APIs, URLs, PR/commit references, and stack traces.
- Update `wiki/index.md` when adding durable pages.
- Append to `wiki/log.md` for ingests, migrations, lint passes, and substantial query-derived updates.

## CCD-specific invariant

The wiki must preserve `@ccd/contracts -> @ccd/core -> apps/*`, app-owned runtime adapters, root orchestration-only behavior, PrimeVue as the UI ecosystem, app-owned alova HTTP runtime, app-owned safeStorage runtime, no global `@ccd/*` aliases, and P4 guardrails as non-actionable.
