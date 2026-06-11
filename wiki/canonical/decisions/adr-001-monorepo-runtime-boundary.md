---
title_en: 'ADR-001: Monorepo Runtime Boundary'
title_zh: ADR-001：Monorepo 运行时边界
aliases:
  - ADR-001
  - Monorepo Runtime Boundary
  - Monorepo 运行时边界
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
  - docs/adr/ADR-001-monorepo-runtime-boundary.md
  - docs/governance/strategic-guardrails.md
  - README.en.md
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# ADR-001: Monorepo Runtime Boundary

## Decision summary

CCD converged from root-owned runtime code to a workspace topology where `apps/web-demo` owns browser runtime, `apps/desktop` owns Tauri runtime, `packages/contracts` owns interfaces/shared types, and `packages/core` remains runtime-neutral.

## Wiki treatment

This page preserves the ADR identifier exactly and links the decision into the Obsidian wiki graph. The original ADR file remains the durable decision evidence until `/docs` deletion readiness is proven and archival preservation is complete.

## Current impact

- The decision constrains future migration work.
- Wiki pages must cite this ADR when they restate or depend on its policy.
- Future owner decisions must update or supersede the ADR rather than silently contradict it.

## Evidence paths

This page is compiled from the following repository evidence paths:

- `docs/adr/ADR-001-monorepo-runtime-boundary.md`
- `docs/governance/strategic-guardrails.md`
- `README.en.md`

## Related pages

- [[monorepo-topology]]
- [[runtime-isolation]]
