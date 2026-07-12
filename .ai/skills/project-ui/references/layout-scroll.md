# Layout and Scroll Ownership

This internal reference owns layout and scroll ownership for future project-ui governance.
It is not an independent Skill and carries no activation metadata.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Ownership Model

This section owns ownership model for `layout-scroll.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

The document root is viewport-bounded, the route viewport is not an implicit scroll owner,
the page root fills available space, and only explicit regions scroll.

Accepted P2.3 semantic coverage for this heading: 27 covered, 1 implementation-evidence.

Governance rules:

- Layout Shell (LayoutHeader, LayoutSidebar): Edge-to-edge glass ONLY. Source:
  .ai/rules/design-system/03-material-system.mdc:40.
- Use bg-sidebar/80 backdrop-blur-xl with complete semantic separators such as border-b
  border-b-solid border-border or border-r border-r-solid border-sidebar-border. Source:
  .ai/rules/design-system/03-material-system.mdc:41.
- NEVER use floating capsules (glass-capsule) for the main layout shell. Source:
  .ai/rules/design-system/03-material-system.mdc:42.
- must not ease-in-out for layout elements. Source:
  .ai/rules/design-system/03-material-system.mdc:124.
- (omitted) | Inherit from global layout default (desktop-first for admin). Source:
  .ai/rules/design-system/04-design-state-contract.mdc:48.
- 'comfortable' | Balanced layout (default for most admin pages) | p-sm / p-md / gap-sm /
  gap-md. Source: .ai/rules/design-system/04-design-state-contract.mdc:110.
- Layout renderers must be pure consumers of finalized runtime state. Source:
  .ai/rules/integrations/03-layout-architecture.mdc:12.
- The only authoritative layout responsive resolver is:. Source:
  .ai/rules/integrations/03-layout-architecture.mdc:26.
- The runtime is the ONLY source of truth for:. Source:
  .ai/rules/integrations/03-layout-architecture.mdc:31.
- Renderer components must consume finalized runtime state:. Source:
  .ai/rules/integrations/03-layout-architecture.mdc:49.
- These files are renderers and must not derive responsive behavior locally:. Source:
  .ai/rules/integrations/03-layout-architecture.mdc:57.
- Forbidden inside layout renderers:. Source:
  .ai/rules/integrations/03-layout-architecture.mdc:63.
- Allowed inside layout renderers:. Source:
  .ai/rules/integrations/03-layout-architecture.mdc:78.
- NEVER nest width archetypes. Source: .ai/rules/integrations/03-layout-architecture.mdc:92.
- Device store initialization must be singleton and idempotent; duplicate
  resize/orientation/visualViewport listeners are forbidden. Source:
  .ai/rules/integrations/03-layout-architecture.mdc:97.
- Layout store owns user preferences and persisted layout configuration only. Source:
  .ai/rules/integrations/03-layout-architecture.mdc:98.
- The visible admin sidebar menu must keep one persistent PanelMenu renderer across
  expanded, animating, and collapsed states. Source:
  .ai/rules/integrations/03-layout-architecture.mdc:108.
- Collapsed mode must be a CSS/layout/interaction state, not a renderer replacement. Source:
  .ai/rules/integrations/03-layout-architecture.mdc:109.
- TieredMenu is allowed ONLY as a floating popup for collapsed root submenu interaction.
  Source: .ai/rules/integrations/03-layout-architecture.mdc:110.
- Logical collapsed state controls interaction semantics only: inline submenu suppression
  and popup submenu behavior. Source: .ai/rules/integrations/03-layout-architecture.mdc:117.
- Expanded sidebar menu items must show a title tooltip ONLY when the label is actually
  truncated. Source: .ai/rules/integrations/03-layout-architecture.mdc:129.
- All layout safe-area consumption must use centralized variables exposed by runtime
  styles:. Source: .ai/rules/integrations/03-layout-architecture.mdc:134.
- Use v-if/v-show with runtime flags, never responsive utility classes on shell structures.
  Source: .ai/rules/integrations/03-layout-architecture.mdc:146.
- Layout runtime changes must include real assertions, not snapshots:. Source:
  .ai/rules/integrations/03-layout-architecture.mdc:161.
- Admin sidebar interaction changes must include Playwright checks for collapsed/expanded
  icon center continuity, collapsed root menu tooltip behavior, expanded truncated-label
  tooltip behavior, and collapsed submenu popup anchoring. Source:
  .ai/rules/integrations/03-layout-architecture.mdc:168.
- dropdown is an overlay material, not a default browser menu;. Source:
  .ai/skills/design/ccd-material-system/SKILL.md:129.
- This surface is a [page type] where [primary user] needs [primary action], so the UI
  emphasizes [main information] through [layout and material strategy]. Source:
  .ai/skills/design/ccd-product-language/SKILL.md:89.

Implementation evidences:

- Use as implementation evidence only, not as independent governance: ABSOLUTE BAN: NEVER
  use hardcoded colors like bg-white, bg-black, bg-gray-100, or dark:bg- on fixed neutrals
  for glass effects. ALWAYS use semantic theme tokens plus opacity (for example
  bg-sidebar/80 backdrop-blur-xl, bg-card/70) so glassmorphism tracks the Dynamic Theme
  Engine (--sidebar-bg, --background, and related CSS variables). Source:
  .ai/rules/design-system/03-material-system.mdc:17.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Document and Route Viewport

This section owns document and route viewport for `layout-scroll.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Page Root Responsibilities

This section owns page root responsibilities for `layout-scroll.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Region Responsibilities

This section owns region responsibilities for `layout-scroll.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Explicit Scroll Owners

This section owns explicit scroll owners for `layout-scroll.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Same-Axis Nesting

This section owns same-axis nesting for `layout-scroll.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Virtualized Component Ownership

This section owns virtualized component ownership for `layout-scroll.md` under the accepted
P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Desktop Multi-Region Layouts

This section owns desktop multi-region layouts for `layout-scroll.md` under the accepted
P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Tablet Transformation

This section owns tablet transformation for `layout-scroll.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Mobile Primary Scroll Ownership

This section owns mobile primary scroll ownership for `layout-scroll.md` under the accepted
P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 1 covered.

Governance rules:

- Child components may render from props, but must not infer mobile/tablet/drawer behavior
  locally. Source: .ai/rules/integrations/03-layout-architecture.mdc:148.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Dialog and Drawer Isolation

This section owns dialog and drawer isolation for `layout-scroll.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 4 covered.

Governance rules:

- must ease-spring for spatial transitions (drawers, layout shifts) and ease-smooth for
  opacity fades. Source: .ai/rules/design-system/03-material-system.mdc:125.
- Structural visibility (Sidebar/Top Menu/Drawer) must not rely on CSS media query
  visibility toggles. Source: .ai/rules/integrations/03-layout-architecture.mdc:10.
- Drawer roots, fixed headers, fullscreen layout, tab bars, and shell padding must consume
  runtime-provided style objects or these variables. Do not inline env(safe-area-inset-)
  inside layout renderers. Source: .ai/rules/integrations/03-layout-architecture.mdc:143.
- Drawer/sidebar/menu compactness must come from explicit props or layout runtime state, not
  device sniffing inside the child. Source:
  .ai/rules/integrations/03-layout-architecture.mdc:149.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Fullscreen and Immersive Surfaces

This section owns fullscreen and immersive surfaces for `layout-scroll.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Scroll Restoration

This section owns scroll restoration for `layout-scroll.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Current AppContainer Evidence

This section owns current appcontainer evidence for `layout-scroll.md` under the accepted
P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Later Layout-Phase Boundary

This section owns later layout-phase boundary for `layout-scroll.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.
