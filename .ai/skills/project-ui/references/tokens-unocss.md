# Tokens and UnoCSS

This internal reference owns tokens and unocss for future project-ui governance. It is not
an independent Skill and carries no activation metadata.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Ownership Layers

This section owns ownership layers for `tokens-unocss.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Business code consumes platform token definitions, theme-engine behavior, size and density
resolution, breakpoint ownership, semantic color ownership, shared primitive implementation,
resolver algorithms, tests, and future registered exceptions through approved project
boundaries.

Accepted P2.3 semantic coverage for this heading: 50 covered.

Governance rules:

- glass-base = internal primitive — DO NOT use directly. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:42.
- border-transparent only when paired with border-solid or directional style. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:121.
- NOT in scope — always allowed:. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:148.
- If 6 tokens cannot express the stacking order: restructure DOM stacking context. Do NOT
  invent values. Source: .ai/rules/design-system/00-unocss-guardrails.mdc:167.
- DO NOT USE directly | glass-base ← internal primitive. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:202.
- must not glass- inside &lt;ProTable, virtual lists, or nested inside another glass-
  element (GPU performance). Source: .ai/rules/design-system/00-unocss-guardrails.mdc:204.
- [ ] No bg-white, bg-black, text-white, text-black. Source:
      .ai/rules/design-system/00-unocss-guardrails.mdc:225.
- [ ] glass-base not used directly — use glass-panel, glass-capsule, glass-shell,
      glass-card, or glass-icon-box. Source:
      .ai/rules/design-system/00-unocss-guardrails.mdc:230.
- p-padding- or m-margin- (Use native p- / m-). Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:241.
- col-stack- or layout-stack (Use flex flex-col gap-). Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:242.
- column-center (Use col-center or flex flex-col items-center justify-center). Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:244.
- Macro Containers (must for Structural Scaffolding). Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:254.
- PERMITTED ONLY WHEN VIEW TAKES OVER SCROLL: Use col-fill at root ONLY if the view
  intentionally owns viewport-height + internal scrolling. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:264.
- ROW FALLBACK: In horizontal row layouts, use flex-1 min-w-0 instead of col-fill. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:265.
- NEVER use raw hex codes, RGB values, or rem/em sizing in templates or styles. Source:
  .ai/rules/design-system/01-design-tokens.mdc:22.
- Theme Preset Source-Data Exception. Source:
  .ai/rules/design-system/01-design-tokens.mdc:32.
- Allowed files:. Source: .ai/rules/design-system/01-design-tokens.mdc:36.
- Rules for this exception:. Source: .ai/rules/design-system/01-design-tokens.mdc:41.
- THEMEPRESETS should use CompleteThemePreset[] and define both light and dark mode
  explicitly. Source: .ai/rules/design-system/01-design-tokens.mdc:43.
- Preset edits must not modify Theme Engine runtime modules unless the task explicitly asks
  for engine behavior changes. Source: .ai/rules/design-system/01-design-tokens.mdc:44.
- After changing preset data, run pnpm exec tsx scripts/upgrade-all-themes.mjs, pnpm exec
  vitest run src/constants/theme.spec.ts src/utils/theme, and ESLint for the touched theme
  files. Source: .ai/rules/design-system/01-design-tokens.mdc:46.
- Interactive fills and their readable foreground pairs such as primary.default,
  accent.default, success.default, danger.default, info.default, help.default,
  sidebar.primary, and sidebar.accent. Source:
  .ai/rules/design-system/01-design-tokens.mdc:55.
- decorative → non-blocking by default. Source:
  .ai/rules/design-system/01-design-tokens.mdc:60.
- These MAY emit advisories, but they must not block commits under the default validation
  mode. Source: .ai/rules/design-system/01-design-tokens.mdc:62.
- Do NOT weaken action or text thresholds to make soft palettes pass. Source:
  .ai/rules/design-system/01-design-tokens.mdc:66.
- Do NOT "fix" decorative -light variants by forcing them to satisfy text-grade WCAG
  thresholds unless the token is being repurposed as readable UI text. Source:
  .ai/rules/design-system/01-design-tokens.mdc:67.
- If an action token fails and a dark readable foreground solves it, prefer correcting
  .foreground / sidebar.Foreground before redesigning the base hue. Source:
  .ai/rules/design-system/01-design-tokens.mdc:68.
- DO: Use the established scale: p-sm, m-md, gap-lg, text-sm, rounded-md. Source:
  .ai/rules/design-system/01-design-tokens.mdc:78.
- Each family generates a DEFAULT token and a -foreground token:. Source:
  .ai/rules/design-system/01-design-tokens.mdc:145.
- (none) | primary | Default background / fill. Source:
  .ai/rules/design-system/01-design-tokens.mdc:162.
- -foreground | primary-foreground | Text/icon on top of default fill. Source:
  .ai/rules/design-system/01-design-tokens.mdc:163.
- Rule: Sidebar components must use sidebar- tokens, NOT primary or card tokens. This
  ensures sidebar and content area can be themed independently. Source:
  .ai/rules/design-system/01-design-tokens.mdc:203.
- Property | compact | comfortable (default) | loose. Source:
  .ai/rules/design-system/02-size-density-system.mdc:27.
- must not Using these raw pixel numbers in any business code. They are engine internals.
  Source: .ai/rules/design-system/02-size-density-system.mdc:39.
- Shell-level tokens (layout dimensions — admin layout ONLY). Source:
  .ai/rules/design-system/02-size-density-system.mdc:121.
- Required source of truth:. Source: .ai/rules/design-system/02-size-density-system.mdc:136.
- The icon center X position should remain visually stable across expanded and collapsed
  states; a sub-pixel browser rounding delta is acceptable. Source:
  .ai/rules/design-system/02-size-density-system.mdc:147.
- // must not hardcoding preset values. Source:
  .ai/rules/design-system/02-size-density-system.mdc:204.
- Project-facing severity naming uses warn/danger; do not invent aliases. Source:
  .ai/rules/design-system/05-semantic-color-usage-contract.mdc:33.
- src/utils/theme/presetPrimitive.ts may keep primitive key warning as compatibility bridge.
  Source: .ai/rules/design-system/05-semantic-color-usage-contract.mdc:41.
- Examples: primary.default, accent.default, success.default, danger.default, info.default,
  help.default, sidebar.primary, sidebar.accent. Source:
  .ai/rules/design-system/05-semantic-color-usage-contract.mdc:53.
- Contract: these pairs must remain readable at = 4.5. Source:
  .ai/rules/design-system/05-semantic-color-usage-contract.mdc:54;
  .ai/rules/design-system/05-semantic-color-usage-contract.mdc:57.
- Contract: these pairs must remain readable at = 3.0. Source:
  .ai/rules/design-system/05-semantic-color-usage-contract.mdc:60.
- Contract: these are non-blocking by default and may surface as warnings only. Source:
  .ai/rules/design-system/05-semantic-color-usage-contract.mdc:63.
- Do NOT use -light or -light-foreground as the primary readable text/fill pair for CTAs,
  primary buttons, or body content. Source:
  .ai/rules/design-system/05-semantic-color-usage-contract.mdc:67.
- When an action pair fails, prefer adjusting the foreground token first if that preserves
  the palette intent. Source:
  .ai/rules/design-system/05-semantic-color-usage-contract.mdc:69.
- If a design intentionally needs decorative validation to block, that must be an explicit
  validator configuration decision, not an ad hoc rule change. Source:
  .ai/rules/design-system/05-semantic-color-usage-contract.mdc:70.
- [ ] No warning/destructive aliases in business code or design docs. Source:
      .ai/rules/design-system/05-semantic-color-usage-contract.mdc:74.
- [ ] No decorative -light token is being treated as a text-grade action/content token.
      Source: .ai/rules/design-system/05-semantic-color-usage-contract.mdc:77.
- Menu items without route icons must use the shared menu fallback icon token. Do NOT
  display first-letter or first-character text fallback in the collapsed sidebar. Source:
  .ai/rules/integrations/03-layout-architecture.mdc:130.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Design Token Definitions

This section owns design token definitions for `tokens-unocss.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Theme Engine

This section owns theme engine for `tokens-unocss.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Size and Density System

This section owns size and density system for `tokens-unocss.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Breakpoint System

This section owns breakpoint system for `tokens-unocss.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 3 covered.

Governance rules:

- Layout dimensions — PC expanded layout dimensions scale by breakpoint via
  LAYOUTSCALERATIOS; Mobile/Tablet always use ratio = 1. Collapsed sidebar width is
  geometry-derived and must preserve icon anchor alignment instead of following arbitrary
  breakpoint scaling:. Source: .ai/rules/design-system/02-size-density-system.mdc:86.
- Device store owns raw device, viewport, breakpoint, orientation, pixel ratio, and resize
  lifecycle state. Source: .ai/rules/integrations/03-layout-architecture.mdc:96.
- Size engine owns CSS variable dimensions, typography scaling, breakpoint scaling,
  pixel-ratio-aware sizing, and density presets. Source:
  .ai/rules/integrations/03-layout-architecture.mdc:100.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Semantic Color System

This section owns semantic color system for `tokens-unocss.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 32 covered, 1 implementation-evidence.

Governance rules:

- CRITICAL — Unified anti-hallucination and design-engine UnoCSS law. Contains closed
  shortcut registry, N-1/N-2/N-5 anti-patterns, unit/size/color/z-index constraints, and
  pre-output self-check. Source: .ai/rules/design-system/00-unocss-guardrails.mdc:2.
- GUARDRAIL 4 — Colors: Semantic Tokens ONLY. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:89.
- Drawing a border requires three explicit parts: width/direction, style, and semantic
  color. Source: .ai/rules/design-system/00-unocss-guardrails.mdc:109.
- Rule: border, border-t, border-r, border-b, and border-l are forbidden unless the same
  class list contains the matching style utility (border-solid / border-t-solid /
  border-r-solid / border-b-solid / border-l-solid) and a semantic border color such as
  border-border, border-input, border-sidebar-border, or border-primary/30. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:124.
- GUARDRAIL 6 — Z-Index: 6 Semantic Tokens Only. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:157.
- style="z-index: 100" | use semantic token class. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:163.
- [ ] No Tailwind palette color (text-red-, bg-blue-, text-gray-). Source:
      .ai/rules/design-system/00-unocss-guardrails.mdc:224.
- [ ] No raw z-index class — only 6 semantic tokens. Source:
      .ai/rules/design-system/00-unocss-guardrails.mdc:228.
- The shortcuts in packages/unocss-preset/src/shortcuts/semanticShortcuts.ts are a closed,
  audited set. Nonexistent shortcuts must never be invented. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:274.
- 🎨 Color System Anti-Patterns (must not). Source:
  .ai/rules/design-system/01-design-tokens.mdc:24.
- class="text-red-500", class="bg-blue-200", class="text-gray-500", class="bg-slate-100" —
  ALL Tailwind built-in color palette classes are must not. These are static colors that do
  not respond to theme switching. Source: .ai/rules/design-system/01-design-tokens.mdc:27.
- class="text-white", class="text-black", class="bg-white", class="bg-black" — Tailwind
  color aliases, equally must not. Source: .ai/rules/design-system/01-design-tokens.mdc:28.
- dark:bg-gray-900, dark:text-white — must not. Semantic tokens auto-respond to dark mode.
  Source: .ai/rules/design-system/01-design-tokens.mdc:29.
- DO: Use semantic UnoCSS classes mapped to our theme: text-primary, bg-background,
  text-muted-foreground, border border-solid border-border, bg-muted, text-danger,
  bg-primary-light. Source: .ai/rules/design-system/01-design-tokens.mdc:30.
- Raw RRGGBB values are allowed only as canonical theme source data, not as UI
  implementation colors. Source: .ai/rules/design-system/01-design-tokens.mdc:34.
- Preset colors must remain valid full HEX values (RRGGBB, no alpha, no shorthand). Source:
  .ai/rules/design-system/01-design-tokens.mdc:42.
- Every preset and mode must include complete semantic families: primary, accent, success,
  warn, danger, info, help, base scalar tokens, neutral tokens, and independent sidebar
  tokens. Source: .ai/rules/design-system/01-design-tokens.mdc:45.
- If you need a color or spacing that does not exist in the semantic token list, STOP. Do
  not hardcode it. Query the existing design engine constants or request a token extension.
  Source: .ai/rules/design-system/01-design-tokens.mdc:83.
- Semantic border color classes are not complete drawing instructions by themselves. Any
  drawing border must include explicit style:. Source:
  .ai/rules/design-system/01-design-tokens.mdc:114.
- Token canonicality: .ai/rules/design-system/01-design-tokens.mdc is the rule-file SSOT for
  general design-token names, semantic color tiers, border composition, and source-authored
  sizing fallback. This file owns density presets, runtime size variables, layout
  dimensions, and size-engine details. Source:
  .ai/rules/design-system/02-size-density-system.mdc:9.
- - NEVER use absolute colors like bg-white, bg-black, text-white, text-black, border-white,
    or Hex codes (FFF) anywhere in .vue or .tsx templates. Source:
    .ai/rules/design-system/03-material-system.mdc:10.
- must not Raw opacity on non-semantic neutrals (bg-white/50) or ad-hoc backdrop-blur
  without a semantic surface token. Source:
  .ai/rules/design-system/03-material-system.mdc:18.
- Z-index tokens (Section 4) solve stacking order. This section governs perceived depth —
  how surfaces read as “above” the canvas in light vs dark mode. AI must not confuse “same
  semantic token name” with “same optical role” across themes. Source:
  .ai/rules/design-system/03-material-system.mdc:71.
- — inset glow + border, not dark-mode shadow-sm as the sole hierarchy cue. Prefer
  centralizing such patterns in semanticShortcuts.ts / theme presets when reused, so
  templates stay token-driven. Source: .ai/rules/design-system/03-material-system.mdc:90.
- Rule-file canonicality: .ai/rules/design-system/01-design-tokens.mdc is the human-readable
  SSOT for token family names, semantic tiers, border composition, and source-authored
  sizing fallback. This file owns semantic color naming and severity mapping details.
  Source: .ai/rules/design-system/05-semantic-color-usage-contract.mdc:10.
- Allowed semantic color forms:. Source:
  .ai/rules/design-system/05-semantic-color-usage-contract.mdc:24.
- Project semantic warning family must be warn, never warning. Source:
  .ai/rules/design-system/05-semantic-color-usage-contract.mdc:31.
- Project semantic destructive family must be danger, never destructive. Source:
  .ai/rules/design-system/05-semantic-color-usage-contract.mdc:32.
- That bridge must map to project semantic family:. Source:
  .ai/rules/design-system/05-semantic-color-usage-contract.mdc:42.
- [ ] All semantic color classes use canonical family names from this contract. Source:
      .ai/rules/design-system/05-semantic-color-usage-contract.mdc:73.
- [ ] warn and danger are used consistently for project-facing semantics. Source:
      .ai/rules/design-system/05-semantic-color-usage-contract.mdc:75.
- Visible border requires width, style, and semantic color according to CCD rules. Source:
  .ai/skills/design/ccd-material-system/SKILL.md:134.

Implementation evidences:

- Use as implementation evidence only, not as independent governance: REQUIRED — full
  decoupling: If you need both an edge read and a complex shadow stack, do not use ring. Use
  an explicit border (e.g. border border-solid border-border / border border-solid
  border-foreground/20 per theme) plus shadow-[...] alone, or encode the full pattern in
  semanticShortcuts.ts / theme presets. Source:
  .ai/rules/design-system/03-material-system.mdc:100.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Typography, Radius, Elevation, and Z-Index

This section owns typography, radius, elevation, and z-index for `tokens-unocss.md` under
the accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 9 covered, 1 implementation-evidence.

Governance rules:

- Intent: Normal UI elements regularly have 5–7 utility classes (padding + bg + radius +
  shadow + border + flex = natural). This rule triggers only when shortcut opportunities are
  clearly being ignored. Prefer layout macros (col-fill, center, layout-container) for
  structural concerns, then layer visual classes freely. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:184.
- must not — ALL raw z-index utilities (Tailwind scale AND arbitrary):. Source:
  .ai/rules/design-system/03-material-system.mdc:51.
- Token | z-index value | Use for. Source:
  .ai/rules/design-system/03-material-system.mdc:58.
- If the required stacking order cannot be expressed with these 6 tokens, the solution is to
  restructure the DOM stacking context — NEVER to invent new z-index values. Source:
  .ai/rules/design-system/03-material-system.mdc:67.
- UnoCSS Compiler Law — NEVER mix ring- with arbitrary shadow-[...] on the same element.
  Source: .ai/rules/design-system/03-material-system.mdc:96.
- must not Any single element that combines Tailwind/Uno ring- utilities and arbitrary-value
  shadows shadow-[...] (bracket syntax). Source:
  .ai/rules/design-system/03-material-system.mdc:98.
- Why: Arbitrary shadow-[...] emits a full box-shadow replacement. It silently overwrites
  the entire property, destroying the ring implementation (the ring’s shadow layers never
  paint — complete ring failure). Source: .ai/rules/design-system/03-material-system.mdc:99.
- REQUIRED — transparent placeholder layers: Pre-fill dummy layers with fully transparent
  shadows so counts match. Illustrative patterns (values must remain token-driven in real
  code):. Source: .ai/rules/design-system/03-material-system.mdc:106.
- small shadow only where depth matters;. Source:
  .ai/skills/design/ccd-material-system/SKILL.md:69.

Implementation evidences:

- Use as implementation evidence only, not as independent governance: Canvas vs card
  separation (mandatory): The page canvas must read as a slightly gray field; elevated
  surfaces must read as brighter / near-white with downward, dark-tinted shadow (e.g.
  shadow-sm). must not canvas and primary card surfaces collapsing to the same luminance —
  the eye loses depth cues. Source: .ai/rules/design-system/03-material-system.mdc:75.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Motion Tokens

This section owns motion tokens for `tokens-unocss.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Registered CSS Variables

This section owns registered css variables for `tokens-unocss.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 3 covered.

Governance rules:

- CSS variable form w-[var(--spacing-lg)] — ALLOWED (value must start with var(--)). Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:146.
- The Size System provides three global UI density presets. ALL layout dimensions, font
  sizes, spacing, and border radii must be derived from these presets via CSS variables.
  Hardcoded pixel values for layout dimensions are must not. Source:
  .ai/rules/design-system/02-size-density-system.mdc:13.
- // must CSS variable via Uno class. Source:
  .ai/rules/design-system/02-size-density-system.mdc:208.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## UnoCSS Semantic Shortcuts

This section owns unocss semantic shortcuts for `tokens-unocss.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 24 covered, 1 implementation-evidence.

Governance rules:

- Binary must not/REQUIRED rules with zero exceptions unless explicitly stated. This file is
  the merged SSOT for UnoCSS generation safety and anti-hallucination constraints. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:9.
- must not invented shortcuts (non-exhaustive):. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:44.
- NEVER write a shortcut AND the atomic classes it expands into on the same element. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:51.
- Self-check: Does any shortcut in your class list expand into other classes also on the
  same element? Remove the expansion. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:67.
- px, %, vw, vh are allowed when token classes cannot express the intent. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:144.
- Prefer Design Engine tokens and layout classes first (w-sidebarWidth, h-headerHeight,
  layout-, p-, gap-). Source: .ai/rules/design-system/00-unocss-guardrails.mdc:145.
- &lt;!-- WARNING: 8+ classes — check if a shortcut covers the layout portion --. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:176.
- &lt;!-- BETTER: use shortcut for the structural part --. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:180.
- Surface | Required shortcut. Source: .ai/rules/design-system/00-unocss-guardrails.mdc:190.
- [ ] Every shortcut appears in the Closed Shortcut Registry (Guardrail 1). Source:
      .ai/rules/design-system/00-unocss-guardrails.mdc:221.
- [ ] No shortcut appears alongside its own expansion (N-1, Guardrail 2). Source:
      .ai/rules/design-system/00-unocss-guardrails.mdc:222.
- [ ] No flex prefix before a flex shortcut (N-2, Guardrail 3). Source:
      .ai/rules/design-system/00-unocss-guardrails.mdc:223.
- [ ] No source-authored rem / em in sizing classes, style blocks, or arbitrary values.
      Source: .ai/rules/design-system/00-unocss-guardrails.mdc:226.
- [ ] No element has 7 raw utility classes for a structural pattern (Rule of 7). Source:
      .ai/rules/design-system/00-unocss-guardrails.mdc:229.
- must not to use dead legacy shortcuts. DO NOT use:. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:240.
- must not to use removed custom DSL classes:. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:247.
- must use native UnoCSS composition instead:. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:250.
- 00-unocss-guardrails.mdc owns UnoCSS shortcut and anti-hallucination enforcement. Source:
  .ai/rules/design-system/01-design-tokens.mdc:12.
- class="w-4", class="p-10", class="mt-2" — Unitless numeric shorthands (defaulting to rem)
  are ABSOLUTELY must not. Source: .ai/rules/design-system/01-design-tokens.mdc:72.
- class="w-[raw root-font unit value]", class="h-[raw font-relative unit value]" — rem/em
  units are ABSOLUTELY must not. Source: .ai/rules/design-system/01-design-tokens.mdc:73.
- Explicit units when token classes cannot express intent, with strict order: vw/vh % px.
  Source: .ai/rules/design-system/01-design-tokens.mdc:77.
- ABSOLUTE RULE: rem/em are forbidden for sizing and spacing. If a size cannot be expressed
  by token scale, use explicit units with priority vw/vh % px, or request token extension
  from the design engine (packages/unocss-preset/src/theme/index.ts). Source:
  .ai/rules/design-system/01-design-tokens.mdc:80.
- border alone is forbidden in this architecture even though UnoCSS can generate CSS for it.
  Source: .ai/rules/design-system/01-design-tokens.mdc:121.
- The overflow-auto classes in the examples below are illustrative ONLY. Per L2 Architecture
  Laws, production business views must replace scroll containers with &lt;CScrollbar
  class="col-fill". Source: .ai/rules/design-system/04-design-state-contract.mdc:65.

Implementation evidences:

- Use as implementation evidence only, not as independent governance: must prioritize
  theme-native UnoCSS utilities. Example: p-md, gap-sm, text-lg, rounded-xl. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:239.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Allowed Structural Values

This section owns allowed structural values for `tokens-unocss.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 28 covered.

Governance rules:

- GUARDRAIL 5 — Sizes: Token Scale ONLY. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:128.
- Rule scope — applies ONLY to sizing/spacing utilities (w-, h-, p-, m-, gap-, top-, left-,
  right-, bottom-):. Source: .ai/rules/design-system/00-unocss-guardrails.mdc:130.
- SOURCE-AUTHORING BAN: rem / em are forbidden for source-authored sizing and spacing
  utilities, style blocks, and arbitrary values. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:141.
- Build tooling may transform authored px to another runtime unit only when the source still
  follows this rule and generated CSS is not used as an authoring pattern. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:142.
- UNIT PRIORITY LADDER (NON-NEGOTIABLE): vw/vh % px. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:143.
- RULE: If a size does not exist in the token scale, first try vw/vh, then %, then px. Never
  use rem/em fallbacks. Source: .ai/rules/design-system/00-unocss-guardrails.mdc:153.
- [ ] Unit priority respected for raw sizing: vw/vh % px. Source:
      .ai/rules/design-system/00-unocss-guardrails.mdc:227.
- 02-size-density-system.mdc owns density runtime and size-engine details. Source:
  .ai/rules/design-system/01-design-tokens.mdc:13.
- ? Size & Spacing System Anti-Patterns (must not). Source:
  .ai/rules/design-system/01-design-tokens.mdc:71.
- sidebarCollapsedWidth is intentionally not a preset literal. It must be derived by
  deriveSidebarCollapsedWidth() from the actual sidebar menu geometry:. Source:
  .ai/rules/design-system/02-size-density-system.mdc:41.
- Do NOT hardcode values such as raw pixel-unit value, raw pixel-unit value, raw pixel-unit
  value, raw pixel-unit value, raw pixel-unit value, or raw pixel-unit value as collapsed
  sidebar width. The goal is geometric continuity, not minimum width. Source:
  .ai/rules/design-system/02-size-density-system.mdc:49.
- Generated by generateSizeVars(preset), written by applySizeTheme(). Computed once per
  preset change. Examples below use the comfortable preset:. Source:
  .ai/rules/design-system/02-size-density-system.mdc:57.
- src/constants/layout-menu.ts owns menu icon size tokens, including MENUSIDEBARICONSIZE.
  Source: .ai/rules/design-system/02-size-density-system.mdc:138.
- src/constants/size.ts owns deriveSidebarCollapsedWidth(). Source:
  .ai/rules/design-system/02-size-density-system.mdc:139.
- Changing MENUSIDEBARICONSIZE requires updating or verifying deriveSidebarCollapsedWidth()
  and the sidebar menu CSS icon box variable. Source:
  .ai/rules/design-system/02-size-density-system.mdc:145.
- Expanded and collapsed admin sidebar states must keep the same icon font size and icon box
  width. Source: .ai/rules/design-system/02-size-density-system.mdc:146.
- Do NOT animate sidebar icon size, icon box width, item padding, or gap during
  collapse/expand. Animate width at the shell and opacity/transform for labels/arrows.
  Source: .ai/rules/design-system/02-size-density-system.mdc:148.
- Do NOT import SIZEPRESETS into layout components to calculate collapsed width. Layout
  components must consume w-sidebarCollapsedWidth / --sidebar-collapsed-width. Source:
  .ai/rules/design-system/02-size-density-system.mdc:149.
- sizeStore.setSize('comfortable') // default — fontSizeBase 16, sidebarWidth 280. Source:
  .ai/rules/design-system/02-size-density-system.mdc:180.
- must not in design-system documentation, theme debug panels, or token showcase UIs:
  rendering 5%–90% alpha ramps for structural surfaces (background, muted, and similar
  neutrals) on same-hue backgrounds. Source:
  .ai/rules/design-system/03-material-system.mdc:119.
- CRITICAL DISTINCTION: density is a page-level design decision about information density.
  It is NOT the user's global SizeMode (compact/comfortable/loose). These are two
  independent systems. NEVER map density values to useSizeStore().setSize(). Source:
  .ai/rules/design-system/04-design-state-contract.mdc:105.
- Spacing: prefer p-sm, gap-sm for toolbar; ProTable fills remaining height. Source:
  .ai/rules/design-system/04-design-state-contract.mdc:177.
- // must not mapping density to SizeMode — they are DIFFERENT systems. Source:
  .ai/rules/design-system/04-design-state-contract.mdc:192.
- useSizeStore().setSize('loose') // NEVER — density ≠ SizeMode. Source:
  .ai/rules/design-system/04-design-state-contract.mdc:194.
- The collapsed width must be derived from menu geometry and icon size tokens. Do NOT
  hardcode arbitrary collapsed widths in layout renderers. Source:
  .ai/rules/integrations/03-layout-architecture.mdc:123.
- Changing sidebar icon size requires validating --sidebar-collapsed-width, root item width,
  icon box width, and expanded/collapsed icon center alignment. Source:
  .ai/rules/integrations/03-layout-architecture.mdc:124.
- Pass explicit density or mode props to child components when presentation needs variants.
  Source: .ai/rules/integrations/03-layout-architecture.mdc:147.
- Assertions must cover sidebar geometry, content offsets, safe-area padding, header height,
  drawer visibility, overlay correctness, clipped regions, and phantom sidebar spacing.
  Source: .ai/rules/integrations/03-layout-architecture.mdc:167.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Prohibited Business-Code Constants

This section owns prohibited business-code constants for `tokens-unocss.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## PrimeVue Theme and PassThrough Boundaries

This section owns primevue theme and passthrough boundaries for `tokens-unocss.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Shared Primitive and Resolver Boundaries

This section owns shared primitive and resolver boundaries for `tokens-unocss.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Tests and Implementation Evidence

This section owns tests and implementation evidence for `tokens-unocss.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Future Registered Exceptions

This section owns future registered exceptions for `tokens-unocss.md` under the accepted
P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Existing Foundation Paths

This section owns existing foundation paths for `tokens-unocss.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.
