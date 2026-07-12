---
name: project-ui
description: Future canonical CCD project-level UI Skill source that governs CCD UI planning, implementation, review, and validation after future routing integration.
version: 1.0.0
---

# CCD Project UI

This entrypoint is the future canonical CCD project-level UI governance source. It routes
future UI planning, implementation, review, and validation to the internal references after
later discovery integration.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

## Identity and Purpose

This section owns identity and purpose for `SKILL.md` under the accepted P2.3 heading
registry.

The `project-ui` Skill governs CCD UI planning, implementation, review, and validation after
future routing integration. It is source-only in P2.4 and does not alter active Skill
discovery.

The public entrypoint is this `SKILL.md`; the ten files under `references/` are internal
authorities, not routable Skills.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

## Transitional Status

This section owns transitional status for `SKILL.md` under the accepted P2.3 heading
registry.

`PROJECT_UI_SOURCE_CREATED`.

`PROJECT_UI_NOT_YET_DISCOVERED_BY_SKILL_LOCK`.

`PROJECT_UI_NOT_YET_ROUTED`.

`PROJECT_UI_NOT_YET_SYNCED`.

`LEGACY_UI_SKILLS_UNCHANGED`.

`LEGACY_UI_RULES_UNCHANGED`.

`MACHINE_UI_POLICY_NOT_CREATED`.

`PAGE_CONTRACT_NOT_CREATED`.

`P3_NOT_STARTED`.

`P4_NOT_STARTED`.

`P5_NOT_STARTED`.

Machine UI Policy is absent. Page Contract Schema is absent.

Legacy design Skills remain active under the current system. Legacy UI rules remain active.
P2 source creation does not execute routing migration, cold-start replacement, adapter
rewrite, Skill discovery change, or legacy authority retirement.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

## Future Activation Intent

This section owns future activation intent for `SKILL.md` under the accepted P2.3 heading
registry.

Future P5 work may route UI tasks to this Skill. Until then, no current routing, Skill lock,
Codex sync, Claude sync, adapter, or cold-start surface loads it.

The Skill must not be described as active, currently loaded, synchronized, or replacing
legacy design Skills before P5 completes that integration.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

## Scope

This section owns scope for `SKILL.md` under the accepted P2.3 heading registry.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

## Non-Goals

This section owns non-goals for `SKILL.md` under the accepted P2.3 heading registry.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

## Authority and Precedence

This section owns authority and precedence for `SKILL.md` under the accepted P2.3 heading
registry.

Use this exact precedence order:

1. Explicit user requirements

2. Security and runtime boundaries

3. Repository architecture laws

4. Project UI platform invariants

5. Active Product UI Profile

6. Page Contract when introduced by a later phase

7. Shared component contracts

8. Existing implementation patterns

9. External design inspiration

Explicit user requirements do not authorize security or runtime violations.

Existing implementation patterns cannot override platform invariants.

Product UI Profile decisions cannot override platform invariants.

A future Page Contract cannot violate higher-precedence boundaries.

External inspiration cannot override architecture, tokens, accessibility, component
boundaries, or the active Product UI Profile.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

## Required Preflight

This section owns required preflight for `SKILL.md` under the accepted P2.3 heading
registry.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

## Task Classification

This section owns task classification for `SKILL.md` under the accepted P2.3 heading
registry.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

## Reference Loading Matrix

This section owns reference loading matrix for `SKILL.md` under the accepted P2.3 heading
registry.

Always load [platform-invariants.md](references/platform-invariants.md) and
[validation.md](references/validation.md).

Load [product-language.md](references/product-language.md) for product expression,
hierarchy, terminology, tone, composition, or visual direction.

Load [product-ui-profile.md](references/product-ui-profile.md) for CCD-specific style,
materials, density, brand expression, theme appearance, or Architectural Glass.

Load [layout-scroll.md](references/layout-scroll.md) for layout, shells, viewport sizing,
panels, regions, scrolling, fullscreen, split views, drawers, overlays, or responsive
composition.

Load [page-archetypes.md](references/page-archetypes.md) when creating or materially
restructuring a route, page, workspace, dashboard, form flow, detail view, auth view, or
immersive surface.

Load [tokens-unocss.md](references/tokens-unocss.md) for styling, classes, spacing, color,
typography, sizes, breakpoints, radius, elevation, z-index, or responsive utilities.

Load [component-priority.md](references/component-priority.md) for controls, forms, tables,
tree tables, charts, dialogs, drawers, navigation, feedback, or interactive primitives.

Load [interaction-motion.md](references/interaction-motion.md) only when changing
interaction feedback, transitions, animation, gestures, GSAP, animate-lite, route
transitions, or motion behavior.

Load [accessibility.md](references/accessibility.md) whenever changing an interactive
element, keyboard flow, focus behavior, overlay, state communication, form, table, motion,
or responsive structure.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

## Platform Invariants and Product UI Profile

This section owns platform invariants and product ui profile for `SKILL.md` under the
accepted P2.3 heading registry.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

## Existing Foundation Reuse

This section owns existing foundation reuse for `SKILL.md` under the accepted P2.3 heading
registry.

Existing foundation reuse must preserve these current repository dependencies without
duplicating runtime logic:

- `packages/design-tokens/src/theme-engine`: current implementation evidence and platform
  dependency; reuse it, do not create a replacement for its responsibility.

- `packages/design-tokens/src/size.ts`: current implementation evidence and platform
  dependency; reuse it, do not create a replacement for its responsibility.

- `packages/design-tokens/src/breakpoints.ts`: current implementation evidence and platform
  dependency; reuse it, do not create a replacement for its responsibility.

- `packages/unocss-preset/src/index.ts`: current implementation evidence and platform
  dependency; reuse it, do not create a replacement for its responsibility.

- `packages/vue-app-platform/src/layoutRuntime.ts`: current implementation evidence and
  platform dependency; reuse it, do not create a replacement for its responsibility.

- `packages/vue-ui/src/CScrollbar`: current implementation evidence and platform dependency;
  reuse it, do not create a replacement for its responsibility.

- `packages/vue-ui/src/AnimateWrapper`: current implementation evidence and platform
  dependency; reuse it, do not create a replacement for its responsibility.

- `packages/vue-primevue-adapter/src/index.ts`: current implementation evidence and platform
  dependency; reuse it, do not create a replacement for its responsibility.

- `packages/vue-hooks/src/index.ts`: current implementation evidence and platform
  dependency; reuse it, do not create a replacement for its responsibility.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

## Mandatory UI Work Output Contract

This section owns mandatory ui work output contract for `SKILL.md` under the accepted P2.3
heading registry.

Future governed UI work must report `task classification`.

Future governed UI work must report `loaded project-ui references`.

Future governed UI work must report `applicable precedence decisions`.

Future governed UI work must report `existing foundation reuse`.

Future governed UI work must report `selected page archetype when applicable`.

Future governed UI work must report `component ownership decisions`.

Future governed UI work must report `token and UnoCSS decisions`.

Future governed UI work must report `layout-region ownership`.

Future governed UI work must report `scroll ownership`.

Future governed UI work must report `state matrix`.

Future governed UI work must report `interaction and motion decision`.

Future governed UI work must report `accessibility decision`.

Future governed UI work must report `responsive behavior`.

Future governed UI work must report `light and dark behavior`.

Future governed UI work must report `runtime behavior preservation`.

Future governed UI work must report `validation performed`.

Future governed UI work must report `changed paths`.

Future governed UI work must report `residual risks`.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

## Required Validation Sequence

This section owns required validation sequence for `SKILL.md` under the accepted P2.3
heading registry.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

## Conditional Motion Loading

This section owns conditional motion loading for `SKILL.md` under the accepted P2.3 heading
registry.

GSAP is not loaded by default.

animate-lite is not loaded by default.

both motion systems are not loaded together by default.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

## Future Integration Boundaries

This section owns future integration boundaries for `SKILL.md` under the accepted P2.3
heading registry.

P3 owns Machine UI Policy and registered exception enforcement.

The Page Contract phase owns schema, page-state, route coverage, scaffold integration, and
Page Contract validation.

P4 owns representative migration only when separately instructed.

P5 owns discovery, routing, adapters, synchronization, and cold-start replacement.

Accepted conflict decisions are semantic only and use
`semantic-resolution-only-not-operationally-enforced`:

- CONF-01: Future project-ui semantics include page-archetype availability through SKILL.md
  task classification and the page-archetypes internal reference; operational route
  integration remains P5-owned.

- CONF-05: Permanent platform invariants live in platform-invariants.md; CCD Architectural
  Glass lives in product-ui-profile.md as replaceable profile semantics.

- CONF-06: Generic UI work loads neither GSAP nor animate-lite by default; GSAP is eligible
  only for complex timelines, animate-lite only for lightweight route/class/state
  transitions, and both are not loaded together by default.

- CONF-10: Future canonical semantics keep login and static-background animation
  non-default; existing implementation remains evidence for representative page migration
  and is not changed by P2.3.

- CONF-11: Project-ui owns conceptual page archetype guidance only; machine Page Contract
  Schema remains separate later-phase work.

- CONF-12: Project-ui records accessibility and reduced-motion obligations as semantic
  governance; machine enforcement remains explicitly not present.

Accepted P2.3 semantic coverage for this heading: 7 deferred-to-p5.

P5-deferred semantic owners:

- Retain the semantic intent here; operational enforcement belongs to P5 discovery, routing,
  adapter, and synchronization integration: PrimeVue Adapter Boundary Exception. Source:
  .ai/rules/design-system/05-semantic-color-usage-contract.mdc:40.
- Retain the semantic intent here; operational enforcement belongs to P5 discovery, routing,
  adapter, and synchronization integration: Outside this adapter boundary, do not introduce
  warning as semantic family. Source:
  .ai/rules/design-system/05-semantic-color-usage-contract.mdc:44.
- Retain the semantic intent here; operational enforcement belongs to P5 discovery, routing,
  adapter, and synchronization integration: [ ] Any PrimeVue warning usage is limited to
  adapter boundary mapping only. Source:
  .ai/rules/design-system/05-semantic-color-usage-contract.mdc:76.
- Retain the semantic intent here; operational enforcement belongs to P5 discovery, routing,
  adapter, and synchronization integration: Import GSAP only through the app-local adapter
  at apps/web-demo/src/plugins/animation. Source:
  .ai/skills/design/ccd-gsap-motion/SKILL.md:27.
- Retain the semantic intent here; operational enforcement belongs to P5 discovery, routing,
  adapter, and synchronization integration: ccd-animate-lite when animate-lite,
  AnimateWrapper, route transition, or page enter/leave class animation is involved. Source:
  .ai/skills/design/README.md:14.
- Retain the semantic intent here; operational enforcement belongs to P5 discovery, routing,
  adapter, and synchronization integration: ccd-ui-review-gate. Source:
  .ai/skills/design/README.md:15.
- Retain the semantic intent here; operational enforcement belongs to P5 discovery, routing,
  adapter, and synchronization integration: Beauty cannot break governance. Source:
  .ai/skills/design/README.md:29.

### P3 Machine UI Policy Boundary

This section owns p3 machine ui policy boundary for `SKILL.md` under the accepted P2.3
heading registry.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

### Page Contract Boundary

This section owns page contract boundary for `SKILL.md` under the accepted P2.3 heading
registry.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

### P4 Cold-Start Boundary

This section owns p4 cold-start boundary for `SKILL.md` under the accepted P2.3 heading
registry.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

### P5 Routing and Synchronization Boundary

This section owns p5 routing and synchronization boundary for `SKILL.md` under the accepted
P2.3 heading registry.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

## Internal Reference Authority

This section owns internal reference authority for `SKILL.md` under the accepted P2.3
heading registry.

Existing foundation reuse must preserve these current repository dependencies without
duplicating runtime logic:

- `packages/design-tokens/src/theme-engine`: current implementation evidence and platform
  dependency; reuse it, do not create a replacement for its responsibility.

- `packages/design-tokens/src/size.ts`: current implementation evidence and platform
  dependency; reuse it, do not create a replacement for its responsibility.

- `packages/design-tokens/src/breakpoints.ts`: current implementation evidence and platform
  dependency; reuse it, do not create a replacement for its responsibility.

- `packages/unocss-preset/src/index.ts`: current implementation evidence and platform
  dependency; reuse it, do not create a replacement for its responsibility.

- `packages/vue-app-platform/src/layoutRuntime.ts`: current implementation evidence and
  platform dependency; reuse it, do not create a replacement for its responsibility.

- `packages/vue-ui/src/CScrollbar`: current implementation evidence and platform dependency;
  reuse it, do not create a replacement for its responsibility.

- `packages/vue-ui/src/AnimateWrapper`: current implementation evidence and platform
  dependency; reuse it, do not create a replacement for its responsibility.

- `packages/vue-primevue-adapter/src/index.ts`: current implementation evidence and platform
  dependency; reuse it, do not create a replacement for its responsibility.

- `packages/vue-hooks/src/index.ts`: current implementation evidence and platform
  dependency; reuse it, do not create a replacement for its responsibility.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.
