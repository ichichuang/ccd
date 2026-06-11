---
title_en: AI Entry
title_zh: AI 入口
aliases:
  - AI wiki entry
  - AI 维护入口
tags:
  - index
  - ai
  - governance
tags_zh:
  - 索引
  - AI
  - 治理
status: published
confidence: 0.93
source_langs:
  - en
source_paths:
  - README.en.md
  - .ai/README.md
  - docs/en/ai-entry.md
  - wiki/canonical/**
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# AI Entry

This is the wiki entry for AI maintainers. Read in order:

1. [[monorepo-topology]]
2. [[package-responsibility-matrix]]
3. [[runtime-isolation]]
4. [[command-surface]]
5. [[validation-gates]]
6. [[ai-governance-control-plane]]
7. [[strategic-guardrails]]
8. [[docs-deletion-readiness]]

## Non-negotiables

- Preserve `@ccd/contracts -> @ccd/core -> apps/*`.
- Keep runtime APIs in app adapters or exact approved runtime boundaries.
- Keep alova HTTP runtime app-owned.
- Keep safeStorage concrete runtime app-owned.
- Keep PrimeVue as the UI ecosystem.
- Do not add global `@ccd/*` TypeScript aliases.
- Do not implement P4 strategic guardrails without a future owner-approved lane.
- Do not manually edit generated evidence.
