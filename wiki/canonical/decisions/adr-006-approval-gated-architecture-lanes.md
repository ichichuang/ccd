---
title_en: 'ADR-006: Approval-Gated Architecture Lanes'
title_zh: ADR-006：审批门控架构车道
aliases:
  - ADR-006
  - Approval-Gated Architecture Lanes
  - 审批门控架构车道
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

# ADR-006: Approval-Gated Architecture Lanes

## Decision summary

Architecture lanes that affect UI boundary policy, HTTP contracts/core, guard strictness, GitHub remote governance, Vite major migration, or dependency modernization require explicit approval before implementation.

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

- [[strategic-guardrails]]
- [[runtime-promotion-checklist]]
