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

`project-ui` is the singleton canonical CCD project-level UI governance source at `.ai/skills/project-ui`. Routing discovers it by stable Skill ID, and isolated synchronization materializes noncanonical Codex and Claude copies.

## Identity and Purpose

`project-ui` defines classification, references, preflight, precedence, foundations, output, and validation for UI work across CCD product surfaces.

## Terminal Status

P3 Machine UI Policy implementation remains complete at `.ai/governance/policies/ui.json` with 68 canonical rules across 14 semantic-obligation clusters. P4 cold-start remains complete. P5 terminal integration discovers and locks project-ui, routes generic UI work to it, synchronizes it through Codex and Claude contracts, and activates both client adapters. Application-source enforcement remains baseline-only because the source scanner is not implemented.

## P2 And P3 State

The project-ui semantic-quality correction is complete and tracked on main. Machine UI Policy exists at `.ai/governance/policies/ui.json`, and P3 Machine UI Policy implementation is complete. Page Contract Schema does not exist. P4 AI cold-start atomic replacement is complete. P5 terminal lifecycle integration is complete. The current Skill lock discovers project-ui, routing selects it for generic UI work, isolated synchronization covers Codex and Claude, and both adapters are active.

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

- **Machine UI Policy**: P3 implementation complete; application-source enforcement baseline-only because the scanner is not implemented.
- **Page Contract Schema**: does not exist.
- **P4 Cold-Start**: complete for repository AI entrypoints and preserved by P5.
- **P5 Routing and Synchronization**: terminal; see [[project-ui-routing]].
- **Materialized Copies**: Codex and Claude copies are noncanonical projections of `.ai/skills/project-ui`.
- **Legacy Governance**: legacy Skills and rules remain retained.

## Lifecycle State

```text
P3_COMPLETE=yes
MACHINE_UI_POLICY_COMPLETE=yes
MACHINE_UI_POLICY_PRESENT=yes
POLICY_SCHEMAS_PRESENT=yes
PRODUCT_UI_PROFILE_PRESENT=yes
EXCEPTION_REGISTRY_PRESENT=yes
EXCEPTION_COUNT=0
POLICY_FIXTURES_PRESENT=yes
POLICY_VALIDATOR_PRESENT=yes
P4_STARTED=yes
P4_COMPLETE=yes
COLD_START_ATOMIC_REPLACEMENT_COMPLETE=yes
AGENTS_TRACKED=yes
CLAUDE_TRACKED=yes
CLAUDE_ADAPTER_TRACKED=yes
ADAPTER_MANIFEST_COLD_START_COMPLETE=yes
ADAPTER_GENERATION_DETERMINISTIC=yes
AI_SYNC_IDEMPOTENT=yes
FRESH_CLONE_ENTRYPOINTS_PASS=yes
P5_STARTED=yes
P5_COMPLETE=yes
PROJECT_UI_DISCOVERED=yes
PROJECT_UI_ROUTED=yes
PROJECT_UI_SYNCHRONIZED=yes
PROJECT_UI_ADAPTER_ACTIVATED=yes
PROJECT_UI_LOCKED=yes
PROJECT_UI_CODEX_SYNC_CONTRACT_COMPLETE=yes
PROJECT_UI_CLAUDE_SYNC_CONTRACT_COMPLETE=yes
SKILL_ROUTING_MANIFEST_CURRENT=yes
ROUTING_SCOPE_REGISTRY_COMPLETE=yes
SKILLS_LOCK_CURRENT=yes
RULE_INDEX_CURRENT=yes
NODE_PYTHON_ROUTER_PARITY=yes
GENERIC_UI_ROUTES_TO_PROJECT_UI=yes
MOTION_ROUTING_CONDITIONAL=yes
NON_UI_ROUTING_PRESERVED=yes
ADAPTER_PROJECT_UI_MAPPING_COMPLETE=yes
CODEX_ADAPTER_PROJECT_UI_ACTIVE=yes
CLAUDE_ADAPTER_PROJECT_UI_ACTIVE=yes
SOURCE_SCANNER_IMPLEMENTED=no
PAGE_CONTRACT_CREATED=no
LEGACY_SKILLS_RETIRED=no
LEGACY_RULES_RETIRED=no
```
