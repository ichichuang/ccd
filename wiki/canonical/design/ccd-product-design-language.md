---
title_en: CCD Product Design Language
title_zh: CCD 产品设计语言
aliases:
  - CCD Architectural Glass
  - CCD UI Language
tags:
  - design
  - ui
  - governance
tags_zh:
  - 设计
  - UI
  - 治理
status: draft
confidence: 0.82
source_langs:
  - en
  - zh
source_paths:
  - .ai/skills/design/**
  - .ai/rules/design-system/**
  - .ai/rules/components/**
  - packages/unocss-preset/**
  - packages/vue-ui/**
last_reviewed: '2026-06-15'
wiki_owner: LLM-maintained CCD architecture wiki
---

# CCD Product Design Language

CCD uses `Architectural Glass`: a product design language that combines Apple-like clarity, Vercel-like precision, Linear-like calm, Material-style state completeness, and CCD architecture governance.

## Canonical statement

CCD UI work starts from product structure, not decoration. AI agents must translate vague requests such as "Apple-like", "Google-like", "liquid glass", "premium", or "beautify" into a CCD-specific language that preserves PrimeVue, UnoCSS, UIDesignState, runtime boundaries, and repository governance.

## Principles

- Content over decoration.
- Hierarchy over effects.
- Rhythm over gradients.
- Structure over animation.
- Materials explain layers.
- Motion explains change.
- Beauty never fights usability.
- Architecture is visible through clarity, not literal diagrams.

## Skill entrypoints

- `.ai/skills/design/ccd-product-language/SKILL.md`
- `.ai/skills/design/ccd-motion-system/SKILL.md`
- `.ai/skills/design/ccd-material-system/SKILL.md`
- `.ai/skills/design/ccd-page-archetypes/SKILL.md`
- `.ai/skills/design/ccd-ui-review-gate/SKILL.md`

## Governance posture

The design language complements but does not replace CCD architecture rules, PrimeVue rules, UnoCSS guardrails, UIDesignState, runtime boundaries, or validation gates.

## Evidence paths

- `.ai/skills/design/**`
- `.ai/protocol/AGENTS.core.md`
- `.ai/runtime/owner_decisions.md`
- `.ai/rules/design-system/**`
- `.ai/rules/components/**`
- `packages/unocss-preset/**`
- `packages/vue-ui/**`

## Related pages

- [[ccd-ai-ui-skill-governance]]
- [[ai-governance-control-plane]]
- [[validation-gates]]
- [[design-tokens-role]]
- [[vue-ui-role]]
