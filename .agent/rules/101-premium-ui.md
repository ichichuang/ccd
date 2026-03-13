---
description: Enforce Premium Borderless UI design specifications, project-specific design tokens, and UnoCSS shortcuts.
globs: **/*.{vue,tsx,ts}
alwaysApply: true
---

# Premium Borderless UI Enforcement

You are generating code for a world-class, enterprise-grade admin application. You MUST strictly adhere to the following visual specifications and ONLY use the project's custom design tokens. Do NOT generate generic Tailwind classes.

## 1. Strictly Prohibited Styles (The Blacklist)

- NO solid borders for layout separation: Never use `border`, `border-t`, `border-border` (except for specific form input fields).
- NO default focus outlines: Never use `outline`, `focus:outline-none`, `ring`. Use the `interactive-focus-ring` shortcut for keyboard focus on buttons and inputs.
- NO hardcoded colors or arbitrary pixels: Never use `bg-[#fff]`, `w-[24px]`.

## 2. Surface & Color Blocking (Hierarchy)

- **Canvas (LayoutAdmin) & Transparent Root Policy:** The main canvas is provided by LayoutAdmin (`bg-card` with `rounded-tl-2xl`). All route views under `meta.parent === 'admin'` MUST have a transparent root—NO `bg-card`, `bg-background`, `bg-surface-ground`, `bg-surface-elevated`, or `surface-*` on the top-level wrapper. Use `h-full flex flex-col overflow-hidden` (or equivalent) **without** `bg-*` or `surface-*`. Internal cards/panels use `surface-elevated`, `glass-surface`, or `shadow-soft` only on nested content.
- Canvas Base: The bottom-most layer of the page MUST use `bg-background` (or the `surface-base` shortcut).
- Elevated Surfaces (Cards): Main content areas MUST use the `surface-elevated` shortcut (which handles `bg-card` and `shadow-soft`). NEVER use borders for elevation.
- Tracks & Sunken Areas: Navigation tracks MUST use `surface-sunken` or `bg-muted/30`.
- Separation Strategy: Separate adjacent UI modules EXCLUSIVELY through "background color contrast" and "spatial gaps".

## 3. Sizing System (Design Tokens)

- **FORBIDDEN:** Raw `rem`, `em`, or `px` in business code. Use semantic tokens exclusively: `p-padding-*`, `m-margin-*`, `gap-*`, `fs-xs`…`fs-5xl`, `var(--spacing-*)`, layout variables (`w-sidebarWidth`, `h-headerHeight`).
- **Macro-layout:** MUST use `layout-content-narrow`, `layout-content`, or `layout-content-wide` (vw-based). FORBIDDEN: `max-w-7xl`, `max-w-5xl`, `max-w-2xl` (rem-based).
- Default Border-Radius: MUST use `rounded-scale-md` or the `def-rounded` shortcut for cards, buttons, and surfaces. FORBIDDEN: generic Tailwind radius classes like `rounded-md`, `rounded-lg`.
- Ensure ample breathing room inside and outside of cards.

## 3a. Theme-Tinted Shadow Policy (Phase 12)

- **FORBIDDEN:** `rgba(0,0,0,x)` for box-shadows. Shadows MUST tint with the active theme: Light mode `rgb(var(--foreground) / <alpha>)`, Dark mode `rgb(var(--background) / <alpha>)`. PREFER shortcuts `shadow-soft`, `shadow-float`, `interactive-hover-card`, `interactive-hover-tile`.

## 4. Extreme Micro-Interactions (Polish)

- State Transitions: All clickable elements MUST use the project's transition tokens. Prefer the shortcut `behavior-hover-transition`. If writing explicitly, use `transition-all duration-scale-md ease-out`—NEVER raw `duration-300` or `duration-200`.
- Hover Feedback: **FORBIDDEN** `hover:ring-*`, `hover:border-*`. ALLOWED only: `hover:-translate-y-1`, shadow diffusion (theme-tinted), or `hover:bg-foreground/5`. Use `interactive-hover-card` or `interactive-hover-tile` shortcuts.

## 5. Semantic Shortcuts Mandate — Dialog, Sidepanel & Glass Surface

### 5a. Dialog & Sidepanel Layout (Proposal B)

- **Modal/Dialog content wrapper:** MUST use `layout-dialog`, `layout-dialog-sm`, or `layout-dialog-lg` for width. FORBIDDEN: `max-w-md`, `max-w-lg`, `w-[400px]`, `style="width: 30vw"`, or any rem-based max-width.
- **Side panel / Drawer width:** MUST use `layout-sidepanel`. FORBIDDEN: `w-64`, `w-[240px]`, or fixed pixel widths.
- **Scrollable panel max-height:** When a max-height cap is needed, use `layout-scroll-panel`. FORBIDDEN: raw `max-h-[50vh]` when the shortcut exists.
- When generating Dialog content, Drawer panels, or custom modals, the inner content wrapper MUST use `layout-dialog`, `layout-dialog-sm`, or `layout-dialog-lg` for width.

### 5b. Glass Surface (Proposal D)

- **Sticky header / navbar with blur:** MUST use `glass-surface` or `glass-surface-lg`. FORBIDDEN: ad-hoc `backdrop-blur-md bg-white/70` combinations.
- **Overlay panels, floating toolbars:** MUST use `glass-surface` or `glass-surface-lg`. FORBIDDEN: raw `backdrop-blur-*` + `bg-*` combinations.
- **Dashboard cards / A3-stats-grid:** Use `glass-surface` or `surface-elevated` per archetype. For frosted-glass effect, MUST use `glass-surface`.

## Phase 13.0 — AI Programming Golden Rules

This section is the **supreme mandate** for page structure, layout, interaction, and typography. Structure belongs to Archetype; details belong to Semantic Shortcuts; magic numbers are FORBIDDEN.

1. **Structural Integrity:** EVERY page root MUST declare `data-archetype` (value from `docs/ai-specs/ARCHETYPE_SPEC.md` and, when present, same-directory `page.state.ts`). Choose the scroll model based on ARCHETYPE_SPEC and page.state.ts. The root wrapper MUST follow the Transparent Root Policy (§2)—structure only, no background on the root.
2. **Absolute Semantic Sizing:** FORBIDDEN: `rem`, `em`, or `px` in business code (including atomic classes like `p-4`). MUST: macro fluid units (`layout-content-narrow` / `layout-content` / `layout-content-wide`, `vh` for charts or large blocks, `min-h-kpi-card` / `layout-scroll-panel` where defined) and semantic shortcuts (`gap-*`, `p-padding-*`, `row-between`, `center`, `layout-stack`, etc.) for micro-layouts. Do NOT hand-write long flex atomic combinations.
3. **Physical Interaction:** Card-level hover MUST use `interactive-hover-card` (or `interactive-hover-tile`). List/row-level hover MUST use `surface-item` with `behavior-hover-transition` and `hover:bg-foreground/5`. Shadows MUST be theme-tinted (Phase 12); see `.cursor/rules/104-anti-flicker-ring-less.mdc`—do not duplicate that rule set here.
4. **Typography Hierarchy:** Secondary or auxiliary text MUST use `text-muted` or `text-secondary` (or `text-muted-foreground` / `text-secondary-foreground`). List or card descriptions MUST use `text-single-line-ellipsis` to prevent long content from breaking layout.
