# UI Validation

This internal reference owns ui validation for future project-ui governance. It is not an
independent Skill and carries no activation metadata.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Validation Scope

This section owns validation scope for `validation.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

P2 human validation is documented here. Future P3 machine policy, future Page Contract
validation, future P5 routing validation, and later UI Gate orchestration are separate work.

Accepted P2.3 semantic coverage for this heading: 47 covered, 16 deferred-to-p3, 1
implementation-evidence.

Governance rules:

- ABSOLUTE RULE: Before implementing any PrimeVue component with more than 3 props, the AI
  agent must verify the component's API against the official PrimeVue v4 documentation. Do
  NOT rely on memorized API surfaces — PrimeVue v4 introduced breaking changes in prop
  names, event names, slot names, and compound component structures. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:90.
- Verify against the page:. Source: .ai/rules/components/00-primevue-ecosystem.mdc:97.
- Tier 2 — Medium (verify if using advanced props or any slot):. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:109.
- Tier 3 — Complex (must verify before implementing):. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:112.
- &lt;DataTable :rows="10" :paginator="true" | Props correct, but verify paginatorTemplate
  slot names changed in v4. Source: .ai/rules/components/00-primevue-ecosystem.mdc:124.
- Verify you are using the COMPOUND structure, not the legacy monolithic API. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:197.
- pnpm exec playwright test e2e/use-echarts-render.spec.ts --project=chromium. Source:
  .ai/rules/components/03-echarts-theming.mdc:57.
- MANDATORY UI pre-execution architect checklist for views, components, layouts, and
  design-engine constraints. Source: .ai/rules/core/02-ui-preflight.mdc:2.
- [ ] Phantom Check: All UnoCSS shortcuts used must exist in semanticShortcuts.ts (No
      hallucinations). Source: .ai/rules/core/02-ui-preflight.mdc:11.
- [ ] Internal Primitives: glass-base is NOT used directly in templates. Source:
      .ai/rules/core/02-ui-preflight.mdc:12.
- [ ] Units: Priority is vw/vh % px. Absolutely NO rem/em. NO hex codes (uses Theme tokens).
      Source: .ai/rules/core/02-ui-preflight.mdc:13.
- [ ] Class Statics: All UnoCSS classes are static string literals (No dynamic template
      strings). Source: .ai/rules/core/02-ui-preflight.mdc:14.
- [ ] Scroll Contract: overflow-auto/scroll is NOT used for main layouts. &lt;CScrollbar
      class="col-fill" is used. Source: .ai/rules/core/02-ui-preflight.mdc:17.
- [ ] Rule of 7: Raw utility count on any element is &lt;= 7. Source:
      .ai/rules/core/02-ui-preflight.mdc:19.
- [ ] Form Boundary: Inside src/views/, &lt;form is NOT used. Use &lt;ProForm for 2+ fields.
      Source: .ai/rules/core/02-ui-preflight.mdc:22.
- [ ] Auto-Imports: In CCD auto-import-aware Vue/TS/TSX surfaces, auto-imported Vue APIs are
      used as globals; manual value imports from vue are forbidden unless the surface is
      explicitly outside the auto-import contract. Type-only imports remain allowed. Source:
      .ai/rules/core/02-ui-preflight.mdc:25.
- [ ] No Hyperscript Helper: The Vue h helper is forbidden in CCD coding surfaces. Do not
      import it from vue, and do not call it for render output. Source:
      .ai/rules/core/02-ui-preflight.mdc:26.
- [ ] Harness Rendering: Test and harness components use one reusable component per file.
      Inline render output must be a Vue template in SFC/template-backed surfaces or a TSX
      return/render body in TSX-enabled surfaces, never the Vue h helper used to bypass
      vue/one-component-per-file. When a lane explicitly requires TSX, do not substitute
      template-backed rendering; verify existing .tsx tooling support or stop with a
      tooling-scope blocker. Source: .ai/rules/core/02-ui-preflight.mdc:27.
- Pre-Output Checklist (AI Must Pass). Source:
  .ai/rules/design-system/05-semantic-color-usage-contract.mdc:72.
- Defines CCD motion levels, animation limits, reduced-motion behavior, and motion review
  rules. Source: .ai/skills/design/ccd-motion-system/SKILL.md:3.
- Motion review checklist. Source: .ai/skills/design/ccd-motion-system/SKILL.md:148.
- A final UI review checklist for CCD visual work before staging, committing, or pushing.
  Source: .ai/skills/design/ccd-ui-review-gate/SKILL.md:3.
- Use this skill before staging UI changes. Source:
  .ai/skills/design/ccd-ui-review-gate/SKILL.md:11.
- Required review sequence. Source: .ai/skills/design/ccd-ui-review-gate/SKILL.md:13.
- Verify architecture boundary. Source: .ai/skills/design/ccd-ui-review-gate/SKILL.md:15.
- Verify page design thesis. Source: .ai/skills/design/ccd-ui-review-gate/SKILL.md:16.
- Verify PrimeVue/Pro component usage. Source:
  .ai/skills/design/ccd-ui-review-gate/SKILL.md:18.
- Verify UnoCSS/token compliance. Source: .ai/skills/design/ccd-ui-review-gate/SKILL.md:19.
- Verify material and motion restraint. Source:
  .ai/skills/design/ccd-ui-review-gate/SKILL.md:20.
- Verify state completeness. Source: .ai/skills/design/ccd-ui-review-gate/SKILL.md:21.
- Verify responsive behavior. Source: .ai/skills/design/ccd-ui-review-gate/SKILL.md:22.
- Verify accessibility. Source: .ai/skills/design/ccd-ui-review-gate/SKILL.md:23.
- Verify validation commands. Source: .ai/skills/design/ccd-ui-review-gate/SKILL.md:24.
- Reject if any answer is no:. Source: .ai/skills/design/ccd-ui-review-gate/SKILL.md:28.
- Are icons used only where useful?. Source:
  .ai/skills/design/ccd-ui-review-gate/SKILL.md:37.
- Reject if found:. Source: .ai/skills/design/ccd-ui-review-gate/SKILL.md:44.
- Tailwind default palette classes;. Source:
  .ai/skills/design/ccd-ui-review-gate/SKILL.md:47.
- forbidden glass-base usage;. Source: .ai/skills/design/ccd-ui-review-gate/SKILL.md:49.
- native buttons/inputs/tables where PrimeVue/Pro wrappers should be used;. Source:
  .ai/skills/design/ccd-ui-review-gate/SKILL.md:53.
- locale/theme controls look like default controls;. Source:
  .ai/skills/design/ccd-ui-review-gate/SKILL.md:78.
- Required evidence for UI-heavy changes. Source:
  .ai/skills/design/ccd-ui-review-gate/SKILL.md:82.
- no-console-error manual check or Playwright evidence;. Source:
  .ai/skills/design/ccd-ui-review-gate/SKILL.md:90.
- Do not commit local screenshot artifacts unless the repo explicitly tracks them. Source:
  .ai/skills/design/ccd-ui-review-gate/SKILL.md:93.
- Use the smallest sufficient set first, then final gates:. Source:
  .ai/skills/design/ccd-ui-review-gate/SKILL.md:97.
- pnpm --filter @ccd/web-demo type-check. Source:
  .ai/skills/design/ccd-ui-review-gate/SKILL.md:100.
- pnpm validate. Source: .ai/skills/design/ccd-ui-review-gate/SKILL.md:108.
- If snapshots intentionally change, request owner approval before updating them. Source:
  .ai/skills/design/ccd-ui-review-gate/SKILL.md:112.

P3-deferred semantic owners:

- Retain the semantic intent here; operational enforcement belongs to P3 Machine UI Policy
  enforcement: multi-field business form built from raw controls - use &lt;ProForm :schema.
  Source: .ai/rules/components/00-primevue-ecosystem.mdc:25.
- Retain the semantic intent here; operational enforcement belongs to P3 Machine UI Policy
  enforcement: Feedback Channel (ABSOLUTE RULE): NEVER use raw PrimeVue Toast instances in
  business code and NEVER use native alert / confirm for user feedback. You must route
  feedback through the internal abstraction (@/components/ProToast or the project's
  configured toast service APIs such as window.$toast / window.$message) to preserve queue
  policy, theme consistency, and cross-module UX behavior. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:80.
- Retain the semantic intent here; operational enforcement belongs to P3 Machine UI Policy
  enforcement: [ ] Complex forms use &lt;ProForm schema engine when appropriate
  (02-pro-components.mdc). Source: .ai/rules/components/00-primevue-ecosystem.mdc:210.
- Retain the semantic intent here; operational enforcement belongs to P3 Machine UI Policy
  enforcement: &lt;!-- must transparent root — Transparent Root Policy --. Source:
  .ai/rules/components/02-pro-components.mdc:84.
- Retain the semantic intent here; operational enforcement belongs to P3 Machine UI Policy
  enforcement: 4.1 — Always Schema-Driven. Source:
  .ai/rules/components/02-pro-components.mdc:215.
- Retain the semantic intent here; operational enforcement belongs to P3 Machine UI Policy
  enforcement: Forms with 4 fields must define schema in a separate file. Source:
  .ai/rules/components/02-pro-components.mdc:227.
- Retain the semantic intent here; operational enforcement belongs to P3 Machine UI Policy
  enforcement: &lt;form&lt;input in business views | must not | &lt;ProForm :schema /.
  Source: .ai/rules/components/02-pro-components.mdc:250.
- Retain the semantic intent here; operational enforcement belongs to P3 Machine UI Policy
  enforcement: 4. Validation Gate. Source: .ai/rules/core/10-ai-generation-workflow.mdc:30.
- Retain the semantic intent here; operational enforcement belongs to P3 Machine UI Policy
  enforcement: pnpm validate:tokens is the canonical theme-token gate. It is semantic-aware
  and must not be treated as a flat "all tokens require 4.5" checker. Source:
  .ai/rules/design-system/01-design-tokens.mdc:50.
- Retain the semantic intent here; operational enforcement belongs to P3 Machine UI Policy
  enforcement: name: ccd-ui-review-gate. Source:
  .ai/skills/design/ccd-ui-review-gate/SKILL.md:2.
- Retain the semantic intent here; operational enforcement belongs to P3 Machine UI Policy
  enforcement: CCD UI Review Gate. Source: .ai/skills/design/ccd-ui-review-gate/SKILL.md:7.
- Retain the semantic intent here; operational enforcement belongs to P3 Machine UI Policy
  enforcement: Visual quality gate. Source:
  .ai/skills/design/ccd-ui-review-gate/SKILL.md:26.
- Retain the semantic intent here; operational enforcement belongs to P3 Machine UI Policy
  enforcement: Token and implementation gate. Source:
  .ai/skills/design/ccd-ui-review-gate/SKILL.md:42.
- Retain the semantic intent here; operational enforcement belongs to P3 Machine UI Policy
  enforcement: Layout gate. Source: .ai/skills/design/ccd-ui-review-gate/SKILL.md:58.
- Retain the semantic intent here; operational enforcement belongs to P3 Machine UI Policy
  enforcement: pnpm lint:check. Source: .ai/skills/design/ccd-ui-review-gate/SKILL.md:101.
- Retain the semantic intent here; operational enforcement belongs to P3 Machine UI Policy
  enforcement: pnpm governance:gate. Source:
  .ai/skills/design/ccd-ui-review-gate/SKILL.md:107.

Implementation evidences:

- Use as implementation evidence only, not as independent governance: [ ] Layout
  Exclusivity: layout- classes (e.g., layout-container, layout-narrow) are NEVER nested.
  Source: .ai/rules/core/02-ui-preflight.mdc:18.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Architecture Preflight

This section owns architecture preflight for `validation.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Skill Reference Selection

This section owns skill reference selection for `validation.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Token Audit

This section owns token audit for `validation.md` under the accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Component Ownership Audit

This section owns component ownership audit for `validation.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Layout and Scroll Audit

This section owns layout and scroll audit for `validation.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Responsive Audit

This section owns responsive audit for `validation.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## State Matrix Review

This section owns state matrix review for `validation.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Keyboard and Focus Review

This section owns keyboard and focus review for `validation.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Reduced-Motion Review

This section owns reduced-motion review for `validation.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Light and Dark Review

This section owns light and dark review for `validation.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 1 covered.

Governance rules:

- AI MANDATE: When the task touches visual surfaces, you must confirm this UI checklist in
  addition to the global preflight. Any [] means you must not proceed. Source:
  .ai/rules/core/02-ui-preflight.mdc:8.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Visual Regression Review

This section owns visual regression review for `validation.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Runtime Behavior Preservation Review

This section owns runtime behavior preservation review for `validation.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Final Diff Review

This section owns final diff review for `validation.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 1 covered.

Governance rules:

- git diff --check. Source: .ai/skills/design/ccd-ui-review-gate/SKILL.md:109.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## P2 Human Validation

This section owns p2 human validation for `validation.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## P3 Machine Policy Boundary

This section owns p3 machine policy boundary for `validation.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Page Contract Validation Boundary

This section owns page contract validation boundary for `validation.md` under the accepted
P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## P5 Routing Validation Boundary

This section owns p5 routing validation boundary for `validation.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Later UI Gate Orchestration

This section owns later ui gate orchestration for `validation.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.
