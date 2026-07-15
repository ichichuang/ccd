---
title_en: Project UI Skill
title_zh: 项目 UI Skill
aliases:
  - project-ui-skill
  - Project UI
tags:
  - design
  - ui
  - governance
tags_zh:
  - 设计
  - UI
  - 治理
status: published
confidence: 0.95
source_langs:
  - en
source_paths:
  - .ai/skills/project-ui/SKILL.md
  - .ai/skills/project-ui/references/**
  - .ai/governance/policies/ui.json
last_reviewed: '2026-07-15'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Project UI Skill

`project-ui` is the canonical CCD project-level UI governance source. It can be loaded manually by a new session to classify UI work, select references, preserve boundaries, reuse foundations, and validate output.

## Identity and Purpose

`project-ui` defines classification, references, preflight, precedence, foundations, output, and validation for UI work across CCD product surfaces.

## Transitional Status

The P3 Machine UI Policy has been created at `.ai/governance/policies/ui.json` with 68 canonical rules across 14 semantic-obligation clusters. The policy validator is `node .ai/governance/ui/scripts/validate-ui-policy.mjs`. The source scanner is not yet implemented, and `project-ui` remains undiscovered by the current Skill lock, unrouted, and unsynchronized.

## P2 And P3 State

The project-ui semantic-quality correction is complete and tracked on main. Machine UI Policy exists at `.ai/governance/policies/ui.json` and the P3 Machine UI Policy baseline is created. Page Contract Schema does not exist. P4 has not started. P5 has not started. project-ui remains undiscovered by the current Skill lock, unrouted, unsynchronized, and not adapter-activated.

## Handoff

P2 project-ui source construction and semantic correction are complete. Semantic correction commit: `b3b6d59b6b29a15cce518d7cd35f025da0665cde`.

## Scope

- UI planning, page and route composition
- Layout and scrolling ownership
- Component selection and ownership
- Tokens and UnoCSS
- Theme and Product UI Profile
- Interaction and motion
- Accessibility
- Human validation and UI review
- UI-only refactoring

## Non-Goals

`project-ui` does not authorize business logic, API, authentication, HTTP, synchronization, storage, security, architecture-boundary, dependency, package-boundary, routing-manifest, Skill discovery, sync, runtime foundation replacement, Machine UI Policy creation, Page Contract Schema creation, legacy Skill retirement, or legacy rule retirement.

## Authority and Precedence

System instructions, repository protocol, and `.ai/rules/**` remain higher authority. Permanent platform invariants override replaceable product profile choices; accessibility, token ownership, component boundaries, layout ownership, and runtime behavior preservation cannot be weakened by visual preference.

## Internal References

Load `.ai/skills/project-ui/references/platform-invariants.md` first. Add other references by task class:

- `visual-expression` → product-language.md, product-ui-profile.md
- `layout-scroll` → layout-scroll.md
- `page-structure` → page-archetypes.md
- `token-style` → tokens-unocss.md
- `component-interaction` → component-priority.md
- `motion` → interaction-motion.md
- `accessibility` → accessibility.md
- `validation-review` → validation.md

## Validation

Run the semantic-quality validator:

```bash
node .ai/skills/project-ui/scripts/validate-semantic-quality.mjs
```

Run the P3 Machine UI Policy validator:

```bash
node .ai/governance/ui/scripts/validate-ui-policy.mjs
```

Do not claim source-scanning enforcement; the scanner is not yet implemented.

## Boundaries

- **Machine UI Policy**: baseline created, scanner not implemented.
- **Page Contract Schema**: does not exist.
- **P4 Cold-Start**: not started.
- **P5 Routing and Synchronization**: not started.
