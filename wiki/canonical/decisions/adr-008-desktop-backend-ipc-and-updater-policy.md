---
title_en: 'ADR-008: Desktop Backend IPC and Updater Policy'
title_zh: ADR-008：桌面后端 IPC 与更新器策略
aliases:
  - ADR-008
  - Desktop Backend IPC and Updater Policy
  - 桌面后端 IPC 与更新器策略
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
  - docs/adr/ADR-008-desktop-backend-ipc-and-updater-policy.md
  - docs/governance/strategic-guardrails.md
  - README.en.md
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# ADR-008: Desktop Backend IPC and Updater Policy

## Decision summary

Rust command handlers are added only for real backend capability through audited typed boundaries; updater and deep-link configuration remain disabled until a security model exists.

## Wiki treatment

This page preserves the ADR identifier exactly and links the decision into the Obsidian wiki graph. The original ADR file remains the durable decision evidence until `/docs` deletion readiness is proven and archival preservation is complete.

## Current impact

- The decision constrains future migration work.
- Wiki pages must cite this ADR when they restate or depend on its policy.
- Future owner decisions must update or supersede the ADR rather than silently contradict it.

## Evidence paths

This page is compiled from the following repository evidence paths:

- `docs/adr/ADR-008-desktop-backend-ipc-and-updater-policy.md`
- `docs/governance/strategic-guardrails.md`
- `README.en.md`

## Related pages

- [[desktop-tauri-backend-boundary]]
- [[desktop-security-baseline]]
- [[desktop-runtime]]
