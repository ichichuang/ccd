---
title_en: 'ADR-004: Runtime Environment Policy'
title_zh: ADR-004：运行时环境策略
aliases:
  - ADR-004
  - Runtime Environment Policy
  - 运行时环境策略
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
  - wiki/**
  - wiki/**
  - README.en.md
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# ADR-004: Runtime Environment Policy

## Decision summary

Critical governance execution uses deterministic wrappers and Node.js `24.x` as the intentional repository engine lane across local, CI, TypeScript, and generated governance execution.

## Wiki treatment

This page preserves the ADR identifier exactly and links the decision into the Obsidian wiki graph. Git history retains the retired source file history.

## Current impact

- The decision constrains future migration work.
- Wiki pages must cite this ADR when they restate or depend on its policy.
- Future owner decisions must update or supersede the ADR rather than silently contradict it.

## Evidence paths

This page is compiled from the following repository evidence paths:

- `wiki/**`
- `wiki/**`
- `README.en.md`

## Related pages

- [[execute-reliability]]
- [[command-surface]]
