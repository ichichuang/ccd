---
title_en: CCD AI UI Skill Governance
title_zh: CCD AI UI 技能治理
aliases:
  - AI UI skill loading
  - Design skill governance
tags:
  - design
  - ai
  - governance
tags_zh:
  - 设计
  - AI
  - 治理
status: draft
confidence: 0.82
source_langs:
  - en
  - zh
source_paths:
  - .ai/protocol/AGENTS.core.md
  - .ai/skills/design/**
  - .ai/rules/**
last_reviewed: '2026-06-15'
wiki_owner: LLM-maintained CCD architecture wiki
---

# CCD AI UI Skill Governance

When AI agents work on UI or visual tasks, they must load the CCD design skills in addition to existing repository rules.

## Canonical statement

Design skills are mandatory guidance for AI-generated UI quality, but they remain subordinate to `.ai/rules/**`, PrimeVue v4 rules, UnoCSS guardrails, UIDesignState, runtime boundaries, and governance gates.

## Auto-activation triggers

Load design skills when a user asks for:

- UI or UX changes;
- visual polish;
- Apple-like or Google-like quality;
- liquid glass or material work;
- dashboard, settings, login, form, table, dialog, drawer, navigation, layout, responsive, dark-mode, or motion work.

## Skill loading order

```text
ccd-product-language
ccd-page-archetypes
ccd-material-system
ccd-motion-system
ccd-ui-review-gate
```

## Validation

UI-heavy changes should run focused checks first and escalate to:

```bash
pnpm lint:check
pnpm build:web-demo
pnpm e2e:visual
pnpm e2e:qa
pnpm governance:gate
pnpm validate
```

## Evidence paths

- `.ai/protocol/AGENTS.core.md`
- `.ai/runtime/owner_decisions.md`
- `.ai/skills/design/**`
- `.ai/rules/**`
- `package.json`

## Related pages

- [[ccd-product-design-language]]
- [[ai-governance-control-plane]]
- [[validation-gates]]
- [[command-surface]]
- [[generated-artifact-policy]]
