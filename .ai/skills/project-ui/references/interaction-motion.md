# Interaction and Motion

This internal reference owns interaction and motion for future project-ui governance. It is
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

This section owns scope for `interaction-motion.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 51 covered.

Governance rules:

- Local :pt may only add non-conflicting visual/motion extensions. Do not use local PT to
  fight global token sizing. Source: .ai/rules/components/01-primevue-pt-styling.mdc:21.
- must not duration-300, duration-200, duration-150, duration-500. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:211.
- [ ] duration-300 / duration-200 not present — use named duration tokens. Source:
      .ai/rules/design-system/00-unocss-guardrails.mdc:231.
- Use custom duration tokens (duration-xs, duration-sm, duration-md, duration-lg). Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:269.
- must not hardcoded timing literals (duration-300). Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:270.
- 03-material-system.mdc owns material, glass, elevation, z-index, and motion constraints.
  Source: .ai/rules/design-system/01-design-tokens.mdc:14.
- Visual collapse state, logical collapse state, and animation phase must remain separate.
  Source: .ai/rules/integrations/03-layout-architecture.mdc:115.
- Do NOT use logical collapsed state alone to hide labels, remove arrows, or switch visible
  menu DOM during the width transition. Source:
  .ai/rules/integrations/03-layout-architecture.mdc:118.
- Directives for declarative template use (v-tap, v-swipe, v-long-press). Source:
  .ai/rules/integrations/07-interaction-patterns.mdc:15.
- Law 1 — No Raw Touch/Pointer Event Listeners. Source:
  .ai/rules/integrations/07-interaction-patterns.mdc:18.
- must not in templates:. Source: .ai/rules/integrations/07-interaction-patterns.mdc:20.
- REQUIRED alternatives:. Source: .ai/rules/integrations/07-interaction-patterns.mdc:25.
- v-long-press="handler" — long press (default 500ms). Source:
  .ai/rules/integrations/07-interaction-patterns.mdc:28.
- @click exception:. Source: .ai/rules/integrations/07-interaction-patterns.mdc:31.
- @click remains valid for simple click handlers — it works on both mouse and touch. Only
  use v-tap when you need isTapping state or must differentiate touch-tap from mouse-click.
  Source: .ai/rules/integrations/07-interaction-patterns.mdc:32.
- Touch devices get :active feedback only. Source:
  .ai/rules/integrations/07-interaction-patterns.mdc:37.
- NEVER use :deep(.p-) for interaction overrides. Source:
  .ai/rules/integrations/07-interaction-patterns.mdc:47.
- Law 4 — VueUse is the Only Gesture Foundation. Source:
  .ai/rules/integrations/07-interaction-patterns.mdc:49.
- @vueuse/core is the ONLY permitted gesture/pointer library. must not. Source:
  .ai/rules/integrations/07-interaction-patterns.mdc:51.
- @vueuse/gesture (separate package, not installed). Source:
  .ai/rules/integrations/07-interaction-patterns.mdc:55.
- Only these interaction-related UnoCSS shortcuts exist (closed set):. Source:
  .ai/rules/integrations/07-interaction-patterns.mdc:62.
- Adding new interaction shortcuts requires extending semanticShortcuts.ts AND updating the
  Closed Shortcut Registry in 00-unocss-guardrails.mdc. Source:
  .ai/rules/integrations/07-interaction-patterns.mdc:70.
- v-long-press | v-long-press="handler" | Long press (default 500ms). Source:
  .ai/rules/integrations/07-interaction-patterns.mdc:78.
- useSwipeAction() | { isSwiping, direction, distanceX, distanceY, stop }. Source:
  .ai/rules/integrations/07-interaction-patterns.mdc:84.
- mild slide transitions only where spatial direction is meaningful;. Source:
  .ai/skills/design/ccd-animate-lite/SKILL.md:26.
- zoomIn and zoomOut only for existing component contracts that require them. Source:
  .ai/skills/design/ccd-animate-lite/SKILL.md:27.
- Do not install full Animate.css unless the owner explicitly approves a separate dependency
  lane. Source: .ai/skills/design/ccd-animate-lite/SKILL.md:31.
- Do not use strong attention animations for new work:. Source:
  .ai/skills/design/ccd-animate-lite/SKILL.md:39.
- If a legacy route or component still needs one of these, treat it as a migration candidate
  rather than expanding the local runtime. Source:
  .ai/skills/design/ccd-animate-lite/SKILL.md:45.
- Required constraints. Source: .ai/skills/design/ccd-gsap-motion/SKILL.md:25.
- Do not create import-time animations. Source:
  .ai/skills/design/ccd-gsap-motion/SKILL.md:32.
- Do not create global animation side effects. Source:
  .ai/skills/design/ccd-gsap-motion/SKILL.md:33.
- Forbidden by default. Source: .ai/skills/design/ccd-gsap-motion/SKILL.md:37.
- Do not register ScrollTrigger unless the owner explicitly approves a scroll-driven page.
  Source: .ai/skills/design/ccd-gsap-motion/SKILL.md:40.
- Default for:. Source: .ai/skills/design/ccd-motion-system/SKILL.md:23.
- route/page transition;. Source: .ai/skills/design/ccd-motion-system/SKILL.md:60.
- must explain spatial relationship;. Source:
  .ai/skills/design/ccd-motion-system/SKILL.md:65.
- use existing transition utilities and duration tokens;. Source:
  .ai/skills/design/ccd-motion-system/SKILL.md:66.
- Rare. Requires explicit owner approval. Source:
  .ai/skills/design/ccd-motion-system/SKILL.md:71.
- Changing light/dark mode must not remount visual-stage roots or reset form input. Source:
  .ai/skills/design/ccd-motion-system/SKILL.md:102.
- Do not use :key="theme" on animated components. Source:
  .ai/skills/design/ccd-motion-system/SKILL.md:106.
- Do not use v-if/v-else to render separate light/dark animation trees. Source:
  .ai/skills/design/ccd-motion-system/SKILL.md:107.
- Do not redefine animation shorthand in .dark or light selectors. Source:
  .ai/skills/design/ccd-motion-system/SKILL.md:108.
- Theme selectors may change CSS variables only. Source:
  .ai/skills/design/ccd-motion-system/SKILL.md:109.
- Keep animation-name, duration, timing, and iteration stable. Source:
  .ai/skills/design/ccd-motion-system/SKILL.md:110.
- route/dialog state clarity. Source: .ai/skills/design/ccd-motion-system/SKILL.md:128.
- Do not scatter will-change, transform-gpu, or large blur across pages. Source:
  .ai/skills/design/ccd-motion-system/SKILL.md:132.
- Allowed:. Source: .ai/skills/design/ccd-motion-system/SKILL.md:134.
- canvas/WebGL without explicit owner approval. Source:
  .ai/skills/design/ccd-motion-system/SKILL.md:146.
- Can it run on CI visual tests without flake?. Source:
  .ai/skills/design/ccd-motion-system/SKILL.md:156.
- Motion: use motion to show continuity, not to entertain. Source:
  .ai/skills/design/ccd-product-language/SKILL.md:69.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Interaction Feedback Hierarchy

This section owns interaction feedback hierarchy for `interaction-motion.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Motion Levels

This section owns motion levels for `interaction-motion.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Motion Tool Selection

This section owns motion tool selection for `interaction-motion.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## GSAP Eligibility

This section owns gsap eligibility for `interaction-motion.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

GSAP is not a default UI dependency. GSAP is eligible only for complex timeline or
coordinated sequence work with explicit evidence.

animate-lite is eligible only for lightweight route, class, or state transitions within its
boundary.

Do not load both motion systems by default. Do not load both systems together by default.

Accepted P2.3 semantic coverage for this heading: 7 covered.

Governance rules:

- Use this skill when a task mentions GSAP, GreenSock, timeline animation, advanced
  interaction motion, or ScrollTrigger. Source:
  .ai/skills/design/ccd-gsap-motion/SKILL.md:11.
- CCD allows GSAP only as a controlled app-local capability for apps/web-demo. CCD
  governance remains the source of truth even when official GSAP skills exist. Source:
  .ai/skills/design/ccd-gsap-motion/SKILL.md:13.
- Use GSAP for controlled Level 1 or Level 2 interaction and timeline work when CSS, Vue
  &lt;Transition, or local animate-lite is insufficient. Source:
  .ai/skills/design/ccd-gsap-motion/SKILL.md:17.
- Do not use GSAP in packages/. Source: .ai/skills/design/ccd-gsap-motion/SKILL.md:34.
- Do not extract GSAP into shared packages. Source:
  .ai/skills/design/ccd-gsap-motion/SKILL.md:35.
- Do not use GSAP as default page decoration. Source:
  .ai/skills/design/ccd-gsap-motion/SKILL.md:41.
- Do not use GSAP to hide weak layout or unclear hierarchy. Source:
  .ai/skills/design/ccd-gsap-motion/SKILL.md:42.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Animate-Lite Eligibility

This section owns animate-lite eligibility for `interaction-motion.md` under the accepted
P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

GSAP is not a default UI dependency. GSAP is eligible only for complex timeline or
coordinated sequence work with explicit evidence.

animate-lite is eligible only for lightweight route, class, or state transitions within its
boundary.

Do not load both motion systems by default. Do not load both systems together by default.

Accepted P2.3 semantic coverage for this heading: 7 covered.

Governance rules:

- Governs CCD local animate-lite route and wrapper transition usage without adding full
  Animate.css. Source: .ai/skills/design/ccd-animate-lite/SKILL.md:3.
- Use this skill when a task mentions animate-lite, AnimateWrapper, route transition, page
  transition, or animate.css-style class transitions. Source:
  .ai/skills/design/ccd-animate-lite/SKILL.md:11.
- animate-lite is for route/page enter-leave and small wrapper transitions. Source:
  .ai/skills/design/ccd-animate-lite/SKILL.md:17.
- Keep route transitions short. Source: .ai/skills/design/ccd-animate-lite/SKILL.md:32.
- Keep the local class contract aligned between animate-lite.scss and AnimateWrapper types.
  Source: .ai/skills/design/ccd-animate-lite/SKILL.md:34.
- Do not use animate-lite to hide weak layout, unclear hierarchy, or late content shifts.
  Source: .ai/skills/design/ccd-animate-lite/SKILL.md:35.
- Use this skill for any UI task involving animation, transition, hover movement, loading,
  visual background motion, page transitions, route transitions, dialogs, drawers,
  accordions, tabs, or micro-interactions. Source:
  .ai/skills/design/ccd-motion-system/SKILL.md:11.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Conditional Motion Loading

This section owns conditional motion loading for `interaction-motion.md` under the accepted
P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

GSAP is not a default UI dependency. GSAP is eligible only for complex timeline or
coordinated sequence work with explicit evidence.

animate-lite is eligible only for lightweight route, class, or state transitions within its
boundary.

Do not load both motion systems by default. Do not load both systems together by default.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Route and Class Transitions

This section owns route and class transitions for `interaction-motion.md` under the accepted
P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Gesture Requirements

This section owns gesture requirements for `interaction-motion.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Hover Restrictions

This section owns hover restrictions for `interaction-motion.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 7 covered, 2 implementation-evidence.

Governance rules:

- Rule: Solid interactive surfaces should prefer primary-hover / -hover. For translucent
  material layers, low-emphasis list hover, glass surfaces, and tokenized overlays, semantic
  token opacity forms such as bg-primary/10 or bg-foreground/[0.04] are allowed. Arbitrary
  palette colors and raw non-semantic hover colors remain forbidden. Source:
  .ai/rules/design-system/01-design-tokens.mdc:186.
- must When transitioning box-shadow between default and :hover (or active) states, the
  number of comma-separated shadow layers must be identical in both states. Source:
  .ai/rules/design-system/03-material-system.mdc:104.
- Expanded and collapsed states must preserve the same icon box size, icon center line, menu
  item height, hover area rhythm, and active indicator alignment. Source:
  .ai/rules/integrations/03-layout-architecture.mdc:122.
- @mouseenter, @mouseleave (use CSS :hover gated by media query). Source:
  .ai/rules/integrations/07-interaction-patterns.mdc:23.
- Law 2 — Hover is PC-Only. Source: .ai/rules/integrations/07-interaction-patterns.mdc:34.
- UnoCSS hover: variants in shortcuts remain; interaction.scss overrides them on touch.
  Source: .ai/rules/integrations/07-interaction-patterns.mdc:38.
- NEVER add new hover-dependent UX without considering the touch fallback. Source:
  .ai/rules/integrations/07-interaction-patterns.mdc:39.

Implementation evidences:

- Use as implementation evidence only, not as independent governance: Dark: keep the same
  segment count when swapping outer glow for inset highlight, e.g.
  dark:shadow-[08px30pxrgb(var(--neutral-950)/0),inset01px00...] — never introduce a new
  comma segment only on hover. Source: .ai/rules/design-system/03-material-system.mdc:108.
- Use as implementation evidence only, not as independent governance: REQUIRED — luminance
  lift only: Use foreground for a clean luminance step, e.g. hover:bg-foreground/[0.05] (and
  matching active states), unless a checked-in semantic shortcut encodes the same intent.
  Source: .ai/rules/design-system/03-material-system.mdc:115.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Layout Animation Restrictions

This section owns layout animation restrictions for `interaction-motion.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 2 covered.

Governance rules:

- Prefer opacity and transform over layout properties. Source:
  .ai/skills/design/ccd-gsap-motion/SKILL.md:31.
- existing route/layout animation utilities. Source:
  .ai/skills/design/ccd-motion-system/SKILL.md:138.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Ambient and Background Motion

This section owns ambient and background motion for `interaction-motion.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Reduced Motion

This section owns reduced motion for `interaction-motion.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 1 covered.

Governance rules:

- Keep reduced-motion behavior compatible. Source:
  .ai/skills/design/ccd-animate-lite/SKILL.md:33.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Local Ownership and Cleanup

This section owns local ownership and cleanup for `interaction-motion.md` under the accepted
P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Performance Boundaries

This section owns performance boundaries for `interaction-motion.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Testing and Review

This section owns testing and review for `interaction-motion.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Current Routing Limitation

This section owns current routing limitation for `interaction-motion.md` under the accepted
P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.
