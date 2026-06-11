---
title_en: 'ADR-003: Governance Pipeline'
title_zh: ADR-003：治理流水线
aliases:
  - ADR-003
  - Governance Pipeline
  - 治理流水线
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

# ADR-003: Governance Pipeline

## Decision summary

CCD consolidates governance behind `pnpm governance:gate`; subcommands support local diagnosis, but CI policy is centralized and generated governance artifacts remain reproducible evidence.

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

- [[validation-gates]]
- [[generated-artifact-policy]]
