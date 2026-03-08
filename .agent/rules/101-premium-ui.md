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

- Canvas Base: The bottom-most layer of the page MUST use `bg-background` (or the `surface-base` shortcut).
- Elevated Surfaces (Cards): Main content areas MUST use the `surface-elevated` shortcut (which handles `bg-card` and `shadow-soft`). NEVER use borders for elevation.
- Tracks & Sunken Areas: Navigation tracks MUST use `surface-sunken` or `bg-muted/30`.
- Separation Strategy: Separate adjacent UI modules EXCLUSIVELY through "background color contrast" and "spatial gaps".

## 3. Sizing System (Design Tokens)

- You MUST strictly use the system-defined spacing and sizing scales: e.g., `p-padding-lg`, `px-padding-md`, `gap-scale-md`, `fs-sm` / `fs-md` (font size: `fs-{scale}` only; NEVER use `text-size-*`).
- Default Border-Radius: MUST use `rounded-scale-md` or the `default-rounded` shortcut for cards, buttons, and surfaces. FORBIDDEN: generic Tailwind radius classes like `rounded-md`, `rounded-lg`.
- Ensure ample breathing room inside and outside of cards.

## 4. Extreme Micro-Interactions (Polish)

- State Transitions: All clickable elements MUST use the project's transition tokens. Prefer the shortcut `behavior-hover-transition`. If writing explicitly, use `transition-all duration-scale-md ease-out`—NEVER raw `duration-300` or `duration-200`.
- Hover Feedback: NO harsh color jumps. You MUST use extremely subtle background tints, such as `hover:bg-foreground/5` or `hover:bg-background/50`. For list/table row hover, prefer the `surface-item` shortcut.
