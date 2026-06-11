---
title_en: 'ADR-002: Removed Browser Runtime Archive'
title_zh: ADR-002：移除浏览器运行时归档
aliases:
  - ADR-002
  - Removed Browser Runtime Archive
  - 移除浏览器运行时归档
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

# ADR-002: Removed Browser Runtime Archive

## Decision summary

The working-tree browser runtime archive is removed. Historical comparison uses Git history, generated reports, release artifacts, and current governance snapshots; removed archive directories must not return as active inputs.

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

- [[monorepo-topology]]
- [[generated-artifact-policy]]
