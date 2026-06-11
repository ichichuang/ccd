---
title_en: 'ADR-005: Common Platform Layer Terminology'
title_zh: ADR-005：公共平台层术语
aliases:
  - ADR-005
  - Common Platform Layer Terminology
  - 公共平台层术语
tags:
  - decisions
  - adr
  - architecture
tags_zh:
  - 决策
  - ADR
  - 架构
status: verified
confidence: 0.93
source_langs:
  - en
source_paths:
  - docs/adr/ADR-005-common-platform-layer-terminology.md
  - docs/governance/strategic-guardrails.md
  - README.en.md
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# ADR-005: Common Platform Layer Terminology

## Decision summary

Use `common platform layer` for the governed `packages/*` set. `packages/core` is only one minimal runtime-neutral package inside that layer, not a common-code bucket.

## Wiki treatment

This page preserves the ADR identifier exactly and links the decision into the Obsidian wiki graph. The original ADR file remains the durable decision evidence until `/docs` deletion readiness is proven and archival preservation is complete.

## Current impact

- The decision constrains future migration work.
- Wiki pages must cite this ADR when they restate or depend on its policy.
- Future owner decisions must update or supersede the ADR rather than silently contradict it.

## Evidence paths

This page is compiled from the following repository evidence paths:

- `docs/adr/ADR-005-common-platform-layer-terminology.md`
- `docs/governance/strategic-guardrails.md`
- `README.en.md`

## Related pages

- [[package-responsibility-matrix]]
- [[core-boundary]]
