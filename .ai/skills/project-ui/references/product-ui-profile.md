# CCD Product UI Profile

This internal reference owns ccd product ui profile for future project-ui governance. It is
not an independent Skill and carries no activation metadata.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Profile Identity

This section owns profile identity for `product-ui-profile.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

The active profile is CCD Architectural Glass.

This profile is replaceable.

This profile is not a permanent platform invariant.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Replaceable Status

This section owns replaceable status for `product-ui-profile.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

The active profile is CCD Architectural Glass.

This profile is replaceable.

This profile is not a permanent platform invariant.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Profile Purpose

This section owns profile purpose for `product-ui-profile.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 14 covered, 1 implementation-evidence.

Governance rules:

- - ALWAYS use semantic theme variables: bg-background, bg-foreground/[0.05],
    text-foreground, border-border. Source: .ai/rules/design-system/03-material-system.mdc:11.
- must not (internal primitive — DO NOT use directly) | REQUIRED (public API shortcuts).
  Source: .ai/rules/design-system/03-material-system.mdc:25.
- When generating or refactoring components, strictly follow this mapping:. Source:
  .ai/rules/design-system/03-material-system.mdc:36.
- REQUIRED — semantic tokens ONLY:. Source:
  .ai/rules/design-system/03-material-system.mdc:56.
- z-toast | 100 | Toast notifications (always on top). Source:
  .ai/rules/design-system/03-material-system.mdc:65.
- low-opacity pastel glows only as background support;. Source:
  .ai/skills/design/ccd-material-system/SKILL.md:70.
- ordinary outer shadows as the only depth cue;. Source:
  .ai/skills/design/ccd-material-system/SKILL.md:95.
- Inputs must be solid enough to read. Source:
  .ai/skills/design/ccd-material-system/SKILL.md:101.
- Required states:. Source: .ai/skills/design/ccd-material-system/SKILL.md:103.
- default;. Source: .ai/skills/design/ccd-material-system/SKILL.md:105.
- Toolbar controls must read as one system. Source:
  .ai/skills/design/ccd-material-system/SKILL.md:122.
- avoid extra decorative icons. Source: .ai/skills/design/ccd-material-system/SKILL.md:130.
- Use shadows to show elevation, not style. Source:
  .ai/skills/design/ccd-material-system/SKILL.md:140.
- controls look native/default;. Source: .ai/skills/design/ccd-material-system/SKILL.md:151.

Implementation evidences:

- Use as implementation evidence only, not as independent governance: ALLOWED: Alpha /
  saturation ramps only for high-chroma semantic quad colors (e.g. Primary, Danger, Success,
  Info) where steps are visually meaningful. Source:
  .ai/rules/design-system/03-material-system.mdc:121.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Theme Relationship

This section owns theme relationship for `product-ui-profile.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Material Hierarchy

This section owns material hierarchy for `product-ui-profile.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 10 covered.

Governance rules:

- must You must use semantic material tokens: material-solid, material-elevated,
  glass-panel, glass-capsule. Source: .ai/rules/design-system/03-material-system.mdc:19.
- &lt;ProTable / Data Grids → material-solid ONLY. Source:
  .ai/rules/design-system/03-material-system.mdc:37.
- Dialogs / Modals / Dropdowns / ContextMenus → glass-panel (floating overlays only).
  Source: .ai/rules/design-system/03-material-system.mdc:39.
- glass-capsule → Reserved for decorative, non-structural floating elements only. Source:
  .ai/rules/design-system/03-material-system.mdc:43.
- NEVER use glass- inside: &lt;ProTable, virtual lists, scrollable containers, or nested
  inside another glass element. Source: .ai/rules/design-system/03-material-system.mdc:47.
- Use existing approved material shortcuts first. Source:
  .ai/skills/design/ccd-material-system/SKILL.md:45.
- Do not use glass-base directly. Source: .ai/skills/design/ccd-material-system/SKILL.md:59.
- Avoid hardcoded black shadows in app code. Prefer existing material utilities or CSS
  variables based on semantic tokens. Source:
  .ai/skills/design/ccd-material-system/SKILL.md:142.
- Reject material if:. Source: .ai/skills/design/ccd-material-system/SKILL.md:146.
- data-heavy surfaces use decorative material;. Source:
  .ai/skills/design/ccd-material-system/SKILL.md:153.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Surface Roles

This section owns surface roles for `product-ui-profile.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Density Intent

This section owns density intent for `product-ui-profile.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Borders and Separators

This section owns borders and separators for `product-ui-profile.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Depth Hierarchy

This section owns depth hierarchy for `product-ui-profile.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Icon Behavior

This section owns icon behavior for `product-ui-profile.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Brand Expression

This section owns brand expression for `product-ui-profile.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Light and Dark Parity

This section owns light and dark parity for `product-ui-profile.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 7 covered.

Governance rules:

- - If a specific translucent effect requires a white/black tint, it must be abstracted into
    semanticShortcuts.ts using bg-background (for light mode canvas) or bg-foreground (for
    text/tint). Source: .ai/rules/design-system/03-material-system.mdc:12.
- Physical law: Ordinary outer box-shadows are visually absorbed on dark canvases; they fail
  to separate layers reliably. Source: .ai/rules/design-system/03-material-system.mdc:80.
- REQUIRED pattern: Communicate elevation with top-edge internal luminosity (inset
  highlight) plus a sharp semantic border (border border-solid border-border or border
  border-solid border-foreground/20), not with “light-mode style” drop shadows alone.
  Source: .ai/rules/design-system/03-material-system.mdc:81.
- must not Relying on conventional outer shadows as the primary depth signal on dark
  surfaces when building floating / elevated UI. Source:
  .ai/rules/design-system/03-material-system.mdc:82.
- Dark floating / elevated surfaces should follow a scheme structurally similar to:. Source:
  .ai/rules/design-system/03-material-system.mdc:86.
- must not on dark surfaces (lists, rows, interactive strips):. Source:
  .ai/rules/design-system/03-material-system.mdc:112.
- Dark mode should feel rich, not muddy. Source:
  .ai/skills/design/ccd-material-system/SKILL.md:82.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Motion Ceiling

This section owns motion ceiling for `product-ui-profile.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Prohibited Excess

This section owns prohibited excess for `product-ui-profile.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Do not turn every surface into glass. Do not use transparency when it weakens hierarchy,
contrast, focus, or operational clarity.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Token and Shared-Primitive Dependencies

This section owns token and shared-primitive dependencies for `product-ui-profile.md` under
the accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Profile Replacement Boundary

This section owns profile replacement boundary for `product-ui-profile.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.
