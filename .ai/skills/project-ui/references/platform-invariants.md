# Platform UI Invariants

This internal reference owns platform ui invariants for future project-ui governance. It is
not an independent Skill and carries no activation metadata.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Scope

This section owns scope for `platform-invariants.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 19 covered.

Governance rules:

- must When creating a new page + route pair, AI must run:. Source:
  .ai/rules/core/10-ai-generation-workflow.mdc:10.
- must Start from generated skeletons, then refine them. Source:
  .ai/rules/core/10-ai-generation-workflow.mdc:12.
- must not Adding new static business routes directly in src/router/index.ts. Source:
  .ai/rules/core/10-ai-generation-workflow.mdc:20.
- must not Putting business request flow, DTO contracts, or store definitions directly in
  src/views/. Source: .ai/rules/core/10-ai-generation-workflow.mdc:21.
- 3. Route Contract for Generated Surfaces. Source:
     .ai/rules/core/10-ai-generation-workflow.mdc:23.
- must Every new static route must define path, name, and meta. Source:
  .ai/rules/core/10-ai-generation-workflow.mdc:25.
- must meta must include titleKey or title. Source:
  .ai/rules/core/10-ai-generation-workflow.mdc:26.
- must View components in routes must resolve through () = import('...'). Source:
  .ai/rules/core/10-ai-generation-workflow.mdc:27.
- must not Synchronous @/views/ imports in route modules. Source:
  .ai/rules/core/10-ai-generation-workflow.mdc:28.
- If pnpm ai:guard fails, AI must treat the result as a hard stop and fix the violations
  before proceeding. Source: .ai/rules/core/10-ai-generation-workflow.mdc:34.
- must not Directly hand-editing AGENTS.md or CLAUDE.md to introduce workflow changes.
  Source: .ai/rules/core/10-ai-generation-workflow.mdc:39.
- // src/types/design-state.ts — READ-ONLY. Source:
  .ai/rules/design-system/04-design-state-contract.mdc:16.
- Dimension 5 — hierarchy (Visual Priority). Source:
  .ai/rules/design-system/04-design-state-contract.mdc:117.
- 'reading-first' | Typography legibility and content flow take precedence; wide margins.
  Source: .ai/rules/design-system/04-design-state-contract.mdc:123.
- 'minimal' | Only contextual inline actions (row edit/delete); no standalone primary
  buttons. Source: .ai/rules/design-system/04-design-state-contract.mdc:141.
- When creating a new page, resolve all dimensions in this order before writing any markup:.
  Source: .ai/rules/design-system/04-design-state-contract.mdc:149.
- Set emphasis based on the visual weight this section should carry in the app. Source:
  .ai/rules/design-system/04-design-state-contract.mdc:155.
- // must not adding new intent without architect approval. Source:
  .ai/rules/design-system/04-design-state-contract.mdc:189.
- // Do not combine A3 stats grid AND A4 table as co-equal siblings at the root level.
  Source: .ai/rules/design-system/04-design-state-contract.mdc:201.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Visual Constant Ownership

This section owns visual constant ownership for `platform-invariants.md` under the accepted
P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Business pages and business components must not define unregistered visual constants, raw
colors, arbitrary dimensions, raw breakpoints, raw radius, raw typography scales, raw
z-index, raw duration, raw easing, arbitrary UnoCSS bracket sizing, page-local visual token
systems, or duplicate repository-local token systems.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Allowed Structural CSS Grammar

This section owns allowed structural css grammar for `platform-invariants.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Allowed structural CSS grammar is limited to `100%`, `100dvh`, `auto`, `min-content`,
`max-content`, `fit-content`, fractional tracks, `minmax(0, 1fr)`, registered CSS variables,
`calc()`, `min()`, `max()`, and `clamp()`. Functional expressions must be composed from
registered variables or structural values.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Token and Breakpoint Boundaries

This section owns token and breakpoint boundaries for `platform-invariants.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Component Boundary Integrity

This section owns component boundary integrity for `platform-invariants.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Layout and Scroll Ownership

This section owns layout and scroll ownership for `platform-invariants.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Overlay and Focus Ownership

This section owns overlay and focus ownership for `platform-invariants.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Theme and State Completeness

This section owns theme and state completeness for `platform-invariants.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Accessibility and Input Equivalence

This section owns accessibility and input equivalence for `platform-invariants.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Motion Safety

This section owns motion safety for `platform-invariants.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Runtime Behavior Preservation

This section owns runtime behavior preservation for `platform-invariants.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Existing Foundation Reuse

This section owns existing foundation reuse for `platform-invariants.md` under the accepted
P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Foundation dependencies for this reference:

- `packages/vue-hooks/src/index.ts`: current implementation evidence and platform
  dependency; reuse it, do not create a replacement for its responsibility.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Human and Future Machine Enforcement Boundary

This section owns human and future machine enforcement boundary for `platform-invariants.md`
under the accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.
