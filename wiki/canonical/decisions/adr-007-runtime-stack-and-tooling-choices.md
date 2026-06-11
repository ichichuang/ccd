---
title_en: 'ADR-007: Runtime Stack and Tooling Choices'
title_zh: ADR-007：运行时栈与工具选择
aliases:
  - ADR-007
  - Runtime Stack and Tooling Choices
  - 运行时栈与工具选择
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

# ADR-007: Runtime Stack and Tooling Choices

## Decision summary

CCD keeps Vue 3 + TypeScript + Composition API, Vite, UnoCSS, PrimeVue v4, Tauri v2, pnpm workspaces, and Turborepo as the current architecture baseline.

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

- [[vue-primevue-adapter-role]]
- [[desktop-runtime]]
- [[dependency-governance]]
