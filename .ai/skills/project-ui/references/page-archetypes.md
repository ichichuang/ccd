# Page Archetypes

This internal reference owns page archetypes for future project-ui governance. It is not an
independent Skill and carries no activation metadata.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Scope and Non-Schema Status

This section owns scope and non-schema status for `page-archetypes.md` under the accepted
P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

These archetypes are conceptual topology guidance, not a machine schema. P2.4 does not
create Page Contract Schema, `page.state.ts`, route contract coverage, UIDesignState
replacement, or scaffold integration.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Archetype Selection

This section owns archetype selection for `page-archetypes.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 41 deferred-to-page-contract.

Page Contract-deferred semantic owners:

- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Admin table, form, settings, and CRUD business views must follow
  the A1-toolbar-content archetype. Source: .ai/rules/components/02-pro-components.mdc:76.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Read-heavy detail or inspection pages generated with pnpm
  ai:scaffold:view-route -- --kind detail. Source:
  .ai/rules/components/02-pro-components.mdc:77.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: For approved detail/inspection pages,
  data-archetype="A2-sidebar-inspector" is allowed only when the page's primary task is
  readonly inspection, profile detail, or document review. Source:
  .ai/rules/components/02-pro-components.mdc:97.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: 5.1 — v-auth is Mandatory for All Action Elements. Source:
  .ai/rules/components/02-pro-components.mdc:233.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: pnpm ai:scaffold:view-route -- --segment &lt;segment --title-key
  &lt;i18n.key --kind &lt;table|form|detail. Source:
  .ai/rules/core/10-ai-generation-workflow.mdc:11.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: must not Freehand-creating a new business page, hook, and route
  trio from scratch when the scaffold command can cover the use case. Source:
  .ai/rules/core/10-ai-generation-workflow.mdc:13.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: After creating or editing page/route scaffold output, AI must run
  pnpm ai:guard. Source: .ai/rules/core/10-ai-generation-workflow.mdc:32.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Before handing off substantial scaffold-based changes, AI must run
  pnpm ai:doctor. Source: .ai/rules/core/10-ai-generation-workflow.mdc:33.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Enforces the UIDesignState AI Design Contract for every new page.
  All page-level structural and visual decisions must be anchored to this read-only contract
  before writing any code. Source: .ai/rules/design-system/04-design-state-contract.mdc:2.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: UIDesignState (defined in src/types/design-state.ts) is the
  read-only AI design contract that constrains every structural and visual decision when
  creating a new page. It is not a runtime type — it is a specification language used during
  code generation. Source: .ai/rules/design-system/04-design-state-contract.mdc:11.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: CRITICAL: AI must not extend the archetype enum or add new intent
  values. Any change to this interface requires explicit architect approval. The file header
  states: "AI 不得自行扩展 archetype 或新增 intent.". Source:
  .ai/rules/design-system/04-design-state-contract.mdc:13.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Value | Description | Default archetype. Source:
  .ai/rules/design-system/04-design-state-contract.mdc:32.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Pick the archetype matching the page's primary task. Do NOT mix
  archetypes on a single page. Source:
  .ai/rules/design-system/04-design-state-contract.mdc:54.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Archetype | Macro structure | Primary use case. Source:
  .ai/rules/design-system/04-design-state-contract.mdc:56.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Select archetype — use the intent default mapping above unless
  overridden. Source: .ai/rules/design-system/04-design-state-contract.mdc:152.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: // must not extending archetype enum. Source:
  .ai/rules/design-system/04-design-state-contract.mdc:186.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: // must not using UIDesignState as a Vue component prop type.
  Source: .ai/rules/design-system/04-design-state-contract.mdc:197.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: // must not mixing archetype skeletons on one page. Source:
  .ai/rules/design-system/04-design-state-contract.mdc:200.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Dashboard cards | glass-card only when content remains readable.
  Source: .ai/skills/design/ccd-material-system/SKILL.md:52.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Use this skill before implementing a page, major view, route
  surface, or UI shell. Source: .ai/skills/design/ccd-page-archetypes/SKILL.md:11.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Mandatory pre-design pass. Source:
  .ai/skills/design/ccd-page-archetypes/SKILL.md:13.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Information priority:. Source:
  .ai/skills/design/ccd-page-archetypes/SKILL.md:22.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Use the existing CCD contract values only. Source:
  .ai/skills/design/ccd-page-archetypes/SKILL.md:38.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: do not make every card identical;. Source:
  .ai/skills/design/ccd-page-archetypes/SKILL.md:56.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: use status color only for real status;. Source:
  .ai/skills/design/ccd-page-archetypes/SKILL.md:57.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: avoid fake product metrics;. Source:
  .ai/skills/design/ccd-page-archetypes/SKILL.md:58.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: bento/card grids allowed;. Source:
  .ai/skills/design/ccd-page-archetypes/SKILL.md:77.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: avoid tab hiding unless information is large and separate;. Source:
  .ai/skills/design/ccd-page-archetypes/SKILL.md:78.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Use closest existing contract:. Source:
  .ai/skills/design/ccd-page-archetypes/SKILL.md:84.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: prefer ProForm for multi-field forms;. Source:
  .ai/skills/design/ccd-page-archetypes/SKILL.md:118.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: prefer ProTable;. Source:
  .ai/skills/design/ccd-page-archetypes/SKILL.md:137.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: page must not horizontally overflow. Source:
  .ai/skills/design/ccd-page-archetypes/SKILL.md:142.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: inspector only if it reduces cognitive load;. Source:
  .ai/skills/design/ccd-page-archetypes/SKILL.md:158.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Use PrimeVue and CCD Pro wrappers:. Source:
  .ai/skills/design/ccd-page-archetypes/SKILL.md:163.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Do not use native interactive elements where PrimeVue/Pro
  equivalents exist. Source: .ai/skills/design/ccd-page-archetypes/SKILL.md:172.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Every page must define:. Source:
  .ai/skills/design/ccd-page-archetypes/SKILL.md:176.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Do not rely on luck. Source:
  .ai/skills/design/ccd-page-archetypes/SKILL.md:185.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Reject a page if:. Source:
  .ai/skills/design/ccd-page-archetypes/SKILL.md:189.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: layout only works at one width;. Source:
  .ai/skills/design/ccd-page-archetypes/SKILL.md:192.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Verify UIDesignState mapping. Source:
  .ai/skills/design/ccd-ui-review-gate/SKILL.md:17.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: These skills complement .ai/rules/. They do not override
  architecture, runtime, PrimeVue, UnoCSS, UIDesignState, or governance rules. Source:
  .ai/skills/design/README.md:17.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Single Workspace

This section owns single workspace for `page-archetypes.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Collection Detail

This section owns collection detail for `page-archetypes.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Split Workspace

This section owns split workspace for `page-archetypes.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Dashboard Grid

This section owns dashboard grid for `page-archetypes.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Form Flow

This section owns form flow for `page-archetypes.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Detail Reader

This section owns detail reader for `page-archetypes.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Auth Focus

This section owns auth focus for `page-archetypes.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 9 deferred-to-page-contract.

Page Contract-deferred semantic owners:

- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Do not animate login or static backgrounds by default. Source:
  .ai/skills/design/ccd-gsap-motion/SKILL.md:39.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Does this avoid login/static background motion?. Source:
  .ai/skills/design/ccd-gsap-motion/SKILL.md:54.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Use this skill when designing cards, panels, dialogs, dropdowns,
  overlays, command surfaces, login cards, settings cards, dashboards, and glass-like
  material effects. Source: .ai/skills/design/ccd-material-system/SKILL.md:11.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Not allowed by default for login, settings, data pages, tables, or
  ordinary dashboards. Source: .ai/skills/design/ccd-motion-system/SKILL.md:78.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Login may use Level 1 motion only by default:. Source:
  .ai/skills/design/ccd-motion-system/SKILL.md:82.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Login must not use:. Source:
  .ai/skills/design/ccd-motion-system/SKILL.md:90.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Login is not a shader demo. It should prioritize:. Source:
  .ai/skills/design/ccd-product-language/SKILL.md:150.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: Login-specific gate. Source:
  .ai/skills/design/ccd-ui-review-gate/SKILL.md:70.
- Retain the semantic intent here; operational enforcement belongs to later Page Contract
  Schema and validation: UI, UX, visual, beautiful, premium, Apple-like, Google-like, liquid
  glass, glass, layout, dashboard, settings, login, form, table, dialog, drawer, navigation,
  responsive, dark mode, animation, motion, page shell, design review, polish, gsap,
  GreenSock, timeline animation, ScrollTrigger, animate-lite, AnimateWrapper, route
  transition, animation library, motion library, 交互动效, 高级动效, 时间线动画, 路由动画. Source:
  .ai/skills/design/README.md:24.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Immersive

This section owns immersive for `page-archetypes.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Responsive Transformation Principles

This section owns responsive transformation principles for `page-archetypes.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## State Responsibilities

This section owns state responsibilities for `page-archetypes.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Inappropriate Usage

This section owns inappropriate usage for `page-archetypes.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Page Contract Boundary

This section owns page contract boundary for `page-archetypes.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.
