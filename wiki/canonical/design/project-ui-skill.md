---
title_en: Project UI Skill
title_zh: 项目 UI 技能
aliases:
  - Project UI Skill
  - project-ui
  - CCD Project UI Skill
tags:
  - design
  - ui
  - governance
  - project-ui
tags_zh:
  - 设计
  - UI
  - 治理
  - 项目 UI
status: published
confidence: 0.95
source_langs:
  - en
  - zh
source_paths:
  - .ai/governance/ui/project-ui-semantic-coverage.json
  - .ai/governance/ui/migration-manifest.json
  - .ai/skills/project-ui/**
  - wiki/canonical/design/ui-governance-migration-plan.md
last_reviewed: '2026-07-12'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Project UI Skill

## Executive decision

project-ui now exists as a canonical source. It is the local P2 change-set source for future CCD project-level UI governance, semantic coverage, conflict decisions, and transitional integration limits.

project-ui is not yet discovered by the current Skill lock. project-ui is not yet routed. project-ui is not synchronized by the current Codex Skill sync. project-ui is not synchronized for Claude. The P2 source currently exists in the local P2 change set pending later validation, commit, push, and independent remote verification; it must not be described as already present on GitHub remote main.

## P1 accepted baseline

P1 accepted remote baseline is `1c4ce258bb7868f018ff5e1c0a63ef568b53be8e`, with source inventory baseline `9fad207b1700615000517a0c5fee1af9661d00f8`. The accepted P1 migration plan remains [[ui-governance-migration-plan]].

The protected P1 canonical hashes verified before P2.5 were `.ai/governance/ui/migration-manifest.json` = `6b90c8bd04a89a9c1b893660078eba7ef4cd798c0e39b9a19f26ececb7e3eeaa` and `wiki/canonical/design/ui-governance-migration-plan.md` = `af1cde6274deb6944c67b4742fb7117536d8ba9633011e93c9ef5a7392f37e11`.

## P2 scope

P2.1 established the baseline. P2.2 extracted and corrected source requirements. P2.3 resolved semantic information architecture. P2.4 created the local project-ui source files. P2.5 creates the permanent semantic coverage artifact, this canonical Wiki page, and the required design-index registration only.

P3 has not started. P4 has not started. P5 has not started.

## Project UI Skill identity

The Skill identity is `project-ui` version `1.0.0`. The public source entrypoint is [`.ai/skills/project-ui/SKILL.md`](../../../.ai/skills/project-ui/SKILL.md). The ten reference files are internal topic owners and not separate Skills.

Only `SKILL.md` is a public Skill entrypoint. The reference files are internal topic owners and not separate Skills.

## Platform invariants versus Product UI Profile

project-ui separates permanent platform invariants from replaceable CCD product-language choices. Platform invariants belong in `platform-invariants.md`, `layout-scroll.md`, `tokens-unocss.md`, `component-priority.md`, `interaction-motion.md`, `accessibility.md`, and `validation.md`. CCD Architectural Glass product decisions belong in `product-language.md` and `product-ui-profile.md`.

Related canonical design pages remain [[ccd-product-design-language]], [[ccd-ai-ui-skill-governance]], and [[animation-governance]].

## Target directory structure

Exactly eleven project-ui source files are represented:

- `.ai/skills/project-ui/SKILL.md`
- `.ai/skills/project-ui/references/platform-invariants.md`
- `.ai/skills/project-ui/references/product-language.md`
- `.ai/skills/project-ui/references/product-ui-profile.md`
- `.ai/skills/project-ui/references/layout-scroll.md`
- `.ai/skills/project-ui/references/page-archetypes.md`
- `.ai/skills/project-ui/references/tokens-unocss.md`
- `.ai/skills/project-ui/references/component-priority.md`
- `.ai/skills/project-ui/references/interaction-motion.md`
- `.ai/skills/project-ui/references/accessibility.md`
- `.ai/skills/project-ui/references/validation.md`

No extra permanent project-ui source file is authorized by P2.5.

## Reference ownership map

| Owner file                                                | Role                           | Mapped requirements | Headings |
| --------------------------------------------------------- | ------------------------------ | ------------------: | -------: |
| `.ai/skills/project-ui/SKILL.md`                          | Public Skill entrypoint        |                   7 |       21 |
| `.ai/skills/project-ui/references/platform-invariants.md` | Internal topic owner reference |                  19 |       14 |
| `.ai/skills/project-ui/references/product-language.md`    | Internal topic owner reference |                  21 |       13 |
| `.ai/skills/project-ui/references/product-ui-profile.md`  | Internal topic owner reference |                  32 |       17 |
| `.ai/skills/project-ui/references/layout-scroll.md`       | Internal topic owner reference |                  33 |       16 |
| `.ai/skills/project-ui/references/page-archetypes.md`     | Internal topic owner reference |                  50 |       15 |
| `.ai/skills/project-ui/references/tokens-unocss.md`       | Internal topic owner reference |                 152 |       18 |
| `.ai/skills/project-ui/references/component-priority.md`  | Internal topic owner reference |                 145 |       21 |
| `.ai/skills/project-ui/references/interaction-motion.md`  | Internal topic owner reference |                  77 |       18 |
| `.ai/skills/project-ui/references/accessibility.md`       | Internal topic owner reference |                  11 |       19 |
| `.ai/skills/project-ui/references/validation.md`          | Internal topic owner reference |                  66 |       20 |

## Semantic source coverage

The permanent semantic coverage artifact is [`.ai/governance/ui/project-ui-semantic-coverage.json`](../../../.ai/governance/ui/project-ui-semantic-coverage.json).

Quantitative evidence:

- 22 source assets
- 613 corrected unique requirements
- 527 covered requirements
- 16 deferred-to-p3 requirements
- 50 deferred-to-page-contract requirements
- 7 deferred-to-p5 requirements
- 13 implementation-evidence requirements
- 0 unmapped requirements
- 0 invalid target headings
- 0 silent drops
- 11 target files
- 1 public entrypoint
- 10 internal references
- 6 semantic conflict resolutions
- 9 reused foundations

## Conflict resolution decisions

Semantic decisions exist for CONF-01, CONF-05, CONF-06, CONF-10, CONF-11, and CONF-12. No conflict decision is operationally enforced in P2.5.

| Conflict | Target owner                                              | Target heading                | Later phase dependency                             | Status                                              |
| -------- | --------------------------------------------------------- | ----------------------------- | -------------------------------------------------- | --------------------------------------------------- |
| CONF-01  | `.ai/skills/project-ui/SKILL.md`                          | Reference Loading Matrix      | P5 routing and synchronization integration         | semantic-resolution-only-not-operationally-enforced |
| CONF-05  | `.ai/skills/project-ui/references/platform-invariants.md` | Scope                         | P2.4 source creation and P2.5 coverage publication | semantic-resolution-only-not-operationally-enforced |
| CONF-06  | `.ai/skills/project-ui/references/interaction-motion.md`  | Conditional Motion Loading    | P5 operational conditional routing                 | semantic-resolution-only-not-operationally-enforced |
| CONF-10  | `.ai/skills/project-ui/references/interaction-motion.md`  | Ambient and Background Motion | Representative page migration                      | semantic-resolution-only-not-operationally-enforced |
| CONF-11  | `.ai/skills/project-ui/references/page-archetypes.md`     | Scope and Non-Schema Status   | Page Contract Schema implementation                | semantic-resolution-only-not-operationally-enforced |
| CONF-12  | `.ai/skills/project-ui/references/accessibility.md`       | Reduced Motion                | Machine UI Policy implementation                   | semantic-resolution-only-not-operationally-enforced |

## Existing platform foundation reuse

project-ui records reuse obligations for nine tracked foundations. It does not replace them.

| Foundation                                       | Current role                     | Target owner                                              | Target heading                |
| ------------------------------------------------ | -------------------------------- | --------------------------------------------------------- | ----------------------------- |
| `packages/design-tokens/src/theme-engine`        | Theme engine                     | `.ai/skills/project-ui/references/tokens-unocss.md`       | Theme Engine                  |
| `packages/design-tokens/src/size.ts`             | Size and density system          | `.ai/skills/project-ui/references/tokens-unocss.md`       | Size and Density System       |
| `packages/design-tokens/src/breakpoints.ts`      | Breakpoint definitions           | `.ai/skills/project-ui/references/tokens-unocss.md`       | Breakpoint System             |
| `packages/unocss-preset/src/index.ts`            | UnoCSS semantic shortcuts        | `.ai/skills/project-ui/references/tokens-unocss.md`       | UnoCSS Semantic Shortcuts     |
| `packages/vue-app-platform/src/layoutRuntime.ts` | Layout runtime evidence          | `.ai/skills/project-ui/references/layout-scroll.md`       | Current AppContainer Evidence |
| `packages/vue-ui/src/CScrollbar`                 | Explicit scroll primitive        | `.ai/skills/project-ui/references/layout-scroll.md`       | Explicit Scroll Owners        |
| `packages/vue-ui/src/AnimateWrapper`             | Lightweight transition primitive | `.ai/skills/project-ui/references/interaction-motion.md`  | Animate-Lite Eligibility      |
| `packages/vue-primevue-adapter/src/index.ts`     | PrimeVue adapter boundary        | `.ai/skills/project-ui/references/component-priority.md`  | Vue PrimeVue Adapter          |
| `packages/vue-hooks/src/index.ts`                | Shared hook foundation           | `.ai/skills/project-ui/references/platform-invariants.md` | Existing Foundation Reuse     |

## Transitional coexistence with legacy Skills

legacy design Skills remain unchanged. legacy UI rules remain unchanged. no legacy authority has been retired. no MERGE or REWRITE decision has been operationally executed.

## Discovery, routing, and sync limitation

project-ui is not yet discovered by the current Skill lock. project-ui is not yet routed. project-ui is not synchronized by the current Codex Skill sync. project-ui is not synchronized for Claude.

## P3 boundary

Machine UI Policy does not exist. P3 owns future machine-policy construction from the semantic coverage artifact. P3 has not started.

## Page Contract boundary

Page Contract Schema does not exist. Conceptual page archetype semantics in project-ui are not a machine-readable Page Contract Schema.

## P4 cold-start boundary

tracked AGENTS and CLAUDE cold-start replacement has not been executed. P4 owns that future boundary if separately authorized.

## P5 routing boundary

Skill routing has not been rewritten. Conditional motion loading and project-ui loading are semantic decisions only until P5 updates discovery, routing, and synchronization.

## Validation evidence

P2.5 derives from accepted P2.3 artifacts, accepted P2.4 implementation traceability, and the current local P2.4 source file hashes. P2.4 validator status was PASS with 613 mapped requirements, 0 unmapped requirements, 0 invalid heading mappings, and 0 silent drops.

P2.5 validation checks the semantic coverage artifact, Wiki frontmatter and links, design-index registration, protected paths, and final repository state.

## P2 non-goals

P2 does not activate project-ui; modify Skill discovery; update Skill routing; update Codex or Claude sync; rewrite adapters; modify cold-start files; create Machine UI Policy; create Page Contract Schema; change AppContainer; change runtime UI; change packages; execute legacy MERGE or REWRITE decisions; or retire legacy Skills or rules.

## P3 handoff

P3 may consume the semantic decisions in `project-ui-semantic-coverage.json` to build Machine UI Policy. Page Contract work may consume page archetype semantics only after a schema is created. P4 owns cold-start replacement. P5 owns discovery, routing, and synchronization. No later phase has started.
