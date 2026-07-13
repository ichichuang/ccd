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

## Executive Decision

project-ui is the canonical CCD project-level UI governance source. The initial project-ui source was introduced on main by commit `624948ea9058507f8fae91975dabc715d984703a`.

The P2C semantic-quality correction re-extracts the fixed 22-source MERGE set, removes non-normative fragments, rewrites the eleven governance Markdown files as independently usable guidance, and adds a deterministic semantic-quality gate.

## Current Integration State

project-ui remains undiscovered by the current Skill lock. project-ui remains unrouted. project-ui remains unsynchronized by the current Codex Skill sync and Claude adapter flow. project-ui is not adapter-activated. Legacy design Skills remain unchanged. Legacy UI rules remain unchanged. Machine UI Policy does not exist. Page Contract Schema does not exist. P3 has not started and requires separate authorization. P4 has not started. P5 has not started.

## Corrected Accounting

P2C.2R3 uses P2C.1 and P2C.2 JSON artifacts as authority, not the invalid 613-mapping model or the blocked P2C.2R1/P2C.2R2 mutations. The exhaustive closed-class scan retired 24 standalone non-propositional markers without reusing requirement IDs or losing valid semantic propositions.

The corrected values are 22 source assets, 399 candidate fragments, 360 accepted normative occurrences, 345 corrected unique requirements, 15 duplicate normative occurrences, 39 rejected candidate occurrences, and 2,124 excluded non-candidate fragments. Coverage decisions are 331 covered, 5 invalid for current monorepo, 4 deferred to page contract, 4 implementation evidence, and 1 deferred to P5.

The accounting equations are: 2,523 audited fragments = 399 candidate fragments + 2,124 excluded non-candidate fragments; 399 candidate fragments = 360 accepted normative occurrences + 39 rejected candidate occurrences; 360 accepted normative occurrences = 345 corrected unique requirements + 15 duplicate normative occurrences.

Retired marker IDs are `P2C-REQ-0035`, `P2C-REQ-0055`, `P2C-REQ-0133`, `P2C-REQ-0180`, `P2C-REQ-0203`, `P2C-REQ-0217`, `P2C-REQ-0252`, `P2C-REQ-0280`, `P2C-REQ-0282`, `P2C-REQ-0302`, `P2C-REQ-0303`, `P2C-REQ-0313`, `P2C-REQ-0319`, `P2C-REQ-0324`, `P2C-REQ-0339`, `P2C-REQ-0341`, `P2C-REQ-0344`, `P2C-REQ-0345`, `P2C-REQ-0353`, `P2C-REQ-0355`, `P2C-REQ-0356`, `P2C-REQ-0359`, `P2C-REQ-0360`, and `P2C-REQ-0363`.

## Source Rewrite

The public entrypoint remains [`.ai/skills/project-ui/SKILL.md`](../../../.ai/skills/project-ui/SKILL.md). The ten internal references remain under [`.ai/skills/project-ui/references/`](../../../.ai/skills/project-ui/references/). The correction removes placeholder prose, heading-registry narration, malformed modal constructions, duplicated invalid rules, and active obsolete single-root path assumptions.

The final project-ui source shape is one public Skill entrypoint, ten internal reference Markdown files, and one non-routable semantic-quality support script.

## Obsolete Path Resolution

Active current-governance rules no longer use obsolete single-root paths. Current monorepo examples use `apps/*/src/views/**`, `apps/*/src/router/**`, `packages/vue-ui/**`, `packages/vue-primevue-adapter/**`, `packages/vue-primevue-adapter/src/theme/presetComponents/**`, and `packages/design-tokens/**` when path evidence is material. Historical or invalid-path evidence may remain only inside the semantic coverage artifact with explicit classification.

## Conflict Resolution

P2C resolves four semantic-quality conflicts. `P2C-CONF-UNIT-01` replaces raw unit priority with token, resolver, breakpoint, semantic variable, and structural grammar ownership. `P2C-CONF-MONOREPO-PATH-01` replaces old single-root path rules with current app and package ownership. `P2C-CONF-MOTION-01` keeps GSAP and animate-lite conditional with local ownership, cleanup, and reduced-motion handling. `P2C-CONF-ENFORCEMENT-01` keeps current governance human-readable and rejects any claim that P2 validation is P3 machine enforcement.

## Semantic Quality Gate

The support script is [`.ai/skills/project-ui/scripts/validate-semantic-quality.mjs`](../../../.ai/skills/project-ui/scripts/validate-semantic-quality.mjs). It is a plain Node.js ESM, read-only validator with no new dependency. Run `node .ai/skills/project-ui/scripts/validate-semantic-quality.mjs`; optional JSON output uses `--json-output`. It validates structure, section quality, placeholder rejection, broken-language rejection, obsolete-path rejection, closed-class marker retirement, false-positive complete-proposition protection, retired-marker consistency, source-level accounting, exact foundation reconciliation, canonical-state wording, and coverage-summary consistency.

## Foundation Reconciliation

All nine original foundation paths are represented exactly and separately: `packages/design-tokens/src/theme-engine`, `packages/design-tokens/src/size.ts`, `packages/design-tokens/src/breakpoints.ts`, `packages/unocss-preset/src/index.ts`, `packages/vue-app-platform/src/layoutRuntime.ts`, `packages/vue-ui/src/CScrollbar`, `packages/vue-ui/src/AnimateWrapper`, `packages/vue-primevue-adapter/src/index.ts`, and `packages/vue-hooks/src/index.ts`.

`packages/vue-app-platform/src/layoutRuntime.ts` remains a governed reuse boundary for application layout-runtime behavior. P2C.2R3 does not modify AppContainer or route scrolling; later layout migration remains separately governed.

## P2 And P3 State

The project-ui semantic-quality correction is complete and tracked on main.

project-ui remains undiscovered by the current Skill lock, unrouted, unsynchronized, and not adapter-activated.

Legacy design Skills and legacy UI rules remain unchanged.

Machine UI Policy does not exist. Page Contract Schema does not exist.

P3 has not started and requires separate authorization. P4 has not started. P5 has not started.

## Corrected P3 Handoff Model

The canonical P2-to-P3 handoff unit is 14 semantic-obligation clusters referencing 68 current active P2 requirements. The historical count of 16 records historical deferred-to-P3 marker dispositions only; it is lineage evidence and does not define 16 current active requirements or require one-to-one parity with the current clusters.

The handoff separately records 12 P3 plan-owned contracts for the Machine UI Policy document and schema, Product UI Profile schema and CCD profile, UI exception schema and empty registry, schema fixtures, rule cases, policy validator, validator self-tests, canonical Wiki documentation, and lifecycle integration. These contracts create no new UI semantics and derive implementation authority from the P3 controller while depending on accepted P2 semantics where applicable.

There are zero unresolved P2 semantic gaps and zero unresolved blocking handoff items. The corrected handoff is ready for P3 baseline revalidation, but it does not start P3: Machine UI Policy remains absent, Page Contract Schema remains absent, P3 remains not started, and P4 and P5 remain not started. project-ui remains undiscovered, unrouted, unsynchronized, and not adapter-activated.

## Files

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
- `.ai/skills/project-ui/scripts/validate-semantic-quality.mjs`
- `.ai/governance/ui/project-ui-semantic-coverage.json`

## Handoff

The semantic source correction was introduced by commit `b3b6d59b6b29a15cce518d7cd35f025da0665cde`.

The corrected source contains one public entrypoint, ten internal references, one semantic-quality support script, 345 active requirements, 24 retired non-propositional markers, 39 rejected candidates, 15 duplicate occurrences, 2,124 excluded fragments, 22 source assets, and nine exact foundation records.

P2 project-ui source construction and semantic correction are complete.

Discovery, routing, synchronization, adapter activation, Machine UI Policy, Page Contract Schema, P3, P4, and P5 remain outside this completed P2 source phase.
